import { Helmet } from 'react-helmet-async';

export default function SEOHead({ 
  title = "DeSpy AI - AI-Powered Blockchain Security & Analysis",
  description = "Protect your assets with AI-powered blockchain analysis, smart contract scanning, and real-time security monitoring.",
  image = "https://despy.ai/og-image.png",
  url = "https://despy.ai"
}) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0B0F17" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
} 