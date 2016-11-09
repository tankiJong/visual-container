<template>
  <div>
    <image-bar v-for="image in imgs" :image="image"></image-bar>
  </div>
</template>

<script>
import imageBar from './image.vue';

export default {
  components:{
    imageBar,
  },
  data:()=>({
    imgs: [],
  }),
  props:{
    images:{
      type: Array,
    },
  },
  watch:{
    images:{
      handler(_, d){
        let max = 0;

        d.forEach(({ count })=> {
          if(count > max){
            max = count;
          }
        });

        this.imgs = d.map(e=>{
          e.percent = `${e.count / max * 100}%`;
          return e;
        });
      },
    }
  },
}
</script>

<style lang="sass">
  .image{
    margin-bottom: 15px;
  }
</style>
