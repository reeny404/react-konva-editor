import Button from '@/components/Button';
import { FileError } from '@/utils/file';
import { useState } from 'react';
import { loadMockScenario } from './adaptors/loadMockScenario';
import Canvas from './Canvas';
import { documentCommands } from './commands/documentCommands';

export default function Container() {
  const [mockError, setMockError] = useState<string | null>(null);

  const handleLoadMock = async () => {
    try {
      setMockError(null);
      const { scenario, subareas } = await loadMockScenario();
      documentCommands.setDocumentFromScenario(scenario, subareas);
    } catch (e) {
      if (e instanceof FileError) {
        setMockError(e.message);
        return;
      }

      setMockError('알 수 없는 오류로 mock 데이터를 불러오지 못했습니다.');
    }
  };

  return (
    <>
      <div className='flex flex-wrap items-center gap-2 border-b border-slate-200 p-2'>
        <Button onClick={handleLoadMock}>Mock 데이터 로드</Button>
      </div>

      {mockError ? (
        <div className='flex h-full items-center justify-center text-sm text-red-600'>
          {mockError}
        </div>
      ) : (
        <Canvas />
      )}
    </>
  );
}
