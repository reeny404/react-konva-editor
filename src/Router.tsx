import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { routes } from './features/routes';
import AppLayout from './ui/AppLayout';
import Loading from './components/Loading';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<AppLayout />}>
          <Route index element={<Loading />} />
          {routes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
