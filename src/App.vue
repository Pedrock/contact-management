<template>
  <div id="app">
    <div class="header">
      <template v-if="loading">
        <i class="el-icon-loading"></i>
      </template>
      <template v-else-if="loggedIn">
        <span class="user">User: {{user.displayName}}</span>
        <el-button class="logout" push="right" type="info" plain size="mini" @click="logout">Logout</el-button>
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
      user: 'auth/user',
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
@import './styles/main.scss';

#app {
  text-align: center;
  color: #2c3e50;

  .header {
    padding: 8px;
    border-bottom: 1px solid #ccc;
    .user {
      float: left;
      line-height: 23px;
    }
    .logout {
      float: right;
      position: relative;
    }
    &:after {
      display: table;
      content: ' ';
      clear: both;
    }
  }

  > *:not(.header) {
    padding: 0 16px;
  }
}
</style>
