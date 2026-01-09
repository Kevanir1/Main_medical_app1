import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Clock, Check, CalendarDays, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { VisitType, visitTypeLabels } from "@/types/patient";
import { usePatient } from "@/contexts/PatientContext";
import { cn } from "@/lib/utils";
import { getAllSpecializations, getDoctorsBySpecialization } from "@/lib/medical-api/doctor/doctor";
import { getDoctorAvailability } from "@/lib/medical-api/availability";
import { createAppointment } from "@/lib/medical-api/appointment";

interface Doctor {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  license_number: string;
  name: string;
}

interface Availability {
  id: number;
  doctor_id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

type Step = 'calendar' | 'specialization' | 'details' | 'confirm';

const PatientBooking = () => {
  const navigate = useNavigate();
  const { profile, refreshAppointments } = usePatient();
  
  const [step, setStep] = useState<Step>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [visitType, setVisitType] = useState<VisitType>('consultation');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API data
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);

  // Load specializations on component mount
  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const response = await getAllSpecializations();
        if (response?.specializations) {
          setSpecializations(response.specializations);
        }
      } catch (error) {
        console.error('Error loading specializations:', error);
        toast.error('Nie udało się załadować specjalizacji');
      }
    };
    loadSpecializations();
  }, []);

  // Load doctors when specialization is selected
  useEffect(() => {
    if (!selectedSpecialization) {
      setDoctors([]);
      return;
    }

    const loadDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await getDoctorsBySpecialization(selectedSpecialization);
        if (response?.doctors) {
          // Transform doctors to include name field
          const transformedDoctors = response.doctors.map((doctor: any) => ({
            ...doctor,
            name: `dr ${doctor.first_name} ${doctor.last_name}`
          }));
          setDoctors(transformedDoctors);
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
        toast.error('Nie udało się załadować listy lekarzy');
      } finally {
        setIsLoading(false);
      }
    };
    loadDoctors();
  }, [selectedSpecialization]);

  // Load availability when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) {
      setAvailabilities([]);
      return;
    }

    const loadAvailability = async () => {
      try {
        const response = await getDoctorAvailability(selectedDoctor.id);
        if (response?.availability) {
          setAvailabilities(response.availability);
        }
      } catch (error) {
        console.error('Error loading availability:', error);
        toast.error('Nie udało się załadować dostępności lekarza');
      }
    };
    loadAvailability();
  }, [selectedDoctor]);

  // Get all available times for selected date (for showing in step 1)
  const getAvailableTimesForDate = (date: Date) => {
    if (!availabilities.length) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const availableTimes = new Set<string>();
    
    availabilities.forEach(availability => {
      const availabilityDate = format(new Date(availability.start_time), 'yyyy-MM-dd');
      if (availabilityDate === dateStr && availability.is_available) {
        const time = format(new Date(availability.start_time), 'HH:mm');
        availableTimes.add(time);
      }
    });
    
    return Array.from(availableTimes).sort();
  };

  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedSpecialization(null);
    setSelectedDoctor(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('specialization');
  };

  const handleSpecializationSelect = (spec: string) => {
    setSelectedSpecialization(spec);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!reason.trim()) {
      toast.error("Podaj powód wizyty");
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !profile) {
      toast.error("Brak wymaganych danych do utworzenia wizyty");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find the availability slot for the selected time
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const selectedAvailability = availabilities.find(availability => {
        const availabilityDate = format(new Date(availability.start_time), 'yyyy-MM-dd');
        const availabilityTime = format(new Date(availability.start_time), 'HH:mm');
        return availabilityDate === dateStr && availabilityTime === selectedTime;
      });

      if (!selectedAvailability) {
        toast.error("Wybrany termin nie jest dostępny");
        return;
      }

      // Create appointment
      const appointmentData = {
        patient_id: Number(localStorage.getItem('patient_id')),
        doctor_id: selectedDoctor.id,
        availability_id: selectedAvailability.id
      };

      const response = await createAppointment(appointmentData);
      
      if (response?.appointment_id) {
        toast.success("Wizyta została umówiona!");
        await refreshAppointments(); // Refresh appointments in context
        navigate('/patient/visits');
      } else {
        toast.error("Nie udało się utworzyć wizyty");
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(error.message || "Wystąpił błąd podczas tworzenia wizyty");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 'specialization') {
      setSelectedTime(null);
      setSelectedSpecialization(null);
      setSelectedDoctor(null);
      setStep('calendar');
    } else if (step === 'details') {
      setSelectedDoctor(null);
      setStep('specialization');
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  const stepIndex = ['calendar', 'specialization', 'details', 'confirm'].indexOf(step);
  const stepLabels = ['Data i godzina', 'Specjalizacja', 'Szczegóły', 'Potwierdzenie'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Umów wizytę</h1>
        <p className="text-muted-foreground">Wybierz termin, specjalizację i lekarza</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                stepIndex === i ? 'bg-primary text-primary-foreground' : 
                stepIndex > i ? 'bg-primary/20 text-primary' : 
                'bg-muted text-muted-foreground'
              )}>
                {stepIndex > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{label}</span>
            </div>
            {i < 3 && <div className="w-8 h-0.5 bg-border mx-1" />}
          </div>
        ))}
      </div>

      {step === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Wybierz datę i godzinę
            </CardTitle>
            <CardDescription>Najpierw sprawdź dostępne terminy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Data wizyty</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  locale={pl}
                  className={cn("rounded-md border pointer-events-auto")}
                />
              </div>
              {selectedDate && (
                <div>
                  <Label className="mb-2 block">
                    Dostępne godziny - {format(selectedDate, 'd MMMM yyyy', { locale: pl })}
                  </Label>
                  {availableTimes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTimeSelect(time)}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
                      <AlertCircle className="w-5 h-5" />
                      <span>Brak dostępnych terminów w tym dniu</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'specialization' && selectedDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle>Wybierz specjalizację i lekarza</CardTitle>
            <CardDescription>
              Termin: {format(selectedDate, 'd MMMM yyyy', { locale: pl })} o godzinie {selectedTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Specjalizacja</Label>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => {
                  // Check if any doctors are available for this specialization
                  const doctorsAvailable = doctors.length > 0;
                  
                  return (
                    <Button
                      key={spec}
                      variant={selectedSpecialization === spec ? "default" : "outline"}
                      size="sm"
                      disabled={!doctorsAvailable && selectedSpecialization !== spec}
                      onClick={() => handleSpecializationSelect(spec)}
                    >
                      {spec}
                      {doctorsAvailable && selectedSpecialization === spec && (
                        <Badge variant="secondary" className="ml-2">
                          {doctors.length}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {selectedSpecialization && (
              <div className="space-y-2">
                <Label>Dostępni lekarze</Label>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Ładowanie lekarzy...</span>
                  </div>
                ) : doctors.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-colors",
                          selectedDoctor?.id === doctor.id 
                            ? "border-primary bg-primary/5" 
                            : "hover:border-primary"
                        )}
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <Badge variant="secondary">{doctor.specialization}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
                    <AlertCircle className="w-5 h-5" />
                    <span>Brak dostępnych lekarzy dla wybranej specjalizacji</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <Button variant="outline" onClick={goBack}>
                Wróć
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Szczegóły wizyty</CardTitle>
            <CardDescription>Podaj informacje o wizycie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rodzaj wizyty</Label>
              <Select value={visitType} onValueChange={(val) => setVisitType(val as VisitType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(visitTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Powód wizyty *</Label>
              <Textarea 
                placeholder="Opisz powód wizyty..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{reason.length}/500 znaków</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={goBack}>
                Wróć
              </Button>
              <Button onClick={handleDetailsSubmit}>
                Przejdź do podsumowania
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && selectedDoctor && selectedDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle>Potwierdzenie wizyty</CardTitle>
            <CardDescription>Sprawdź dane i potwierdź rezerwację</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{format(selectedDate, 'd MMMM yyyy', { locale: pl })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Godzina</p>
                <p className="font-medium">{selectedTime}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Specjalizacja</p>
                <p className="font-medium">{selectedDoctor.specialization}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lekarz</p>
                <p className="font-medium">{selectedDoctor.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rodzaj wizyty</p>
                <p className="font-medium">{visitTypeLabels[visitType]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Powód wizyty</p>
                <p className="font-medium">{reason}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Po potwierdzeniu wizyty termin zostanie zarezerwowany i nie będzie dostępny dla innych pacjentów.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={goBack}>
                Wróć do edycji
              </Button>
              <Button onClick={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tworzenie wizyty...
                  </>
                ) : (
                  'Potwierdź wizytę'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientBooking;