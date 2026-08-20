import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { firebaseAuth, isFirebaseConfigured } from '@/firebase'

const googleProvider = new GoogleAuthProvider()

function requireFirebaseAuth() {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error('Google sign-in is unavailable because Firebase is not configured for this environment.')
  }

  return firebaseAuth
}

export async function firebaseGoogleLogin() {
  const credential = await signInWithPopup(requireFirebaseAuth(), googleProvider)
  return credential.user
}

export async function firebaseLogin(email, password) {
  const credential = await signInWithEmailAndPassword(requireFirebaseAuth(), email, password)
  return credential.user
}

export async function firebaseRegister(name, email, password) {
  const credential = await createUserWithEmailAndPassword(requireFirebaseAuth(), email, password)

  if (name) {
    await updateProfile(credential.user, {
      displayName: name
    })
  }

  return credential.user
}

export async function firebaseLogout() {
  await signOut(requireFirebaseAuth())
}
