
export const MOBILE_CONSTANTS = {
  BOTTOM_NAV_HEIGHT: 80, // Height of bottom navigation
  SAFE_AREA_BOTTOM: 34, // iPhone home indicator
  SCROLL_PADDING: 20, // Additional padding for comfortable scrolling
  PAGE_PADDING_BOTTOM: 100, // Final bottom padding
  HEADER_HEIGHT: 64, // Standard header height
  MODAL_PADDING: 16, // Padding for modal content
} as const;

export const getMobilePadding = (hasBottomNav: boolean = true) => {
  return hasBottomNav ? MOBILE_CONSTANTS.PAGE_PADDING_BOTTOM : MOBILE_CONSTANTS.SCROLL_PADDING;
};

export const isMobileDevice = () => {
  return window.innerWidth < 768;
};

export const getSafeAreaBottom = () => {
  // Check if device supports safe area (iOS)
  const supportsEnv = CSS.supports('padding-bottom: env(safe-area-inset-bottom)');
  return supportsEnv ? 'env(safe-area-inset-bottom)' : '0px';
};
