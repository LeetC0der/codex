import { Badge, Button, Card, Container, Group, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { useState } from 'react';

import { runPipeline } from '../features/pipeline/pipelineSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

type PipelineField = {
  id: string;
  name: string;
  type: string;
  required: boolean;
};

const typeOptions = ['string', 'number', 'boolean', 'date', 'json'];

export function PipelineBuilderPage() {
  const { pipelineId } = useParams({ from: '/pipeline/$pipelineId' });
  const dispatch = useAppDispatch();
  const pipeline = useAppSelector((state) => state.pipeline.items.find((item) => item.id === pipelineId));

  const [fields, setFields] = useState<PipelineField[]>([
    { id: crypto.randomUUID(), name: 'source_table', type: 'string', required: true },
    { id: crypto.randomUUID(), name: 'batch_size', type: 'number', required: false },
  ]);

  if (!pipeline) {
    return (
      <Container size="md" py="lg">
        <Text>Pipeline not found.</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="lg">
      <Stack>
        <Group justify="space-between">
          <div>
            <Button component={Link} to="/pipeline" variant="subtle" px={0}>
              ← Back to pipelines
            </Button>
            <Title order={2}>Pipeline Workspace: {pipeline.name}</Title>
            <Text c="dimmed" size="sm">
              Configure runtime fields and start this pipeline when ready.
            </Text>
          </div>
          <Badge variant="light">Status: {pipeline.status}</Badge>
        </Group>

        <Card withBorder>
          <Stack>
            <Group justify="space-between">
              <Text fw={600}>Pipeline input fields</Text>
              <Button
                variant="light"
                onClick={() => {
                  setFields((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), name: '', type: 'string', required: false },
                  ]);
                }}
              >
                Add field
              </Button>
            </Group>

            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Field name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Required</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {fields.map((field) => (
                  <Table.Tr key={field.id}>
                    <Table.Td>
                      <TextInput
                        value={field.name}
                        placeholder="field_name"
                        onChange={(event) => {
                          setFields((prev) =>
                            prev.map((item) =>
                              item.id === field.id ? { ...item, name: event.currentTarget.value } : item
                            )
                          );
                        }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        data={typeOptions}
                        value={field.type}
                        onChange={(value) => {
                          if (!value) return;
                          setFields((prev) =>
                            prev.map((item) => (item.id === field.id ? { ...item, type: value } : item))
                          );
                        }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant={field.required ? 'filled' : 'default'}
                        onClick={() => {
                          setFields((prev) =>
                            prev.map((item) =>
                              item.id === field.id ? { ...item, required: !item.required } : item
                            )
                          );
                        }}
                      >
                        {field.required ? 'Yes' : 'No'}
                      </Button>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={() => setFields((prev) => prev.filter((item) => item.id !== field.id))}
                      >
                        Remove
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Group justify="space-between" mt="sm">
              <Text size="sm" c="dimmed">
                Connection: {pipeline.connectionName} • Schedule: {pipeline.schedule}
              </Text>
              <Button
                loading={pipeline.status === 'Running'}
                onClick={() => dispatch(runPipeline(pipeline.id))}
              >
                Start pipeline
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
