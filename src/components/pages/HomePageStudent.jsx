import { Footer } from "../organisms/Footer";
import Header from "../organisms/Header";
import Title from "../atoms/Title";
import axios from "axios";
import { useState, useEffect } from "react";
import Button from "../atoms/Button";
import InputField from "../atoms/InputField";
import Modal from "../molecules/Modal.jsx";
import Swal from 'sweetalert2';

const HomePageStudent = () => {
  const [userId, setUserId] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [link, setLink] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://walle-up-back.freemyip.com/users/profile', {
          withCredentials: true
        });

        const { id } = response.data.data;
        setUserId(id);
        console.log("ID del usuario:", id);

        if (id) {
          const groupsResponse = await axios.get(`https://walle-up-back.freemyip.com/student_groups/user/${id}`, {
            withCredentials: true
          });

          console.log("IDs de los grupos a los que pertenece el usuario:");
          groupsResponse.data.data.forEach(group => console.log(group.id_group));

          const groupsWithUsersAndHomeworks = await Promise.all(groupsResponse.data.data.map(async (group) => {
            const usersResponse = await axios.get(`https://walle-up-back.freemyip.com/groups/${group.id_group}/users`, {
              withCredentials: true
            });

            let homeworks = [];
            try {
              const homeworksResponse = await axios.get(`https://walle-up-back.freemyip.com/homeworks/group/${group.id_group}`, {
                withCredentials: true
              });
              homeworks = homeworksResponse.data.data;
              console.log(`Tareas para el grupo ${group.id_group}:`, homeworksResponse.data);
            } catch (homeworksError) {
              if (homeworksError.response && homeworksError.response.status === 404) {
                console.log(`No se encontraron tareas para el grupo ${group.id_group}.`);
              } else {
                console.error(`Error al obtener las tareas para el grupo ${group.id_group}:`, homeworksError);
              }
            }

            return { ...group, users: usersResponse.data.data, homeworks };
          }));

          setUserGroups(groupsWithUsersAndHomeworks);

          // Obtener las entregas del usuario
          try {
            const userDeliveriesResponse = await axios.get(`https://walle-up-back.freemyip.com/deliveries/user/${id}`, {
              withCredentials: true
            });
            console.log("Entregas del usuario:", userDeliveriesResponse.data);

            // Guardar las entregas del usuario en el estado
            setUserGroups(prevGroups => prevGroups.map(group => ({
              ...group,
              userDeliveries: userDeliveriesResponse.data.data
            })));
          } catch (deliveriesError) {
            console.error('Error al obtener las entregas del usuario:', deliveriesError);
          }
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario o los grupos:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const isHomeworkLate = (deliveryDate) => {
    const now = new Date();
    const deadline = new Date(deliveryDate);
    return now > deadline;
  };

  const handleSubmitHomework = async () => {
    // Verificar si el usuario ya ha enviado esta tarea
    const existingDelivery = userGroups.flatMap(group => group.userDeliveries || []).find(delivery =>
      delivery.id_homework === selectedHomework.id && delivery.id_student === userId
    );

    if (existingDelivery) {
      Swal.fire({
        icon: 'error',
        title: 'Tarea ya enviada',
        text: 'Ya has enviado esta tarea anteriormente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if (isHomeworkLate(selectedHomework.delivery_date)) {
      Swal.fire({
        icon: 'error',
        title: 'Tarea fuera de plazo',
        text: 'No puedes entregar esta tarea ya que ha pasado la fecha de entrega.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Una vez enviado no se podra modificar',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post('https://walle-up-back.freemyip.com/deliveries', {
          id_homework: selectedHomework.id,
          id_student: userId,
          file: link
        }, {
          withCredentials: true
        });

        if (response.data && response.data.message === "Entrega creada") {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Tarea enviada exitosamente.',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            setLink('');
            setIsModalOpen(false);
            window.location.reload(); // Recargar la vista después de enviar la tarea
          });
        } else {
          throw new Error('Respuesta inesperada del servidor');
        }
      } catch (error) {
        console.error('Error al enviar la tarea:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al enviar la tarea. Por favor, intente nuevamente.',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Title level="h1" className="text-4xl font-bold text-center text-indigo-700 mb-12">
          Panel de Estudiante
        </Title>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userGroups.map((grupo) => (
            <div key={grupo.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="bg-indigo-600 p-4">
                <Title level="h2" className="text-2xl font-semibold text-white">
                  {grupo.group_name}
                </Title>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Integrantes
                </h3>
                <ul className="text-gray-600 space-y-2 overflow-y-auto h-48 border p-4">
                  {grupo.users && grupo.users.map((user) => (
                    <li key={user.id} className="flex items-center bg-white shadow-md rounded-lg p-4 border">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {user.name}
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-700  flex items-center">
                <svg class="w-6 h-6  text-indigo-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 5h6m-6 4h6M10 3v4h4V3h-4Z"/>
</svg>

                  Tareas
                </h3>
                <ul className="text-gray-600 space-y-2 overflow-y-auto h-48 border p-4">
                  {grupo.homeworks && grupo.homeworks.length > 0 ? (
                    grupo.homeworks.map((task) => {
                      const delivery = grupo.userDeliveries && grupo.userDeliveries.find(delivery => delivery.id_homework === task.id);
                      const isSubmitted = !!delivery;

                      return (
                        <li key={task.id} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 border p-4">
                          <div>{task.description}</div>
                          <div className="text-sm text-gray-500">Fecha de entrega: {new Date(task.delivery_date).toLocaleDateString()}</div>
                          {isSubmitted && <div className="text-sm text-green-600">Calificación: {delivery.grade}</div>}
                          <div className="flex items-center">
                            <Button
                              onClick={() => {
                                setSelectedHomework(task);
                                setIsModalOpen(true);
                              }}
                              className={`mt-2 ${isHomeworkLate(task.delivery_date) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white'} px-4 py-2 rounded`}
                              disabled={isHomeworkLate(task.delivery_date) || isSubmitted}
                            >
                              {isHomeworkLate(task.delivery_date) ? 'Tarea fuera de plazo' : (isSubmitted ? 'Enviado' : 'Entregar Tarea')}
                            </Button>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-gray-500">No hay tareas disponibles.</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-lg font-semibold mb-4">Entregar Tarea</h2>
          <InputField
            label="Enlace de Google Drive"
            id="task-link"
            name="taskLink"
            type="url"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={handleSubmitHomework}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Enviar
          </Button>
        </Modal>
      </main>
      <Footer />
    </div>
  );
};

export default HomePageStudent;
