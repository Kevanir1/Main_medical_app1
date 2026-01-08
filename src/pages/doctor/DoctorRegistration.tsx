import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { validatePesel, formatPesel } from '@/lib/pesel-validator';
import { DoctorRegistrationData, SPECIALIZATIONS } from '@/types/doctor';
import { AlertCircle, ArrowRight, Phone, Mail, User, Calendar, CreditCard, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DoctorRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [usePassport, setUsePassport] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DoctorRegistrationData | 'terms', string>>>({});
  
  const [formData, setFormData] = useState<DoctorRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pesel: '',
    passportNumber: '',
    birthDate: '',
    specialization: '',
  });

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Imię jest wymagane';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nazwisko jest wymagane';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon jest wymagany';
    } else if (!/^\+?[\d\s-]{9,}$/.test(formData.phone)) {
      newErrors.phone = 'Nieprawidłowy format telefonu';
    }
    
    if (usePassport) {
      if (!formData.passportNumber?.trim()) {
        newErrors.passportNumber = 'Numer paszportu jest wymagany';
      }
    } else {
      if (!formData.pesel.trim()) {
        newErrors.pesel = 'PESEL jest wymagany';
      } else {
        const peselValidation = validatePesel(formData.pesel);
        if (!peselValidation.valid) {
          newErrors.pesel = peselValidation.message;
        }
      }
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data urodzenia jest wymagana';
    }
    if (!formData.specialization) {
      newErrors.specialization = 'Specjalizacja jest wymagana';
    }
    if (!acceptTerms) {
      newErrors.terms = 'Musisz zaakceptować regulamin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Błąd walidacji",
        description: "Proszę poprawić błędy w formularzu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Store form data and navigate to summary
    sessionStorage.setItem('doctorRegistration', JSON.stringify(formData));
    
    setTimeout(() => {
      setIsLoading(false);
      navigate('/doctor/register/summary');
    }, 500);
  };

  const handleInputChange = (field: keyof DoctorRegistrationData, value: string) => {
    if (field === 'pesel') {
      value = formatPesel(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderError = (field: keyof typeof errors) => {
    if (!errors[field]) return null;
    return (
      <div className="flex items-center gap-1 text-destructive text-sm mt-1">
        <AlertCircle className="w-4 h-4" />
        <span>{errors[field]}</span>
      </div>
    );
  };

  return (
    <AuthLayout 
      title="Rejestracja lekarza" 
      subtitle="Wypełnij formularz, aby złożyć wniosek o konto lekarza"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-field">
            <Label htmlFor="firstName" className="form-label">
              <User className="w-4 h-4 inline mr-1" />
              Imię
            </Label>
            <Input
              id="firstName"
              placeholder="Jan"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {renderError('firstName')}
          </div>
          <div className="form-field">
            <Label htmlFor="lastName" className="form-label">Nazwisko</Label>
            <Input
              id="lastName"
              placeholder="Kowalski"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {renderError('lastName')}
          </div>
        </div>

        {/* Contact fields */}
        <div className="form-field">
          <Label htmlFor="email" className="form-label">
            <Mail className="w-4 h-4 inline mr-1" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="jan.kowalski@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
          />
          {renderError('email')}
        </div>

        <div className="form-field">
          <Label htmlFor="phone" className="form-label">
            <Phone className="w-4 h-4 inline mr-1" />
            Telefon
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+48 123 456 789"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {renderError('phone')}
        </div>

        {/* ID toggle */}
        <div className="flex items-center gap-2 py-2">
          <Checkbox
            id="usePassport"
            checked={usePassport}
            onCheckedChange={(checked) => setUsePassport(checked as boolean)}
          />
          <Label htmlFor="usePassport" className="text-sm cursor-pointer">
            Nie posiadam numeru PESEL (użyj paszportu)
          </Label>
        </div>

        {/* PESEL or Passport */}
        {usePassport ? (
          <div className="form-field">
            <Label htmlFor="passport" className="form-label">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Numer paszportu
            </Label>
            <Input
              id="passport"
              placeholder="AB1234567"
              value={formData.passportNumber}
              onChange={(e) => handleInputChange('passportNumber', e.target.value)}
              className={errors.passportNumber ? 'border-destructive' : ''}
            />
            {renderError('passportNumber')}
          </div>
        ) : (
          <div className="form-field">
            <Label htmlFor="pesel" className="form-label">
              <CreditCard className="w-4 h-4 inline mr-1" />
              PESEL
            </Label>
            <Input
              id="pesel"
              placeholder="12345678901"
              value={formData.pesel}
              onChange={(e) => handleInputChange('pesel', e.target.value)}
              maxLength={11}
              className={errors.pesel ? 'border-destructive' : ''}
            />
            {renderError('pesel')}
          </div>
        )}

        {/* Birth date */}
        <div className="form-field">
          <Label htmlFor="birthDate" className="form-label">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data urodzenia
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            className={errors.birthDate ? 'border-destructive' : ''}
          />
          {renderError('birthDate')}
        </div>

        {/* Specialization */}
        <div className="form-field">
          <Label className="form-label">
            <Stethoscope className="w-4 h-4 inline mr-1" />
            Specjalizacja
          </Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) => handleInputChange('specialization', value)}
          >
            <SelectTrigger className={errors.specialization ? 'border-destructive' : ''}>
              <SelectValue placeholder="Wybierz specjalizację" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderError('specialization')}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 py-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => {
              setAcceptTerms(checked as boolean);
              if (errors.terms) {
                setErrors(prev => ({ ...prev, terms: undefined }));
              }
            }}
          />
          <Label htmlFor="terms" className="text-sm cursor-pointer leading-tight">
            Akceptuję regulamin i wyrażam zgodę na przetwarzanie danych osobowych zgodnie z RODO
          </Label>
        </div>
        {renderError('terms')}

        {/* Submit */}
        <Button 
          type="submit" 
          className="w-full gap-2" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Przetwarzanie...' : 'Dalej'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </AuthLayout>
  );
};

export default DoctorRegistration;
