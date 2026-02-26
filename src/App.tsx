import { AppLayout } from '@/common/ui/AppLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CanvasFeat1 from './features/01-rect/Canvas';

function App() {
  return (
    <AppLayout>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<CanvasFeat1 />} />
        </Routes>
      </BrowserRouter>
    </AppLayout>
  );
}

export default App;
