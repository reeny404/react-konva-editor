import type { ScenarioDb, SubareaDb } from './scenario/types';

import scenarioJson from '@/mocks/scenario.json';
import subarea1Json from '@/mocks/subarea-1.json';
import subarea2Json from '@/mocks/subarea-2.json';
import subarea3Json from '@/mocks/subarea-3.json';
import subarea4Json from '@/mocks/subarea-4.json';

export type LoadMockScenarioResult = {
  scenario: ScenarioDb;
  subareas: SubareaDb[];
};

/**
 * scenario 1건 + subarea n건 mock 데이터를 불러와서
 * 어댑터 입력 형식으로 반환합니다.
 * 실제 앱에서는 API 호출로 scenario + subarea 목록을 가져온 뒤 동일 형태로 넘기면 됩니다.
 */
export function loadMockScenario(): LoadMockScenarioResult {
  const scenario = scenarioJson as ScenarioDb;
  const subareas: SubareaDb[] = [
    subarea1Json as SubareaDb,
    subarea2Json as SubareaDb,
    subarea3Json as SubareaDb,
    subarea4Json as SubareaDb,
  ];
  return { scenario, subareas };
}
