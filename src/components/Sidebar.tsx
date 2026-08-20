import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Lightbulb } from 'lucide-react'
import advantechLogo from '../assets/advantech-logo.png'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/cases', label: 'Cases', icon: FolderKanban, end: false },
  { to: '/improvements', label: 'Improvements', icon: Lightbulb, end: false },
]

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <img src={advantechLogo} alt="Advantech" className={styles.logo} />
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <p>Hermes Feedback Intelligence</p>
        <p className={styles.footerSub}>POC</p>
      </div>
    </aside>
  )
}
