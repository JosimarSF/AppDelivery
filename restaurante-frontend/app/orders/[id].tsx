import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface OrderItemDetail {
  id: number;
  quantity: number;
  price: number;
  menu_item_name: string;
  menu_item_image: string;
}

interface Order {
  id: number;
  customer_name: string;
  total_price: number;
  created_at: string;
  status: string;
  items: OrderItemDetail[];
}

const API_BASE_URL = 'http://192.168.1.8:5000';

const COLORS = {
  primary: '#FF7043',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  price: '#43A047',
  border: '#E0E0E0',
  lightGray: '#BDBDBD',
  white: '#FFFFFF',
  black: '#000000',
};

const StatusTracker = ({ status }: { status: string }) => {
  const statuses = ['Recibido', 'Preparando', 'En camino', 'Entregado'];
  const currentIndex = statuses.indexOf(status);

  return (
    <View style={styles.trackerContainer}>
      {statuses.map((s, i) => {
        const active = i <= currentIndex;
        return (
          <React.Fragment key={s}>
            <View style={styles.statusPointContainer}>
              <View style={[styles.statusPoint, active && styles.activeStatusPoint]}>
                {active && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
              </View>
              <Text style={[styles.statusLabel, active && styles.activeStatusLabel]}>{s}</Text>
            </View>
            {i < statuses.length - 1 && (
              <View style={[styles.connector, active && styles.activeConnector]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default function OrderTrackingScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, { signal });
      if (!response.ok) throw new Error('Pedido no encontrado');
      const data = await response.json();
      setOrder(data);
      setError(null);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrder(controller.signal);
    const interval = setInterval(() => fetchOrder(controller.signal), 15000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchOrder]);

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  if (error || !order)
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'No se encontró el pedido'}</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrder();
            }}
            colors={[COLORS.primary]}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seguimiento del Pedido</Text>
          <Text style={styles.headerSubtitle}>ID #{order.id}</Text>
        </View>

        <View style={styles.card}>
          <StatusTracker status={order.status} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen</Text>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.menu_item_image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menu_item_name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPriceTotal}>
                S/ {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>S/ {order.total_price.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.primary, fontSize: 16, textAlign: 'center' },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.text },
  headerSubtitle: { fontSize: 15, color: COLORS.textSecondary },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: COLORS.text },
  trackerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPointContainer: { alignItems: 'center', flex: 1 },
  statusPoint: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStatusPoint: { backgroundColor: COLORS.primary },
  statusLabel: { marginTop: 6, fontSize: 11, color: COLORS.textSecondary },
  activeStatusLabel: { color: COLORS.primary, fontWeight: '600' },
  connector: { flex: 1, height: 3, backgroundColor: COLORS.lightGray, top: 12 },
  activeConnector: { backgroundColor: COLORS.primary },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemImage: { width: 50, height: 50, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { fontSize: 15, color: COLORS.text },
  itemQuantity: { fontSize: 13, color: COLORS.textSecondary },
  itemPriceTotal: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.price },
});