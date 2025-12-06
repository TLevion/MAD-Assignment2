import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../lib/api";

export default function ProductScreen({ route }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    try {
      setLoading(true);
      
      const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
      const token = await AsyncStorage.getItem('token');
      
      if (!user || !token) {
        Alert.alert("Sign In Required", "Please login to add items to cart");
        return;
      }

      await api.post("/api/cart/add", {
        product_id: product._id,
        quantity
      });

      Alert.alert("Success", "Product added to cart!");
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Could not add to cart"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image_url || "https://via.placeholder.com/300" }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.category}>{product.category || "General"}</Text>
        <Text style={styles.title}>{product.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.seller}>Sold by: {product.seller_id?.username || "Unknown Seller"}</Text>
        </View>

        <Text style={styles.delivery}>🚚 FREE Delivery</Text>
        
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.description}>
          {product.description || "No description available."}
        </Text>

        <View style={styles.stockInfo}>
          <Text style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
            {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : "❌ Out of Stock"}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.btn, loading && styles.btnDisabled]} 
          onPress={addToCart}
          disabled={loading || product.stock <= 0}
        >
          <Text style={styles.btnText}>
            {loading ? "Adding..." : product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 300, resizeMode: "cover" },
  content: { padding: 20 },
  category: { fontSize: 14, color: "#666", marginBottom: 5 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  price: { fontSize: 28, fontWeight: "bold", color: "#000" },
  seller: { fontSize: 14, color: "#666", marginTop: 8 },
  delivery: { fontSize: 16, color: "#05f", marginBottom: 20 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  quantityLabel: { fontSize: 16, marginRight: 15 },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#f0f0f0', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 5 
  },
  quantityButtonText: { fontSize: 20, fontWeight: 'bold' },
  quantity: { fontSize: 18, marginHorizontal: 15 },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 20 },
  stockInfo: { marginBottom: 20 },
  inStock: { color: 'green', fontSize: 16 },
  outOfStock: { color: 'red', fontSize: 16 },
  btn: { 
    backgroundColor: "#05f", 
    padding: 15, 
    borderRadius: 10, 
    alignItems: "center",
    marginVertical: 10 
  },
  btnDisabled: { backgroundColor: "#ccc" },
  btnText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
});