import { useEffect } from 'react';
import { useCapacitor } from '@/hooks/useCapacitor';

const MobileOptimizations = () => {
  const { isNative, isAndroid, isIOS } = useCapacitor();

  useEffect(() => {
    if (isNative) {
      // Add mobile-specific CSS classes
      document.body.classList.add('mobile-app');
      
      if (isAndroid) {
        document.body.classList.add('android');
      }
      
      if (isIOS) {
        document.body.classList.add('ios');
      }

      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }

      // Prevent pull-to-refresh
      document.body.style.overscrollBehavior = 'none';
      
      // Add safe area padding for iOS
      if (isIOS) {
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      }
    }

    return () => {
      if (isNative) {
        document.body.classList.remove('mobile-app', 'android', 'ios');
      }
    };
  }, [isNative, isAndroid, isIOS]);

  return null;
};

export default MobileOptimizations;