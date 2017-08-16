import Vue from 'vue';
import Vuex from 'vuex';
import { firebaseMutations } from 'vuexfire';
import contacts from './contacts';
import auth from './auth';
import dialogs from './dialogs';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    contacts,
    auth,
    dialogs,
  },
  mutations: firebaseMutations,
});
