import { useState } from 'react';
import { Bell, Check, X, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Notification {
  id: string;
  type: 'visit' | 'prescription' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Mock notifications for demonstration
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'visit',
    title: 'Nowa wizyta',
    message: 'Pacjent Jan Nowak umówił wizytę na 15.01.2024',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Przypomnienie',
    message: 'Za 30 minut wizyta z pacjentem Anna Kowalska',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: '3',
    type: 'prescription',
    title: 'E-recepta wystawiona',
    message: 'Recepta dla Piotr Wiśniewski została wystawiona',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Aktualizacja systemu',
    message: 'System zostanie zaktualizowany o 23:00',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'visit':
      return Calendar;
    case 'prescription':
      return FileText;
    case 'reminder':
      return AlertCircle;
    case 'system':
    default:
      return Bell;
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Teraz';
  if (minutes < 60) return `${minutes} min temu`;
  if (hours < 24) return `${hours} godz. temu`;
  return `${days} dni temu`;
};

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Powiadomienia</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              onClick={markAllAsRead}
            >
              Oznacz wszystkie jako przeczytane
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Brak powiadomień
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${
                    !notification.read ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      !notification.read ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${
                        !notification.read ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;