
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MOBILE_CONSTANTS } from '@/utils/mobile-constants';
import { cn } from '@/lib/utils';

interface MobilePageLayoutProps {
  children: React.ReactNode;
  hasBottomNav?: boolean;
  fullScreen?: boolean;
  className?: string;
  enableScroll?: boolean;
}

const MobilePageLayout: React.FC<MobilePageLayoutProps> = ({
  children,
  hasBottomNav = true,
  fullScreen = false,
  className = '',
  enableScroll = true,
}) => {
  const isMobile = useIsMobile();

  const getContainerClasses = () => {
    const baseClasses = 'w-full';
    
    if (fullScreen) {
      return cn(baseClasses, 'h-screen overflow-hidden', className);
    }

    const heightClass = 'min-h-screen';
    const paddingClass = hasBottomNav ? 'pb-mobile-safe' : 'pb-4';
    const scrollClass = enableScroll ? 'mobile-scroll-smooth' : '';
    
    return cn(
      baseClasses,
      heightClass,
      paddingClass,
      scrollClass,
      'mobile-tap-highlight-transparent',
      className
    );
  };

  return (
    <div className={getContainerClasses()}>
      {children}
    </div>
  );
};

export default MobilePageLayout;
