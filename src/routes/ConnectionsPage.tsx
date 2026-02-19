import { Badge, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';

const connections = [
  { name: 'Salesforce', status: 'Connected', health: 'Operational' },
  { name: 'HubSpot', status: 'Syncing', health: 'Delayed' },
  { name: 'Stripe', status: 'Connected', health: 'Operational' },
];

export function ConnectionsPage() {
  return (
    <Container size="xl" py="lg">
      <Stack>
        <Group justify="space-between">
          <Title order={2}>Connections</Title>
          <Button variant="light">Add connection</Button>
        </Group>
        {connections.map((item) => (
          <Card withBorder key={item.name}>
            <Group justify="space-between">
              <div>
                <Text fw={600}>{item.name}</Text>
                <Text size="sm" c="dimmed">
                  Health: {item.health}
                </Text>
              </div>
              <Badge color={item.status === 'Connected' ? 'green' : 'yellow'}>{item.status}</Badge>
            </Group>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
