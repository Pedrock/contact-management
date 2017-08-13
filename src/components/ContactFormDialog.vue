<template>
  <el-form class="contact-form-dialog" :model="form" ref="form" @submit.native.prevent="submitForm">
  <el-dialog :title="title" :visible="dialogVisible" top="5%" @update:visible="changeVisibility">
    <el-form-item label="Name" label-width="120px">
      <el-input :value="name" disabled auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item v-for="field in fields" :key="field.key" :prop="field.key" :label="field.label" label-width="120px" :rules="field.rules">
      <template v-if="field.choices">
        <el-select v-model.trim="form[field.key]" :label="field.label" :disabled="field.disabled">
          <el-option v-for="choice in field.choices" :key="choice.value" :label="choice.label" :value="choice.value"></el-option>
        </el-select>
      </template>
      <template v-else-if="field.type === 'boolean'">
        <el-checkbox v-model="form[field.key]" :disabled="field.disabled"></el-checkbox>
      </template>
      <template v-else>
        <el-input v-model="form[field.key]" :disabled="field.disabled" auto-complete="off"></el-input>
      </template>
    </el-form-item>
    <span slot="footer" class="dialog-footer">
      <el-button @click="changeVisibility(false)" :disabled="loading">Cancel</el-button>
      <el-button native-type="submit" type="primary" :disabled="loading" :loading="loading">{{submitText}}</el-button>
    </span>
  </el-dialog>
</el-form>
</template>

<script>
import { mapActions } from 'vuex';
import _ from 'lodash';
import { contactsColumns, baseContact, validatePhoneNumber } from '../config';

export default {
  name: 'contact-form-dialog',
  props: {
    title: String,
    submitText: String,
    value: {
      type: Boolean,
      required: true,
    },
    contact: {
      type: Object,
      default: () => ({}),
    },
    submit: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      dialogVisible: false,
      form: { ...baseContact, ...this.contact },
      loading: false,
    };
  },
  watch: {
    value(value) {
      this.dialogVisible = value;
    },
    dialogVisible(value) {
      this.$emit('input', value);
      if (value) {
        this.loading = false;
        this.form = { ...baseContact, ...this.contact };
      }
    },
  },
  computed: {
    name() {
      return [this.form['Given Name'], this.form['Additional Name'], this.form['Family Name']]
      .map(part => (part || '').trim())
      .filter(part => part !== '')
      .join(' ');
    },
    fields() {
      const contactExtraFields = Object.keys(this.contact)
        .filter(key => contactsColumns.every(col => key !== '.key' && col.name !== key))
        .map(name => ({ name }));

      return [...contactsColumns, ...contactExtraFields]
      .filter(col => !col.constant && !col.hidden)
      .map(col => ({
        ...col,
        key: col.name,
        label: col.name,
        rules: (() => {
          if (col.type === 'boolean') {
            return [];
          } else if (col.type === 'phone') {
            return [
              { required: !!col.required, trigger: 'blur,change', message: `${col.name} is required` },
              { trigger: 'blur,change',
                validator: (rule, value, callback) =>
                  callback((value && !validatePhoneNumber(value)) || undefined),
                message: 'Please input a valid phone number.' },
            ];
          }
          return [{ required: !!col.required, trigger: 'blur,change', message: `${col.name} is required` }];
        })(),
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
    submitContact() {
      this.loading = true;
      const contact = { ...this.contact, ...this.form, Name: this.name };
      _.forOwn(contact, (value, key) => {
        if (value.trim) {
          contact[key] = value.trim();
        }
      });
      this.submit(contact)
      .then(() => {
        this.$emit('success');
        this.dialogVisible = false;
        this.$refs.form.resetFields();
      })
      .catch(() => {
        this.$emit('failure');
      })
      .then(() => {
        this.loading = false;
      });
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitContact();
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

<style scoped>
.contact-form-dialog {
  display: inline;
}
</style>
