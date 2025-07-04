import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../config';
import MessageItem from '../components/messageComponents/MessageItem';
import MessageInput from '../components/messageComponents/MessageInput';
import socket from '../utils/socket';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, otherUserName } = route.params;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const flatListRef = useRef(null);

  // 🧠 Header Setup with Touchable Title
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Chat Settings', {
              chatId,
              chatName: otherUserName,
              isGroup: route.params?.isGroup,
            })
          }
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007AFF' }}>
            {otherUserName}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, chatId, otherUserName]);

  // ✅ Fetch current user
  useEffect(() => {
    const getUserId = async () => {
      const token = await AsyncStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.userId);
    };
    getUserId();
  }, []);

  // ✅ Join socket room
  useEffect(() => {
    if (chatId) {
      socket.emit('joinChat', chatId);
    }
  }, [chatId]);

  // ✅ Fetch message history once
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/messages/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          const uniqueMessages = [...new Map(data.map(msg => [msg._id, msg])).values()];
          setMessages(uniqueMessages);
        } else {
          console.error('Failed to fetch messages', data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [chatId]);

  // ✅ Real-time receive via socket
  useEffect(() => {
    const handleIncoming = (message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          return exists ? prev : [...prev, message];
        });
      }
    };

    socket.on('receiveMessage', handleIncoming);
    return () => {
      socket.off('receiveMessage', handleIncoming);
    };
  }, [chatId]);

  // ✅ Socket-only send
  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const senderId = payload.userId;

      socket.emit('sendMessage', {
        chatId,
        message: {
          senderId,
          text,
        },
      });

      setText('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()} // latest messages at the bottom
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MessageItem message={item} currentUserId={currentUserId} />
        )}
        inverted={true}
        contentContainerStyle={{ padding: 10 }}
      />
      <MessageInput text={text} setText={setText} onSend={handleSend} />
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;