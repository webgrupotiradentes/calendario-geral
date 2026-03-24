import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Menu, X, LogIn, LogOut, Sun, Moon, LayoutGrid, Key, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erro ao sair');
      return;
    }
    toast.success('Sessão encerrada');
    navigate('/');
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-4 transition-opacity hover:opacity-90 active:scale-95 duration-200">
            <div className="flex items-center gap-2 sm:gap-4 h-6 sm:h-9">
              <img
                src="https://hs.unit.br/hs-fs/hubfs/marca-fits-branca.png"
                alt="FITS"
                className="h-full w-auto object-contain"
                style={{ filter: 'var(--logo-filter)' }}
              />
              <div className="w-px h-6 bg-border/60" />
              <img
                src="https://hs.unit.br/hs-fs/hubfs/unit-pe-marca-w.png"
                alt="UNIT PE"
                className="h-full w-auto object-contain"
                style={{ filter: 'var(--logo-filter)' }}
              />
              <div className="w-px h-6 bg-border/60" />
              <img
                src="https://hs.unit.br/hs-fs/hubfs/a-web-mkt/MARCA_UNIT.png"
                alt="UNIT"
                className="h-full w-auto object-contain"
                style={{ filter: 'var(--logo-filter)' }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  isActive('/') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
                )}
              >
                Calendário
              </Button>
            </Link>

            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                    isActive('/admin') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
                  )}
                >
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Painel Admin
                </Button>
              </Link>
            )}

            <div className="w-px h-6 bg-border/60 mx-2" />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full transition-colors hover:bg-muted"
            >
              {theme === 'dark' ? (
                <Sun className="w-[1.2rem] h-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              ) : (
                <Moon className="w-[1.2rem] h-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              )}
              <span className="sr-only">Alternar tema</span>
            </Button>

            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border/20 p-0 hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 glass-card p-2">
                  <div className="flex items-center gap-3 px-2 py-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-bold truncate leading-none">{user.email?.split('@')[0]}</p>
                      <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="opacity-40" />
                  <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} className="rounded-lg gap-2 cursor-pointer focus:bg-primary focus:text-primary-foreground">
                    <Key className="w-4 h-4" />
                    <span>Alterar Senha</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="opacity-40" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg gap-2 text-destructive cursor-pointer hover:bg-destructive focus:bg-destructive focus:text-destructive-foreground">
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 h-10">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9 rounded-full">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full border border-border/20">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card p-2">
                  <div className="px-2 py-2">
                    <p className="text-sm font-bold truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="opacity-40" />
                  <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} className="rounded-lg gap-2 cursor-pointer">
                    <Key className="w-4 h-4 text-primary" />
                    Alterar Senha
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="opacity-40" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg text-destructive gap-2 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full border border-border/20">
                  <LogIn className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-6 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 rounded-2xl px-4 font-bold transition-all",
                  isActive('/') ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted"
                )}
              >
                <LayoutGrid className="w-5 h-5 mr-3" />
                Calendário Geral
              </Button>
            </Link>

            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-12 rounded-2xl px-4 font-bold transition-all",
                    isActive('/admin') ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted"
                  )}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Administração
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
      />
    </header>
  );
}
