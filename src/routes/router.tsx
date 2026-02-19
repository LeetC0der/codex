import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { AppShellLayout } from '../components/AppShellLayout';
import { DashboardPage } from './DashboardPage';
import { LandingPage } from './LandingPage';
import { LoginPage } from './LoginPage';
import { authService } from '../features/auth/authService';

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

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: () => {
    if (!authService.getSession()) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, dashboardRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
