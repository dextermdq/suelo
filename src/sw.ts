/// <reference lib="webworker" />
// @ts-ignore
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
// @ts-ignore
import { registerRoute } from 'workbox-routing'
// @ts-ignore
import { NetworkOnly } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST?: Array<{ url: string; revision: string }>
}

// Precache assets
cleanupOutdatedCaches()

// Manifest injection by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST || [])

// Network-only para API calls (pero no deberían existir)
// Esta es una red de seguridad: si por algún motivo se intenta llamar a /api/*,
// solo funciona si hay red, nunca devolvemos cached falso.
registerRoute(
  ({ url }: { url: URL }) => url.pathname.startsWith('/api/'),
  new NetworkOnly(),
)

// Handle install
self.addEventListener('install', (_event: ExtendableEvent) => {
  console.log('[SW] Installing...')
  self.skipWaiting()
})

// Handle activate
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating...')
  event.waitUntil(self.clients.claim())
})

// Handle fetch - precache-first
self.addEventListener('fetch', (event: FetchEvent) => {
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
