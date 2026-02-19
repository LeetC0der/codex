import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  MultiSelect,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import type { DbConnection } from '../features/connections/types';
import { runPipeline } from '../features/pipeline/pipelineSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

type PipelineField = {
  id: string;
  name: string;
  type: string;
  required: boolean;
};

const typeOptions = ['string', 'number', 'boolean', 'date', 'json'];

const tableCatalogByEngine: Record<DbConnection['engine'], Record<string, string[]>> = {
  PostgreSQL: {
    users: ['id', 'email', 'full_name', 'created_at', 'is_active'],
    orders: ['id', 'user_id', 'total_amount', 'status', 'created_at'],
    events: ['id', 'event_name', 'payload', 'occurred_at'],
  },
  MySQL: {
    customers: ['id', 'name', 'segment', 'country', 'created_at'],
    invoices: ['id', 'customer_id', 'amount', 'currency', 'issued_at'],
    products: ['id', 'sku', 'title', 'price', 'updated_at'],
  },
  MariaDB: {
    accounts: ['id', 'account_name', 'owner', 'status', 'updated_at'],
    transactions: ['id', 'account_id', 'amount', 'channel', 'created_at'],
  },
  'SQL Server': {
    employees: ['id', 'department_id', 'name', 'email', 'hired_at'],
    payroll: ['id', 'employee_id', 'gross_pay', 'net_pay', 'period_end'],
  },
  Oracle: {
    ledger_entries: ['id', 'ledger_code', 'debit', 'credit', 'posted_at'],
    reconciliation_runs: ['id', 'run_key', 'status', 'started_at', 'finished_at'],
  },
  SQLite: {
    app_logs: ['id', 'level', 'message', 'created_at'],
    cache_keys: ['id', 'cache_key', 'value_hash', 'updated_at'],
  },
  CockroachDB: {
    tenants: ['id', 'tenant_name', 'region', 'plan', 'created_at'],
    billing: ['id', 'tenant_id', 'amount', 'period', 'status'],
  },
};

export function PipelineBuilderPage() {
  const { pipelineId } = useParams({ from: '/pipeline/$pipelineId' });
  const dispatch = useAppDispatch();
  const pipeline = useAppSelector((state) => state.pipeline.items.find((item) => item.id === pipelineId));
  const connection = useAppSelector((state) =>
    state.connections.items.find((item) => item.id === pipeline?.connectionId)
  );

  const [fields, setFields] = useState<PipelineField[]>([
    { id: crypto.randomUUID(), name: 'source_table', type: 'string', required: true },
    { id: crypto.randomUUID(), name: 'batch_size', type: 'number', required: false },
  ]);

  const tableCatalog = useMemo(() => {
    if (!connection) {
      return {};
    }
    return tableCatalogByEngine[connection.engine] ?? {};
  }, [connection]);

  const tableOptions = useMemo(
    () => Object.keys(tableCatalog).map((tableName) => ({ value: tableName, label: tableName })),
    [tableCatalog]
  );

  const [selectedTable, setSelectedTable] = useState<string | null>(tableOptions[0]?.value ?? null);
  const [selectedColumnsByTable, setSelectedColumnsByTable] = useState<Record<string, string[]>>({});

  const activeTableColumns = selectedTable ? tableCatalog[selectedTable] ?? [] : [];

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
            <Text fw={600}>Source table and column mapping</Text>
            <Text size="sm" c="dimmed">
              Tables/columns are loaded from the connected DB profile: {pipeline.connectionName}.
            </Text>

            <Select
              label="Select source table"
              data={tableOptions}
              value={selectedTable}
              placeholder="Pick a table"
              onChange={(value) => setSelectedTable(value)}
            />

            <MultiSelect
              label="Select columns to include"
              data={activeTableColumns}
              value={selectedTable ? (selectedColumnsByTable[selectedTable] ?? []) : []}
              placeholder="Choose one or more columns"
              searchable
              onChange={(value) => {
                if (!selectedTable) {
                  return;
                }
                setSelectedColumnsByTable((prev) => ({ ...prev, [selectedTable]: value }));
              }}
            />

            <Text size="sm" c="dimmed">
              Selected columns: {selectedTable ? (selectedColumnsByTable[selectedTable]?.join(', ') || 'none') : 'none'}
            </Text>
          </Stack>
        </Card>

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
