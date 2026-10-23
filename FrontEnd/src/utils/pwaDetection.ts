/**
 * Platform and PWA Detection Utility
 * Handles reliable detection of iOS (iPhone, iPad, iPadOS), Android, Desktop and Unknown environments.
 * Complies with strict guidelines:
 * - Does not depend solely on navigator.platform
 * - Identifies devices only when confident
 * - Detects standalone/installed state
 * - Checks for non-Safari browsers on iOS
 */

export type PlatformType = 'ios' | 'android' | 'desktop' | 'unknown';
export type IosDeviceType = 'iPhone' | 'iPad' | null;

export interface PlatformInfo {
  platform: PlatformType;
  iosDevice: IosDeviceType;
  isIos: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isSafariOnIos: boolean;
  isStandalone: boolean;
  canPromptDirectly: boolean;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Checks if the current browser window is running as an installed PWA / standalone application
 */
export function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches ||
                            window.matchMedia('(display-mode: fullscreen)').matches ||
                            window.matchMedia('(display-mode: minimal-ui)').matches;

  // iOS Safari standalone flag
  const isIosStandalone = Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);

  // Android TWA / WebView referrer check
  const isAndroidApp = typeof document !== 'undefined' && document.referrer.startsWith('android-app://');

  return isStandaloneMedia || isIosStandalone || isAndroidApp;
}

/**
 * Comprehensive platform detection
 */
export function detectPlatform(): PlatformInfo {
  if (typeof window === 'undefined') {
    return {
      platform: 'unknown',
      iosDevice: null,
      isIos: false,
      isAndroid: false,
      isDesktop: false,
      isSafariOnIos: false,
      isStandalone: false,
      canPromptDirectly: false,
      confidence: 'low'
    };
  }

  const ua = window.navigator.userAgent || '';
  const maxTouchPoints = window.navigator.maxTouchPoints || 0;
  const isStandalone = checkIsStandalone();

  // 1. Detect iOS (iPhone, iPod, iPad, iPadOS with desktop Safari UA)
  const isIPhone = /iPhone|iPod/i.test(ua);
  
  // iPadOS 13+ often reports "Macintosh" with multi-touch points
  const isIPadClassic = /iPad/i.test(ua);
  const isIPadModern = /Macintosh/i.test(ua) && maxTouchPoints > 1 && !/Windows/i.test(ua);
  const isIPad = isIPadClassic || isIPadModern;

  const isIos = isIPhone || isIPad;

  let iosDevice: IosDeviceType = null;
  if (isIPhone) {
    iosDevice = 'iPhone';
  } else if (isIPad) {
    iosDevice = 'iPad';
  }

  // Detect if browser on iOS is Safari vs alternative browser (Chrome CriOS, Firefox FxiOS, Edge EdgiOS, etc.)
  const isNonSafariOnIos = /(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo)/i.test(ua);
  const isSafariOnIos = isIos && !isNonSafariOnIos && /Safari/i.test(ua);

  // 2. Detect Android
  const isAndroid = /Android/i.test(ua);

  // 3. Detect Desktop
  // Exclude touch-tablets or phones that spoof desktop UAs
  const isDesktopWindows = /Windows NT/i.test(ua);
  const isDesktopMac = /Macintosh/i.test(ua) && maxTouchPoints <= 1;
  const isDesktopLinux = /Linux/i.test(ua) && !isAndroid;
  const isDesktopCrOS = /CrOS/i.test(ua);

  const isDesktop = (isDesktopWindows || isDesktopMac || isDesktopLinux || isDesktopCrOS) && !isIos && !isAndroid;

  let platform: PlatformType = 'unknown';
  let confidence: 'high' | 'medium' | 'low' = 'low';

  if (isIos) {
    platform = 'ios';
    confidence = iosDevice ? 'high' : 'medium';
  } else if (isAndroid) {
    platform = 'android';
    confidence = 'high';
  } else if (isDesktop) {
    platform = 'desktop';
    confidence = 'high';
  } else {
    platform = 'unknown';
    confidence = 'low';
  }

  return {
    platform,
    iosDevice,
    isIos,
    isAndroid,
    isDesktop,
    isSafariOnIos,
    isStandalone,
    canPromptDirectly: isAndroid || isDesktop,
    confidence
  };
}
