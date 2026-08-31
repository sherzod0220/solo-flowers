import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Card, Input, message } from 'antd';
import { useRegister } from '@/features/auth/hooks';
import { FormField } from '@/shared/ui/FormField';
import { ROUTES } from '@/shared/constants/routes';

const registerSchema = z.object({
  email: z.string().min(1, 'Email kiritilishi shart').email("Email formati noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useRegister();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await mutateAsync(values);
      message.success("Muvaffaqiyatli ro'yxatdan o'tdingiz. Endi tizimga kiring.");
      navigate(ROUTES.LOGIN);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Ro'yxatdan o'tishda xatolik yuz berdi");
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
        title={<span style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Ro'yxatdan o'tish</span>}
        style={{ width: 380, borderRadius: 16, boxShadow: '0 12px 32px rgba(92, 26, 48, 0.12)' }}
      >
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
            Ro'yxatdan o'tish
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Hisobingiz bormi? <Link to={ROUTES.LOGIN}>Kirish</Link>
        </div>
      </Card>
    </div>
  );
}
