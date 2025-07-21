
import { useUser } from '@/contexts/UserContext';
import { useUserCars } from '@/hooks/useUserCars';

export interface UserRole {
  role: 'driver' | 'passenger';
  canDrive: boolean;
  canCreateRides: boolean;
  canBookRides: boolean;
}

export const useUserRole = (): UserRole => {
  const { user } = useUser();
  const { canDrive } = useUserCars();

  // Определяем роль на основе наличия активной машины
  const role: 'driver' | 'passenger' = canDrive ? 'driver' : 'passenger';

  return {
    role,
    canDrive,
    canCreateRides: canDrive, // Только водители могут создавать поездки
    canBookRides: true, // Все могут бронировать поездки
  };
};

// Хелперы для удобного использования
export const useIsDriver = () => {
  const { role } = useUserRole();
  return role === 'driver';
};

export const useIsPassenger = () => {
  const { role } = useUserRole();
  return role === 'passenger';
};

export const useCanCreateRides = () => {
  const { canCreateRides } = useUserRole();
  return canCreateRides;
};
