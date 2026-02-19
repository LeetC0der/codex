import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { DbConnection } from './types';

type ConnectionsState = {
  items: DbConnection[];
};

const initialState: ConnectionsState = {
  items: [
    {
      id: 'analytics',
      name: 'Primary Analytics',
      engine: 'PostgreSQL',
      host: 'analytics-prod.internal',
      port: 5432,
      database: 'analytics',
      status: 'Connected',
      notes: 'Used for BI dashboards',
    },
    {
      id: 'orders',
      name: 'Orders Core',
      engine: 'MySQL',
      host: 'orders.internal',
      port: 3306,
      database: 'orders',
      status: 'Disconnected',
      notes: 'OLTP write traffic',
    },
    {
      id: 'erp',
      name: 'Legacy ERP',
      engine: 'SQL Server',
      host: 'erp.corp.local',
      port: 1433,
      database: 'erp_main',
      status: 'Disconnected',
      notes: 'Needs credential rotation',
    },
    {
      id: 'finance',
      name: 'Finance Warehouse',
      engine: 'Oracle',
      host: 'finance-db.internal',
      port: 1521,
      database: 'fin_dw',
      status: 'Connected',
      notes: 'Nightly reconciliation jobs',
    },
  ],
};

export const testConnection = createAsyncThunk(
  'connections/testConnection',
  async (connectionId: string, { getState }) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const state = getState() as { connections: ConnectionsState };
    const target = state.connections.items.find((item) => item.id === connectionId);

    if (!target) {
      return { connectionId, status: 'Disconnected' as const };
    }

    const healthy =
      target.host.length > 3 &&
      target.port > 0 &&
      target.port < 65536 &&
      !target.host.toLowerCase().includes('legacy');

    return {
      connectionId,
      status: healthy ? ('Connected' as const) : ('Disconnected' as const),
    };
  }
);

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    editConnection(
      state,
      action: PayloadAction<{ id: string; host: string; port: number; database: string; notes: string }>
    ) {
      const item = state.items.find((connection) => connection.id === action.payload.id);
      if (!item) {
        return;
      }

      item.host = action.payload.host;
      item.port = action.payload.port;
      item.database = action.payload.database;
      item.notes = action.payload.notes;
    },
    renameConnection(state, action: PayloadAction<{ id: string; name: string }>) {
      const item = state.items.find((connection) => connection.id === action.payload.id);
      if (!item) {
        return;
      }
      item.name = action.payload.name;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(testConnection.pending, (state, action) => {
      const item = state.items.find((connection) => connection.id === action.meta.arg);
      if (item) {
        item.status = 'Testing';
      }
    });
    builder.addCase(testConnection.fulfilled, (state, action) => {
      const item = state.items.find((connection) => connection.id === action.payload.connectionId);
      if (item) {
        item.status = action.payload.status;
      }
    });
  },
});

export const { editConnection, renameConnection } = connectionsSlice.actions;
export const connectionsReducer = connectionsSlice.reducer;
