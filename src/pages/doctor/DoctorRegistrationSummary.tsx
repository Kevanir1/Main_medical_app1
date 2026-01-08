import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { DoctorRegistrationData } from '@/types/doctor';
import { Check, ArrowLeft, Send, User, Mail, Phone, CreditCard, Calendar, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DoctorRegistrationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<DoctorRegistrationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('doctorRegistration');
    if (stored) {
      setFormData(JSON.parse(stored));
    } else {
      navigate('/doctor/register');
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/doctor/register');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Clear stored data
    sessionStorage.removeItem('doctorRegistration');
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    toast({
      title: "Wniosek wysłany!",
      description: "Twój wniosek został przyjęty. Administrator musi go zaakceptować.",
    });
  };

  if (!formData) {
    return null;
  }

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Wniosek wysłany" 
        subtitle="Dziękujemy za rejestrację"
      >
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Wniosek przyjęty!</h3>
          <p className="text-muted-foreground mb-8">
            Twój wniosek o rejestrację konta lekarza został pomyślnie wysłany. 
            Administrator musi zaakceptować Twoje zgłoszenie. 
            Otrzymasz powiadomienie email o decyzji.
          </p>
          <div className="p-4 rounded-lg bg-muted mb-6">
            <div className="text-sm text-muted-foreground mb-1">Status wniosku</div>
            <div className="font-medium text-warning">Oczekuje na weryfikację</div>
          </div>
          <Button onClick={() => navigate('/')} className="w-full" size="lg">
            Powrót do strony głównej
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const summaryItems = [
    { icon: User, label: 'Imię i nazwisko', value: `${formData.firstName} ${formData.lastName}` },
    { icon: Mail, label: 'Email', value: formData.email },
    { icon: Phone, label: 'Telefon', value: formData.phone },
    { icon: CreditCard, label: formData.passportNumber ? 'Numer paszportu' : 'PESEL', value: formData.passportNumber || formData.pesel },
    { icon: Calendar, label: 'Data urodzenia', value: new Date(formData.birthDate).toLocaleDateString('pl-PL') },
    { icon: Stethoscope, label: 'Specjalizacja', value: formData.specialization },
  ];

  return (
    <AuthLayout 
      title="Podsumowanie" 
      subtitle="Sprawdź poprawność danych przed wysłaniem"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Summary card */}
        <div className="medical-card">
          <h3 className="font-semibold mb-4 text-foreground">Twoje dane</h3>
          <div className="space-y-4">
            {summaryItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="font-medium text-foreground truncate">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground">
            <strong>Ważne:</strong> Po wysłaniu wniosku administrator zweryfikuje Twoje dane. 
            Otrzymasz powiadomienie email o decyzji.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex-1 gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć i popraw
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Wysyłanie...'
            ) : (
              <>
                Zatwierdź i wyślij
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default DoctorRegistrationSummary;
