import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DoctorApplication, ApplicationStatus } from '@/types/admin';
import { Check, X, Eye, User, Mail, Phone, Calendar, Stethoscope, CreditCard, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

// Mock data
const mockApplications: DoctorApplication[] = [
  { 
    id: '1', 
    firstName: 'Jan', 
    lastName: 'Kowalski', 
    email: 'jan.kowalski@example.com',
    phone: '+48 123 456 789',
    pesel: '85012012345',
    birthDate: '1985-01-20',
    specialization: 'Kardiologia',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00',
  },
  { 
    id: '2', 
    firstName: 'Anna', 
    lastName: 'Nowak', 
    email: 'anna.nowak@example.com',
    phone: '+48 987 654 321',
    pesel: '90062512345',
    birthDate: '1990-06-25',
    specialization: 'Neurologia',
    status: 'pending',
    submittedAt: '2024-01-14T14:20:00',
  },
  { 
    id: '3', 
    firstName: 'Piotr', 
    lastName: 'Wiśniewski', 
    email: 'piotr.w@example.com',
    phone: '+48 555 666 777',
    pesel: '88030312345',
    birthDate: '1988-03-03',
    specialization: 'Ortopedia',
    status: 'approved',
    submittedAt: '2024-01-10T09:15:00',
  },
  { 
    id: '4', 
    firstName: 'Maria', 
    lastName: 'Zielińska', 
    email: 'maria.z@example.com',
    phone: '+48 111 222 333',
    pesel: '92111112345',
    birthDate: '1992-11-11',
    specialization: 'Dermatologia',
    status: 'rejected',
    submittedAt: '2024-01-08T11:45:00',
  },
];

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'Oczekujący',
  approved: 'Zatwierdzony',
  rejected: 'Odrzucony',
};

export const AdminApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<DoctorApplication[]>(mockApplications);
  const [selectedApp, setSelectedApp] = useState<DoctorApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (app: DoctorApplication) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setApplications(prev => prev.map(a => 
      a.id === app.id ? { ...a, status: 'approved' as ApplicationStatus } : a
    ));
    
    toast({
      title: "Wniosek zatwierdzony",
      description: `Konto lekarza ${app.firstName} ${app.lastName} zostało utworzone.`,
    });
    
    setIsProcessing(false);
    setShowDetailsModal(false);
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim()) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setApplications(prev => prev.map(a => 
      a.id === selectedApp.id ? { ...a, status: 'rejected' as ApplicationStatus } : a
    ));
    
    toast({
      title: "Wniosek odrzucony",
      description: `Wniosek ${selectedApp.firstName} ${selectedApp.lastName} został odrzucony.`,
      variant: "destructive",
    });
    
    setIsProcessing(false);
    setShowRejectModal(false);
    setShowDetailsModal(false);
    setRejectReason('');
  };

  const openDetails = (app: DoctorApplication) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
  };

  const openReject = () => {
    setShowDetailsModal(false);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants = {
      pending: 'status-pending',
      approved: 'status-active',
      rejected: 'status-blocked',
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const processedApps = applications.filter(a => a.status !== 'pending');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wnioski rejestracji lekarzy</h1>
          <p className="text-muted-foreground">Przeglądaj i zarządzaj wnioskami o konta lekarzy</p>
        </div>

        {/* Pending Applications */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Oczekujące wnioski ({pendingApps.length})
          </h2>
          {pendingApps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Brak oczekujących wniosków
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApps.map((app) => (
                <Card key={app.id} className="medical-card-hover">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">
                            {app.firstName} {app.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{app.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{app.specialization}</Badge>
                            {getStatusBadge(app.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground sm:text-right">
                        <div>Złożono:</div>
                        <div>{new Date(app.submittedAt).toLocaleDateString('pl-PL', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetails(app)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Szczegóły
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(app)}
                          disabled={isProcessing}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Zatwierdź
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRejectModal(true);
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Odrzuć
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Processed Applications */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Historia wniosków</h2>
          <div className="medical-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Lekarz</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Specjalizacja</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Data złożenia</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {processedApps.map((app) => (
                    <tr key={app.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-foreground">{app.firstName} {app.lastName}</div>
                        <div className="text-sm text-muted-foreground">{app.email}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{app.specialization}</Badge>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(app.submittedAt).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetails(app)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {processedApps.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                Brak przetworzonych wniosków
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Szczegóły wniosku</DialogTitle>
              <DialogDescription>
                Wniosek o konto lekarza
              </DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{selectedApp.firstName} {selectedApp.lastName}</div>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                </div>
                
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium">{selectedApp.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Telefon</div>
                      <div className="font-medium">{selectedApp.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">PESEL</div>
                      <div className="font-medium">{selectedApp.pesel}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Data urodzenia</div>
                      <div className="font-medium">{new Date(selectedApp.birthDate).toLocaleDateString('pl-PL')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Stethoscope className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Specjalizacja</div>
                      <div className="font-medium">{selectedApp.specialization}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedApp?.status === 'pending' && (
                <>
                  <Button variant="outline" onClick={openReject}>
                    <X className="w-4 h-4 mr-2" />
                    Odrzuć
                  </Button>
                  <Button onClick={() => selectedApp && handleApprove(selectedApp)} disabled={isProcessing}>
                    <Check className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Zatwierdzanie...' : 'Zatwierdź'}
                  </Button>
                </>
              )}
              {selectedApp?.status !== 'pending' && (
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Zamknij
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <X className="w-5 h-5" />
                Odrzucenie wniosku
              </DialogTitle>
              <DialogDescription>
                Odrzucasz wniosek: <strong>{selectedApp?.firstName} {selectedApp?.lastName}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="rejectReason" className="form-label">Powód odrzucenia</Label>
              <Textarea
                id="rejectReason"
                placeholder="Podaj powód odrzucenia wniosku (np. niezgodność danych)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={isProcessing}>
                Anuluj
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={!rejectReason.trim() || isProcessing}
              >
                {isProcessing ? 'Odrzucanie...' : 'Potwierdź odrzucenie'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;
