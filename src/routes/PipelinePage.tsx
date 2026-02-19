import { Badge, Card, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';

const stages = [
  { name: 'Qualified', count: 14, amount: '$33k' },
  { name: 'Proposal', count: 9, amount: '$21k' },
  { name: 'Negotiation', count: 5, amount: '$12k' },
  { name: 'Closed Won', count: 11, amount: '$42k' },
];

export function PipelinePage() {
  return (
    <Container size="xl" py="lg">
      <Stack>
        <Group justify="space-between">
          <Title order={2}>Pipeline</Title>
          <Badge variant="light" color="grape">
            Updated 2m ago
          </Badge>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {stages.map((stage) => (
            <Card key={stage.name} withBorder>
              <Text size="sm" c="dimmed">
                {stage.name}
              </Text>
              <Text fw={700} size="xl" mt={4}>
                {stage.count}
              </Text>
              <Text size="sm">{stage.amount}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
