import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, RefreshCw, ChevronRight, HardDrive } from 'lucide-react-native';
import * as Updates from 'expo-updates';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an analytics provider here if available
    console.error('ErrorBoundary captured a crash:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRestart = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Updates.reloadAsync();
      } else {
        window.location.reload();
      }
    } catch (e) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  render() {
    if (this.state.hasError) {
      const colors = this.props.colors || {
        bgPrimary: '#0a0a0a',
        textPrimary: '#ffffff',
        textMuted: '#9ca3af',
        textDisabled: '#4b5563',
        bgCard: '#171717',
        border: '#262626',
        primary: '#6366f1',
        secondary: '#818cf8'
      };
      
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
          <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
            
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <AlertCircle color="#ef4444" size={48} />
              </View>
              <Text style={{ fontSize: 28, fontWeight: '800', color: colors?.textPrimary || '#fff', textAlign: 'center', fontFamily: 'Space Grotesk' }}>
                Oops! Something went wrong.
              </Text>
              <Text style={{ fontSize: 16, color: colors?.textMuted || '#9ca3af', textAlign: 'center', marginTop: 12, fontFamily: 'Inter', lineHeight: 24 }}>
                The application encountered an unexpected error. Don&apos;t worry, your data is safe.
              </Text>
            </View>

            {/* Error Details (Scrollable) */}
            <View style={{ backgroundColor: colors?.bgCard || '#111', borderRadius: 16, padding: 16, marginBottom: 32, borderWidth: 1, borderColor: colors?.border || '#333' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <HardDrive size={14} color={colors?.secondary || '#6366f1'} />
                <Text style={{ fontSize: 10, fontWeight: '800', color: colors?.secondary || '#6366f1', textTransform: 'uppercase', letterSpacing: 2 }}>
                  Diagnostic Info
                </Text>
              </View>
              <ScrollView style={{ maxHeight: 120 }}>
                <Text style={{ color: '#ef4444', fontSize: 12, fontFamily: 'monospace', fontWeight: '700' }}>
                   {this.state.error?.toString()}
                </Text>
                <Text style={{ color: colors?.textDisabled || '#4b5563', fontSize: 10, fontFamily: 'monospace', marginTop: 8 }}>
                   {JSON.stringify(this.state.errorInfo?.componentStack)}
                </Text>
              </ScrollView>
            </View>

            {/* Actions */}
            <TouchableOpacity 
              onPress={this.handleRestart}
              activeOpacity={0.8}
              style={{ 
                backgroundColor: colors?.primary || '#6366f1', 
                height: 56, 
                borderRadius: 14, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 12,
                shadowColor: colors?.primary || '#6366f1',
                shadowOpacity: 0.3,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 4 }
              }}
            >
              <RefreshCw size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: 1 }}>
                Restart Application
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => this.setState({ hasError: false })}
              style={{ marginTop: 16, alignItems: 'center', padding: 8 }}
            >
              <Text style={{ color: colors?.textDisabled || '#6b7280', fontSize: 13, fontFamily: 'Inter' }}>
                Return to previous screen
              </Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
