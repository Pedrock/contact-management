<template>
  <contact-form-dialog v-model="dialogVisible"
                       :contact="contact"
                       :submit="submit"
                       @success="onSuccess"
                       @failure="onFailure"
                       title="Edit Contact"
                       submitText="Save"></contact-form-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ContactFormDialog from './ContactFormDialog';

export default {
  name: 'edit-contact-dialog',
  components: { ContactFormDialog },
  data() {
    return {
      dialogVisible: true,
    };
  },
  computed: {
    ...mapGetters({
      contact: 'dialogs/selectedContact',
    }),
  },
  watch: {
    dialogVisible(dialogVisible) {
      if (!dialogVisible) {
        this.$store.commit('dialogs/editContact', null);
      }
    },
  },
  methods: {
    ...mapActions({
      editContact: 'contacts/editContact',
    }),
    submit(contact) {
      return this.editContact(contact);
    },
    onSuccess() {
      this.$notify.success({
        title: 'Success',
        message: 'Contact edited successfully.',
      });
    },
    onFailure() {
      this.$notify.error({
        title: 'Error',
        message: 'Contact editing failed.',
      });
    },
  },
};
</script>
