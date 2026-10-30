import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import SplashScreen from '../components/SplashScreen';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
