import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';

const COLORS = {
  primary: '#FA7F08',
  background: '#F4F4F4',
  card: '#FFFFFF',
  text: '#1E1E1E',
  textSecondary: '#757575',
  gray: '#E0E0E0',
  success: '#4CAF50',
  danger: '#D32F2F',
};

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { createOrder } = useOrders && useOrders();

  const [pabellon, setPabellon] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'confirm' | 'missing' | 'success' | null>(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const envio = 3;
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const total = subtotal + envio;

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [modalVisible]);

  const handleConfirmarPedido = () => {
    if (!pabellon) {
      setModalType('missing');
      setModalVisible(true);
      return;
    }
    setModalType('confirm');
    setModalVisible(true);
  };

  const handleAceptarModal = async () => {
    if (modalType === 'missing') {
      setModalVisible(false);
      return;
    }

    if (modalType === 'confirm') {
      setLoading(true);
      try {
        if (createOrder) await createOrder(cart, pabellon, mensaje);
        clearCart();
        setPabellon('');
        setMensaje('');
        setModalType('success');
        // Auto cierre en 1.5 segundos
        setTimeout(() => {
          setModalVisible(false);
          setModalType(null);
        }, 1500);
      } catch {
        // Error silencioso
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVaciar = () => clearCart();

  const renderItem = ({ item }: any) => (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>S/ {item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.qtyControls}>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
          style={styles.qtyBtn}
        >
          <Ionicons name="remove-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.qtyText}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
          style={styles.qtyBtn}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ marginLeft: 10 }}>
        <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  const pabellones = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Tu carrito</Text>

      {cart.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cart-outline" size={70} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <View style={styles.form}>
            <Text style={styles.label}>Pabellón</Text>
            <View style={styles.pabellonGrid}>
              {pabellones.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.pabellonBtn,
                    pabellon === p && { backgroundColor: COLORS.primary },
                  ]}
                  onPress={() => setPabellon(p)}
                >
                  <Text
                    style={[
                      styles.pabellonText,
                      pabellon === p && { color: '#fff' },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>
              Mensaje adicional (salón / indicaciones)
            </Text>
            <TextInput
              value={mensaje}
              onChangeText={setMensaje}
              placeholder="Aula 203, Pasillo del piso 2 ..."
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                Subtotal: S/ {subtotal.toFixed(2)}
              </Text>
              <Text style={styles.summaryText}>Envío: S/ {envio.toFixed(2)}</Text>
              <Text style={styles.total}>Total: S/ {total.toFixed(2)}</Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={handleVaciar}>
                <Text style={styles.clearText}>Vaciar carrito</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
                onPress={handleConfirmarPedido}
                disabled={loading}
              >
                <Text style={styles.confirmText}>
                  {loading ? 'Procesando...' : 'Confirmar pedido'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="none">
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
            {modalType === 'missing' && (
              <>
                <Ionicons name="alert-circle-outline" size={48} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Selecciona un pabellón</Text>
                <Text style={styles.modalBody}>
                  Debes elegir un pabellón (A - G) antes de confirmar.
                </Text>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Entendido</Text>
                </TouchableOpacity>
              </>
            )}

            {modalType === 'confirm' && (
              <>
                <Ionicons name="help-circle-outline" size={48} color={COLORS.primary} />
                <Text style={styles.modalTitle}>¿Confirmar pedido?</Text>
                <Text style={styles.modalBody}>
                  Pabellón: {pabellon} {"\n"}Total: S/ {total.toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                  onPress={handleAceptarModal}
                >
                  <Text style={styles.modalBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </>
            )}

            {modalType === 'success' && (
              <>
                <Animated.View
                  style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}
                >
                  <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.success} />
                </Animated.View>
                <Text style={styles.modalTitle}>Pedido confirmado</Text>
                <Text style={styles.modalBody}>
                  Tu pedido ha sido enviado correctamente.
                </Text>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, marginTop: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  itemPrice: { color: COLORS.textSecondary, marginTop: 4 },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { paddingHorizontal: 6 },
  qtyText: { marginHorizontal: 8, fontSize: 16, color: COLORS.text },
  form: { marginTop: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    color: COLORS.text,
  },
  pabellonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  pabellonBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  pabellonText: { fontWeight: '700', color: COLORS.primary, fontSize: 16 },
  summary: { marginTop: 12 },
  summaryText: { fontSize: 16, color: COLORS.textSecondary },
  total: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 6 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  clearBtn: {
    flex: 0.48,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  clearText: { color: COLORS.text, fontWeight: '600' },
  confirmBtn: {
    flex: 0.48,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 10 },
  modalBody: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 8 },
  modalBtn: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 10,
  },
  modalBtnText: { color: '#fff', fontWeight: '700' },
});
