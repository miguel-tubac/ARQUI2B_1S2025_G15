import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';
import  CameraCapture  from './pages/reconocimientoFacial';

function App() {
  return (
    <BrowserRouter>
      <div className='mx-auto'>
        <Routes>
          <Route path="/dasbord" element={<Dashboard />} />
          <Route path="/" element={<CameraCapture />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;