import { Badge, Button, Card, Container, Group, Stack, Table, Text, Title } from '@mantine/core';

type ConnectionStatus = 'Connected' | 'Disconnected' | 'Testing';

type DbEngine =
  | 'PostgreSQL'
  | 'MySQL'
  | 'MariaDB'
  | 'SQL Server'
  | 'Oracle'
  | 'SQLite'
  | 'CockroachDB';

type DbConnection = {
  name: string;
  engine: DbEngine;
  host: string;
  port: number;
  database: string;
  status: ConnectionStatus;
  notes: string;
};

const dbConnections: DbConnection[] = [
  {
    name: 'Primary Analytics',
    engine: 'PostgreSQL',
    host: 'analytics-prod.internal',
    port: 5432,
    database: 'analytics',
    status: 'Connected',
    notes: 'Used for BI dashboards',
  },
  {
    name: 'Orders Core',
    engine: 'MySQL',
    host: 'orders.internal',
    port: 3306,
    database: 'orders',
    status: 'Testing',
    notes: 'OLTP write traffic',
  },
  {
    name: 'Legacy ERP',
    engine: 'SQL Server',
    host: 'erp.corp.local',
    port: 1433,
    database: 'erp_main',
    status: 'Disconnected',
    notes: 'Needs credential rotation',
  },
  {
    name: 'Finance Warehouse',
    engine: 'Oracle',
    host: 'finance-db.internal',
    port: 1521,
    database: 'fin_dw',
    status: 'Connected',
    notes: 'Nightly reconciliation jobs',
  },
];

const statusColorMap: Record<ConnectionStatus, string> = {
  Connected: 'green',
  Testing: 'yellow',
  Disconnected: 'red',
};

const engineColorMap: Record<DbEngine, string> = {
  PostgreSQL: 'indigo',
  MySQL: 'blue',
  MariaDB: 'cyan',
  'SQL Server': 'grape',
  Oracle: 'orange',
  SQLite: 'teal',
  CockroachDB: 'lime',
};

export function ConnectionsPage() {
  const rows = dbConnections.map((connection) => (
    <Table.Tr key={connection.name}>
      <Table.Td>
        <Stack gap={0}>
          <Text fw={600}>{connection.name}</Text>
          <Text size="xs" c="dimmed">
            {connection.notes}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={engineColorMap[connection.engine]}>
          {connection.engine}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{connection.host}</Text>
        <Text size="xs" c="dimmed">
          {connection.port} • {connection.database}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColorMap[connection.status]}>{connection.status}</Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="end">
          <Button size="xs" variant="light">
            Test connection
          </Button>
          <Button size="xs" variant="default">
            Edit
          </Button>
          <Button size="xs" variant="subtle">
            Rename
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="lg">
      <Stack>
        <Group justify="space-between">
          <div>
            <Title order={2}>DB Connections</Title>
            <Text size="sm" c="dimmed">
              Manage SQL database connections only (NoSQL excluded by policy).
            </Text>
          </div>
          <Button variant="light">Add DB connection</Button>
        </Group>

        <Card withBorder>
          <Table.ScrollContainer minWidth={920}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>DB Type</Table.Th>
                  <Table.Th>Endpoint</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      </Stack>
    </Container>
  );
}
