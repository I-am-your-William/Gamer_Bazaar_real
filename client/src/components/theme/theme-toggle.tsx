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
          className="border-electric/30 hover:bg-electric/10 transition-all duration-300 hover:border-electric/60"
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
        className="border-electric/30"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="hover:bg-electric/10 hover:text-electric cursor-pointer"
        >
          <Sun className="h-4 w-4 mr-2 text-cyber-yellow" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="hover:bg-electric/10 hover:text-electric cursor-pointer"
        >
          <Moon className="h-4 w-4 mr-2 text-electric" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="hover:bg-electric/10 hover:text-electric cursor-pointer"
        >
          <Monitor className="h-4 w-4 mr-2 text-cyber-blue" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}