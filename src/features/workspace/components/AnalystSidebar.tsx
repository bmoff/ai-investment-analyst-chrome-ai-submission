'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Building2, CheckSquare, Star, TrendingUp, PanelLeftClose, PanelLeft } from 'lucide-react';
// import { Badge } from '@/shared/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mockCompanies } from '@/lib/workspace-data/mockCompanies';
import { useFavorites } from '@/shared/hooks/useFavorites';

interface AnalystSidebarProps {
  currentTicker?: string;
  onViewChange?: (view: 'company' | 'tasks' | 'companies') => void;
  currentView?: 'company' | 'tasks' | 'companies';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AnalystSidebar({ 
  currentTicker, 
  onViewChange, 
  currentView = 'company', 
  isCollapsed = false, 
  onToggleCollapse
}: AnalystSidebarProps) {
  const [companiesExpanded, setCompaniesExpanded] = useState(true);
  const pathname = usePathname();
  const { favorites, isFavorite, isLoaded, toggleFavorite } = useFavorites();

  // Get all favorites and match with company info where available
  const favoriteCompanies = favorites.map(favorite => {
    const company = mockCompanies.find(c => c.ticker.toLowerCase() === favorite.ticker.toLowerCase());
    return {
      ticker: favorite.ticker,
      name: company?.name || favorite.ticker, // Use company name if available, otherwise just ticker
      isInMockData: !!company
    };
  });

  const sidebarWidth = isCollapsed ? 64 : 256;

  return (
    <div 
      className="flex-shrink-0 border-r border-border bg-background transition-all duration-200"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold">Analyst Workspace</h2>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-muted rounded"
            >
              {isCollapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isCollapsed && (
            <div className="space-y-6">
              {/* Main Navigation */}
              <div className="space-y-2">
                {/* Companies Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setCompaniesExpanded(!companiesExpanded)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      pathname === '/companies' || pathname.startsWith('/workspace/')
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Companies</span>
                    {companiesExpanded ? (
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                  
                  {companiesExpanded && (
                    <div className="ml-6 space-y-1">
                      {/* Browse All Companies */}
                      <Link
                        href="/companies"
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === '/companies'
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          <span>Browse All Companies</span>
                        </div>
                      </Link>
                      
                      {/* Favorites */}
                      {isLoaded && favoriteCompanies.length > 0 && (
                        <>
                          <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                            Favorites ({favorites.length})
                          </div>
                          {favoriteCompanies.map((company) => (
                            <div
                              key={company.ticker}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                currentTicker?.toLowerCase() === company.ticker.toLowerCase()
                                  ? 'bg-muted text-foreground'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                              }`}
                            >
                              <Link
                                href={`/workspace/${company.ticker.toLowerCase()}`}
                                className="flex-1 flex items-center gap-2 min-w-0"
                              >
                                <TrendingUp className="w-3 h-3 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium">{company.ticker}</div>
                                  {company.name !== company.ticker && (
                                    <div className="text-xs text-muted-foreground">
                                      {company.name}
                                    </div>
                                  )}
                                </div>
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(company.ticker);
                                }}
                                className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
                                title="Remove from favorites"
                              >
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                      {isLoaded && favorites.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          No favorites yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Link
                  href="/tasks"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    pathname === '/tasks'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks</span>
                </Link>
              </div>

            </div>
          )}

          {/* Collapsed view */}
          {isCollapsed && (
            <div className="space-y-2">
              <button
                onClick={() => onViewChange?.('company')}
                className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                  currentView === 'company'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                title="Company"
              >
                <Building2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onViewChange?.('tasks')}
                className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                  currentView === 'tasks'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                title="Tasks"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
