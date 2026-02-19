import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AI_PROVIDERS } from '@/constants/providers';
import { AIProvider, Message } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_W = (SCREEN_WIDTH - 48) / 2;

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const DEMO: Record<string, string> = {
  chatgpt: "As GPT-4o, I'd approach this by leveraging my broad training across diverse domains to give you a comprehensive, well-reasoned answer.",
  gemini: "From Gemini's perspective, this is a fascinating multimodal challenge. Let me synthesize across text, code, and reasoning to provide the most complete answer.",
  claude: "I'll think about this carefully and systematically. My goal is to give you an accurate, helpful response while being clear about any uncertainty.",
  llama: "As an open model, I approach this transparently. Here's my reasoning based on my training data and architecture.",
  mistral: "Efficiently: here's the direct answer. Mistral prioritizes precision and clarity over verbosity.",
  grok: "Real talk — here's what I actually think, without corporate hedging or unnecessary caveats.",
};

interface CompareCardProps {
  provider: AIProvider;
  response: string | null;
  isLoading: boolean;
}

function CompareCard({ provider, response, isLoading }: CompareCardProps) {
  return (
    <View style={[styles.compareCard]}>
      <LinearGradient
        colors={provider.gradientColors as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.compareCardHeader}>
        <View style={[styles.compareIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name={provider.icon as any} size={14} color="#FFF" />
        </View>
        <Text style={styles.compareCardName}>{provider.name}</Text>
      </View>
      <ScrollView style={styles.compareResponse} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={provider.accentColor} style={{ marginTop: 12 }} />
        ) : response ? (
          <Text style={styles.compareResponseText}>{response}</Text>
        ) : (
          <Text style={styles.compareEmpty}>Ask something to compare</Text>
        )}
      </ScrollView>
    </View>
  );
}

export default function CompareScreen() {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['chatgpt', 'gemini', 'claude', 'llama']);

  const handleCompare = async () => {
    if (!query.trim() || loading) return;
    Keyboard.dismiss();
    setLoading(true);

    const newResponses: Record<string, string | null> = {};
    selectedProviders.forEach((id) => (newResponses[id] = null));
    setResponses(newResponses);

    // Simulate staggered responses
    for (const id of selectedProviders) {
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));
      setResponses((prev) => ({ ...prev, [id]: DEMO[id] ?? 'Response from ' + id }));
    }

    setLoading(false);
  };

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id)
        ? prev.length > 2 ? prev.filter((p) => p !== id) : prev
        : [...prev, id].slice(0, 4)
    );
  };

  const activeProviders = AI_PROVIDERS.filter((p) => selectedProviders.includes(p.id));

  return (
    <LinearGradient colors={['#0A0A0F', '#0F0F1A', '#0A0A0F']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <Text style={styles.title}>Compare Responses</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Provider selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.providerScroll}
          contentContainerStyle={styles.providerScrollContent}
        >
          {AI_PROVIDERS.map((p) => {
            const active = selectedProviders.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.providerChip,
                  active && { backgroundColor: p.primaryColor, borderColor: p.primaryColor },
                ]}
                onPress={() => toggleProvider(p.id)}
                activeOpacity={0.7}
              >
                <Ionicons name={p.icon as any} size={12} color={active ? '#FFF' : 'rgba(255,255,255,0.4)'} />
                <Text style={[styles.providerChipText, active && { color: '#FFF' }]}>{p.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Response grid */}
        <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
          <View style={styles.gridRow}>
            {activeProviders.slice(0, 2).map((p) => (
              <CompareCard
                key={p.id}
                provider={p}
                response={responses[p.id] ?? null}
                isLoading={loading && !(p.id in responses && responses[p.id] !== null)}
              />
            ))}
          </View>
          {activeProviders.length > 2 && (
            <View style={styles.gridRow}>
              {activeProviders.slice(2, 4).map((p) => (
                <CompareCard
                  key={p.id}
                  provider={p}
                  response={responses[p.id] ?? null}
                  isLoading={loading && !(p.id in responses && responses[p.id] !== null)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Query input */}
        <View style={styles.queryContainer}>
          <View style={styles.queryInputWrapper}>
            <TextInput
              style={styles.queryInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Ask all AIs the same question..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              returnKeyType="send"
              onSubmitEditing={handleCompare}
              multiline={false}
            />
            <TouchableOpacity
              style={[styles.compareButton, { opacity: query.trim() && !loading ? 1 : 0.4 }]}
              onPress={handleCompare}
              disabled={!query.trim() || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="git-compare" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  providerScroll: { maxHeight: 44, marginBottom: 8 },
  providerScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  providerChipText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: { flex: 1, paddingHorizontal: 16 },
  gridContent: { gap: 12, paddingBottom: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  compareCard: {
    width: CARD_W,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 14,
  },
  compareCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  compareIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareCardName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  compareResponse: { flex: 1 },
  compareResponseText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 18,
  },
  compareEmpty: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  queryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  queryInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  queryInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    paddingVertical: 6,
  },
  compareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
