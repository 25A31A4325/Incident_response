'use client';

import { Bell, Search, User, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [connected] = useState(true);

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Title */}
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-text-primary leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-text-muted leading-tight">{subtitle}</p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-border">
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Demo Mode</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-400">Offline</span>
            </>
          )}
        </div>

        {/* Search */}
        <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
          <User className="w-4 h-4 text-text-secondary" />
          <span className="text-sm text-text-secondary">Admin</span>
        </button>
      </div>
    </header>
  );
}
