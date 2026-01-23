import { z } from 'zod'

/**
 * Common validation schemas and utilities.
 */

/**
 * UUID v4 schema validator.
 */
export const uuidSchema = z.string().uuid('Invalid UUID format')

/**
 * CUID schema validator (Prisma default ID format).
 * CUID format: starts with 'c', followed by 24 alphanumeric chars.
 */
export const cuidSchema = z.string().regex(/^c[a-z0-9]{24}$/, 'Invalid CUID format')

/**
 * ID schema validator - accepts both UUID and CUID.
 */
export const idSchema = z.string().min(1, 'ID is required')

/**
 * Validate UUID string.
 * Returns the UUID if valid, null otherwise.
 *
 * @param id - The string to validate
 * @returns The UUID string if valid, null if invalid
 */
export function validateUUID(id: string): string | null {
  const result = uuidSchema.safeParse(id)
  return result.success ? result.data : null
}

/**
 * Validate ID string (UUID or CUID).
 * Returns the ID if valid, null otherwise.
 */
export function validateID(id: string): string | null {
  if (!id || typeof id !== 'string') return null
  // Accept CUID (starts with 'c', 25 chars) or UUID format
  const isCuid = /^c[a-z0-9]{24}$/.test(id)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  return (isCuid || isUuid) ? id : null
}

/**
 * Validate UUID or throw 400 error.
 * Use in API routes that receive UUID parameters.
 *
 * @param id - The string to validate
 * @param fieldName - The field name for error message
 * @returns The validated UUID string
 * @throws z.ZodError if validation fails
 */
export function validateUUIDOrThrow(id: string, fieldName: string = 'ID'): string {
  return uuidSchema.parse(id)
}

/**
 * Email schema validator.
 */
export const emailSchema = z.string().email('Invalid email format')

/**
 * Username schema (alphanumeric, underscore, hyphen, 3-30 chars).
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

/**
 * Password schema (min 8 chars).
 * Note: More strict validation should be done at registration time.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

/**
 * Strong password schema with complexity requirements.
 * Use for new user registration or password changes.
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Phải chứa ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Phải chứa ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Phải chứa ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Phải chứa ít nhất 1 ký tự đặc biệt')

/**
 * Check password strength (returns 0-4 score).
 * 0 = very weak, 4 = very strong
 */
export function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

/**
 * Get password strength label (Vietnamese).
 */
export function getPasswordStrengthLabel(password: string): string {
  const score = getPasswordStrength(password)
  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']
  return labels[score]
}

/**
 * Pagination params schema.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type PaginationParams = z.infer<typeof paginationSchema>
