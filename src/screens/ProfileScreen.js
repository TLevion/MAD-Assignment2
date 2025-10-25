// src/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, authHeader } from '../lib/api';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const nav = useNavigation();

  const load = async () => {
    const token = await AsyncStorage.getItem('token');
    const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
    if (!token || !user) return setProfile(null);
    try {
      const res = await api.get('/auth/profile', authHeader(token)); // if implemented
      setProfile(res.data || user);
    } catch (e) {
      setProfile(user);
    }
  };

  useEffect(() => { load(); }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setProfile(null);
    nav.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={{color:'#fff',fontSize:18}}>{profile?.username || 'Guest'}</Text>
      <Text style={{color:'#aaa'}}>{profile?.email || ''}</Text>
      <TouchableOpacity style={styles.btn} onPress={()=>Alert.alert('Edit','Edit profile not implemented')}><Text>Edit</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.btn,{backgroundColor:'#222',marginTop:8}]} onPress={logout}><Text style={{color:'#fff'}}>Logout</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: '#000', padding:12 },
  btn: { marginTop:12, backgroundColor:'#fff', padding:12, borderRadius:8, alignItems:'center' }
});
