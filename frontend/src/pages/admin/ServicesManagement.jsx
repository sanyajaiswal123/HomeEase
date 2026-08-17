import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Zap,
  Droplet,
  Tv,
  Sparkles,
  Hammer,
  Paintbrush,
  Shield,
  Truck,
  Scissors,
  Sliders,
  Package,
  Flame,
  Sun,
  Camera,
  Cpu,
  Wind,
  Home,
  Key,
  Box,
  Layers,
  Tag,
  IndianRupee,
  Eye,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Filter
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';

const AVAILABLE_ICONS = [
  { name: 'Zap', label: 'Electrical', icon: Zap },
  { name: 'Droplet', label: 'Plumbing', icon: Droplet },
  { name: 'Tv', label: 'Appliances', icon: Tv },
  { name: 'Sparkles', label: 'Cleaning', icon: Sparkles },
  { name: 'Hammer', label: 'Carpentry', icon: Hammer },
  { name: 'Paintbrush', label: 'Painting', icon: Paintbrush },
  { name: 'Wrench', label: 'General Repairs', icon: Wrench },
  { name: 'Shield', label: 'Security', icon: Shield },
  { name: 'Truck', label: 'Relocation/Moving', icon: Truck },
  { name: 'Scissors', label: 'Grooming/Beauty', icon: Scissors },
  { name: 'Sliders', label: 'Smart Home', icon: Sliders },
  { name: 'Package', label: 'Delivery', icon: Package },
  { name: 'Flame', label: 'Gas & Heating', icon: Flame },
  { name: 'Sun', label: 'Solar & Energy', icon: Sun },
  { name: 'Camera', label: 'CCTV & Systems', icon: Camera },
  { name: 'Cpu', label: 'Electronics', icon: Cpu },
  { name: 'Wind', label: 'AC & Ventilation', icon: Wind },
  { name: 'Home', label: 'Home Decor', icon: Home },
  { name: 'Key', label: 'Locksmith', icon: Key },
  { name: 'Box', label: 'Storage', icon: Box }
];

const renderServiceIcon = (iconName, size = 22, className = '') => {
  const match = AVAILABLE_ICONS.find((i) => i.name === iconName);
  const IconComp = match ? match.icon : Wrench;
  return <IconComp size={size} className={className} />;
};

