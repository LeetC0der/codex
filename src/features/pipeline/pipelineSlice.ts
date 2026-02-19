import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { PipelineItem } from './types';

type PipelineState = {
  items: PipelineItem[];
};

type PipelinePayload = {
  name: string;
  connectionId: string;
  connectionName: string;
  schedule: string;
  owner: string;
  description: string;
};

const initialState: PipelineState = {
  items: [
    {
      id: 'daily-orders-sync',
      name: 'Daily Orders Sync',
      connectionId: 'orders',
      connectionName: 'Orders Core',
      schedule: '0 */6 * * *',
      owner: 'Data Platform',
      description: 'Ingest order changes every 6 hours into warehouse.',
      status: 'Idle',
      lastRunAt: null,
    },
    {
      id: 'finance-reconcile',
      name: 'Finance Reconciliation',
      connectionId: 'finance',
      connectionName: 'Finance Warehouse',
      schedule: '0 2 * * *',
      owner: 'Finance Ops',
      description: 'Reconcile finance-ledger snapshots nightly.',
      status: 'Succeeded',
      lastRunAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
  ],
};

export const runPipeline = createAsyncThunk('pipeline/runPipeline', async (pipelineId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const success = !pipelineId.toLowerCase().includes('legacy');

  return {
    pipelineId,
    status: success ? ('Succeeded' as const) : ('Failed' as const),
    finishedAt: new Date().toISOString(),
  };
});

const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState,
  reducers: {
    addPipeline(state, action: PayloadAction<PipelinePayload>) {
      state.items.push({
        id: crypto.randomUUID(),
        name: action.payload.name,
        connectionId: action.payload.connectionId,
        connectionName: action.payload.connectionName,
        schedule: action.payload.schedule,
        owner: action.payload.owner,
        description: action.payload.description,
        status: 'Idle',
        lastRunAt: null,
      });
    },
    editPipeline(state, action: PayloadAction<{ id: string } & PipelinePayload>) {
      const target = state.items.find((item) => item.id === action.payload.id);
      if (!target) return;
      target.name = action.payload.name;
      target.connectionId = action.payload.connectionId;
      target.connectionName = action.payload.connectionName;
      target.schedule = action.payload.schedule;
      target.owner = action.payload.owner;
      target.description = action.payload.description;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(runPipeline.pending, (state, action) => {
      const target = state.items.find((item) => item.id === action.meta.arg);
      if (target) target.status = 'Running';
    });
    builder.addCase(runPipeline.fulfilled, (state, action) => {
      const target = state.items.find((item) => item.id === action.payload.pipelineId);
      if (!target) return;
      target.status = action.payload.status;
      target.lastRunAt = action.payload.finishedAt;
    });
  },
});

export const { addPipeline, editPipeline } = pipelineSlice.actions;
export const pipelineReducer = pipelineSlice.reducer;
