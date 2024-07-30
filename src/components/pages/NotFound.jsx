import React from 'react';
import { Link, Router } from 'react-router-dom';
import Title from "../atoms/Title";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";


export const NotFound = () => {
    const navigate = useNavigate();


return (
    <div className="flex flex-col min-h-screen bg-gray-100">
        <main className="flex-grow flex items-center justify-center px-4 py-12">
            <div className="text-center">
                <Title level="h1" className="text-6xl font-bold text-blue-600 mb-4">404</Title>
                <Title level="h2" className="text-3xl font-semibold text-gray-800 mb-4">Página no encontrada</Title>
                <p className="text-xl text-gray-600 mb-8">
                    Oops! Parece que te has aventurado en un rincón inexplorado de nuestro universo digital.
                    <br />
                    No te preocupes, incluso los mejores exploradores se pierden a veces.
                </p>
                <Button onClick={() => navigate('/login')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                    Volver al inicio
                </Button>
            </div>
        </main>
    </div>
);
};