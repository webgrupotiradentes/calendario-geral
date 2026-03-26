import { useCallback, useEffect, useState } from 'react';
import { CalendarEvent } from '@/types/calendar';

export function useDesktopNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações desktop');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    }

    setPermission(Notification.permission);
    return false;
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico', 
        ...options,
      });
    }
  }, []);

  const notifyEvents = useCallback(async (events: CalendarEvent[]) => {
    if (events.length === 0) return false;

    if (Notification.permission === 'default') {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;
    }

    if (Notification.permission !== 'granted') return false;

    if (events.length === 1) {
      const event = events[0];
      const timeStr = event.allDay ? 'Dia todo' : `Às ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`;
      sendNotification(`Lembrete: ${event.title}`, {
        body: `${timeStr}\n${event.description || ''}`,
        tag: 'event-today'
      });
    } else {
      const eventTitles = events.map(e => `• ${e.title}`).join('\n');
      sendNotification(`Você tem ${events.length} eventos hoje`, {
        body: eventTitles,
        tag: 'events-today'
      });
    }
    return true;
  }, [requestPermission, sendNotification]);

  return { permission, requestPermission, sendNotification, notifyEvents };
}
