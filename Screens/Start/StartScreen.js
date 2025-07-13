import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function StartScreen({ navigation }) {

  const registerPress = () => {
    navigation.navigate('Questionary');
  };

  const loginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.mainText}>This is where your journey starts.</Text>
      <View style={styles.imageContainer}>
        {/* IMG */}
      </View>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={registerPress}>
          <Text style={styles.registerText}>Create an account</Text>
        </Pressable>
        <Text style={styles.loginText} onPress={loginPress}>
          Already have an account?
          <Text style={styles.loginLink} onPress={loginPress}>
            {" "}Login
          </Text>
          .
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F0E3CA',
    padding: 10,
  },
  mainText: {
    fontSize: 38,
    fontWeight: '700',
    color: '#1B1A17',
    fontFamily: 'HelveticaBold',
  },
  imageContainer: {
    width: '100%',
    flex: 1,
    padding: 5,
  },
  buttonContainer: {
    width: '100%',
    minHeight: 50,
    padding: 5,
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    width: '90%',
    backgroundColor: '#FF8303',
    marginBottom: 10,
  },
  registerText: {
    color: '#1B1A17',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  loginText: {
    color: '#1B1A17',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Helvetica',
  },
  loginLink: {
    color: '#FF8303',
    fontWeight: '500',
    fontFamily: 'Helvetica',
  },
});

export default StartScreen;