import { AppLayout } from '@/common/ui/AppLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CanvasFeat1 from './features/01-rect/Canvas';
import CanvasFeat2 from './features/02-maintainer/Canvas';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path='/rect' element={<CanvasFeat1 />} />
          <Route path='/maintainer' element={<CanvasFeat2 />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
