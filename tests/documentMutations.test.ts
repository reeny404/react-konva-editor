import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addLayerToDocument,
  addNodeToDocument,
  removeLayerFromDocument,
  removeNodeFromDocument,
  reorderLayerInDocument,
  setActiveLayerInDocument,
  updateLayerInDocument,
  updateNodeInDocument,
} from '../src/stores/mutations/documentMutations.ts';
import { findLayerIdByNodeId } from '../src/stores/selectors/documentSelectors.ts';
import type { CanvasDocument } from '../src/types/document.ts';
import type { CanvasLayer } from '../src/types/layer.ts';
import type { CanvasNode } from '../src/types/node.ts';

const createLayer = (id: string, name = `Layer ${id}`): CanvasLayer => ({
  id,
  name,
  visible: true,
  locked: false,
});

const createRectNode = (id: string, name = `Rect ${id}`): CanvasNode => ({
  id,
  type: 'rect',
  name,
  x: 10,
  y: 20,
  width: 100,
  height: 80,
  rotation: 0,
  fill: '#111111',
  stroke: '#222222',
});

const createDocument = (): CanvasDocument => ({
  activeLayerId: 'layer-1',
  layers: {
    'layer-1': createLayer('layer-1', 'Layer 1'),
    'layer-2': createLayer('layer-2', 'Layer 2'),
  },
  layerOrder: ['layer-1', 'layer-2'],
  layerMapper: {
    'layer-1': ['node-1', 'node-2'],
    'layer-2': ['node-3'],
  },
  nodes: {
    'node-1': createRectNode('node-1', 'Node 1'),
    'node-2': createRectNode('node-2', 'Node 2'),
    'node-3': createRectNode('node-3', 'Node 3'),
  },
});

test('setActiveLayerInDocument는 activeLayerId만 변경한다', () => {
  const doc = createDocument();

  const nextDoc = setActiveLayerInDocument(doc, 'layer-2');

  assert.equal(nextDoc.activeLayerId, 'layer-2');
  assert.equal(nextDoc.layers, doc.layers);
  assert.equal(nextDoc.nodes, doc.nodes);
});

test('findLayerIdByNodeId는 매핑된 layerId를 반환한다', () => {
  const doc = createDocument();

  assert.equal(findLayerIdByNodeId(doc, 'node-3'), 'layer-2');
  assert.equal(findLayerIdByNodeId(doc, 'missing-node'), undefined);
});

test('addNodeToDocument는 대상 layerMapper와 nodes에 node를 추가한다', () => {
  const doc = createDocument();
  const nextNode = createRectNode('node-4', 'Node 4');

  const nextDoc = addNodeToDocument(doc, nextNode, 'layer-2');

  assert.equal(nextDoc.nodes['node-4'], nextNode);
  assert.deepEqual(nextDoc.layerMapper['layer-2'], ['node-3', 'node-4']);
  assert.deepEqual(nextDoc.layerMapper['layer-1'], ['node-1', 'node-2']);
});

test('addNodeToDocument는 target이 없으면 activeLayerId 레이어에 추가한다', () => {
  const doc = createDocument();
  const nextNode = createRectNode('node-4', 'Node 4');

  const nextDoc = addNodeToDocument(doc, nextNode);

  assert.deepEqual(nextDoc.layerMapper['layer-1'], [
    'node-1',
    'node-2',
    'node-4',
  ]);
});

test('updateNodeInDocument는 node 속성을 패치한다', () => {
  const doc = createDocument();

  const nextDoc = updateNodeInDocument(doc, 'node-2', {
    x: 999,
    rotation: 90,
  });

  assert.equal(nextDoc.nodes['node-2'].x, 999);
  assert.equal(nextDoc.nodes['node-2'].rotation, 90);
  assert.equal(nextDoc.nodes['node-1'], doc.nodes['node-1']);
});

test('removeNodeFromDocument는 node와 소유 layer의 layerMapper 항목을 제거한다', () => {
  const doc = createDocument();

  const nextDoc = removeNodeFromDocument(doc, 'node-2');

  assert.equal(nextDoc.nodes['node-2'], undefined);
  assert.deepEqual(nextDoc.layerMapper['layer-1'], ['node-1']);
  assert.deepEqual(nextDoc.layerMapper['layer-2'], ['node-3']);
});

test('addLayerToDocument는 지정한 index에 layer를 삽입한다', () => {
  const doc = createDocument();
  const nextLayer = createLayer('layer-3', 'Layer 3');

  const nextDoc = addLayerToDocument(doc, nextLayer, 1);

  assert.deepEqual(nextDoc.layerOrder, ['layer-1', 'layer-3', 'layer-2']);
  assert.deepEqual(nextDoc.layerMapper['layer-3'], []);
  assert.equal(nextDoc.layers['layer-3'].name, 'Layer 3');
});

test('updateLayerInDocument는 layer 속성을 패치한다', () => {
  const doc = createDocument();

  const nextDoc = updateLayerInDocument(doc, 'layer-2', {
    locked: true,
    visible: false,
  });

  assert.equal(nextDoc.layers['layer-2'].locked, true);
  assert.equal(nextDoc.layers['layer-2'].visible, false);
  assert.equal(nextDoc.layers['layer-1'], doc.layers['layer-1']);
});

test('removeLayerFromDocument는 layer와 모든 자식 node를 제거한다', () => {
  const doc = createDocument();

  const nextDoc = removeLayerFromDocument(doc, 'layer-1');

  assert.equal(nextDoc.layers['layer-1'], undefined);
  assert.equal(nextDoc.nodes['node-1'], undefined);
  assert.equal(nextDoc.nodes['node-2'], undefined);
  assert.deepEqual(nextDoc.layerOrder, ['layer-2']);
  assert.equal(nextDoc.activeLayerId, 'layer-2');
});

test('reorderLayerInDocument는 layerOrder 항목을 이동한다', () => {
  const doc = createDocument();

  const nextDoc = reorderLayerInDocument(doc, 0, 1);

  assert.deepEqual(nextDoc.layerOrder, ['layer-2', 'layer-1']);
});
