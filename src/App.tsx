import { AppLayout } from '@/common/ui/AppLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CanvasFeat1 from './features/01-rect/Canvas';
import CanvasFeat2 from './features/02-maintainer/Canvas';

function App() {
  return (
    <AppLayout>
      <BrowserRouter>
        <Routes>
          <Route path='/rect' element={<CanvasFeat1 />} />
          <Route path='/maintainer' element={<CanvasFeat2 />} />
        </Routes>
      </BrowserRouter>
    </AppLayout>
  );
}

export default App;
