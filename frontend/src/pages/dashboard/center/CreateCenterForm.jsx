import { useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import { centerAPI } from '../../../api/index';
import { SUBJECTS, getCurrentLocation } from '../../../utils/helpers';

const CreateCenterForm = ({ onCreated }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    subjects: [],
    latitude: '',
    longitude: '',
    address: { street: '', city: '', country: 'Morocco' },
    priceRange: { min: 0, max: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSubject = (subject) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const useMyLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      setForm((prev) => ({
        ...prev,
        latitude: loc.lat.toFixed(6),
        longitude: loc.lng.toFixed(6),
      }));
    } catch {
      alert('Could not get your location. Enable GPS or enter coordinates manually.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await centerAPI.create(form);
      onCreated(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create center');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Create Your Center</h1>
      <p className="text-gray-500 mb-6">Set up your educational center on CentreHub Morocco</p>

      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Center Name *</label>
          <input required className="input-field" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea required className="input-field" rows={4} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input-field" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input className="input-field" value={form.address.city}
              onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
            <input className="input-field" value={form.address.street}
              onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button key={s} type="button" onClick={() => toggleSubject(s)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.subjects.includes(s)
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">GPS Location</label>
            <button type="button" onClick={useMyLocation}
              className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
              <FiMapPin /> Use my location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="Latitude" value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <input className="input-field" placeholder="Longitude" value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (MAD)</label>
            <input type="number" min="0" className="input-field" value={form.priceRange.min}
              onChange={(e) => setForm({ ...form, priceRange: { ...form.priceRange, min: Number(e.target.value) } })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (MAD)</label>
            <input type="number" min="0" className="input-field" value={form.priceRange.max}
              onChange={(e) => setForm({ ...form, priceRange: { ...form.priceRange, max: Number(e.target.value) } })} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Center'}
        </button>
      </form>
    </div>
  );
};

export default CreateCenterForm;
