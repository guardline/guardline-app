import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Pages
import SetupContact from './pages/SetupContact';
import SetupPermissions from './pages/SetupPermissions';
import AppHome from './pages/AppHome';
import TextChecker from './pages/TextChecker';
import Family from './pages/Family';
import CallDemo from './pages/CallDemo';
import CallMonitor from './components/CallMonitor';
import {
  loadNotifyContact,
  getSettings,
  type NotifyContact,
} from './lib/store';

type Route = 'app' | 'call';
type Tab = 'home' | 'check' | 'family';
type OnboardingPhase = 'contact' | 'permissions' | 'done';

function App() {
  const [booting, setBooting] = useState(true);
  const [notifyContact, setNotifyContactState] = useState<NotifyContact | null>(
    null,
  );
  const [onboardingPhase, setOnboardingPhase] =
    useState<OnboardingPhase>('contact');
  const [settings, setSettings] = useState(getSettings());
  const [currentRoute, setCurrentRoute] = useState<Route>('app');
  const [currentTab, setCurrentTab] = useState<Tab>('home');

  useEffect(() => {
    loadNotifyContact()
      .then(setNotifyContactState)
      .finally(() => setBooting(false));
  }, []);

  const handleNotifyContactSaved = (contact: NotifyContact) => {
    setNotifyContactState(contact);
    setOnboardingPhase('permissions');
  };

  const handlePermissionsComplete = () => {
    setOnboardingPhase('done');
  };

  const handleSettingsChange = (s: typeof settings) => {
    setSettings(s);
  };

  if (!notifyContact) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0A0F1E" />
        <SetupContact onComplete={handleNotifyContactSaved} />
      </SafeAreaProvider>
    );
  }

  if (onboardingPhase === 'permissions') {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0A0F1E" />
        <SetupPermissions onComplete={handlePermissionsComplete} />
      </SafeAreaProvider>
    );
  }

  const renderAppContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <AppHome
            onNavigateToCall={() => setCurrentRoute('call')}
            onNavigateToAlerts={() => setCurrentTab('family')}
          />
        );
      case 'check':
        return <TextChecker />;
      case 'family':
        return (
          <Family
            notifyContact={notifyContact}
            onNotifyContactChange={handleNotifyContactSaved}
            onSettingsChange={handleSettingsChange}
          />
        );
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (currentRoute) {
      case 'call':
        return <CallDemo onBackToHome={() => setCurrentRoute('app')} />;
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
              ].map(tab => {
                const isActive = currentTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setCurrentTab(tab.id)}
                    style={styles.tabBtn}
                  >
                    <Text
                      style={[
                        styles.tabIcon,
                        isActive
                          ? styles.tabIconActive
                          : styles.tabIconInactive,
                      ]}
                    >
                      {tab.icon}
                    </Text>
                    <Text
                      style={[
                        styles.tabLabel,
                        isActive
                          ? styles.tabLabelActive
                          : styles.tabLabelInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1E" />
      <View style={styles.container}>
        {renderMainContent()}
        <CallMonitor showListeningIndicator={settings.showListeningIndicator} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    backgroundColor: '#0A0F1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
});

export default App;
