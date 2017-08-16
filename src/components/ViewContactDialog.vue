<template>
  <el-dialog
    top="5%"
    :key="contact['.key']"
    title="View Contact"
    :visible.sync="dialogVisible"
    size="small">
      <el-table :data="info" :showHeader="false">
        <el-table-column class-name="right-header" prop="key" min-width="140"></el-table-column>
        <el-table-column prop="value" min-width="350">
          <template scope="scope">
            <template v-if="scope.row.key === 'Blacklisted'">
              <el-tag v-if="scope.row.value" type="danger">Blacklisted</el-tag>
              <span v-else>No</span>
            </template>
            <template v-else>{{ scope.row.value }}</template>
        </template></el-table-column>
      </el-table>
  </el-dialog>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { order } from '../config';

export default {
  name: 'view-contact-dialog',
  data() {
    return {
      dialogVisible: true,
    };
  },
  watch: {
    dialogVisible(dialogVisible) {
      if (!dialogVisible) {
        this.$store.commit('dialogs/viewContact', null);
      }
    },
  },
  computed: {
    ...mapGetters({
      contact: 'dialogs/selectedContact',
    }),
    info() {
      return _(this.contact)
      .omit(['.key'])
      .mapValues((value, key) => ({ key, value }))
      .values()
      .sortBy(({ key }) => {
        const index = order.indexOf(key);
        return index < 0 ? Infinity : index;
      })
      .value();
    },
  },
};
</script>

<style lang="scss" scoped>
.el-table /deep/ .right-header {
  background-color: #f5f5f5;
}
</style>
