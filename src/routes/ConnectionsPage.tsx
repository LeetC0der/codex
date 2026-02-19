import { Badge, Button, Card, Container, Group, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import * as Dialog from '@radix-ui/react-dialog';
import { type CSSProperties, useMemo, useState } from 'react';

import {
  editConnection,
  renameConnection,
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

type EditDraft = {
  host: string;
  port: string;
  database: string;
  notes: string;
};

export function ConnectionsPage() {
  const dispatch = useAppDispatch();
  const dbConnections = useAppSelector((state) => state.connections.items);

  const [editOpen, setEditOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [selected, setSelected] = useState<DbConnection | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [editDraft, setEditDraft] = useState<EditDraft>({
    host: '',
    port: '',
    database: '',
    notes: '',
  });

  const sortedConnections = useMemo(
    () => [...dbConnections].sort((a, b) => a.name.localeCompare(b.name)),
    [dbConnections]
  );

  const openEditDialog = (connection: DbConnection) => {
    setSelected(connection);
    setEditDraft({
      host: connection.host,
      port: String(connection.port),
      database: connection.database,
      notes: connection.notes,
    });
    setEditOpen(true);
  };

  const openRenameDialog = (connection: DbConnection) => {
    setSelected(connection);
    setRenameValue(connection.name);
    setRenameOpen(true);
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
          <Button size="xs" variant="subtle" onClick={() => openRenameDialog(connection)}>
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

      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={overlayStyle} />
          <Dialog.Content style={contentStyle}>
            <Dialog.Title style={{ margin: 0 }}>Edit DB connection</Dialog.Title>
            <Dialog.Description style={{ color: '#666', marginTop: 8 }}>
              Update endpoint details for {selected?.name}.
            </Dialog.Description>
            <Stack mt="md">
              <TextInput
                label="Host"
                value={editDraft.host}
                onChange={(event) => setEditDraft((prev) => ({ ...prev, host: event.currentTarget.value }))}
              />
              <TextInput
                label="Port"
                value={editDraft.port}
                onChange={(event) => setEditDraft((prev) => ({ ...prev, port: event.currentTarget.value }))}
              />
              <TextInput
                label="Database"
                value={editDraft.database}
                onChange={(event) =>
                  setEditDraft((prev) => ({ ...prev, database: event.currentTarget.value }))
                }
              />
              <TextInput
                label="Notes"
                value={editDraft.notes}
                onChange={(event) => setEditDraft((prev) => ({ ...prev, notes: event.currentTarget.value }))}
              />
              <Group justify="end">
                <Dialog.Close asChild>
                  <Button variant="default">Cancel</Button>
                </Dialog.Close>
                <Button
                  onClick={() => {
                    if (!selected) {
                      return;
                    }
                    dispatch(
                      editConnection({
                        id: selected.id,
                        host: editDraft.host,
                        port: Number(editDraft.port) || selected.port,
                        database: editDraft.database,
                        notes: editDraft.notes,
                      })
                    );
                    setEditOpen(false);
                  }}
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={renameOpen} onOpenChange={setRenameOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={overlayStyle} />
          <Dialog.Content style={contentStyle}>
            <Dialog.Title style={{ margin: 0 }}>Rename DB connection</Dialog.Title>
            <Dialog.Description style={{ color: '#666', marginTop: 8 }}>
              Update the display name for this connection.
            </Dialog.Description>
            <Stack mt="md">
              <TextInput
                label="Connection name"
                value={renameValue}
                onChange={(event) => setRenameValue(event.currentTarget.value)}
              />
              <Group justify="end">
                <Dialog.Close asChild>
                  <Button variant="default">Cancel</Button>
                </Dialog.Close>
                <Button
                  onClick={() => {
                    if (!selected || !renameValue.trim()) {
                      return;
                    }
                    dispatch(renameConnection({ id: selected.id, name: renameValue.trim() }));
                    setRenameOpen(false);
                  }}
                >
                  Rename
                </Button>
              </Group>
            </Stack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
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
