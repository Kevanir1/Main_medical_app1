import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, X } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import { Visit, visitTypeLabels, visitStatusLabels } from "@/types/patient";

const allVisits: Visit[] = [
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
  },
  {
    id: '3',
    patientId: 'p1',
    patient: { id: 'p1', firstName: 'Jan', lastName: 'Kowalski', pesel: '90010112345', birthDate: '1990-01-01', phone: '123456789' },
    doctorId: 'd1',
    date: format(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    type: 'consultation',
    status: 'completed',
    reason: 'Badania okresowe',
    notes: 'Zalecono badania laboratoryjne'
  },
  {
    id: '4',
    patientId: 'p1',
    patient: { id: 'p1', firstName: 'Jan', lastName: 'Kowalski', pesel: '90010112345', birthDate: '1990-01-01', phone: '123456789' },
    doctorId: 'd2',
    date: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    time: '11:00',
    duration: 45,
    type: 'procedure',
    status: 'completed',
    reason: 'EKG',
    notes: 'Wynik prawidłowy'
  }
];

const doctorInfo: Record<string, { name: string; specialization: string }> = {
  'd1': { name: 'dr Anna Nowak', specialization: 'Internista' },
  'd2': { name: 'dr Piotr Wiśniewski', specialization: 'Kardiolog' }
};

const PatientVisits = () => {
  const [visits, setVisits] = useState(allVisits);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const upcomingVisits = visits.filter(v => v.status === 'scheduled');
  const pastVisits = visits.filter(v => v.status === 'completed' || v.status === 'cancelled' || v.status === 'no-show');

  const handleCancelClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (selectedVisit) {
      setVisits(visits.map(v => 
        v.id === selectedVisit.id ? { ...v, status: 'cancelled' as const } : v
      ));
      toast.success("Wizyta została odwołana");
    }
    setCancelDialogOpen(false);
    setSelectedVisit(null);
  };

  const VisitCard = ({ visit, showCancel = false }: { visit: Visit; showCancel?: boolean }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
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
            <span className="text-sm text-muted-foreground">{visit.reason}</span>
          </div>
          {visit.notes && (
            <p className="text-sm text-muted-foreground mt-1 italic">
              Notatka: {visit.notes}
            </p>
          )}
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-2">
        <p className="font-medium">
          {format(new Date(visit.date), 'd MMMM yyyy', { locale: pl })}
        </p>
        <p className="text-sm text-muted-foreground">godz. {visit.time}</p>
        <Badge 
          variant={visit.status === 'cancelled' ? 'destructive' : 'secondary'}
        >
          {visitStatusLabels[visit.status]}
        </Badge>
        {showCancel && visit.status === 'scheduled' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={() => handleCancelClick(visit)}
          >
            <X className="w-4 h-4 mr-1" />
            Odwołaj
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moje wizyty</h1>
        <p className="text-muted-foreground">Historia i nadchodzące wizyty</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Nadchodzące ({upcomingVisits.length})</TabsTrigger>
          <TabsTrigger value="past">Historia ({pastVisits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Zaplanowane wizyty</CardTitle>
              <CardDescription>Możesz odwołać wizytę do 24h przed terminem</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingVisits.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nie masz zaplanowanych wizyt
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingVisits.map(visit => (
                    <VisitCard key={visit.id} visit={visit} showCancel />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historia wizyt</CardTitle>
              <CardDescription>Twoje poprzednie wizyty</CardDescription>
            </CardHeader>
            <CardContent>
              {pastVisits.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Brak historii wizyt
                </p>
              ) : (
                <div className="space-y-4">
                  {pastVisits.map(visit => (
                    <VisitCard key={visit.id} visit={visit} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odwołaj wizytę</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz odwołać wizytę u {selectedVisit && doctorInfo[selectedVisit.doctorId]?.name} w dniu{" "}
              {selectedVisit && format(new Date(selectedVisit.date), 'd MMMM yyyy', { locale: pl })}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Odwołaj wizytę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientVisits;