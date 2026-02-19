import {
  Badge,
  Card,
  Container,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { useAuth } from "../features/auth/AuthContext";

const metrics = [
  { label: "Conversion rate", value: "8.2%", progress: 82 },
  { label: "Activated users", value: "1,240", progress: 74 },
  { label: "Weekly MRR", value: "$48,300", progress: 67 },
  { label: "NPS", value: "61", progress: 61 },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <Group justify="space-between" align="end">
          <div>
            <Title order={2}>Welcome, {user?.name}</Title>
            <Text c="dimmed">Here is your real-time operating dashboard.</Text>
          </div>
          <Badge variant="light" size="lg">
            Healthy
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }}>
          {metrics.map((metric) => (
            <Card withBorder radius="md" key={metric.label}>
              <Text size="sm" c="dimmed">
                {metric.label}
              </Text>
              <Text fw={700} size="xl" mt={4}>
                {metric.value}
              </Text>
              <Progress value={metric.progress} mt="sm" color="indigo" />
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
