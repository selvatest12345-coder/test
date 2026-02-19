import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AIProvider } from '@/types';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CARD_WIDTH = SCREEN_WIDTH - 32;
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.76;

interface ChatCardProps {
  provider: AIProvider;
  isActive: boolean;
  onClear?: () => void;
}

export function ChatCard({ provider, isActive, onClear }: ChatCardProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useChat(provider.id);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleClear = () => {
    clearMessages();
    onClear?.();
  };

  return (
    <View style={styles.card}>
      {/* Card background gradient */}
      <LinearGradient
        colors={provider.gradientColors as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative circles */}
      <View style={[styles.decorCircle1, { backgroundColor: `${provider.accentColor}18` }]} />
      <View style={[styles.decorCircle2, { backgroundColor: `${provider.accentColor}10` }]} />

      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name={provider.icon as any} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.providerSubtitle}>{provider.subtitle}</Text>
              {provider.badge && (
                <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.badgeText}>{provider.badge}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={[styles.statusDot, { backgroundColor: '#4ADE80' }]} />
          {messages.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />

      {/* Messages Area */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={isActive}
      >
        {messages.length === 0 ? (
          <EmptyState provider={provider} />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} provider={provider} />
          ))
        )}
      </ScrollView>

      {/* Input */}
      {isActive && (
        <ChatInput provider={provider} onSend={sendMessage} isLoading={isLoading} />
      )}

      {/* Card corner decoration */}
      <View style={styles.cornerSuitTop}>
        <Text style={styles.cornerSuitText}>✦</Text>
      </View>
      <View style={styles.cornerSuitBottom}>
        <Text style={[styles.cornerSuitText, { transform: [{ rotate: '180deg' }] }]}>✦</Text>
      </View>
    </View>
  );
}

function EmptyState({ provider }: { provider: AIProvider }) {
  const suggestions = [
    'Explain quantum computing simply',
    'Write a creative short story',
    'Help me debug my code',
    'What are your capabilities?',
  ];

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
        <Ionicons name={provider.icon as any} size={36} color="rgba(255,255,255,0.7)" />
      </View>
      <Text style={styles.emptyTitle}>Chat with {provider.name}</Text>
      <Text style={styles.emptySubtitle}>Powered by {provider.subtitle}</Text>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsLabel}>Try asking:</Text>
        {suggestions.map((s, i) => (
          <View key={i} style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    // Card shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  decorCircle1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -60,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: 80,
    left: -40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  providerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  providerSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clearButton: {
    padding: 6,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    minHeight: 360,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginBottom: 28,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 8,
  },
  suggestionsLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  suggestionText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
  cornerSuitTop: {
    position: 'absolute',
    top: 14,
    left: 14,
    opacity: 0.2,
  },
  cornerSuitBottom: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    opacity: 0.2,
  },
  cornerSuitText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
