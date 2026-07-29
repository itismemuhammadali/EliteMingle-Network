import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { AuthProvider } from './src/context/AuthContext';
import { UsersListProvider } from './src/context/UsersListContext';
import { MainStack } from './src/navigation/MainStack';
import { store } from './src/redux/store';
import { Colors } from './src/constants/colors';

const AdminTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.adminBackgroundGrey,
    card: Colors.adminBackgroundGrey,
  },
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <AuthProvider>
        <UsersListProvider>
          <NavigationContainer theme={AdminTheme}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
            <MainStack />
          </NavigationContainer>
        </UsersListProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
