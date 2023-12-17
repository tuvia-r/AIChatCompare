import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, authState } from '@angular/fire/auth';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import * as firebase from 'firebase/auth';
import FirebaseUser = firebase.User;
import { Router } from '@angular/router';
import { getObservableValue } from '../utils/get-observable-value';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private provider = new GoogleAuthProvider();
  readonly state$ = new BehaviorSubject<FirebaseUser | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.state$.next(user);
      } else {
        this.state$.next(null);
      }
    });
  }

  async login() {
    const currentUser = this.state$.value;
    if (currentUser) {
      console.log('already logged in');
      return;
    }

    const state = await getObservableValue(authState(this.auth));

    if (state) {
      this.state$.next(state);
      return;
    }

    await signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return credential;
    });
  }

  async logout() {
    await signOut(this.auth)
    await this.router.navigate(['/']);
  }

}
