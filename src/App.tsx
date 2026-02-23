import { Canvas } from './components/Canvas';
import { Layout } from './layouts/Layout';

function App() {
  return (
    <Layout>
      <div className='h-full w-full p-4'>
        <div className='h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <Canvas />
        </div>
      </div>
    </Layout>
  );
}

export default App;
