import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  userId?: string;
  avatarUrl?: string;
  name?: string;
}

const UserAvatar = ({ 
  size = 'md', 
  className = '', 
  userId,
  avatarUrl,
  name
}: UserAvatarProps) => {
  const { user } = useUser();
  const [fetchedAvatarUrl, setFetchedAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Загружаем аватар пользователя с улучшенной логикой
  useEffect(() => {
    const fetchUserAvatar = async () => {
      // Если есть прямо переданный avatarUrl, используем его
      if (avatarUrl) {
        console.log('UserAvatar - Используем переданный avatarUrl:', avatarUrl);
        return;
      }
      
      // Если это текущий пользователь и у него нет аватара в контексте, перезагружаем
      if (userId === user?.id && !user?.avatarUrl) {
        console.log('UserAvatar - Перезагружаем аватар текущего пользователя');
        setLoading(true);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();
          
          console.log('UserAvatar - Загружен аватар из БД:', profile?.avatar_url);
          setFetchedAvatarUrl(profile?.avatar_url || null);
        } catch (error) {
          console.error('UserAvatar - Ошибка загрузки аватара текущего пользователя:', error);
          setFetchedAvatarUrl(null);
        } finally {
          setLoading(false);
        }
        return;
      }
      
      // Если это другой пользователь, загружаем его аватар
      if (userId && userId !== user?.id) {
        console.log('UserAvatar - Загружаем аватар другого пользователя:', userId);
        setLoading(true);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();
          
          console.log('UserAvatar - Загружен аватар другого пользователя:', profile?.avatar_url);
          setFetchedAvatarUrl(profile?.avatar_url || null);
        } catch (error) {
          console.error('UserAvatar - Ошибка загрузки аватара другого пользователя:', error);
          setFetchedAvatarUrl(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserAvatar();
  }, [userId, user?.id, user?.avatarUrl, avatarUrl]);
  
  // Определяем какой URL использовать для отображения с улучшенной логикой
  const displayAvatarUrl = (() => {
    // Приоритет 1: Прямо переданный avatarUrl
    if (avatarUrl && avatarUrl.trim() !== '') {
      console.log('UserAvatar - Используем переданный avatarUrl:', avatarUrl);
      return avatarUrl;
    }
    
    // Приоритет 2: Если это текущий пользователь, используем его avatarUrl из контекста или загруженный
    if (!userId || userId === user?.id) {
      const userAvatar = user?.avatarUrl || fetchedAvatarUrl;
      console.log('UserAvatar - Аватар текущего пользователя:', userAvatar);
      return userAvatar;
    }
    
    // Приоритет 3: Для других пользователей используем загруженный аватар
    console.log('UserAvatar - Аватар другого пользователя:', fetchedAvatarUrl);
    return fetchedAvatarUrl;
  })();
  
  const displayName = name || user?.name;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8', 
    xl: 'h-10 w-10'
  };

  // Проверяем что URL не пустой и не null/undefined
  if (displayAvatarUrl && displayAvatarUrl.trim() !== '') {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage 
          src={displayAvatarUrl} 
          alt={displayName || 'User avatar'}
          onError={(e) => {
            console.error('Avatar image failed to load:', displayAvatarUrl);
          }}
        />
        <AvatarFallback className="bg-gray-200">
          <User className={`${iconSizes[size]} text-gray-400`} />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-full flex items-center justify-center ${className}`}>
      <User className={`${iconSizes[size]} text-gray-400`} />
    </div>
  );
};

export default UserAvatar;