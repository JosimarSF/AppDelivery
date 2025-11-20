  import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCart } from '../../context/CartContext';

// --- Tipos de Datos ---
type MenuItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
};

type MenuSection = {
  title: string;
  data: MenuItem[];
};

// --- Constantes ---
const API_URL = 'https://appdelivery-vwmv.onrender.com/api/menu';
const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FA7F08',
  background: '#F4F4F4',
  card: '#FFFFFF',
  text: '#1E1E1E',
  textSecondary: '#757575',
  gray: '#E0E0E0',
  white: '#FFFFFF',
  success: '#4CAF50',
};

const WEB_MAX_WIDTH = 800; 
const WEB_LIST_MAX_WIDTH = 1200; 

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: COLORS.text,
    fontSize: 16,
  },
  listContentWrapper: {
    maxWidth: WEB_LIST_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 16,
    width: '100%', 
  },
  menuItemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    margin: 10, 
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    flex: 1, 
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3, 
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemDetails: {
    marginTop: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  cartButton: {
    position: 'absolute',
    bottom: 15, // Valor base (MÓVIL)
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cartText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cartPrice: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 60 : 80,
    width: 300,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 1000, 
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
});


const imageStyle = {
    ...styles.image,
    ...(Platform.OS === 'web' && { 
        objectFit: 'cover' as 'cover', 
        display: 'block', 
    }),
};

const getFinalToastStyle = () => {
  let finalStyle = { ...styles.toastContainer }; 

  if (Platform.OS === 'web') {
    return { ...finalStyle, 
      left: '50%' as '50%',
      marginLeft: -150, 
    };
  } else {
    return { ...finalStyle, 
      left: '50%', 
      transform: [{ translateX: -150 }] 
    };
  }
};

const getFinalCartButtonStyle = () => {
    let finalStyle = { ...styles.cartButton }; 

    if (Platform.OS === 'web') {
        return {
            ...finalStyle,
            width: '100%',
            maxWidth: WEB_MAX_WIDTH, 
            position: 'fixed' as 'fixed',
            left: 0,
            right: 0,
            marginHorizontal: 'auto', 
            bottom: 65, // Valor específico para WEB
        };
    } else {
        return {
            ...finalStyle,
            left: 20,
            right: 20,
        };
    }
};

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

const CustomToast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 2500); 
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <View style={getFinalToastStyle()}>
      <Ionicons name="checkmark-circle" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

type MenuItemCardProps = {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onShowToast: (message: string) => void; 
};

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAdd, onShowToast }) => {
    const handleAdd = () => {
        onAdd(item);
        onShowToast(`${item.name} ha sido agregado al carrito.`); 
    };

    return (
        <View style={styles.menuItemCard}>
            <Image 
                source={{ uri: item.image_url }} 
                style={imageStyle} 
            />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>S/ {item.price.toFixed(2)}</Text>
                    <TouchableOpacity onPress={handleAdd}>
                        <Ionicons name="add-circle" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};


export default function MenuScreen() {
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuSection[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const router = useRouter();
  const { addToCart, cart } = useCart();

  const isWeb = Platform.OS === 'web';
  const numColumns = isWeb ? 2 : 1;

  // --- RENDERIZADO DE LA SECCIÓN (LISTA EXTERNA) ---
  const renderSection = ({ item: section }: { item: MenuSection }) => (
    // 1. Quitamos 'listContentWrapper' de este View
    <View> 
      {/* 2. Este Text ahora se alinea a la izquierda */}
      <Text style={styles.sectionHeader}>
        {section.title}
      </Text>
      {/* 3. Aplicamos 'listContentWrapper' solo a la lista de productos */}
      <FlatList
        style={styles.listContentWrapper}
        data={section.data}
        renderItem={({ item }) => (
          <MenuItemCard 
            item={item} 
            onAdd={addToCart} 
            onShowToast={handleShowToast} 
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={numColumns}
        key={numColumns} 
        scrollEnabled={false} 
      />
    </View>
  );

  const handleShowToast = (message: string) => {
    setToastMessage(message);
  };
  
  const handleDismissToast = () => {
    setToastMessage(null);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al cargar el menú');

        const data: MenuSection[] = await res.json();
        setMenuSections(data);
        setFilteredMenu(data); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    const q = text.trim().toLowerCase();

    if (!q) {
      return setFilteredMenu(menuSections);
    }

    const filtered = menuSections
      .map(s => ({
        ...s,
        data: s.data.filter(i => i.name.toLowerCase().includes(q)),
      }))
      .filter(s => s.data.length > 0);

    setFilteredMenu(filtered);
  };

  const { total, totalItems } = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { total, totalItems };
  }, [cart]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER: Mantiene ancho completo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cafetería Autónoma</Text>
          <Text style={styles.subtitle}>Pide tus platos favoritos sin salir del aula</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* SEARCH FIELD: Mantiene ancho completo */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busca tu plato..."
          value={search}
          onChangeText={handleSearch}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* MENÚ: Lista Externa (de Secciones) */}
      <FlatList
        data={filteredMenu} 
        renderItem={renderSection} 
        keyExtractor={item => item.title}
        contentContainerStyle={{ 
            paddingBottom: 100,
        }}
      />

      {cart.length > 0 && (
        <TouchableOpacity style={getFinalCartButtonStyle()} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={22} color={COLORS.white} />
          <Text style={styles.cartText}>Ver carrito ({totalItems})</Text>
          <Text style={styles.cartPrice}>S/ {total.toFixed(2)}</Text>
        </TouchableOpacity>
      )}
      
      {toastMessage && (
        <CustomToast message={toastMessage} onDismiss={handleDismissToast} />
      )}
    </SafeAreaView>
  );
}
