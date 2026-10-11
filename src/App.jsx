import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Salas from './pages/Salas';
import MiReserva from './pages/MiReserva';
import Agenda from './pages/Agenda';
import MisReservas from './pages/MisReservas';
import Admin from './pages/Admin';

export default function App() {
  return (
    <>
      <NavBar />
      <div className="flex-grow-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaProtegida><Agenda /></RutaProtegida>} />
          <Route path="/salas" element={<RutaProtegida><Salas /></RutaProtegida>} />
          <Route path="/mi-reserva" element={<RutaProtegida><MiReserva /></RutaProtegida>} />
          <Route path="/mis-reservas" element={<RutaProtegida><MisReservas /></RutaProtegida>} />
          <Route path="/admin" element={<RutaProtegida rol="coordinador"><Admin /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}
