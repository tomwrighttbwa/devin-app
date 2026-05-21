import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // per window

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const userData = rateLimitMap.get(ip);
  
  if (now > userData.resetTime) {
    userData.count = 1;
    userData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (userData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  userData.count++;
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Weather proxy endpoint
app.get('/api/weather/:location', rateLimit, async (req, res) => {
  try {
    const { location } = req.params;
    
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'OpenWeatherMap API key not configured on server'
      });
    }
    
    // Validate location input
    if (!location || location.length > 100) {
      return res.status(400).json({ 
        error: 'Invalid location',
        message: 'Location must be provided and less than 100 characters'
      });
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`,
      { timeout: 10000 } // 10 second timeout
    );
    
    // Return only the data we need
    const { main, name, sys } = response.data;
    res.json({
      temperature: main.temp,
      humidity: main.humidity,
      location: `${name}, ${sys.country}`,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return res.status(500).json({ 
          error: 'API authentication failed',
          message: 'Invalid OpenWeatherMap API key configured on server'
        });
      } else if (error.response?.status === 404) {
        return res.status(404).json({ 
          error: 'Location not found',
          message: 'The specified location could not be found'
        });
      } else if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ 
          error: 'Gateway timeout',
          message: 'Weather service took too long to respond'
        });
      }
    }
    
    console.error('Weather proxy error:', error);
    res.status(500).json({ 
      error: 'Weather service unavailable',
      message: 'Failed to fetch weather data. Please try again later.'
    });
  }
});

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Clean up every minute

app.listen(PORT, () => {
  console.log(`Weather proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Weather endpoint: http://localhost:${PORT}/api/weather/:location`);
  console.log(`API Key configured: ${OPENWEATHER_API_KEY ? '✓' : '✗'}`);
});
