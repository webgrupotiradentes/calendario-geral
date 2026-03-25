import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  schemaMarkup?: object;
}

export const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonical,
  schemaMarkup
}: SEOProps) => {
  const location = useLocation();
  const siteName = 'Universidade Tiradentes';
  const fullTitle = `${title} | ${siteName}`;
  const currentUrl = `https://calendario.unit.br${location.pathname}`;

  useEffect(() => {
    // Update Document Title
    document.title = fullTitle;

    // Update Meta Tags
    const updateMetaTag = (name: string, content: string, attr: string = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    if (description) updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    
    // Open Graph
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', description || '', 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    if (ogImage) updateMetaTag('og:image', ogImage, 'property');

    // Twitter
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description || '');
    if (ogImage) updateMetaTag('twitter:image', ogImage);

    // Canonical Link
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical || currentUrl);

    // Schema Markup
    if (schemaMarkup) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaMarkup);
    }

    return () => {
      // Clean up schema if needed (optional)
    };
  }, [fullTitle, description, keywords, ogImage, ogType, currentUrl, canonical, schemaMarkup]);

  return null;
};
