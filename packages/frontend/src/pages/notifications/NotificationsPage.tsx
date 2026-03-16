import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationsService } from '../../services';
import { Notification } from '../../types';

const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getAll(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications: Notification[] = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-500 mt-1">{unreadCount} unread notifications</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="btn-secondary flex items-center gap-2"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-xl animate-pulse border" />
          ))
        ) : notifications.length === 0 ? (
          <div className="card text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card flex items-start gap-4 transition-colors ${
                !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markReadMutation.mutate(notification.id)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded flex-shrink-0"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
