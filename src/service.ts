/**
 * Geocoding service for Cloudflare Workers
 */

import { Env, GeocodingData, OpenWeatherDto, Result, Geometry, Location } from './models';
import { EmailService } from './email-service';

export class GeocodingService {
  private readonly env: Env;
  private readonly emailService: EmailService;
  private readonly filters: Set<string>;

  constructor(env: Env) {
    this.env = env;
    this.emailService = new EmailService(env.MY_EMAIL, env.SENDGRID_API_KEY);
    this.filters = new Set(
      env.FILTER_STRING.split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0)
    );
  }

  /**
   * Get geocoding data for an address
   */
  async getGeocodingData(address: string, language: string = 'en'): Promise<GeocodingData> {
    try {
      const geocodingData = await this.getGoogleGeocodingData(address, language);
      return {
        results: geocodingData.results.map(result => {
          const lastPart = result.formattedAddress.split(', ').pop() || '';

          return {
            ...result,
            formattedAddress: this.filters.has(lastPart.toLowerCase())
              ? result.formattedAddress.substring(0, result.formattedAddress.lastIndexOf(','))
              : result.formattedAddress
          };
        }),
        status: geocodingData.status
      };
    } catch (error) {
      return this.reportGeocodingServerError(`Your server has experienced an exception.\n ${error}`);
    }
  }

  private async getGoogleGeocodingData(address: string, language: string): Promise<GeocodingData> {
    const successfulStatuses = ['OK', 'ZERO_RESULTS'];

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('address', address);
    url.searchParams.append('key', this.env.GEOCODING_API_KEY);
    url.searchParams.append('language', language);

    const response = await fetch(url.toString());
    const rawData = await response.json();
    
    const geocodingData: GeocodingData = {
        results: rawData.results.map((result: any) => ({
            formattedAddress: result.formatted_address,
            geometry: {
                location: {
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng
                }
            }
        })),
        status: rawData.status
    };

    if (successfulStatuses.includes(geocodingData.status)) {
        return geocodingData;
    } else {
        // await this.reportGeocodingServerError(`Google Geocoding Api ${geocodingData.status}`);
        return this.getOpenWeatherGeocodingData(address, language);
    }
}

  /**
   * Get geocoding data from OpenWeather API
   */
  private async getOpenWeatherGeocodingData(address: string, language: string): Promise<GeocodingData> {
    const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
    url.searchParams.append('q', address);
    url.searchParams.append('appid', this.env.OPENWEATHER_API_KEY);
    url.searchParams.append('limit', '1');

    const response = await fetch(url.toString());

    if (response.ok) {
      const openWeatherData = await response.json() as OpenWeatherDto[];
      return this.convertToGeocodingData(openWeatherData[0] || null, language);
    } else {
      return this.reportGeocodingServerError(`OpenWeather Api ${response.status}`);
    }
  }

  /**
   * Convert OpenWeather data to GeocodingData format
   */
  private convertToGeocodingData(data: OpenWeatherDto | null, language: string): GeocodingData {
    if (!data) {
      return { results: [], status: 'ZERO_RESULTS' };
    }

    const name = data.local_names?.[language] || data.name;
    const formattedAddress = [name, data.state, data.country]
      .filter(Boolean)
      .join(', ');

    const location: Location = { lat: data.lat, lng: data.lon };
    const geometry: Geometry = { location };
    const result: Result = { formattedAddress: formattedAddress, geometry };

    return { results: [result], status: 'OK' };
  }

  /**
   * Report geocoding server error
   */
  private async reportGeocodingServerError(status: string): Promise<GeocodingData> {
    // await this.emailService.sendEmailToDeveloper(status);
   throw new Error("An error occurred while performing this action");
  }
}