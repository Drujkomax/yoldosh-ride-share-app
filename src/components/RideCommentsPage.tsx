import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

interface RideCommentsPageProps {
  initialComments: string;
  onSubmit: (comments: string) => void;
  onBack: () => void;
}

const RideCommentsPage = ({ initialComments, onSubmit, onBack }: RideCommentsPageProps) => {
  const [comments, setComments] = useState(initialComments);

  const handleSubmit = () => {
    onSubmit(comments);
  };

  const maxLength = 500;
  const remainingChars = maxLength - comments.length;

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Header */}
      <div className="bg-background shadow-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Комментарии</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Комментарии к поездке
          </h2>
          <p className="text-muted-foreground">
            Расскажите пассажирам дополнительную информацию о поездке
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Textarea
              placeholder="Например: Встречаемся у главного входа торгового центра. Буду на белой Toyota Camry. В поездке можно слушать музыку, кондиционер работает отлично..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              maxLength={maxLength}
              className="min-h-[120px] resize-none text-base"
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Опционально</span>
              <span className={remainingChars < 50 ? 'text-destructive' : ''}>
                {remainingChars} символов осталось
              </span>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">💡 Полезные советы</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Укажите место встречи и ориентиры</li>
              <li>• Опишите свой автомобиль (цвет, модель)</li>
              <li>• Упомяните правила поездки (музыка, остановки)</li>
              <li>• Добавьте контактную информацию для связи</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full justify-center p-4 h-auto bg-primary hover:bg-primary/90"
        >
          <div className="flex items-center space-x-3">
            <Send className="h-5 w-5" />
            <span className="font-semibold text-lg">Опубликовать поездку</span>
          </div>
        </Button>

        <div className="text-center">
          <Button
            onClick={handleSubmit}
            variant="ghost"
            className="text-muted-foreground"
          >
            Пропустить комментарии
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideCommentsPage;