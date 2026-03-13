import type { ScenarioDb, SubareaDb } from './scenario/types';

export type LoadMockScenarioResult = {
  scenario: ScenarioDb;
  subareas: SubareaDb[];
};

export class FileError extends Error {
  constructor(name: 'FileNotFound' | 'FileInvalid', message: string) {
    super(message);
    this.name = name;
  }
}

async function fetchJson<T>(fileName: string): Promise<T> {
  const res = await fetch(`/mocks/${fileName}`);

  if (!res.ok) {
    throw new FileError(
      'FileNotFound',
      `필수 mock 파일이 없습니다: ${fileName}`,
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new FileError(
      'FileInvalid',
      `mock 파일 형식이 올바르지 않습니다: ${fileName}`,
    );
  }
}

/**
 * scenario 1건 + subarea n건 mock 데이터를 불러와서
 * 어댑터 입력 형식으로 반환합니다.
 * 실제 앱에서는 API 호출로 scenario + subarea 목록을 가져온 뒤 동일 형태로 넘기면 됩니다.
 *
 * 참고: mock json 파일들은 런타임에 `/mocks/*.json` 경로에서 로드됩니다.
 */
export async function loadMockScenario(): Promise<LoadMockScenarioResult> {
  const scenario = await fetchJson<ScenarioDb>('scenario.json');
  const subareas: SubareaDb[] = await Promise.all([
    fetchJson<SubareaDb>('subarea-1.json'),
    fetchJson<SubareaDb>('subarea-2.json'),
    fetchJson<SubareaDb>('subarea-3.json'),
    fetchJson<SubareaDb>('subarea-4.json'),
  ]);

  return { scenario, subareas };
}
