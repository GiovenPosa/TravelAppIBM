import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar as RNStatusBar, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const CreateItineraryScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState([{ date: '', activities: [''] }]);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);

  const handleAddDay = () => {
    setDays([...days, { date: '', activities: [''] }]);
  };

  const handleDayChange = (idx, field, value) => {
    setDays(days.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };

  const handleActivityChange = (dayIdx, actIdx, value) => {
    setDays(days.map((d, i) =>
      i === dayIdx
        ? { ...d, activities: d.activities.map((a, j) => (j === actIdx ? value : a)) }
        : d
    ));
  };

  const handleAddActivity = (dayIdx) => {
    setDays(days.map((d, i) =>
      i === dayIdx ? { ...d, activities: [...d.activities, ''] } : d
    ));
  };

  const handleRemoveActivity = (dayIdx, actIdx) => {
    setDays(days.map((d, i) =>
      i === dayIdx
        ? { ...d, activities: d.activities.filter((_, j) => j !== actIdx) }
        : d
    ));
  };

  const handleRemoveDay = (idx) => {
    setDays(days.filter((_, i) => i !== idx));
  };

  const handleCreate = () => {
    // Dummy submit logic
    alert('Itinerary created! (dummy)');
    navigation.goBack?.();
  };

  React.useEffect(() => {
    const fetchFollowersAndFollowings = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const profileRes = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const profileData = await profileRes.json();
          if (profileRes.ok && profileData.user) {
            setFollowers(Array.isArray(profileData.user.followers) ? profileData.user.followers : []);
            setFollowings(Array.isArray(profileData.user.followings) ? profileData.user.followings : []);
          }
        }
      } catch (err) {
        // ignore
      }
    };
    fetchFollowersAndFollowings();
  }, []);

  const toggleSelectFollower = (userId) => {
    setSelectedFollowers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const handleShareConfirm = () => {
    setShareModalVisible(false);
    // Dummy: show who it would be shared with
    alert('Itinerary shared with: ' + followers.filter(f => selectedFollowers.includes(f._id)).map(f => `${f.firstName} ${f.lastName}`).join(', '));
    navigation.goBack?.();
  };

  const allShareableUsers = [
    ...followers,
    ...followings.filter(fw => !followers.some(f => f._id === fw._id))
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 40 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack?.()}>
            <Ionicons name="arrow-back" size={26} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Itinerary</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleShare}>
            <Text style={styles.saveButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Destination"
          value={destination}
          onChangeText={setDestination}
        />
        <Text style={styles.sectionLabel}>Days</Text>
        {days.map((day, idx) => (
          <View key={idx} style={styles.dayBlock}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Date (YYYY-MM-DD)"
                value={day.date}
                onChangeText={v => handleDayChange(idx, 'date', v)}
              />
              {days.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveDay(idx)}>
                  <Ionicons name="remove-circle" size={24} color="#fa3e3e" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.activitiesLabel}>Activities</Text>
            {day.activities.map((activity, actIdx) => (
              <View key={actIdx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8, minHeight: 40 }]}
                  placeholder={`Activity ${actIdx + 1}`}
                  value={activity}
                  onChangeText={v => handleActivityChange(idx, actIdx, v)}
                />
                {day.activities.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveActivity(idx, actIdx)}>
                    <Ionicons name="remove-circle" size={22} color="#fa3e3e" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addActivityBtn} onPress={() => handleAddActivity(idx)}>
              <Ionicons name="add-circle" size={20} color="#007bff" />
              <Text style={styles.addActivityText}>Add Activity</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addDayBtn} onPress={handleAddDay}>
          <Ionicons name="add-circle" size={22} color="#007bff" />
          <Text style={styles.addDayText}>Add Day</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Button title="Create Itinerary" onPress={handleCreate} color="#007bff" />
      </ScrollView>
      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share with Followers & Following</Text>
            <FlatList
              data={allShareableUsers}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalUserRow}
                  onPress={() => toggleSelectFollower(item._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{(item.firstName?.[0] || '') + (item.lastName?.[0] || '')}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalUserName}>{item.firstName} {item.lastName}</Text>
                  </View>
                  <View style={styles.checkboxBox}>
                    <View style={[styles.checkbox, selectedFollowers.includes(item._id) && styles.checkboxChecked]}>
                      {selectedFollowers.includes(item._id) && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 10 }}>No followers or followings to share with.</Text>}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={handleShareConfirm}>
              <Text style={styles.modalCloseButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setShareModalVisible(false)}>
              <Text style={[styles.modalCloseButtonText, { color: '#222' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#fff', flexGrow: 1 }, // Match homepage padding
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#fafbfc',
  },
  sectionLabel: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, marginTop: 8 },
  dayBlock: { marginBottom: 10, backgroundColor: '#f6f8fa', borderRadius: 8, padding: 8 },
  addDayBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  addDayText: { color: '#007bff', fontWeight: 'bold', marginLeft: 6, fontSize: 16 },
  activitiesLabel: { fontWeight: 'bold', fontSize: 15, marginBottom: 4, marginTop: 2 },
  addActivityBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addActivityText: { color: '#007bff', fontWeight: 'bold', marginLeft: 6, fontSize: 15 },
  saveButton: { backgroundColor: '#007bff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '85%', maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalSectionLabel: { fontWeight: 'bold', fontSize: 15, marginTop: 10, marginBottom: 4 },
  modalUserRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#bbb', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkboxBox: { marginLeft: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#bbb', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#007bff', borderColor: '#007bff' },
  modalCloseButton: { backgroundColor: '#007bff', borderRadius: 8, padding: 10, marginTop: 16, alignItems: 'center' },
  modalCloseButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalUserName: { fontSize: 16, marginLeft: 10 },
});

export default CreateItineraryScreen;
