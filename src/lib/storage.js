// SecureStore doesn't exist in browsers, so fall back to localStorage on web.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const getItem = async (key) =>
  Platform.OS === 'web' ? localStorage.getItem(key) : SecureStore.getItemAsync(key);

export const setItem = async (key, value) =>
  Platform.OS === 'web' ? localStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);

export const deleteItem = async (key) =>
  Platform.OS === 'web' ? localStorage.removeItem(key) : SecureStore.deleteItemAsync(key);