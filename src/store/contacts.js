import { firebaseAction } from 'vuexfire';

export default {
  namespaced: true,
  state: {
    contacts: [],
    loading: false,
    error: false,
    permissionDenied: false,
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
  },
  actions: {
    setContactsRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      commit('setLoading', true);
      bindFirebaseRef('contacts', ref, {
        readyCallback: () => {
          commit('setLoading', false);
        },
        cancelCallback: (error) => {
          commit('setError', error);
        },
      });
    }),
  },
};
