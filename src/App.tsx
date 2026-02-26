import { AppLayout } from '@/common/ui/AppLayout';
import { routes } from '@/features/routes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {routes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
