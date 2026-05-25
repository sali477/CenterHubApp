import { SUBJECTS } from '../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../../store/slices/uiSlice';

const FilterPanel = ({ onApply }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.ui);

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleApply = () => {
    onApply?.(filters);
  };

  const handleReset = () => {
    dispatch(resetFilters());
    onApply?.({});
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button onClick={handleReset} className="text-sm text-primary-600 hover:underline">
          Reset
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <select
          value={filters.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Distance: {filters.distance}km
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={filters.distance}
          onChange={(e) => handleChange('distance', parseInt(e.target.value))}
          className="w-full accent-primary-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Rating: {filters.rating}★
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={filters.rating}
          onChange={(e) => handleChange('rating', parseFloat(e.target.value))}
          className="w-full accent-primary-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (MAD)</label>
        <select
          value={filters.price}
          onChange={(e) => handleChange('price', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">Any price</option>
          <option value="0-500">0 - 500 MAD</option>
          <option value="500-1000">500 - 1000 MAD</option>
          <option value="1000-3000">1000 - 3000 MAD</option>
          <option value="3000-99999">3000+ MAD</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={filters.popularity}
          onChange={(e) => handleChange('popularity', e.target.checked)}
          className="rounded border-gray-300 text-primary-600"
        />
        Sort by popularity
      </label>

      <button onClick={handleApply} className="btn-primary w-full">
        Apply Filters
      </button>
    </div>
  );
};

export default FilterPanel;
