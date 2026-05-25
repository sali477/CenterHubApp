import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiMap, FiList } from 'react-icons/fi';
import { fetchCenters } from '../store/slices/centerSlice';
import { getCurrentLocation } from '../utils/helpers';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import CenterCard from '../components/centers/CenterCard';
import GoogleMapView from '../components/maps/GoogleMapView';

const Centers = () => {
  const dispatch = useDispatch();
  const { list: centers, loading } = useSelector((state) => state.centers);
  const { filters } = useSelector((state) => state.ui);
  const [viewMode, setViewMode] = useState('list');
  const [userLocation, setUserLocation] = useState(null);

  const loadCenters = async (extraParams = {}) => {
    const params = { ...extraParams };

    if (filters.subject) params.subject = filters.subject;
    if (filters.rating) params.rating = filters.rating;
    if (filters.price) params.price = filters.price;
    if (filters.popularity) params.popularity = 'true';
    params.radius = filters.distance;

    try {
      const location = await getCurrentLocation();
      params.lat = location.lat;
      params.lng = location.lng;
      setUserLocation(location);
    } catch {
      /* location optional */
    }

    dispatch(fetchCenters(params));
  };

  useEffect(() => {
    loadCenters();
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="section-title">Educational Centers</h1>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              <FiList /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              <FiMap /> Map
            </button>
          </div>
        </div>
        <SearchBar onSearch={() => loadCenters()} />
      </div>

      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <FilterPanel onApply={() => loadCenters()} />
            <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
              {centers.map((center, i) => (
                <CenterCard key={center._id} center={center} index={i} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 order-1 lg:order-2">
            <GoogleMapView
              centers={centers}
              userLocation={userLocation}
              height="600px"
              className="card"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FilterPanel onApply={() => loadCenters()} />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card h-64 animate-pulse bg-gray-100" />
                ))}
              </div>
            ) : centers.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                No centers found. Try adjusting your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {centers.map((center, i) => (
                  <CenterCard key={center._id} center={center} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Centers;
