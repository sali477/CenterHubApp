import { useEffect, useRef, useState } from 'react';

let mapsScriptPromise = null;

const loadGoogleMaps = (apiKey) => {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
};

const GoogleMapView = ({
  centers = [],
  center,
  userLocation = null,
  height = '400px',
  zoom = 12,
  onCenterClick,
  className = '',
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key not configured');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const initMap = async () => {
      try {
        const maps = await loadGoogleMaps(apiKey);
        if (cancelled || !mapRef.current) return;

        const defaultCenter = center?.location?.coordinates
          ? { lat: center.location.coordinates[1], lng: center.location.coordinates[0] }
          : userLocation || { lat: 33.5731, lng: -7.5898 };

        const map = new maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: center ? 15 : zoom,
          mapId: 'centrehub_map',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const items = center ? [center] : centers;

        items.forEach((c) => {
          if (!c.location?.coordinates) return;

          const position = {
            lat: c.location.coordinates[1],
            lng: c.location.coordinates[0],
          };

          const marker = new maps.Marker({
            map,
            position,
            title: c.name,
            animation: maps.Animation.DROP,
          });

          const infoContent = `
            <div style="padding:8px;max-width:220px">
              <strong>${c.name}</strong>
              <p style="margin:4px 0;font-size:12px;color:#666">${c.address?.city || 'Morocco'}</p>
              ${c.rating ? `<p style="font-size:12px">★ ${c.rating.toFixed(1)}</p>` : ''}
              <a href="/centers/${c._id}" style="font-size:12px;color:#2563eb">View center →</a>
            </div>
          `;

          const infoWindow = new maps.InfoWindow({ content: infoContent });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            onCenterClick?.(c);
          });

          markersRef.current.push(marker);
        });

        if (userLocation && !center) {
          const userMarker = new maps.Marker({
            map,
            position: userLocation,
            title: 'Your location',
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
          });
          markersRef.current.push(userMarker);
        }

        if (items.length > 1 && items.some((c) => c.location?.coordinates)) {
          const bounds = new maps.LatLngBounds();
          items.forEach((c) => {
            if (c.location?.coordinates) {
              bounds.extend({
                lat: c.location.coordinates[1],
                lng: c.location.coordinates[0],
              });
            }
          });
          if (userLocation) bounds.extend(userLocation);
          map.fitBounds(bounds, { padding: 50 });
        }

        setLoading(false);
      } catch {
        setError('Failed to load Google Maps');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      cancelled = true;
    };
  }, [apiKey, centers, center, userLocation, zoom, onCenterClick]);

  if (error) {
    return (
      <div
        className={`bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm ${className}`}
        style={{ height }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-10">
          <span className="text-gray-500 text-sm">Loading map...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMapView;
