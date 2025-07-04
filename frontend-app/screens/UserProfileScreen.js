import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../utils/ProfileInfo';
import UserPostList from '../components/UserPostList';
import FollowButton from '../components/FollowButton';
import { API_BASE_URL } from '../config';
import ItineraryList from '../components/profileComponents/ItineraryList';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [selectedTab, setSelectedTab] = useState('Post');
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeUserIdFromToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch (err) {
        console.error('Token decode error:', err);
      }
    }
    return null;
  };

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      const decodedUserId = await decodeUserIdFromToken();
      setCurrentUserId(decodedUserId);

      const result = await fetchUserById(userId);
      if (result.success) {
        setUser(result.user);
      } else {
        console.error('Failed to fetch user:', result.error);
      }
      setLoading(false);
    };

    loadProfileData();
  }, [userId]);

  // 🧠 SET UP CHAT BUTTON
  useLayoutEffect(() => {
    if (user && currentUserId && currentUserId !== user._id) {
      navigation.setOptions({
        headerRight: () => (
          <Button
            title="Chat"
            onPress={async () => {
              try {
                const token = await AsyncStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/chats`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({ otherUserId: user._id })
                });

                const data = await response.json();
                if (response.ok && data.chat) {
                  navigation.navigate('Chat', {
                    chatId: data.chat._id,
                    otherUserName: `${user.firstName} ${user.lastName}`
                  });
                } else {
                  console.error('Failed to create chat:', data);
                }
              } catch (err) {
                console.error('Error creating chat:', err);
              }
            }}
          />
        ),
      });
    }
  }, [navigation, user, currentUserId]);

  if (loading || !user || !currentUserId) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>
        {user.firstName} {user.lastName}
      </Text>
      <Text style={styles.info}>
        Followers: {user?.followers?.length || 0} | Trips: {user?.trips?.length || 0} | Reviews: {user?.reviews?.length || 0}
      </Text>

      {currentUserId && currentUserId !== user._id && (
        <FollowButton
          userId={user._id}
          isFollowingInitially={user.followers?.some(f => f._id?.toString() === currentUserId)}
          onFollowToggle={() => {
            setUser((prev) => {
              const alreadyFollowing = prev.followers?.some(f => f._id?.toString() === currentUserId);
              const updatedFollowers = alreadyFollowing
                ? prev.followers.filter(f => f._id?.toString() !== currentUserId)
                : [...prev.followers, { _id: currentUserId }];
              return { ...prev, followers: updatedFollowers };
            });
          }}
        />
      )}

      <View style={styles.tabRow}>
        {['Post', 'Itinerary', 'Trip', 'Review'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tabItem, selectedTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'Post' && (
        <>
          <Text style={styles.subHeader}>Recent Posts:</Text>
          <UserPostList userId={user._id} />
        </>
      )}

      {selectedTab === 'Itinerary' && (
        <>
          <Text style={styles.subHeader}>Your Itineraries:</Text>
          <ItineraryList 
            userId={user._id} 
            onPress={() => navigation.navigate('ItineraryDetail', { itinerary: item })}
          />
        </>
      )}

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  info: { fontSize: 18, marginBottom: 5 },
  tabRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 20, borderBottomWidth: 1, borderColor: '#eee'
  },
  tabItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 2, borderColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#007bff' },
  tabText: { color: '#777', fontSize: 16 },
  tabTextActive: { color: '#007bff', fontWeight: 'bold' },
  subHeader: { fontSize: 20, marginTop: 20, marginBottom: 10 },
});

export default UserProfileScreen;