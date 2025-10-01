// Security utilities for file upload protection
import { NextRequest } from 'next/server'

// Allowed MIME types for print file uploads
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/postscript',
  'application/illustrator',
  'image/vnd.adobe.photoshop'
] as const

// Maximum file size (50MB for print files)
export const MAX_FILE_SIZE = 50 * 1024 * 1024

// Suspicious file patterns
export const SUSPICIOUS_PATTERNS = [
  /\.(exe|bat|cmd|scr|pif|com|msi)$/i,
  /\.(js|vbs|jar|php|asp|jsp|py|rb|pl)$/i,
  /\.(sh|ps1|psm1|bash|zsh)$/i,
  /\.(sql|db|sqlite|mdb)$/i,
  /script/i,
  /virus/i,
  /malware/i,
  /trojan/i,
  /backdoor/i,
  /exploit/i,
  /payload/i,
  /shellcode/i,
  /injection/i
]

// File extension validation mapping
export const VALID_EXTENSIONS: Record<string, readonly string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/svg+xml': ['svg'],
  'application/pdf': ['pdf'],
  'application/postscript': ['eps', 'ai'],
  'application/illustrator': ['ai'],
  'image/vnd.adobe.photoshop': ['psd']
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
  sanitizedFileName?: string
}

/**
 * Comprehensive file validation for security
 */
export function validateFileSecurity(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: readonly string[]
    strictValidation?: boolean
  } = {}
): FileValidationResult {
  const {
    maxSize = MAX_FILE_SIZE,
    allowedTypes = ALLOWED_IMAGE_TYPES
  } = options

  // 1. Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / (1024 * 1024))}MB`
    }
  }

  // 2. Check if file is too small (suspicious)
  if (file.size < 100) {
    return {
      isValid: false,
      error: 'File appears to be corrupted or invalid'
    }
  }

  // 3. Validate MIME type
  if (!allowedTypes.includes(file.type as typeof allowedTypes[number])) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Only image files are permitted.`
    }
  }

  // 4. Validate file extension matches MIME type
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (fileExtension && file.type in VALID_EXTENSIONS) {
    const validExtensions = VALID_EXTENSIONS[file.type]
    if (validExtensions && !validExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'File extension does not match the file type'
      }
    }
  }

  // 5. Check for suspicious file names
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(file.name))) {
    return {
      isValid: false,
      error: 'File name contains suspicious patterns and cannot be uploaded'
    }
  }

  // 6. Sanitize file name
  const sanitizedFileName = sanitizeFileName(file.name)

  return {
    isValid: true,
    sanitizedFileName
  }
}

/**
 * Sanitize file name to prevent path traversal and other attacks
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/[\/\\]/g, '_')
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '')
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_')
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop()
    const nameWithoutExt = sanitized.substring(0, 255 - (extension?.length || 0) - 1)
    sanitized = `${nameWithoutExt}.${extension}`
  }
  
  return sanitized
}

/**
 * Check if file content appears to be a real image
 * This is a basic check - in production, you'd want more sophisticated validation
 */
export function isLikelyImageFile(file: File): boolean {
  // Check file size is reasonable for an image
  if (file.size < 100 || file.size > MAX_FILE_SIZE) {
    return false
  }
  
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return false
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  const validExtensions = Object.values(VALID_EXTENSIONS).flat()
  
  if (!extension || !validExtensions.includes(extension)) {
    return false
  }
  
  return true
}

/**
 * Log security events for monitoring
 */
export function logSecurityEvent(
  event: 'file_upload_blocked' | 'suspicious_file' | 'validation_failed',
  details: {
    fileName: string
    fileSize: number
    fileType: string
    userAgent?: string
    ip?: string
    reason: string
  }
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: {
      ...details,
      // Don't log sensitive information
      fileName: sanitizeFileName(details.fileName)
    }
  }
  
  // In production, you'd send this to your logging service
  console.warn('Security Event:', JSON.stringify(logEntry, null, 2))
  
  // You could also send to external security monitoring service
  // await sendToSecurityService(logEntry)
}

/**
 * Rate limiting for file uploads
 */
const uploadAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkUploadRateLimit(
  identifier: string, // Could be IP, user ID, etc.
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now()
  const attempts = uploadAttempts.get(identifier)
  
  if (!attempts) {
    uploadAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    uploadAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }
  
  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return { allowed: false, remainingAttempts: 0 }
  }
  
  // Increment counter
  attempts.count++
  attempts.lastAttempt = now
  uploadAttempts.set(identifier, attempts)
  
  return { allowed: true, remainingAttempts: maxAttempts - attempts.count }
}

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}
