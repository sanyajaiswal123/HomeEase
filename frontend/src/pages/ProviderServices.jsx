import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  Wrench,
  Zap,
  Sparkles,
  Wind,
  Home,
  Paintbrush,
  Hammer,
  Bug,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  Tag,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'AC Repair',
  'Appliance Repair',
  'Painting',
  'Carpentry',
  'Pest Control'
];

const PRESET_IMAGES = {
  'AC Repair': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
  'Electrical': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  'Appliance Repair': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80',
  'Painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
  'Carpentry': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
  'Pest Control': 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=600&q=80'
};

export const ProviderServices = () => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [image, setImage] = useState('');
  const [subServices, setSubServices] = useState([]);

  // Sub-service input buffer
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/services/my');
      setServices(res.data.data.services || []);
    } catch (err) {
      console.error('Error fetching provider services:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setCategory(CATEGORIES[0]);
    setDescription('');
    setBasePrice('');
    setImage(PRESET_IMAGES[CATEGORIES[0]] || '');
    setSubServices([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setName(service.name);
    setCategory(service.category || CATEGORIES[0]);
    setDescription(service.description);
    setBasePrice(service.basePrice.toString());
    setImage(service.image || PRESET_IMAGES[service.category] || '');
    setSubServices(service.subServices || []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    if (!image || Object.values(PRESET_IMAGES).includes(image)) {
      setImage(PRESET_IMAGES[cat] || '');
    }
  };

  const handleAddSubService = () => {
    if (!subName.trim()) {
      alert('Please enter sub-service name');
      return;
    }
    const priceNum = Number(subPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter valid positive price for sub-service');
      return;
    }
    setSubServices([...subServices, { name: subName.trim(), price: priceNum, isActive: true }]);
    setSubName('');
    setSubPrice('');
  };

  const handleRemoveSubService = (index) => {
    setSubServices(subServices.filter((_, i) => i !== index));
  };

  // Submit Create / Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!name.trim()) return setFormError('Please enter a service name.');
    if (!category.trim()) return setFormError('Please select a category.');
    if (!description.trim()) return setFormError('Please enter a service description.');

    const priceNum = Number(basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return setFormError('Price must be a positive number greater than 0.');
    }
    if (priceNum > 1000000) {
      return setFormError('Price exceeds maximum allowed limit (₹1,000,000).');
    }

    setFormLoading(true);

    const payload = {
      name: name.trim(),
      category,
      description: description.trim(),
      basePrice: priceNum,
      image: image || PRESET_IMAGES[category] || '',
      subServices
    };

    try {
      if (editingService) {
        await apiClient.put(`/services/provider-services/${editingService._id}`, payload);
        alert('Service updated successfully!');
      } else {
        await apiClient.post('/services/provider-services', payload);
        alert('Service created successfully! It is now active for customer bookings.');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      setFormError(err.friendlyMessage || 'Failed to save service.');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle Active / Inactive
  const handleToggleStatus = async (serviceId) => {
    try {
      const res = await apiClient.patch(`/services/provider-services/${serviceId}/toggle`);
      fetchServices();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to toggle service status.');
    }
  };

  // Delete / Archive Service
  const handleDeleteService = async (service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.name}"?`)) return;

    try {
      const res = await apiClient.delete(`/services/provider-services/${service._id}`);
      alert(res.data.message || 'Service deleted');
      fetchServices();
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to delete service.');
    }
  };

  // Filtering
  const filteredServices = services.filter((s) => {
    if (statusFilter === 'active' && !s.isActive) return false;
    if (statusFilter === 'inactive' && s.isActive) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCat = s.category?.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      return matchName || matchCat || matchDesc;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header & Add Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[28px] border border-border-light shadow-soft">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            My Service Catalog
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Create, edit, price, and manage the services you offer to customers across HomeEase.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          variant="primary"
          icon={<Plus size={18} />}
          className="rounded-2xl px-6 py-3.5 font-bold shadow-md shrink-0"
        >
          Add New Service
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[24px] bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your services by name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto w-full md:w-auto shrink-0 gap-1">
          {[
            { id: 'all', label: `All (${services.length})` },
            { id: 'active', label: `Active (${services.filter((s) => s.isActive).length})` },
            { id: 'inactive', label: `Inactive (${services.filter((s) => !s.isActive).length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Service Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 w-full rounded-[24px]" />
          <Skeleton className="h-72 w-full rounded-[24px]" />
          <Skeleton className="h-72 w-full rounded-[24px]" />
        </div>
      ) : error ? (
        <RetryState error={error} onRetry={fetchServices} />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          title={services.length === 0 ? "You haven't added any services yet" : "No matching services"}
          description={
            services.length === 0
              ? "Start adding services you specialize in so customers can find and book you."
              : "Try clearing your search query or filter selection."
          }
          action={
            services.length === 0 && (
              <Button onClick={openCreateModal} variant="primary" icon={<Plus size={16} />}>
                Add Your First Service
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card
              key={service._id}
              className={`border shadow-soft rounded-[26px] bg-white overflow-hidden flex flex-col justify-between transition-all hover:shadow-elevated ${
                service.isActive ? 'border-gray-200' : 'border-gray-300 opacity-85 bg-gray-50/50'
              }`}
            >
              {/* Image Preview Banner */}
              <div className="h-44 w-full relative bg-gray-100 overflow-hidden">
                <img
                  src={service.image || PRESET_IMAGES[service.category] || PRESET_IMAGES['Plumbing']}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <Badge variant="primary" className="font-bold text-xs bg-white/90 text-gray-900 backdrop-blur-md shadow-sm">
                    {service.category || 'General'}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <Badge
                    variant={service.isActive ? 'success' : 'error'}
                    className="font-bold text-xs uppercase px-3 py-1 shadow-sm"
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                  <strong className="text-2xl font-extrabold font-outfit drop-shadow-md">
                    ₹{service.basePrice}
                    <span className="text-xs font-normal opacity-90 block text-gray-200">Starting price</span>
                  </strong>
                </div>
              </div>

              {/* Service Body */}
              <Card.Body className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 font-outfit mb-2">
                    {service.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {service.subServices?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                        Sub-services ({service.subServices.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {service.subServices.slice(0, 3).map((sub, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                          >
                            {sub.name} (₹{sub.price})
                          </span>
                        ))}
                        {service.subServices.length > 3 && (
                          <span className="text-[11px] text-primary font-bold self-center">
                            +{service.subServices.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-2">
                  <button
                    onClick={() => handleToggleStatus(service._id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      service.isActive
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Power size={14} />
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-all border border-gray-200"
                      title="Edit Service"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteService(service)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-200"
                      title="Delete Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmitForm} className="flex flex-col gap-5 p-2">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
              Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Tap Repair & Installation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
                Base Starting Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="1000000"
                placeholder="499"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
              Service Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-2"
            />
            {image && (
              <img
                src={image}
                alt="Preview"
                className="h-28 w-full object-cover rounded-xl border border-gray-200"
                onError={() => setImage(PRESET_IMAGES[category] || '')}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
              Description *
            </label>
            <textarea
              rows="3"
              required
              placeholder="Describe what is included in this service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Sub-services Manager */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <span className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              Sub-services Included (Optional)
            </span>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Sub-service name (e.g. Pipe Leakage Fix)"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={subPrice}
                onChange={(e) => setSubPrice(e.target.value)}
                className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
              />
              <Button type="button" onClick={handleAddSubService} variant="secondary" size="sm">
                Add
              </Button>
            </div>

            {subServices.length > 0 && (
              <div className="flex flex-col gap-2">
                {subServices.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-200 text-xs"
                  >
                    <span className="font-bold text-gray-900">
                      {sub.name} <strong className="text-primary ml-2">₹{sub.price}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubService(idx)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={formLoading}
              className="rounded-xl font-bold shadow-md"
            >
              {editingService ? 'Update Service' : 'Create & Publish'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderServices;
