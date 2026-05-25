import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiLoader } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery } from '../../store/slices/uiSlice';
import { smartSearchCenters } from '../../store/slices/centerSlice';
import { getCurrentLocation } from '../../utils/helpers';

const SearchBar = ({ onSearch, placeholder = 'Search centers, courses, or ask AI...' }) => {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector((state) => state.ui);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    dispatch(setSearchQuery(searchQuery));

    if (useAI || searchQuery.includes('near me') || searchQuery.includes('want')) {
      setLoading(true);
      try {
        let location = null;
        try {
          location = await getCurrentLocation();
        } catch {
          /* location optional */
        }

        await dispatch(
          smartSearchCenters({
            query: searchQuery,
            lat: location?.lat,
            lng: location?.lng,
          })
        ).unwrap();
      } finally {
        setLoading(false);
      }
    }

    onSearch?.(searchQuery);
  };

  const handleLocationSearch = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      dispatch(setSearchQuery('centers near me'));
      await dispatch(
        smartSearchCenters({
          query: 'educational centers near me',
          lat: location.lat,
          lng: location.lng,
        })
      ).unwrap();
      onSearch?.('near me', location);
    } catch {
      alert('Unable to get your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <FiSearch className="ml-4 text-gray-400 w-5 h-5 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder={placeholder}
          className="flex-1 px-4 py-3.5 outline-none text-gray-700 placeholder-gray-400"
        />
        <button
          type="button"
          onClick={handleLocationSearch}
          disabled={loading}
          className="p-3 text-gray-500 hover:text-primary-600 transition-colors"
          title="Search near me"
        >
          {loading ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiMapPin className="w-5 h-5" />}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <label className="flex items-center gap-2 mt-2 text-sm text-gray-500 cursor-pointer">
        <input
          type="checkbox"
          checked={useAI}
          onChange={(e) => setUseAI(e.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Use AI smart search (e.g., "I want a programming center near me")
      </label>
    </motion.form>
  );
};

export default SearchBar;
