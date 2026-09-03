import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { App, Button, Card, Input } from 'antd';
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
  const { notification } = App.useApp();
  const { mutateAsync, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      notification.success({
        title: 'Muvaffaqiyatli kirdingiz',
        description: 'Tizimga muvaffaqiyatli kirdingiz.',
        placement: 'top',
      });
      navigate(ROUTES.HOME);
    } catch (error) {
      notification.error({
        title: 'Kirishda xatolik yuz berdi',
        description: error instanceof Error ? error.message : "Noma'lum xatolik yuz berdi",
        placement: 'top',
      });
    }
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 220px)',
        background: 'var(--color-primary-light)',
        borderRadius: 24,
        padding: '56px 16px',
      }}
    >
      <img src="/logo-S.PNG" alt="Solo" style={{ height: 64, width: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }} />

      <Card
        title={<span style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Tizimga kirish</span>}
        style={{ width: 380, borderRadius: 16, boxShadow: '0 12px 32px rgba(92, 26, 48, 0.12)' }}
      >
        <form onSubmit={onSubmit}>
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
