import 'virtual:windi.css';

import { createPinia } from 'pinia';
import { createApp } from 'vue';
import VueNotify from 'vue3-notify';

import App from '~r/app.vue';

const app = createApp(App);
app.use(createPinia());
app.use(VueNotify);
app.mount('#app');
