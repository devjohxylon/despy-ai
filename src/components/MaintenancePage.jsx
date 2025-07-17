import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Wrench size={48} className="text-blue-500" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Under Maintenance</h1>
          <p className="text-gray-400 mb-8">
            We're currently updating our systems to serve you better. 
            We'll be back shortly with new improvements!
          </p>
          
          <div className="flex justify-center gap-6">
            <a
              href="https://twitter.com/DeSpyAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://discord.gg/jNTHCjStaS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Discord
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 