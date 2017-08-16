/* eslint-disable no-console */
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import store from './store/store';

const config = {
  apiKey: 'AIzaSyCS-KFYFFDWWqFdJDRpC0u_gfB5SfYhU0s',
  authDomain: 'contact-m.firebaseapp.com',
  databaseURL: 'https://contact-m.firebaseio.com',
  projectId: 'contact-m',
  storageBucket: 'contact-m.appspot.com',
  messagingSenderId: '487589473112',
};

const firebaseApp = firebase.initializeApp(config);

export const db = firebaseApp.database();
export const auth = firebaseApp.auth();

auth.onAuthStateChanged((user) => {
  store.commit('auth/setUser', user);
  if (user) {
    store.dispatch('contacts/setContactsRef', db.ref('contacts'));
  }
});
