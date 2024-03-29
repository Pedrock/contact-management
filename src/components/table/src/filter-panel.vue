<template>
  <transition name="el-zoom-in-top">
    <div class="el-table-filter" v-if="multiple" v-show="showPopper">
      <div class="el-table-filter__content">
        <el-checkbox-group class="el-table-filter__checkbox-group" v-model="filteredValue">
          <el-checkbox
            v-for="filter in filters"
            :key="filter.key || filter.value"
            :label="filter.value">{{ filter.text }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="el-table-filter__bottom">
        <button @click="handleConfirm"
          :class="{ 'is-disabled': filteredValue.length === 0 }"
          :disabled="filteredValue.length === 0">{{ t('el.table.confirmFilter') }}</button>
        <button @click="handleReset">{{ t('el.table.resetFilter') }}</button>
        <button v-if="filters.length > 4" @click="handleSelectAll">Select All</button>
      </div>
    </div>
    <div class="el-table-filter" v-else v-show="showPopper">
      <ul class="el-table-filter__list">
        <li class="el-table-filter__list-item"
            :class="{ 'is-active': !filterValue }"
            @click="handleSelect(null)">{{ t('el.table.clearFilter') }}</li>
        <li class="el-table-filter__list-item"
            v-for="filter in filters"
            :label="filter.value"
            :key="filter.value"
            :class="{ 'is-active': isActive(filter) }"
            @click="handleSelect(filter.value)" >{{ filter.text }}</li>
      </ul>
    </div>
  </transition>
</template>

<script type="text/babel">
  import Popper from 'element-ui/lib/utils/vue-popper';
  import { PopupManager } from 'element-ui/lib/utils/popup';
  import Locale from 'element-ui/lib/mixins/locale';
  import Clickoutside from 'element-ui/lib/utils/clickoutside';
  import Dropdown from './dropdown';

  export default {
    name: 'ElTableFilterPanel',

    mixins: [Popper, Locale],

    directives: {
      Clickoutside
    },

    props: {
      placement: {
        type: String,
        default: 'bottom-end'
      },
      test: {
        type: Boolean,
      }
    },

    methods: {
      isActive(filter) {
        return filter.value === this.filterValue;
      },

      handleOutsideClick() {
        this.showPopper = false;
      },

      handleConfirm() {
        this.confirmFilter(this.filteredValue);
        this.handleOutsideClick();
      },

      handleReset() {
        this.filteredValue = [];
        this.confirmFilter(this.filteredValue);
        this.handleOutsideClick();
      },

      handleSelectAll() {
        this.filteredValue = this.filters.map(filter => filter.value);
        this.confirmFilter(this.filteredValue);
      },

      handleSelect(filterValue) {
        this.filterValue = filterValue;

        if ((typeof filterValue !== 'undefined') && (filterValue !== null)) {
          this.confirmFilter(this.filteredValue);
        } else {
          this.confirmFilter([]);
        }

        this.handleOutsideClick();
      },

      confirmFilter(filteredValue) {
        this.table.store.commit('filterChange', {
          column: this.column,
          values: filteredValue
        });
      }
    },

    data() {
      return {
        table: null,
        cell: null,
        column: null
      };
    },

    computed: {
      filters() {
        return this.column && this.column.filters;
      },

      filterValue: {
        get() {
          return (this.column.filteredValue || [])[0];
        },
        set(value) {
          if (this.filteredValue) {
            if ((typeof value !== 'undefined') && (value !== null)) {
              this.filteredValue.splice(0, 1, value);
            } else {
              this.filteredValue.splice(0, 1);
            }
          }
        }
      },

      filteredValue: {
        get() {
          if (this.column) {
            return this.column.filteredValue || [];
          }
          return [];
        },
        set(value) {
          if (this.column) {
            this.column.filteredValue = value;
          }
        }
      },

      multiple() {
        if (this.column) {
          return this.column.filterMultiple;
        }
        return true;
      }
    },

    mounted() {
      this.popperElm = this.$el;
      this.referenceElm = this.cell;
      this.table.bodyWrapper.addEventListener('scroll', () => {
        this.updatePopper();
      });

      this.$watch('showPopper', (value) => {
        if (this.column) this.column.filterOpened = value;
        if (value) {
          Dropdown.open(this);
        } else {
          Dropdown.close(this);
        }
      });
    },
    watch: {
      showPopper(val) {
        if (val === true && parseInt(this.popperJS._popper.style.zIndex, 10) < PopupManager.zIndex) {
          this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
        }
      }
    }
  };
</script>
