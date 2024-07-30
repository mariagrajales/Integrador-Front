import React, { useState } from 'react';
import LoginForm from '../molecules/LoginForm';
import { useNavigate } from "react-router-dom";
import Image from '../atoms/Image';
import axios from 'axios';
import Swal from 'sweetalert2';

const LoginSection = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Por favor, llena todos los campos.',
            });
            return;
        }
        
        axios.post('http://localhost:3300/users/login', {
            email: email, 
            password: password  
        }, {
            withCredentials: true 
        }) 
        .then(response => {
            console.log('Response completa:', response);
            console.log('Response data:', response.data);
        
            if (response.data.status === "success") {
                console.log(response.data.message);
                const userType = response.data.userType;
                if (userType === "teacher") {
                    navigate('/homeMaster');
                } else if (userType === "student") {
                    navigate('/homeStudent');
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Inicio de Sesión',
                    text: response.data.message || 'No se encontró ningún usuario con los datos ingresados.',
                });
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo procesar la solicitud correctamente',
            });
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="flex flex-col items-center">
                    <Image src="/images/logo2.png" alt="Imagen de Inicio de Sesión" className="w-20 h-auto" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Iniciar Sesión
                    </h2>
                </div>
                <LoginForm 
                    email={email} 
                    setEmail={setEmail} 
                    password={password} 
                    setPassword={setPassword} 
                    handleSubmit={handleSubmit} 
                />
            </div>
        </div>
    );
};

export default LoginSection;