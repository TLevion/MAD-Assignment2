// src/screens/ProductScreen.js
import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, authHeader } from "../lib/api";

export default function ProductScreen({ route }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);

  const addToCart = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem("user") || "null");
      const token = await AsyncStorage.getItem("token");
      if (!user || !token) return Alert.alert("Sign in", "Please login to add to cart");

      // Assume you already have a cart for the user
      await api.post("/cart/add", {
        user_id: user.id,
        product_id: product.id,
        quantity
      }, authHeader(token));

      Alert.alert("Success", "Product added to cart!");
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not add to cart");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image_url || "https://via.placeholder.com/300" }}
        style={styles.image}
      />

      <TouchableOpacity style={styles.favorite}>
        <Ionicons name="heart-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {product.bestSeller && <Text style={styles.bestSeller}>BESTSELLER</Text>}

      <Text style={styles.brand}>{product.brand || "Brand"}</Text>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.delivery}>DELIVERY: FREE</Text>
      <Text style={styles.description}>{product.description || "No description available."}</Text>

      <TouchableOpacity onPress={addToCart} style={styles.btn}>
        <Text style={styles.btnText}>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  image: { width: "100%", height: 300, resizeMode: "contain", borderRadius: 10, marginBottom: 10 },
  favorite: { position: "absolute", top: 20, right: 20, backgroundColor: "#00000080", padding: 8, borderRadius: 20 },
  bestSeller: { position: "absolute", top: 20, left: 20, backgroundColor: "#000", color: "#fff", fontSize: 12, paddingHorizontal: 6, paddingVertical: 3, fontWeight: "bold", borderRadius: 3 },
  brand: { marginTop: 10, fontSize: 14, color: "#555" },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 5 },
  price: { fontSize: 18, fontWeight: "bold", color: "#000" },
  delivery: { fontSize: 12, color: "#888", marginBottom: 10 },
  description: { fontSize: 14, color: "#333", marginTop: 10, marginBottom: 20 },
  btn: { backgroundColor: "#05f", padding: 15, borderRadius: 10, alignItems: "center", marginVertical: 10 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
