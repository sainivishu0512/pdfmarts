import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  responsive?: boolean;
  className?: string;
  client?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export function AdBanner({
  slot: _slot,
  format: _format,
  responsive: _responsive,
  className: _className,
  client: _client,
}: AdBannerProps) {
  // During AdSense review, suppress blank ad box rendering to prevent "Screens without publisher-content" policy flag
  return null;
}
