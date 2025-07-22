
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Calendar, Clock, Star, User, ChevronRight, Share2, FileText, AlertTriangle, PawPrint, Users, Shield, CreditCard, MessageSquare, Navigation } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

interface TripDetailsModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

const TripDetailsModal: React.FC<TripDetailsModalProps> = ({ booking, isOpen, onClose }) => {
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return timeStr.slice(0, 5);
    } catch {
      return timeStr;
    }
  };

  const handleAddressPress = (address: string) => {
    // Show options to open in different map apps
    const options = [
      { name: 'Open in Apple Maps', action: () => window.open(`maps://maps.apple.com/?q=${encodeURIComponent(address)}`) },
      { name: 'Open in Google Maps', action: () => window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`) },
      { name: 'Open in Waze', action: () => window.open(`https://waze.com/ul?q=${encodeURIComponent(address)}`) },
      { name: 'Copy address', action: () => navigator.clipboard.writeText(address) }
    ];
    
    // For now, just copy the address
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Ride plan</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Date */}
          <div className="text-lg font-bold text-gray-900">
            {formatDate(booking.ride?.departure_date || '')}
          </div>

          {/* Route with intermediate stops */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-0.5 h-12 bg-blue-500 opacity-30"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formatTime(booking.ride?.departure_time || '')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.ride?.from_city}
                    </div>
                    <div className="text-xs text-gray-400">
                      {booking.pickup_location || 'KFC'}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Intermediate stops */}
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-0.5 h-8 bg-gray-300 opacity-30"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">11:30</div>
                    <div className="text-sm text-gray-600">Stanmore</div>
                    <div className="text-xs text-gray-400">Marsh Ln, Stanmore HA7, UK</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-0.5 h-8 bg-gray-300 opacity-30"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">11:40</div>
                    <div className="text-sm text-gray-600">Watford</div>
                    <div className="text-xs text-gray-400">Radlett Rd, Watford WD24, UK</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-0.5 h-8 bg-gray-300 opacity-30"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">12:00</div>
                    <div className="text-sm text-gray-600">Luton</div>
                    <div className="text-xs text-gray-400">26 Chapel St, Luton LU1 2SE, UK</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">13:40</div>
                    <div className="text-sm text-gray-500">
                      {booking.ride?.to_city}
                    </div>
                    <div className="text-xs text-gray-400">
                      Atlas Trading Estate, Colebrook Rd, Tyseley, Birmingham, UK
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
            >
              <div>
                <div className="text-sm text-gray-600">Fees included</div>
                <div className="text-xs text-gray-500">For 1 seat</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">£17.89</span>
                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${showPriceBreakdown ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {showPriceBreakdown && (
              <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount you get</span>
                    <span className="text-sm font-medium">£14.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Service fee and VAT</span>
                    <span className="text-sm font-medium">£3.89</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-900 mb-3">The service fee includes:</div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">VAT</div>
                        <div className="text-xs text-gray-500">Applied to the service fee on your ride</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Customer service</div>
                        <div className="text-xs text-gray-500">Provide customer service 7 days a week</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Secure payment</div>
                        <div className="text-xs text-gray-500">Ensure a secure payment system</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Fraud protection</div>
                        <div className="text-xs text-gray-500">Moderate publications and in-app communication to prevent fraud and phishing</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Driver Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <UserAvatar size="md" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {booking.ride?.driver?.name || 'Driver'}
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600">Verified Profile</span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>

          {/* Trip Features */}
          <div className="space-y-3">
            <div className="text-sm text-gray-500">A regular route</div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Passenger bookings won't be confirmed until you approve their request
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Max. 2 in the back</span>
              </div>
              <div className="flex items-center space-x-3">
                <PawPrint className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Pets are welcome</span>
              </div>
            </div>
          </div>

          {/* Car Details */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="font-semibold text-gray-900 mb-1">MERCEDES AMG</div>
            <div className="text-sm text-gray-500">White</div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full rounded-xl flex items-center justify-center space-x-2"
              onClick={() => {
                // TODO: Implement share functionality
              }}
            >
              <Share2 className="h-4 w-4" />
              <span>Share ride</span>
            </Button>
            
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl"
              onClick={() => {
                // TODO: Implement manage ride functionality
              }}
            >
              Manage ride
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;
