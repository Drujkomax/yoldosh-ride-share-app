import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile, updateProfile } = useProfile();
  
  const [formData, setFormData] = useState({
    firstName: profile?.name?.split(' ')[0] || '',
    lastName: profile?.name?.split(' ')[1] || '',
    dateOfBirth: profile?.date_of_birth || '',
    email: profile?.email || '',
    phone: profile?.phone || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await updateProfile({
        name: fullName,
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone
      });
      toast.success('Профиль обновлен');
      navigate('/profile');
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <X className="h-6 w-6 text-teal-600" />
          </Button>
          <h1 className="text-xl font-bold text-teal-900">Информация о себе</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Name */}
        <div>
          <label className="block text-gray-600 mb-2">Имя</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full text-lg text-teal-600 font-medium bg-transparent border-none outline-none placeholder-gray-400"
            placeholder="Введите имя"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-gray-600 mb-2">Фамилия</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full text-lg text-teal-600 font-medium bg-transparent border-none outline-none placeholder-gray-400"
            placeholder="Введите фамилию"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-gray-600 mb-2">Дата рождения</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className="w-full text-lg text-teal-600 font-medium bg-transparent border-none outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-600 mb-2">Эл. почта</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full text-lg text-teal-600 font-medium bg-transparent border-none outline-none placeholder-gray-400"
            placeholder="Введите email"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-600 mb-2">Номер телефона</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full text-lg text-teal-600 font-medium bg-transparent border-none outline-none placeholder-gray-400"
            placeholder="Введите номер телефона"
          />
        </div>

        {/* Tell About Yourself */}
        <div className="border-t border-gray-200 pt-6">
          <button className="flex items-center space-x-3 w-full text-left">
            <Plus className="h-5 w-5 text-teal-600" />
            <span className="text-teal-600 font-medium">Расскажите немного о себе</span>
          </button>
        </div>

        {/* Save Button */}
        <div className="pt-8">
          <Button 
            onClick={handleSave}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg"
          >
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;