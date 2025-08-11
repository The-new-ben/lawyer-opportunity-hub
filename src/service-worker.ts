import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({url}) => url.pathname.startsWith('/rest/v1/cases'),
  new NetworkFirst({ cacheName: 'case-data' })
)

registerRoute(
  ({request}) => ['style','script','image','font'].includes(request.destination),
  new CacheFirst({ cacheName: 'assets' })
)

const notesQueue = new BackgroundSyncPlugin('notes-sync', { maxRetentionTime: 1440 })
registerRoute(
  ({url}) => url.pathname.includes('/notes-sync'),
  new NetworkOnly({ plugins: [notesQueue] }),
  'POST'
)

self.addEventListener('push', e => {
  const data = e.data?.json() || {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'Notification', { body: data.body, icon: '/favicon.ico' })
  )
})
