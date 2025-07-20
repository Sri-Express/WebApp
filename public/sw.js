
// =============================================================================
// 5. CREATE: PublicPage/public/sw.js (SERVICE WORKER)
// =============================================================================
// Create this file in PublicPage/public/sw.js

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message || data.body,
      icon: '/emergency-icon.png',
      badge: '/emergency-badge.png',
      tag: data.tag || 'emergency',
      requireInteraction: data.priority === 'critical',
      actions: [
        {
          action: 'view',
          title: 'View Emergency'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Emergency Alert', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/sysadmin/emergency')
    );
  }
});
