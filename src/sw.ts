/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

// Precache assets
cleanupOutdatedCaches()

// Manifest injection by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST || [])

// Network-only para API calls (pero no deberían existir)
// Esta es una red de seguridad: si por algún motivo se intenta llamar a /api/*,
// solo funciona si hay red, nunca devolvemos cached falso.
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly(),
)

// Handle install
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  self.skipWaiting()
})

// Handle activate
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(self.clients.claim())
})

// Handle fetch - precache-first
self.addEventListener('fetch', (event) => {
  // Solo GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Precache ya maneja el routing
  // Solo logeamos para auditoría offline
  const url = new URL(event.request.url)

  if (url.origin !== self.location.origin) {
    console.warn(`[SW] Petición externa bloqueada: ${url.href}`)
    return
  }
})

console.log('[SW] Service Worker loaded successfully')
