import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import CollectionScreen from './screens/OpenSea/CollectionScreen';
import Trade from './screens/FutureTrade/Trade';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import HomeScreen from './screens/OpenSea/HomeScreen';
import DemoUI from './screens/DemoUI';


const Stack = createNativeStackNavigator()

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <PaperProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar
              backgroundColor={isDarkMode ? 'black' : 'white'}
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            <NavigationContainer>
              <Stack.Navigator initialRouteName='trade'>
                <Stack.Screen name='DemoUI' component={DemoUI}
                  options={{
                    headerShadowVisible: false
                  }}
                />
                <Stack.Screen name='trade' component={Trade}
                  options={{
                    title: "Trade",
                    headerShadowVisible: false,
                    headerShown: false,
                    headerTitleStyle: {
                      color: 'white'
                    },
                    headerStyle: {
                      backgroundColor: 'rgb(22, 26, 30)',
                    }
                  }}
                />
                <Stack.Screen name='home' component={HomeScreen}
                  options={{
                    title: "Collections",
                  }}
                />
                <Stack.Screen name='collection-details' component={CollectionScreen}
                  options={({ route }: any) => ({
                    title: `Collection - ${route.params.collection.slug}`,
                    headerShadowVisible: false,
                  })}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaView>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}

export default App;