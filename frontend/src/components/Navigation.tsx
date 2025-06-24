'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Transactions', href: '/transactions', icon: '💳' },
  { name: 'Add Transaction', href: '/transactions/new', icon: '➕' },
  { name: 'Members', href: '/members', icon: '👥' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="nav-container">
      <div className="nav-content">
        {/* Logo */}
        <div className="logo">💰 PesaFlow</div>

        {/* Navigation */}
        <nav>
          <ul className="nav-links">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}