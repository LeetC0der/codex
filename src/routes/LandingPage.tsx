import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { api } from "../lib/api";

type QuoteResponse = {
  quote: string;
  author: string;
};

type ProductResponse = {
  products: Array<{ id: number; title: string; description: string }>;
};

const modules = [
  "Dashboard",
  "Pipeline",
  "Connections",
  "Settings",
  "Secure Logout",
];

async function fetchQuote() {
  const { data } = await api.get<QuoteResponse>("/quotes/random");
  return data;
}

async function fetchHighlights() {
  const { data } = await api.get<ProductResponse>("/products?limit=3&skip=2");
  return data.products;
}

export function LandingPage() {
  const quote = useQuery({ queryKey: ["quote"], queryFn: fetchQuote });
  const highlights = useQuery({
    queryKey: ["highlights"],
    queryFn: fetchHighlights,
  });

  return (
    <Container size="xl" py="xl">
      <Grid gutter="xl" align="center">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <Badge variant="light" w="fit-content">
              Production-grade home page
            </Badge>
            <Title order={1}>
              Operate your team from one clean, scalable workspace
            </Title>
            <Text c="dimmed">
              This home page ships with standard app modules, protected routes,
              and a modern layout pattern that scales for SaaS operations.
            </Text>

            <List
              spacing="xs"
              icon={
                <ThemeIcon color="indigo" size={20} radius="xl">
                  ✓
                </ThemeIcon>
              }
            >
              {modules.map((item) => (
                <List.Item key={item}>{item}</List.Item>
              ))}
            </List>

            <Group>
              <Button component={Link} to="/dashboard">
                Open Dashboard
              </Button>
              <Button variant="default" component={Link} to="/login">
                Sign in
              </Button>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md">
            <Text fw={600}>Live quote</Text>
            <Text mt="xs" c="dimmed">
              {quote.data
                ? `“${quote.data.quote}” — ${quote.data.author}`
                : "Loading quote..."}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Stack mt="xl" gap="md">
        <Title order={2}>Suggested homepage modules</Title>
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          {highlights.data?.map((item) => (
            <Card key={item.id} withBorder>
              <Text fw={600}>{item.title}</Text>
              <Text size="sm" c="dimmed" mt="xs">
                {item.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
