'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'collapsed' | 'compact';
  className?: string;
  showText?: boolean;
}

export const Logo = ({ variant = 'default', className, showText = true }: LogoProps) => {
  const isCollapsed = variant === 'collapsed';
  const isCompact = variant === 'compact';

  const logoContent = (
    <div className={cn(
      "flex items-center gap-2 transition-all duration-200",
      isCollapsed && "justify-center",
      isCompact && "gap-1.5",
      className
    )}>
      {/* Logo Icon */}
      <div className={cn(
        "relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent p-1.5",
        isCollapsed && "p-1",
        isCompact && "p-1"
      )}>
        <TrendingUp className={cn(
          "text-primary-foreground",
          isCollapsed ? "h-4 w-4" : isCompact ? "h-4 w-4" : "h-5 w-5"
        )} />
        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent/80" />
      </div>
      
      {/* Logo Text */}
      {showText && !isCollapsed && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold text-foreground tracking-tight",
            isCompact ? "text-sm" : "text-base"
          )}>
            AI Analyst
          </span>
          <span className={cn(
            "text-xs text-muted-foreground -mt-0.5",
            isCompact && "hidden"
          )}>
            Desk
          </span>
        </div>
      )}
    </div>
  );

  // Wrap in Link for navigation to homepage
  return (
    <Link href="/" className="block">
      {logoContent}
    </Link>
  );
};
