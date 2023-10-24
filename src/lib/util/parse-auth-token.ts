// Note: This is a utility function to parse the auth token from the auth header.
export function parseAuthToken(authHeader: string) {
    return authHeader?.substring(7); //Remove Bearer prefix if set
}
