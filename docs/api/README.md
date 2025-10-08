# OrionLabs Contact Form API

A robust Node.js/Express API for handling contact form submissions with anti-spam protection, email notifications, and comprehensive validation.

## Features

### Security & Anti-Spam
- ✅ **Rate Limiting**: 5 submissions per 15 minutes per IP
- ✅ **Honeypot Protection**: Hidden field to catch bots
- ✅ **Input Validation**: Comprehensive server-side validation
- ✅ **Spam Detection**: Keyword filtering and pattern analysis
- ✅ **XSS Protection**: Input sanitization and escaping
- ✅ **CORS Protection**: Configurable allowed origins
- ✅ **Helmet Security**: Security headers

### Email Features
- ✅ **Automatic Notifications**: Owner receives new message alerts
- ✅ **Auto-Reply**: Confirmation email to sender
- ✅ **HTML Templates**: Professional email formatting
- ✅ **SMTP Support**: Compatible with Gmail, SendGrid, etc.

### Validation Features
- ✅ **Real-time Validation**: Immediate feedback
- ✅ **Multi-language Support**: Chinese and English messages
- ✅ **Field Requirements**: Name, email, subject, message
- ✅ **Length Limits**: Prevent abuse and ensure quality
- ✅ **Email Format**: RFC compliant email validation

## API Endpoints

### POST /api/messages
Submit a new contact form message.

**Request Body:**
```json
{
  "name": "張三",
  "email": "zhang@example.com",
  "subject": "網站開發詢問",
  "message": "我想了解網站開發的相關服務..."
}
```

**Response:**
```json
{
  "success": true,
  "id": "msg_1703123456789_abc123",
  "message": "訊息已成功發送"
}
```

### GET /api/messages (Admin Only)
Retrieve all contact messages with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "messages": [...],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### GET /api/messages/:id (Admin Only)
Get a specific message by ID.

### DELETE /api/messages/:id (Admin Only)
Delete a message by ID.

## Setup Instructions

### 1. Install Dependencies
```bash
cd api-example
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server
PORT=3001
NODE_ENV=development

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=hong.yikao@example.com

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Gmail App Password Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASS`

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Integration with Frontend

The contact store in your Vue.js frontend is already configured to work with this API. Make sure your frontend is running on an allowed origin.

### Frontend Configuration
```typescript
// In your contact store
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(messageData)
})
```

## Production Deployment

### Environment Variables
Set these environment variables in your production environment:

```env
NODE_ENV=production
PORT=3001
SMTP_HOST=your-smtp-host
SMTP_USER=your-email
SMTP_PASS=your-password
CONTACT_EMAIL=your-contact-email
ALLOWED_ORIGINS=https://your-domain.com
```

### Database Integration
For production, replace the in-memory storage with a database:

```javascript
// Example with PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Save message to database
const result = await pool.query(
  'INSERT INTO messages (name, email, subject, message, submitted_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
  [name, email, subject, message, new Date()]
);
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3001

CMD ["npm", "start"]
```

## Security Considerations

1. **Rate Limiting**: Adjust limits based on your needs
2. **CORS**: Only allow your domain in production
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Server-side validation is enforced
5. **Email Security**: Use app-specific passwords
6. **Monitoring**: Log and monitor for abuse patterns

## Testing

```bash
# Run tests
npm test

# Test the API manually
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message"
  }'
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Form data validation failed |
| `SPAM_DETECTED` | Anti-spam measures triggered |
| `TOO_MANY_REQUESTS` | Rate limit exceeded |
| `INTERNAL_ERROR` | Server error |
| `NOT_FOUND` | Resource not found |

## Monitoring and Logs

The API logs important events:
- Successful message submissions
- Spam detection triggers
- Email sending failures
- Rate limit violations

In production, consider using:
- **Winston** for structured logging
- **Sentry** for error tracking
- **Prometheus** for metrics
- **Grafana** for dashboards

## Support

For issues or questions about this API implementation, please check:
1. Environment variables are correctly set
2. SMTP credentials are valid
3. CORS origins include your frontend domain
4. Rate limits are not being exceeded

---

**Note**: This is a reference implementation. Adapt the code to your specific hosting environment and requirements.