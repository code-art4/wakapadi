// lib/constants.ts or utils/imageConfig.ts

// Define an array of hostnames that Next.js 'next/image' is configured to optimize.
// These must precisely match the hostnames in your next.config.js remotePatterns.
export const OPTIMIZABLE_IMAGE_HOSTNAMES = [
    'cdn.paris-walks.com',
    // Add other hostnames here if you configure them in next.config.js
    // 'another-optimizable-cdn.com',
  ];
  
  /**
   * Checks if a given URL's hostname is configured for Next.js image optimization.
   * @param urlString The image URL to check.
   * @returns True if the hostname is in the optimizable list, false otherwise.
   */
  export const isOptimizableImage = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return OPTIMIZABLE_IMAGE_HOSTNAMES.includes(url.hostname);
    } catch (e) {
      // Handle invalid URLs gracefully
      console.warn("Invalid URL provided for image optimization check:", urlString, e);
      return false;
    }
  };