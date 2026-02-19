import { Badge, Button, Card, Container, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { api } from '../lib/api';

type QuoteResponse = {
  quote: string;
  author: string;
};

type ProductResponse = {
  products: Array<{ id: number; title: string; description: string }>;
};

async function fetchQuote() {
  const { data } = await api.get<QuoteResponse>('/quotes/random');
  return data;
}

async function fetchHighlights() {
  const { data } = await api.get<ProductResponse>('/products?limit=3&skip=2');
  return data.products;
}

export function LandingPage() {
  const quote = useQuery({ queryKey: ['quote'], queryFn: fetchQuote });
  const highlights = useQuery({ queryKey: ['highlights'], queryFn: fetchHighlights });

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Stack gap="xs" ta="center" py="xl">
          <Badge variant="light" size="lg" w="fit-content" mx="auto">
            Production-ready starter
          </Badge>
          <Title order={1}>Dynamic React + Mantine + TanStack launchpad</Title>
          <Text c="dimmed" maw={680} mx="auto">
            Ship a polished customer landing page with instant data hydration, safe auth boundaries,
            and scalable routing.
          </Text>
          <Group justify="center" mt="sm">
            <Button component={Link} to="/login">
              Get started
            </Button>
            <Button component="a" variant="default" href="#features">
              View features
            </Button>
          </Group>
        </Stack>

        <Card withBorder radius="md" p="lg">
          <Text fw={600}>Live motivation</Text>
          <Text c="dimmed" mt="xs">
            {quote.data ? `“${quote.data.quote}” — ${quote.data.author}` : 'Loading quote...'}
          </Text>
        </Card>

        <Stack id="features" gap="md">
          <Title order={2}>What you can launch today</Title>
          <Grid>
            {highlights.data?.map((item) => (
              <Grid.Col span={{ base: 12, md: 4 }} key={item.id}>
                <Card withBorder radius="md" h="100%">
                  <Text fw={600}>{item.title}</Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    {item.description}
                  </Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </Container>
  );
}
