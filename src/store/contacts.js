import _ from 'lodash';
import { firebaseAction } from 'vuexfire';

export default {
  namespaced: true,
  state: {
    contacts: [],
    loading: false,
    error: false,
    permissionDenied: false,
    ref: null,
  },
  getters: {
    contacts: state => state.contacts,
    loading: state => state.loading,
    error: state => state.error,
    permissionDenied: state => state.permissionDenied,
  },
  mutations: {
    setLoading(state, loading) {
      state.loading = loading;
      state.error = false;
      state.permissionDenied = false;
    },
    setError(state, error) {
      state.error = true;
      state.loading = false;
      if (error.code === 'PERMISSION_DENIED') {
        state.permissionDenied = true;
      }
    },
    setRef(state, ref) {
      state.ref = ref;
    },
  },
  actions: {
    setContactsRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      commit('setLoading', true);
      commit('setRef', ref);
      bindFirebaseRef('contacts', ref, {
        readyCallback: () => {
          commit('setLoading', false);
        },
        cancelCallback: (error) => {
          commit('setError', error);
        },
      });
    }),
    addContact({ state }, contact) {
      return state.ref.push(contact);
    },
    addMultipleContacts({ state }, contacts) {
      const updates = contacts.reduce((obj, contact) =>
        ({ ...obj, [state.ref.push().key]: contact }), {});
      return state.ref.update(updates);
    },
    editContact({ state }, contact) {
      state.ref.child(contact['.key']).update(_.omit(contact, ['.key']));
    },
    replaceContacts({ state }, contacts) {
      const updates = contacts.reduce((obj, contact) =>
        ({ ...obj, [state.ref.push().key]: contact }), {});
      return state.ref.set(updates);
    },
    removeContact({ state }, key) {
      return state.ref.child(key).remove();
    },
  },
};
