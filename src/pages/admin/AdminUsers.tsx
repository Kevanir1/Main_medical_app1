import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, UserRole, UserStatus } from '@/types/admin';
import { Search, Lock, Trash2, GitMerge, KeyRound, MoreHorizontal, Filter, X, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockUsers: User[] = [
  { id: '1', firstName: 'Anna', lastName: 'Nowak', email: 'anna.nowak@example.com', role: 'patient', status: 'active', createdAt: '2024-01-15' },
  { id: '2', firstName: 'Jan', lastName: 'Kowalski', email: 'jan.kowalski@example.com', role: 'doctor', status: 'active', createdAt: '2024-01-10' },
  { id: '3', firstName: 'Maria', lastName: 'Wiśniewska', email: 'maria.w@example.com', role: 'patient', status: 'blocked', createdAt: '2024-01-08' },
  { id: '4', firstName: 'Piotr', lastName: 'Zieliński', email: 'piotr.z@example.com', role: 'doctor', status: 'active', createdAt: '2024-01-05' },
  { id: '5', firstName: 'Katarzyna', lastName: 'Dąbrowska', email: 'katarzyna.d@example.com', role: 'patient', status: 'active', createdAt: '2024-01-03' },
  { id: '6', firstName: 'Tomasz', lastName: 'Lewandowski', email: 'tomasz.l@example.com', role: 'admin', status: 'active', createdAt: '2023-12-20' },
];

type ModalType = 'block' | 'delete' | 'merge' | 'reset' | null;

const roleLabels: Record<UserRole, string> = {
  patient: 'Pacjent',
  doctor: 'Lekarz',
  admin: 'Admin',
};

const statusLabels: Record<UserStatus, string> = {
  active: 'Aktywny',
  blocked: 'Zablokowany',
};

export const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [secondaryUser, setSecondaryUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openModal = (type: ModalType, user: User) => {
    setSelectedUser(user);
    setModalType(type);
    setReason('');
    setSecondaryUser(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setSecondaryUser(null);
    setReason('');
  };

  const handleBlock = async () => {
    if (!selectedUser || !reason.trim()) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUsers(prev => prev.map(u => 
      u.id === selectedUser.id ? { ...u, status: 'blocked' as UserStatus } : u
    ));
    
    toast({
      title: "Konto zablokowane",
      description: `Konto użytkownika ${selectedUser.firstName} ${selectedUser.lastName} zostało zablokowane.`,
    });
    
    setIsProcessing(false);
    closeModal();
  };

  const handleDelete = async () => {
    if (!selectedUser || !reason.trim()) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    
    toast({
      title: "Konto usunięte",
      description: `Konto użytkownika ${selectedUser.firstName} ${selectedUser.lastName} zostało usunięte.`,
      variant: "destructive",
    });
    
    setIsProcessing(false);
    closeModal();
  };

  const handleMerge = async () => {
    if (!selectedUser || !secondaryUser) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUsers(prev => prev.filter(u => u.id !== secondaryUser.id));
    
    toast({
      title: "Konta scalone",
      description: `Konto ${secondaryUser.firstName} ${secondaryUser.lastName} zostało scalone z ${selectedUser.firstName} ${selectedUser.lastName}.`,
    });
    
    setIsProcessing(false);
    closeModal();
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Hasło zresetowane",
      description: `Link do resetu hasła został wysłany na ${selectedUser.email}.`,
    });
    
    setIsProcessing(false);
    closeModal();
  };

  const availableForMerge = users.filter(u => 
    u.id !== selectedUser?.id && 
    u.role === selectedUser?.role
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Zarządzanie użytkownikami</h1>
          <p className="text-muted-foreground">Lista wszystkich użytkowników systemu</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po imieniu, nazwisku lub email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Rola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie role</SelectItem>
              <SelectItem value="patient">Pacjent</SelectItem>
              <SelectItem value="doctor">Lekarz</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              <SelectItem value="active">Aktywny</SelectItem>
              <SelectItem value="blocked">Zablokowany</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users table */}
        <div className="medical-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Użytkownik</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Rola</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Data rejestracji</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant="outline"
                        className={user.status === 'active' ? 'status-active' : 'status-blocked'}
                      >
                        {statusLabels[user.status]}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'active' && (
                            <DropdownMenuItem onClick={() => openModal('block', user)}>
                              <Lock className="w-4 h-4 mr-2" />
                              Zablokuj
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openModal('delete', user)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Usuń
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openModal('merge', user)}>
                            <GitMerge className="w-4 h-4 mr-2" />
                            Scal
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openModal('reset', user)}>
                            <KeyRound className="w-4 h-4 mr-2" />
                            Reset hasła
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              Nie znaleziono użytkowników spełniających kryteria
            </div>
          )}
        </div>

        {/* Block Modal */}
        <Dialog open={modalType === 'block'} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-warning" />
                Blokada konta
              </DialogTitle>
              <DialogDescription>
                Blokujesz konto: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="blockReason" className="form-label">Powód blokady</Label>
              <Textarea
                id="blockReason"
                placeholder="Podaj powód blokady konta..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal} disabled={isProcessing}>
                Anuluj
              </Button>
              <Button onClick={handleBlock} disabled={!reason.trim() || isProcessing}>
                {isProcessing ? 'Blokowanie...' : 'Potwierdź blokadę'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={modalType === 'delete'} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Usuwanie konta
              </DialogTitle>
              <DialogDescription>
                Usuwasz konto: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Uwaga: Ta operacja jest nieodwracalna!
                </p>
              </div>
              <Label htmlFor="deleteReason" className="form-label">Powód usunięcia</Label>
              <Textarea
                id="deleteReason"
                placeholder="Podaj powód usunięcia konta..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal} disabled={isProcessing}>
                Anuluj
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={!reason.trim() || isProcessing}>
                {isProcessing ? 'Usuwanie...' : 'Potwierdź usunięcie'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Merge Modal */}
        <Dialog open={modalType === 'merge'} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-primary" />
                Scalanie kont
              </DialogTitle>
              <DialogDescription>
                Konto główne: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="form-label">Wybierz konto do scalenia</Label>
              <Select value={secondaryUser?.id || ''} onValueChange={(id) => setSecondaryUser(users.find(u => u.id === id) || null)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Wybierz użytkownika..." />
                </SelectTrigger>
                <SelectContent>
                  {availableForMerge.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {secondaryUser && (
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-2">Podsumowanie:</p>
                  <p className="text-sm">
                    Wszystkie wizyty i dane z konta <strong>{secondaryUser.firstName} {secondaryUser.lastName}</strong> zostaną 
                    przeniesione do konta <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal} disabled={isProcessing}>
                Anuluj
              </Button>
              <Button onClick={handleMerge} disabled={!secondaryUser || isProcessing}>
                {isProcessing ? 'Scalanie...' : 'Scal konta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Modal */}
        <Dialog open={modalType === 'reset'} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Reset hasła
              </DialogTitle>
              <DialogDescription>
                Resetujesz hasło dla: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Link do resetu hasła zostanie wysłany na adres email: <strong>{selectedUser?.email}</strong>
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal} disabled={isProcessing}>
                Anuluj
              </Button>
              <Button onClick={handleResetPassword} disabled={isProcessing}>
                {isProcessing ? 'Wysyłanie...' : 'Wyślij link resetu'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
