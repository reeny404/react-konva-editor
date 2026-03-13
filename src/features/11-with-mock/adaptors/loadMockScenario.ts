import { loadJsonFile } from '@/utils/file';
import type { ScenarioDb, SubareaDb } from './scenario/types';

export type LoadMockScenarioResult = {
  scenario: ScenarioDb;
  subareas: SubareaDb[];
};

/**
 * scenario 1건 + subarea n건 mock 데이터를 불러와서
 * 어댑터 입력 형식으로 반환합니다.
 * 실제 앱에서는 API 호출로 scenario + subarea 목록을 가져온 뒤 동일 형태로 넘기면 됩니다.
 *
 * 참고: mock json 파일들은 런타임에 `/mocks/*.json` 경로에서 로드됩니다.
 */
export async function loadMockScenario(): Promise<LoadMockScenarioResult> {
  const scenario = await loadJsonFile<ScenarioDb>('scenario.json');
  const subareas: SubareaDb[] = await Promise.all([
    loadJsonFile<SubareaDb>('subarea-1.json'),
    loadJsonFile<SubareaDb>('subarea-2.json'),
    loadJsonFile<SubareaDb>('subarea-3.json'),
    loadJsonFile<SubareaDb>('subarea-4.json'),
  ]);

  return { scenario, subareas };
}
