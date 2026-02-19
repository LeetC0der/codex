import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { Provider } from "react-redux";

import "@mantine/core/styles.css";
import { AuthProvider } from "./features/auth/AuthContext";
import { router } from "./routes/router";
import { store } from "./store/store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider defaultColorScheme="light">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </MantineProvider>
    </Provider>
  </React.StrictMode>,
);
