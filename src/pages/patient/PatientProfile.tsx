import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { usePatient } from "@/contexts/PatientContext";
import { useLocalStorageUser } from '@/hooks/use-user';
import { getPatient as getPatientById } from '@/lib/medical-api/patient';
import * as userApi from '@/lib/medical-api/user';
import { getMe } from '@/lib/medical-api/auth';

const PatientProfile = () => {
  const { profile, setProfile } = usePatient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { patient_id, user_id } = useLocalStorageUser();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      let meUser: any = null;
      let meError: string | null = null;
      try {
        const meRes = await getMe();
        if (meRes && meRes.status === 'success' && meRes.user) {
          meUser = meRes.user;
        }
      } catch (ue: any) {
        meError = ue?.message || 'Nie udało się pobrać danych użytkownika (/auth/me)';
        // continue, we'll try to fetch patient data regardless
      }
      try {
        // Prefer patient_id if available
        if (patient_id) {
          const res = await getPatientById(patient_id as number);
          if (res && res.status === 'success' && res.patient) {
            const p = res.patient;
            setProfile({
              firstName: p.first_name || '',
              lastName: p.last_name || '',
              pesel: p.pesel || '',
              birthDate: p.birth_date || '',
              phone: p.phone || '',
              email: p.email || (meUser?.email || '')
            });
            setEditData({
              firstName: p.first_name || '',
              lastName: p.last_name || '',
              pesel: p.pesel || '',
              birthDate: p.birth_date || '',
              phone: p.phone || '',
              email: p.email || (meUser?.email || '')
            });
            setLoading(false);
            return;
          }
        }

        // Fallback: try to get patient via user controller by user_id
        if (user_id) {
          const res = await userApi.getPatient(user_id as number);
          if (res && res.status === 'success' && res.patient) {
            const p = res.patient;
            setProfile({
              firstName: p.first_name || '',
              lastName: p.last_name || '',
              pesel: p.pesel || '',
              birthDate: p.birth_date || '',
              phone: p.phone || '',
              email: p.email || (meUser?.email || '')
            });
            setEditData({
              firstName: p.first_name || '',
              lastName: p.last_name || '',
              pesel: p.pesel || '',
              birthDate: p.birth_date || '',
              phone: p.phone || '',
              email: p.email || (meUser?.email || '')
            });
            setLoading(false);
            return;
          }
        }

        // If we reached here, neither patient_id nor user_id yielded patient data
        // If we did get /auth/me, we can at least show user email
        if (meUser) {
          setProfile(prev => ({ ...prev, email: meUser.email || '' }));
          setEditData(prev => ({ ...prev, email: meUser.email || '' }));
          setLoading(false);
          return;
        }

        setError('Brak danych pacjenta oraz brak dostępu do /auth/me — nie można pobrać profilu pacjenta (TODO: add user endpoint or ensure patient_id is stored on login)');
      } catch (e: any) {
        setError(e?.message || 'Błąd pobierania profilu pacjenta');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    // Basic validation
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      toast.error("Imię i nazwisko są wymagane");
      return;
    }
    if (!editData.phone.trim() || editData.phone.length < 9) {
      toast.error("Podaj prawidłowy numer telefonu");
      return;
    }
    if (!editData.email.trim() || !editData.email.includes('@')) {
      toast.error("Podaj prawidłowy adres email");
      return;
    }
    
    setProfile(editData);
    setIsEditing(false);
    toast.success("Dane zostały zaktualizowane");
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mój profil</h1>
        <p className="text-muted-foreground">Zarządzaj swoimi danymi osobowymi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane osobowe</CardTitle>
          <CardDescription>Twoje podstawowe informacje</CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div>Ładowanie profilu...</div>
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : (
              <>
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Imię *</Label>
                        <Input 
                          value={editData.firstName}
                          onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nazwisko *</Label>
                        <Input 
                          value={editData.lastName}
                          onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          maxLength={50}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon *</Label>
                      <Input 
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                        placeholder="123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input 
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        maxLength={100}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Imię i nazwisko</p>
                      <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">PESEL</p>
                      <p className="font-medium">{profile.pesel}</p>
                    </div>
                    {profile.birthDate && (
                      <div>
                        <p className="text-muted-foreground">Data urodzenia</p>
                        <p className="font-medium">
                          {format(new Date(profile.birthDate), 'd MMMM yyyy', { locale: pl })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Telefon</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                )}
              </>
            )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>Anuluj</Button>
            <Button onClick={handleSave}>Zapisz zmiany</Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edytuj dane</Button>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;