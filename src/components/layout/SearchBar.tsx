"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/location";

interface SearchBarProps {
  defaultQuery?: string;
  defaultCity?: string;
  placeholder?: string;
  variant?: "hero" | "header";
}

interface Suggestion {
  type: "business" | "category" | "locality";
  label: string;
  slug: string;
  extra?: string;
}

const POPULAR_CITIES = [
  { name: "Mumbai", slug: "mumbai" },
  { name: "Delhi", slug: "new-delhi" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Chennai", slug: "chennai" },
  { name: "Pune", slug: "pune" },
  { name: "Kolkata", slug: "kolkata" },
  { name: "Ahmedabad", slug: "ahmedabad" },
  { name: "Jaipur", slug: "jaipur" },
  { name: "Lucknow", slug: "lucknow" },
  { name: "Kochi", slug: "kochi" },
  { name: "Indore", slug: "indore" },
];

export default function SearchBar({
  defaultQuery = "",
  defaultCity,
  placeholder = "Search cleaning, electrician, plumber, AC repair...",
  variant = "header",
}: SearchBarProps) {
  const router = useRouter();
  const { location, loading: locationLoading, setCity: setGlobalCity, detectLocation } = useLocation();
  const [query, setQuery] = useState(defaultQuery);
  const [cityFilter, setCityFilter] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Use detected city or default prop
  const currentCity = defaultCity || location.city;
  const currentCitySlug = location.citySlug;

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&city=${currentCitySlug}&per_page=5`
      );
      const data = await res.json();
      if (data.status && data.data?.businesses) {
        setSuggestions(
          data.data.businesses.slice(0, 5).map((b: any) => ({
            type: "business" as const,
            label: b.name,
            slug: b.slug,
            extra: b.city_name || "",
          }))
        );
      }
    } catch {
      setSuggestions([]);
    }
  }, [currentCitySlug]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setActiveSuggestion(-1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams();
    params.set("q", query.trim());
    params.set("city", currentCitySlug);
    router.push(`/search?${params.toString()}`);
    setShowSuggestions(false);
    setShowCityDropdown(false);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.label);
    setShowSuggestions(false);
    if (suggestion.type === "business") {
      router.push(`/business/${suggestion.slug}`);
    } else if (suggestion.type === "category") {
      router.push(`/${currentCitySlug}/${suggestion.slug}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}&city=${suggestion.slug}`);
    }
  };

  const handleCitySelect = (city: { name: string; slug: string }) => {
    setGlobalCity(city.name, city.slug);
    setCityFilter("");
    setShowCityDropdown(false);
  };

  const handleDetectClick = () => {
    detectLocation();
    setShowCityDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => prev < suggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHero = variant === "hero";
  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(cityFilter.toLowerCase())
  );

  const sourceColor = location.source === "gps" ? "text-green-500" : location.source === "ip" ? "text-blue-500" : "text-accent-500";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex w-full">
        <div
          className={`flex w-full items-stretch ${
            isHero
              ? "rounded-2xl shadow-search bg-white border-2 border-white/80 focus-within:border-accent-400 transition-colors"
              : "rounded-full bg-white border border-surface-200 shadow-sm focus-within:border-primary-300 focus-within:shadow-md transition-all"
          }`}
        >
          {/* City selector — auto-detected */}
          <div ref={cityRef} className="relative hidden sm:flex items-center">
            <button
              type="button"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className={`flex items-center gap-1.5 border-r border-surface-200 text-gray-700 hover:text-primary-500 transition-colors ${
                isHero ? "px-4 py-4" : "px-3 py-2"
              }`}
            >
              {/* Location icon with detection status */}
              <svg
                className={`flex-shrink-0 ${sourceColor} ${isHero ? "w-5 h-5" : "w-4 h-4"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>

              {locationLoading ? (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  <span className={`${isHero ? "text-sm" : "text-xs"}`}>Detecting...</span>
                </span>
              ) : (
                <span className={`font-medium truncate max-w-[90px] ${isHero ? "text-sm" : "text-xs"}`}>
                  {currentCity}
                </span>
              )}

              {/* Source badge */}
              {!locationLoading && location.source === "gps" && (
                <span className="hidden lg:inline-flex text-[8px] bg-green-100 text-green-600 px-1 py-0.5 rounded font-bold uppercase">GPS</span>
              )}

              <svg className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${showCityDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* City dropdown */}
            {showCityDropdown && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-surface-200 z-50 animate-slide-down overflow-hidden">
                {/* Detect location button */}
                <button
                  type="button"
                  onClick={handleDetectClick}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 transition-colors border-b border-surface-100 font-medium"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-semibold">Detect My Location</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {location.source === "gps" ? "Using GPS — " + location.city
                        : location.source === "ip" ? "Using IP — " + location.city
                        : "Uses GPS or IP address"}
                    </span>
                  </div>
                  {location.source !== "default" && location.source !== "manual" && (
                    <svg className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* City search filter */}
                <div className="px-3 pt-2 pb-1">
                  <input
                    type="text"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    placeholder="Search city..."
                    className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:border-primary-300"
                  />
                </div>

                {/* City list */}
                <div className="grid grid-cols-2 max-h-48 overflow-y-auto py-1">
                  {filteredCities.map((city) => (
                    <button
                      key={city.slug}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className={`text-left px-4 py-2 text-sm hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                        currentCitySlug === city.slug ? "text-primary-600 bg-primary-50 font-medium" : "text-gray-600"
                      }`}
                    >
                      {currentCitySlug === city.slug && (
                        <svg className="w-3 h-3 inline mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {city.name}
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <p className="col-span-2 text-center py-3 text-sm text-gray-400">No cities found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search input */}
          <div className="flex-1 flex items-center px-3">
            <svg
              className={`text-gray-400 mr-2 flex-shrink-0 ${isHero ? "w-5 h-5" : "w-4 h-4"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full focus:outline-none bg-transparent text-gray-800 placeholder:text-gray-400 ${
                isHero ? "py-4 text-base lg:text-lg" : "py-2.5 text-sm"
              }`}
              aria-label="Search services"
              autoComplete="off"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`flex-shrink-0 font-bold transition-all ${
              isHero
                ? "px-8 py-4 rounded-r-2xl text-base bg-accent-500 hover:bg-accent-600 text-white shadow-sm"
                : "px-5 py-2.5 rounded-r-xl text-sm bg-primary-500 hover:bg-primary-600 text-white"
            }`}
          >
            {isHero ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-surface-200 max-h-80 overflow-y-auto animate-slide-down"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => {
            const typeColors: Record<string, string> = {
              business: "bg-primary-50 text-primary-600",
              category: "bg-accent-50 text-accent-600",
              locality: "bg-green-50 text-green-600",
            };
            return (
              <li
                key={`${suggestion.type}-${suggestion.slug}`}
                role="option"
                aria-selected={index === activeSuggestion}
                className={`px-4 py-3 cursor-pointer flex items-center gap-3 border-b border-surface-100 last:border-0 transition-colors ${
                  index === activeSuggestion ? "bg-primary-50" : "hover:bg-surface-50"
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                    typeColors[suggestion.type] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {suggestion.type}
                </span>
                <span className="text-sm font-medium text-gray-800 flex-1">{suggestion.label}</span>
                {suggestion.extra && (
                  <span className="text-xs text-gray-400">{suggestion.extra}</span>
                )}
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
