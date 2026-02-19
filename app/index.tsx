import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CardStack } from '@/components/CardStack';
import { AI_PROVIDERS } from '@/constants/providers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#0A0A0F', '#0F0F1A', '#0A0A0F']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons name="layers" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.appName}>MultiChat AI</Text>
              <Text style={styles.appTagline}>
                {AI_PROVIDERS.length} assistants · Side by side
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            activeOpacity={0.7}
            onPress={() => router.push('/compare')}
          >
            <Ionicons name="git-compare-outline" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Card Stack */}
        <View style={styles.content}>
          <CardStack />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  appTagline: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 1,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
  },
});
