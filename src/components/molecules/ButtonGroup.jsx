import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import Button from '../atoms/Button';
import { useNavigate } from "react-router-dom";

const ButtonGroup = () => {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Cerrar sesión terminará tu sesión actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await axios.post('http://localhost:3300/users/logout', {}, {
          withCredentials: true
        });
        console.log('Sesión cerrada exitosamente');
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Sesión cerrada exitosamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          navigate('/login');
        });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cerrar sesión. Por favor, intente nuevamente.',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Button onClick={handleLogoutClick} className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded transition duration-300">
        Salir
      </Button>
    </div>
  );
};

export default ButtonGroup;
