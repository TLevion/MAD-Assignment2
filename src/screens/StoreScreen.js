import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { api } from "../lib/api";

export default function StoreScreen() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("100");
  const [imageUrl, setImageUrl] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
      if (!user || user.role !== 'seller') return;

      const response = await api.get("/api/products");
      const myProducts = response.data.filter(
        product => product.seller_id?._id === user.id
      );
      setProducts(myProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert("Error", "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadMyProducts();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Required", "We need camera roll permissions to upload images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    // Note: For production, you should upload to a service like Cloudinary
    // This is a placeholder - you'll need to implement actual image upload
    return uri;
  };

  const addProduct = async () => {
    if (!name || !price) {
      Alert.alert("Error", "Name and price are required");
      return;
    }

    const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
    if (!user || user.role !== 'seller') {
      Alert.alert("Error", "Only sellers can add products");
      return;
    }

    setUploading(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Upload image if it's a local file
        finalImageUrl = await uploadImage(imageUrl);
      }

      await api.post("/api/products/add", {
        name,
        description,
        price: parseFloat(price),
        category: category || "General",
        stock: parseInt(stock) || 100,
        image_url: finalImageUrl
      });

      Alert.alert("Success", "Product added successfully!");
      
      // Clear form
      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setStock("100");
      setImageUrl("");
      
      // Refresh products
      loadMyProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Could not add product"
      );
    } finally {
      setUploading(false);
    }
  };

  const deleteProduct = async (productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Note: You need to add a delete endpoint in your backend
              await api.delete(`/api/products/${productId}`);
              Alert.alert("Success", "Product deleted");
              loadMyProducts();
            } catch (error) {
              Alert.alert("Error", "Could not delete product");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manage Your Store</Text>

      {/* Add Product Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Add New Product</Text>
        
        <TextInput
          placeholder="Product Name *"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Price * (e.g., 29.99)"
          placeholderTextColor="#777"
          value={price}
          onChangeText={setPrice}
          style={styles.input}
          keyboardType="decimal-pad"
        />

        <TextInput
          placeholder="Category (e.g., Electronics, Clothing)"
          placeholderTextColor="#777"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />

        <TextInput
          placeholder="Initial Stock Quantity"
          placeholderTextColor="#777"
          value={stock}
          onChangeText={setStock}
          style={styles.input}
          keyboardType="number-pad"
        />

        <TextInput
          placeholder="Description"
          placeholderTextColor="#777"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
        />

        <TextInput
          placeholder="Image URL"
          placeholderTextColor="#777"
          value={imageUrl}
          onChangeText={setImageUrl}
          style={styles.input}
        />

        <TouchableOpacity 
          onPress={pickImage} 
          style={styles.imageButton}
        >
          <Text style={styles.imageButtonText}>Pick Image from Device</Text>
        </TouchableOpacity>

        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.previewImage} 
          />
        ) : null}

        <TouchableOpacity 
          onPress={addProduct} 
          style={[styles.submitButton, uploading && styles.buttonDisabled]}
          disabled={uploading}
        >
          <Text style={styles.submitButtonText}>
            {uploading ? "Adding..." : "Add Product"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* My Products List */}
      <View style={styles.productsContainer}>
        <Text style={styles.sectionTitle}>My Products ({products.length})</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#05f" style={styles.loader} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>No products yet. Add your first product!</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Image 
                  source={{ uri: item.image_url || 'https://via.placeholder.com/50' }} 
                  style={styles.productImage} 
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.productStock}>
                    Stock: {item.stock || 0} | Sold: 0
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => deleteProduct(item._id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20
  },
  formContainer: {
    backgroundColor: "#111",
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  imageButton: {
    backgroundColor: "#05f",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 10
  },
  submitButton: {
    backgroundColor: "#ff6600",
    padding: 15,
    borderRadius: 8,
    alignItems: "center"
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  buttonDisabled: {
    backgroundColor: "#555"
  },
  productsContainer: {
    backgroundColor: "#111",
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 30
  },
  loader: {
    marginVertical: 20
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    padding: 20
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 10
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12
  },
  productInfo: {
    flex: 1
  },
  productName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4
  },
  productPrice: {
    color: "#05f",
    fontSize: 14,
    marginBottom: 2
  },
  productStock: {
    color: "#aaa",
    fontSize: 12
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 6
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12
  }
});