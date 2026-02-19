import { Button, Card, Container, Group, Stack, Switch, Text, TextInput, Title } from '@mantine/core';

export function SettingsPage() {
  return (
    <Container size="md" py="lg">
      <Stack>
        <Title order={2}>Settings</Title>
        <Card withBorder>
          <Stack>
            <TextInput label="Workspace name" defaultValue="Launchpad Inc" />
            <Switch label="Enable deployment alerts" defaultChecked />
            <Switch label="Daily summary email" defaultChecked />
            <Group justify="end">
              <Button>Save changes</Button>
            </Group>
          </Stack>
        </Card>
        <Text size="sm" c="dimmed">
          Tip: keep settings minimal and observable for a production-grade workflow.
        </Text>
      </Stack>
    </Container>
  );
}
