'use client'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: 'summary', label: 'Health Summary', icon: '📊' },
  { id: 'wordpress', label: 'WordPress Environment', icon: '📝' },
  { id: 'server', label: 'Server Environment', icon: '🖥️' },
  { id: 'theme', label: 'Active Theme', icon: '🎨' },
  { id: 'plugins', label: 'Active Plugins', icon: '🔌' },
  { id: 'database', label: 'Database', icon: '💾' },
  { id: 'raw', label: 'Raw Site Health', icon: '📄' },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-accent text-white dark:bg-accent-dark'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

