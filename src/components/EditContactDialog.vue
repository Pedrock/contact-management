<template>
  <span class="new-contact-dialog">
    <el-button type="primary" size="small" icon="edit" @click="() => dialogVisible = true"></el-button>
    <contact-form-dialog v-model="dialogVisible"
                         :contact="contact"
                         :submit="submit"
                         @success="onSuccess"
                         @failure="onFailure"
                         title="Edit Contact"
                         submitText="Save"></contact-form-dialog>
  </span>
</template>

<script>
import { mapActions } from 'vuex';
import ContactFormDialog from './ContactFormDialog';

export default {
  name: 'edit-contact-dialog',
  components: { ContactFormDialog },
  props: {
    contact: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dialogVisible: false,
    };
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
