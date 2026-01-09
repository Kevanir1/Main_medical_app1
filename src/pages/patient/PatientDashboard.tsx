import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CalendarPlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { visitTypeLabels, visitStatusLabels } from "@/types/patient";
import { usePatient } from "@/contexts/PatientContext";

const PatientDashboard = () => {
  const { upcomingAppointments, isLoading, profile } = usePatient();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Ładowanie danych...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Witaj, {profile.firstName || 'Pacjencie'}!</h1>
        <p className="text-muted-foreground">Panel pacjenta</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nadchodzące wizyty</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
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
              {upcomingAppointments[0] ? format(new Date(upcomingAppointments[0].appointment_date), 'd MMM', { locale: pl }) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingAppointments[0] ? `godz. ${format(new Date(upcomingAppointments[0].appointment_date), 'HH:mm')}` : 'brak wizyt'}
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
          {upcomingAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nie masz zaplanowanych wizyt
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        dr {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor?.specialization}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Konsultacja</Badge>
                        <Badge variant="secondary">{appointment.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {format(new Date(appointment.appointment_date), 'd MMMM yyyy', { locale: pl })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      godz. {format(new Date(appointment.appointment_date), 'HH:mm')}
                    </p>
                    <Badge className="mt-1" variant="secondary">
                      {appointment.status}
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