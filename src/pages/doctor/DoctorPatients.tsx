import { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Calendar, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Patient } from '@/types/patient';
import apiClient from '@/lib/apiClient';
import { useLocalStorageUser } from '@/hooks/use-user';
import { getAppointmentsByDoctor } from '@/lib/medical-api/appointment';
import { getPatient } from '@/lib/medical-api/patient';

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  const { doctor_id } = useLocalStorageUser();

  useEffect(() => {
    const loadPatients = async () => {
      try {
        if (!doctor_id) return;

        const res = await getAppointmentsByDoctor(doctor_id);
        if (res && res.status === 'success') {
          const appointments = res.appointments || [];
          const uniquePatientIds = Array.from(new Set(appointments.map((a: any) => a.patient_id)));
          const patientsArr = await Promise.all(uniquePatientIds.map(async (pid: any) => {
            try {
              const p = await getPatient(pid);
              const pat = p.patient;
              return {
                id: String(pat.id),
                firstName: pat.first_name || '',
                lastName: pat.last_name || '',
                pesel: pat.pesel || '',
                birthDate: pat.birth_date || '',
                phone: pat.phone || '',
                email: pat.email || undefined,
              } as Patient;
            } catch (e) {
              return { id: String(pid), firstName: 'Anon', lastName: '', pesel: '', birthDate: '', phone: '' } as Patient;
            }
          }));
          setPatients(patientsArr);
        }
      } catch (e) { console.error(e); }
    };
    loadPatients();
  }, [doctor_id]);

  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      patient.pesel.includes(query) ||
      patient.phone.includes(query)
    );
  });

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pacjenci</h1>
            <p className="text-muted-foreground">Lista Twoich pacjentów</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po imieniu, nazwisku, PESEL lub telefonie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patients list */}
        <Card>
          <CardHeader>
            <CardTitle>Lista pacjentów ({filteredPatients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nie znaleziono pacjentów</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient)}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>PESEL: {patient.pesel}</span>
                          <span>•</span>
                          <span>{calculateAge(patient.birthDate)} lat</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {patient.phone}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient details dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Dane pacjenta</DialogTitle>
            </DialogHeader>
            
            {selectedPatient && (
              <div className="space-y-6">
                {/* Patient avatar and name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <Badge variant="secondary">
                      {calculateAge(selectedPatient.birthDate)} lat
                    </Badge>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefon</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                  </div>

                  {selectedPatient.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedPatient.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data urodzenia</p>
                      <p className="font-medium">{selectedPatient.birthDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">PESEL</p>
                      <p className="font-medium">{selectedPatient.pesel}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Umów wizytę
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Historia
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}