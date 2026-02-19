import { configureStore } from '@reduxjs/toolkit';

import { connectionsReducer } from '../features/connections/connectionsSlice';
import { pipelineReducer } from '../features/pipeline/pipelineSlice';

export const store = configureStore({
  reducer: {
    connections: connectionsReducer,
    pipeline: pipelineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
