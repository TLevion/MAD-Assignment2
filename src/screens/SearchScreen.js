import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { api } from '../lib/api';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) {
      Alert.alert("Error", "Please enter a search term");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/api/products?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.row} 
      onPress={() => navigation.navigate('Product', { product: item })}
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/50' }} 
        style={styles.image} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.productSeller}>
          Seller: {item.seller_id?.username || "Unknown"}
        </Text>
      </View>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>⭐ 4.5</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for products..."
          placeholderTextColor="#777"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={doSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? "..." : "Search"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#05f" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searched ? (
        results.length > 0 ? (
          <FlatList 
            data={results} 
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        )
      ) : (
        <View style={styles.initialContainer}>
          <Text style={styles.initialText}>Search for products</Text>
          <Text style={styles.initialSubtext}>
            Find products by name, description, or category
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  input: { 
    flex: 1,
    backgroundColor: '#222', 
    color: '#fff', 
    padding: 12, 
    borderRadius: 8,
    fontSize: 16
  },
  searchButton: { 
    backgroundColor: '#05f', 
    padding: 12, 
    borderRadius: 8, 
    marginLeft: 10,
    justifyContent: 'center'
  },
  searchButtonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16
  },
  listContainer: {
    padding: 10
  },
  row: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#111',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  },
  image: { 
    width: 70, 
    height: 70, 
    marginRight: 15, 
    borderRadius: 8,
    resizeMode: 'cover' 
  },
  productInfo: {
    flex: 1
  },
  productTitle: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4 
  },
  productPrice: { 
    color: '#05f', 
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4 
  },
  productSeller: { 
    color: '#aaa', 
    fontSize: 12 
  },
  ratingContainer: {
    backgroundColor: '#222',
    padding: 5,
    borderRadius: 4
  },
  ratingText: {
    color: '#fff',
    fontSize: 12
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  emptySubtext: {
    color: '#aaa',
    fontSize: 14
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  initialText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  initialSubtext: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center'
  }
});