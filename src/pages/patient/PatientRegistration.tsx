import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { validatePesel, extractBirthDateFromPesel } from "@/lib/pesel-validator";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { AuthLayout } from "@/components/layout/AuthLayout";

const patientSchema = z.object({
  firstName: z.string().min(2, "Imię musi mieć minimum 2 znaki").max(50),
  lastName: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki").max(50),
  pesel: z.string().refine((val) => validatePesel(val).valid, {
    message: "Nieprawidłowy numer PESEL"
  }),
  phone: z.string().regex(/^\d{9}$/, "Numer telefonu musi mieć 9 cyfr"),
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
  confirmPassword: z.string(),
  street: z.string().min(3, "Podaj adres").max(100),
  city: z.string().min(2, "Podaj miasto").max(50),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Format: XX-XXX"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Musisz zaakceptować regulamin"
  }),
  rodoAccepted: z.boolean().refine((val) => val === true, {
    message: "Musisz zaakceptować klauzulę RODO"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"]
});

type PatientFormData = z.infer<typeof patientSchema>;

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'summary'>('form');
  const [formData, setFormData] = useState<PatientFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      termsAccepted: false,
      rodoAccepted: false
    }
  });

  const peselValue = watch("pesel");
  const birthDate = peselValue ? extractBirthDateFromPesel(peselValue) : null;

  const onSubmit = (data: PatientFormData) => {
    setFormData(data);
    setStep('summary');
  };

  const handleConfirm = () => {
    toast.success("Konto zostało utworzone! Możesz się teraz zalogować.");
    navigate('/login');
  };

  if (step === 'summary' && formData) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Podsumowanie rejestracji</CardTitle>
            <CardDescription>Sprawdź poprawność wprowadzonych danych</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Imię i nazwisko</p>
                <p className="font-medium">{formData.firstName} {formData.lastName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">PESEL</p>
                <p className="font-medium">{formData.pesel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data urodzenia</p>
                <p className="font-medium">
                  {birthDate ? format(birthDate, "d MMMM yyyy", { locale: pl }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefon</p>
                <p className="font-medium">{formData.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{formData.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Adres</p>
                <p className="font-medium">
                  {formData.street}, {formData.postalCode} {formData.city}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>
                Wróć do edycji
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Potwierdź rejestrację
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Rejestracja pacjenta</CardTitle>
          <CardDescription>Utwórz konto aby umawiać wizyty</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię *</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko *</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesel">PESEL *</Label>
              <Input id="pesel" maxLength={11} {...register("pesel")} />
              {errors.pesel && (
                <p className="text-sm text-destructive">{errors.pesel.message}</p>
              )}
              {birthDate && !errors.pesel && (
                <p className="text-sm text-muted-foreground">
                  Data urodzenia: {format(birthDate, "d MMMM yyyy", { locale: pl })}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input id="phone" maxLength={9} placeholder="123456789" {...register("phone")} />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Ulica i numer *</Label>
              <Input id="street" placeholder="ul. Przykładowa 12/3" {...register("street")} />
              {errors.street && (
                <p className="text-sm text-destructive">{errors.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Kod pocztowy *</Label>
                <Input id="postalCode" placeholder="00-000" {...register("postalCode")} />
                {errors.postalCode && (
                  <p className="text-sm text-destructive">{errors.postalCode.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Miasto *</Label>
                <Input id="city" {...register("city")} />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Hasło *</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Powtórz hasło *</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAccepted"
                  onCheckedChange={(checked) => setValue("termsAccepted", checked === true)}
                />
                <Label htmlFor="termsAccepted" className="text-sm leading-tight">
                  Akceptuję regulamin serwisu *
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="rodoAccepted"
                  onCheckedChange={(checked) => setValue("rodoAccepted", checked === true)}
                />
                <Label htmlFor="rodoAccepted" className="text-sm leading-tight">
                  Wyrażam zgodę na przetwarzanie danych osobowych zgodnie z RODO *
                </Label>
              </div>
              {errors.rodoAccepted && (
                <p className="text-sm text-destructive">{errors.rodoAccepted.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Przejdź do podsumowania
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Masz już konto?{" "}
              <a href="/login" className="text-primary hover:underline">
                Zaloguj się
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default PatientRegistration;