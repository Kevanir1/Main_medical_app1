import { useState } from 'react';
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
import { DoctorLayout } from '@/components/layout/DoctorLayout';
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

// Mock visit history
const mockVisitHistory: Visit[] = [
  {
    id: '1',
    patientId: 'p1',
    patient: {
      id: 'p1',
      firstName: 'Anna',
      lastName: 'Nowak',
      pesel: '85042512345',
      birthDate: '1985-04-25',
      phone: '+48 600 123 456',
    },
    doctorId: 'd1',
    date: '2024-01-15',
    time: '09:00',
    duration: 30,
    type: 'consultation',
    status: 'completed',
    reason: 'Ból w klatce piersiowej',
    notes: 'Pacjent zgłasza sporadyczne bóle w klatce piersiowej. Zlecono EKG.'
  },
  {
    id: '2',
    patientId: 'p2',
    patient: {
      id: 'p2',
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      pesel: '78112234567',
      birthDate: '1978-11-22',
      phone: '+48 601 234 567',
    },
    doctorId: 'd1',
    date: '2024-01-14',
    time: '10:00',
    duration: 45,
    type: 'follow-up',
    status: 'completed',
    reason: 'Kontrola po zawale',
    notes: 'Stan pacjenta stabilny. Kontynuacja leczenia farmakologicznego.'
  },
  {
    id: '3',
    patientId: 'p3',
    patient: {
      id: 'p3',
      firstName: 'Maria',
      lastName: 'Kowalczyk',
      pesel: '92030567890',
      birthDate: '1992-03-05',
      phone: '+48 602 345 678',
    },
    doctorId: 'd1',
    date: '2024-01-13',
    time: '11:00',
    duration: 60,
    type: 'procedure',
    status: 'completed',
    reason: 'EKG wysiłkowe',
    notes: 'Badanie wykonane prawidłowo. Wynik w normie.'
  },
  {
    id: '4',
    patientId: 'p4',
    patient: {
      id: 'p4',
      firstName: 'Tomasz',
      lastName: 'Zieliński',
      pesel: '88071234567',
      birthDate: '1988-07-12',
      phone: '+48 603 456 789',
    },
    doctorId: 'd1',
    date: '2024-01-12',
    time: '14:00',
    duration: 30,
    type: 'consultation',
    status: 'cancelled',
    reason: 'Nadciśnienie'
  },
  {
    id: '5',
    patientId: 'p5',
    patient: {
      id: 'p5',
      firstName: 'Katarzyna',
      lastName: 'Dąbrowska',
      pesel: '95051890123',
      birthDate: '1995-05-18',
      phone: '+48 604 567 890',
    },
    doctorId: 'd1',
    date: '2024-01-11',
    time: '08:30',
    duration: 30,
    type: 'consultation',
    status: 'no-show',
    reason: 'Arytmia'
  },
];

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

  const filteredVisits = mockVisitHistory.filter(visit => {
    const matchesSearch = 
      visit.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DoctorLayout>
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
    </DoctorLayout>
  );
}
