# react-konva-editor

## 스택

- React 19, TypeScript, Vite
- [react-konva](https://konvajs.org/docs/react/index.html)
- Tailwind CSS
- Zustand (document, viewport, selection, history)

## 구조

- `src/editor/`: Core 영역 (Store, Command, type)
- `src/editor/ui/`: 화면에 띄울 Layout, Components 들

## 필수 기능 (검토 중)

| 이름           | 설명                                   |
| -------------- | -------------------------------------- |
| snap           | object 이동/사이즈 변경 시, snapping   |
| canvas size    | canvas 외부로 요소 이동 불가하도록     |
| action/command | redo/undo 구현을 위한 action 단위 선언 |
| object         | 하단의 상세 설명(d1) 참고              |


### 검토 내용
https://github.com/reeny404/react-konva-editor/issues/4#issue-3993617843

### object (d1)

#### 공통

- 생성 : drag/dotting 등을 통하여 에디터를 이용하여 생성 or 데이터를 전달하여 생성
- 이동 : drag
- 삭제 : select & delete key
- 선택 : 상세 정보 조회 (right panel)
- 수정 : right panel을 통한 데이터 수정 or 에디터에서 요소를 직접 수정
- lock, visible, readonly
- [검토필요] select mode에서 점 추가/점 삭제가 되는 게 맞을까?
- multi select : v1은 subarea 만 multi select 가능

#### rect

- 생성 : drag/dotting 등을 통하여 에디터를 이용하여 생성 or 데이터를 전달하여 생성
- 사이즈 변경 : 외곽선의 점(이하 외곽점)을 drag 하여 사이즈 조정
- 회전 : rotation point를 통하여 요소 회전 (회전 가능 여부 option)

#### line

- 생성 : [검토필요] 선 n개 그리는 방식 다른 서비스는 어떻게?
- 이동 : [검토필요] 선의 이동방식

#### polygon

- 생성 : [검토필요] 네모를 그리고 점을 추가하여 점 드래그? 점 통통통 찍어 end point 연결되면 완성?
- 사이즈 변경 : 외곽선의 점(이하 외곽점)을 drag 하여 사이즈 조정 (크기 조정 가능 여부 option)

#### image/svg

- 생성 : path를 받아 rendering?
- 사이즈 변경 : 외곽선의 점(이하 외곽점)을 drag 하여 사이즈 조정 (크기 조정 가능 여부 option)

#### etc.

- error 표시 : border style
- 같이 다니는 영역 + 해당 영역 배치 가능 여부?
