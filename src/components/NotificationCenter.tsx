import { useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const NotificationCenter = () => {
  useEffect(() => {
    const init = async () => {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const app = initializeApp(firebaseConfig)
        const messaging = getMessaging(app)
        try {
          const registration = await navigator.serviceWorker.ready
          await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: registration })
        } catch {}
      }
    }
    init()
  }, [])
  return null
}
