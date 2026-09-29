'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  LayoutDashboard,
  Plus,
  History,
  TrendingUp,
  BarChart2,
  Info,
  Play,
  Settings,
  Zap,
  Activity,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/incidents/new', label: 'New Incident', icon: Plus, highlight: true },
  { href: '/incidents', label: 'Incident History', icon: History },
  { href: '/memory', label: 'Hindsight Memory', icon: Brain, badge: 'MEMORY' },
  { href: '/timeline', label: 'Learning Timeline', icon: TrendingUp },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/how-it-works', label: 'How It Works', icon: Info },
  { href: '/demo', label: 'Demo Mode', icon: Play, special: true },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-primary leading-tight">IncidentMind AI</span>
          <span className="text-xs text-text-muted leading-tight">AI² Platform</span>
        </div>
        <span className="ml-auto text-xs bg-accent/20 text-accent border border-accent/30 rounded px-1.5 py-0.5 font-mono font-bold">
          AI²
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/incidents');
          const isIncidentsActive = item.href === '/incidents' && pathname === '/incidents';

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                (isActive || isIncidentsActive)
                  ? 'bg-primary/20 text-primary-bright border border-primary/30'
                  : item.special
                  ? 'text-accent hover:bg-accent/10 hover:text-accent border border-transparent hover:border-accent/20'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary border border-transparent'
              )}
            >
              <Icon className={cn(
                'w-4 h-4 flex-shrink-0',
                (isActive || isIncidentsActive) ? 'text-primary-bright' : item.special ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
              )} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded px-1 py-0.5 font-mono font-bold tracking-wider">
                  {item.badge}
                </span>
              )}
              {item.highlight && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {item.special && !isActive && (
                <Play className="w-3 h-3 text-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status */}
      <div className="px-4 py-4 border-t border-border space-y-3">
        {/* Hindsight Status */}
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-text-muted">Hindsight Memory</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Live</span>
          </span>
        </div>
        {/* Mode Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-text-secondary">128 Memories Stored</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border text-text-secondary"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-full w-60 bg-surface border-r border-border z-50 transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <button
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-surface border-r border-border z-30',
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
