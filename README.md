# Endurance Fueling Calculator

A scientifically-based calculator for endurance athletes to determine their carbohydrate, sodium, and water needs during training sessions, with advanced weather-based adjustments for environmental conditions.

## Features

- **Core Calculator**: Calculate fueling needs based on training duration and intensity
- **Weather Integration**: Location-based weather adjustments using OpenWeatherMap API
- **Scientific Foundation**: Based on ISSN and ACSM sports nutrition guidelines
- **Demo Mode**: Built-in mock weather data for testing and demonstration
- **Responsive Design**: Mobile-friendly interface
- **Type-Safe**: Built with TypeScript for reliability

## Scientific Basis

The calculator uses established sports nutrition research:

### Carbohydrates
- **Low Intensity**: 30g/hour (ISSN guidelines)
- **Moderate Intensity**: 45g/hour (ISSN guidelines)
- **High Intensity**: 60g/hour (up to 90g/hour for elite athletes)
- **Weather Adjustment**: Slight increase in heat due to increased glycogen utilization

### Sodium
- **Base Needs**: 300-500mg/hour based on typical sweat sodium concentration (300-800mg/L)
- **Intensity Scaling**: Adjusted based on exercise intensity
- **Weather Adjustment**: Significant increase in hot/humid conditions due to higher sweat rates

### Water
- **Base Needs**: 400-800ml/hour (ACSM guidelines)
- **Intensity Scaling**: Higher intensity requires more fluid
- **Weather Adjustment**: Substantial increase in hot/humid conditions (up to 1.8x factor)

### Weather Adjustments
- **Temperature**: Adjustments for hot (>30°C), warm (25-30°C), mild (20-25°C), and cold (<10°C)
- **Humidity**: Additional adjustments for high humidity (>80%) and very high humidity (>60%)
- **Combined Effects**: Maximum adjustment factor of 1.8x for extreme conditions

## Installation

```bash
# Install dependencies
npm install
```

## Usage

### Development
```bash
# Start development server
npm run dev

# Start proxy server (for production-like development)
npm run server

# Start both frontend and proxy server
npm run dev:all

# Run tests
npm run test

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run
```

### Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npx tsc --noEmit
```

## Weather API Setup

The app supports multiple API key strategies for maximum security and flexibility:

### Priority Order (Automatic Fallback)
1. **Proxy Server** (Production - Most Secure)
2. **Environment Variable** (Development)
3. **User Input** (Fallback for testing/demo)

### Demo Mode (Default)
- Uses mock weather data for testing
- No API key required
- Built-in data for Singapore (hot/humid) and London (temperate)

### Environment Variable Setup
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Copy `.env.example` to `.env`
3. Add your API key: `VITE_OPENWEATHER_API_KEY=your_key_here`
4. Restart the development server

### Proxy Server (Production)
1. Set your API key in `.env`: `OPENWEATHER_API_KEY=your_key_here`
2. Set proxy URL: `VITE_API_PROXY_URL=http://localhost:3001`
3. Start the proxy server: `npm run server`
4. The app will automatically use the proxy for all weather requests

### User Input (Fallback)
1. Disable "Demo mode" in the app
2. Enter your API key in the UI (optional if env var is set)
3. Enter your location

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Calculator logic and weather functions
- **Integration Tests**: React component testing
- **54 test cases** covering all major functionality

```bash
# Run all tests
npm run test:run

# Run tests with UI
npm run test:ui
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow that:

1. **Lint & Type Check**: Ensures code quality and type safety
2. **Run Tests**: Executes all test suites
3. **Build Application**: Creates production build
4. **Deploy**: Automatically deploys to GitHub Pages on main branch pushes

## Project Structure

```
devin-app/
├── src/
│   ├── components/          # React components
│   │   ├── FuelingCalculator.tsx
│   │   ├── ResultDisplay.tsx
│   │   └── WeatherInput.tsx
│   ├── lib/                 # Business logic
│   │   ├── calculator.ts    # Fueling calculations
│   │   └── weather.ts       # Weather API integration
│   ├── test/                # Test setup
│   ├── App.tsx              # Main application
│   ├── main.tsx             # Entry point
│   └── App.css              # Styles
├── .github/workflows/       # CI/CD pipelines
├── public/                  # Static assets
└── package.json
```

## Technologies Used

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **API Client**: Axios
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## License

ISC

## Disclaimer

This calculator provides general recommendations based on established sports nutrition guidelines. Individual needs vary significantly based on factors including:

- Individual sweat rate
- Body weight and composition
- Acclimatization to conditions
- Personal tolerance

Always practice your fueling strategy in training before race day, and consult with a sports nutritionist for personalized advice.
# Deployment test
