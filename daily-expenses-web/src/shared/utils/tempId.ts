/**
 * Temporary ID utilities for optimistic UI updates
 * 
 * Used when creating entities before server responds with real IDs.
 * Temporary IDs allow optimistic cache updates while maintaining unique keys.
 * 
 * Format: `temp-{timestamp}-{random}`
 * Example: `temp-1737283200000-x9k2p4m`
 * 
 * @see Story 2.5: Optimistic UI for Instant Expense Entry
 */

/**
 * Generates a unique temporary ID for optimistic updates
 * 
 * @returns Temporary ID string with format: temp-{timestamp}-{random}
 * @example
 * const tempId = generateTempId(); // "temp-1737283200000-x9k2p4m"
 */
export function generateTempId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `temp-${timestamp}-${random}`;
}

/**
 * Checks if a given ID is a temporary ID
 * 
 * @param id - ID string to check
 * @returns true if ID is temporary, false otherwise
 * @example
 * isTempId("temp-1737283200000-x9k2p4m") // true
 * isTempId("550e8400-e29b-41d4-a716-446655440000") // false
 */
export function isTempId(id: string): boolean {
  return id.startsWith('temp-');
}

/**
 * Type alias for expense IDs (can be real UUID or temporary ID)
 * Used for type safety when working with both temporary and real IDs
 */
export type ExpenseId = string;
