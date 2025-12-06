import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../lib/api";

export default function RegisterScreen({ navigation, setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert("Error", "Please enter a valid email!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/auth/register", { username, email, password, role });

      if (response.data?.token && response.data?.user) {
        // Save token and user info
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

        // Update navigator user state
        setUser(response.data.user);
      } else {
        Alert.alert("Registration Failed", response.data?.message || "Please try again.");
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert("Registration Failed", error.response?.data?.message || "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#aaa" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password (min 6 characters)" placeholderTextColor="#aaa" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#aaa" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Account Type:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={role} style={styles.picker} onValueChange={(itemValue) => setRole(itemValue)} dropdownIconColor="#fff">
            <Picker.Item label="👤 Buyer" value="buyer" />
            <Picker.Item label="🏪 Seller" value="seller" />
          </Picker>
        </View>
        <Text style={styles.dropdownNote}>
          {role === 'seller' ? "As a seller, you can add and manage products." : "As a buyer, you can browse and purchase products."}
        </Text>
      </View>

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backButtonText}>Already have an account? <Text style={styles.backLink}>Login</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#000", padding: 20, justifyContent: "center" },
  title: { fontSize: 28, color: "#fff", marginBottom: 30, fontWeight: "bold", textAlign: "center" },
  input: { width: "100%", backgroundColor: "#111", color: "#fff", borderWidth: 1, borderColor: "#333", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  dropdownContainer: { width: "100%", marginBottom: 20 },
  dropdownLabel: { color: "#fff", marginBottom: 10, fontSize: 16 },
  pickerContainer: { backgroundColor: "#111", borderRadius: 10, overflow: "hidden" },
  picker: { color: "#fff", height: 50 },
  dropdownNote: { color: "#aaa", fontSize: 12, marginTop: 8, fontStyle: "italic" },
  button: { backgroundColor: "#ff6600", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginBottom: 15 },
  buttonDisabled: { backgroundColor: "#555" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backButton: { marginBottom: 20 },
  backButtonText: { color: "#aaa", textAlign: "center", fontSize: 14 },
  backLink: { color: "#ff6600", fontWeight: "bold" }
});
