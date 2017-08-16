<template>
  <span class="new-contact-dialog">
    <contact-form-dialog v-model="dialogVisible"
                         :submit="submit"
                         @success="onSuccess"
                         @failure="onFailure"
                         title="New Contact"
                         submitText="Create"></contact-form-dialog>
  </span>
</template>

<script>
import { mapActions } from 'vuex';
import ContactFormDialog from './ContactFormDialog';

export default {
  name: 'new-contact-dialog',
  components: { ContactFormDialog },
  data() {
    return {
      dialogVisible: true,
    };
  },
  watch: {
    dialogVisible(dialogVisible) {
      this.$store.commit('dialogs/changeNewContactDialog', dialogVisible);
    },
  },
  methods: {
    ...mapActions({
      addContact: 'contacts/addContact',
    }),
    submit(contact) {
      return this.addContact(contact);
    },
    onSuccess() {
      this.$notify.success({
        title: 'Success',
        message: 'Contact added successfully.',
      });
    },
    onFailure() {
      this.$notify.error({
        title: 'Error',
        message: 'Contact creation failed.',
      });
    },
  },
};
</script>
