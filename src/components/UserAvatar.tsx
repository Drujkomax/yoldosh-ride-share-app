import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';

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
  
  // Используем переданные пропы или данные из контекста
  const displayAvatarUrl = avatarUrl || (userId === user?.id ? user?.avatarUrl : undefined);
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

  if (displayAvatarUrl) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage src={displayAvatarUrl} alt={displayName} />
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