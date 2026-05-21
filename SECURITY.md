# Security Policy

## API Key Management

This application implements a **defense-in-depth approach** for API key management with multiple layers of security:

### Multi-Strategy API Key Handling

The application uses a hierarchical fallback system for API key management:

1. **Proxy Server (Production - Most Secure)**
   - API keys are stored server-side only
   - Never exposed to client-side code
   - Rate limiting and abuse prevention
   - CORS restrictions

2. **Environment Variables (Development)**
   - API keys stored in `.env` files
   - Not committed to version control (`.gitignore`)
   - Only exposed in development builds
   - Vite automatically excludes from production bundles

3. **User Input (Fallback)**
   - Optional user-provided API keys
   - Stored in browser memory only (session-based)
   - Never persisted to localStorage or cookies
   - Cleared on page refresh

### Security Features

#### Proxy Server Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Location input sanitized and length-limited
- **Timeout Protection**: 10-second timeout on external API calls
- **Error Handling**: Generic error messages to prevent information leakage
- **Health Monitoring**: Built-in health check endpoint

#### Client-Side Security
- **No Persistence**: API keys never stored in browser storage
- **HTTPS Only**: Production deployments require HTTPS
- **Content Security Policy**: Recommended for production
- **XSS Prevention**: React's built-in XSS protection
- **Input Sanitization**: All user inputs validated

### Environment Variables

Create a `.env` file in the project root:

```bash
# Development API key (optional - users can input their own)
VITE_OPENWEATHER_API_KEY=your_api_key_here

# Proxy server configuration (production)
VITE_API_PROXY_URL=http://localhost:3001
```

### Proxy Server Setup

For production deployment, set the server-side environment variable:

```bash
OPENWEATHER_API_KEY=your_production_api_key
```

Never commit this file to version control.

### Deployment Security

#### GitHub Actions
- Secrets stored in GitHub Secrets
- Environment variables configured in CI/CD
- No credentials in logs or artifacts

#### Production Deployment
1. Use environment variables for all sensitive data
2. Enable HTTPS/TLS
3. Configure CORS restrictions
4. Implement rate limiting
5. Monitor API usage for anomalies
6. Regular security audits

### Best Practices

1. **Never commit API keys** to version control
2. **Rotate keys regularly** (every 90 days recommended)
3. **Use different keys** for development and production
4. **Monitor usage** to detect unauthorized access
5. **Implement rate limiting** on your proxy server
6. **Keep dependencies updated** for security patches
7. **Use strong, randomly generated** API keys
8. **Revoke compromised keys immediately**

### OpenWeatherMap Security

- Free tier: 1,000 calls/day (sufficient for most use cases)
- Paid tiers available for higher volume
- Monitor usage at [OpenWeatherMap Dashboard](https://openweathermap.org/dashboard)
- Set up alerts for unusual activity

### Vulnerability Reporting

If you discover a security vulnerability, please:

1. Do not open a public issue
2. Email security details to the project maintainers
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

### License

ISC - See LICENSE file for details