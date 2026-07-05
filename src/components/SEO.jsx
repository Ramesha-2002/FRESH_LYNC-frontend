import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description }) {
  const defaultTitle = 'Freshlync - Smart Distribution, Fresh Connection';
  const defaultDescription = 'Optimizing the journey from farm to table with real-time data and sustainable logistics management.';

  return (
    <Helmet>
      <title>{title ? `${title} | Freshlync` : defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
    </Helmet>
  );
}
