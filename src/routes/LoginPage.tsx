import { Alert, Button, Card, Container, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { useAuth } from '../features/auth/AuthContext';
import { loginSchema, type LoginValues } from '../lib/validators';

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const parsed = loginSchema.safeParse(values);
      if (parsed.success) {
        return {};
      }

      const errors: Partial<Record<keyof LoginValues, string>> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginValues;
        errors[field] = err.message;
      });
      return errors;
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => auth.login(values),
    onSuccess: () => navigate({ to: '/dashboard' }),
  });

  return (
    <Container size={420} py="xl">
      <Card withBorder radius="md" p="xl">
        <Stack>
          <Title order={2}>Welcome back</Title>
          {loginMutation.isError ? <Alert color="red">Unable to sign you in right now.</Alert> : null}
          <form
            onSubmit={form.onSubmit((values) => {
              loginMutation.mutate(values);
            })}
          >
            <Stack>
              <TextInput label="Email" placeholder="you@company.com" {...form.getInputProps('email')} />
              <PasswordInput label="Password" placeholder="••••••••" {...form.getInputProps('password')} />
              <Button type="submit" loading={loginMutation.isPending}>
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Container>
  );
}
