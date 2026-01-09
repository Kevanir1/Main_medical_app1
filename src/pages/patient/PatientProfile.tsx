import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { usePatient } from "@/contexts/PatientContext";

const PatientProfile = () => {
  const { profile, setProfile } = usePatient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);

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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dane osobowe</CardTitle>
            <CardDescription>Twoje podstawowe informacje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <div>
                  <p className="text-muted-foreground">Data urodzenia</p>
                  <p className="font-medium">
                    {format(new Date(profile.birthDate), 'd MMMM yyyy', { locale: pl })}
                  </p>
                </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adres</CardTitle>
            <CardDescription>Twój adres zamieszkania</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label>Ulica i numer</Label>
                  <Input 
                    value={editData.street}
                    onChange={(e) => setEditData({ ...editData, street: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kod pocztowy</Label>
                    <Input 
                      value={editData.postalCode}
                      onChange={(e) => setEditData({ ...editData, postalCode: e.target.value })}
                      placeholder="00-000"
                      maxLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Miasto</Label>
                    <Input 
                      value={editData.city}
                      onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      maxLength={50}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Ulica</p>
                  <p className="font-medium">{profile.street}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kod pocztowy</p>
                  <p className="font-medium">{profile.postalCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Miasto</p>
                  <p className="font-medium">{profile.city}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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