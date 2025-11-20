import sqlite3
import os


db_path = r"C:\Users\USUARIO\Desktop\Proyecto\restaurante-backend\restaurant.db"


if not os.path.exists(db_path):
    print(f" No se encontró la base de datos en: {db_path}")
    print("Verifica la ruta o mueve el archivo restaurant.db a esa carpeta.")
else:

    new_image_url = "https://perudelights.com/wp-content/uploads/2012/02/2-Friedyuccasticks.R.jpg3_.jpg"

    try:

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE menu_item
            SET image_url = ?
            WHERE name = 'Yuquitas Crocantes';
        """, (new_image_url,))

        conn.commit()

        if cursor.rowcount > 0:
            print(" Imagen actualizada correctamente.")
        else:
            print(" No se encontró el plato 'Arroz con Pollo'.")
    except sqlite3.Error as e:
        print(" Error con SQLite:", e)

    finally:

        if 'conn' in locals():
            conn.close()
