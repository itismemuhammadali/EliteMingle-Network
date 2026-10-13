import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { PlusIcon } from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';

interface FABProps {
  onPress: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const FAB_SIZE = UtilityMethods.wp(14);
const BOTTOM_OFFSET =
  Platform.OS === 'ios'
    ? UtilityMethods.hp(8)
    : UtilityMethods.hp(7);

const INITIAL_X = SCREEN_WIDTH - UtilityMethods.wp(5) - FAB_SIZE;
const INITIAL_Y = SCREEN_HEIGHT - BOTTOM_OFFSET - FAB_SIZE - UtilityMethods.hp(10);

export function FAB({ onPress }: FABProps) {
  const pan = useRef(new Animated.ValueXY({ x: INITIAL_X, y: INITIAL_Y }))
    .current;

  const isDragging = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5
        );
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        longPressTimer.current = setTimeout(() => {
          isDragging.current = true;
          pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
          pan.setValue({ x: 0, y: 0 });
        }, 400);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isDragging.current) {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        if (isDragging.current) {
          pan.flattenOffset();
          const finalX = Math.max(
            0,
            Math.min(SCREEN_WIDTH - FAB_SIZE, (pan.x as any)._value),
          );
          const finalY = Math.max(
            0,
            Math.min(SCREEN_HEIGHT - FAB_SIZE - UtilityMethods.hp(10), (pan.y as any)._value),
          );
          pan.setValue({ x: finalX, y: finalY });
          isDragging.current = false;
        } else {
          isDragging.current = false;
          onPress();
        }
      },
      onPanResponderTerminate: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (isDragging.current) {
          pan.flattenOffset();
        }
        isDragging.current = false;
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[styles.fab, { transform: pan.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.fabInner}>
        <PlusIcon size={UtilityMethods.wp(7)} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabInner: {
    flex: 1,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
