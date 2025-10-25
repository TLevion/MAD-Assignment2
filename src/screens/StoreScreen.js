import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Alert, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { api, authHeader } from "../lib/api";

export default function StoreScreen() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [items, setItems] = useState([]);

  const loadMyProducts = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("user") || "null");
    if (!user) return;
    try {
      const res = await api.get(`/products/seller/${user.id}`);
      setItems(res.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { loadMyProducts(); }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!result.cancelled) setImageUrl(result.uri);
  };

  const addProduct = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = JSON.parse(await AsyncStorage.getItem("user") || "null");
    if (!token || !user) return Alert.alert("Sign in", "Please login as seller");
    if (!name || !price) return Alert.alert("Error", "Name and price are required");

    try {
      await api.post("/products/add",
        { name, description: desc, price: parseFloat(price), seller_id: user.id, image_url: imageUrl },
        authHeader(token)
      );
      setName(""); setPrice(""); setDesc(""); setImageUrl("");
      loadMyProducts();
    } catch (e) { console.log(e); Alert.alert("Error", "Could not add product"); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <TextInput placeholder="Product Name" placeholderTextColor="#777" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Price" placeholderTextColor="#777" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Description" placeholderTextColor="#777" value={desc} onChangeText={setDesc} style={[styles.input, {height:80}]} multiline />
      <TextInput placeholder="Image URL" placeholderTextColor="#777" value={imageUrl} onChangeText={setImageUrl} style={styles.input} />

      <TouchableOpacity onPress={pickImage} style={[styles.btn, { backgroundColor: "#05f", marginBottom: 10 }]}>
        <Text style={{ color: "#fff" }}>Pick Image from Device</Text>
      </TouchableOpacity>

      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.previewImage} /> : null}

      <TouchableOpacity onPress={addProduct} style={styles.btn}><Text>Add Item</Text></TouchableOpacity>

      <Text style={{ color:"#aaa", marginTop:12, marginBottom: 5 }}>Your items</Text>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.itemImage} /> : null}
            <Text style={{ color:"#fff" }}>{item.name}</Text>
            <Text style={{ color:"#aaa" }}>${item.price}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 12 },
  input: { backgroundColor: "#111", color: "#fff", padding: 10, borderRadius: 8, marginBottom: 8 },
  btn: { backgroundColor: "#fff", padding: 12, borderRadius: 8, alignItems: "center" },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#222", flexDirection:"row", alignItems:"center" },
  previewImage: { width: "100%", height: 150, marginBottom: 10, borderRadius: 8, resizeMode:"cover" },
  itemImage: { width: 50, height: 50, marginRight: 8, borderRadius: 6, resizeMode:"cover" }
});
