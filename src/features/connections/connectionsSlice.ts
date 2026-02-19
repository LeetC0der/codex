import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { DbConnection, DbEngine } from './types';

type ConnectionsState = {
  items: DbConnection[];
};

type ConnectionPayload = {
  name: string;
  engine: DbEngine;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  notes: string;
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
      username: 'analytics_admin',
      password: 'Analytics123!',
      status: 'Connected',
      notes: 'Used for BI dashboards',
      lastError: null,
    },
    {
      id: 'orders',
      name: 'Orders Core',
      engine: 'MySQL',
      host: 'orders.internal',
      port: 3306,
      database: 'orders',
      username: 'orders_user',
      password: 'Orders123!',
      status: 'Disconnected',
      notes: 'OLTP write traffic',
      lastError: null,
    },
    {
      id: 'erp',
      name: 'Legacy ERP',
      engine: 'SQL Server',
      host: 'erp.corp.local',
      port: 1433,
      database: 'erp_main',
      username: 'erp_admin',
      password: 'Legacy123!',
      status: 'Disconnected',
      notes: 'Needs credential rotation',
      lastError: null,
    },
    {
      id: 'finance',
      name: 'Finance Warehouse',
      engine: 'Oracle',
      host: 'finance-db.internal',
      port: 1521,
      database: 'fin_dw',
      username: 'finance_user',
      password: 'Finance123!',
      status: 'Connected',
      notes: 'Nightly reconciliation jobs',
      lastError: null,
    },
  ],
};

function validateConnection(connection: DbConnection): string | null {
  if (!connection.host || connection.host.length < 3) {
    return 'Host is not valid.';
  }

  if (!connection.database || connection.database.length < 2) {
    return 'Database name is not valid.';
  }

  if (connection.port <= 0 || connection.port >= 65536) {
    return 'Port is out of valid range.';
  }

  if (!connection.username || connection.username.length < 3) {
    return 'Credentials are not valid: username is required.';
  }

  const strongPassword =
    connection.password.length >= 8 &&
    /[A-Z]/.test(connection.password) &&
    /[a-z]/.test(connection.password) &&
    /[0-9]/.test(connection.password);

  if (!strongPassword) {
    return 'Credentials are not valid: password must be at least 8 chars with upper, lower and number.';
  }

  if (connection.host.toLowerCase().includes('legacy')) {
    return 'Connection target is not valid for current environment.';
  }

  return null;
}

export const testConnection = createAsyncThunk<
  { connectionId: string; status: 'Connected' },
  string,
  { state: { connections: ConnectionsState }; rejectValue: { connectionId: string; error: string } }
>('connections/testConnection', async (connectionId, { getState, rejectWithValue }) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const state = getState();
  const target = state.connections.items.find((item) => item.id === connectionId);

  if (!target) {
    return rejectWithValue({ connectionId, error: 'Connection not found.' });
  }

  const validationError = validateConnection(target);
  if (validationError) {
    return rejectWithValue({ connectionId, error: validationError });
  }

  return { connectionId, status: 'Connected' };
});

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    addConnection(state, action: PayloadAction<ConnectionPayload>) {
      const payload = action.payload;
      state.items.push({
        id: crypto.randomUUID(),
        name: payload.name,
        engine: payload.engine,
        host: payload.host,
        port: payload.port,
        database: payload.database,
        username: payload.username,
        password: payload.password,
        notes: payload.notes,
        status: 'Disconnected',
        lastError: null,
      });
    },
    editConnection(state, action: PayloadAction<{ id: string } & ConnectionPayload>) {
      const item = state.items.find((connection) => connection.id === action.payload.id);
      if (!item) {
        return;
      }

      item.name = action.payload.name;
      item.engine = action.payload.engine;
      item.host = action.payload.host;
      item.port = action.payload.port;
      item.database = action.payload.database;
      item.username = action.payload.username;
      item.password = action.payload.password;
      item.notes = action.payload.notes;
      item.lastError = null;
    },
    removeConnection(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter((connection) => connection.id !== action.payload.id);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(testConnection.pending, (state, action) => {
      const item = state.items.find((connection) => connection.id === action.meta.arg);
      if (item) {
        item.status = 'Testing';
        item.lastError = null;
      }
    });
    builder.addCase(testConnection.fulfilled, (state, action) => {
      const item = state.items.find((connection) => connection.id === action.payload.connectionId);
      if (item) {
        item.status = 'Connected';
        item.lastError = null;
      }
    });
    builder.addCase(testConnection.rejected, (state, action) => {
      const connectionId = action.payload?.connectionId ?? action.meta.arg;
      const item = state.items.find((connection) => connection.id === connectionId);
      if (item) {
        item.status = 'Disconnected';
        item.lastError = action.payload?.error ?? 'Credentials are not valid for this DB connection.';
      }
    });
  },
});

export const { addConnection, editConnection, removeConnection } = connectionsSlice.actions;
export const connectionsReducer = connectionsSlice.reducer;
