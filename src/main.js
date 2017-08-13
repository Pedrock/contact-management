import 'core-js/shim';
import Vue from 'vue';
import locale from 'element-ui/lib/locale/lang/en';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';
import Table from './components/table/index';
import App from './App';
import router from './router';
import store from './store/store';
import './firebase';

Vue.config.productionTip = false;

Vue.use(ElementUI, { locale });
Vue.component(Table.name, Table);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});
