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
      <div class="table-wrapper">
        <el-table
          ref="table"
          :data="contacts"
          border
          :height="null"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="Name"
            sortable
            min-width="300">
          </el-table-column>
          <el-table-column
            prop="given_name"
            label="Given Name"
            sortable
            min-width="180">
          </el-table-column>
          <el-table-column
            prop="family_name"
            label="Family Name"
            sortable
            min-width="180">
          </el-table-column>
          <el-table-column
            prop="location"
            label="Location"
            column-key="location"
            :filters="locationsFilters"
            :filter-method="(value, row) => row.location === value"
            filter-placement="bottom-end"
            sortable
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
            :filter-method="(value, row) => row.gender === value"
            filter-placement="bottom-end">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { saveAs } from 'file-saver';

export default {
  name: 'contacts',
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      contacts: 'contacts/contacts',
      loading: 'contacts/loading',
      error: 'contacts/error',
      permissionDenied: 'contacts/permissionDenied',
    }),
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
        ...this.$refs.table.store.states.data
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
  margin-top: 32px;

  /deep/ .el-table__column-filter-trigger {
    position: absolute;
  }

  /deep/ .cell {
    word-break: keep-all;
  }

  /deep/ .el-table__body-wrapper {
    height: calc(100vh - 180px);
  }

  .table-wrapper {
    width: 100%;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0 10px;
  }
}
.download-csv {
  margin-bottom: 16px;
}
</style>
