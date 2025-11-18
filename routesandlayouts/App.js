import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  FlatList,
  ScrollView,
} from 'react-native';

// --- INITIAL DATA STRUCTURE ---
const createInitialMembers = (count) => {
  const members = [];
  for (let i = 1; i <= count; i++) {
    members.push({ 
      id: String(i), 
      name: '', 
      age: '', 
      salary: '', 
      currentCompany: '', 
      nextCompany: '' 
    });
  }
  return members;
};

// --- 1. Component for Single Member Input Form (UI based on image) ---
const SingleMemberInputForm = ({ member, onChange }) => (
  <View style={styles.inputFormContainer}>
    {/* Name Input */}
    <View style={styles.inputFieldGroup}>
      <Text style={styles.inputFormLabel}>Name</Text>
      <TextInput
        style={styles.inputFormValue}
        placeholder="Name"
        placeholderTextColor="#AAB7B8"
        value={member.name}
        onChangeText={(text) => onChange(member.id, 'name', text)}
        autoCapitalize="words"
        returnKeyType="next"
      />
    </View>

    {/* Age Input */}
    <View style={styles.inputFieldGroup}>
      <Text style={styles.inputFormLabel}>Age</Text>
      <TextInput
        style={styles.inputFormValue}
        placeholder="Age"
        placeholderTextColor="#AAB7B8"
        value={member.age}
        onChangeText={(text) => onChange(member.id, 'age', text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        maxLength={3}
        returnKeyType="next"
      />
    </View>

    {/* Salary Input */}
    <View style={styles.inputFieldGroup}>
      <Text style={styles.inputFormLabel}>Salary</Text>
      <TextInput
        style={styles.inputFormValue}
        placeholder="Salary (₹)"
        placeholderTextColor="#AAB7B8"
        value={member.salary}
        onChangeText={(text) => onChange(member.id, 'salary', text.replace(/[^0-9,]/g, ''))}
        keyboardType="numeric"
        returnKeyType="next"
      />
    </View>

    {/* Current Company Input */}
    <View style={styles.inputFieldGroup}>
      <Text style={styles.inputFormLabel}>Current Company</Text>
      <TextInput
        style={styles.inputFormValue}
        placeholder="Current Co."
        placeholderTextColor="#AAB7B8"
        value={member.currentCompany}
        onChangeText={(text) => onChange(member.id, 'currentCompany', text)}
        autoCapitalize="words"
        returnKeyType="next"
      />
    </View>

    {/* Next Company Input */}
    <View style={styles.inputFieldGroup}>
      <Text style={styles.inputFormLabel}>Next Company</Text>
      <TextInput
        style={styles.inputFormValue}
        placeholder="Next Co. Goal"
        placeholderTextColor="#AAB7B8"
        value={member.nextCompany}
        onChangeText={(text) => onChange(member.id, 'nextCompany', text)}
        autoCapitalize="words"
        returnKeyType="done"
      />
    </View>
    
  </View>
);

// --- 2. Component for Displaying Results (Preserved logic) ---
const ResultCard = ({ member }) => {
  const formattedSalary = member.salary.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedFinalSalary = member.finalSalary.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const companyAdvice = member.currentCompany || member.nextCompany;
  const cardStyle = member.isHiked ? styles.hikeCard : (member.salaryBaseValue < 10000 && member.salaryBaseValue > 0 ? styles.adviceCard : styles.workHardCard);

  return (
    <View style={[styles.resultCard, cardStyle]}>
      <Text style={styles.resultTitle}>{member.name}</Text>
      <View style={styles.resultDetails}>
        <Text style={styles.resultText}>Age: {member.age || 'N/A'}</Text>
        {companyAdvice ? (
          <>
            <Text style={styles.resultText}>Current Co: {member.currentCompany || 'N/A'}</Text>
            <Text style={styles.resultText}>Next Goal: {member.nextCompany || 'N/A'}</Text>
          </>
        ) : null}
        <Text style={styles.resultText}>Original Salary: ₹{formattedSalary}</Text>
        
        {member.isHiked ? (
          <Text style={styles.resultHikeText}>
            New Salary: ₹{formattedFinalSalary} (10% Hike!)
          </Text>
        ) : (
          <Text style={styles.resultHikeText}>
            Current Salary: ₹{formattedSalary}
          </Text>
        )}
      </View>
      <Text style={styles.resultMessage}>{member.message}</Text>
    </View>
  );
};

// --- 3. Main App Component (Refactored for Dynamic Count and Multi-Step Flow) ---
export default function App() {
  const [numPeople, setNumPeople] = useState(''); // Stores the number of people input
  const [members, setMembers] = useState([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0); 
  const [results, setResults] = useState([]);
  const [greeting, setGreeting] = useState("hello bruhh");
  
  const isSetupPhase = members.length === 0;
  const isCalculating = results.length > 0;
  const currentMember = members[currentMemberIndex];
  const isLastMember = currentMemberIndex === members.length - 1;

  // --- Setup Phase Logic ---

  const handleSetupSubmit = () => {
    const count = parseInt(numPeople);
    if (count > 0 && count <= 50) { // Limit to 50 for performance/usability
      const initialData = createInitialMembers(count);
      setMembers(initialData);
      setCurrentMemberIndex(0);
      setGreeting(`Input for Person 1 of ${count}`);
    } else {
      setGreeting("Please enter a number between 1 and 50.");
    }
  };

  // --- Input Phase Logic ---

  const handleChange = (id, field, value) => {
    setMembers(prevMembers => 
      prevMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };
  
  const handleCalculate = () => {
    setGreeting("Calculating salary projections...");
    
    const calculatedResults = members.map(member => {
      const salaryBaseValue = parseInt(member.salary.replace(/[^0-9]/g, ''), 10) || 0;
      
      let message = '';
      let finalSalary = salaryBaseValue;
      let isHiked = false;
      let displayOnly = true;

      if (!member.name.trim()) {
        displayOnly = false;
      } else if (salaryBaseValue > 1000) {
        // --- High Salary (> 1000): HIKE LOGIC ---
        finalSalary = salaryBaseValue * 1.10; 
        message = "Congrats, your salary has been hiked! 🎉";
        isHiked = true;
      } else {
        // --- Low Salary (<= 1000): DEFAULT WORK HARD LOGIC ---
        message = "Work hard and be consistent, you'll definitely get a hike in coming days.";
      }
      
      // --- Company Change Advice Logic (Salary < 10000) ---
      if (salaryBaseValue > 0 && salaryBaseValue < 10000) {
          const current = member.currentCompany.trim() || 'your current company';
          const next = member.nextCompany.trim() || 'a better opportunity';
          
          message = `⚠️ Your salary (₹${salaryBaseValue}) is low. Apply for a change from ${current} to ${next} immediately! 🚀`;
      }

      return {
        ...member,
        finalSalary,
        message,
        isHiked,
        displayOnly,
        salaryBaseValue, 
      };
    }).filter(member => member.displayOnly);

    setResults(calculatedResults);
    setGreeting("Results Displayed Below");
  };
  
  const handleNext = () => {
      if (!currentMember.name.trim()) {
          setGreeting(`Please enter the name for Person ${currentMemberIndex + 1} before proceeding.`);
          return;
      }

      if (isLastMember) {
          handleCalculate();
      } else {
          setCurrentMemberIndex(prev => prev + 1);
          setGreeting(`Input for Person ${currentMemberIndex + 2} of ${members.length}`);
      }
  };

  const handleReset = () => {
    setNumPeople('');
    setMembers([]);
    setResults([]);
    setCurrentMemberIndex(0);
    setGreeting("hello bruhh");
  };

  // --- Render Functions ---

  const renderSetupPhase = () => (
    <View style={styles.inputCard}>
      <Text style={styles.cardTitle}>How many people?</Text>
      
      <TextInput
        style={styles.setupInput}
        placeholder="Enter number (1-50)"
        placeholderTextColor="#AAB7B8"
        value={numPeople}
        onChangeText={setNumPeople}
        keyboardType="numeric"
        maxLength={2}
        returnKeyType="done"
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSetupSubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Start Input</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInputPhase = () => (
    <View style={styles.inputCard}>
      <Text style={styles.cardTitle}>Person {currentMemberIndex + 1} of {members.length}</Text>
      
      <SingleMemberInputForm 
        member={currentMember} 
        onChange={handleChange} 
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{isLastMember ? "View Results" : "Next"}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResultPhase = () => (
    <View style={styles.inputCard}>
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsHeader}>Salary Projections ({results.length} Valid Entries)</Text>
        
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ResultCard member={item} />}
          scrollEnabled={false}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.headerText}>{greeting}</Text>
        
        {isSetupPhase && renderSetupPhase()}
        {!isSetupPhase && !isCalculating && renderInputPhase()}
        {isCalculating && renderResultPhase()}

        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>Reset All</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2B35',
    width: '100%',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 80, // Added padding to move content down
    paddingHorizontal: 15,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    flexGrow: 1, // Allow ScrollView to take full height
  },
  headerText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ECF0F1',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  inputCard: {
    width: '100%',
    maxWidth: 400, 
    backgroundColor: '#2C3E50',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ECF0F1',
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#34495E',
    paddingBottom: 10,
  },
  
  // --- SETUP PHASE STYLES ---
  setupInput: {
    height: 50,
    backgroundColor: '#4B6587',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#ECF0F1',
    textAlign: 'center',
    marginBottom: 10,
  },

  // --- STYLES FOR IMAGE-BASED INPUT UI ---
  inputFormContainer: {
    marginBottom: 20,
    borderWidth: 1, 
    borderColor: '#34495E',
    borderRadius: 8,
    overflow: 'hidden', 
  },
  inputFieldGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#34495E',
    backgroundColor: '#34495E',
  },
  inputFormLabel: {
    width: '50%', 
    fontSize: 14,
    fontWeight: '500',
    color: '#BDC3C7',
    paddingLeft: 10,
    paddingVertical: 12,
  },
  inputFormValue: {
    width: '50%', 
    height: 45,
    backgroundColor: '#4B6587', 
    borderRadius: 0,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#ECF0F1',
  },
  // END NEW STYLES
  
  button: {
    width: '100%',
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // --- Results Styles (Used when isCalculating is true) ---
  resultsContainer: {
    width: '100%',
    maxWidth: 600,
    padding: 10,
  },
  resultsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ECF0F1',
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#34495E',
    marginBottom: 10,
  },
  resultCard: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  hikeCard: {
    backgroundColor: '#2ECC71', 
  },
  adviceCard: {
    backgroundColor: '#F1C40F', 
  },
  workHardCard: {
    backgroundColor: '#F39C12', 
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E2B35',
    marginBottom: 5,
  },
  resultDetails: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  resultText: {
    fontSize: 14,
    color: '#1E2B35',
  },
  resultHikeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E2B35',
    marginTop: 5,
  },
  resultMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#1E2B35',
  },

  // --- Reset Button Styles ---
  resetButton: {
    padding: 15,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 20, // Add space above reset button
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});