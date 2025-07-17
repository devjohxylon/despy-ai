import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-50 flex items-center justify-center">
      <motion.div
        className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
} 