
export const MOBILE_CONSTANTS = {
  BOTTOM_NAV_HEIGHT: 68, // Reduced height of bottom navigation
  SAFE_AREA_BOTTOM: 34, // iPhone home indicator
  SCROLL_PADDING: 12, // Reduced padding for comfortable scrolling
  PAGE_PADDING_BOTTOM: 85, // Reduced final bottom padding
  HEADER_HEIGHT: 56, // Reduced standard header height
  MODAL_PADDING: 12, // Reduced padding for modal content
  COMPACT_SPACING: 8, // Very compact spacing for 360px screens
  FORM_ITEM_HEIGHT: 48, // Standard form item height
  BUTTON_HEIGHT: 44, // Standard button height
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
