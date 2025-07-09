import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Minus, Plus, ChevronRight } from 'lucide-react';

interface PriceSettingPageProps {
  selectedPrice?: number;
  onPriceSelect: (price: number) => void;
  onBack: () => void;
  title?: string;
  currency?: string;
  recommendedMin?: number;
  recommendedMax?: number;
}

const PriceSettingPage = ({
  selectedPrice = 50000,
  onPriceSelect,
  onBack,
  title = "Установите цену за место",
  currency = "UZS",
  recommendedMin = 45000,
  recommendedMax = 55000
}: PriceSettingPageProps) => {
  const [price, setPrice] = useState(selectedPrice);

  const handleIncrement = () => {
    setPrice(price + 5000);
  };

  const handleDecrement = () => {
    if (price > 5000) {
      setPrice(price - 5000);
    }
  };

  const handleConfirm = () => {
    onPriceSelect(price);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isRecommendedPrice = price >= recommendedMin && price <= recommendedMax;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-teal-700 mb-8">
            {title}
          </h1>

          {/* Price Counter */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDecrement}
              disabled={price <= 5000}
              className="w-16 h-16 rounded-full border-2 border-blue-200 hover:border-blue-400 disabled:opacity-50"
            >
              <Minus className="h-6 w-6" />
            </Button>
            
            <div className="text-6xl font-bold text-teal-700 min-w-[200px] text-center">
              {formatPrice(price)} {currency}
            </div>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleIncrement}
              className="w-16 h-16 rounded-full border-2 border-blue-200 hover:border-blue-400"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          {/* Recommended Price */}
          {isRecommendedPrice && (
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium">
                Рекомендуемая цена: {formatPrice(recommendedMin)} - {formatPrice(recommendedMax)} {currency}
              </span>
            </div>
          )}
          
          <p className="text-gray-600 text-sm">
            {isRecommendedPrice 
              ? "Отличная цена для этой поездки! Вы быстро найдете пассажиров."
              : "Установите цену, которая привлечет пассажиров и будет справедливой для вас."
            }
          </p>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="w-full justify-between text-left p-4 h-auto hover:bg-gray-50 rounded-xl"
          >
            <div>
              <div className="font-semibold text-teal-700">Цены за промежуточные остановки</div>
              <div className="text-sm text-gray-600 mt-1">
                Установите разные цены для разных участков маршрута
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Next Button */}
      <div className="p-6">
        <Button 
          onClick={handleConfirm}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2 rotate-180" />
          Далее
        </Button>
      </div>
    </div>
  );
};

export default PriceSettingPage;