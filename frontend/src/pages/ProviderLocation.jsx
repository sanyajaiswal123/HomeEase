import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  MapPin,
  Compass,
  Navigation,
  Save,
  Plus,
  X,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building,
  Map,
  Sliders
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import RetryState from '../components/ui/RetryState';

export const ProviderLocation = () => {
  const { user, setUser: setAuthUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [coordinates, setCoordinates] = useState(null); // [longitude, latitude]

  const [serviceRadiusKm, setServiceRadiusKm] = useState(25);
  const [servedCities, setServedCities] = useState([]);
  const [newCityTag, setNewCityTag] = useState('');

  const [servedZipCodes, setServedZipCodes] = useState([]);
  const [newZipTag, setNewZipTag] = useState('');

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [geoDetecting, setGeoDetecting] = useState(false);

  const fetchLocationSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/auth/provider/location');
      const data = res.data.data;
      if (data.address) {
        setStreet(data.address.street || '');
        setCity(data.address.city || '');
        setState(data.address.state || '');
        setZipCode(data.address.zipCode || '');
        if (data.address.coordinates) setCoordinates(data.address.coordinates);
      }
      setServiceRadiusKm(data.serviceRadiusKm || 25);
      setServedCities(data.servedCities || []);
      setServedZipCodes(data.servedZipCodes || []);
    } catch (err) {
      console.error('Error fetching provider location settings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationSettings();
  }, []);

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGeoDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoordinates([lng, lat]);
        setGeoDetecting(false);
        alert(`Location detected! Coordinates: [${lng.toFixed(4)}, ${lat.toFixed(4)}]`);
      },
      (err) => {
        setGeoDetecting(false);
        console.warn('Geolocation permission error:', err.message);
        alert('Could not detect location. Please enter your address manually.');
      },
      { timeout: 10000 }
    );
  };

  const handleAddCity = (e) => {
    e.preventDefault();
    if (!newCityTag.trim()) return;
    const trimmed = newCityTag.trim();
    if (!servedCities.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setServedCities([...servedCities, trimmed]);
    }
    setNewCityTag('');
  };

  const handleRemoveCity = (cityToRemove) => {
    setServedCities(servedCities.filter((c) => c !== cityToRemove));
  };

  const handleAddZip = (e) => {
    e.preventDefault();
    if (!newZipTag.trim()) return;
    const trimmed = newZipTag.trim();
    if (!servedZipCodes.includes(trimmed)) {
      setServedZipCodes([...servedZipCodes, trimmed]);
    }
    setNewZipTag('');
  };

  const handleRemoveZip = (zipToRemove) => {
    setServedZipCodes(servedZipCodes.filter((z) => z !== zipToRemove));
  };

  const handleSaveLocationSettings = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    if (!city.trim()) {
      return setSaveError('Primary Base City is required.');
    }

    setSaveLoading(true);
    try {
      const res = await apiClient.put('/auth/provider/location', {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        coordinates,
        serviceRadiusKm: Number(serviceRadiusKm),
        servedCities,
        servedZipCodes
      });

      setSaveSuccess(res.data.message || 'Location & service area updated successfully!');
      if (setAuthUser && res.data.data.user) {
        setAuthUser(res.data.data.user);
      }
    } catch (err) {
      setSaveError(err.friendlyMessage || 'Failed to update location settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Location & Service Area
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Define your operating base and the cities/localities where you accept customer service requests.
          </p>
        </div>

        <Button
          onClick={handleDetectCurrentLocation}
          variant="secondary"
          loading={geoDetecting}
          icon={<Compass size={18} className="text-primary" />}
          className="rounded-2xl font-bold shadow-xs shrink-0"
        >
          {geoDetecting ? 'Detecting...' : 'Use Current GPS'}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-[28px]" />
      ) : error ? (
        <RetryState error={error} onRetry={fetchLocationSettings} />
      ) : (
        <form onSubmit={handleSaveLocationSettings} className="flex flex-col gap-8">
          {saveError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> {saveSuccess}
            </div>
          )}

          {/* Primary Base Location Card */}
          <Card className="p-6 sm:p-8 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col gap-6">
            <h3 className="text-xl font-extrabold text-gray-900 font-outfit pb-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin size={20} className="text-primary" /> Primary Operating Base
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                  Street / Area Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62, Commercial Hub"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                  Base City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorakhpur / Noida"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                  State / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uttar Pradesh"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                  PIN / Zip Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 273001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                  GPS Coordinates Status
                </label>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 flex items-center justify-between">
                  <span>
                    {coordinates && coordinates.length === 2
                      ? `[${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}]`
                      : 'Coordinates not set'}
                  </span>
                  <Badge variant={coordinates ? 'success' : 'secondary'} className="text-[10px] font-bold">
                    {coordinates ? 'GPS Active' : 'Manual'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Service Radius Card */}
          <Card className="p-6 sm:p-8 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-extrabold text-gray-900 font-outfit flex items-center gap-2">
                <Sliders size={20} className="text-primary" /> Service Radius Coverage
              </h3>
              <Badge variant="info" className="text-sm font-extrabold px-4 py-1.5 rounded-xl">
                {serviceRadiusKm} Km Radius
              </Badge>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-xs font-bold text-text-secondary">
                <span>5 Km (Local Area)</span>
                <span>25 Km (City-wide)</span>
                <span>50 Km (Metro)</span>
                <span>100 Km (Regional)</span>
              </div>

              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />

              <p className="text-xs text-gray-500 font-medium">
                Customer bookings within <strong>{serviceRadiusKm} Km</strong> of your base location will automatically match your provider profile.
              </p>
            </div>
          </Card>

          {/* Multiple Served Cities & Localities Manager */}
          <Card className="p-6 sm:p-8 bg-white border border-border-light rounded-[28px] shadow-soft flex flex-col gap-6">
            <h3 className="text-xl font-extrabold text-gray-900 font-outfit pb-4 border-b border-gray-100 flex items-center gap-2">
              <Building size={20} className="text-primary" /> Additional Served Cities & Localities
            </h3>

            {/* City Tags Manager */}
            <div className="flex flex-col gap-3">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                Served Cities / Regions List
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Gorakhpur, Deoria, Lucknow"
                  value={newCityTag}
                  onChange={(e) => setNewCityTag(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button
                  type="button"
                  onClick={handleAddCity}
                  variant="secondary"
                  icon={<Plus size={16} />}
                  className="rounded-xl font-bold"
                >
                  Add City
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {city && (
                  <span className="bg-primary/10 text-primary px-3.5 py-1.5 rounded-xl text-xs font-extrabold border border-primary/20 flex items-center gap-1.5">
                    {city} (Base City)
                  </span>
                )}
                {servedCities.map((c, idx) => (
                  <span
                    key={idx}
                    className="bg-teal-50 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-teal-200 flex items-center gap-1.5"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(c)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {servedCities.length === 0 && !city && (
                  <span className="text-xs text-gray-400 font-medium">No additional served cities added yet.</span>
                )}
              </div>
            </div>

            {/* ZIP Codes Manager */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                Specific PIN / ZIP Codes Coverage
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 273001"
                  value={newZipTag}
                  onChange={(e) => setNewZipTag(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
                <Button
                  type="button"
                  onClick={handleAddZip}
                  variant="secondary"
                  icon={<Plus size={16} />}
                  className="rounded-xl font-bold"
                >
                  Add PIN
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {servedZipCodes.map((z, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border border-gray-200 flex items-center gap-1.5"
                  >
                    {z}
                    <button
                      type="button"
                      onClick={() => handleRemoveZip(z)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Privacy & Customer Discovery Note */}
          <Card className="p-6 bg-gray-50 border border-gray-200 rounded-[26px]">
            <div className="flex items-start gap-3 text-xs text-gray-600 font-medium">
              <Shield size={18} className="text-gray-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 font-bold block mb-0.5">
                  Location Privacy Guarantee
                </strong>
                <span>
                  Your exact home street address is kept strictly confidential and is never published in open search listings. Customers only see your general service city, radius coverage, and verified localities.
                </span>
              </div>
            </div>
          </Card>

          {/* Submit Action */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              icon={<Save size={18} />}
              className="rounded-2xl px-8 py-3.5 font-bold shadow-md"
            >
              Save Location & Service Area
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProviderLocation;
