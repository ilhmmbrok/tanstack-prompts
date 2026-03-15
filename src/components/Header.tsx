import type React from 'react'
// import ThemeToggle from './ThemeToggle'

export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between">
      {children}
      {/* <ThemeToggle /> */}
    </header>
  )
}
