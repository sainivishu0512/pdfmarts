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
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  client = 'ca-pub-2050955694853570',
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !pushedRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      // Ignore adsbygoogle push errors (e.g. adblocker active)
    }
  }, []);

  return (
    <div ref={adRef} className={`w-full overflow-hidden text-center my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client={client}
        data-ad-slot={slot || ''}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
