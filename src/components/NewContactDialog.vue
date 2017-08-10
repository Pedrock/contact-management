<template>
  <span class="new-contact-dialog">
    <el-button type="primary" class="download-csv" size="small" icon="plus" @click="() => dialogVisible = true">New Contact</el-button>
    <el-form :model="form" ref="form" @submit.native.prevent="submitForm">
      <el-dialog title="New Contact" :visible="dialogVisible" top="5%" @update:visible="changeVisibility">
          <el-form-item label="Name" label-width="120px">
            <el-input :value="name" disabled auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item v-for="field in fields" :key="field.key" :prop="field.key" :label="field.label" label-width="120px" :rules="field.rules">
            <template v-if="field.choices">
              <el-select v-model="form[field.key]" :label="field.label" :disabled="field.disabled">
                <el-option v-for="choice in field.choices" :key="choice.value" :label="choice.label" :value="choice.value"></el-option>
              </el-select>
            </template>
            <template v-else>
              <el-input v-model="form[field.key]" :disabled="field.disabled" auto-complete="off"></el-input>
            </template>
          </el-form-item>
        <span slot="footer" class="dialog-footer">
          <el-button @click="changeVisibility(false)" :disabled="loading">Cancel</el-button>
          <el-button native-type="submit" type="primary" :disabled="loading" :loading="loading">Create</el-button>
        </span>
      </el-dialog>
    </el-form>
  </span>
</template>

<script>
import { mapActions } from 'vuex';
import _ from 'lodash';
import { contactsColumns, baseContact } from '../config';

export default {
  name: 'new-contact-dialog',
  data() {
    return {
      dialogVisible: false,
      form: {},
      loading: false,
    };
  },
  computed: {
    name() {
      return [this.form['Given Name'], this.form['Additional Name'], this.form['Family Name']]
        .map(part => (part || '').trim())
        .filter(part => part !== '')
        .join(' ');
    },
    fields() {
      return contactsColumns
        .filter(col => !col.constant && !col.hidden)
        .map(col => ({
          key: col.name,
          label: col.name,
          required: !!col.required,
          choices: col.choices,
          disabled: !!col.disabled,
          rules: [
            { required: !!col.required, trigger: 'blur,change', message: `${col.name} is required` },
          ],
        }));
    },
  },
  methods: {
    ...mapActions({
      addContact: 'contacts/addContact',
    }),
    changeVisibility(visibility) {
      if (visibility) {
        this.dialogVisible = true;
      } else if (!this.loading) {
        this.dialogVisible = false;
      }
    },
    createContact() {
      this.loading = true;
      const contact = { ...baseContact, ...this.form, Name: this.name };
      _.forOwn(contact, (value, key) => {
        contact[key] = value.trim();
      });
      this.addContact(contact)
        .then(() => {
          this.$notify.success({
            title: 'Success',
            message: 'Contact added successfully.',
          });
          this.dialogVisible = false;
          this.$refs.form.resetFields();
        })
        .catch(() => {
          this.$notify.error({
            title: 'Error',
            message: 'Contact creation failed.',
          });
        })
        .then(() => {
          this.loading = false;
        });
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.createContact();
          return true;
        }
        this.$notify.error({
          title: 'Error',
          message: 'Please fill all the required fields.',
        });
        return false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.el-dialog__wrapper {
  text-align: initial;
}
.el-input.is-disabled /deep/ .el-input__inner {
  cursor: text !important;
  background-color: #f2f5f6;
  color: #888;
}
</style>
