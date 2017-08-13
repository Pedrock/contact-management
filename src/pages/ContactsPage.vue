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
        <export-contacts-dialog :items="sortedItems" :filters="filters"></export-contacts-dialog>
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
          column-key="ID"
          :filters="[{ text: 'Not Empty', value: notEmpty, key: '_notEmpty_' }, { text: 'Empty', value: empty, key: '_empty_' }]"
          sortable="custom"
          min-width="80">
        </el-table-column>
        <el-table-column
          prop="Name"
          label="Name"
          column-key="Name"
          :filters="[{ text: 'Not Empty', value: notEmpty, key: '_notEmpty_' }, { text: 'Empty', value: empty, key: '_empty_' }]"
          sortable="custom"
          min-width="300">
        </el-table-column>
        <el-table-column
          prop="Location"
          label="Location"
          column-key="Location"
          :filters="locationsFilters"
          sortable="custom"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="City"
          label="City"
          column-key="City"
          :filters="citiesFilters"
          sortable="custom"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="Mobile"
          label="Mobile"
          column-key="Mobile"
          :filters="[{ text: 'Not Empty', value: notEmpty, key: '_notEmpty_' }, { text: 'Empty', value: empty, key: '_empty_' }]"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="Mobile 2"
          label="Mobile 2"
          column-key="Mobile 2"
          :filters="[{ text: 'Not Empty', value: notEmpty, key: '_notEmpty_' }, { text: 'Empty', value: empty, key: '_empty_' }]"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="Gender"
          label="Gender"
          column-key="Gender"
          :filters="[{ text: 'Male', value: 'male' }, { text: 'Female', value: 'female' }, { text: '(empty)', value: empty, key: '_empty_' }]"
          width="100">
        </el-table-column>
        <el-table-column
          prop="Blacklisted"
          label="BL"
          column-key="Blacklisted"
          class-name="blacklisted"
          header-align="center"
          :filters="[{ text: 'Yes', value: true }, { text: 'No', value: false }]"
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
          min-width="120">
          <template scope="scope">
            <view-contact-dialog :contact="scope.row"></view-contact-dialog>
            <edit-contact-dialog :contact="scope.row"></edit-contact-dialog>
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
import NewContactDialog from '../components/NewContactDialog';
import ViewContactDialog from '../components/ViewContactDialog';
import getContactFilter from '../utils/getContactFilter';
import ImportCsvDialog from '../components/ImportCsvDialog';
import ExportContactsDialog from '../components/ExportContactsDialog';
import EditContactDialog from '../components/EditContactDialog';

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
  name: 'contacts',
  components: {
    EditContactDialog,
    ExportContactsDialog,
    ImportCsvDialog,
    ViewContactDialog,
    NewContactDialog,
  },
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
      empty: { empty: true },
      notEmpty: { notEmpty: true },
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
          if (!values.some(v => v === contact[field]
                || (v === this.empty && !contact[field])
                || (v === this.notEmpty && contact[field]))) {
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
      padding: 1px 14px;
      margin: 0;
      .sort-caret {
        left: 8px;
      }
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
  margin-bottom: 8px;
  text-align: right;
  > .search {
    max-width: 300px;
    margin-bottom: 4px;
    margin-right: 4px;
    float: left;
  }
  /deep/ > span > .el-button, .el-button {
    margin-bottom: 4px;
  }

  &:after {
    content: ' ';
    display: table;
    clear: both;
  }
}
</style>
