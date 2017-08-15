<template>
  <span class="export-contacts-dialog">
    <el-button type="primary" icon="upload2" size="small" @click="openDialog">Export Contacts</el-button>
    <el-dialog
      top="5%"
      title="Export Contacts"
      :visible.sync="dialogVisible"
      size="small">
      <list-picker :source="source" :target.sync="target"></list-picker>
      <span slot="footer" class="dialog-footer">
        <el-button @click="() => dialogVisible = false">Cancel</el-button>
        <el-button @click="exportCsv" type="primary">Export</el-button>
      </span>
    </el-dialog>
  </span>
</template>
<script>
import { saveAs } from 'file-saver';
import { csvSeparator, contactsColumns } from '../config';
import ListPicker from './ListPicker';

function getColumns(isTarget) {
  return contactsColumns
    .filter(col => !!col.exportTarget === isTarget)
    .map(col => ({
      name: [col.name, col.csv]
        .filter((v, index) => index === 0 || v)
        .reduce((list, elem) => ((elem === list[0]) ? list : [...list, elem]), [])
        .join('  ⇒  '),
      key: col.name }));
}

export default {
  components: { ListPicker },
  name: 'export-contacts-dialog',
  props: {
    filters: { required: true },
    items: { required: true },
  },
  data() {
    return {
      dialogVisible: false,
      target: getColumns(true),
      source: getColumns(false),
    };
  },
  computed: {
    columns() {
      const wantedColumns = this.target.map(t => t.key);
      return wantedColumns
        .map(name => contactsColumns.find(col => col.name === name));
    },
  },
  methods: {
    confirmBlacklist() {
      if (!this.filters.Blacklisted
        || Object.keys(this.filters.Blacklisted).length !== 1
        || this.filters.Blacklisted[0] !== false) {
        return this.$confirm('You are not filtering out the blacklisted contacts. Continue?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning',
        });
      }
      return Promise.resolve();
    },
    openDialog() {
      this.dialogVisible = true;
      this.confirmBlacklist()
      .catch(() => {
        this.dialogVisible = false;
      });
    },

    getCsvHeader() {
      return `${this.columns
        .map(value => value.csv)
        .join(csvSeparator)}\n`;
    },
    getRow(contact) {
      return `${
        this.columns
        .map((col) => {
          if (col.constant !== undefined) {
            return col.constant;
          }
          return contact[col.name];
        }).join(';')
        }\n`;
    },
    getCsvRows() {
      return this.items.map(this.getRow);
    },
    exportCsv() {
      const data = [this.getCsvHeader(), ...this.getCsvRows()];
      const blob = new Blob(data, { type: 'text/plain' });
      saveAs(blob, 'exported_contacts.csv');
    },
  },
};
</script>

<style lang="scss" scoped>
.export-contacts-dialog {
  /deep/ .el-icon-upload2 {
    transform: rotateX(180deg);
  }
}
</style>
