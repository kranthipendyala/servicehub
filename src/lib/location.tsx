"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface LocationData {
  city: string;
  citySlug: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  source: "gps" | "ip" | "manual" | "default";
}

interface LocationContextValue {
  location: LocationData;
  loading: boolean;
  setCity: (city: string, slug: string) => void;
  detectLocation: () => void;
}

const DEFAULT_LOCATION: LocationData = {
  city: "Mumbai",
  citySlug: "mumbai",
  source: "default",
};

// Map of known cities to their slugs (for matching detected city names)
const CITY_MAP: Record<string, string> = {
  mumbai: "mumbai",
  "navi mumbai": "mumbai",
  thane: "thane",
  pune: "pune",
  delhi: "new-delhi",
  "new delhi": "new-delhi",
  noida: "noida",
  gurgaon: "gurgaon",
  gurugram: "gurgaon",
  faridabad: "faridabad",
  bangalore: "bangalore",
  bengaluru: "bangalore",
  mysore: "mysore",
  mysuru: "mysore",
  chennai: "chennai",
  coimbatore: "coimbatore",
  madurai: "madurai",
  hyderabad: "hyderabad",
  ahmedabad: "ahmedabad",
  surat: "surat",
  vadodara: "vadodara",
  jaipur: "jaipur",
  jodhpur: "jodhpur",
  udaipur: "udaipur",
  lucknow: "lucknow",
  kanpur: "kanpur",
  varanasi: "varanasi",
  kolkata: "kolkata",
  indore: "indore",
  bhopal: "bhopal",
  kochi: "kochi",
  cochin: "kochi",
  thiruvananthapuram: "thiruvananthapuram",
  trivandrum: "thiruvananthapuram",
  chandigarh: "chandigarh",
  ludhiana: "ludhiana",
  patna: "patna",
  bhubaneswar: "bhubaneswar",
  visakhapatnam: "visakhapatnam",
  vizag: "visakhapatnam",
  vijayawada: "vijayawada",
  panaji: "panaji",
  nagpur: "nagpur",
  nashik: "nashik",
};

function matchCity(name: string): { city: string; slug: string } | null {
  const lower = name.toLowerCase().trim();
  if (CITY_MAP[lower]) {
    // Get proper city name from slug
    const slug = CITY_MAP[lower];
    const properName = Object.entries(CITY_MAP).find(
      ([, s]) => s === slug
    )?.[0];
    return {
      city: properName ? properName.charAt(0).toUpperCase() + properName.slice(1) : name,
      slug,
    };
  }
  // Partial match
  for (const [key, slug] of Object.entries(CITY_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return {
        city: key.charAt(0).toUpperCase() + key.slice(1),
        slug,
      };
    }
  }
  return null;
}

// Reverse geocode using OpenStreetMap Nominatim (free, no API key)
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { headers: { "User-Agent": "MechanicalHub/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.state_district ||
      data.address?.county ||
      data.address?.state ||
      null
    );
  } catch {
    return null;
  }
}

// IP-based location detection using free API
async function detectByIP(): Promise<{ city: string; lat: number; lng: number } | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.city) {
      return { city: data.city, lat: data.latitude, lng: data.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

const LocationContext = createContext<LocationContextValue>({
  location: DEFAULT_LOCATION,
  loading: true,
  setCity: () => {},
  detectLocation: () => {},
});

export function useLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);

  const setCity = useCallback((city: string, slug: string) => {
    const newLoc: LocationData = { city, citySlug: slug, source: "manual" };
    setLocation(newLoc);
    if (typeof window !== "undefined") {
      localStorage.setItem("mh_location", JSON.stringify(newLoc));
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setLoading(true);

    // 1. Try browser Geolocation API
    if ("geolocation" in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 600000, // cache for 10 min
          });
        });

        const { latitude, longitude } = pos.coords;
        const cityName = await reverseGeocode(latitude, longitude);

        if (cityName) {
          const matched = matchCity(cityName);
          if (matched) {
            const loc: LocationData = {
              city: matched.city,
              citySlug: matched.slug,
              latitude,
              longitude,
              source: "gps",
            };
            setLocation(loc);
            localStorage.setItem("mh_location", JSON.stringify(loc));
            setLoading(false);
            return;
          }
        }
      } catch {
        // Geolocation denied or failed — fall through to IP
      }
    }

    // 2. Fallback: IP-based detection
    try {
      const ipResult = await detectByIP();
      if (ipResult) {
        const matched = matchCity(ipResult.city);
        if (matched) {
          const loc: LocationData = {
            city: matched.city,
            citySlug: matched.slug,
            latitude: ipResult.lat,
            longitude: ipResult.lng,
            source: "ip",
          };
          setLocation(loc);
          localStorage.setItem("mh_location", JSON.stringify(loc));
          setLoading(false);
          return;
        }
      }
    } catch {
      // IP detection failed
    }

    // 3. Keep default
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mh_location");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as LocationData;
          if (parsed.citySlug) {
            setLocation(parsed);
            setLoading(false);
            return;
          }
        } catch {
          // Invalid saved data
        }
      }
    }

    // Auto-detect
    detectLocation();
  }, [detectLocation]);

  return (
    <LocationContext.Provider value={{ location, loading, setCity, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
}
