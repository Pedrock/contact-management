<template>
  <span>
    <el-button
      size="small"
      type="primary"
      icon="upload2"
      @click="dialogVisible = true">Import CSV</el-button>
    <el-dialog
      title="Import Contacts CSV"
      :visible.sync="dialogVisible"
      size="small">
      <el-form inline ref="form">
         <el-form-item label="Separator">
          <el-select v-model="separator">
            <el-option label="Auto-detect" :value="null"></el-option>
            <el-option label="Comma" value=","></el-option>
            <el-option label="Semi-colon" value=";"></el-option>
            <el-option label="Tab" :value="'\t'"></el-option>
          </el-select>
        </el-form-item><!--
     --><el-form-item>
          <el-checkbox v-model="deleteAll">Delete All</el-checkbox>
        </el-form-item><!--
     --><el-input type="textarea"
                  :rows="10"
                  placeholder="Paste your CSV here"
                  v-model="text">
        </el-input>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeVisibility(false)" :disabled="loading">Cancel</el-button>
        <el-button @click="importContacts" type="primary" :disabled="loading" :loading="loading">Import</el-button>
      </span>
    </el-dialog>
  </span>
</template>

<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import csvToJson from '../utils/csvToJson';
import getGender from '../utils/getGender';

/* eslint-disable no-param-reassign */
function fixNames(contacts) {
  contacts.forEach((contact) => {
    contact.Name = _.startCase(_.toLower(contact.Name || ''));
    contact.Location = _.startCase(_.toLower(contact.Location || ''));
    const nameParts = (contact.Name).split(' ');
    if (!contact['Given Name']) {
      contact['Given Name'] = nameParts.length > 0 ? nameParts[0] : '';
    }
    if (!contact['Family Name']) {
      contact['Family Name'] = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    }
    if (!contact['Additional Name']) {
      contact['Additional Name'] = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
    }
    if (!contact.Gender) {
      contact.Gender = getGender(contact['Given Name']);
    }
    contact.Blacklisted = contact.Blacklisted !== '' && contact.Blacklisted.toLowerCase() !== 'no';
    delete contact[''];
  });
}
/* eslint-enable no-param-reassign */

export default {
  name: 'import-csv-dialog',
  data() {
    return {
      dialogVisible: false,
      text: null,
      separator: null,
      deleteAll: false,
      loading: false,
    };
  },
  methods: {
    ...mapActions({
      addMultipleContacts: 'contacts/addMultipleContacts',
      replaceContacts: 'contacts/replaceContacts',
    }),
    importContacts() {
      let contacts;
      try {
        contacts = csvToJson(_.trim(this.text, '\n'), { separator: this.separator });
      } catch (error) {
        this.$notify.error({
          title: 'Error',
          message: error.message,
        });
        return;
      }
      if (!contacts.length) {
        this.$notify.error({
          title: 'Error',
          message: 'No contacts to import.',
        });
        return;
      }
      fixNames(contacts);
      console.log(_.uniq(contacts.filter(c => !c.Gender).map(c => c['Given Name'])));
      this.loading = true;
      setTimeout(() => {
        (this.deleteAll ? this.replaceContacts : this.addMultipleContacts)(contacts)
          .then(() => {
            this.$notify.success({
              title: 'Success',
              message: 'Contacts imported successfully.',
            });
            this.dialogVisible = false;
          })
          .catch(() => {
            this.$notify.error({
              title: 'Error',
              message: 'Contact import failed.',
            });
          })
          .then(() => {
            this.loading = false;
          });
      });
    },
    changeVisibility(visibility) {
      if (visibility) {
        this.dialogVisible = true;
      } else if (!this.loading) {
        this.dialogVisible = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
