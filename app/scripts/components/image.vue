<template>
  <div class="image">
    <span class="name">{{ image.name }}</span>
    <span class="count">{{ image.count }}</span>
    <div class="bar" :style="style"></div>
  </div>
</template>

<script>
  export default {
    props:{
      image:{
        type: Object,
        default: ()=>({
          name: 'demooooo',
          count: 20,
          percent: '10%',
        }),
      },
    },
    computed:{
      style(){
        return { width: this.image.percent };
      }
    }
  }
</script>

<style lang="sass">
.image{
  position: relative;
  height: 28px;
  line-height: 28px;
  .bar{
    position: absolute;
    background-color: #6da2f2;
    width: 60%;
    height: 100%;
    border-radius: 3px;
  }

  span{
    position: absolute;
    z-index: 1;

    &.name{
      left: 0;
      margin-left: 22px;
    }

    &.count{
      right: 0;
      margin-right: 22px;
    }
  }
}
</style>
