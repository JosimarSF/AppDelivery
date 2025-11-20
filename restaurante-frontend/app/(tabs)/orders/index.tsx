import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../../context/OrderContext';

const COLORS = {
  primary: '#FA7F08',
  background: '#F4F4F4',
  card: '#FFFFFF',
  text: '#1E1E1E',
  textSecondary: '#757575',
  gray: '#E0E0E0',
  white: '#FFFFFF',
};

export default function OrdersScreen() {
  const { orders, fetchOrders, loadingOrders } = useOrders();

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'recibido':
        return '#FFA500';
      case 'en proceso':
        return '#007bff';
      case 'listo':
      case 'entregado':
        return 'green';
      case 'cancelado':
        return 'red';
      default:
        return COLORS.textSecondary;
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const fechaUTC = new Date(item.created_at);
    const fechaLima = new Date(fechaUTC.getTime() - 5 * 60 * 60 * 1000).toLocaleString('es-PE', {
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const parsedItems =
      typeof item.items === 'string'
        ? JSON.parse(item.items)
        : item.items || [];

    const envio = 3;
    const totalConEnvio = item.total_price + envio;

    return (
      <TouchableOpacity activeOpacity={0.9} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle}>Pedido #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
            <Ionicons
              name="ellipse"
              size={10}
              color={getStatusColor(item.status)}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <Text style={styles.orderDetail}>
            Subtotal: <Text style={styles.bold}>S/ {item.total_price.toFixed(2)}</Text>
          </Text>
          <Text style={styles.orderDetail}>
            Envío: <Text style={styles.bold}>S/ {envio.toFixed(2)}</Text>
          </Text>
          <Text style={styles.orderDetail}>
            Total: <Text style={styles.bold}>S/ {totalConEnvio.toFixed(2)}</Text>
          </Text>

          {item.pabellon && <Text style={styles.orderDetail}>Pabellón: {item.pabellon}</Text>}
          {item.mensaje && <Text style={styles.orderDetail}>Adicional: {item.mensaje}</Text>}

          {parsedItems.length > 0 && (
            <View style={styles.itemsContainer}>
              {parsedItems.map((p: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>{p.name} x{p.quantity}</Text>
                  <Text style={styles.itemPrice}>S/ {(p.price * p.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.orderDate}>{fechaLima}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pedidos</Text>
        <Ionicons name="cafe-outline" size={30} color={COLORS.primary} />
      </View>

      {loadingOrders ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={70} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Aún no tienes pedidos realizados</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          refreshControl={
            <RefreshControl
              refreshing={loadingOrders}
              onRefresh={fetchOrders}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 25 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, marginTop: 10, fontSize: 16 },

  orderCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  orderDetail: { marginTop: 6, color: COLORS.textSecondary, fontSize: 14 },
  bold: { fontWeight: 'bold', color: COLORS.text },
  orderFooter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  orderDate: { marginLeft: 4, color: '#999', fontSize: 12 },
  orderStatus: { fontWeight: 'bold', textTransform: 'capitalize', fontSize: 12 },
  itemsContainer: { marginTop: 10, backgroundColor: '#fafafa', borderRadius: 8, padding: 8 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemName: { fontSize: 13, color: COLORS.textSecondary },
  itemPrice: { fontSize: 13, color: COLORS.textSecondary },
});
