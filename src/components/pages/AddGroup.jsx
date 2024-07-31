import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Title from '../atoms/Title';
import Button from '../atoms/Button';
import Header from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import { useNavigate } from 'react-router-dom';

const AddGroup = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const [grupoCreado, setGrupoCreado] = useState(false);
  const [grupoId, setGrupoId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await axios.get('https://walle-up-back.freemyip.com/users/profile', {
          withCredentials: true
        });
        console.log('Respuesta del perfil:', profileResponse.data);

        if (profileResponse.data && profileResponse.data.data) {
          const userData = profileResponse.data.data;
          if (userData.type === "teacher") {
            setTeacherId(userData.id);
            console.log('ID del profesor obtenido:', userData.id);
          } else {
            console.log('El usuario actual no es un profesor');
          }
        } else {
          console.error('Formato de respuesta del perfil inesperado');
        }

        const studentsResponse = await axios.get('https://walle-up-back.freemyip.com/users', {
          withCredentials: true
        });
        console.log('Respuesta de la lista de usuarios:', studentsResponse.data);

        if (studentsResponse.data && Array.isArray(studentsResponse.data.data)) {
          const estudiantesData = studentsResponse.data.data.filter(user => user.type === "student");
          setEstudiantes(estudiantesData);
          console.log('Estudiantes encontrados:', estudiantesData.length);
        } else {
          console.error('Formato de respuesta de usuarios inesperado');
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleNombreChange = (e) => setNombre(e.target.value);

  const handleEstudianteToggle = (estudianteId) => {
    setEstudiantesSeleccionados(prev =>
        prev.includes(estudianteId)
            ? prev.filter(id => id !== estudianteId)
            : [...prev, estudianteId]
    );
  };

  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    if (!teacherId) {
      console.error('No se pudo obtener el ID del profesor');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID del profesor. Por favor, inicie sesión de nuevo.',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        navigate('/login');
      });
      return;
    }
    console.log('Intentando crear grupo con ID de profesor:', teacherId);
    try {
      const grupoResponse = await axios.post('https://walle-up-back.freemyip.com/groups', {
        name: nombre,
        id_teacher: teacherId
      }, {
        withCredentials: true
      });

      console.log('Respuesta completa de creación de grupo:', grupoResponse.data);

      if (grupoResponse.data && grupoResponse.data.data && grupoResponse.data.data[0] && grupoResponse.data.data[0].insertId) {
        const nuevoGrupoId = grupoResponse.data.data[0].insertId;
        console.log('Grupo creado con ID:', nuevoGrupoId);
        setGrupoId(nuevoGrupoId);
        setGrupoCreado(true);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Grupo creado exitosamente. Ahora puedes agregar estudiantes.',
          confirmButtonText: 'Aceptar'
        });
      } else {
        console.error('Estructura de respuesta inesperada:', grupoResponse.data);
        throw new Error('No se pudo obtener el ID del grupo creado');
      }
    } catch (error) {
      console.error('Error al crear el grupo:', error.response ? error.response.data : error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear el grupo: ' + (error.response ? JSON.stringify(error.response.data) : error.message),
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleAgregarEstudiantes = async () => {
    if (!grupoId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha creado un grupo aún.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    for (let estudianteId of estudiantesSeleccionados) {
      try {
        const response = await axios.post('https://walle-up-back.freemyip.com/student_groups', {
          id_student: estudianteId,
          id_group: grupoId
        }, {
          withCredentials: true
        });
        console.log('Estudiante añadido al grupo:', estudianteId, 'Respuesta:', response.data);
      } catch (error) {
        console.error('Error al añadir estudiante al grupo:', error.response ? error.response.data : error.message);
      }
    }

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Estudiantes agregados exitosamente al grupo.',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      navigate('/homeMaster');
    });
  };

  return (
      <>
        <Header />
        <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6 px-8">
              <Title className="text-3xl font-extrabold text-white">
                {grupoCreado ? "Agregar Estudiantes al Grupo" : "Crear Nuevo Grupo"}
              </Title>
            </div>
            {!grupoCreado ? (
                <form onSubmit={handleCrearGrupo} className="p-8">
                  <div className="mb-6">
                    <input
                        type="text"
                        value={nombre}
                        onChange={handleNombreChange}
                        placeholder="Nombre del grupo (ej: 2 semestre)"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                  </div>
                  <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg font-semibold"
                  >
                    Crear Grupo
                  </Button>
                </form>
            ) : (
                <div className="p-8">
                  <div className="mb-6">
                    <Title className="text-xl font-semibold text-gray-800 mb-4">Estudiantes Disponibles</Title>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {estudiantes.map(estudiante => (
                          <div key={estudiante.id} className="bg-gray-50 p-4 rounded-lg">
                            <label className="flex items-center">
                              <input
                                  type="checkbox"
                                  checked={estudiantesSeleccionados.includes(estudiante.id)}
                                  onChange={() => handleEstudianteToggle(estudiante.id)}
                                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                              />
                              <span className="ml-2 text-gray-700">{estudiante.name}</span>
                            </label>
                          </div>
                      ))}
                    </div>
                  </div>
                  <Button
                      onClick={handleAgregarEstudiantes}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg font-semibold"
                  >
                    Agregar Estudiantes al Grupo
                  </Button>
                </div>
            )}
            <div className="p-8">
              <Button onClick={() => navigate('/homeMaster')} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Regresar
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
  );
};

export default AddGroup;
