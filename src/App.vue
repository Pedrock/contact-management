<template>
  <div id="app">
    <div class="header">
      <template v-if="loading">
        <i class="el-icon-loading"></i>
      </template>
      <template v-else-if="loggedIn">
        <span>You are logged in!</span>
        <el-button type="info" plain size="mini" @click="logout">Logout</el-button>
      </template>
      <template v-else>
        <el-button type="primary" @click="login">Click here to login</el-button>
      </template>
    </div>
    <template v-if="loggedIn">
      <router-view></router-view>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'app',
  computed: {
    ...mapGetters({
      loggedIn: 'auth/loggedIn',
      loading: 'auth/loading',
    }),
  },
  methods: {
    ...mapActions({
      login: 'auth/login',
      logout: 'auth/logout',
    }),
  },
};
</script>

<style lang="scss">
* {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;

  .header {
    margin-bottom: 20px;
    > * {
      vertical-align: middle;
    }
  }
}

.el-table__body-wrapper > table {
  width: 100% !important;
  min-width: 500px !important;
  padding-top: 1px;
}
</style>
