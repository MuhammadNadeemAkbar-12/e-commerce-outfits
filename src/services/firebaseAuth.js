import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { firebaseAuth } from '@/firebase'

const googleProvider = new GoogleAuthProvider()

export async function firebaseGoogleLogin() {
  const credential = await signInWithPopup(firebaseAuth, googleProvider)
  return credential.user
}

export async function firebaseLogin(email, password) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
  return credential.user
}

export async function firebaseRegister(name, email, password) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)

  if (name) {
    await updateProfile(credential.user, {
      displayName: name
    })
  }

  return credential.user
}

export async function firebaseLogout() {
  await signOut(firebaseAuth)
}
