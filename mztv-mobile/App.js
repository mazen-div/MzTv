import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  BackHandler,
  Platform 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

// ========================================================
// CONFIGURATION: POINT THIS TO YOUR DEPLOYED BACKEND SERVER
// ========================================================
// Use 'http://10.0.2.2:3000' for Android Emulator
// Use 'http://192.168.X.X:3000' for local Wi-Fi real device testing
// Use 'https://your-app.onrender.com' for production hosting
const BACKEND_URL = 'http://10.0.2.2:3000';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [key, setKey] = useState(0); // Used to force reload/retry the WebView
  const webViewRef = useRef(null);

  // Handle Android hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true; // Prevent default behavior (exiting app)
      }
      return false; // Allow default behavior
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }

    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }
    };
  }, [canGoBack]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setKey(prev => prev + 1); // Triggers WebView re-render
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      
      {!hasError ? (
        <WebView
          key={key}
          ref={webViewRef}
          source={{ uri: BACKEND_URL }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={['*']}
          mixedContentMode="always"
          
          // User Agent spoofing for mobile web browsers to enable full player capability
          userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
          
          // Track loading state
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          
          // Handle navigation state (for hardware back button support)
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          
          // Error handling
          onError={() => setHasError(true)}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.statusCode >= 400) {
              // Only fail on critical HTML loading status codes
              if (nativeEvent.url === BACKEND_URL || nativeEvent.url === `${BACKEND_URL}/`) {
                setHasError(true);
              }
            }
          }}
        />
      ) : null}

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#66fcf1" />
          <Text style={styles.loadingText}>Loading MzTv Premium...</Text>
        </View>
      )}

      {/* Offline/Error Screen Fallback */}
      {hasError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorLogo}>MzTv</Text>
            <Text style={styles.errorTitle}>Connection Timeout</Text>
            <Text style={styles.errorMessage}>
              Could not connect to the MzTv backend server. Please verify that your backend server is running and accessible.
            </Text>
            <Text style={styles.errorUrl}>Target URL: {BACKEND_URL}</Text>
            
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0b0c10',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0c10',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 15,
    color: '#c5c6c7',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0b0c10',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#1f2833',
    borderRadius: 16,
    padding: 30,
    width: '80%',
    maxWidth: 500,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#45a29e',
    shadowColor: '#66fcf1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  errorLogo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#66fcf1',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  errorMessage: {
    color: '#c5c6c7',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  errorUrl: {
    color: '#45a29e',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#0b0c10',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 25,
    width: '100%',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#66fcf1',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#0b0c10',
    fontSize: 15,
    fontWeight: '700',
  },
});
