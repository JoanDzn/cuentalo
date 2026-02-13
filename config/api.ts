
export const getApiUrl = () => {
    // If explicitly set in environment, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Fallback for development on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }

    // Fallback for production (relative path if served from same origin)
    return '';
};
