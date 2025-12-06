import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen({ setUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile from AsyncStorage
  const loadProfile = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        setProfile(JSON.parse(userString));
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadProfile();
  }, []);

  // Logout function
  const logout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['token', 'user']);
              setUser(null); // Reset user in navigator
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert("Logout Error", "Failed to logout.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.guestText}>Please login to view profile</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => setUser(null)} // Trigger navigator to show Login
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{profile.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Order History</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Payment Methods</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Shipping Addresses</Text></TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Edit Profile</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Change Password</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Notifications</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingText: { color: '#fff', textAlign: 'center', marginTop: 50, fontSize: 18 },
  guestText: { color: '#fff', fontSize: 20, textAlign: 'center', marginTop: 50, marginBottom: 20 },
  loginButton: { backgroundColor: '#05f', padding: 15, borderRadius: 8, marginHorizontal: 50, marginTop: 10, alignItems: 'center' },
  loginButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#111', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#05f', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  username: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  email: { color: '#aaa', fontSize: 16, marginBottom: 10 },
  roleBadge: { backgroundColor: '#333', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15 },
  roleText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  section: { backgroundColor: '#111', marginHorizontal: 15, marginBottom: 20, borderRadius: 10, overflow: 'hidden' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  menuItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  menuItemText: { color: '#fff', fontSize: 16 },
  logoutButton: { backgroundColor: '#ff4444', marginHorizontal: 15, marginVertical: 30, padding: 15, borderRadius: 10, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
