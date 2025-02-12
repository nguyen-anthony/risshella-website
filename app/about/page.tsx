// app/about.tsx
import * as React from 'react';
import Navigation from '@/components/Navigation';
import styles from '../page.module.css';

export default function About() {
  return (
    <div>
      <Navigation />
      <main className={styles.main}>
        <h1>About Me</h1>
        <p>
          This is the About Me page content.
        </p>
        {/* Add more content about yourself here */}
      </main>
      <footer className={styles.footer}>
        {/* Footer content */}
      </footer>
    </div>
  );
}