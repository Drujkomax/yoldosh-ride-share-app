
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateDriverRide = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Перенаправляем на новый мастер создания поездки
    navigate('/create-ride-wizard', { replace: true });
  }, [navigate]);

  return null;
};

export default CreateDriverRide;
