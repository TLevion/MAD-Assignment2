import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, authHeader } from '../lib/api';

export default function CartScreen() {
  const [items, setItems] = useState([]);

  const loadCart = async () => {
    const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
    if (!user) return setItems([]);

    try {
      const res = await api.get(`/cart/${user.id}`);
      setItems(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Could not load cart');
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (cartItemId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return Alert.alert('Error', 'Please login first');

    try {
      await api.delete(`/cart/remove/${cartItemId}`, authHeader(token));
      loadCart();
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Could not remove item');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/50' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>${item.price} x {item.quantity}</Text>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.cart_item_id)} style={styles.remove}>
        <Text style={{ color: '#fff' }}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.cart_item_id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Cart is empty</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  image: { width: 60, height: 60, borderRadius: 6, resizeMode: 'contain' },
  info: { flex: 1, marginLeft: 12 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  price: { color: '#aaa', marginTop: 4 },
  remove: { backgroundColor: '#222', padding: 8, borderRadius: 6 },
  empty: { color: '#aaa', padding: 12, textAlign: 'center' }
});
