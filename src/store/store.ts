import { configureStore } from '@reduxjs/toolkit';

import { connectionsReducer } from '../features/connections/connectionsSlice';
import { pipelineReducer } from '../features/pipeline/pipelineSlice';

const STORAGE_KEY = 'codex_app_state_v1';

type PersistedState = {
  connections?: ReturnType<typeof connectionsReducer>;
  pipeline?: ReturnType<typeof pipelineReducer>;
};

function loadPersistedState(): PersistedState | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as PersistedState;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

export const store = configureStore({
  reducer: {
    connections: connectionsReducer,
    pipeline: pipelineReducer,
  },
  preloadedState: loadPersistedState(),
});

store.subscribe(() => {
  if (typeof window === 'undefined') {
    return;
  }

  const state = store.getState();
  const persisted: PersistedState = {
    connections: state.connections,
    pipeline: state.pipeline,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
