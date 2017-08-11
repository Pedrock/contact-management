<template>
  <div class="contacts">
    <div v-if="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div v-else-if="error">
      <template v-if="permissionDenied">
        <p>Permission denied.</p>
        <p>You should request access.</p>
      </template>
      <template v-else>
        An error occurred while loading contacts.
      </template>
    </div>
    <div v-else>
      <div class="toolbox">
        <el-input
          placeholder="Search"
          class="search"
          icon="search"
          @input="onSearchInput">
        </el-input>
        <el-button type="primary" class="download-csv" size="small" @click="downloadCsv">Download CSV</el-button>
        <import-csv-dialog></import-csv-dialog>
        <new-contact-dialog></new-contact-dialog>
      </div>
      <el-table
        :data="pageItems"
        @filter-change="onFilterChange"
        @sort-change="onSortChange"
        border
        style="width: 100%">
        <el-table-column
          prop="ID"
          label="ID"
          sortable="custom"
          min-width="70">
        </el-table-column>
        <el-table-column
          prop="Name"
          label="Name"
          sortable="custom"
          min-width="300">
        </el-table-column>
        <el-table-column
          prop="Location"
          label="Location"
          column-key="Location"
          :filters="locationsFilters"
          filter-placement="bottom-end"
          sortable="custom"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="City"
          label="City"
          column-key="City"
          :filters="citiesFilters"
          filter-placement="bottom-end"
          sortable="custom"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="Mobile"
          label="Mobile"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="Mobile 2"
          label="Mobile 2"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="Phone"
          label="Phone"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="Gender"
          label="Gender"
          column-key="Gender"
          :filters="[{ text: 'Male', value: 'male' }, { text: 'Female', value: 'female' }]"
          filter-placement="bottom-end"
          width="100">
        </el-table-column>
        <el-table-column
          prop="Blacklisted"
          label="BL"
          column-key="Blacklisted"
          class-name="blacklisted"
          header-align="center"
          :filters="[{ text: 'Yes', value: true }, { text: 'No', value: false }]"
          filter-placement="bottom-end"
          width="60">
          <template scope="scope">
            <el-tag v-if="scope.row.Blacklisted"
                    type="danger">BL</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Operations"
          class-name="operations"
          header-align="center"
          min-width="80">
          <template scope="scope">
            <view-contact-dialog :contact="scope.row"></view-contact-dialog>
            <el-button
              size="small"
              type="danger"
              icon="delete"
              @click="handleDelete(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="(size) => this.pagination.pageSize = size"
        :current-page.sync="pagination.page"
        :page-sizes="[10, 25, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="searchFilteredItems.length">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapActions, mapGetters } from 'vuex';
import { saveAs } from 'file-saver';
import NewContactDialog from '../components/NewContactDialog';
import ViewContactDialog from '../components/ViewContactDialog';
import { csvSeparator, contactsColumns } from '../config';
import getContactFilter from '../utils/getContactFilter';
import ImportCsvDialog from '../components/ImportCsvDialog';

const orderFunctions = {
  ascending(a, b) {
    return String(a[this.sort.prop]).localeCompare(String(b[this.sort.prop]));
  },
  descending(b, a) {
    return String(a[this.sort.prop]).localeCompare(String(b[this.sort.prop]));
  },
};

const numberOrderFunctions = {
  ascending(a, b) {
    return Number(a[this.sort.prop]) < Number(b[this.sort.prop]) ? -1 : 1;
  },
  descending(b, a) {
    return Number(a[this.sort.prop]) > Number(b[this.sort.prop]) ? 1 : -1;
  },
};

function clean(value) {
  return _.deburr(String(value).trim().toLowerCase());
}

