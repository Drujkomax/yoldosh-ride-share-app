
// Переносим на использование sonner для упрощения
export { toast } from 'sonner';

// Для совместимости со старым API
export const useToast = () => {
  return {
    toast: (options: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      if (options.variant === 'destructive') {
        return require('sonner').toast.error(options.description || options.title);
      }
      return require('sonner').toast.success(options.description || options.title);
    }
  };
};
