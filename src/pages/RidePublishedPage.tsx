import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const RidePublishedPage = () => {
  const navigate = useNavigate();

  const handleSeeMyRide = () => {
    navigate('/driver-home');
  };

  return (
    <div className="min-h-screen bg-green-500 flex flex-col items-center justify-center px-6 text-center">
      {/* Character with megaphone illustration */}
      <div className="mb-12">
        <div className="relative mx-auto w-32 h-32">
          {/* Character body */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            {/* Legs */}
            <div className="w-4 h-8 bg-slate-800 rounded-full absolute -left-2 bottom-0"></div>
            <div className="w-4 h-8 bg-slate-800 rounded-full absolute right-2 bottom-0"></div>
            
            {/* Body */}
            <div className="w-8 h-12 bg-white rounded-t-full rounded-b-lg relative">
              {/* Pattern on shirt */}
              <div className="absolute top-2 left-1 w-1 h-1 bg-slate-800 rounded-full"></div>
              <div className="absolute top-4 left-2 w-1 h-1 bg-slate-800 rounded-full"></div>
              <div className="absolute top-3 right-1 w-1 h-1 bg-slate-800 rounded-full"></div>
              <div className="absolute top-5 right-2 w-1 h-1 bg-slate-800 rounded-full"></div>
            </div>
            
            {/* Head */}
            <div className="w-6 h-6 bg-peach-200 rounded-full absolute -top-6 left-1"></div>
            
            {/* Hair */}
            <div className="w-4 h-3 bg-slate-800 rounded-t-full absolute -top-8 left-2"></div>
            
            {/* Arm holding megaphone */}
            <div className="w-3 h-6 bg-peach-200 rounded-full absolute -top-2 -right-4 transform rotate-45"></div>
            
            {/* Megaphone */}
            <div className="absolute -top-4 -right-8">
              <div className="w-6 h-4 bg-green-600 rounded-l-full"></div>
              <div className="w-3 h-2 bg-green-700 absolute right-0 top-1"></div>
              
              {/* Sound lines */}
              <div className="absolute -right-2 top-0">
                <div className="w-2 h-0.5 bg-white absolute transform rotate-12"></div>
                <div className="w-3 h-0.5 bg-white absolute top-1 transform rotate-12"></div>
                <div className="w-2 h-0.5 bg-white absolute top-2 transform rotate-12"></div>
              </div>
              <div className="absolute -right-4 -top-1">
                <div className="w-3 h-0.5 bg-white absolute transform rotate-12"></div>
                <div className="w-4 h-0.5 bg-white absolute top-1 transform rotate-12"></div>
                <div className="w-3 h-0.5 bg-white absolute top-2 transform rotate-12"></div>
              </div>
            </div>
            
            {/* Other arm */}
            <div className="w-3 h-5 bg-peach-200 rounded-full absolute -top-1 -left-3"></div>
          </div>
        </div>
      </div>

      {/* Success message */}
      <div className="mb-16">
        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
          Your ride is published!
        </h1>
        <p className="text-xl text-white leading-relaxed">
          Passengers can now book<br />
          and travel with you!
        </p>
      </div>

      {/* Action button */}
      <div className="w-full max-w-sm">
        <Button
          onClick={handleSeeMyRide}
          className="w-full h-14 bg-white text-blue-500 hover:bg-gray-50 rounded-full font-semibold text-lg"
        >
          See my ride
        </Button>
      </div>
    </div>
  );
};

export default RidePublishedPage;
