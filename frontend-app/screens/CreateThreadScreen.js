import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';
import { API_BASE_URL } from '../config';

const CreateThreadScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');

  React.useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            // Fetch user info from backend using userId
            const response = await fetch(`${API_BASE_URL}/api/users/${payload.userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.user) {
              setUsername((data.user.firstName || '') + ' ' + (data.user.lastName || ''));
            } else {
              setUsername('User');
            }
          } catch (decodeErr) {
            console.log('Error decoding JWT or fetching user:', decodeErr);
            setUsername('User');
          }
        }
      } catch (err) {
        console.log('Error in fetchUsername:', err);
        setUsername('User');
      }
    };
    fetchUsername();
  }, []);

  const handlePostSubmit = async () => {
    if (!content) {
      alert('Post content cannot be empty');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        alert('You are not logged in.');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (!response.ok) {
        console.log('Server error:', data);
        alert('Failed to create post');
      } else {
        alert('Post created!');
        setContent('');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to create post');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 40 }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create thread</Text>
        <TouchableOpacity style={[styles.postButton, { backgroundColor: '#007bff' }]} onPress={handlePostSubmit}>
          <Text style={[styles.postButtonText, { color: '#fff' }]}>POST</Text>
        </TouchableOpacity>
      </View>

      {/* User Row */}
      <View style={styles.userRow}>
        <View style={styles.avatarDummy}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <Text style={styles.userName}>{username}</Text>
      </View>

      {/* Input */}
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
        multiline
      />

      {/* Options */}
      <ScrollView style={styles.optionsList}>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialIcons name="person-add" size={24} color="#1877f2" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Tag people</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <Ionicons name="location-outline" size={24} color="#fa3e3e" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialIcons name="link" size={24} color="#00b894" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Bind Itinerary</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  postButton: { backgroundColor: '#007bff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 },
  postButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatarDummy: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userName: { fontWeight: 'bold', fontSize: 16 },
  input: { minHeight: 80, fontSize: 18, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 8 },
  optionsList: { borderTopWidth: 1, borderColor: '#eee', marginTop: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  optionText: { fontSize: 16 },
});

export default CreateThreadScreen;
