import { ReactNode } from 'react';
import { Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-primary relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-primary-foreground">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-8 mx-auto">
              <Stethoscope className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">MedApp</h1>
            <p className="text-xl text-primary-foreground/80">
              System zarządzania placówką medyczną
            </p>
            <div className="mt-12 grid grid-cols-2 gap-6 text-sm text-primary-foreground/70">
              <div className="p-4 rounded-lg bg-primary-foreground/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-primary-foreground">24/7</div>
                <div>Dostęp online</div>
              </div>
              <div className="p-4 rounded-lg bg-primary-foreground/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-primary-foreground">100%</div>
                <div>Bezpieczeństwo</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col">
        <header className="p-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2 text-primary font-semibold">
            <Stethoscope className="w-6 h-6" />
            <span>MedApp</span>
          </Link>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-slide-up">
            {title && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                {subtitle && (
                  <p className="text-muted-foreground mt-2">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>

        <footer className="p-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Powrót do strony głównej
          </Link>
        </footer>
      </div>
    </div>
  );
};
