import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Filter,
  User,
  FileText,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Visit, visitTypeLabels, visitStatusLabels } from '@/types/patient';
import { useLocalStorageUser } from '@/hooks/use-user';
import { getAppointmentsByDoctor } from '@/lib/medical-api/appointment';
import { getPatient } from '@/lib/medical-api/patient';

// Load visits from backend (appointments by doctor)

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

export default function DoctorVisits() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [visits, setVisits] = useState<Visit[]>([]);

  const { doctor_id } = useLocalStorageUser();

  useEffect(() => {
    const load = async () => {
      try {
        if (!doctor_id) return;
        const res = await getAppointmentsByDoctor(doctor_id);
        if (res && res.status === 'success') {
          const appts = res.appointments || [];
          const enriched = await Promise.all(appts.map(async (a: any) => {
            let patient = null;
            try {
              const p = await getPatient(a.patient_id);
              patient = p.patient;
            } catch (e) { patient = null; }
            const dateObj = new Date(a.appointment_date);
            return {
              id: String(a.id),
              patientId: String(a.patient_id),
              patient: patient ? {
                id: String(patient.id),
                firstName: patient.first_name || '',
                lastName: patient.last_name || '',
                pesel: patient.pesel || '',
                birthDate: patient.birth_date || '',
                phone: patient.phone || '',
              } : { id: String(a.patient_id), firstName: '', lastName: '', pesel: '', birthDate: '', phone: '' },
              doctorId: String(a.doctor_id),
              date: dateObj.toISOString().slice(0,10),
              time: dateObj.toTimeString().slice(0,5),
              duration: a.duration || 30,
              type: 'consultation',
              status: a.status || 'completed',
              reason: a.notes || '',
              notes: a.notes || ''
            } as Visit;
          }));
          setVisits(enriched);
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = 
      visit.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historia wizyt</h1>
          <p className="text-muted-foreground">Przeglądaj historię wszystkich wizyt</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po pacjencie lub powodzie wizyty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="completed">Zakończone</SelectItem>
                  <SelectItem value="cancelled">Anulowane</SelectItem>
                  <SelectItem value="no-show">Nieobecność</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Zakres dat
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Visits list */}
        <Card>
          <CardHeader>
            <CardTitle>Wizyty ({filteredVisits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVisits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nie znaleziono wizyt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
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
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {format(new Date(visit.date), 'd MMMM yyyy', { locale: pl })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {visit.time} ({visit.duration} min)
                            </span>
                          </div>

                          {visit.notes && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
                              <p className="font-medium text-muted-foreground mb-1">Notatki:</p>
                              <p>{visit.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="self-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Szczegóły
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}