export default {
  components: {
    ImportCsvDialog,
    ViewContactDialog,
    NewContactDialog,
  },
  name: 'contacts',
  data() {
    return {
      search: '',
      pagination: {
        pageSize: 10,
        page: 1,
      },
      filters: {},
      sort: {
        prop: null,
        order: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      contacts: 'contacts/contacts',
      loading: 'contacts/loading',
      error: 'contacts/error',
      permissionDenied: 'contacts/permissionDenied',
    }),
    searchFilteredItems() {
      const cleanSearch = clean(this.search);
      return this.filteredItems
        .filter(item => Object.values(item)
          .some(val =>
          clean(val).includes(cleanSearch)));
    },
    filteredItems() {
      const activeFilters = Object.entries(this.filters)
        .filter(entry => Object.values(entry[1]).length);
      return this.contacts.filter((contact) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const [field, value] of activeFilters) {
          const values = Object.values(value);
          if (!values.includes(contact[field])) {
            return false;
          }
        }
        return true;
      });
    },
    sortedItems() {
      if (this.sort.prop === null) {
        return this.searchFilteredItems;
      } else if (this.sort.prop === 'ID') {
        return this.searchFilteredItems.slice()
          .sort(numberOrderFunctions[this.sort.order].bind(this));
      }
      return this.searchFilteredItems.slice()
        .sort(orderFunctions[this.sort.order].bind(this));
    },
    pageItems() {
      const start = (this.pagination.page - 1) * this.pagination.pageSize;
      return this.sortedItems.slice(start, start + this.pagination.pageSize);
    },
    locationsFilters() {
      return getContactFilter(this.contacts, 'Location');
    },
    citiesFilters() {
      return getContactFilter(this.contacts, 'City');
    },
  },
  methods: {
    ...mapActions({
      removeContact: 'contacts/removeContact',
    }),
    onSearchInput: _.debounce(function onSearchInput(value) {
      this.search = value;
    }, 500),
    handleDelete(row) {
      this.$confirm('Are you sure you want to delete this contact?', 'Delete Contact', {
        confirmButtonText: 'Delete',
        confirmButtonClass: 'el-button--danger',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }).then(() => {
        this.removeContact(row['.key']).then(() => {
          this.$notify.success({
            title: 'Success',
            message: 'Contact deleted successfully.',
          });
          this.dialogVisible = false;
        })
        .catch(() => {
          this.$notify.error({
            title: 'Error',
            message: 'Contact deletion failed.',
          });
        });
      });
    },
    onFilterChange(filters) {
      this.pagination.page = 1;
      Object.entries(filters)
        .forEach(([key, value]) => {
          this.$set(this.filters, key, value);
        });
    },
    onSortChange({ prop, order }) {
      this.sort = { prop, order };
    },
    downloadCsv() {
      let promise = Promise.resolve();
      if (!this.filters.Blacklisted
        || Object.keys(this.filters.Blacklisted).length !== 1
        || this.filters.Blacklisted[0] !== false) {
        promise = this.$confirm('You are not filtering out the blacklisted contacts. Continue?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning',
        });
      }
      promise.then(() => {
        const headerText = `${contactsColumns
        .filter(value => value.csv)
        .map(value => value.csv)
        .join(csvSeparator)}\n`;

        const data = [headerText,
          ...this.sortedItems
          .map(contact => `${
            contactsColumns
            .filter(col => col.csv)
            .map((col) => {
              if (col.constant !== undefined) {
                return col.constant;
              }
              return contact[col.name];
            }).join(';')
            }\n`),
        ];

        const blob = new Blob(data, { type: 'text/plain' });
        saveAs(blob, 'contacts_test.csv');
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.contacts {
  margin-top: 16px;

  /deep/ .el-table__column-filter-trigger {
    position: absolute;
    right: 8px;
  }

  /deep/ .cell {
    word-break: keep-all;
    .caret-wrapper {
      padding: 1px 5px;
    }
  }

  /deep/ th.is-leaf .cell {
    padding-right: 0;
  }

  /deep/ .operations, /deep/ .blacklisted {
    > .cell {
      padding: 0;
    }
  }

  /deep/ .blacklisted.is-leaf > .cell {
    padding-right: 10px;
  }
}

.el-pagination {
  margin: 16px 0;
}

.toolbox {
  margin-bottom: 16px;
  text-align: right;
  > .search {
    max-width: 300px;
    float: left;
  }
  &:after {
    content: ' ';
    display: table;
    clear: both;
  }
}
</style>
