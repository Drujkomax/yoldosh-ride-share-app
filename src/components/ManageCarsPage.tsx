
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, Plus, Settings, Trash2, Edit3 } from 'lucide-react';
import { useUserCars, UserCar } from '@/hooks/useUserCars';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ManageCarsPage = () => {
  const navigate = useNavigate();
  const { cars, addCar, updateCar, deleteCar, isAdding, isUpdating, isDeleting } = useUserCars();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<UserCar | null>(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    license_plate: ''
  });

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: '',
      color: '',
      license_plate: ''
    });
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.make || !formData.model) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      await addCar({
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color || undefined,
        license_plate: formData.license_plate || undefined,
        is_verified: false,
        is_active: cars.length === 0 // Первая машина становится активной автоматически
      });
      
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Ошибка добавления машины:', error);
    }
  };

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCar || !formData.make || !formData.model) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      await updateCar({
        id: editingCar.id,
        updates: {
          make: formData.make,
          model: formData.model,
          year: formData.year ? parseInt(formData.year) : undefined,
          color: formData.color || undefined,
          license_plate: formData.license_plate || undefined,
        }
      });
      
      setEditingCar(null);
      resetForm();
    } catch (error) {
      console.error('Ошибка обновления машины:', error);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      try {
        await deleteCar(carId);
      } catch (error) {
        console.error('Ошибка удаления машины:', error);
      }
    }
  };

  const handleSetActive = async (car: UserCar) => {
    try {
      // Сначала деактивируем все машины
      for (const existingCar of cars) {
        if (existingCar.is_active && existingCar.id !== car.id) {
          await updateCar({
            id: existingCar.id,
            updates: { is_active: false }
          });
        }
      }
      
      // Затем активируем выбранную
      await updateCar({
        id: car.id,
        updates: { is_active: true }
      });
    } catch (error) {
      console.error('Ошибка активации машины:', error);
    }
  };

  const startEdit = (car: UserCar) => {
    setEditingCar(car);
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year?.toString() || '',
      color: car.color || '',
      license_plate: car.license_plate || ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="p-2 mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Мои автомобили</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Add Car Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-6 bg-blue-500 hover:bg-blue-600 rounded-xl h-12">
              <Plus className="h-5 w-5 mr-2" />
              Добавить автомобиль
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить автомобиль</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCar} className="space-y-4">
              <div>
                <Label htmlFor="make">Марка *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  placeholder="например, Toyota"
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Модель *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="например, Camry"
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Год выпуска</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  placeholder="например, 2020"
                />
              </div>
              <div>
                <Label htmlFor="color">Цвет</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="например, белый"
                />
              </div>
              <div>
                <Label htmlFor="license_plate">Номер</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                  placeholder="например, 01A123BC"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isAdding} className="flex-1">
                  {isAdding ? 'Добавление...' : 'Добавить'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Cars List */}
        <div className="space-y-4">
          {cars.length === 0 ? (
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нет автомобилей
                </h3>
                <p className="text-gray-500 text-sm">
                  Добавьте свой первый автомобиль, чтобы стать водителем
                </p>
              </CardContent>
            </Card>
          ) : (
            cars.map((car) => (
              <Card key={car.id} className="bg-white rounded-2xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {car.make} {car.model}
                        </h3>
                        {car.is_active && (
                          <Badge className="bg-green-100 text-green-800">
                            Активный
                          </Badge>
                        )}
                        {car.is_verified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Проверен
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {car.year && <p>Год: {car.year}</p>}
                        {car.color && <p>Цвет: {car.color}</p>}
                        {car.license_plate && <p>Номер: {car.license_plate}</p>}
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        {!car.is_active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetActive(car)}
                            disabled={isUpdating}
                          >
                            Сделать активным
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(car)}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCar(car.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingCar} onOpenChange={() => {
          setEditingCar(null);
          resetForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать автомобиль</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCar} className="space-y-4">
              <div>
                <Label htmlFor="edit-make">Марка *</Label>
                <Input
                  id="edit-make"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-model">Модель *</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-year">Год выпуска</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Цвет</Label>
                <Input
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-license_plate">Номер</Label>
                <Input
                  id="edit-license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingCar(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isUpdating} className="flex-1">
                  {isUpdating ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageCarsPage;
