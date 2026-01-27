// components/NotificationBanner.jsx
// In-app notification system (replaces email notifications)

import { useState, useEffect } from 'react';

export default function NotificationBanner({ documentId }) {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check for notifications in session storage
    const storedNotifications = sessionStorage.getItem('vdc_notifications');
    if (storedNotifications) {
      try {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed);
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
    sessionStorage.removeItem('vdc_notifications');
    setVisible(false);
  };

  if (!visible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification, index) => (
        <div key={index} className={`notification notification-${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' && '?'}
            {notification.type === 'warning' && '?'}
            {notification.type === 'info' && '?'}
            {notification.type === 'error' && '?'}
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
            {notification.details && (
              <div className="notification-details">{notification.details}</div>
            )}
          </div>
          <button onClick={clearNotifications} className="notification-close">
            ?
          </button>
        </div>
      ))}

      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          max-width: 400px;
        }

        .notification {
          background: #1e293b;
          border-left: 4px solid;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification-success {
          border-left-color: #10b981;
        }

        .notification-warning {
          border-left-color: #f59e0b;
        }

        .notification-info {
          border-left-color: #3b82f6;
        }

        .notification-error {
          border-left-color: #ef4444;
        }

        .notification-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .notification-success .notification-icon {
          color: #10b981;
        }

        .notification-warning .notification-icon {
          color: #f59e0b;
        }

        .notification-info .notification-icon {
          color: #3b82f6;
        }

        .notification-error .notification-icon {
          color: #ef4444;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          color: #fff;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .notification-message {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .notification-details {
          color: #64748b;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          font-style: italic;
        }

        .notification-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-close:hover {
          color: #fff;
        }
      `}</style>
    </div>
  );
}

// Helper function to add notifications
export function addNotification(type, title, message, details = null) {
  const notification = {
    type,
    title,
    message,
    details,
    timestamp: new Date().toISOString()
  };

  const existing = sessionStorage.getItem('vdc_notifications');
  const notifications = existing ? JSON.parse(existing) : [];
  notifications.push(notification);
  
  // Keep only last 5 notifications
  if (notifications.length > 5) {
    notifications.shift();
  }

  sessionStorage.setItem('vdc_notifications', JSON.stringify(notifications));
  
  // Trigger re-render by dispatching event
  window.dispatchEvent(new Event('vdc_notification_added'));
}
