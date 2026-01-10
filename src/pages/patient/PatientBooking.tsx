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

type Step = 'specialization' | 'calendar' | 'details' | 'confirm';

const PatientBooking = () => {
  const navigate = useNavigate();
  const { profile, refreshAppointments } = usePatient();
  
  const [step, setStep] = useState<Step>('specialization');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<any | null>(null);
  const [visitType, setVisitType] = useState<VisitType>('consultation');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API data
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availabilitiesRaw, setAvailabilitiesRaw] = useState<any[]>([]);
  const [slotsMap, setSlotsMap] = useState<Record<string, Array<any>>>({});
  const [loadingAvailabilities, setLoadingAvailabilities] = useState<boolean>(false);

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

  // Load doctors when specialization is selected (list of doctors for info)
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
    void loadDoctors();
  }, [selectedSpecialization]);

  // Load availabilities for specialization + date when both selected
  useEffect(() => {
    const loadAvailabilities = async () => {
      if (!selectedSpecialization || !selectedDate) {
        setAvailabilitiesRaw([]);
        setSlotsMap({});
        return;
      }

      setLoadingAvailabilities(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        // Ensure we have doctors for the specialization
        let localDoctors = doctors;
        if (!localDoctors || localDoctors.length === 0) {
          const resp = await getDoctorsBySpecialization(selectedSpecialization);
          localDoctors = resp?.doctors || [];
          const transformed = localDoctors.map((d: any) => ({ ...d, name: `dr ${d.first_name} ${d.last_name}` }));
          setDoctors(transformed);
          localDoctors = transformed;
        }

        // Fetch availability for each doctor in parallel
        const results = await Promise.allSettled(localDoctors.map(async (doc: any) => {
          const docId = doc.id ?? doc.doctor_id;
          try {
            const resp = await getDoctorAvailability(docId);
            return { doctor: doc, availability: resp?.availability || [] };
          } catch (err: any) {
            // Treat 404 as empty availability (wrong/missing endpoint), don't surface toast
            const status = err?.response?.status ?? err?.status;
            if (status === 404) return { doctor: doc, availability: [] };
            // otherwise propagate rejection to be handled below
            throw err;
          }
        }));

        let hadNon404Error = false;
        const allItems: any[] = [];

        for (const r of results) {
          if (r.status === 'fulfilled') {
            const { doctor, availability } = r.value;
            // attach doctor info to each availability item
            availability.forEach((a: any) => {
              allItems.push({ ...a, doctor });
            });
          } else {
            const reason = r.reason as any;
            const status = reason?.response?.status ?? reason?.status;
            if (status === 404) {
              // skip
            } else {
              hadNon404Error = true;
            }
          }
        }

        if (hadNon404Error) {
          toast.error('Wystąpił błąd podczas pobierania dostępności');
        }

        // Filter by selected date and build slots map
        setAvailabilitiesRaw(allItems);
        const map: Record<string, Array<any>> = {};
        allItems.forEach((a: any) => {
          if (!a.is_available) return;
          const aDate = format(new Date(a.start_time), 'yyyy-MM-dd');
          if (aDate !== dateStr) return;
          const time = format(new Date(a.start_time), 'HH:mm');
          map[time] = map[time] || [];
          map[time].push({
            availability_id: a.availability_id ?? a.id,
            doctor_id: a.doctor?.id ?? a.doctor?.doctor_id ?? a.doctor_id,
            first_name: a.doctor?.first_name ?? '',
            last_name: a.doctor?.last_name ?? '',
            specialization: a.doctor?.specialization ?? '',
            license_number: a.doctor?.license_number ?? ''
          });
        });
        setSlotsMap(map);
      } catch (e) {
        console.error('Error loading availabilities by fetching per-doctor', e);
        toast.error('Wystąpił błąd podczas pobierania dostępności');
        setAvailabilitiesRaw([]);
        setSlotsMap({});
      } finally {
        setLoadingAvailabilities(false);
      }
    };

    void loadAvailabilities();
  }, [selectedSpecialization, selectedDate]);

  // Get available times from slotsMap for selected date
  const availableTimes = selectedDate ? Object.keys(slotsMap).sort() : [];

  const handleSpecializationSelect = (spec: string) => {
    setSelectedSpecialization(spec);
    // move to date selection step
    setStep('calendar');
    setSelectedDate(undefined);
    setSelectedTime(null);
    setSelectedDoctor(null);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedDoctor(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    // if only one doctor for that time, auto-select and proceed
    const doctorsForTime = slotsMap[time] || [];
    if (doctorsForTime.length === 1) {
      const d = doctorsForTime[0];
      setSelectedDoctor({
        id: d.doctor_id,
        user_id: d.doctor_id,
        first_name: d.first_name,
        last_name: d.last_name,
        specialization: d.specialization,
        license_number: d.license_number,
        name: `dr ${d.first_name} ${d.last_name}`
      });
      setSelectedAvailability({ availability_id: d.availability_id });
      setStep('details');
    } else {
      // multiple doctors: stay on calendar step but show doctor selector below
      setSelectedDoctor(null);
    }
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor({
      id: doctor.doctor_id,
      user_id: doctor.doctor_id,
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      specialization: doctor.specialization,
      license_number: doctor.license_number,
      name: `dr ${doctor.first_name} ${doctor.last_name}`
    });
    setSelectedAvailability({ availability_id: doctor.availability_id });
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
    if (!selectedDoctor || !selectedDate || !selectedTime || !profile || !selectedAvailability) {
      toast.error("Brak wymaganych danych do utworzenia wizyty");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find the availability slot for the selected time
      // Create appointment using selectedAvailability.availability_id
      const appointmentData = {
        patient_id: Number(localStorage.getItem('patient_id')),
        doctor_id: selectedDoctor.id,
        availability_id: selectedAvailability.availability_id || selectedAvailability.id
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
    if (step === 'calendar') {
      setStep('specialization');
      return;
    }

    if (step === 'details') {
      setStep('calendar');
      return;
    }

    if (step === 'confirm') {
      setStep('details');
      return;
    }

    // If already at the first step, clear selection
    if (step === 'specialization') {
      setSelectedSpecialization(null);
    }
  };

  const orderedSteps = ['specialization', 'calendar', 'details', 'confirm'];
  const stepIndex = orderedSteps.indexOf(step);
  const stepLabels = ['Specjalizacja', 'Data i godzina', 'Szczegóły', 'Potwierdzenie'];

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
              <div>
                <Label className="mb-2 block">
                  {selectedDate ? `Dostępne godziny - ${format(selectedDate, 'd MMMM yyyy', { locale: pl })}` : 'Dostępne godziny'}
                </Label>

                {!selectedSpecialization ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
                    <AlertCircle className="w-5 h-5" />
                    <span>Wybierz specjalizację w kroku 1, aby zobaczyć dostępne terminy</span>
                  </div>
                ) : !selectedDate ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
                    <AlertCircle className="w-5 h-5" />
                    <span>Wybierz datę, aby zobaczyć dostępne godziny</span>
                  </div>
                ) : loadingAvailabilities ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Ładowanie dostępnych terminów...</span>
                  </div>
                ) : availableTimes.length > 0 ? (
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

                {/* Doctor selector for chosen time */}
                <div className="mt-4">
                  <Label className="mb-2 block">Lekarze dla wybranego terminu</Label>
                  {selectedTime ? (
                    (() => {
                      const doctorsForTime = slotsMap[selectedTime] || [];
                      if (doctorsForTime.length === 0) {
                        return (
                          <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
                            <AlertCircle className="w-5 h-5" />
                            <span>Brak dostępnych lekarzy dla wybranego terminu</span>
                          </div>
                        );
                      }

                      return (
                        <div className="grid gap-4 md:grid-cols-2">
                          {doctorsForTime.map((doctor) => (
                            <div
                              key={`${doctor.doctor_id}-${doctor.availability_id}`}
                              className={cn(
                                "p-4 rounded-lg border cursor-pointer transition-colors",
                                selectedDoctor?.id === doctor.doctor_id 
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
                                  <p className="font-medium">dr {doctor.first_name} {doctor.last_name}</p>
                                  <Badge variant="secondary">{doctor.specialization}</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
                      <AlertCircle className="w-5 h-5" />
                      <span>Wybierz godzinę, aby zobaczyć dostępnych lekarzy</span>
                    </div>
                  )}
                </div>
              </div>
              </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={goBack}>
                Wstecz
              </Button>
              <Button onClick={() => setStep('details')} disabled={!selectedDate || !selectedTime || !selectedDoctor}>
                Dalej
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'specialization' && (
        <Card>
          <CardHeader>
            <CardTitle>Wybierz specjalizację</CardTitle>
            <CardDescription>Wybierz specjalizację, aby przejść do wyboru daty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Specjalizacja</Label>
              <div className="flex flex-wrap gap-2">
                {specializations.length === 0 ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Ładowanie specjalizacji...</span>
                  </div>
                ) : (
                  specializations.map((spec) => (
                    <Button
                      key={spec}
                      variant={selectedSpecialization === spec ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSpecializationSelect(spec)}
                    >
                      {spec}
                    </Button>
                  ))
                )}
              </div>
            </div>

            {/* No back button in specialization (Step 1) per requirements */}
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
                Wstecz
              </Button>
              <Button onClick={handleDetailsSubmit}>
                Dalej
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && (
        <Card>
          <CardHeader>
            <CardTitle>Potwierdzenie wizyty</CardTitle>
            <CardDescription>Sprawdź dane i potwierdź rezerwację</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: pl }) : '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Godzina</p>
                <p className="font-medium">{selectedTime || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Specjalizacja</p>
                <p className="font-medium">{selectedDoctor?.specialization || selectedSpecialization || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lekarz</p>
                <p className="font-medium">{selectedDoctor?.name || '—'}</p>
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
                Wstecz
              </Button>
              <Button onClick={handleConfirm} disabled={isSubmitting || !selectedDoctor || !selectedDate || !selectedTime}>
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