import styles from './header.module.scss'

export default function Header() {
  return (
  <header className={styles.headerContainer}>
    <div className={styles.logoContainer}>
      <img className={styles.logo} src="/images/Logo.svg" alt="logo" />
    </div>
  </header>
  )
}
