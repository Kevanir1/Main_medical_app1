import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthError, UserRole, roleRedirectPaths } from '@/types/auth';
import { z } from 'zod';
import { login } from '@/lib/medical-api/auth';

// Validation schema
const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Nieprawidłowy format email' }),
  password: z.string().min(6, { message: 'Hasło musi mieć minimum 6 znaków' }),
});


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Validate inputs
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') errors.email = err.message;
        if (err.path[0] === 'password') errors.password = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    const response = await login(email, password);
    console.log('Login response:', response);
  
    setError({
      code: 'invalid_credentials',
      message: 'Nieprawidłowy email lub hasło'
    });
    setIsLoading(false);
  };

  const getErrorStyle = () => {
    switch (error?.code) {
      case 'account_blocked':
        return 'border-destructive bg-destructive/10';
      case 'invalid_credentials':
      case 'account_not_found':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-destructive bg-destructive/10';
    }
  };

  return (
    <AuthLayout
      title="Zaloguj się"
      subtitle="Wprowadź swoje dane, aby uzyskać dostęp do systemu"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className={getErrorStyle()}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jan.kowalski@medapp.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className={validationErrors.email ? 'border-destructive' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-destructive">{validationErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={validationErrors.password ? 'border-destructive pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-sm text-destructive">{validationErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-input" />
            <span className="text-muted-foreground">Zapamiętaj mnie</span>
          </label>
          <a href="#" className="text-primary hover:underline">
            Zapomniałeś hasła?
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logowanie...
            </>
          ) : (
            'Zaloguj się'
          )}
        </Button>

      </form>
    </AuthLayout>
  );
}