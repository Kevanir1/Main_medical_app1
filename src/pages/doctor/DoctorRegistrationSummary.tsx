import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { DoctorRegistrationData } from '@/types/doctor';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, ArrowLeft, Send, User, Mail, Phone, CreditCard, Calendar, Stethoscope, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { registerDoctor } from '@/lib/medical-api/user';
import { specializations } from '@/types/doctor';

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DoctorRegistrationData;
};

export const DoctorRegistrationSummaryDialog = ({ isOpen, onOpenChange, formData }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBack = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await registerDoctor({
        first_name: formData!.firstName,
        last_name: formData!.lastName,
        email: formData!.email,
        password: formData!.password,
        specialization: specializations[formData!.specialization],
        license_number: formData!.licenseNumber,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      
      toast({
        title: "Wniosek wysłany!",
        description: "Twój wniosek został przyjęty. Administrator musi go zaakceptować.",
      });

      onOpenChange(false);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Błąd rejestracji",
        description: error.message || "Wystąpił błąd podczas rejestracji",
        variant: "destructive",
      });
    }
  };

  if (!formData) {
    return null;
  }
  const summaryItems = [
    { icon: User, label: 'Imię i nazwisko', value: `${formData.firstName} ${formData.lastName}` },
    { icon: Mail, label: 'Email', value: formData.email },
    { icon: Phone, label: 'Telefon', value: formData.phone },
    { icon: CreditCard, label: 'PESEL', value: formData.pesel },
    { icon: Stethoscope, label: 'Specjalizacja', value: formData.specialization },
    { icon: Lock, label: 'Hasło', value: '•'.repeat(formData.password.length) },
    { icon: CreditCard, label: 'Numer licencji', value: formData.licenseNumber },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Podsumowanie rejestracji</DialogTitle>
        <DialogDescription className="mb-4 text-muted-foreground">
          Sprawdź swoje dane przed wysłaniem wniosku o rejestrację konta lekarza.
        </DialogDescription>
      </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};

export default DoctorRegistrationSummaryDialog;
