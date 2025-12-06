import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const response = await api.get('/api/cart');
      setCart(response.data.cart);  // now always contains 'items'
    } catch (error) {
      console.error('Error loading cart:', error.response?.data || error);
      Alert.alert('Error', 'Could not load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/remove/${itemId}`);
      loadCart();
      Alert.alert('Success', 'Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Could not remove item');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Image
        source={{ uri: item.product_id?.image_url || 'https://via.placeholder.com/50' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.product_id?.name || 'Product'}</Text>
        <Text style={styles.price}>${item.product_id?.price} x {item.quantity}</Text>
        <Text style={styles.subtotal}>
          Subtotal: ${(item.product_id?.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.remove}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>X</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!cart.items.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.shopButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + (item.product_id?.price || 0) * item.quantity, 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={<Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>}
      />
      <TouchableOpacity style={styles.checkoutButton}>
        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 12 },
  loadingText: { color: '#fff', textAlign: 'center', marginTop: 20 },
  empty: { color: '#aaa', fontSize: 18, textAlign: 'center', marginTop: 40 },
  row: { flexDirection: 'row', padding: 12, backgroundColor: '#111', borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  price: { color: '#bbb', marginTop: 4 },
  subtotal: { color: '#0af', marginTop: 4, fontWeight: 'bold' },
  remove: { backgroundColor: 'red', padding: 8, borderRadius: 8 },
  totalText: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 12, textAlign: 'right' },
  checkoutButton: { backgroundColor: '#0af', padding: 15, borderRadius: 10, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  shopButton: { backgroundColor: '#0af', padding: 14, borderRadius: 10, marginTop: 20, alignSelf: 'center' },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
