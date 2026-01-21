import { z } from 'zod'

/**
 * Common validation schemas and utilities.
 */

/**
 * UUID v4 schema validator.
 */
export const uuidSchema = z.string().uuid('Invalid UUID format')

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
 * Pagination params schema.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type PaginationParams = z.infer<typeof paginationSchema>
