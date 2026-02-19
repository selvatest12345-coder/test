import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIProvider } from '@/types';

interface ChatInputProps {
  provider: AIProvider;
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ provider, onSend, isLoading, placeholder }: ChatInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    Keyboard.dismiss();
  };

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, { borderColor: `${provider.primaryColor}40` }]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder ?? `Message ${provider.name}...`}
          placeholderTextColor="rgba(255,255,255,0.3)"
          multiline
          maxLength={2000}
          returnKeyType="default"
          blurOnSubmit={false}
          onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend ? provider.primaryColor : 'rgba(255,255,255,0.08)',
            },
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={provider.primaryColor} />
          ) : (
            <Ionicons
              name="arrow-up"
              size={18}
              color={canSend ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 4 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 6 : 4,
    paddingBottom: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 0,
  },
});
