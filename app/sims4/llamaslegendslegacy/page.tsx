// app/about.tsx
'use client'
import * as React from 'react';
import Navigation from '@/components/Navigation';
import styles from '@/app/page.module.css';
import { useEffect, useState } from 'react';

export default function LlamaLegends() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocContent() {
      try {
        const response = await fetch(
          'https://docs.google.com/document/d/1b6LjunHIkPj8oSAXLj3T2h4OTdaHHrvLNXvMSxsvcYQ/export?format=html'
        );

        if (!response.ok) {
          console.error('Failed to fetch document:', response);
          throw new Error('Failed to fetch document');
        }

        const html = await response.text();
        // Remove any fixed width styles from Google Docs
        const cleanedHtml = html.replace(/style="[^"]*width:[^"]*"/g, '')
                              .replace(/width="[^"]*"/g, '')
                              .replace(/style="[^"]*margin-left:[^"]*"/g, '')
                              .replace(/style="[^"]*margin-right:[^"]*"/g, '');
        
        setContent(cleanedHtml);
        setError(null);
      } catch (err) {
        setError('Failed to load document content');
        console.error('Error fetching document:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDocContent();
  }, []); // Only run once on mount

  return (
    <div className={styles.page}>
      <Navigation />
      <main className={styles.main}>
        <p>Please use the <a href="https://docs.google.com/document/d/1b6LjunHIkPj8oSAXLj3T2h4OTdaHHrvLNXvMSxsvcYQ" target="_blank" rel="noopener noreferrer">Google Doc</a> for the best experience. Formatting on this page is still a work in progress.</p> 
        
        {loading && <div>Loading...</div>}
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        )}
        
        <div 
          className={styles.docContent}
          // Safely render the HTML content
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>
      <footer className={styles.footer}>
        {/* Footer content */}
      </footer>
    </div>
  );
}