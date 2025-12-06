import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../lib/api";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Product", { product: item })}
    >
      <Image
        source={{ uri: item.image_url || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={styles.brand}>{item.seller_id?.username || "Brand"}</Text>
        <Text numberOfLines={2} style={styles.title}>
          {item.name}
        </Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Text style={styles.delivery}>FREE DELIVERY</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 10 
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555'
  },
  row: { 
    justifyContent: "space-between",
    marginBottom: 15 
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    width: "48%",
    overflow: "hidden",
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: { 
    width: "100%", 
    height: 120, 
    resizeMode: "cover" 
  },
  cardContent: {
    padding: 10
  },
  brand: { 
    fontSize: 12, 
    color: "#555", 
    marginBottom: 4 
  },
  title: { 
    fontSize: 14, 
    fontWeight: "bold", 
    marginBottom: 6,
    height: 36 
  },
  price: { 
    fontSize: 16, 
    color: "#000", 
    fontWeight: "bold",
    marginBottom: 4 
  },
  delivery: { 
    fontSize: 10, 
    color: "#888" 
  },
});