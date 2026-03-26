import './assets/styles/main.css';
import 'ant-design-vue/dist/reset.css';

import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { appConfig } from '@/config';

import App from './App.vue';
import router from './router';

document.title = appConfig.appTitle;

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
