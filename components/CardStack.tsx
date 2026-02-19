import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  AI_PROVIDERS,
  CARD_PEEK_HEIGHT,
  CARD_SCALE_DECREMENT,
  MAX_VISIBLE_STACK,
} from '@/constants/providers';
import { ChatCard, CARD_WIDTH, CARD_HEIGHT } from './ChatCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SWIPE_UP_THRESHOLD = -CARD_HEIGHT * 0.22;
const SWIPE_VELOCITY_THRESHOLD = -600;
const SPRING_CONFIG = { damping: 22, stiffness: 220, mass: 0.85 };

// Subtle rotation angles for each stack position (playing card fan feel)
const STACK_ROTATIONS = [0, 1.8, -1.2, 2.4];

export function CardStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateY = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % AI_PROVIDERS.length);
    translateY.value = 0;
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + AI_PROVIDERS.length) % AI_PROVIDERS.length);
    translateY.value = 0;
  }, []);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      // Allow swipe up freely, add slight resistance going down
      translateY.value = event.translationY < 0
        ? event.translationY
        : event.translationY * 0.15;
    },
    onEnd: (event) => {
      const dismissed =
        event.translationY < SWIPE_UP_THRESHOLD ||
        event.velocityY < SWIPE_VELOCITY_THRESHOLD;

      if (dismissed) {
        runOnJS(triggerHaptic)();
        translateY.value = withTiming(-SCREEN_HEIGHT * 1.3, { duration: 300 }, () => {
          runOnJS(goNext)();
        });
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    },
  });

  // Active card animated style — follows gesture
  const activeCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateY.value,
      [-300, 0, 300],
      [-5, 0, 5],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  // We only render up to MAX_VISIBLE_STACK behind-cards
  const visibleSlots = Math.min(MAX_VISIBLE_STACK - 1, AI_PROVIDERS.length - 1);
  const behindIndices = Array.from({ length: visibleSlots }, (_, i) => i + 1);

  const nextIndex = (activeIndex + 1) % AI_PROVIDERS.length;
  const nextProvider = AI_PROVIDERS[nextIndex];

  return (
    <View style={styles.container}>
      {/* Indicator dots */}
      <View style={styles.dotsRow}>
        {AI_PROVIDERS.map((p, i) => (
          <View
            key={p.id}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? p.primaryColor : 'rgba(255,255,255,0.2)',
                width: i === activeIndex ? 22 : 6,
              },
            ]}
          />
        ))}
      </View>

      {/* Stack area */}
      <View style={styles.stack}>
        {/* Render behind-cards from back to front (higher slot = further back) */}
        {[...behindIndices].reverse().map((slot) => (
          <BehindCard
            key={`behind-${slot}`}
            providerIndex={(activeIndex + slot) % AI_PROVIDERS.length}
            slot={slot}
            translateY={translateY}
          />
        ))}

        {/* Active card on top, wrapped in gesture handler */}
        <PanGestureHandler
          onGestureEvent={gestureHandler}
          failOffsetX={[-25, 25]}
          activeOffsetY={[-8, 8]}
        >
          <Animated.View style={[styles.cardAbsolute, activeCardStyle]}>
            <ChatCard
              provider={AI_PROVIDERS[activeIndex]}
              isActive={true}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Bottom nav bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => { triggerHaptic(); goPrev(); }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={15} color="rgba(255,255,255,0.45)" />
          <Text style={styles.navBtnText}>Prev</Text>
        </TouchableOpacity>

        <View style={styles.swipeHint}>
          <Ionicons name="chevron-up" size={13} color="rgba(255,255,255,0.3)" />
          <Text style={styles.swipeHintText}>
            Swipe up ·{' '}
            <Text style={[styles.swipeHintAccent, { color: nextProvider.accentColor }]}>
              {nextProvider.name}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => { triggerHaptic(); goNext(); }}
          activeOpacity={0.7}
        >
          <Text style={styles.navBtnText}>Next</Text>
          <Ionicons name="chevron-forward" size={15} color="rgba(255,255,255,0.45)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Behind-card component ────────────────────────────────────────────────────

interface BehindCardProps {
  providerIndex: number;
  slot: number;
  translateY: SharedValue<number>;
}

function BehindCard({ providerIndex, slot, translateY }: BehindCardProps) {
  const provider = AI_PROVIDERS[providerIndex];

  const animStyle = useAnimatedStyle(() => {
    const scaleBase = 1 - slot * CARD_SCALE_DECREMENT;
    const peekBase = slot * CARD_PEEK_HEIGHT;

    const progress = interpolate(
      translateY.value,
      [SWIPE_UP_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    const nextScale = 1 - (slot - 1) * CARD_SCALE_DECREMENT;
    const nextPeek = (slot - 1) * CARD_PEEK_HEIGHT;

    const scale = interpolate(progress, [0, 1], [scaleBase, nextScale]);
    const peekY = interpolate(progress, [0, 1], [peekBase, nextPeek]);
    const rotation = STACK_ROTATIONS[slot % STACK_ROTATIONS.length] ?? 0;

    return {
      transform: [
        { scale },
        { translateY: peekY },
        { rotate: `${rotation}deg` },
      ],
      opacity: interpolate(slot, [1, MAX_VISIBLE_STACK], [1, 0.75]),
    };
  });

  return (
    <Animated.View style={[styles.cardAbsolute, animStyle, { zIndex: 10 - slot }]}>
      <ChatCard provider={provider} isActive={false} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
    height: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  stack: {
    width: CARD_WIDTH,
    // Extra height to accommodate peeking cards behind
    height: CARD_HEIGHT + CARD_PEEK_HEIGHT * MAX_VISIBLE_STACK,
    alignItems: 'center',
  },
  cardAbsolute: {
    position: 'absolute',
    top: 0,
    width: CARD_WIDTH,
    zIndex: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: CARD_WIDTH,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  navBtnText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '500',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
  },
  swipeHintAccent: {
    fontWeight: '600',
    fontSize: 12,
  },
});
