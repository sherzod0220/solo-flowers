import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Card, Input } from 'antd';
import { useLogin } from '@/features/auth/hooks';
import { FormField } from '@/shared/ui/FormField';
import { ROUTES } from '@/shared/constants/routes';

const loginSchema = z.object({
  email: z.string().min(1, 'Email kiritilishi shart').email("Email formati noto'g'ri"),
  password: z.string().min(1, 'Parol kiritilishi shart'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await mutateAsync(values);
      navigate(ROUTES.HOME);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Kirishda xatolik yuz berdi');
    }
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}>
      <Card title="Tizimga kirish" style={{ width: 360 }}>
        <form onSubmit={onSubmit}>
          {serverError && <Alert type="error" message={serverError} style={{ marginBottom: 16 }} showIcon />}

          <FormField label="Email" error={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} status={errors.email ? 'error' : ''} placeholder="user@example.com" />
              )}
            />
          </FormField>

          <FormField label="Parol" error={errors.password?.message}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => <Input.Password {...field} status={errors.password ? 'error' : ''} />}
            />
          </FormField>

          <Button type="primary" htmlType="submit" block loading={isPending} style={{ marginTop: 8 }}>
            Kirish
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Hisobingiz yo'qmi? <Link to={ROUTES.REGISTER}>Ro'yxatdan o'tish</Link>
        </div>
      </Card>
    </div>
  );
}
