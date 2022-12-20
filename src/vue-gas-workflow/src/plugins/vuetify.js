import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
              primary: '#546e7a',
              primaryLighten: '#819ca9',
              primaryDarken: '#29434e',
              secondary: '#6d4c41',
              secondaryLighten: '#9c786c',
              secondaryDarken: '#40241a',
              error: '#e53935',   // red
              warning: '#ffb300', // orange
              info: '#1e88e5',    // blue
              success: '#7cb342', // green
            },
        },
    },
});
