# Sunnah Assistant API Backend

This is the backend API for the Sunnah Assistant Android App. It is a Cloudflare Worker that provides geocoding data and other resources to the app.

## Features

- **Geocoding:** Provides geocoding data from Google Maps and OpenWeather APIs.
- **Rate Limiting:** Implements rate limiting to prevent abuse.
- **Authentication:** Verifies the app's user agent and version.
- **Resource Links:** Provides links to translations, Quran zip files, and Quran pages.
- **Health Check:** A `/health` endpoint to check the status of the API.

## Tech Stack

- [Hono](https://hono.dev/) - A small, simple, and ultrafast web framework for the Edge.
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless execution environment.
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
- [SendGrid](https://sendgrid.com/) - Email delivery service.

## API Endpoints

- `GET /health`: Returns the status of the API.
- `GET /geocoding-data`: Returns geocoding data for a given address.
  - `address` (query parameter): The address to geocode.
  - `language` (query parameter, optional): The language for the results (default: `en`).
- `GET /resources/links`: Returns links to various resources.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/saidmsaid81/Sunnah-Assistant-Api-Backend.git
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Development

To run the development server:

```bash
npm run dev
```

### Deployment

To deploy the worker to Cloudflare:

```bash
npm run deploy
```

## Configuration

The following environment variables are required:

- `GEOCODING_API_KEY`: Google Maps Geocoding API key.
- `OPENWEATHER_API_KEY`: OpenWeather API key.
- `MY_EMAIL`: Your email address for notifications.
- `SENDGRID_API_KEY`: SendGrid API key.
- `FILTER_STRING`: A comma-separated list of strings to filter from geocoding results.
- `EXPECTED_USER_AGENT`: The expected User-Agent header from the app.
- `CURRENT_APP_VERSION`: The current version of the app.
- `TRANSLATION_LINK`: Link to the translations.
- `QURAN_ZIP_FILE_LINK`: Link to the Quran zip file.
- `QURAN_PAGES_LINK`: Link to the Quran pages.

These variables are configured in the `wrangler.toml` file and as secrets in the Cloudflare dashboard.

## License

This project is licensed under the **GPL 3.0 License**. See the [LICENSE](LICENSE) file for details.