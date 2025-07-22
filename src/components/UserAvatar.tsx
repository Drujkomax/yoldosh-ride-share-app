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
  
  // Загружаем аватар пользователя, если передан userId и это не текущий пользователь
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (userId && userId !== user?.id && !avatarUrl) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();
          
          if (profile?.avatar_url) {
            setFetchedAvatarUrl(profile.avatar_url);
          }
        } catch (error) {
          console.error('Ошибка загрузки аватара пользователя:', error);
        }
      }
    };

    fetchUserAvatar();
  }, [userId, user?.id, avatarUrl]);
  
  // Определяем какой URL использовать для отображения
  const displayAvatarUrl = avatarUrl || 
    (userId === user?.id ? user?.avatarUrl : fetchedAvatarUrl) || 
    (!userId ? user?.avatarUrl : null);
  const displayName = name || user?.name;
  
  console.log('UserAvatar render:', {
    avatarUrl,
    userId,
    userFromContext: user?.id,
    userAvatarUrl: user?.avatarUrl,
    displayAvatarUrl,
    name,
    displayName
  });
  
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