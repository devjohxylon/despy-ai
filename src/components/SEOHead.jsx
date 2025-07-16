import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = "DeSpy AI | Next-Generation Blockchain Analytics & Security Platform",
  description = "Revolutionary AI-powered blockchain analytics platform. Advanced transaction monitoring, smart contract auditing, and DeFi security tools. Join the waitlist for early access.",
  keywords = "blockchain analytics, DeFi security, smart contract audit, crypto analytics, Web3 intelligence, blockchain monitoring, cryptocurrency analysis, DeSpy AI",
  image = "https://despy-ai.vercel.app/og-image.jpg",
  url = "https://despy-ai.vercel.app/",
  type = "website",
  noindex = false
}) => {
  const baseUrl = "https://despy-ai.vercel.app";
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="DeSpy AI" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@DespyAI" />
      <meta property="twitter:site" content="@DespyAI" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="format-detection" content="telephone=no" />
    </Helmet>
  );
};

export default SEOHead; 