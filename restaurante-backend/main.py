import os
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, JWTManager
)

# CONFIGURACIÓN GENERAL
app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "restaurant.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "una-clave-secreta-fuerte"

db = SQLAlchemy(app)
jwt = JWTManager(app)

# MODELOS
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    orders = db.relationship("Order", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255))
    category = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "image_url": self.image_url,
            "category": self.category,
        }


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_item.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    menu_item = db.relationship("MenuItem", lazy=True)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default="Recibido")
    pabellon = db.Column(db.String(100))
    mensaje = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    items = db.relationship("OrderItem", backref="order", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_name": self.user.name if self.user else "Usuario desconocido",
            "total_price": self.total_price,
            "created_at": self.created_at.isoformat(),
            "status": self.status,
            "pabellon": self.pabellon,
            "mensaje": self.mensaje,
            "item_count": len(self.items),
        }

    def to_detailed_dict(self):
        return {
            "id": self.id,
            "user_name": self.user.name if self.user else "Usuario desconocido",
            "total_price": self.total_price,
            "created_at": self.created_at.isoformat(),
            "status": self.status,
            "pabellon": self.pabellon,
            "mensaje": self.mensaje,
            "items": [
                {
                    "id": item.menu_item.id,
                    "name": item.menu_item.name,
                    "price": item.price,
                    "quantity": item.quantity,
                    "image": item.menu_item.image_url,
                    "category": item.menu_item.category,
                }
                for item in self.items
            ],
        }


# RUTAS AUTH
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password") or not data.get("name"):
        return jsonify({"error": "Faltan datos"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "El correo ya está registrado"}), 409

    new_user = User(email=data["email"], name=data["name"])
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Usuario creado exitosamente"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Faltan datos"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if user and user.check_password(data["password"]):
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=30))
        return jsonify({
            "access_token": access_token,
            "user": {"id": user.id, "name": user.name, "email": user.email},
        })

    return jsonify({"error": "Credenciales inválidas"}), 401


# RUTA MENÚ
@app.route("/api/menu", methods=["GET"])
def get_menu():
    menu_items = MenuItem.query.all()
    if not menu_items:
        return jsonify({"error": "No hay ítems en el menú"}), 404

    categories = {}
    for item in menu_items:
        categories.setdefault(item.category, []).append(item.to_dict())
    categorized_menu = [{"title": cat, "data": items} for cat, items in categories.items()]
    return jsonify(categorized_menu)


# RUTAS PEDIDOS
@app.route("/api/orders", methods=["GET"])
@jwt_required()
def get_orders_history():
    user_id = int(get_jwt_identity())
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([order.to_detailed_dict() for order in orders])


@app.route("/api/orders", methods=["POST"])
@jwt_required()
def create_order():
    data = request.get_json()
    items = data.get("items", [])
    pabellon = data.get("pabellon")
    mensaje = data.get("mensaje")

    if not items:
        return jsonify({"error": "No hay productos"}), 400

    total = sum(item["price"] * item["quantity"] for item in items)
    new_order = Order(
        user_id=int(get_jwt_identity()),
        pabellon=pabellon,
        mensaje=mensaje,
        total_price=total,
    )
    db.session.add(new_order)
    db.session.flush()

    for item in items:
        db.session.add(
            OrderItem(
                order_id=new_order.id,
                menu_item_id=item["id"],
                quantity=item["quantity"],
                price=item["price"],
            )
        )

    db.session.commit()
    return jsonify({"message": "Pedido creado correctamente"}), 201

@app.route("/api/user/update", methods=["PUT"])
@jwt_required()
def update_user():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    current_password = data.get("current_password")
    new_name = data.get("name")
    new_email = data.get("email")
    new_password = data.get("new_password")

    if not current_password or not user.check_password(current_password):
        return jsonify({"error": "Contraseña actual incorrecta"}), 401

    if new_name:
        user.name = new_name
    if new_email:
        user.email = new_email
    if new_password:
        user.set_password(new_password)

    db.session.commit()

    return jsonify({
        "message": "Perfil actualizado correctamente",
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }), 200



# INICIALIZACIÓN
with app.app_context():
    db.create_all()

    if not MenuItem.query.first():
        print("Poblando base de datos con datos de ejemplo...")
        sample_items = [
            MenuItem(name="Arroz con Pollo", description="Clásico plato universitario con arroz verde y presa de pollo.", price=18.00, image_url="https://i.imgur.com/E5oZtYf.jpeg", category="Comidas"),
            MenuItem(name="Tallarines Rojos con Bistec", description="Tallarines en salsa roja con bistec apanado.", price=20.00, image_url="https://i.imgur.com/nOfgN4I.jpeg", category="Comidas"),
            MenuItem(name="Aji de Gallina", description="Guiso de gallina deshilachada con salsa de ají amarillo.", price=19.00, image_url="https://i.imgur.com/jE0kGcD.jpeg", category="Comidas"),
            MenuItem(name="Chicha Morada", description="Refresco de maíz morado.", price=6.00, image_url="https://i.imgur.com/lDAE0s4.jpeg", category="Bebidas"),
            MenuItem(name="Galletas de Quinua", description="Hechas con quinua andina y miel.", price=3.50, image_url="https://i.imgur.com/YwH3uJY.jpeg", category="Dulces"),
        ]
        db.session.bulk_save_objects(sample_items)
        db.session.commit()

# EJECUCIÓN LOCAL
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
