import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Car, Edit, Trash2, Star } from 'lucide-react';
import { useUserCars } from '@/hooks/useUserCars';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';

const ManageCarsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { cars, isLoading, addCar, updateCar, deleteCar } = useUserCars();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    license_plate: '',
    seats_count: 4
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      if (editingCar) {
        await updateCar(editingCar.id, formData);
        toast.success('Автомобиль обновлен');
        setEditingCar(null);
      } else {
        await addCar({
          ...formData,
          user_id: user.id,
          year: parseInt(formData.year)
        });
        toast.success('Автомобиль добавлен');
        setShowAddForm(false);
      }
      
      setFormData({
        make: '',
        model: '',
        year: '',
        color: '',
        license_plate: '',
        seats_count: 4
      });
    } catch (error) {
      console.error('Error saving car:', error);
      toast.error('Ошибка при сохранении автомобиля');
    }
  };

  const handleEdit = (car: any) => {
    setEditingCar(car);
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year.toString(),
      color: car.color,
      license_plate: car.license_plate,
      seats_count: car.seats_count
    });
    setShowAddForm(true);
  };

  const handleDelete = async (carId: string) => {
    if (!confirm('Удалить этот автомобиль?')) return;
    
    try {
      await deleteCar(carId);
      toast.success('Автомобиль удален');
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Ошибка при удалении автомобиля');
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingCar(null);
    setFormData({
      make: '',
      model: '',
      year: '',
      color: '',
      license_plate: '',
      seats_count: 4
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold text-high-contrast">Мои автомобили</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-500 mt-2">Загрузка автомобилей...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Car Button */}
            {!showAddForm && (
              <Card className="card-high-contrast rounded-2xl shadow-md">
                <CardContent className="p-6 text-center">
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить автомобиль
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <Card className="card-high-contrast rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle>
                    {editingCar ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Марка</label>
                        <input
                          type="text"
                          value={formData.make}
                          onChange={(e) => setFormData({...formData, make: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Модель</label>
                        <input
                          type="text"
                          value={formData.model}
                          onChange={(e) => setFormData({...formData, model: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Год</label>
                        <input
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          min="1990"
                          max="2025"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Цвет</label>
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => setFormData({...formData, color: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Гос. номер</label>
                        <input
                          type="text"
                          value={formData.license_plate}
                          onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Количество мест</label>
                        <select
                          value={formData.seats_count}
                          onChange={(e) => setFormData({...formData, seats_count: parseInt(e.target.value)})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value={2}>2 места</option>
                          <option value={4}>4 места</option>
                          <option value={5}>5 мест</option>
                          <option value={6}>6 мест</option>
                          <option value={7}>7 мест</option>
                          <option value={8}>8 мест</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        {editingCar ? 'Обновить' : 'Добавить'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Отмена
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Cars List */}
            {cars.length === 0 && !showAddForm ? (
              <Card className="card-high-contrast rounded-2xl shadow-md">
                <CardContent className="p-8 text-center">
                  <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-high-contrast mb-2">Нет автомобилей</h3>
                  <p className="text-slate-600 mb-4">
                    Добавьте свой автомобиль, чтобы создавать поездки
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cars.map((car) => (
                  <Card key={car.id} className="card-high-contrast rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Car className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-high-contrast">
                              {car.make} {car.model}
                            </h3>
                            <p className="text-slate-600">
                              {car.year} • {car.color} • {car.license_plate}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="bg-blue-100 text-blue-800">
                                {car.seats_count} мест
                              </Badge>
                              {car.is_verified && (
                                <Badge className="bg-green-100 text-green-800">
                                  Проверен
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(car)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(car.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ManageCarsPage;
