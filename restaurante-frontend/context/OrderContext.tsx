import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
}

interface OrderContextType {
  orders: Order[];
  loadingOrders: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (cart: any, pabellon: string, mensaje: string) => Promise<any>;
  getOrderDetail: (orderId: number) => Promise<Order>;
}

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const { token: userToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
const API_URL = 'https://appdelivery-vwmv.onrender.com/api';
  const fetchOrders = async () => {
    if (!userToken) return;
    try {
      setLoadingOrders(true);
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setOrders(res.data);
    } catch (error: any) {
      console.error('Error al obtener pedidos:', error.response?.data || error.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const createOrder = async (cart: any, pabellon: string, mensaje: string) => {
    try {
      const payload = {
        items: cart,
        pabellon,
        mensaje,
      };

      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      await fetchOrders(); // Actualiza la lista
      return res.data;
    } catch (error: any) {
      console.error('Error al crear pedido:', error.response?.data || error.message);
      throw error;
    }
  };

  const getOrderDetail = async (orderId: number) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      return res.data;
    } catch (error: any) {
      console.error('Error al obtener detalle del pedido:', error.response?.data || error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (userToken) fetchOrders();
  }, [userToken]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loadingOrders,
        fetchOrders,
        createOrder,
        getOrderDetail,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
