
'use client';

import Lottie from "lottie-react";
import animationData from "@/lib/ai-lottie.json"; // Using a placeholder Lottie JSON

const LottieAnimation = () => {
  return <Lottie animationData={animationData} loop={true} />;
};

export default LottieAnimation;
