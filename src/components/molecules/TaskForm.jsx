import React, { useState, useEffect } from 'react';
import InputField from '../atoms/InputField';
import Button from '../atoms/Button';

const TaskForm = ({ onSubmit, initialData }) => {
    const [descripcion, setDescripcion] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState('');

    useEffect(() => {
        if (initialData) {
            setDescripcion(initialData.description);
            setFechaEntrega(new Date(initialData.delivery_date).toISOString().split('T')[0]);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ descripcion, fechaEntrega });
    };

    return (
        <form onSubmit={handleSubmit}>
            <InputField
                label="Titulo"
                type="text"
                name="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
            />
            <InputField
                label="Fecha de Entrega"
                type="date"
                name="fechaEntrega"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
            />
            <Button type="submit" className="bg-green-500 text-white rounded p-2 m-4">Guardar Tarea</Button>
        </form>
    );
};

export default TaskForm;
