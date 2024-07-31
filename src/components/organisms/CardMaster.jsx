import React, { useState } from 'react';
import Modal from '../molecules/Modal';
import TaskForm from '../molecules/TaskForm';
import Button from '../atoms/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CardMaster = ({ grado, grupo, estudiantes, tareas, groupId, onAddTarea, onDeleteTarea }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const navigate = useNavigate();

  const handleAddTask = () => {
    setEditTaskData(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (taskData) => {
    setEditTaskData(taskData);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (taskData) => {
    try {
      if (editTaskData) {
        await axios.patch(
          `https://walle-up-back.freemyip.com/homeworks/${editTaskData.id}`,
          {
            description: taskData.descripcion,
            delivery_date: taskData.fechaEntrega,
          },
          {
            withCredentials: true,
          }
        );
        Swal.fire({
          icon: 'success',
          title: 'Tarea actualizada correctamente',
          showConfirmButton: true,
        }).then(() => {
          setTimeout(() => {
            setIsModalOpen(false);
            navigate(0);
          }, 1000);
        });
      } else {
        const response = await axios.post(
          'https://walle-up-back.freemyip.com/homeworks',
          {
            description: taskData.descripcion,
            delivery_date: taskData.fechaEntrega,
            id_group: groupId,
          },
          {
            withCredentials: true,
          }
        );
        const newTarea = response.data.data;
        onAddTarea(newTarea);
        Swal.fire({
          icon: 'success',
          title: 'Tarea guardada correctamente',
          showConfirmButton: true,
        }).then(() => {
          setTimeout(() => {
            setIsModalOpen(false);
            navigate(0);
          }, 1000);
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar la tarea',
        text: 'Ha ocurrido un problema al intentar guardar la tarea.',
        showConfirmButton: true,
      }).then(() => {
        setTimeout(() => {
          setIsModalOpen(false);
          navigate(0);
        }, 1000);
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Una vez eliminada, no podrás recuperar esta tarea.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://walle-up-back.freemyip.com/homeworks/${taskId}`, {
          withCredentials: true,
        });
        Swal.fire({
          icon: 'success',
          title: 'Tarea eliminada correctamente',
          showConfirmButton: true,
        }).then(() => {
          setTimeout(() => {
            navigate(0);
          }, 1000);
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar la tarea',
          text: 'Ha ocurrido un problema al intentar eliminar la tarea.',
          showConfirmButton: true,
        }).then(() => {
          setTimeout(() => {
            navigate(0);
          }, 1000);
        });
      }
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await axios.get('https://walle-up-back.freemyip.com/users', {
        withCredentials: true,
      });
      if (response.data && response.data.data) {
        const students = response.data.data.filter(user => user.type === 'student');
        setAllStudents(students);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron obtener los estudiantes.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron obtener los estudiantes.',
      });
    }
  };

  const handleAddStudentClick = () => {
    fetchAllStudents();
    setIsAddStudentModalOpen(true);
  };

  const handleAddStudentToGroup = async () => {
    if (!selectedStudentId) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un estudiante',
        text: 'Debes seleccionar un estudiante para agregar al grupo.',
      });
      return;
    }

    try {
      await axios.post('https://walle-up-back.freemyip.com/student_groups', {
        id_student: selectedStudentId,
        id_group: groupId,
      }, {
        withCredentials: true,
      });
      Swal.fire({
        icon: 'success',
        title: 'Estudiante agregado correctamente',
        showConfirmButton: true,
      }).then(() => {
        setIsAddStudentModalOpen(false);
        navigate(0);
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar al estudiante al grupo.',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl relative">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500  p-4">
        <h2 className="text-xl font-bold text-white">{grado} - {grupo}</h2>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Estudiantes</h3>
          <ul className="text-gray-600 space-y-3 overflow-y-auto h-48 border p-4">
  {estudiantes.map((estudiante) => (
    <li key={estudiante.id} className="flex items-center bg-white shadow-md rounded-lg p-4 border ">
      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
      <div >
        <p className="font-bold">{estudiante.nombre}</p>
        <p className="text-sm text-gray-500">{estudiante.email}</p>
      </div>
    </li>
  ))}
</ul>
          <Button onClick={handleAddStudentClick} className="mt-4 ml-16 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Agregar Estudiante
          </Button>
        </div>
        <div className="overflow-y-auto h-48 border p-4 ">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Tareas</h3>
          {tareas.map((tarea) => (
            <div key={tarea.id} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded ">
              <span className="text-gray-700">{tarea.description}</span>
              <div className="flex space-x-2">
                <Button className="text-blue-500 hover:text-blue-600 transition-colors duration-300" onClick={() => handleEditTask(tarea)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </Button>
                <Button className="text-red-500 hover:text-red-600 transition-colors duration-300" onClick={() => handleDeleteTask(tarea.id)}>
                <svg class="w-6 h-6 text-red-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
</svg>

                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleAddTask} className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Añadir Nueva Tarea
        </Button>
        
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <TaskForm onSubmit={handleFormSubmit} initialData={editTaskData} />
        </Modal>

        <Modal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Seleccionar Estudiante</h2>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Seleccionar</option>
              {allStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            <Button onClick={handleAddStudentToGroup} className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
              Agregar al Grupo
            </Button>
          </div>
        </Modal>
      </div>
      <Button
        onClick={() => handleDeleteGroup(groupId)}
      >
        
      </Button>
    </div>
  );
};

export default CardMaster;
