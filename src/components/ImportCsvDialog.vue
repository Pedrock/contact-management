<template>
  <span class="import-csv-dialog">
    <el-dialog
      top="5%"
      title="Import Contacts"
      :visible.sync="dialogVisible"
      size="small">
      <div v-if="stage === 1">
          <el-upload
            class="file-upload"
            action=""
            drag
            :show-file-list="false"
            :http-request="handleFile"
            :multiple="false">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
          <div class="upload-loading" v-if="loading">
            <div class="overlay"></div>
            <i class="el-icon-loading"></i>
          </div>
        </el-upload>
      </div>
      <div v-else-if="stage === 2">
        <p>Pick a Sheet from the Workbook.</p>
        <el-select v-model="worksheetName" placeholder="Worksheet">
          <el-option
            v-for="item in sheetNames"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </div>
      <div v-else>
        <el-checkbox class="replace-all" v-model="replaceAll">Replace All Existing Contacts</el-checkbox>
        <el-checkbox v-model="hasHeader">Use First Row As Header</el-checkbox>
        <el-form class="contact-form-dialog" ref="form" @submit.native.prevent="submitForm">
          <el-form-item v-for="column in columnMapping" :key="column.name" :prop="column.name" :label="column.name" label-width="120px">
            <el-select clearable v-model="column.fileColumn" :label="column.name" placeholder="Column">
              <el-option v-for="choice in fileColumns" :key="choice.value" :label="choice.name" :value="choice.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeVisibility(false)" :disabled="loading">Cancel</el-button>
        <el-button v-if="stage === 2" type="primary" @click="stage = 3">Next</el-button>
        <el-button v-if="stage === 3" @click="importContacts" type="primary" :disabled="loading" :loading="loading">Import</el-button>
      </span>
    </el-dialog>
  </span>
</template>

<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import XLSX from 'xlsx';
import getGender from '../utils/getGender';
import { phoneNumberFields, validatePhoneNumber, contactsColumns } from '../config';
import { getWorkbookFromFile, getWorksheetColumns } from '../utils/xlsxUtils';
import promiseTimeout from '../utils/promiseTimeout';

/* eslint-disable no-param-reassign */
function fixNames(contacts, invalidPhoneNumbers) {
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
    phoneNumberFields.forEach((field) => {
      if (contact[field] && !validatePhoneNumber(contact[field])) {
        if (!invalidPhoneNumbers.includes(contact[field])) {
          invalidPhoneNumbers.push(contact[field]);
        }
        contact[field] = '';
      }
    });
    if (contact['Mobile 2'] && !contact.Mobile) {
      contact.Mobile = contact['Mobile 2'];
      contact['Mobile 2'] = '';
    }
    contact.Blacklisted = contact.Blacklisted && contact.Blacklisted.toLowerCase() !== 'x';
    delete contact[''];
  });
}
/* eslint-enable no-param-reassign */

let workbook = null;

