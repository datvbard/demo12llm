/**
 * Application-wide constants.
 * Centralizes magic numbers for better maintainability.
 */

// ============================================
// UI/UX Constants
// ============================================

/**
 * Debounce delay for auto-save and search (milliseconds).
 */
export const DEBOUNCE_DELAY_MS = 500

/**
 * Delay to reset save status indicator to idle (milliseconds).
 */
export const SAVE_STATUS_RESET_MS = 2000

/**
 * Maximum number of fields to display in summary cards.
 */
export const MAX_DISPLAY_FIELDS = 3

// ============================================
// Validation Constants
// ============================================

/**
 * Minimum password length.
 */
export const MIN_PASSWORD_LENGTH = 8

/**
 * Username length bounds.
 */
export const MIN_USERNAME_LENGTH = 3
export const MAX_USERNAME_LENGTH = 30

/**
 * Maximum Excel file size for upload (megabytes).
 */
export const MAX_EXCEL_FILE_SIZE_MB = 10

// ============================================
// Pagination Constants
// ============================================

/**
 * Default page size for paginated queries.
 */
export const DEFAULT_PAGE_SIZE = 20

/**
 * Maximum page size to prevent excessive queries.
 */
export const MAX_PAGE_SIZE = 100

// ============================================
// Rate Limiting Constants
// ============================================

/**
 * Rate limit: requests per minute per IP.
 */
export const RATE_LIMIT_REQUESTS = 100

/**
 * Rate limit: time window in milliseconds.
 */
export const RATE_LIMIT_WINDOW_MS = 60000

// ============================================
// Cache Duration Constants (for future use)
// ============================================

/**
 * Cache TTL for frequently accessed data (seconds).
 */
export const CACHE_TTL_SECONDS = 300

/**
 * Cache TTL for rarely changing data (seconds).
 */
export const LONG_CACHE_TTL_SECONDS = 3600
