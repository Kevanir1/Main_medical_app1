import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { visitTypeLabels, visitStatusLabels, Visit } from "@/types/patient";

// Mock data
const upcomingVisits: Visit[] = [
  {
    id: '1',
    patientId: 'p1',
    patient: { id: 'p1', firstName: 'Jan', lastName: 'Kowalski', pesel: '90010112345', birthDate: '1990-01-01', phone: '123456789' },
    doctorId: 'd1',
    date: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    time: '10:00',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    reason: 'Konsultacja ogólna'
  },
  {
    id: '2',
    patientId: 'p1',
    patient: { id: 'p1', firstName: 'Jan', lastName: 'Kowalski', pesel: '90010112345', birthDate: '1990-01-01', phone: '123456789' },
    doctorId: 'd2',
    date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    time: '14:30',
    duration: 20,
    type: 'follow-up',
    status: 'scheduled',
    reason: 'Wizyta kontrolna'
  }
];

const doctorInfo: Record<string, { name: string; specialization: string }> = {
  'd1': { name: 'dr Anna Nowak', specialization: 'Internista' },
  'd2': { name: 'dr Piotr Wiśniewski', specialization: 'Kardiolog' }
};

const PatientDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Witaj, Jan!</h1>
        <p className="text-muted-foreground">Panel pacjenta</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nadchodzące wizyty</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingVisits.length}</div>
            <p className="text-xs text-muted-foreground">zaplanowanych</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Następna wizyta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingVisits[0] ? format(new Date(upcomingVisits[0].date), 'd MMM', { locale: pl }) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingVisits[0] ? `godz. ${upcomingVisits[0].time}` : 'brak wizyt'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Umów wizytę</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/patient/book">
              <Button variant="secondary" size="sm" className="w-full">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Nowa wizyta
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nadchodzące wizyty</CardTitle>
          <CardDescription>Twoje zaplanowane wizyty</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingVisits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nie masz zaplanowanych wizyt
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingVisits.map((visit) => (
                <div 
                  key={visit.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doctorInfo[visit.doctorId]?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doctorInfo[visit.doctorId]?.specialization}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{visitTypeLabels[visit.type]}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {format(new Date(visit.date), 'd MMMM yyyy', { locale: pl })}
                    </p>
                    <p className="text-sm text-muted-foreground">godz. {visit.time}</p>
                    <Badge className="mt-1" variant="secondary">
                      {visitStatusLabels[visit.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;