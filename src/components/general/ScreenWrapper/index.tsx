import {
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  View,
  Dimensions,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import UtilityMethods from '../../../utility/UtilityMethods';

interface ScreenWrapperProps {
  children: any;
  style?: any;
  model?: boolean;
  req?: boolean;
  ref?: any;
  contentContainerStyle?: any;
  extraScrollHeight?: number;
  enableOnAndroid?: boolean;
  enableResetScrollToCoords?: boolean;
  refreshControl?: any;
  bounces?: boolean;
  keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
  onEndReached?: () => void;
  enableAutomaticScroll?: boolean;
  keyboardOpeningTime?: number | null;
  enableScroll?: boolean;
}

const ScreenWrapper = ({
  children,
  style,
  contentContainerStyle,
  extraScrollHeight,
  enableOnAndroid = true,
  enableResetScrollToCoords = false,
  refreshControl,
  bounces = false,
  keyboardDismissMode = 'none',
  enableAutomaticScroll = true,
  keyboardOpeningTime,
  enableScroll = true,
  onEndReached = () => {},
}: ScreenWrapperProps) => {
  const waitingRef = useRef(false); // flag to prevent repeated calls
  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

    const paddingToBottom = 20; // Trigger 20px before the end

    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      if (!waitingRef.current) {
        waitingRef.current = true;
        onEndReached();

        // Reset waiting after 2 seconds
        setTimeout(() => {
          waitingRef.current = false;
        }, 2000);
      }
    }
  };
  return (
    <KeyboardAwareScrollView
      style={[styles.containerMain, style]}
      bounces={bounces ? bounces : false}
      refreshControl={refreshControl}
      extraScrollHeight={extraScrollHeight}
      scrollEventThrottle={16}
      enableAutomaticScroll={enableAutomaticScroll}
      onScroll={handleScroll}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={keyboardDismissMode}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      enableOnAndroid={enableOnAndroid}
      scrollEnabled={enableScroll}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      enableResetScrollToCoords={enableResetScrollToCoords}
      keyboardOpeningTime={
        keyboardOpeningTime == 0 ? 0 : Number.MAX_SAFE_INTEGER
      }
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerMain: {
    flex: 1,
  },
});

export default ScreenWrapper;
