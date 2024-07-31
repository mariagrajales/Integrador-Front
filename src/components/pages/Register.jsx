import { useState } from 'react'
import axios from 'axios'
import Button from "../atoms/Button"
import InputField from "../atoms/InputField"
import Title from "../atoms/Title"

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    type: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('https://walle-up-back.freemyip.com/users', formData)
      console.log('Usuario registrado:', response.data)
    } catch (error) {
      console.error('Error al registrar:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <Title className="text-2xl font-bold mb-6 text-center">Registro</Title>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Nombre"
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
          />
          <InputField
            label="Apellidos"
            id="lastname"
            name="lastname"
            type="text"
            required
            value={formData.lastname}
            onChange={handleChange}
          />
          <InputField
            label="Correo electrónico"
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="Contraseña"
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <div className="flex flex-col">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Tipo de usuario:
            </label>
            <select 
              id="type"
              name="type"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">Selecciona tu rol</option>
              <option value="student">Estudiante</option>
              <option value="teacher">Maestro</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600">
            Registrarse
          </Button>
        </form>
      </div>
    </div>
  )
}
