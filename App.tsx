import React from 'react';
import { StatusBar, useColorScheme, LogBox } from 'react-native';

LogBox.ignoreAllLogs();
import { NavigationContainer, DefaultTheme, type LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { AuthProvider } from './src/context/AuthContext';
import { UsersListProvider } from './src/context/UsersListContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { MainStack } from './src/navigation/MainStack';
import { store } from './src/redux/store';
import { Colors } from './src/constants/colors';
import { ErrorBoundary } from './src/components/general/ErrorBoundary';

const AdminTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.adminBackgroundGrey,
    card: Colors.adminBackgroundGrey,
  },
};

const linking: LinkingOptions<any> = {
  prefixes: ['epm://', 'https://epm.app'],
  config: {
    screens: {
      UserMain: {
        screens: {
          PostComments: 'post/:postId',
        },
      },
    },
  },
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <AuthProvider>
            <LanguageProvider>
              <UsersListProvider>
                <NavigationContainer theme={AdminTheme} linking={linking}>
                  <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
                  <MainStack />
                </NavigationContainer>
              </UsersListProvider>
            </LanguageProvider>
          </AuthProvider>
        </Provider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
