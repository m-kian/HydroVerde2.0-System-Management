import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../lib/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function SplashScreen() {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const spinnerOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    
    setTimeout(() => {
      spinnerOpacity.value = withTiming(1, { duration: 500 });
    }, 600);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: spinnerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <AnimatedView style={[styles.mark, logoAnimatedStyle]}>
        <Ionicons name="water" size={48} color="#fff" />
      </AnimatedView>
      <AnimatedView style={[styles.spinner, spinnerAnimatedStyle]}>
        <ActivityIndicator size="large" color={colors.leaf} />
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.leaf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 24,
  },
});
