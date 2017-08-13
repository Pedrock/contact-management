<template>
  <div class="list-picker">
    <div class="list-picker-list">
      <div class="draggable-list-title" v-text="sourceTitle" />
      <draggable class="draggable-list" element="ul" v-model="list" :options="dragOptions">
        <li v-for="element in list" :key="element.order">{{element.name}}</li>
      </draggable>
    </div><!--
 --><div class="list-picker-list">
    <div class="draggable-list-title" v-text="targetTitle" />
      <draggable class="draggable-list" element="ul" v-model="list2" :options="dragOptions">
        <li v-for="element in list2" :key="element.order">{{element.name}}</li>
      </draggable>
    </div>
  </div>
</template>
<script>
import Draggable from 'vuedraggable';

export default {
  name: 'list-picker',
  props: {
    source: {
      type: Array,
      default: () => [],
    },
    target: {
      type: Array,
      default: () => [],
    },
    sourceTitle: {
      type: String,
      default: 'Source',
    },
    targetTitle: {
      type: String,
      default: 'Target',
    },
  },
  data() {
    return {
      list: this.source,
      list2: this.target,
      dragOptions: {
        animation: 100,
        group: 'csv-header',
        ghostClass: 'ghost',
      },
    };
  },
  watch: {
    list1() {
      this.$emit('source', this.list);
    },
    list2() {
      this.$emit('target', this.list2);
    },
  },
  components: {
    Draggable,
  },
};
</script>

<style lang="scss">
.list-picker {

  .draggable-list-title {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .list-picker-list {
    vertical-align: top;
    display: inline-block;
    width: 50%;
    &:not(:last-child) {
      padding-right: 8px;
    }
    &:not(:first-child) {
      padding-left: 8px;
    }
  }

  .draggable-list {
    margin: 0;
    display: inline-block;
    padding: 1px;
    border: 1px solid #aaa;
    width: 100%;
    min-height: 30px;

    li {
      cursor: move;
      list-style: none;
      min-height: 20px;
      border: 1px solid #ccc;
      padding: 8px;
      margin: -1px 0 0;

      &.ghost {
        opacity: .5;
        background: #C8EBFB;
      }
    }
  }
}
</style>
