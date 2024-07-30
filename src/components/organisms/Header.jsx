import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Title from '../atoms/Title';
import ButtonGroup from '../molecules/ButtonGroup';

const Header = ({ onLogoutClick }) => {
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3300/users/profile', {
          withCredentials: true,
        });
        const userData = response.data.data;
        if (userData) {
          setUserName(`${userData.name} ${userData.lastname}`);
          setUserType(userData.type);
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 shadow-lg flex justify-between items-center">
      <Title className="text-3xl font-bold">Panel de Control del Aula</Title>
      <div className="flex items-center">
        {userName && userType && (
          <span className="mr-4">
            Hola, {userName} ({userType})
          </span>
        )}
        <ButtonGroup onLogoutClick={onLogoutClick} />
      </div>
    </header>
  );
};

export default Header;
