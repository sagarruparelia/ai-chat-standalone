import type { Location } from '../types/chat';

export const getLocation = async (): Promise<Location | null> => {
  // Try browser geolocation first
  const browserLocation = await getBrowserLocation();
  if (browserLocation) {
    return browserLocation;
  }

  // Fallback to IP-based location
  return getIpLocation();
};

const getBrowserLocation = (): Promise<Location | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
};

const getIpLocation = async (): Promise<Location | null> => {
  try {
    // Using ip-api.com for IP-based geolocation
    const response = await fetch('http://ip-api.com/json/');
    const data = await response.json();

    if (data.status === 'success' && data.lat && data.lon) {
      return {
        lat: data.lat,
        lng: data.lon,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get IP-based location:', error);
    return null;
  }
};
