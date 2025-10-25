import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Image } from 'react-native';
import { api } from '../lib/api';

export default function SearchScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  const doSearch = async () => {
    try {
      const res = await api.get(`/products?q=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{padding:12}}>
        <TextInput placeholder="Search products" placeholderTextColor="#777" value={q} onChangeText={setQ} style={styles.input} />
        <TouchableOpacity onPress={doSearch} style={styles.btn}><Text style={{color:'#fff'}}>Search</Text></TouchableOpacity>
      </View>
      <FlatList 
        data={results} 
        keyExtractor={i => String(i.id)} 
        renderItem={({item}) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Product', { id: item.id })}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/50' }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={{color:'#fff'}}>{item.title}</Text>
              <Text style={{color:'#aaa'}}>${item.price}</Text>
            </View>
          </TouchableOpacity>
        )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  input: { backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 8 },
  btn: { marginTop: 8, backgroundColor: '#05f', padding: 10, borderRadius: 8, alignItems: 'center' },
  row: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#222', flexDirection: 'row', alignItems: 'center' },
  image: { width: 50, height: 50, marginRight: 10, borderRadius: 6, resizeMode: 'contain' }
});
