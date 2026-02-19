import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { AppShellLayout } from '../components/AppShellLayout';
import { authService } from '../features/auth/authService';
import { ConnectionsPage } from './ConnectionsPage';
import { DashboardPage } from './DashboardPage';
import { LandingPage } from './LandingPage';
import { LoginPage } from './LoginPage';
import { PipelinePage } from './PipelinePage';
import { SettingsPage } from './SettingsPage';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <AppShellLayout />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    if (authService.getSession()) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: LoginPage,
});

const authedGuard = () => {
  if (!authService.getSession()) {
    throw redirect({ to: '/login' });
  }
};

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: authedGuard,
  component: DashboardPage,
});

const pipelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pipeline',
  beforeLoad: authedGuard,
  component: PipelinePage,
});

const connectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/connections',
  beforeLoad: authedGuard,
  component: ConnectionsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: authedGuard,
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  pipelineRoute,
  connectionsRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
