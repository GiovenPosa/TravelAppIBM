import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ControlPanelScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      Alert.alert('Logout Failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Control Panel</Text>
      <Button title="Logout" onPress={handleLogout} color="#d9534f" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default ControlPanelScreen;
