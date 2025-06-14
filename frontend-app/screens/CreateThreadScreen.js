import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Platform, StatusBar as RNStatusBar, Modal, FlatList } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';
import { API_BASE_URL } from '../config';

const CreateThreadScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [followings, setFollowings] = useState([]); // List of users current user follows
  const [taggedUsers, setTaggedUsers] = useState([]); // Selected users to tag
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState(''); // For search bar in modal

  React.useEffect(() => {
    const fetchUsernameAndFollowings = async () => {
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
            // Fetch followings for tag modal
            const profileRes = await fetch(`${API_BASE_URL}/api/users/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const profileData = await profileRes.json();
            if (profileRes.ok && profileData.user && Array.isArray(profileData.user.followings)) {
              setFollowings(profileData.user.followings);
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
    fetchUsernameAndFollowings();
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
      // Prepare tagged user objects for display and send their IDs to backend
      const taggedUserObjects = followings.filter(u => taggedUsers.includes(u._id));
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content, taggedUsers: taggedUserObjects.map(u => u._id) })
      });
      const data = await response.json();
      if (!response.ok) {
        console.log('Server error:', data);
        alert('Failed to create post');
      } else {
        alert('Post created!');
        setContent('');
        setTaggedUsers([]);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to create post');
    }
  };

  const toggleTagUser = (userId) => {
    setTaggedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Filtered followings for search
  const filteredFollowings = followings.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  // Helper for avatar (show image if available, else initials or icon)
  const renderAvatar = (user) => {
    if (user.profilePicture) {
      return (
        <Image source={{ uri: user.profilePicture }} style={styles.avatarImg} />
      );
    }
    const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
    return (
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitials}>{initials || <Ionicons name="person" size={20} color="#fff" />}</Text>
      </View>
    );
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

      {/* Show tagged users */}
      {taggedUsers.length > 0 && (
        <View style={styles.taggedUsersRow}>
          <Text style={styles.taggedLabel}>Tagged: </Text>
          {followings.filter(u => taggedUsers.includes(u._id)).map(u => (
            <View key={u._id} style={styles.tagPill}>
              <Text style={styles.tagPillText}>{u.firstName} {u.lastName}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Options */}
      <ScrollView style={styles.optionsList}>
        <TouchableOpacity style={styles.optionRow} onPress={() => setModalVisible(true)}>
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

      {/* Tag People Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tag people</Text>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 8 }} />
              <TextInput
                style={styles.searchBar}
                placeholder="Search"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#aaa"
              />
            </View>
            <Text style={styles.suggestionsLabel}>Suggestions</Text>
            <FlatList
              data={filteredFollowings}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalUserRow}
                  onPress={() => toggleTagUser(item._id)}
                  activeOpacity={0.7}
                >
                  {renderAvatar(item)}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalUserName}>{item.firstName} {item.lastName}</Text>
                    {/* Optionally show friend/mutual info if available: <Text style={styles.mutualInfo}>Friend · 17 mutual friends</Text> */}
                  </View>
                  <View style={styles.checkboxBox}>
                    <View style={[styles.checkbox, taggedUsers.includes(item._id) && styles.checkboxChecked]}>
                      {taggedUsers.includes(item._id) && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>You are not following anyone yet.</Text>}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  taggedUsersRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 4, flexWrap: 'wrap' },
  taggedLabel: { fontWeight: 'bold', marginRight: 6 },
  tagPill: { backgroundColor: '#e3f2fd', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 4 },
  tagPillText: { color: '#1976d2', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '85%', maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalUserRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2 },
  avatarImg: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#eee' },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#bbb', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkboxBox: { marginLeft: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#bbb', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#007bff', borderColor: '#007bff' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f3f3', borderRadius: 10, marginBottom: 8, paddingHorizontal: 4 },
  searchBar: { flex: 1, height: 38, fontSize: 16, paddingHorizontal: 8, backgroundColor: 'transparent', color: '#222' },
  suggestionsLabel: { fontWeight: 'bold', fontSize: 15, marginBottom: 4, marginTop: 8 },
  modalCloseButton: { backgroundColor: '#007bff', borderRadius: 8, padding: 10, marginTop: 16, alignItems: 'center' },
  modalCloseButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CreateThreadScreen;
