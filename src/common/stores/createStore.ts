import { useSyncExternalStore } from 'react';

type Listener = () => void;

type SetState<T> = (next: T | ((prev: T) => T)) => void;
type GetState<T> = () => T;

export type StoreApi<T> = {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: Listener) => () => void;
};

export function createStore<T>(
  initializer: (set: SetState<T>, get: GetState<T>) => T,
): StoreApi<T> {
  const listeners = new Set<Listener>();
  let state: T;

  const getState: GetState<T> = () => state;

  const setState: SetState<T> = (next) => {
    const nextState =
      typeof next === 'function' ? (next as (prev: T) => T)(state) : next;

    if (Object.is(nextState, state)) {
      return;
    }

    state = nextState;
    listeners.forEach((listener) => listener());
  };

  state = initializer(setState, getState);

  return {
    getState,
    setState,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function createStoreHook<T>(store: StoreApi<T>) {
  return function useStore<Selected>(selector: (state: T) => Selected) {
    return useSyncExternalStore(
      store.subscribe,
      () => selector(store.getState()),
      () => selector(store.getState()),
    );
  };
}
