import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
              primary: '#607d8b',
              secondary: '#ffc107',
              accent: '#795548',
              error: '#f44336',
              warning: '#ffeb3b',
              info: '#03a9f4',
              success: '#8bc34a',
            },
        },
    },
});
