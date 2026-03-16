import { beforeEach, describe, expect, it } from 'vitest';
import { useDocumentStore } from './documentStore';
import { useLayerStore } from './layerStore';

const resetStores = () => {
  useDocumentStore.setState({
    doc: {
      nodes: {},
    },
  });

  useLayerStore.setState((state) => ({
    ...state,
    doc: {
      activeLayerId: null,
      layers: [],
      layerMapper: {},
    },
  }));
};

describe('useLayerStore', () => {
  beforeEach(() => {
    resetStores();
  });

  it('초기 상태가 비어 있는 레이어 문서여야 한다', () => {
    const { doc } = useLayerStore.getState();

    expect(doc.activeLayerId).toBeNull();
    expect(doc.layers).toEqual([]);
    expect(doc.layerMapper).toEqual({});
  });

  it('레이어를 추가하면 layers와 layerMapper가 업데이트된다', () => {
    const layerStore = useLayerStore.getState();

    layerStore.addLayer(
      {
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        nodes: [],
      },
      0,
    );

    const { doc } = useLayerStore.getState();

    expect(doc.layers).toHaveLength(1);
    expect(doc.layers[0]).toMatchObject({
      id: 'layer-1',
      name: 'Layer 1',
    });
    expect(doc.layerMapper['layer-1']).toEqual([]);
  });

  it('레이어를 제거하면 layers와 layerMapper에서 제거된다', () => {
    const store = useLayerStore.getState();

    store.addLayer(
      {
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        nodes: [],
      },
      0,
    );

    store.removeLayer('layer-1');

    const { doc } = useLayerStore.getState();

    expect(doc.layers.find((layer) => layer.id === 'layer-1')).toBeUndefined();
    expect(doc.layerMapper['layer-1']).toBeUndefined();
  });

  it('레이어 순서를 변경할 수 있다', () => {
    const store = useLayerStore.getState();

    store.addLayer(
      {
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        nodes: [],
      },
      0,
    );
    store.addLayer(
      {
        id: 'layer-2',
        name: 'Layer 2',
        visible: true,
        locked: false,
        nodes: [],
      },
      1,
    );

    store.reorderLayer(0, 1);

    const { doc } = useLayerStore.getState();

    expect(doc.layers[0].id).toBe('layer-2');
    expect(doc.layers[1].id).toBe('layer-1');
  });

  it('노드를 추가하면 documentStore와 layerMapper가 함께 업데이트된다', () => {
    const layerStore = useLayerStore.getState();

    layerStore.addLayer(
      {
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        nodes: [],
      },
      0,
    );

    layerStore.addNode('layer-1', {
      id: 'node-1',
      type: 'rect',
      name: 'Rect 1',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      rotation: 0,
      fill: '#000000',
      stroke: '#ffffff',
    });

    const docStore = useDocumentStore.getState();
    const { doc } = useLayerStore.getState();

    expect(docStore.getNode('node-1')).toBeDefined();
    expect(doc.layerMapper['layer-1']).toEqual(['node-1']);
  });

  it('노드를 제거하면 documentStore와 layerMapper에서 함께 제거된다', () => {
    const layerStore = useLayerStore.getState();

    layerStore.addLayer(
      {
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        nodes: [],
      },
      0,
    );

    layerStore.addNode('layer-1', {
      id: 'node-1',
      type: 'rect',
      name: 'Rect 1',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      rotation: 0,
      fill: '#000000',
      stroke: '#ffffff',
    });

    layerStore.removeNode('layer-1', 'node-1');

    const docStore = useDocumentStore.getState();
    const { doc } = useLayerStore.getState();

    expect(docStore.getNode('node-1')).toBeUndefined();
    expect(doc.layerMapper['layer-1']).toEqual([]);
  });
});
