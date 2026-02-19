import {
  AppShell,
  Burger,
  Button,
  Divider,
  Group,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation } from '@tanstack/react-router';

import { useAuth } from '../features/auth/AuthContext';

type MenuItem = {
  label: string;
  to: string;
  description: string;
};

const menuItems: MenuItem[] = [
  { label: 'Dashboard', to: '/dashboard', description: 'Overview and KPIs' },
  { label: 'Pipeline', to: '/pipeline', description: 'Track deal stages and progress' },
  { label: 'Connections', to: '/connections', description: 'Integrations and data sources' },
  { label: 'Settings', to: '/settings', description: 'Workspace preferences and controls' },
];

export function AppShellLayout() {
  const [opened, { toggle }] = useDisclosure(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAuthed = Boolean(user);

  return (
    <AppShell
      padding="md"
      header={{ height: 64 }}
      navbar={isAuthed ? { width: 280, breakpoint: 'sm', collapsed: { mobile: !opened } } : undefined}
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <ThemeIcon radius="md" variant="light" color="indigo">
              LP
            </ThemeIcon>
            <Stack gap={0}>
              <Text fw={700}>Launchpad Control Center</Text>
              <Text size="xs" c="dimmed">
                Production starter workspace
              </Text>
            </Stack>
          </Group>
          <Group>
            <Text size="sm" c="dimmed">
              {user ? `Signed in as ${user.name}` : 'Not signed in'}
            </Text>
            {isAuthed ? (
              <Button variant="light" color="red" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Button component={Link} to="/login">
                Login
              </Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {isAuthed ? (
        <AppShell.Navbar p="sm">
          <Stack gap="xs">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                description={item.description}
                active={location.pathname.startsWith(item.to)}
              />
            ))}
          </Stack>

          <Divider my="sm" />

          <Stack gap="xs">
            <UnstyledButton component={Link} to="/" style={{ padding: 4 }}>
              <Text size="sm" fw={500}>
                Back to landing page
              </Text>
              <Text size="xs" c="dimmed">
                Public marketing experience
              </Text>
            </UnstyledButton>
          </Stack>
        </AppShell.Navbar>
      ) : null}

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
