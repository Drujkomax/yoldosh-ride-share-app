import React, { useState } from 'react';
import { SettingsLayout } from '@/components/ui/settings-layout';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useSavedPassengers } from '@/hooks/useSavedPassengers';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Star, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const SavedPassengersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { savedPassengers, isLoading, updateSavedPassenger, removeSavedPassenger } = useSavedPassengers();
  const [editingPassenger, setEditingPassenger] = useState<any>(null);
  const [editNickname, setEditNickname] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  // Check if we should return to account tab
  const backTo = searchParams.get('backTo');
  const backUrl = backTo === 'account' ? '/profile?tab=account' : '/profile';

  const handleEdit = (passenger: any) => {
    setEditingPassenger(passenger);
    setEditNickname(passenger.nickname || '');
    setEditNotes(passenger.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingPassenger) return;

    const success = await updateSavedPassenger(editingPassenger.id, {
      nickname: editNickname.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });

    if (success) {
      setEditingPassenger(null);
      setEditNickname('');
      setEditNotes('');
    }
  };

  const handleDelete = async (id: string) => {
    await removeSavedPassenger(id);
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Сохраненные пассажиры" backTo={backUrl}>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Сохраненные пассажиры" backTo={backUrl}>
      <div className="p-4">
        {savedPassengers.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">Нет сохраненных пассажиров</p>
              <p className="text-sm">Добавляйте часто ездящих с вами пассажиров для быстрого доступа</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {savedPassengers.map((passenger) => (
              <Card key={passenger.id}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={passenger.passenger_name || 'Пользователь'}
                      avatarUrl={passenger.passenger_avatar}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {passenger.nickname || passenger.passenger_name || 'Пользователь'}
                        </p>
                        {passenger.passenger_rating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span>{passenger.passenger_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {passenger.nickname && passenger.passenger_name && (
                        <p className="text-sm text-muted-foreground">
                          {passenger.passenger_name}
                        </p>
                      )}
                      {passenger.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {passenger.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(passenger)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Редактировать пассажира</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-foreground">
                                Псевдоним
                              </label>
                              <Input
                                value={editNickname}
                                onChange={(e) => setEditNickname(e.target.value)}
                                placeholder="Введите псевдоним"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground">
                                Заметки
                              </label>
                              <Textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Добавьте заметки о пассажире"
                                className="mt-1"
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setEditingPassenger(null)}>
                                Отмена
                              </Button>
                              <Button onClick={handleSaveEdit}>
                                Сохранить
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить пассажира?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Пассажир "{passenger.nickname || passenger.passenger_name}" будет удален из сохраненных. 
                              Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(passenger.id)}
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};