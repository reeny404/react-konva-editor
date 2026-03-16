import { documentCommands } from '@/commands/documentCommands';
import Button from '@/components/Button';
import type { Size } from '@/types/geometry';
import { FileError } from '@/utils/file';
import { useEffect, useState } from 'react';
import { buildCanvasFromDb } from './adaptors/buildCanvasFromDb';
import { loadMockScenario } from './adaptors/loadMockScenario';
import Canvas from './Canvas';
import { LOCKED_DEFAULT } from './constant';

type Metadata = {
  cellSize: number;
  canvasSize: Size;
};

export default function Container() {
  const [mockError, setMockError] = useState<string | null>(null);
  const [readonly, setReadonly] = useState<boolean>(LOCKED_DEFAULT);
  const [metadata, setMetadata] = useState<Metadata>({
    cellSize: 100,
    canvasSize: {
      width: 1000,
      height: 1000,
    },
  });

  useEffect(() => {
    return () => {
      documentCommands.loadDocument({
        nodes: [],
      });
    };
  }, []);

  const handleLoadMock = async () => {
    try {
      setMockError(null);

      const { scenario, subareas } = await loadMockScenario();
      const { document, meta } = buildCanvasFromDb(scenario, subareas);

      setMetadata({
        cellSize: meta.cellSize,
        canvasSize: meta.size,
      });

      documentCommands.loadDocument(document);
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

        <Button
          className={readonly ? 'bg-slate-300' : ''}
          onClick={() => setReadonly((prev) => !prev)}
        >
          Locked: {readonly ? 'ON' : 'OFF'}
        </Button>
      </div>

      {mockError ? (
        <div className='flex h-full items-center justify-center text-sm text-red-600'>
          {mockError}
        </div>
      ) : (
        <Canvas
          canvasSize={metadata.canvasSize}
          cellSize={metadata.cellSize}
          readonly={readonly}
        />
      )}
    </>
  );
}
