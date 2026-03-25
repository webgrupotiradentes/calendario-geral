import { ExternalLink, Mail, Phone, Globe } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-20 border-t border-border/40 bg-card/20 backdrop-blur-md">
      <div className="mx-auto px-4 sm:px-10 lg:px-16 w-full max-w-[1700px] py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand/About */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tighter text-foreground">
                Calendário<span className="text-primary italic">Geral</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma oficial de acompanhamento do calendário acadêmico e institucional. Facilitando o acesso à informação para toda a comunidade acadêmica.
            </p>
          </div>

          {/* Institutional Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Institucional</h4>
            <nav className="flex flex-col gap-3">
              <a href="https://www.unit.br" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                Universidade Tiradentes <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://hs.unit.br/fits" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                FITS <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://www.unit.br/pe" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                UNIT PE <ExternalLink className="w-3 h-3" />
              </a>
            </nav>
          </div>

          {/* Quick Support */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Suporte</h4>
            <nav className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" /> 0800 729 2100
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" /> suporte@unit.br
              </span>
            </nav>
          </div>

          {/* Legal / Accessibility */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Legal</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>© {currentYear} Grupo Tiradentes.</p>
              <p>Todos os direitos reservados.</p>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
