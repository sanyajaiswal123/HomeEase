import React, { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState('Detecting location...');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const detectLocation = () => {
    setLoading(true);
    setError(null);
    setLocation('Detecting location...');

    if (!navigator.geolocation) {
      setLocation('Location unavailable');
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        try {
          // Reverse geocode using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) throw new Error('Geocoding service unavailable');
          const data = await response.json();

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state ||
            'Delhi';

          const country = data.address?.country || 'India';
          const formattedLocation = `${city}, ${country}`;

          setLocation(formattedLocation);
        } catch (err) {
          console.warn('Reverse geocoding failed:', err);
          setLocation('Current Location');
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        console.warn('Geolocation permission error:', geoError.message);
        setError(geoError.message);
        // Graceful fallback when user denies permission or unavailable
        setLocation('Delhi, India');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        coords,
        loading,
        error,
        detectLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
