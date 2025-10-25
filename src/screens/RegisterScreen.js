import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import axios from "axios";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/api/auth/register", {
        username,
        email,
        password,
        role,
      });

      Alert.alert("Success", res.data.message);
      navigation.navigate("Login");
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Registration failed", err.response?.data?.message || "Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Role:</Text>
        <Picker
          selectedValue={role}
          style={styles.dropdown}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Buyer" value="buyer" />
          <Picker.Item label="Seller" value="seller" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.link}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, color: "#fff", marginBottom: 20, fontWeight: "bold" },
  input: { width: "100%", backgroundColor: "#111", color: "#fff", borderWidth: 1, borderColor: "#333", padding: 12, borderRadius: 10, marginBottom: 15 },
  dropdownContainer: { width: "100%", marginBottom: 20 },
  dropdownLabel: { color: "#aaa", marginBottom: 5 },
  dropdown: { backgroundColor: "#111", color: "#fff", borderRadius: 10 },
  button: { backgroundColor: "#ff6600", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginBottom: 15 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkText: { color: "#aaa" },
  link: { color: "#ff6600", fontWeight: "bold" },
});
