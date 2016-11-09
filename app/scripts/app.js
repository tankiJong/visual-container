import Vue from 'vue';
import VueResource from 'vue-resource';
import summary from './components/summary.vue';
import imageStack from './components/image-stack.vue';
import vote from './components/vote.vue';

Vue.use(VueResource);
new Vue({
  el: 'body',
  components: {
    // include the required component
    // in the options
    summary,
    imageStack,
    vote,
  },
  data:()=>({
    displayVote: false,
  }),
  methods:{
    toggleVote(){
      this.displayVote = !this.displayVote;
    }
  }
});
