import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { App, Button, Card, Input } from 'antd';
import { useLogin } from '@/features/auth/hooks';
import { FormField } from '@/shared/ui/FormField';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';
import { useLangStore } from '@/shared/store/langStore';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { mutateAsync, isPending } = useLogin();
  const t = useT();
  const lang = useLangStore((state) => state.lang);

  const loginSchema = z.object({
    email: z.string().min(1, t('auth.email_required')).email(t('auth.email_invalid')),
    password: z.string().min(1, t('auth.password_required')),
  });

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Til o'zgarganda, ilgari ko'rsatilgan validatsiya xabarlarini ham yangi tilda qayta hisoblaymiz.
  useEffect(() => {
    if (isSubmitted) {
      void trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      notification.success({
        title: t('auth.login_success_title'),
        description: t('auth.login_success_desc'),
        placement: 'top',
      });
      navigate(ROUTES.HOME);
    } catch (error) {
      notification.error({
        title: t('auth.login_error_title'),
        description: error instanceof Error ? error.message : t('common.unknown_error'),
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
        title={<span style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{t('auth.login_title')}</span>}
        style={{ width: 380, borderRadius: 16, boxShadow: '0 12px 32px rgba(92, 26, 48, 0.12)' }}
      >
        <form onSubmit={onSubmit}>
          <FormField label={t('auth.email')} error={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} status={errors.email ? 'error' : ''} placeholder="user@example.com" />
              )}
            />
          </FormField>

          <FormField label={t('auth.password')} error={errors.password?.message}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => <Input.Password {...field} status={errors.password ? 'error' : ''} />}
            />
          </FormField>

          <Button type="primary" htmlType="submit" block loading={isPending} style={{ marginTop: 8 }}>
            {t('auth.login_button')}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {t('auth.no_account')} <Link to={ROUTES.REGISTER}>{t('nav.register')}</Link>
        </div>
      </Card>
    </div>
  );
}
