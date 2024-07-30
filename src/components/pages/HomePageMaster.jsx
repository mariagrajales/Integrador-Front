import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import CardMaster from '../organisms/CardMaster';
import Button from '../atoms/Button';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const HomePageMaster = () => {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [tareas, setTareas] = useState({});
  const [estudiantes, setEstudiantes] = useState({});
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3300/users/profile', {
        withCredentials: true,
      });
      if (response.data && response.data.data && response.data.data.id) {
        setUserId(response.data.data.id);
      } else {
        setError('No se pudo obtener el ID del usuario');
      }
    } catch (error) {
      setError('No se pudo obtener el perfil del usuario');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userId) {
      const fetchGrupos = async () => {
        try {
          const response = await axios.get(`http://localhost:3300/groups/user/${userId}`, {
            withCredentials: true,
          });
          if (response.data && response.data.data) {
            const gruposData = response.data.data;
            setGrupos(gruposData);

            const tareasPromises = gruposData.map(async (grupo) => {
              try {
                const tareasResponse = await axios.get(`http://localhost:3300/homeworks/group/${grupo.id}`, {
                  withCredentials: true,
                });
                return { id: grupo.id, tareas: tareasResponse.data.data };
              } catch (error) {
                if (error.response?.status === 404) {
                  return { id: grupo.id, tareas: [] };
                }
                setError(`Error al obtener las tareas para el grupo ${grupo.id}`);
                return { id: grupo.id, tareas: [] };
              }
            });

            const tareasResults = await Promise.all(tareasPromises);
            const tareasPorGrupo = tareasResults.reduce((acc, { id, tareas }) => {
              acc[id] = tareas;
              return acc;
            }, {});

            setTareas(tareasPorGrupo);

            const estudiantesPromises = gruposData.map(async (grupo) => {
              try {
                const estudiantesResponse = await axios.get(`http://localhost:3300/groups/${grupo.id}/users`, {
                  withCredentials: true,
                });
                return { id: grupo.id, estudiantes: estudiantesResponse.data.data };
              } catch (error) {
                return { id: grupo.id, estudiantes: [] };
              }
            });

            const estudiantesResults = await Promise.all(estudiantesPromises);
            const estudiantesPorGrupo = estudiantesResults.reduce((acc, { id, estudiantes }) => {
              acc[id] = estudiantes;
              return acc;
            }, {});

            setEstudiantes(estudiantesPorGrupo);
          } else {
            setError('No se encontraron grupos para este usuario');
          }
        } catch (error) {
          setError(error.response?.data?.message || 'No se pudieron obtener los grupos del usuario');
        }
      };

      fetchGrupos();
    }
  }, [userId]);

  const handleAddTarea = (newTarea) => {
    setTareas((prevTareas) => {
      const { id_group } = newTarea;
      const tareasPorGrupo = prevTareas[id_group] || [];
      return {
        ...prevTareas,
        [id_group]: [...tareasPorGrupo, newTarea],
      };
    });
  };

  const handleAddGroupClick = () => {
    navigate('/addGroup');
  };

  const taskMaster = () => {
    navigate('/taskMaster');
  };

  const handleDeleteGroup = (groupId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:3300/groups/${groupId}`, {
          withCredentials: true,
        })
        .then(() => {
          setGrupos((prevGrupos) => prevGrupos.filter((grupo) => grupo.id !== groupId));
          setTareas((prevTareas) => {
            const newTareas = { ...prevTareas };
            delete newTareas[groupId];
            return newTareas;
          });
          setEstudiantes((prevEstudiantes) => {
            const newEstudiantes = { ...prevEstudiantes };
            delete newEstudiantes[groupId];
            return newEstudiantes;
          });
          Swal.fire(
            '¡Eliminado!',
            'El grupo ha sido eliminado.',
            'success'
          );
        })
        .catch(() => {
          setError('No se pudo eliminar el grupo');
        });
      }
    });
  };
  

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <Button
          onClick={taskMaster}
          className="mt-7  bg-gradient-to-r from-blue-700 to-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Calificar Las tareas
        </Button>
        
          <Button
            onClick={handleAddGroupClick}
            className="ml-5 m-5 bg-gradient-to-r from-blue-700 to-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Añadir Nuevo Grupo
          </Button>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {grupos.map((grupo) => (
            <div key={grupo.id} className="relative">
              <CardMaster
                grado={grupo.name}
                grupo={`Id ${grupo.id}`}
                estudiantes={estudiantes[grupo.id] || []}
                tareas={tareas[grupo.id] || []}
                groupId={grupo.id}
                onAddTarea={handleAddTarea}
              />
              <Button
                onClick={() => handleDeleteGroup(grupo.id)}
                className="absolute top-0 right-0 mt-2 mr-2 text-red-500 bg-white py-1 px-2 rounded-full opacity-50"
              >
                  <svg class="w-6 h-6 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                 <path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
                 </svg>
              </Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePageMaster;
