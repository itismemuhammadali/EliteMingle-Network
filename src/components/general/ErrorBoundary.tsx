import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize from '../../utility/FontSize';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Unhandled React Error captured by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. Please tap below to reload the screen.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleReset}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UtilityMethods.wp(6),
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: FontSize.VALUE(22),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.VALUE(14),
    lineHeight: FontSize.VALUE(20),
    color: Colors.textGrey,
    textAlign: 'center',
    marginBottom: UtilityMethods.hp(3),
  },
  retryButton: {
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(8),
    borderRadius: UtilityMethods.wp(6),
  },
  retryButtonText: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
