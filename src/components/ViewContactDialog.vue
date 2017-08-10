<template>
  <span>
    <el-button
      size="small"
      type="info"
      icon="view"
      @click="dialogVisible = true"></el-button>
    <el-dialog
      :key="contact['.key']"
      title="View Contact"
      :visible.sync="dialogVisible"
      size="small">
        <el-table :data="info" :showHeader="false">
          <el-table-column prop="key" width="165" class-name="table-left-header" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="value" :show-overflow-tooltip="true"></el-table-column>
        </el-table>
    </el-dialog>
  </span>
</template>

<script>
import _ from 'lodash';
import { order } from '../config';

export default {
  name: 'view-contact-dialog',
  props: {
    contact: {
      required: true,
    },
  },
  data() {
    return {
      dialogVisible: false,
    };
  },
  computed: {
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
