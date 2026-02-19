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

import { addPipeline, editPipeline, runPipeline } from '../features/pipeline/pipelineSlice';
import type { PipelineItem, PipelineStatus } from '../features/pipeline/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const statusColorMap: Record<PipelineStatus, string> = {
  Idle: 'gray',
  Running: 'yellow',
  Succeeded: 'green',
  Failed: 'red',
};

type PipelineDraft = {
  name: string;
  connectionId: string;
  schedule: string;
  owner: string;
  description: string;
};

const emptyDraft: PipelineDraft = {
  name: '',
  connectionId: '',
  schedule: '0 * * * *',
  owner: '',
  description: '',
};

export function PipelinePage() {
  const dispatch = useAppDispatch();
  const pipelines = useAppSelector((state) => state.pipeline.items);
  const connections = useAppSelector((state) => state.connections.items);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<PipelineItem | null>(null);
  const [draft, setDraft] = useState<PipelineDraft>(emptyDraft);

  const connectionOptions = useMemo(
    () => connections.map((connection) => ({ value: connection.id, label: connection.name })),
    [connections]
  );

  const runningCount = pipelines.filter((item) => item.status === 'Running').length;
  const successCount = pipelines.filter((item) => item.status === 'Succeeded').length;

  const openAdd = () => {
    setDraft({ ...emptyDraft, connectionId: connections[0]?.id ?? '' });
    setAddOpen(true);
  };

  const openEdit = (pipeline: PipelineItem) => {
    setSelected(pipeline);
    setDraft({
      name: pipeline.name,
      connectionId: pipeline.connectionId,
      schedule: pipeline.schedule,
      owner: pipeline.owner,
      description: pipeline.description,
    });
    setEditOpen(true);
  };

  const saveDraft = (mode: 'add' | 'edit') => {
    if (!draft.name.trim() || !draft.connectionId || !draft.owner.trim()) {
      return;
    }

    const selectedConnection = connections.find((connection) => connection.id === draft.connectionId);
    if (!selectedConnection) {
      return;
    }

    if (mode === 'add') {
      dispatch(
        addPipeline({
          name: draft.name.trim(),
          connectionId: selectedConnection.id,
          connectionName: selectedConnection.name,
          schedule: draft.schedule.trim(),
          owner: draft.owner.trim(),
          description: draft.description.trim(),
        })
      );
      setAddOpen(false);
      return;
    }

    if (!selected) {
      return;
    }

    dispatch(
      editPipeline({
        id: selected.id,
        name: draft.name.trim(),
        connectionId: selectedConnection.id,
        connectionName: selectedConnection.name,
        schedule: draft.schedule.trim(),
        owner: draft.owner.trim(),
        description: draft.description.trim(),
      })
    );
    setEditOpen(false);
  };

  return (
    <Container size="xl" py="lg">
      <Stack>
        <Group justify="space-between">
          <div>
            <Title order={2}>Pipeline Control</Title>
            <Text size="sm" c="dimmed">
              Add, run, and manage data pipelines mapped to your DB connections.
            </Text>
          </div>
          <Button onClick={openAdd}>Add pipeline</Button>
        </Group>

        <Group>
          <Badge variant="light" color="yellow">
            Running: {runningCount}
          </Badge>
          <Badge variant="light" color="green">
            Succeeded: {successCount}
          </Badge>
          <Badge variant="light">Total: {pipelines.length}</Badge>
        </Group>

        <Card withBorder>
          <Table.ScrollContainer minWidth={980}>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Pipeline</Table.Th>
                  <Table.Th>Connection</Table.Th>
                  <Table.Th>Schedule</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Last run</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pipelines.map((pipeline) => (
                  <Table.Tr key={pipeline.id}>
                    <Table.Td>
                      <Text fw={600}>{pipeline.name}</Text>
                      <Text size="xs" c="dimmed">
                        {pipeline.description || 'No description provided.'}
                      </Text>
                    </Table.Td>
                    <Table.Td>{pipeline.connectionName}</Table.Td>
                    <Table.Td>{pipeline.schedule}</Table.Td>
                    <Table.Td>
                      <Badge color={statusColorMap[pipeline.status]}>{pipeline.status}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{pipeline.lastRunAt ? new Date(pipeline.lastRunAt).toLocaleString() : 'Never'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group justify="end">
                        <Button
                          size="xs"
                          variant="light"
                          loading={pipeline.status === 'Running'}
                          onClick={() => dispatch(runPipeline(pipeline.id))}
                        >
                          Run pipeline
                        </Button>
                        <Button size="xs" variant="default" onClick={() => openEdit(pipeline)}>
                          Edit
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      </Stack>

      <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={overlayStyle} />
          <Dialog.Content style={contentStyle}>
            <Dialog.Title style={{ margin: 0 }}>Add pipeline</Dialog.Title>
            <Dialog.Description style={{ color: '#666', marginTop: 8 }}>
              Configure required pipeline fields and choose an existing DB connection.
            </Dialog.Description>
            <PipelineForm draft={draft} setDraft={setDraft} connectionOptions={connectionOptions} />
            <Group justify="end" mt="md">
              <Dialog.Close asChild>
                <Button variant="default">Cancel</Button>
              </Dialog.Close>
              <Button onClick={() => saveDraft('add')}>Create pipeline</Button>
            </Group>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={overlayStyle} />
          <Dialog.Content style={contentStyle}>
            <Dialog.Title style={{ margin: 0 }}>Edit pipeline</Dialog.Title>
            <Dialog.Description style={{ color: '#666', marginTop: 8 }}>
              Update configuration, connection mapping, and ownership details.
            </Dialog.Description>
            <PipelineForm draft={draft} setDraft={setDraft} connectionOptions={connectionOptions} />
            <Group justify="end" mt="md">
              <Dialog.Close asChild>
                <Button variant="default">Cancel</Button>
              </Dialog.Close>
              <Button onClick={() => saveDraft('edit')}>Save</Button>
            </Group>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
}

type PipelineFormProps = {
  draft: PipelineDraft;
  setDraft: Dispatch<SetStateAction<PipelineDraft>>;
  connectionOptions: Array<{ value: string; label: string }>;
};

function PipelineForm({ draft, setDraft, connectionOptions }: PipelineFormProps) {
  return (
    <Stack mt="md">
      <TextInput
        label="Pipeline name *"
        value={draft.name}
        onChange={(event) => setDraft((prev) => ({ ...prev, name: event.currentTarget.value }))}
      />
      <Select
        label="DB connection *"
        data={connectionOptions}
        value={draft.connectionId}
        withinPortal={false}
        comboboxProps={{ withinPortal: false, zIndex: 1000 }}
        onChange={(value) => setDraft((prev) => ({ ...prev, connectionId: value ?? '' }))}
      />
      <TextInput
        label="Owner *"
        value={draft.owner}
        onChange={(event) => setDraft((prev) => ({ ...prev, owner: event.currentTarget.value }))}
      />
      <TextInput
        label="Schedule (cron)"
        value={draft.schedule}
        onChange={(event) => setDraft((prev) => ({ ...prev, schedule: event.currentTarget.value }))}
      />
      <TextInput
        label="Description"
        value={draft.description}
        onChange={(event) => setDraft((prev) => ({ ...prev, description: event.currentTarget.value }))}
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
  width: 'min(92vw, 560px)',
  padding: 20,
};
