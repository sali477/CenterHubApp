import { useState, useEffect } from 'react';
import { FiUpload, FiMapPin, FiSave } from 'react-icons/fi';
import { centerAPI, uploadAPI } from '../../../api/index';
import useMyCenter from '../../../hooks/useMyCenter';
import { SUBJECTS, getCurrentLocation } from '../../../utils/helpers';
import GoogleMapView from '../../../components/maps/GoogleMapView';
import CreateCenterForm from './CreateCenterForm';

const CenterProfileEdit = () => {
  const { center, loading, refresh } = useMyCenter();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (center) {
      setForm({
        name: center.name || '',
        description: center.description || '',
        phone: center.phone || '',
        email: center.email || '',
        website: center.website || '',
        subjects: center.subjects || [],
        latitude: center.location?.coordinates?.[1]?.toString() || '',
        longitude: center.location?.coordinates?.[0]?.toString() || '',
        address: {
          street: center.address?.street || '',
          city: center.address?.city || '',
          country: center.address?.country || 'Morocco',
        },
        priceRange: center.priceRange || { min: 0, max: 0 },
        logo: center.logo || '',
        coverImage: center.coverImage || '',
      });
    }
  }, [center]);

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;
  if (!form) return null;

  const toggleSubject = (s) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(s)
        ? prev.subjects.filter((x) => x !== s)
        : [...prev.subjects, s],
    }));
  };

  const useMyLocation = async () => {
    const loc = await getCurrentLocation();
    setForm((prev) => ({
      ...prev,
      latitude: loc.lat.toFixed(6),
      longitude: loc.lng.toFixed(6),
    }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await uploadAPI.image(fd);
      setForm((prev) => ({ ...prev, [field]: data.url }));
    } catch {
      alert('Upload failed');
    } finally {
      setUploading('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await centerAPI.update(center._id, form);
      setMessage('Profile saved successfully');
      refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Center Profile</h1>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Images */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Logo</p>
              <div className="flex items-center gap-4">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">Logo</div>
                )}
                <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                  <FiUpload /> {uploading === 'logo' ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageUpload(e, 'logo')} />
                </label>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Cover Image</p>
              <div className="flex items-center gap-4">
                {form.coverImage ? (
                  <img src={form.coverImage} alt="Cover" className="w-32 h-20 rounded-xl object-cover border" />
                ) : (
                  <div className="w-32 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Cover</div>
                )}
                <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                  <FiUpload /> {uploading === 'coverImage' ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageUpload(e, 'coverImage')} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>
          <input required className="input-field" placeholder="Center Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea required className="input-field" rows={4} placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <input className="input-field" placeholder="Website URL" value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>

        {/* Address */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Street" value={form.address.street}
              onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} />
            <input className="input-field" placeholder="City" value={form.address.city}
              onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
          </div>
        </div>

        {/* Subjects */}
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button key={s} type="button" onClick={() => toggleSubject(s)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  form.subjects.includes(s) ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-gray-200'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">GPS Location</h2>
            <button type="button" onClick={useMyLocation} className="text-sm text-primary-600 flex items-center gap-1">
              <FiMapPin /> Use my location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="Latitude" value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <input className="input-field" placeholder="Longitude" value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
          {form.latitude && form.longitude && (
            <GoogleMapView
              center={{
                ...center,
                location: {
                  coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)],
                },
              }}
              height="250px"
            />
          )}
        </div>

        {/* Price range */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Price Range (MAD)</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" min="0" className="input-field" placeholder="Min" value={form.priceRange.min}
              onChange={(e) => setForm({ ...form, priceRange: { ...form.priceRange, min: Number(e.target.value) } })} />
            <input type="number" min="0" className="input-field" placeholder="Max" value={form.priceRange.max}
              onChange={(e) => setForm({ ...form, priceRange: { ...form.priceRange, max: Number(e.target.value) } })} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default CenterProfileEdit;
