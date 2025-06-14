import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { fetchUserProfile } from '../utils/ProfileInfo';
import AddPost from '../components/AddPost';
import PostList from '../components/PostList';

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const loadUser = async () => {
    const result = await fetchUserProfile();
    if (result.success) {
      setUserInfo(result.user);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 30 }]}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <View style={{ width: 50, height: 40, backgroundColor: '#007bff', borderRadius: 8, marginRight: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>LOGO</Text>
          </View>
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={28} color="black" />
          </TouchableOpacity>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowDropdown(v => !v)}>
              <MaterialIcons name="add-circle-outline" size={28} color="black" />
            </TouchableOpacity>
            {showDropdown && (
              <View style={[styles.dropdown, { top: 38, right: -10 }]}>
                <TouchableOpacity style={styles.dropdownItem}>
                  <MaterialIcons name="forum" size={22} color="#222" style={{ marginRight: 10 }} />
                  <Text>Thread</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem}>
                  <MaterialIcons name="post-add" size={22} color="#222" style={{ marginRight: 10 }} />
                  <Text>Post</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem}>
                  <MaterialIcons name="event-note" size={22} color="#222" style={{ marginRight: 10 }} />
                  <Text>Itinerary</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {userInfo && (
        <>
          <Text style={styles.profileText}>
            {userInfo.firstName} {userInfo.lastName}
          </Text>
          <Text style={styles.profileText}>
            Followers: {userInfo.followers?.length || 0} | Following: {userInfo.followings?.length || 0}
          </Text>
        </>
      )}

      <AddPost onPostCreated={triggerRefresh} />
      <Text style={styles.subHeader}>Recent Posts:</Text>
      <PostList refreshTrigger={refreshKey} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 40, resizeMode: 'contain', marginRight: 8 },
  logoText: { fontSize: 12, fontWeight: 'bold' },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginHorizontal: 6 },
  profileText: { fontSize: 16, marginBottom: 4 },
  subHeader: { fontSize: 20, marginTop: 20, marginBottom: 10 },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingVertical: 8,
    zIndex: 100,
    minWidth: 120,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
});

export default ProfileScreen;