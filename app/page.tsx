import styles from "./page.module.css";
import * as React from 'react';
import Navigation from '../components/Navigation';


export default function Home() {
  return (
    <div>
      <Navigation/>
      <main className={styles.main}>
        <h1>Under Construction</h1>
        <p>
          Check back soon for more content.
        </p>
      </main>
      <footer className={styles.footer}>
        
      </footer>
    </div>
  );
}
