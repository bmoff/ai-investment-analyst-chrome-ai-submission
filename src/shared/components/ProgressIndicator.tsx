import { motion } from "framer-motion";
// import { Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  message: string;
  subMessage?: string;
  showSkeleton?: boolean;
  className?: string;
}

export const ProgressIndicator = ({ 
  message, 
  subMessage, 
  showSkeleton = true,
  className = ""
}: ProgressIndicatorProps) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`border-t border-border/50 overflow-hidden ${className}`}
    >
      <div className="p-6 bg-background/20 relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" 
             style={{ backgroundSize: '200% 100%' }} />
        
        <div className="space-y-4">
          {/* Loading header */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
            />
            <div className="text-sm text-muted-foreground">
              {message}
            </div>
          </div>
          
          {/* Animated content skeleton */}
          {showSkeleton && (
            <div className="space-y-3">
              <div className="h-3 bg-muted/50 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted/50 rounded animate-pulse w-full" />
              <div className="h-3 bg-muted/50 rounded animate-pulse w-5/6" />
              <div className="h-3 bg-muted/50 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-muted/50 rounded animate-pulse w-4/5" />
            </div>
          )}
          
          {/* Progress indicator */}
          {subMessage && (
            <div className="text-xs text-muted-foreground/70 mt-4">
              {subMessage}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressIndicator;
