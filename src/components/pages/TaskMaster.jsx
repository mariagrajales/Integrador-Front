import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "../organisms/Header";
import { Footer } from "../organisms/Footer";
import Title from "../atoms/Title";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const GroupTaskMaster = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [homeworks, setHomeworks] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [users, setUsers] = useState([]);
    const [grading, setGrading] = useState({});

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://localhost:3300/groups', {
                    withCredentials: true,
                });
                setGroups(response.data.data.data);
            } catch (error) {
                console.error('Error al obtener los grupos:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3300/users', {
                    withCredentials: true,
                });
                setUsers(response.data.data || []);
            } catch (error) {
                console.error('Error al obtener los usuarios:', error);
                setUsers([]);
            }
        };

        fetchGroups();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedGroupId) {
            const fetchHomeworks = async () => {
                try {
                    const response = await axios.get(`http://localhost:3300/homeworks/group/${selectedGroupId}`, {
                        withCredentials: true,
                    });
                    setHomeworks(response.data.data || []);
                } catch (error) {
                    console.error('Error al obtener las tareas:', error);
                    setHomeworks([]);
                }
            };

            const fetchDeliveries = async () => {
                try {
                    const response = await axios.get('http://localhost:3300/deliveries', {
                        withCredentials: true,
                    });
                    setDeliveries(response.data.data.data || []);
                } catch (error) {
                    console.error('Error al obtener las entregas:', error);
                    setDeliveries([]);
                }
            };

            fetchHomeworks();
            fetchDeliveries();
        }
    }, [selectedGroupId]);

    const handleGroupSelect = (groupId) => {
        setSelectedGroupId(groupId);
    };

    const handleBack = () => {
        navigate("/homeMaster");
    };

    const handleGradeChange = (homeworkId, deliveryId, e) => {
        const { value } = e.target;
        setGrading(prevState => ({
            ...prevState,
            [`${homeworkId}-${deliveryId}`]: Math.min(Math.max(Number(value), 0), 100)
        }));
    };

    const handleGradeSubmit = async (homeworkId, deliveryId) => {
        try {
            const response = await axios.patch(`http://localhost:3300/deliveries/grade/${deliveryId}`, {
                grade: grading[`${homeworkId}-${deliveryId}`] || 0
            }, {
                withCredentials: true,
            });
            if (response.data.message === "Entrega calificada") {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Tarea calificada correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    background: '#f4f4f9',
                    color: '#333'
                });
                setDeliveries(prevDeliveries =>
                    prevDeliveries.map(delivery =>
                        delivery.id === deliveryId
                            ? { ...delivery, grade: grading[`${homeworkId}-${deliveryId}`] || 0 }
                            : delivery
                    )
                );
            }
        } catch (error) {
            console.error('Error al calificar la tarea:', error);
        }
    };

    const getStudentInfo = (studentId) => {
        const user = users.find(u => u.id === studentId && u.type === 'student');
        return user ? `${user.name} ${user.lastname} (${user.email})` : 'Desconocido';
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <Button onClick={handleBack} className="mt-4 mb-8 mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300">
                Regresar
            </Button>
            <div className="mx-4">
                <Title>Grupos y Tareas</Title>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Grupos</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        {groups.map(group => (
                            <div key={group.id} className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-200">
                                <h3 className="text-xl font-bold mb-2 text-gray-800">{group.name}</h3>
                                <button
                                    onClick={() => handleGroupSelect(group.id)}
                                    className="text-blue-500 hover:underline font-semibold"
                                >
                                    Ver Tareas
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {selectedGroupId && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Tareas del Grupo</h2>
                        {homeworks.length > 0 ? (
                            <div className="space-y-6">
                                {homeworks.map(homework => {
                                    const relatedDeliveries = deliveries.filter(d => d.id_homework === homework.id);
                                    return (
                                        <div key={homework.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                                            <p><strong>ID de la Tarea:</strong> {homework.id}</p>
                                            <p><strong>Descripción:</strong> {homework.description}</p>
                                            <p><strong>Fecha de Entrega:</strong> {new Date(homework.delivery_date).toLocaleDateString()}</p>
                                            {relatedDeliveries.length > 0 ? (
                                                relatedDeliveries.map(delivery => (
                                                    <div key={delivery.id} className="mt-4 border-t pt-4">
                                                        <p><strong>Entrega:</strong> <a href={delivery.file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{delivery.file}</a></p>
                                                        <p><strong>Fecha de Entrega:</strong> {new Date(delivery.delivery_date).toLocaleDateString()}</p>
                                                        <p><strong>Estudiante:</strong> {getStudentInfo(delivery.id_student)}</p>
                                                        <p><strong>Calificación:</strong> <span className={`font-bold ${delivery.grade ? 'text-blue-500' : 'text-gray-600'}`}>{delivery.grade ? delivery.grade : 'No calificada'}</span></p>
                                                        <div className="mt-4">
                                                            <input
                                                                type="number"
                                                                value={grading[`${homework.id}-${delivery.id}`] || ''}
                                                                onChange={(e) => handleGradeChange(homework.id, delivery.id, e)}
                                                                min="0"
                                                                max="100"
                                                                className="border p-3 rounded-lg w-60 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Calificación (0-100)"
                                                            />
                                                            <Button
                                                                onClick={() => handleGradeSubmit(homework.id, delivery.id)}
                                                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md"
                                                            >
                                                                Calificar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="mt-4 text-gray-600">No se ha entregado ninguna tarea aún.</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p>No hay tareas para este grupo.</p>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default GroupTaskMaster;