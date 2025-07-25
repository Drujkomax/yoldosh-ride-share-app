import { z } from 'zod';
import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
};

// Phone validation for Uzbekistan
export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(/^\+998\d{9}$/, 'Invalid Uzbekistan phone number format (+998XXXXXXXXX)')
  .transform(sanitizeInput);

// Email validation
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(254, 'Email too long')
  .transform(sanitizeInput);

// Enhanced password validation with special characters and leaked password protection
export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)')
  .refine((password) => {
    // Check against common weak passwords
    const weakPasswords = ['password123', 'admin123', '123456789', 'qwerty123'];
    return !weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()));
  }, 'Password contains common weak patterns');

// Name validation
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s'-]+$/, 'Invalid characters in name')
  .transform(sanitizeInput);

// City validation
export const citySchema = z.string()
  .min(1, 'City is required')
  .max(100, 'City name too long')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s'-]+$/, 'Invalid characters in city name')
  .transform(sanitizeInput);

// Address validation
export const addressSchema = z.string()
  .min(1, 'Address is required')
  .max(500, 'Address too long')
  .transform(sanitizeInput);

// Description validation
export const descriptionSchema = z.string()
  .max(1000, 'Description too long')
  .transform(sanitizeHtml);

// Price validation
export const priceSchema = z.number()
  .min(0, 'Price cannot be negative')
  .max(10000000, 'Price too high')
  .finite('Invalid price');

// Seats validation
export const seatsSchema = z.number()
  .int('Seats must be a whole number')
  .min(1, 'At least 1 seat required')
  .max(8, 'Maximum 8 seats allowed');

// User profile validation schema
export const userProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema,
  about: descriptionSchema.optional(),
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional(),
});

// Ride creation validation schema
export const rideSchema = z.object({
  from_city: citySchema,
  to_city: citySchema,
  pickup_address: addressSchema,
  dropoff_address: addressSchema,
  departure_date: z.date(),
  departure_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  available_seats: seatsSchema,
  price_per_seat: priceSchema,
  description: descriptionSchema.optional(),
  passenger_pickup_instructions: descriptionSchema.optional(),
  passenger_dropoff_instructions: descriptionSchema.optional(),
});

// Booking validation schema
export const bookingSchema = z.object({
  seats_booked: seatsSchema,
  pickup_location: addressSchema.optional(),
  notes: descriptionSchema.optional(),
});

// Message validation schema
export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long')
    .transform(sanitizeInput),
});

// Review validation schema
export const reviewSchema = z.object({
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: descriptionSchema.optional(),
});

// Enhanced rate limiting utilities with progressive blocking
const requestCounts = new Map<string, { 
  count: number; 
  resetTime: number; 
  attempts: number[];
  blocked: boolean;
  blockExpiry: number;
}>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime && (!value.blocked || now > value.blockExpiry)) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 3, // Reduced for security
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  blockDuration: number = 60 * 60 * 1000 // 1 hour block
): boolean => {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || (now > record.resetTime && (!record.blocked || now > record.blockExpiry))) {
    requestCounts.set(identifier, { 
      count: 1, 
      resetTime: now + windowMs,
      attempts: [now],
      blocked: false,
      blockExpiry: 0
    });
    return true;
  }
  
  // Check if currently blocked
  if (record.blocked && now < record.blockExpiry) {
    return false;
  }
  
  if (record.count >= maxRequests) {
    // Block user after too many attempts
    record.blocked = true;
    record.blockExpiry = now + blockDuration;
    record.attempts.push(now);
    return false;
  }
  
  record.count++;
  record.attempts.push(now);
  return true;
};

// CSRF protection
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length > 0;
};

// Input length validation
export const validateInputLength = (input: string, maxLength: number): boolean => {
  return input.length <= maxLength;
};

// Enhanced XSS protection utilities
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URLs
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
};

// Server-side UUID generation (for security)
export const generateSecureUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  throw new Error('Secure UUID generation not available. Use server-side generation.');
};

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
};