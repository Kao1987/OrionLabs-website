// /api/messages endpoint implementation example
// This is a Node.js/Express example for handling contact form submissions

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Rate limiting - max 5 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: '發送太頻繁，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Security middleware
router.use(helmet());
router.use(contactLimiter);

// Email configuration (using nodemailer)
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Validation rules
const validateMessage = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\u4e00-\u9fa5\s'-]+$/)
    .withMessage('姓名格式不正確'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('電子郵件格式不正確'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('主旨長度必須在 5-100 字元之間'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('訊息內容長度必須在 10-1000 字元之間'),
  
  // Honeypot field should be empty
  body('honeypot')
    .optional()
    .isEmpty()
    .withMessage('檢測到垃圾郵件'),
];

// Anti-spam checks
const checkSpamIndicators = (req, res, next) => {
  const { name, email, subject, message } = req.body;
  const suspiciousPatterns = [];

  // Check for common spam patterns
  const spamKeywords = ['viagra', 'casino', 'lottery', 'click here', 'act now'];
  const allText = `${name} ${email} ${subject} ${message}`.toLowerCase();
  
  spamKeywords.forEach(keyword => {
    if (allText.includes(keyword)) {
      suspiciousPatterns.push(`Spam keyword detected: ${keyword}`);
    }
  });

  // Check for excessive links
  const linkCount = (message.match(/https?:\/\//gi) || []).length;
  if (linkCount > 2) {
    suspiciousPatterns.push('Too many links');
  }

  // Check for suspicious email patterns
  if (/^\d+@/.test(email) || /test@test/.test(email)) {
    suspiciousPatterns.push('Suspicious email pattern');
  }

  // Check for form submission speed (if timestamp is provided)
  const submissionTime = req.headers['x-form-start-time'];
  if (submissionTime) {
    const timeDiff = Date.now() - parseInt(submissionTime);
    if (timeDiff < 3000) { // Less than 3 seconds
      suspiciousPatterns.push('Form submitted too quickly');
    }
  }

  if (suspiciousPatterns.length > 0) {
    console.log('Spam indicators detected:', suspiciousPatterns);
    return res.status(400).json({
      error: 'SPAM_DETECTED',
      message: '檢測到可疑活動，請稍後再試'
    });
  }

  next();
};

// Store messages (in production, use a database)
const messages = [];

// POST /api/messages - Submit contact form
router.post('/', validateMessage, checkSpamIndicators, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '表單資料驗證失敗',
        details: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create message object
    const contactMessage = {
      id: messageId,
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      subject: validator.escape(subject),
      message: validator.escape(message),
      submittedAt: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'pending'
    };

    // Store message (in production, save to database)
    messages.push(contactMessage);

    // Send email notification
    try {
      const transporter = createEmailTransporter();
      
      // Email to site owner
      const ownerMailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_EMAIL || 'hong.yikao@example.com',
        subject: `新聯絡表單訊息: ${subject}`,
        html: `
          <h2>新的聯絡表單訊息</h2>
          <p><strong>姓名:</strong> ${name}</p>
          <p><strong>電子郵件:</strong> ${email}</p>
          <p><strong>主旨:</strong> ${subject}</p>
          <p><strong>訊息:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>
            <strong>提交時間:</strong> ${contactMessage.submittedAt.toLocaleString('zh-TW')}<br>
            <strong>IP 地址:</strong> ${contactMessage.ip}<br>
            <strong>User Agent:</strong> ${contactMessage.userAgent}
          </small></p>
        `
      };

      // Auto-reply to sender
      const replyMailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: '感謝您的聯絡 - OrionLabs',
        html: `
          <h2>感謝您的聯絡</h2>
          <p>親愛的 ${name}，</p>
          <p>感謝您透過我的網站聯絡我。我已收到您的訊息，會在 24 小時內回覆您。</p>
          
          <h3>您的訊息摘要：</h3>
          <p><strong>主旨:</strong> ${subject}</p>
          <p><strong>訊息:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
          
          <p>如有緊急事務，請直接撥打 +886-912-345-678 與我聯絡。</p>
          
          <p>最佳祝願，<br>洪義考</p>
          
          <hr>
          <p><small>此為系統自動回覆郵件，請勿直接回覆。</small></p>
        `
      };

      // Send emails
      await Promise.all([
        transporter.sendMail(ownerMailOptions),
        transporter.sendMail(replyMailOptions)
      ]);

      contactMessage.status = 'sent';
      console.log('Contact form submitted and emails sent:', messageId);

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      contactMessage.status = 'email_failed';
      // Still return success to user, but log the email failure
    }

    // Return success response
    res.status(201).json({
      success: true,
      id: messageId,
      message: '訊息已成功發送'
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '伺服器錯誤，請稍後再試'
    });
  }
});

// GET /api/messages - Get all messages (admin only)
router.get('/', async (req, res) => {
  try {
    // In production, add authentication middleware here
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const paginatedMessages = messages
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(offset, offset + limit);

    res.json({
      messages: paginatedMessages,
      total: messages.length,
      page,
      limit,
      totalPages: Math.ceil(messages.length / limit)
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '伺服器錯誤'
    });
  }
});

// GET /api/messages/:id - Get specific message (admin only)
router.get('/:id', async (req, res) => {
  try {
    // In production, add authentication middleware here
    const { id } = req.params;
    const message = messages.find(msg => msg.id === id);

    if (!message) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: '訊息不存在'
      });
    }

    res.json(message);

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '伺服器錯誤'
    });
  }
});

// DELETE /api/messages/:id - Delete message (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // In production, add authentication middleware here
    const { id } = req.params;
    const messageIndex = messages.findIndex(msg => msg.id === id);

    if (messageIndex === -1) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: '訊息不存在'
      });
    }

    messages.splice(messageIndex, 1);

    res.json({
      success: true,
      message: '訊息已刪除'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '伺服器錯誤'
    });
  }
});

module.exports = router;

/*
Usage in main Express app:

const express = require('express');
const cors = require('cors');
const messagesRouter = require('./api/messages');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/messages', messagesRouter);

// Environment variables needed:
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your-email@gmail.com
// SMTP_PASS=your-app-password
// CONTACT_EMAIL=hong.yikao@example.com

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/