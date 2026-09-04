import { Link } from 'react-router-dom';
import { Button, Result } from 'antd';
import { ROUTES } from '@/shared/constants/routes';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';

export function ForbiddenPage() {
  const t = useT();

  return (
    <div>
      <PageMeta title={`${t('forbidden.title')} — Solo`} />

      <Result
        status="403"
        title={t('forbidden.title')}
        subTitle={t('forbidden.description')}
        extra={
          <Link to={ROUTES.HOME}>
            <Button type="primary">{t('common.back_to_home')}</Button>
          </Link>
        }
      />
    </div>
  );
}
