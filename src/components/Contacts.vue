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
      <el-button type="primary" class="download-csv" @click="downloadCsv">Download CSV</el-button>
      <el-table
        :data="pageItems"
        @filter-change="onFilterChange"
        @sort-change="onSortChange"
        border
        style="width: 100%">
        <el-table-column
          prop="name"
          label="Name"
          sortable="custom"
          min-width="300">
        </el-table-column>
        <el-table-column
          prop="given_name"
          label="Given Name"
          sortable="custom"
          min-width="180">
        </el-table-column>
        <el-table-column
          prop="family_name"
          label="Family Name"
          sortable="custom"
          min-width="180">
        </el-table-column>
        <el-table-column
          prop="location"
          label="Location"
          column-key="location"
          :filters="locationsFilters"
          filter-placement="bottom-end"
          sortable="custom"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="phone1"
          label="Phone 1"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="phone2"
          label="Phone 2"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="gender"
          column-key="gender"
          label="Gender"
          width="100"
          :filters="[{ text: 'Male', value: 'male' }, { text: 'Female', value: 'female' }]"
          filter-placement="bottom-end">
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="(size) => this.pagination.pageSize = size"
        :current-page.sync="pagination.page"
        :page-sizes="[10, 25, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredItems.length">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { saveAs } from 'file-saver';

const orderFunctions = {
  ascending(a, b) {
    return String(a[this.sort.prop]).localeCompare(String(b[this.sort.prop]));
  },
  descending(b, a) {
    return String(a[this.sort.prop]).localeCompare(String(b[this.sort.prop]));
  },
};

export default {
  name: 'contacts',
  data() {
    return {
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
        return this.filteredItems;
      }
      return this.filteredItems.slice().sort(orderFunctions[this.sort.order].bind(this));
    },
    pageItems() {
      const start = (this.pagination.page - 1) * this.pagination.pageSize;
      return this.sortedItems.slice(start, start + this.pagination.pageSize);
    },
    locationsFilters() {
      const locations = new Set();
      Object.values(this.contacts).forEach((contact) => {
        locations.add(contact.location);
      });
      return Array.from(locations)
        .map(location => ({
          text: location,
          value: location,
        }));
    },
  },
  methods: {
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
      const separator = ';';
      const columns = {
        Name: 'name',
        'Given Name': 'given_name',
        'Additional Name': 'additional_name',
        'Family Name': 'family_name',
        Location: 'location',
        'Phone 1 - Type': () => 'Mobile',
        'Phone 1 - Value': 'phone1',
        'Phone 2 - Type': () => 'Mobile',
        'Phone 2 - Value': 'phone2',
        Gender: 'gender',
      };

      const headerText = `${Object.keys(columns).join(separator)}\n`;

      const data = [headerText,
        ...this.sortedItems
          .map(contact => `${
            Object.values(columns).map((value) => {
              if (typeof value === 'function') {
                return value(contact);
              }
              return contact[value];
            }).join(';')
            }\n`),
      ];

      const blob = new Blob(data, { type: 'text/plain' });
      saveAs(blob, 'contacts_test.csv');
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
}
.el-pagination {
  margin: 16px 0;
}
.download-csv {
  margin-bottom: 16px;
}
</style>
