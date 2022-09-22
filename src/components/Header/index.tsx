import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div>
        <Link href="/">
          <img src="/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
}
