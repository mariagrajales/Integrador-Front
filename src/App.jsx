import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from './components/pages/LoginPage';
import HomePageMaster from "./components/pages/HomePageMaster";
import AddGroup from "./components/pages/AddGroup";
import HomePageStudent from "./components/pages/HomePageStudent";
import { NotFound } from "./components/pages/NotFound";
import TaskMaster from "./components/pages/TaskMaster";
import { Register } from "./components/pages/Register";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/homeMaster" element={<HomePageMaster />} />
        <Route path="/addGroup" element={<AddGroup />} />
        <Route path="/homeStudent" element={<HomePageStudent />} />
        <Route path="/taskMaster" element={<TaskMaster />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}