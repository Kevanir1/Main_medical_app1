import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Play,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  FileText
} from 'lucide-react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Visit, visitTypeLabels, visitStatusLabels } from '@/types/patient';
import { getAppointmentsByDoctor, completeAppointment, cancelAppointment } from '@/lib/medical-api/appointment';
import { getPatient } from '@/lib/medical-api/patient';
import { toast } from 'sonner';

// Helper function to transform API appointment data to Visit interface
const transformAppointmentToVisit = async (appointment: any): Promise<Visit> => {
  const patientData = await getPatient(appointment.patient_id);
  
  return {
    id: appointment.id.toString(),
    patientId: appointment.patient_id.toString(),
    patient: {
      id: patientData.id.toString(),
      firstName: patientData.first_name,
      lastName: patientData.last_name,
      pesel: patientData.pesel || '',
      birthDate: '', // Not stored in database, could be derived from PESEL
      phone: patientData.phone || '',
      email: '', // Not returned by API
    },
    doctorId: appointment.doctor_id.toString(),
    date: format(new Date(appointment.appointment_date), 'yyyy-MM-dd'),
    time: format(new Date(appointment.appointment_date), 'HH:mm'),
    duration: 30, // Default duration, could be calculated from availability
    type: 'consultation', // Default type, could be determined from availability or added to appointment
    status: appointment.status.toLowerCase() as Visit['status'],
    reason: 'Wizyta lekarska', // Default reason, could be added to appointment table
  };
};

const getStatusColor = (status: Visit['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-600 border-green-200';
    case 'in-progress':
      return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'scheduled':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'no-show':
      return 'bg-muted text-muted-foreground border-muted';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

const getTypeColor = (type: Visit['type']) => {
  switch (type) {
    case 'consultation':
      return 'bg-primary/10 text-primary';
    case 'follow-up':
      return 'bg-secondary text-secondary-foreground';
    case 'procedure':
      return 'bg-accent text-accent-foreground';
    case 'emergency':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function DoctorDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Hide header after scrolling 50px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) {
          setError('Nie znaleziono ID lekarza');
          return;
        }

        const response = await getAppointmentsByDoctor(parseInt(doctorId));
        if (response.status === 'success' && response.appointments) {
          // Transform appointments to Visit format
          const transformedVisits = await Promise.all(
            response.appointments.map(transformAppointmentToVisit)
          );
          setVisits(transformedVisits);
        } else {
          setError('Nie udało się pobrać wizyt');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Wystąpił błąd podczas ładowania wizyt');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const todayVisits = visits.filter(v => v.date === format(selectedDate, 'yyyy-MM-dd'));
  const completedCount = todayVisits.filter(v => v.status === 'completed').length;
  const scheduledCount = todayVisits.filter(v => v.status === 'scheduled').length;
  const inProgressVisit = todayVisits.find(v => v.status === 'in-progress');

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleStartVisit = async (visitId: string) => {
    try {
      // For now, just update local state. In a real implementation, 
      // you might need a separate API endpoint to start a visit
      setVisits(visits.map(v => 
        v.id === visitId ? { ...v, status: 'in-progress' as const } : v
      ));
      toast.success('Wizyta została rozpoczęta');
    } catch (err) {
      console.error('Error starting visit:', err);
      toast.error('Nie udało się rozpocząć wizyty');
    }
  };

  const handleCompleteVisit = async (visitId: string) => {
    try {
      await completeAppointment(parseInt(visitId));
      setVisits(visits.map(v => 
        v.id === visitId ? { ...v, status: 'completed' as const } : v
      ));
      toast.success('Wizyta została zakończona');
    } catch (err) {
      console.error('Error completing visit:', err);
      toast.error('Nie udało się zakończyć wizyty');
    }
  };

  const handleCancelVisit = async (visitId: string) => {
    try {
      await cancelAppointment(parseInt(visitId));
      setVisits(visits.map(v => 
        v.id === visitId ? { ...v, status: 'cancelled' as const } : v
      ));
      toast.success('Wizyta została anulowana');
    } catch (err) {
      console.error('Error cancelling visit:', err);
      toast.error('Nie udało się anulować wizyty');
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Ładowanie wizyt...</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Wystąpił błąd podczas ładowania danych</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-destructive">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Spróbuj ponownie
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header - Hidden when scrolled */}
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-opacity duration-300",
          isScrolled && "opacity-0 pointer-events-none"
        )}>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Przegląd wizyt na wybrany dzień</p>
          </div>
          
          {/* Date selector */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'd MMMM yyyy', { locale: pl })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayVisits.length}</p>
                  <p className="text-sm text-muted-foreground">Wszystkich wizyt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Zakończonych</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{scheduledCount}</p>
                  <p className="text-sm text-muted-foreground">Zaplanowanych</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressVisit ? 1 : 0}</p>
                  <p className="text-sm text-muted-foreground">W trakcie</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current visit */}
        {inProgressVisit && (
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Play className="w-5 h-5" />
                Aktualna wizyta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {inProgressVisit.patient.firstName} {inProgressVisit.patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{inProgressVisit.reason}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getTypeColor(inProgressVisit.type)}>
                        {visitTypeLabels[inProgressVisit.type]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {inProgressVisit.time} • {inProgressVisit.duration} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Dokumentacja
                  </Button>
                  <Button size="sm" onClick={() => handleCompleteVisit(inProgressVisit.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Zakończ wizytę
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visits list */}
        <Card>
          <CardHeader>
            <CardTitle>Lista wizyt</CardTitle>
          </CardHeader>
          <CardContent>
            {todayVisits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak zaplanowanych wizyt na ten dzień</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      visit.status === 'in-progress' && "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20",
                      visit.status === 'completed' && "opacity-60"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Time */}
                        <div className="text-center min-w-[60px]">
                          <p className="font-bold text-lg">{visit.time}</p>
                          <p className="text-xs text-muted-foreground">{visit.duration} min</p>
                        </div>

                        {/* Patient info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">
                              {visit.patient.firstName} {visit.patient.lastName}
                            </p>
                            <Badge variant="outline" className={getStatusColor(visit.status)}>
                              {visitStatusLabels[visit.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{visit.reason}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className={getTypeColor(visit.type)}>
                              {visitTypeLabels[visit.type]}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {visit.patient.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-[76px] lg:ml-0">
                        {visit.status === 'scheduled' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleStartVisit(visit.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Rozpocznij
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancelVisit(visit.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Anuluj
                            </Button>
                          </>
                        )}
                        {visit.status === 'in-progress' && (
                          <Button 
                            size="sm"
                            onClick={() => handleCompleteVisit(visit.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Zakończ
                          </Button>
                        )}
                        {visit.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Zobacz
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
