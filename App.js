import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firebase from './firebaseConfig'; // Firebase Setup
import { PiNetworkSDK } from 'pi-network-sdk'; // Pi Wallet SDK

const productsRef = firebase.firestore().collection('products');

export default function PiBayApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = productsRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(fetchedProducts);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const piUser = await PiNetworkSDK.login();
    setUser(piUser);
  };

  const handleBuyNow = async (product) => {
    if (!user) {
      alert('Bitte zuerst einloggen');
      return;
    }
    const transaction = await PiNetworkSDK.pay(user.username, product.price * 0.99);
    if (transaction.success) {
      alert(`Erfolgreich gekauft: ${product.name}`);
      await productsRef.doc(product.id).update({ sold: true });
    }
  };

  const handleBid = async (product) => {
    if (!user) {
      alert('Bitte zuerst einloggen');
      return;
    }
    const transaction = await PiNetworkSDK.pay(user.username, 0.01);
    if (transaction.success) {
      alert(`Gebot abgegeben für: ${product.name}`);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ padding: 10, backgroundColor: '#fff', marginBottom: 10, borderRadius: 5 }}>
      <Image source={{ uri: item.image }} style={{ width: 100, height: 100, borderRadius: 5 }} />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
      <Text style={{ fontSize: 16, color: '#ff9900' }}>{item.price} Pi</Text>
      <TouchableOpacity onPress={() => handleBuyNow(item)} style={{ backgroundColor: '#ff9900', padding: 10, borderRadius: 5, marginTop: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Sofort kaufen</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleBid(item)} style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginTop: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Bieten (0.01 Pi)</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: '#f4f4f4' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>PiBay - Marktplatz</Text>
      {!user ? (
        <Button title='Mit Pi Wallet einloggen' onPress={handleLogin} />
      ) : (
        <Text>Willkommen, {user.username}</Text>
      )}
      <TextInput
        placeholder='Suche nach Produkten...'
        style={{ padding: 10, backgroundColor: '#fff', borderRadius: 5, marginBottom: 10 }}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Alle Artikel</Text>
      <FlatList
        data={products.filter(p => !p.sold)}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
}