import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="cyber-glow border-electric/30 bg-dark-gray/50 hover:bg-electric/10 transition-all duration-300"
        >
          {theme === 'light' ? (
            <Sun className="h-4 w-4 text-cyber-yellow transition-all" />
          ) : theme === 'dark' ? (
            <Moon className="h-4 w-4 text-electric transition-all" />
          ) : (
            <Monitor className="h-4 w-4 text-cyber-blue transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-dark-gray border-electric/30 cyber-glow"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="hover:bg-electric/10 text-white hover:text-electric cursor-pointer"
        >
          <Sun className="h-4 w-4 mr-2 text-cyber-yellow" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="hover:bg-electric/10 text-white hover:text-electric cursor-pointer"
        >
          <Moon className="h-4 w-4 mr-2 text-electric" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="hover:bg-electric/10 text-white hover:text-electric cursor-pointer"
        >
          <Monitor className="h-4 w-4 mr-2 text-cyber-blue" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}