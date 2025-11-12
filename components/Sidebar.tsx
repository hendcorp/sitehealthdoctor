'use client'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: 'summary', label: 'Summary', icon: '📊' },
  { id: 'wordpress', label: 'WordPress', icon: '📝' },
  { id: 'server', label: 'Server', icon: '🖥️' },
  { id: 'theme', label: 'Theme', icon: '🎨' },
  { id: 'plugins', label: 'Plugins', icon: '🔌' },
  { id: 'database', label: 'Database', icon: '💾' },
  { id: 'raw', label: 'Raw', icon: '📄' },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeSection === item.id
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

