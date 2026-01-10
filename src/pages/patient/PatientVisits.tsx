import { useEffect, useState } from "react";
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
import { useLocalStorageUser } from "@/hooks/use-user";
import { getAppointmentsByPatient } from "@/lib/medical-api/appointment";
import { getDoctor } from "@/lib/medical-api/doctor/doctor";

// Data loaded from API. Real data replaces former hardcoded mocks.

const PatientVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorMap, setDoctorMap] = useState<Record<string, { name: string; specialization: string }>>({});

  const { patient_id } = useLocalStorageUser();

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (!patient_id) {
        setError('Brak patient_id w kontekście - TODO: upewnij się, że auth zapisuje patient_id');
        setLoading(false);
        return;
      }

      try {
        const res = await getAppointmentsByPatient(patient_id as number);
        let appts: any[] = [];
        if (res && res.status === 'success') appts = res.appointments || [];
        else if (Array.isArray(res)) appts = res;

        const mapped: Visit[] = appts.map((a: any) => {
          const dateObj = new Date(a.appointment_date);
          return {
            id: String(a.id),
            patientId: String(a.patient_id),
            patient: { id: String(a.patient_id), firstName: '', lastName: '', pesel: '', birthDate: '', phone: '' },
            doctorId: String(a.doctor_id),
            date: dateObj.toISOString().slice(0,10),
            time: dateObj.toTimeString().slice(0,5),
            duration: a.duration || 30,
            type: a.type || 'consultation',
            status: a.status || 'scheduled',
            reason: a.notes || ''
          } as Visit;
        });

        setVisits(mapped);

        const uniqueDoctorIds = Array.from(new Set(mapped.map(v => Number(v.doctorId)).filter(Boolean)));
        const toFetch = uniqueDoctorIds.filter(id => !doctorMap[String(id)]);
        for (const id of toFetch) {
          try {
            const dres = await getDoctor(Number(id));
            let doc: any = null;
            if (dres && dres.status === 'success') doc = dres.doctor;
            else if (dres && dres.doctor) doc = dres.doctor;
            if (doc) {
              setDoctorMap(prev => ({ ...prev, [String(id)]: { name: `${doc.first_name || ''} ${doc.last_name || ''}`.trim(), specialization: doc.specialization || '' } }));
            }
          } catch (e) {
            console.error('Failed to load doctor', id, e);
          }
        }
      } catch (e: any) {
        setError(e?.message || 'Błąd pobierania wizyt');
      }
      setLoading(false);
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient_id]);

  const VisitCard = ({ visit, showCancel = false }: { visit: Visit; showCancel?: boolean }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-medium">{doctorMap[visit.doctorId]?.name || 'Lekarz'}</p>
          <p className="text-sm text-muted-foreground">
            {doctorMap[visit.doctorId]?.specialization || ''}
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

      {loading ? (
        <Card>
          <CardContent>Ładowanie wizyt...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-destructive">{error}</CardContent>
        </Card>
      ) : null}

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
              Czy na pewno chcesz odwołać wizytę u {selectedVisit && (doctorMap[selectedVisit.doctorId]?.name || 'Lekarz')} w dniu{" "}
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