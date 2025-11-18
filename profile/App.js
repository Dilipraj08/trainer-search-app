import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>

      <View style={styles.card}>
        <Image 
          source={{ uri: "https://i.pravatar.cc/150?img=12" }} 
          style={styles.avatar} 
        />

        <Text style={styles.name}>Dilip Raj</Text>
        <Text style={styles.role}>React Native Developer</Text>
        <Text style={styles.bio}>
          Passionate about creating mobile apps with smooth UI and great user experience.
        </Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00ff95ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    width: "90%",
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#4a90e2",
  },

  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 5,
  },

  role: {
    fontSize: 18,
    color: '#4a90e2',
    marginBottom: 10,
  },

  bio: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
});
