import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message, AIProvider } from '@/types';

interface MessageBubbleProps {
  message: Message;
  provider: AIProvider;
}

export function MessageBubble({ message, provider }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: provider.primaryColor }]}>
          <Text style={styles.avatarText}>{provider.name[0]}</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble]
            : [styles.assistantBubble, { backgroundColor: 'rgba(255,255,255,0.08)' }],
        ]}
      >
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
          {message.isStreaming && (
            <Text style={[styles.cursor, { color: provider.accentColor }]}>▊</Text>
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#EFEFEF',
  },
  cursor: {
    fontSize: 14,
    opacity: 0.8,
  },
});
