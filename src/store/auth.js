import firebase from 'firebase/app';
import 'firebase/auth';

export default {
  namespaced: true,
  state: {
    user: null,
    loading: true,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      state.loading = false;
    },
  },
  getters: {
    user: state => state.user,
    loading: state => state.loading,
    loggedIn: state => state.user !== null,
  },
  actions: {
    login() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts');
      provider.addScope('https://www.googleapis.com/auth/drive');
      return firebase.auth().signInWithPopup(provider);
    },
    logout() {
      return firebase.auth().signOut();
    },
  },
};
