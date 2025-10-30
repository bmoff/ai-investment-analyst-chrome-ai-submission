'use client';

import { useState } from 'react';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { 
  Star, 
  Search, 
  Building2, 
  ExternalLink,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { mockCompanies } from '@/lib/workspace-data/mockCompanies';
import { AppLayout } from '@/shared/components/AppLayout';

export default function CompaniesPage() {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(true); // Default to showing favorites only


  // Filter companies based on search and favorites filter
  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.sector.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showFavoritesOnly) {
      return matchesSearch && isFavorite(company.ticker);
    }
    
    return matchesSearch;
  });

  // Get favorite companies count for display
  const favoriteCompaniesCount = mockCompanies.filter(company => isFavorite(company.ticker)).length;

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Companies</h1>
            <p className="text-muted-foreground">
              {showFavoritesOnly 
                ? `${favoriteCompaniesCount} favorite companies`
                : `${filteredCompanies.length} companies available`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Heart className="w-4 h-4 mr-2" />
              {showFavoritesOnly ? 'Show All' : 'Favorites Only'}
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search companies, tickers, or sectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {showFavoritesOnly ? 'No favorite companies' : 'No companies found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {showFavoritesOnly 
                ? 'Add companies to your favorites to see them here'
                : 'Try adjusting your search terms'
              }
            </p>
            {showFavoritesOnly && (
              <Button onClick={() => setShowFavoritesOnly(false)}>
                Browse All Companies
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <Card key={company.ticker} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {company.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {company.ticker}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {company.sector}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => toggleFavorite(company.ticker)}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFavorite(company.ticker) 
                            ? 'fill-yellow-500 text-yellow-500' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span>{company.sector}</span>
                    </div>
                    
                    <Link href={`/workspace/${company.ticker}`}>
                      <Button size="sm" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Open Workspace
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}