export default {
  name: 'import-csv-dialog',
  data() {
    return {
      dialogVisible: true,
      text: null,
      separator: null,
      replaceAll: false,
      loading: false,
      invalidPhoneNumbers: [],
      stage: 1,
      worksheetName: null,
      error: null,
      columnMapping: null,
      sheetNames: null,
      hasHeader: true,
    };
  },
  watch: {
    stage(stage) {
      if (stage === 3) {
        this.createColumnMapping();
      } else if (stage === 2) {
        this.sheetNames = workbook.SheetNames;
      }
    },
    dialogVisible(dialogVisible) {
      this.$store.commit('dialogs/changeImportContactsDialog', dialogVisible);
    },
    hasHeader() {
      if (this.columnMapping) {
        this.createColumnMapping();
      }
    },
  },
  computed: {
    fileColumns() {
      if (!this.worksheetName) {
        return [];
      }
      const columns = getWorksheetColumns(workbook.Sheets[this.worksheetName]);
      if (this.hasHeader) {
        return columns.map(name => ({ name, value: name }));
      }
      return columns
        .map((col, index) => ({ name: `Column ${index + 1}`, value: String(index) }));
    },
  },
  methods: {
    ...mapActions({
      addMultipleContacts: 'contacts/addMultipleContacts',
      replaceContacts: 'contacts/replaceContacts',
    }),
    createColumnMapping() {
      this.columnMapping = contactsColumns
      .filter(col => col.name)
      .map((col) => {
        let fileColumn = null;
        if (this.fileColumns.map(c => c.name).includes(col.name)) {
          fileColumn = col.name;
        } else if (col.csv && this.fileColumns.map(c => c.name).includes(col.csv)) {
          fileColumn = col.csv;
        }
        return { name: col.name, fileColumn };
      });
    },
    handleFile({ file }) {
      this.loading = true;
      promiseTimeout()
      .then(() => getWorkbookFromFile(file))
      .then((wb) => {
        if (wb.SheetNames.length === 0) {
          this.showError('Workbook has no sheets.');
        } else {
          workbook = wb;
          if (wb.SheetNames.length === 1) {
            this.worksheetName = wb.SheetNames[0];
            this.stage = 3;
          } else {
            this.stage = 2;
          }
        }
      })
      .catch(() => {
        this.showError('File read failed');
      })
      .then(() => {
        this.loading = false;
      });
    },
    showError(message) {
      this.$notify.error({
        title: 'Error',
        message,
      });
    },
    getContacts() {
      const worksheet = workbook.Sheets[this.worksheetName];
      const contacts = XLSX.utils.sheet_to_json(worksheet,
        { header: this.hasHeader ? undefined : 1 });

      return contacts
        .map((contact) => {
          const obj = {};
          for (let i = 0; i < this.columnMapping.length; i++) {
            const map = this.columnMapping[i];
            obj[map.name] = map.fileColumn ? contact[map.fileColumn] : null;
            if (obj[map.name] === undefined) {
              obj[map.name] = '';
            }
          }
          return obj;
        });
    },
    importContacts() {
      let contacts;
      try {
        contacts = this.getContacts();
      } catch (error) {
        this.showError(error.message);
        return;
      }
      if (!contacts.length) {
        this.showError('No contacts to import.');
        return;
      }
      const invalidPhoneNumbers = [];
      fixNames(contacts, invalidPhoneNumbers);
      const noGenderNames = _.uniq(contacts.filter(c => !c.Gender).map(c => c['Given Name']));

      const errorLog = [];
      if (invalidPhoneNumbers.length) {
        errorLog.push(`The following phone numbers where ignored: ${invalidPhoneNumbers.join(', ')}.`);
      }
      if (noGenderNames.length) {
        errorLog.push(`The gender of the following names could not be automatically detected: ${noGenderNames.join(', ')}.`);
      }
      this.loading = true;
      promiseTimeout()
      .then(() => (this.replaceAll ? this.replaceContacts : this.addMultipleContacts)(contacts))
      .then(() => {
        this.$notify.success({
          title: 'Success',
          message: 'Contacts imported successfully.',
        });
        this.dialogVisible = false;
        if (errorLog.length) {
          this.$alert(errorLog.join('\n\n'), 'Error log', {
            type: 'warning',
            confirmButtonText: 'OK',
            customClass: 'el-message-box-multiline',
          });
        }
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
    },
    changeVisibility(visibility) {
      if (visibility) {
        this.stage = 1;
        this.dialogVisible = true;
      } else if (!this.loading) {
        this.dialogVisible = false;
        workbook = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.file-upload {
  text-align: center;
}

.replace-all {
  margin-bottom: 32px;
}

.upload-loading {
  > .overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #fff;
    opacity: 0.7;
  }

  > i {
    font-size: 50px;
    color: #20a0ff;
    position: absolute;
    left: calc(50% - 25px);
    top: calc(50% - 25px);
  }
}
</style>
