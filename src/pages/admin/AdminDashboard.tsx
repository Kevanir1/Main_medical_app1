import { Link } from 'react-router-dom';
import { FileText, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock stats
const stats = {
  pendingApplications: 5,
  totalUsers: 234,
  activeUsers: 221,
  blockedUsers: 13,
};

const tiles = [
  {
    icon: FileText,
    label: 'Wnioski lekarzy',
    value: stats.pendingApplications,
    description: 'oczekujących na weryfikację',
    href: '/admin/applications',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: Users,
    label: 'Użytkownicy',
    value: stats.totalUsers,
    description: 'zarejestrowanych kont',
    href: '/admin/users',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const recentActivities = [
  { icon: CheckCircle, text: 'Zatwierdzono wniosek: dr Anna Nowak', time: '10 min temu', color: 'text-success' },
  { icon: AlertTriangle, text: 'Zablokowano konto: pacjent #1234', time: '1 godz. temu', color: 'text-destructive' },
  { icon: Clock, text: 'Nowy wniosek lekarza: Jan Kowalski', time: '2 godz. temu', color: 'text-warning' },
  { icon: CheckCircle, text: 'Zresetowano hasło: pacjent #5678', time: '3 godz. temu', color: 'text-success' },
];

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel administracyjny</h1>
          <p className="text-muted-foreground">Zarządzaj systemem medycznym</p>
        </div>

        {/* RODO Warning */}
        <div className="p-4 rounded-lg bg-muted border border-border flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Informacja RODO:</strong> Jako administrator nie masz wglądu w dane medyczne pacjentów (diagnozy, recepty, zalecenia).
          </p>
        </div>

        {/* Dashboard Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tiles.map((tile) => (
            <Link key={tile.href} to={tile.href}>
              <Card className="dashboard-tile h-full">
                <div className={`w-14 h-14 rounded-xl ${tile.bgColor} flex items-center justify-center`}>
                  <tile.icon className={`w-7 h-7 ${tile.color}`} />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{tile.value}</div>
                  <div className="font-medium text-foreground">{tile.label}</div>
                  <div className="text-sm text-muted-foreground">{tile.description}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Ostatnia aktywność</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{activity.text}</div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Aktywni użytkownicy</div>
                  <div className="text-2xl font-bold text-success">{stats.activeUsers}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Zablokowane konta</div>
                  <div className="text-2xl font-bold text-destructive">{stats.blockedUsers}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Oczekujące wnioski</div>
                  <div className="text-2xl font-bold text-warning">{stats.pendingApplications}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default AdminDashboard;