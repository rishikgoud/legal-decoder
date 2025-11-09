
'use client';

import { useState, useEffect, useRef } from 'react';
import GLOBE from 'vanta/dist/vanta.globe.min.js';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

const VantaBackground = () => {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!vantaEffect && !isMobile) {
      setVantaEffect(
        GLOBE({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 'hsl(var(--primary))',
          color2: 'hsl(var(--accent))',
          backgroundColor: 'hsl(var(--background))',
          size: 0.8,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect, isMobile]);

  if (isMobile) {
     return <div className="absolute inset-0 bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] -z-10 h-full w-full" />;
  }

  return <div ref={vantaRef} className="absolute inset-0 -z-10 h-full w-full" />;
};

export default VantaBackground;

    
