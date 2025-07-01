import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../utils/ProfileInfo';
import UserPostList from '../components/UserPostList';
import FollowButton from '../components/FollowButton';
import { API_BASE_URL } from '../config';
import { StatusBar } from 'expo-status-bar';
import Feather from 'react-native-vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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


const loadProfileData = useCallback(async () => {
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
  }, [userId]);

 useEffect(() => {
    loadProfileData();
  }, [loadProfileData]); 

  useLayoutEffect(() => {
    if (user && currentUserId && currentUserId !== user._id) {
      navigation.setOptions({
        headerTitle: `${user.firstName} ${user.lastName}`,
        headerLeft: () => null,
        headerRight: () =>
          currentUserId !== user._id ? (
            <TouchableOpacity
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
            style={{ marginRight: 16 }}
          >
            <Feather name="send" size={24} color="black" />
          </TouchableOpacity>
        ) : null,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0
        } 
      });
    }
  }, [navigation, user, currentUserId]);

  if (loading || !user || !currentUserId) return <Text>Loading...</Text>;

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 30 }]}>
      <StatusBar style="dark" />

      <View style={styles.profileSection}>
        <View style={styles.profilePictureWrapper}>
          <Ionicons name="person" size={40} color="#999" />
        </View>
        <View style={styles.profileStatsColumn}>
          <View style={styles.statRow}>
            <Text>
              <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text>
              <Text style={styles.statLabel}> Followers</Text>
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text>
              <Text style={styles.statNumber}>{user?.trips?.length || 0}</Text>
              <Text style={styles.statLabel}> Trips</Text>
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text>
              <Text style={styles.statNumber}>{user?.reviews?.length || 0}</Text>
              <Text style={styles.statLabel}> Reviews</Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.profileInfoRow}>
        <View style={styles.profileTextBlock}>
          <Text style={styles.locationText}>{user?.location || ''}</Text>
          <Text style={styles.bioText}>{user?.bio || ''}</Text>
        </View>
        {currentUserId !== user._id && (
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
      </View>

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
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  profilePictureWrapper: {
    width: 100, height: 100, borderRadius: 60,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  profileStatsColumn: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    flexDirection: 'column', marginLeft: 12
  },
  statRow: { flexDirection: 'row', marginBottom: 6, width: 120 },
  statNumber: { fontSize: 16, fontWeight: 'bold', width: 30, textAlign: 'right' },
  statLabel: { fontSize: 14, textAlign: 'left' },
  profileInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginTop: 16, paddingHorizontal: 5
  },
  profileTextBlock: { flex: 1, paddingRight: 10 },
  locationText: { fontSize: 16, color: '#000', marginBottom: 6 },
  bioText: { fontSize: 14, color: '#444' },
  subHeader: { fontSize: 20, marginTop: 20, marginBottom: 10 },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    color: '#777',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default UserProfileScreen;