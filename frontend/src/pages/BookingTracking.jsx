import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../config/constants';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Phone, ShieldCheck, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

// Custom Map center update helper
const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 14);
    }
  }, [coords, map]);
  return null;
};

// Create custom premium HTML/CSS indicators
const customerIcon = L.divIcon({
  className: 'custom-customer-pin',
  html: `<div style="width: 24px; height: 24px; background: #0F766E; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const providerIcon = L.divIcon({
  className: 'custom-provider-pin',
  html: `<div style="width: 24px; height: 24px; background: #14B8A6; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 15px rgba(20,184,166,0.5); position: relative;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export const BookingTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerCoords, setProviderCoords] = useState(null);
  const [socket, setSocket] = useState(null);

  const defaultCustomerCoords = [28.6139, 77.209];

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.BOOKINGS.DETAIL(id));
        const bookingData = res.data.data.booking;
        setBooking(bookingData);

        if (bookingData.provider) {
          setProviderCoords([28.608, 77.199]);
        }
      } catch (err) {
        console.error('Error loading tracking details:', err.friendlyMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  useEffect(() => {
    if (!booking?.provider) return;

    const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const s = io(SOCKET_URL);
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to socket tracking feed. Joining room...');
      s.emit('register', user._id);
      s.emit('join_tracking', { providerId: booking.provider._id });
    });

    s.on('location_updated', ({ coordinates }) => {
      setProviderCoords([coordinates[1], coordinates[0]]);
    });

    return () => {
      s.disconnect();
    };
  }, [booking, user]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-12 px-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[550px] lg:col-span-2 rounded-[24px]" />
          <div className="flex flex-col gap-8">
            <Skeleton className="h-64 w-full rounded-[24px]" />
            <Skeleton className="h-64 w-full rounded-[24px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking)
    return (
      <div className="text-center py-24 text-text-secondary font-medium text-lg">
        Booking file not found.
      </div>
    );

  const customerCoords =
    booking.address?.coordinates && booking.address.coordinates.length === 2
      ? [booking.address.coordinates[1], booking.address.coordinates[0]]
      : defaultCustomerCoords;

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto py-12 px-4 sm:px-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-6 bg-white p-6 rounded-[24px] shadow-soft border border-border-light">
        <div className="flex items-center gap-6">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            size="md"
            icon={<ArrowLeft size={18} />}
            className="rounded-full w-12 h-12 p-0 flex justify-center shadow-sm hover:shadow-md"
            title="Back"
          />
          <div>
            <h1 className="text-3xl font-extrabold mb-1 text-gray-900 font-outfit tracking-tight">
              Live Tracking
            </h1>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">
              Booking #{booking._id.slice(-8).toUpperCase()} <span className="mx-2">•</span>{' '}
              {booking.service?.name}
            </p>
          </div>
        </div>

        <Badge
          variant={
            booking.status === 'completed'
              ? 'success'
              : booking.status === 'cancelled'
                ? 'danger'
                : booking.status === 'accepted'
                  ? 'info'
                  : booking.status === 'in_progress'
                    ? 'primary'
                    : 'warning'
          }
          className="px-6 py-2.5 uppercase tracking-widest text-xs font-bold shadow-sm rounded-xl"
        >
          {booking.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 responsive-checkout-grid">
        {/* Map */}
        <div className="h-[600px] rounded-[32px] overflow-hidden border border-border-light shadow-elevated z-0 relative group">
          <MapContainer center={customerCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={customerCoords} icon={customerIcon}>
              <Popup>Your Service Location</Popup>
            </Marker>
            {providerCoords && (
              <Marker position={providerCoords} icon={providerIcon}>
                <Popup>Technician Location</Popup>
              </Marker>
            )}
            <RecenterMap coords={providerCoords || customerCoords} />
          </MapContainer>
          <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-elevated flex items-center gap-3 border border-border-light">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
            <span className="font-bold text-gray-900 text-sm">GPS Tracking Active</span>
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-8 h-full">
          {/* Technician Info */}
          <Card className="flex flex-col gap-4 shadow-soft border-border-light rounded-[24px]">
            <Card.Body className="p-8">
              <h3 className="text-xl font-extrabold border-b border-border-light pb-5 mb-6 text-gray-900 font-outfit">
                Service Professional
              </h3>
              {booking.provider ? (
                <div className="flex flex-col gap-6">
                  <div className="flex gap-5 items-center">
                    <div className="w-16 h-16 rounded-[20px] bg-bg-alternate text-primary flex items-center justify-center font-extrabold text-2xl border border-primary-light shrink-0 shadow-sm">
                      {booking.provider.name.charAt(0)}
                    </div>
                    <div>
                      <strong className="block text-xl text-gray-900 mb-1 font-outfit tracking-tight">
                        {booking.provider.name}
                      </strong>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold tracking-widest uppercase">
                        <ShieldCheck size={14} className="text-primary" />
                        {booking.provider.providerDetails?.experience} YRS EXP
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-900 font-bold bg-bg-secondary p-4 rounded-xl border border-border-light">
                    <Phone size={18} className="text-primary" />{' '}
                    <span>{booking.provider.phone}</span>
                  </div>
                  {booking.provider.providerDetails?.aiSummary && (
                    <div className="bg-bg-alternate p-5 rounded-2xl border border-primary-light text-sm italic text-gray-700 leading-relaxed font-medium">
                      "{booking.provider.providerDetails.aiSummary}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-70">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-sm text-text-secondary font-bold uppercase tracking-widest">
                    Assigning Professional...
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Tracking Log */}
          <Card className="flex flex-col gap-4 flex-1 shadow-soft border-border-light rounded-[24px]">
            <Card.Body className="p-8 flex flex-col h-full">
              <h3 className="text-xl font-extrabold border-b border-border-light pb-5 mb-8 text-gray-900 font-outfit">
                Activity Log
              </h3>
              <div className="flex flex-col gap-8 relative pl-8 flex-1">
                <div className="absolute left-[15px] top-[10px] bottom-[10px] w-0.5 bg-gray-200" />
                {booking.trackingLog?.map((log, idx) => (
                  <div key={idx} className="relative text-sm">
                    <div
                      className={`absolute -left-[37px] top-[2px] w-4 h-4 rounded-full border-[3px] ${
                        idx === booking.trackingLog.length - 1
                          ? 'border-primary bg-white shadow-[0_0_10px_rgba(20,184,166,0.5)]'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                    <span
                      className={`block font-bold capitalize mb-1 ${
                        idx === booking.trackingLog.length - 1
                          ? 'text-gray-900 text-base'
                          : 'text-text-secondary'
                      }`}
                    >
                      {log.status.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1.5 text-text-muted text-xs font-bold tracking-wider">
                      <Clock size={12} />
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>

              {/* OTP Block */}
              {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                <div className="bg-gray-900 text-white p-6 rounded-2xl border border-gray-800 mt-10 shadow-elevated relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-2">
                      Secure OTP
                    </div>
                    <strong className="block text-4xl font-extrabold tracking-[0.2em] text-center font-outfit text-white">
                      {booking.otp}
                    </strong>
                    <p className="text-xs text-gray-400 text-center font-medium mt-3 px-4">
                      Share this securely with the technician to start the service.
                    </p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingTracking;
