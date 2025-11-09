
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PreloaderProps = {
  onComplete: () => void;
};

const Preloader = ({ onComplete }: PreloaderProps) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev < 100) {
          return prev + 1;
        }
        clearInterval(interval);
        return 100;
      });
    }, 30); // Controls the speed of the counter

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (percentage === 100) {
      setTimeout(onComplete, 500); // Wait a bit after 100%
    }
  }, [percentage, onComplete]);

  const formatPercentage = (num: number) => {
    return num.toString().padStart(3, '0') + '%';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      >
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center text-white"
        >
            <p className="text-lg">Legal Decoder</p>
            <p className="text-2xl mt-4">PROCESSING COMPLEX DATA</p>
        </motion.div>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 text-7xl font-bold text-white"
        >
            {formatPercentage(percentage)}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;
