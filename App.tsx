/**
 * Chat App - React Native
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChatScreen } from './src/screens/ChatScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <ChatScreen />
    </SafeAreaProvider>
  );
}

export default App;
