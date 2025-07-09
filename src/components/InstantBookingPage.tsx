import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Eye } from 'lucide-react';

interface InstantBookingPageProps {
  onSelect: (enabled: boolean) => void;
  onBack: () => void;
}

const InstantBookingPage = ({ onSelect, onBack }: InstantBookingPageProps) => {
  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Header */}
      <div className="bg-background shadow-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Мгновенное бронирование</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Включите для ваших пассажиров мгновенное бронирование
          </h2>
          <p className="text-muted-foreground">
            Выберите, как вы хотите обрабатывать запросы на бронирование
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => onSelect(true)}
            className="w-full justify-start text-left p-6 h-auto bg-green-50 hover:bg-green-100 border-2 border-green-200"
            variant="outline"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-800 text-lg">
                  Включить мгновенное бронирование
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Пассажиры смогут мгновенно забронировать места без вашего подтверждения
                </div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => onSelect(false)}
            className="w-full justify-start text-left p-6 h-auto bg-blue-50 hover:bg-blue-100 border-2 border-blue-200"
            variant="outline"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-blue-800 text-lg">
                  Просматривать каждый запрос
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Вы будете получать запросы на бронирование и сможете выбирать пассажиров
                </div>
              </div>
            </div>
          </Button>
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-2">💡 Рекомендация</h3>
          <p className="text-sm text-muted-foreground">
            Мгновенное бронирование увеличивает шансы заполнить все места в поездке, 
            так как пассажиры получают моментальное подтверждение.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstantBookingPage;