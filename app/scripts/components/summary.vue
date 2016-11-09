<template>
  <ul>
    <li><span class="key">总主机数</span><span class="value">{{ node }}</span></li>
    <li><span class="key">总内存</span><span class="value">{{ mem }} GB</span></li>
    <li><span class="key">总容器数</span><span class="value">{{ container }}</span></li>
  </ul>
</template>

<script>
export default {
  data: ()=>({
    node: 0,
    mem: 0,
  }),
  props:{
    container:{
      type: Number,
    }
  },
  methods:{
    fetchInfo(){
      return this.$http.get('/').then(d => d.data);
    }
  },
  created() {
    this.fetchInfo().then(d => {
      this.node = 1;
      this.mem = 16;
    });
  }
}
</script>

