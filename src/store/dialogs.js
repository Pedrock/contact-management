export default {
  namespaced: true,
  state: {
    newContact: false,
    importContacts: false,
    exportContacts: false,

    selectedContact: null,
    viewContact: false,
    editContact: false,
  },
  mutations: {
    changeNewContactDialog(state, show) {
      state.newContact = !!show;
    },
    changeImportContactsDialog(state, show) {
      state.importContacts = !!show;
    },
    changeExportContactsDialog(state, show) {
      state.exportContacts = !!show;
    },
    viewContact(state, contact) {
      state.selectedContact = contact;
      state.viewContact = !!contact;
    },
    editContact(state, contact) {
      state.selectedContact = contact;
      state.editContact = !!contact;
    },
  },
  getters: {
    newContact: state => state.newContact,
    importContacts: state => state.importContacts,
    exportContacts: state => state.exportContacts,
    selectedContact: state => state.selectedContact,
    viewContact: state => state.viewContact,
    editContact: state => state.editContact,
  },
};
