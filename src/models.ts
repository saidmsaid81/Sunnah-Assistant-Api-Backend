/**
 * Data models for the Sunnah Assistant Backend
 */

export interface GeocodingData {
  results: Result[];
  status: string;
}

export interface Result {
  formatted_address: string;
  geometry: Geometry;
}

export interface Geometry {
  location: Location;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface OpenWeatherDto {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface Env {
  // KV Namespace for rate limiting
  RATE_LIMITS: KVNamespace;
  
  // API Keys and configuration
  GEOCODING_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  MY_EMAIL: string;
  SENDGRID_API_KEY: string;
  
  // Configuration
  FILTER_STRING: string;
  EXPECTED_USER_AGENT: string;
  CURRENT_APP_VERSION: string;
}