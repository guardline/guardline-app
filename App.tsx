import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
} from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Pages
import Landing from './pages/Landing'
import AppHome from './pages/AppHome'
import TextChecker from './pages/TextChecker'
import Family from './pages/Family'
import CallDemo from './pages/CallDemo'

type Route = 'landing' | 'app' | 'call'
type Tab = 'home' | 'check' | 'family'

function App() {
  const isDarkMode = useColorScheme() === 'dark'
  const [currentRoute, setCurrentRoute] = useState<Route>('landing')
  const [currentTab, setCurrentTab] = useState<Tab>('home')

  const renderAppContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <AppHome
            onNavigateToCall={() => setCurrentRoute('call')}
            onNavigateToAlerts={() => setCurrentTab('family')}
          />
        )
      case 'check':
        return <TextChecker />
      case 'family':
        return <Family />
      default:
        return null
    }
  }

  const renderMainContent = () => {
    switch (currentRoute) {
      case 'landing':
        return <Landing onOpenApp={() => setCurrentRoute('app')} />
      case 'call':
        return <CallDemo onBackToHome={() => setCurrentRoute('app')} />
      case 'app':
        return (
          <View style={styles.appWrapper}>
            {/* Screen Content */}
            <View style={styles.screenContent}>{renderAppContent()}</View>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBar}>
              {[
                {
                  id: 'home' as const,
                  label: 'Home',
                  icon: '🏠',
                },
                {
                  id: 'check' as const,
                  label: 'Check',
                  icon: '💬',
                },
                {
                  id: 'family' as const,
                  label: 'Family',
                  icon: '👨‍👩‍👧',
                },
              ].map((tab) => {
                const isActive = currentTab === tab.id
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setCurrentTab(tab.id)}
                    style={styles.tabBtn}
                  >
                    <Text
                      style={[
                        styles.tabIcon,
                        isActive ? styles.tabIconActive : styles.tabIconInactive,
                      ]}
                    >
                      {tab.icon}
                    </Text>
                    <Text
                      style={[
                        styles.tabLabel,
                        isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1E" />
      <View style={styles.container}>{renderMainContent()}</View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  appWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  screenContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E1529',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    paddingVertical: 8,
    paddingBottom: 24, // Respect bottom safe area padding roughly
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabIconInactive: {
    opacity: 0.4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#2E5CE8',
  },
  tabLabelInactive: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
})

export default App
