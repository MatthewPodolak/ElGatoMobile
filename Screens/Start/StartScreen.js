import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function StartScreen({ navigation }) {

  const registerPress = () => {
    navigation.navigate('Metric');
  };

  const loginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>This is where your journey starts.</Text>
      </View>
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
    backgroundColor: 'black',
    padding: 10,
  },
  textContainer: {
    width: '100%',
    height: '20%',
    padding: 20,
  },
  mainText: {
    fontSize: 38,
    fontWeight: '700',
    color: 'white',
  },
  imageContainer: {
    width: '100%',
    height: '65%',
    padding: 5,
  },
  buttonContainer: {
    width: '100%',
    height: '20%',
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
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    color: '#FF8303',
  },
});

export default StartScreen;
