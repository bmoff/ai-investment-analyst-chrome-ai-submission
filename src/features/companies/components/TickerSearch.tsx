'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { stockValidationService, type StockValidationResult } from "@/features/companies/services/stock-validation-service";

interface TickerSearchProps {
  variant?: 'full' | 'compact';
  placeholder?: string;
  className?: string;
  showQuickButtons?: boolean;
}

export const TickerSearch = ({ 
  variant = 'full', 
  placeholder = "Search by ticker or company name...",
  className = "",
  showQuickButtons = false
}: TickerSearchProps) => {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<StockValidationResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isValidFormat, setIsValidFormat] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<StockValidationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Client-side format validation - only for actual ticker symbols
  const validateTickerFormat = (input: string): boolean => {
    const trimmed = input.trim().toUpperCase();
    // Only consider it a valid ticker format if it's 1-5 uppercase letters
    // and doesn't look like a company name
    const commonCompanyWords = ['INC', 'CORP', 'LTD', 'LLC', 'CO', 'COMPANY', 'TECHNOLOGIES', 'SYSTEMS', 'SOLUTIONS', 'APPLE', 'GOOGLE', 'MICROSOFT', 'TESLA', 'AMAZON', 'META', 'NETFLIX'];
    return /^[A-Z]{1,5}$/.test(trimmed) && !commonCompanyWords.includes(trimmed);
  };

  // Search for companies by name or ticker
  const searchCompanies = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await stockValidationService.searchCompanies(query);
      setSearchSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleTickerChange = (value: string) => {
    setTicker(value);
    setSearchError(null);
    setValidationResult(null);
    
    const isValid = validateTickerFormat(value);
    setIsValidFormat(isValid);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If it's a valid ticker format, don't search
    if (isValid) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Search for companies if it's not a valid ticker format
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchCompanies(value);
      }, 300); // 300ms debounce
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: StockValidationResult) => {
    setTicker(suggestion.ticker);
    setIsValidFormat(true);
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSearchError(null);
    setValidationResult(null);
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTicker = ticker.trim();
    
    if (!trimmedTicker) return;

    setIsValidating(true);
    setSearchError(null);
    setValidationResult(null);

    try {
      // Check format synchronously to avoid race conditions
      const isCurrentlyValidFormat = validateTickerFormat(trimmedTicker);
      
      // If it's a valid ticker format, validate it directly
      if (isCurrentlyValidFormat) {
        const result = await stockValidationService.validateTicker(trimmedTicker);
        setValidationResult(result);

        if (result.isValid) {
          router.push(`/workspace/${result.ticker}`);
        } else {
          setSearchError(result.error || 'Invalid ticker symbol');
        }
      } else {
        // If it's not a valid ticker format, try to search for companies
        const results = await stockValidationService.searchCompanies(trimmedTicker);
        
        if (results.length > 0) {
          // If we found results, use the first one
          const firstResult = results[0];
          if (firstResult.isValid) {
            router.push(`/workspace/${firstResult.ticker}`);
          } else {
            setSearchError('No valid company found. Please try a different search term.');
          }
        } else {
          setSearchError('No companies found. Please try a different search term.');
        }
      }
    } catch (error) {
      console.error('Search validation error:', error);
      setSearchError('Unable to search. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuickSearch = async (tickerSymbol: string) => {
    setTicker(tickerSymbol);
    setIsValidFormat(true); // Quick search buttons are pre-validated
    setIsValidating(true);
    setSearchError(null);
    setValidationResult(null);

    try {
      const result = await stockValidationService.validateTicker(tickerSymbol);
      setValidationResult(result);

      if (result.isValid) {
        router.push(`/workspace/${result.ticker}`);
      } else {
        setSearchError(result.error || 'Invalid ticker symbol');
      }
    } catch (error) {
      console.error('Quick search validation error:', error);
      setSearchError('Unable to validate ticker. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`relative z-[9999] ${className}`}>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={ticker}
              onChange={(e) => handleTickerChange(e.target.value)}
              onFocus={() => {
                if (searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className={`w-64 pl-10 pr-4 py-2 text-sm ${
                ticker && !isValidFormat ? 'border-destructive' : ''
              }`}
              disabled={isValidating}
            />
            
            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md rounded-xl border border-border/50 shadow-lg z-[9999] max-h-60 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Searching...</span>
                    </div>
                  ) : (
                    <>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.ticker}-${index}`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-foreground">
                                {suggestion.ticker}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {suggestion.companyName}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.data?.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button
            type="submit"
            size="sm"
            disabled={isValidating || !ticker.trim()}
            className="px-4"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Go
              </>
            ) : (
              'Go'
            )}
          </Button>
        </form>

        {/* Validation Feedback */}
        <AnimatePresence>
          {ticker && !isValidFormat && searchSuggestions.length === 0 && !isSearching && ticker.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 right-0 mt-2 flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2 rounded"
            >
              <AlertCircle className="w-3 h-3" />
              <span>No companies found. Try a different search term.</span>
            </motion.div>
          )}

          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 right-0 mt-2 flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2 rounded"
            >
              <AlertCircle className="w-3 h-3" />
              <span>{searchError}</span>
            </motion.div>
          )}

          {validationResult?.isValid && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 right-0 mt-2 flex items-center gap-2 text-green-500 text-xs bg-green-500/10 p-2 rounded"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Found: {validationResult.companyName}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full variant (same as home page)
  return (
    <div className={`relative z-[9999] ${className}`}>
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className={`glass-highlight rounded-2xl p-2 flex items-center gap-2 shadow-glow transition-all duration-300 ${
          searchError || (ticker && !isValidFormat) ? 'ring-2 ring-destructive/50' : 
          validationResult?.isValid ? 'ring-2 ring-green-500/50' : ''
        }`}>
          <Search className="w-5 h-5 text-muted-foreground ml-4" />
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={ticker}
              onChange={(e) => handleTickerChange(e.target.value)}
              onFocus={() => {
                if (searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className={`w-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-muted-foreground/50 ${
                ticker && !isValidFormat ? 'text-destructive' : ''
              }`}
              disabled={isValidating}
            />
            
            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md rounded-xl border border-border/50 shadow-lg z-[9999] max-h-60 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Searching...</span>
                    </div>
                  ) : (
                    <>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.ticker}-${index}`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-foreground">
                                {suggestion.ticker}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {suggestion.companyName}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.data?.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isValidating || !ticker.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {/* Validation Feedback */}
        <AnimatePresence>
          {ticker && !isValidFormat && searchSuggestions.length === 0 && !isSearching && ticker.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 flex items-center gap-2 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>No companies found. Try a different search term.</span>
            </motion.div>
          )}

          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 flex items-center gap-2 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{searchError}</span>
            </motion.div>
          )}

          {validationResult?.isValid && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 flex items-center gap-2 text-green-500 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Found: {validationResult.companyName}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Quick Access Companies */}
      {showQuickButtons && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mt-8"
        >
          <p className="text-sm text-muted-foreground mb-4 text-center">Popular companies:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA", "META", "AMZN"].map((companyTicker, i) => (
              <motion.div
                key={companyTicker}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(companyTicker)}
                  disabled={isValidating}
                  className="rounded-full hover:bg-primary/10 hover:border-primary/50 transition-all disabled:opacity-50"
                >
                  {companyTicker}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
