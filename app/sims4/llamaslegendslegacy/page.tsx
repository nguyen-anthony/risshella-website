// app/about.tsx
import * as React from 'react';
import Navigation from '@/components/Navigation';
import IFrameBox from '@/components/IFrameBox'
import styles from '@/app/page.module.css';

export default function LlamaLegends() {
  return (
    <div>
      <Navigation />
      <main className={styles.main}>
        <h1>Llamas & Legends Challenge</h1>
        <IFrameBox 
          url="https://docs.google.com/document/d/1b6LjunHIkPj8oSAXLj3T2h4OTdaHHrvLNXvMSxsvcYQ/pub?embedded=true" 
        />

      </main>
      <footer className={styles.footer}>
        {/* Footer content */}
      </footer>
    </div>
  );
}