export const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'subservices'

  // Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = add, object = edit
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: 'Wrench',
    basePrice: '',
    isActive: true
  });

  // Sub-service Modal States
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [editingSubService, setEditingSubService] = useState(null);
  const [subFormData, setSubFormData] = useState({
    name: '',
    price: '',
    description: '',
    isActive: true
  });

  // Category Sub-services Drawer / Expansion
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: 'category', // 'category' | 'subservice'
    categoryId: null,
    subId: null,
    title: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/services?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&sort=${sortBy}`
      );
      setServices(res.data.data.services || []);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [statusFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Stats calculation
  const totalCategories = services.length;
  const activeCategoriesCount = services.filter((s) => s.isActive !== false).length;
  const disabledCategoriesCount = services.filter((s) => s.isActive === false).length;
  const totalSubServicesCount = services.reduce(
    (acc, s) => acc + (s.subServices ? s.subServices.length : 0),
    0
  );

  // Open Category Modal for Create or Edit
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || 'Wrench',
        basePrice: category.basePrice || '',
        isActive: category.isActive !== false
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        icon: 'Wrench',
        basePrice: '',
        isActive: true
      });
    }
    setIsCategoryModalOpen(true);
  };

  // Submit Category (Add/Edit)
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim() || !categoryFormData.basePrice) {
      alert('Please fill in category name and base price.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCategory) {
        await apiClient.put(`/services/${editingCategory._id}`, categoryFormData);
      } else {
        await apiClient.post('/services', categoryFormData);
      }
      setIsCategoryModalOpen(false);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || err.friendlyMessage || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Category Active Status
  const handleToggleCategoryStatus = async (categoryId) => {
    try {
      await apiClient.patch(`/services/${categoryId}/toggle`);
      fetchServices();
    } catch (err) {
      alert('Failed to toggle category status.');
    }
  };

  // Delete Category
  const confirmDeleteCategory = (category) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'category',
      categoryId: category._id,
      subId: null,
      title: category.name
    });
  };

  // Open Sub-Service Modal for Create or Edit
  const openSubModal = (category, subService = null) => {
    setSelectedParentCategory(category);
    if (subService) {
      setEditingSubService(subService);
      setSubFormData({
        name: subService.name || '',
        price: subService.price || '',
        description: subService.description || '',
        isActive: subService.isActive !== false
      });
    } else {
      setEditingSubService(null);
      setSubFormData({
        name: '',
        price: '',
        description: '',
        isActive: true
      });
    }
    setIsSubModalOpen(true);
  };

  // Submit Sub-Service (Add/Edit)
  const handleSubSubmit = async (e) => {
    e.preventDefault();
    if (!subFormData.name.trim() || subFormData.price === '') {
      alert('Please fill in sub-service name and price.');
      return;
    }
    if (!selectedParentCategory) return;

    setSubmitting(true);
    try {
      if (editingSubService) {
        await apiClient.put(
          `/services/${selectedParentCategory._id}/subservices/${editingSubService._id}`,
          subFormData
        );
      } else {
        await apiClient.post(`/services/${selectedParentCategory._id}/subservices`, subFormData);
      }
      setIsSubModalOpen(false);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || err.friendlyMessage || 'Failed to save sub-service.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Sub-Service Status
  const handleToggleSubStatus = async (categoryId, subId) => {
    try {
      await apiClient.patch(`/services/${categoryId}/subservices/${subId}/toggle`);
      fetchServices();
    } catch (err) {
      alert('Failed to toggle sub-service status.');
    }
  };

  // Delete Sub-Service Confirmation
  const confirmDeleteSub = (category, sub) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'subservice',
      categoryId: category._id,
      subId: sub._id,
      title: sub.name
    });
  };

  // Confirm Delete Action Execution
  const handleExecuteDelete = async () => {
    setSubmitting(true);
    try {
      if (deleteConfirm.type === 'category') {
        await apiClient.delete(`/services/${deleteConfirm.categoryId}`);
      } else {
        await apiClient.delete(
          `/services/${deleteConfirm.categoryId}/subservices/${deleteConfirm.subId}`
        );
      }
      setDeleteConfirm({ isOpen: false, type: 'category', categoryId: null, subId: null, title: '' });
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || err.friendlyMessage || 'Failed to delete item.');
    } finally {
      setSubmitting(false);
    }
  };

  // All Sub-services flattened array for 'subservices' tab view
  const allSubServicesFlat = services.flatMap((category) =>
    (category.subServices || []).map((sub) => ({
      ...sub,
      categoryName: category.name,
      categoryIcon: category.icon,
      categoryId: category._id,
      categoryIsActive: category.isActive
    }))
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Services Management
          </h1>
          <p className="text-text-secondary font-medium text-sm mt-1">
            Manage household service categories, base pricing, icons, and individual sub-services.
          </p>
        </div>
        <Button
          onClick={() => openCategoryModal()}
          variant="primary"
          icon={<Plus size={18} />}
          className="rounded-xl px-5 py-2.5 shadow-md font-bold text-sm shrink-0"
        >
          Add Service Category
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 border border-border-light shadow-soft rounded-[20px] bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block">
              Categories
            </span>
            <span className="text-2xl font-extrabold text-gray-900 font-outfit">
              {loading ? <Skeleton width="40px" height="24px" /> : totalCategories}
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-border-light shadow-soft rounded-[20px] bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block">
              Active Categories
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 font-outfit">
              {loading ? <Skeleton width="40px" height="24px" /> : activeCategoriesCount}
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-border-light shadow-soft rounded-[20px] bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <XCircle size={24} />
          </div>
          <div>
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block">
              Disabled Categories
            </span>
            <span className="text-2xl font-extrabold text-amber-600 font-outfit">
              {loading ? <Skeleton width="40px" height="24px" /> : disabledCategoriesCount}
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-border-light shadow-soft rounded-[20px] bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Tag size={24} />
          </div>
          <div>
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block">
              Sub-Services
            </span>
            <span className="text-2xl font-extrabold text-gray-900 font-outfit">
              {loading ? <Skeleton width="40px" height="24px" /> : totalSubServicesCount}
            </span>
          </div>
        </Card>
      </div>

      {/* Control Bar & Tabs */}
      <Card className="p-4 border border-border-light shadow-soft rounded-[24px] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-gray-900'
            }`}
          >
            <Layers size={16} />
            <span>Categories View</span>
          </button>
          <button
            onClick={() => setActiveTab('subservices')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTab === 'subservices'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-gray-900'
            }`}
          >
            <Tag size={16} />
            <span>All Sub-Services ({totalSubServicesCount})</span>
          </button>
        </div>

        {/* Search, Filter & Sort */}
        <div className="flex flex-wrap items-center gap-3 flex-1 md:justify-end">
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search services or sub-services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={18} className="text-gray-400" />}
              className="py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-border-light rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-border-light rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && <RetryState message={error} onRetry={fetchServices} />}

      {/* Loading state */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="p-6 border border-border-light rounded-[24px]">
              <div className="flex items-center justify-between mb-4">
                <Skeleton width="48px" height="48px" className="rounded-2xl" />
                <Skeleton width="60px" height="24px" className="rounded-full" />
              </div>
              <Skeleton width="60%" height="24px" className="mb-2" />
              <Skeleton width="90%" height="16px" className="mb-4" />
              <Skeleton width="40%" height="20px" />
            </Card>
          ))}
        </div>
      )}

      {/* Content View */}
      {!loading && !error && (
        <>
          {activeTab === 'categories' ? (
            /* Categories Grid View */
            services.length === 0 ? (
              <Card className="p-8 border border-border-light rounded-[24px] bg-white">
                <EmptyState
                  title="No Service Categories Found"
                  description={
                    searchQuery || statusFilter !== 'all'
                      ? 'No categories match your search or filter criteria.'
                      : 'No service categories have been created yet.'
                  }
                  icon={<Layers size={40} className="text-gray-300" />}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((category) => {
                  const isExpanded = expandedCategoryId === category._id;
                  const isCategoryActive = category.isActive !== false;
                  const subCount = category.subServices ? category.subServices.length : 0;

                  return (
                    <Card
                      key={category._id}
                      className={`border transition-all rounded-[24px] overflow-hidden bg-white shadow-soft hover:shadow-md flex flex-col justify-between ${
                        isCategoryActive ? 'border-border-light' : 'border-amber-200 bg-amber-50/20'
                      }`}
                    >
                      <div className="p-6">
                        {/* Top Icon & Status Badge */}
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                            {renderServiceIcon(category.icon, 24)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                                isCategoryActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {isCategoryActive ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                        </div>

                        {/* Category Info */}
                        <h3 className="text-xl font-extrabold text-gray-900 font-outfit tracking-tight mb-2">
                          {category.name}
                        </h3>
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                          {category.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-border-light mb-4">
                          <div>
                            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                              Base Inspection Fee
                            </span>
                            <span className="text-lg font-extrabold text-gray-900 font-outfit">
                              ₹{category.basePrice}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                              Sub-Services
                            </span>
                            <span className="text-sm font-bold text-primary font-outfit">
                              {subCount} Included
                            </span>
                          </div>
                        </div>

                        {/* Sub-services Collapsible Drawer */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-border-light flex flex-col gap-2 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                                Sub-Services ({subCount})
                              </span>
                              <button
                                onClick={() => openSubModal(category)}
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                              >
                                <Plus size={14} /> Add Sub-Service
                              </button>
                            </div>

                            {subCount === 0 ? (
                              <p className="text-xs text-text-secondary italic py-2">
                                No sub-services added yet.
                              </p>
                            ) : (
                              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                                {category.subServices.map((sub) => (
                                  <div
                                    key={sub._id}
                                    className="py-2.5 flex items-center justify-between gap-2"
                                  >
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-xs font-bold text-gray-900 truncate">
                                        {sub.name}
                                      </span>
                                      <span className="text-[11px] text-text-secondary font-medium">
                                        ₹{sub.price}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() =>
                                          handleToggleSubStatus(category._id, sub._id)
                                        }
                                        title={
                                          sub.isActive !== false
                                            ? 'Disable sub-service'
                                            : 'Enable sub-service'
                                        }
                                        className={`p-1 rounded-md transition-colors ${
                                          sub.isActive !== false
                                            ? 'text-emerald-600 hover:bg-emerald-50'
                                            : 'text-amber-600 hover:bg-amber-50'
                                        }`}
                                      >
                                        {sub.isActive !== false ? (
                                          <CheckCircle2 size={16} />
                                        ) : (
                                          <XCircle size={16} />
                                        )}
                                      </button>
                                      <button
                                        onClick={() => openSubModal(category, sub)}
                                        title="Edit sub-service"
                                        className="p-1 text-gray-400 hover:text-primary rounded-md hover:bg-gray-100 transition-colors"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => confirmDeleteSub(category, sub)}
                                        title="Delete sub-service"
                                        className="p-1 text-gray-400 hover:text-error rounded-md hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Actions Footer */}
                      <div className="p-4 border-t border-border-light bg-gray-50/50 flex items-center justify-between gap-2">
                        <button
                          onClick={() =>
                            setExpandedCategoryId(isExpanded ? null : category._id)
                          }
                          className="text-xs font-bold text-gray-700 hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <ChevronRight
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? 'rotate-90 text-primary' : ''
                            }`}
                          />
                          <span>{isExpanded ? 'Hide Sub-Services' : 'View Sub-Services'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleCategoryStatus(category._id)}
                            title={
                              isCategoryActive
                                ? 'Disable category'
                                : 'Enable category'
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                              isCategoryActive
                                ? 'bg-white text-gray-700 border-border-light hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {isCategoryActive ? (
                              <>
                                <XCircle size={14} />
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={14} />
                                <span>Enable</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => openCategoryModal(category)}
                            title="Edit Category"
                            className="p-1.5 text-gray-600 hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-border-light transition-all"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => confirmDeleteCategory(category)}
                            title="Delete Category"
                            className="p-1.5 text-gray-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (
            /* All Sub-Services Table View */
            <Card className="border border-border-light shadow-soft rounded-[24px] overflow-hidden bg-white">
              {allSubServicesFlat.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="No Sub-Services Found"
                    description="No sub-services match your search or exist in the database."
                    icon={<Tag size={40} className="text-gray-300" />}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border-light text-xs font-bold text-text-secondary uppercase tracking-wider">
                        <th className="py-4 px-6">Sub-Service Name</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm">
                      {allSubServicesFlat.map((sub) => (
                        <tr key={sub._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">{sub.name}</span>
                              {sub.description && (
                                <span className="text-xs text-text-secondary line-clamp-1">
                                  {sub.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                {renderServiceIcon(sub.categoryIcon, 14)}
                              </div>
                              <span className="font-medium text-gray-700">
                                {sub.categoryName}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-gray-900 font-outfit">
                            ₹{sub.price}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                sub.isActive !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {sub.isActive !== false ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleSubStatus(sub.categoryId, sub._id)}
                                title={
                                  sub.isActive !== false ? 'Disable' : 'Enable'
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                  sub.isActive !== false
                                    ? 'bg-white text-gray-700 border-border-light hover:bg-amber-50'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {sub.isActive !== false ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => {
                                  const parent = services.find((s) => s._id === sub.categoryId);
                                  if (parent) openSubModal(parent, sub);
                                }}
                                className="p-1.5 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  const parent = services.find((s) => s._id === sub.categoryId);
                                  if (parent) confirmDeleteSub(parent, sub);
                                }}
                                className="p-1.5 text-gray-400 hover:text-error rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Category Modal (Add / Edit) */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Service Category' : 'Add New Service Category'}
      >
        <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Category Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Electrical, Plumbing, Cleaning"
              value={categoryFormData.name}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Base Inspection Fee (₹) *
              </label>
              <Input
                type="number"
                placeholder="299"
                value={categoryFormData.basePrice}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, basePrice: e.target.value })
                }
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Status
              </label>
              <select
                value={categoryFormData.isActive ? 'active' : 'inactive'}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    isActive: e.target.value === 'active'
                  })
                }
                className="w-full bg-gray-50 border border-border-light rounded-xl px-3.5 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Category Icon
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 border border-border-light rounded-2xl bg-gray-50/50">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = categoryFormData.icon === item.name;
                const IconC = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() =>
                      setCategoryFormData({ ...categoryFormData, icon: item.name })
                    }
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm scale-105'
                        : 'bg-white text-gray-600 border-border-light hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <IconC size={20} />
                    <span className="text-[10px] font-bold mt-1 truncate max-w-full">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the services included under this category..."
              value={categoryFormData.description}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, description: e.target.value })
              }
              className="w-full bg-white border border-border-light rounded-xl p-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-light">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : editingCategory
                  ? 'Update Category'
                  : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sub-Service Modal (Add / Edit) */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title={
          editingSubService
            ? `Edit Sub-Service (${selectedParentCategory?.name})`
            : `Add Sub-Service to ${selectedParentCategory?.name}`
        }
      >
        <form onSubmit={handleSubSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Sub-Service Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Fan Repair & Installation"
              value={subFormData.name}
              onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Service Price (₹) *
              </label>
              <Input
                type="number"
                placeholder="199"
                value={subFormData.price}
                onChange={(e) => setSubFormData({ ...subFormData, price: e.target.value })}
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Status
              </label>
              <select
                value={subFormData.isActive ? 'active' : 'inactive'}
                onChange={(e) =>
                  setSubFormData({
                    ...subFormData,
                    isActive: e.target.value === 'active'
                  })
                }
                className="w-full bg-gray-50 border border-border-light rounded-xl px-3.5 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Description / Whats Included
            </label>
            <textarea
              rows={3}
              placeholder="Specify scope of work, spare parts policy, or job terms..."
              value={subFormData.description}
              onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
              className="w-full bg-white border border-border-light rounded-xl p-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-light">
            <Button type="button" variant="secondary" onClick={() => setIsSubModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : editingSubService
                  ? 'Update Sub-Service'
                  : 'Add Sub-Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, type: 'category', categoryId: null, subId: null, title: '' })
        }
        title={`Confirm Delete ${deleteConfirm.type === 'category' ? 'Category' : 'Sub-Service'}`}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900">"{deleteConfirm.title}"</strong>?
          </p>
          {deleteConfirm.type === 'category' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
              Warning: Deleting this service category will also remove all associated sub-services.
            </div>
          )}
          <div className="flex items-center justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setDeleteConfirm({
                  isOpen: false,
                  type: 'category',
                  categoryId: null,
                  subId: null,
                  title: ''
                })
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExecuteDelete}
              disabled={submitting}
              className="bg-error hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm"
            >
              {submitting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServicesManagement;
