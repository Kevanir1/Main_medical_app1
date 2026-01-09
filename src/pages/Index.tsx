import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Stethoscope, User, ArrowRight, Calendar, FileText, Clock, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Rezerwacja wizyt',
    description: 'Łatwe umawianie wizyt online w dogodnym terminie'
  },
  {
    icon: FileText,
    title: 'E-recepty',
    description: 'Elektroniczne recepty dostępne od ręki'
  },
  {
    icon: Clock,
    title: 'Historia wizyt',
    description: 'Pełna historia wizyt i dokumentacji medycznej'
  },
  {
    icon: CheckCircle,
    title: 'Bezpieczeństwo',
    description: 'Dane chronione zgodnie z RODO'
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MedApp</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Zaloguj się</Button>
            </Link>
            <Link to="/patient/register">
              <Button>Załóż konto</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-transparent to-primary-foreground/10" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              System zarządzania placówką medyczną
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 animate-slide-up">
              Nowoczesne rozwiązanie dla pacjentów, lekarzy i administracji
            </p>
            
            {/* CTA Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
              <Link to="/patient/register" className="group">
                <div className="p-6 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Jestem pacjentem</h3>
                  <p className="text-sm text-primary-foreground/70 mb-4">Załóż konto i umawiaj wizyty</p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium">
                    Załóż konto
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              
              <Link to="/doctor/register" className="group">
                <div className="p-6 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Jestem lekarzem</h3>
                  <p className="text-sm text-primary-foreground/70 mb-4">Złóż wniosek o konto lekarza</p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium">
                    Złóż wniosek
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-foreground/5" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Funkcje systemu</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kompleksowe rozwiązanie do zarządzania placówką medyczną
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="medical-card-hover text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="medical-card p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Szybkie linki</h2>
              <p className="text-muted-foreground mb-8">Przejdź bezpośrednio do wybranej funkcji</p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="gap-2">
                    Zaloguj się
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/patient/register">
                  <Button size="lg" variant="outline" className="gap-2">
                    Załóż konto pacjenta
                  </Button>
                </Link>
                <Link to="/doctor/register">
                  <Button size="lg" variant="outline" className="gap-2">
                    Rejestracja lekarza
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">MedApp</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 MedApp. Wszystkie prawa zastrzeżone.
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Polityka prywatności
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Regulamin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;