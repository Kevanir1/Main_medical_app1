import { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getAppointmentsByDoctor } from '@/lib/medical-api/appointment';
import { useLocalStorageUser } from '@/hooks/use-user';
import { Appointment } from '@/types/appointment';

const hours = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

const getTypeColor = (type: string) => {
  switch (type) {
    case 'consultation':
      return 'bg-primary text-primary-foreground';
    case 'follow-up':
      return 'bg-secondary text-secondary-foreground';
    case 'procedure':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function DoctorSchedule() {
  const { doctor_id } = useLocalStorageUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const getItemsForDay = (date: Date) => {
    return appointments
      .filter(app => isSameDay(new Date(app.appointmentDate), date))
      .map(app => ({
        id: app.id,
        time: format(new Date(app.appointmentDate), 'HH:mm'),
        // TODO: If backend provides appointment type (consultation/follow-up/procedure), use it here.
        // Do not assume API contract; default to 'consultation'.
        type: 'consultation',
      }));
  };

  useEffect(() => {
    const loadAppointments = async () => {
      if (!doctor_id) {
        // TODO: `doctor_id` missing; ensure auth provides doctor_id in local storage or user context
        return;
      }

      try {
        const res = await getAppointmentsByDoctor(doctor_id as number);
        // Backend returns { status: 'success', appointments: [...] }
        if (res && res.status === 'success' && Array.isArray(res.appointments)) {
          setAppointments(res.appointments.map((a: any) => ({
            id: a.id,
            patientId: a.patient_id,
            doctorId: a.doctor_id,
            availabilityId: a.availability_id,
            appointmentDate: a.appointment_date,
            status: a.status,
          })));
        } else if (Array.isArray(res)) {
          // Fallback: if API returns raw array
          setAppointments(res.map((a: any) => ({
            id: a.id,
            patientId: a.patient_id,
            doctorId: a.doctor_id,
            availabilityId: a.availability_id,
            appointmentDate: a.appointment_date,
            status: a.status,
          })));
        }
      } catch (e) {
        console.error('Error loading appointments:', e);
      }
    };

    void loadAppointments();
  }, [doctor_id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grafik</h1>
          <p className="text-muted-foreground">Zarządzaj swoim harmonogramem</p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(weekStart, 'd MMM', { locale: pl })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: pl })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Konsultacja</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-sm text-muted-foreground">Kontrolna</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Zabieg</span>
        </div>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days header */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-3 text-sm font-medium text-muted-foreground border-r" />
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 text-center border-r last:border-r-0',
                    isSameDay(day, new Date()) && 'bg-primary/5'
                  )}
                >
                  <p className="text-sm font-medium text-muted-foreground">{format(day, 'EEE', { locale: pl })}</p>
                  <p className={cn('text-lg font-bold', isSameDay(day, new Date()) && 'text-primary')}>{format(day, 'd')}</p>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                <div className="p-2 text-sm text-muted-foreground border-r flex items-start justify-end pr-3">{hour}</div>
                {weekDays.map((day, dayIndex) => {
                  const dayItems = getItemsForDay(day).filter(item => item.time === hour);
                  return (
                    <div
                      key={dayIndex}
                      className={cn('p-1 border-r last:border-r-0 min-h-[60px]', isSameDay(day, new Date()) && 'bg-primary/5')}
                    >
                      {dayItems.map((item) => (
                        <div key={item.id} className={cn('p-2 rounded text-xs mb-1 cursor-pointer hover:opacity-80 transition-opacity', getTypeColor(item.type))}>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's summary */}
      <Card>
        <CardHeader>
          <CardTitle>Podsumowanie dnia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-primary">{getItemsForDay(new Date()).length}</p>
              <p className="text-sm text-muted-foreground">Wizyt dzisiaj</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Łączny czas</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-primary">{getItemsForDay(new Date()).filter(i => i.type === 'procedure').length}</p>
              <p className="text-sm text-muted-foreground">Zabiegi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
 
