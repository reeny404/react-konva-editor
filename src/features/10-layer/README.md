### 기능 요약

- Konva `Layer`와 `Group` 컴포넌트를 활용한 다중 레이어 렌더링 시스템 구현
- 레이어 추가, 레이어 순서 변경 (Raise/Lower), 레이어 잠금 (Lock/Unlock) 기능
- 물리적 층(Z-index) 분리로 복잡한 그래픽 요소들을 효율적으로 관리
- 선택된 노드 및 활성화된 레이어 상태를 추적하여 HUD(Layer Stack)에 시각적으로 표시

### 조작법

- **레이어 추가**: 상단 `ADD LAYER` 버튼 클릭 시 새로운 투명 레이어 생성
- **객체 추가**: `ADD RECT TO TOP LAYER` 클릭 시 가장 상단 레이어에 사각형 생성
- **레이어 순서 변경**: 각 레이어 옆의 `Raise` / `Lower` 버튼 클릭
- **레이어 잠금**: `Lock` 버튼 클릭 시 해당 레이어 전체 잠금 (투명도 0.5 적용, 마우스 이벤트 차단)
- **개체 선택 및 이동**: 배너나 잠겨있지 않은 객체 클릭 시 해당 레이어가 활성화(Active Layer)되며 선택 및 드래그 가능

### 구현 포인트

#### 레이어 기반 잠금 (Lock) 원리

- 개별 노드(Rect, Image 등)가 아닌 부모 `Group` 수준에서 `listening={!layer.locked}`을 주입하고, 자식 노드의 이벤트에서도 `layer.locked`를 판별하여 터치 및 드래그를 원천 차단합니다.
- 잠금 상태일 때 선택되어 있지 않은 객체들은 `opacity={0.5}`로 흐리게 보여, 시각적으로 편집 불가능한 상태임을 명확히 합니다.

#### Undo / Redo 지원 (History Command)

- 레이어 추가, 삭제, 순서 변경, 잠금 토글 등 레이어를 조작하는 모든 기능은 `executeCommand` 랩퍼 내부에 `do`와 `undo` 짝으로 구현되어 완벽한 되돌리기(Ctrl+Z) / 다시 실행(Ctrl+Shift+Z)을 지원합니다.

관련 파일

- `src/features/10-layer/commands/layerCommands.tsx`
- `src/commands/history.ts`

#### HUD (Heads Up Display)

- 컨테이너 좌측 상단에 Layer Stack UI를 구현했습니다. 
- 데이터 상으로는 레이어 순서가 배열 인덱스대로 존재하지만, 사용자에게는 가장 상단(Index가 높은) 레이어가 위쪽에 보이도록 `.reverse()`를 통하여 직관적으로 레이어 층계를 렌더링합니다.

### 파일 구성

- `Canvas.tsx`: 메인 캔버스 렌더링 컴포넌트, 상단 컨트롤바 생성, Layer HUD 구조 렌더링, 멀티 Layer/Group/Node 순회 및 이벤트 차단 로직 포함 
- `commands/layerCommands.tsx`: 레이어 조작과 관련된 스토어 상태 변경과 과거 기록(undo/redo) 캡슐화 로직
- `commands/documentCommands.ts`: 상단 레이어에 도형 추가와 노드 이동 등의 위치 변경 로직 수행
