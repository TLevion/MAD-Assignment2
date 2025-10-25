import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProducts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Product", { product: item })}
      >
        <Image
          source={{ uri: item.image_url || "https://via.placeholder.com/150" }}
          style={styles.image}
        />
        <TouchableOpacity style={styles.favorite}>
          <Ionicons name="heart-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.brand}>{item.brand || "Brand"}</Text>
        <Text numberOfLines={1} style={styles.title}>
          {item.name}
        </Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.delivery}>DELIVERY: FREE</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  row: { justifyContent: "space-between" },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 15,
    width: "48%",
    overflow: "hidden",
    position: "relative",
  },
  image: { width: "100%", height: 120, resizeMode: "contain" }, // smaller and fits
  favorite: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#00000080",
    padding: 5,
    borderRadius: 15,
  },
  brand: { marginTop: 5, fontSize: 12, color: "#555", marginHorizontal: 5 },
  title: { fontSize: 14, fontWeight: "bold", marginHorizontal: 5, marginVertical: 2 },
  price: { fontSize: 14, color: "#000", marginHorizontal: 5, fontWeight: "bold" },
  delivery: { fontSize: 10, color: "#888", marginHorizontal: 5, marginBottom: 5 },
});
