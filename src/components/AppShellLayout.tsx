import { AppShell, Button, Group, Text } from '@mantine/core';
import { Link, Outlet } from '@tanstack/react-router';

import { useAuth } from '../features/auth/AuthContext';

export function AppShellLayout() {
  const { user, logout } = useAuth();

  return (
    <AppShell padding="md" header={{ height: 64 }}>
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Group>
            <Text fw={700}>Launchpad</Text>
            <Link to="/">Home</Link>
            {user ? <Link to="/dashboard">Dashboard</Link> : <Link to="/login">Login</Link>}
          </Group>
          {user ? (
            <Group>
              <Text size="sm" c="dimmed">
                Signed in as {user.name}
              </Text>
              <Button variant="light" onClick={logout}>
                Logout
              </Button>
            </Group>
          ) : null}
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
