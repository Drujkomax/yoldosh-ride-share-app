
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useUser();

  useEffect(() => {
    console.log('Index - Состояние пользователя:', { user, isAuthenticated, loading });
    
    if (!loading) {
      if (isAuthenticated) {
        console.log('Index - Пользователь авторизован, редирект на /passenger-search');
        navigate('/passenger-search');
      } else {
        console.log('Index - Пользователь не авторизован, редирект на /login');
        navigate('/login');
      }
    }
  }, [isAuthenticated, loading, navigate]);

  // Показываем индикатор загрузки пока проверяем авторизацию
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yoldosh</h1>
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
};

export default Index;
