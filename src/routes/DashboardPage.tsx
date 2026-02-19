import { Card, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';

import { useAuth } from '../features/auth/AuthContext';

const metrics = [
  { label: 'Conversion rate', value: '8.2%' },
  { label: 'Activated users', value: '1,240' },
  { label: 'Weekly MRR', value: '$48,300' },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Container size="lg" py="xl">
      <Stack>
        <Title order={2}>Hello {user?.name}, your launch metrics are healthy.</Title>
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          {metrics.map((metric) => (
            <Card withBorder key={metric.label}>
              <Text size="sm" c="dimmed">
                {metric.label}
              </Text>
              <Group>
                <Text fw={700} size="xl">
                  {metric.value}
                </Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
