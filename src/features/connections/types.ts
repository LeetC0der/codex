export type ConnectionStatus = 'Connected' | 'Disconnected' | 'Testing';

export type DbEngine =
  | 'PostgreSQL'
  | 'MySQL'
  | 'MariaDB'
  | 'SQL Server'
  | 'Oracle'
  | 'SQLite'
  | 'CockroachDB';

export type DbConnection = {
  id: string;
  name: string;
  engine: DbEngine;
  host: string;
  port: number;
  database: string;
  status: ConnectionStatus;
  notes: string;
};
