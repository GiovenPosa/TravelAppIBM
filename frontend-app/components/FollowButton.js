import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const FollowButton = ({ userId, isFollowingInitially, onFollowToggle }) => {
  const [isFollowing, setIsFollowing] = useState(isFollowingInitially);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/follow`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        const newState = !isFollowing;
        setIsFollowing(!isFollowing);
        onFollowToggle?.(!isFollowing); // Notify parent if needed
      } else {
        console.log('Follow action failed:', data);
        Alert.alert('Failed to follow/unfollow');
      }
    } catch (err) {
      console.error('Follow error:', err);
      Alert.alert('Follow action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isFollowing ? styles.unfollow : styles.follow]}
      onPress={handleToggleFollow}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  follow: {
    backgroundColor: '#007bff',
  },
  unfollow: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FollowButton;