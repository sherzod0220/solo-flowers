import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title: string;
  description?: string;
}

/** Har bir sahifa uchun `<title>`/`<meta description>`ni o'rnatadi — SEO va ijtimoiy tarmoq'dagi havola ko'rinishi uchun. */
export function PageMeta({ title, description }: PageMetaProps) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}
