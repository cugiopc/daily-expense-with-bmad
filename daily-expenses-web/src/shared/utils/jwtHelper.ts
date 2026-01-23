/**
 * JWT token utilities
 * 
 * Provides functions to decode and extract information from JWT tokens
 * without requiring external libraries.
 * 
 * SECURITY NOTE: This only DECODES tokens, it does NOT verify signatures.
 * Token verification is done on the backend. This is safe for reading
 * non-sensitive claims like userId.
 */

interface JwtPayload {
  userId?: string;
  sub?: string; // JWT standard subject claim
  nameid?: string; // .NET JWT short form for NameIdentifier
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string; // .NET full URI
  email?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decodes a JWT token and extracts the payload
 * 
 * @param token - JWT token string
 * @returns Decoded payload object
 * @throws Error if token is invalid or malformed
 */
export function decodeJwt(token: string): JwtPayload {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode base64url payload (second part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    throw new Error('Invalid JWT token');
  }
}

/**
 * Extracts userId from JWT token
 *
 * Supports multiple claim formats to ensure compatibility:
 * - 'userId' (custom field)
 * - 'sub' (JWT standard subject claim)
 * - 'nameid' (.NET JWT short form for ClaimTypes.NameIdentifier)
 * - Full .NET claim type URI
 *
 * @param token - JWT token string
 * @returns userId string or null if not found
 */
export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;

  try {
    const payload = decodeJwt(token);
    // Check all possible variations of user ID claim
    return (
      payload.userId ||
      payload.sub ||
      payload.nameid ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Checks if JWT token is expired
 * 
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    const payload = decodeJwt(token);
    if (!payload.exp) return false;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
}
