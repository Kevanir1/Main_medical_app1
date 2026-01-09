import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Clock, Check, CalendarDays, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { VisitType, visitTypeLabels } from "@/types/patient";
import { usePatient } from "@/contexts/PatientContext";
import { cn } from "@/lib/utils";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availableSlots: string[];
}

const specializations = [
  'Internista',
  'Kardiolog',
  'Dermatolog',
  'Ortopeda',
  'Neurolog',
  'Okulista'
];

const doctors: Doctor[] = [
  { 
    id: 'd1', 
    name: 'dr Anna Nowak', 
    specialization: 'Internista',
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']
  },
  { 
    id: 'd2', 
    name: 'dr Piotr Wiśniewski', 
    specialization: 'Kardiolog',
    availableSlots: ['08:00', '08:30', '11:00', '11:30', '12:00', '15:00', '15:30']
  },
  { 
    id: 'd3', 
    name: 'dr Maria Kowalczyk', 
    specialization: 'Dermatolog',
    availableSlots: ['10:00', '10:30', '11:00', '13:00', '13:30', '14:00']
  },
  { 
    id: 'd4', 
    name: 'dr Jan Zieliński', 
    specialization: 'Ortopeda',
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  },
  { 
    id: 'd5', 
    name: 'dr Katarzyna Malinowska', 
    specialization: 'Neurolog',
    availableSlots: ['08:30', '09:30', '10:30', '13:00', '14:00']
  },
  { 
    id: 'd6', 
    name: 'dr Tomasz Adamski', 
    specialization: 'Okulista',
    availableSlots: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00']
  }
];

type Step = 'calendar' | 'specialization' | 'details' | 'confirm';

const PatientBooking = () => {
  const navigate = useNavigate();
  const { isSlotBooked, addBookedSlot } = usePatient();
  
  const [step, setStep] = useState<Step>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [visitType, setVisitType] = useState<VisitType>('consultation');
  const [reason, setReason] = useState('');

  // Get available doctors for selected date and specialization
  const availableDoctors = useMemo(() => {
    if (!selectedDate || !selectedSpecialization) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return doctors
      .filter(doc => doc.specialization === selectedSpecialization)
      .map(doc => ({
        ...doc,
        availableSlots: doc.availableSlots.filter(
          time => !isSlotBooked(doc.id, dateStr, time)
        )
      }))
      .filter(doc => doc.availableSlots.length > 0);
  }, [selectedDate, selectedSpecialization, isSlotBooked]);

  // Get all available times for selected date (for showing in step 1)
  const getAvailableTimesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const allTimes = new Set<string>();
    
    doctors.forEach(doc => {
      doc.availableSlots.forEach(time => {
        if (!isSlotBooked(doc.id, dateStr, time)) {
          allTimes.add(time);
        }
      });
    });
    
    return Array.from(allTimes).sort();
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

  const handleConfirm = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      addBookedSlot({
        doctorId: selectedDoctor.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime
      });
      toast.success("Wizyta została umówiona!");
      navigate('/patient/visits');
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
                  const doctorsAvailable = doctors.filter(
                    d => d.specialization === spec && 
                    d.availableSlots.includes(selectedTime) &&
                    !isSlotBooked(d.id, format(selectedDate, 'yyyy-MM-dd'), selectedTime)
                  );
                  const isAvailable = doctorsAvailable.length > 0;
                  
                  return (
                    <Button
                      key={spec}
                      variant={selectedSpecialization === spec ? "default" : "outline"}
                      size="sm"
                      disabled={!isAvailable}
                      onClick={() => handleSpecializationSelect(spec)}
                    >
                      {spec}
                      {isAvailable && (
                        <Badge variant="secondary" className="ml-2">
                          {doctorsAvailable.length}
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
                <div className="grid gap-4 md:grid-cols-2">
                  {doctors
                    .filter(d => 
                      d.specialization === selectedSpecialization && 
                      d.availableSlots.includes(selectedTime) &&
                      !isSlotBooked(d.id, format(selectedDate, 'yyyy-MM-dd'), selectedTime)
                    )
                    .map((doctor) => (
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
              <Button onClick={handleConfirm}>
                Potwierdź wizytę
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientBooking;