import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveItem(key: string, value: string) {
  if (Platform.OS === 'web') await AsyncStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string) {
  if (Platform.OS === 'web') return await AsyncStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
}

export async function deleteItem(key: string) {
  if (Platform.OS === 'web') await AsyncStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}
