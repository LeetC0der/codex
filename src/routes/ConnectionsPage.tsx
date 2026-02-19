import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import * as Dialog from '@radix-ui/react-dialog';
import { type CSSProperties, type Dispatch, type SetStateAction, useMemo, useState } from 'react';

import {
  addConnection,
  editConnection,
  removeConnection,
  testConnection,
} from '../features/connections/connectionsSlice';
import type { ConnectionStatus, DbConnection, DbEngine } from '../features/connections/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';

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

const engineOptions = Object.keys(engineColorMap) as DbEngine[];

type FormDraft = {
  name: string;
  engine: DbEngine;
  host: string;
  port: string;
  database: string;
  notes: string;
};

const emptyDraft: FormDraft = {
  name: '',
  engine: 'PostgreSQL',
  host: '',
  port: '5432',
  database: '',
  notes: '',
};

export function ConnectionsPage() {
  const dispatch = useAppDispatch();
  const dbConnections = useAppSelector((state) => state.connections.items);

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<DbConnection | null>(null);
  const [formDraft, setFormDraft] = useState<FormDraft>(emptyDraft);

  const sortedConnections = useMemo(
    () => [...dbConnections].sort((a, b) => a.name.localeCompare(b.name)),
    [dbConnections]
  );

  const openEditDialog = (connection: DbConnection) => {
    setSelected(connection);
    setFormDraft({
      name: connection.name,
      engine: connection.engine,
      host: connection.host,
      port: String(connection.port),
      database: connection.database,
      notes: connection.notes,
    });
    setEditOpen(true);
  };

  const openAddDialog = () => {
    setFormDraft(emptyDraft);
    setAddOpen(true);
  };

  const rows = sortedConnections.map((connection) => (
    <Table.Tr key={connection.id}>
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
          <Button
            size="xs"
            variant="light"
            loading={connection.status === 'Testing'}
            onClick={() => {
              dispatch(testConnection(connection.id));
            }}
          >
            Test connection
          </Button>
          <Button size="xs" variant="default" onClick={() => openEditDialog(connection)}>
            Edit
          </Button>
          <Button
            size="xs"
            color="red"
            variant="subtle"
            onClick={() => dispatch(removeConnection({ id: connection.id }))}
          >
            Remove
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
          <Button variant="light" onClick={openAddDialog}>
            Add DB connection
          </Button>
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

      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={overlayStyle} />
          <Dialog.Content style={contentStyle}>
            <Dialog.Title style={{ margin: 0 }}>Edit DB connection</Dialog.Title>
            <Dialog.Description style={{ color: '#666', marginTop: 8 }}>
              Update metadata and endpoint details for {selected?.name}.
            </Dialog.Description>
            <ConnectionForm draft={formDraft} setDraft={setFormDraft} />
            <Group justify="end" mt="md">
              <Dialog.Close asChild>
                <Button variant="default">Cancel</Button>
              </Dialog.Close>
              <Button
                onClick={() => {
                  if (!selected || !formDraft.name.trim() || !formDraft.host.trim()) {
                    return;
                  }
                  dispatch(
                    editConnection({
                      id: selected.id,
                      name: formDraft.name.trim(),
                      engine: formDraft.engine,
                      host: formDraft.host.trim(),
                      port: Number(formDraft.port) || selected.port,
                      database: formDraft.database.trim(),
                      notes: formDraft.notes.trim(),
                    })
                  );
                  setEditOpen(false);
                }}
              >
                Save
              </Button>
            </Group>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={overlayStyle} />
          <Dialog.Content style={contentStyle}>
            <Dialog.Title style={{ margin: 0 }}>Add DB connection</Dialog.Title>
            <Dialog.Description style={{ color: '#666', marginTop: 8 }}>
              Create a new SQL database connection.
            </Dialog.Description>
            <ConnectionForm draft={formDraft} setDraft={setFormDraft} />
            <Group justify="end" mt="md">
              <Dialog.Close asChild>
                <Button variant="default">Cancel</Button>
              </Dialog.Close>
              <Button
                onClick={() => {
                  if (!formDraft.name.trim() || !formDraft.host.trim()) {
                    return;
                  }
                  dispatch(
                    addConnection({
                      name: formDraft.name.trim(),
                      engine: formDraft.engine,
                      host: formDraft.host.trim(),
                      port: Number(formDraft.port) || 5432,
                      database: formDraft.database.trim(),
                      notes: formDraft.notes.trim(),
                    })
                  );
                  setAddOpen(false);
                  setFormDraft(emptyDraft);
                }}
              >
                Create
              </Button>
            </Group>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
}

type ConnectionFormProps = {
  draft: FormDraft;
  setDraft: Dispatch<SetStateAction<FormDraft>>;
};

function ConnectionForm({ draft, setDraft }: ConnectionFormProps) {
  return (
    <Stack mt="md">
      <TextInput
        label="Connection name"
        value={draft.name}
        onChange={(event) => setDraft((prev) => ({ ...prev, name: event.currentTarget.value }))}
      />
      <Select
        label="DB type"
        value={draft.engine}
        data={engineOptions}
        onChange={(value) => {
          if (!value) {
            return;
          }
          setDraft((prev) => ({ ...prev, engine: value as DbEngine }));
        }}
      />
      <TextInput
        label="Host"
        value={draft.host}
        onChange={(event) => setDraft((prev) => ({ ...prev, host: event.currentTarget.value }))}
      />
      <TextInput
        label="Port"
        value={draft.port}
        onChange={(event) => setDraft((prev) => ({ ...prev, port: event.currentTarget.value }))}
      />
      <TextInput
        label="Database"
        value={draft.database}
        onChange={(event) => setDraft((prev) => ({ ...prev, database: event.currentTarget.value }))}
      />
      <TextInput
        label="Notes"
        value={draft.notes}
        onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.currentTarget.value }))}
      />
    </Stack>
  );
}

const overlayStyle: CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
  position: 'fixed',
  inset: 0,
};

const contentStyle: CSSProperties = {
  backgroundColor: 'white',
  borderRadius: 12,
  boxShadow: '0 18px 38px rgba(0, 0, 0, 0.2)',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'min(92vw, 520px)',
  padding: 20,
};
