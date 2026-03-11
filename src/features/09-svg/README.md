### 기능 요약

- SVG를 Konva `Image`로 렌더링하여 캔버스에 배치
- 상단 버튼으로 SVG 노드 추가 (`box.svg`, `circle.svg`)
- 선택/이동/변형(사이즈/회전) 지원
- 줌/팬 지원 + 그리드 표시

### 조작법

- **줌(확대/축소)**: 마우스 휠
- **팬(이동)**: 마우스 휠(가운데 버튼) 클릭 드래그
- **선택 해제**: 바닥(배경) 좌클릭
- **선택**: 도형/이미지 클릭
- **이동**: 드래그
- **변형**: 선택 시 나타나는 Transform 핸들로 리사이즈/회전

### 구현 포인트

#### SVG 색상(fill/stroke) 주입

- `CustomImage`는 `useSvgImage(url, { fill, stroke })`를 사용합니다.
- `useSvgImage`는 URL에서 SVG 텍스트를 fetch 한 뒤 `replaceSvgFillStroke`로 최상위 `<svg>`의 `fill`, `stroke`만 교체하고,
  Blob URL로 변환하여 `useImage`에 전달합니다.
- 로딩 중 깜빡임을 줄이기 위해 1x1 투명 PNG를 placeholder로 사용합니다.

관련 파일

- `src/features/09-svg/components/CustomImage.tsx`
- `src/hooks/useSvgImage.ts`
- `src/utils/replaceSvgFillStroke.ts`

#### 선택/변형(Transformer)

- 공통 컴포넌트 `SelectionTransformer`가 선택된 노드 id로 stage에서 `#id`를 찾아 `Transformer`를 연결

### 파일 구성

- `Canvas.tsx`: 툴바(추가 버튼), 그리드, 렌더링/이벤트, `SelectionTransformer` 연결
- `initializeNode.ts`: SVG 커스텀 이미지 노드 생성 유틸
- `components/CustomImage.tsx`: SVG 이미지를 Konva `Image`로 렌더링 + 선택 스타일
- `components/ZoomInformation.tsx`: 현재 scale/pan 정보 표시
- `hooks/useZoomPan.ts`: wheel 줌, middle-drag 팬
- `hooks/useSelection.ts`: selection store 래핑
- `hooks/useGridPoints.ts`: 그리드 라인 points 계산
