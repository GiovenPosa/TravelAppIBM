import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import FeedList from '../components/FeedList';

const HomeScreen = ({ navigation }) => {
  const [refreshKey, setRefreshKey ] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 40 }]}> 
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          {/* Dummy logo replacement */}
          <View style={{ width: 50, height: 40, backgroundColor: '#007bff', borderRadius: 8, marginRight: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>AwayAway</Text>
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
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setShowDropdown(false); navigation.navigate('CreateThread'); }}>
                  <MaterialIcons name="forum" size={22} color="#222" style={{ marginRight: 10 }} />
                  <Text>Thread</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem}>
                  <MaterialIcons name="post-add" size={22} color="#222" style={{ marginRight: 10 }} />
                  <Text>Post</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setShowDropdown(false); navigation.navigate('CreateItinerary'); }}>
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
      <Text style={styles.header}>Home Feed</Text>
      <FeedList refreshTrigger={refreshKey} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 40, resizeMode: 'contain', marginRight: 8 },
  logoText: { fontSize: 12, fontWeight: 'bold' },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginHorizontal: 6 },
  header: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  text: { fontSize: 20 },
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

export default HomeScreen;