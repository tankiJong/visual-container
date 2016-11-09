<template>
  <div class="vote">
    <div class="total">{{ total }}</div>
    <div class="op op1" :style="{width: op1}">
      <div class="words">
        <div class="title">是</div>
        <div class="content">{{ op1 }}</div>
      </div>
    </div><div class="op op2" :style="{width: op2, left: op1}">
      <div class="words">
        <div class="title">否</div>
        <div class="content">{{ op2 }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import  { api } from '../constant';
export default {
  data: ()=>({
    op1: '50%',
    op2: '50%',
    total: 'Loading...',
    task: 0,
  }),
  methods:{
    fetchData(){
      return this.$http.get(`${ api }:5003/result`).then(d=> d.data);
    },
  },
  created(){
    const startTask = () => {
      this.fetchData().then(d=>{
        this.task = setTimeout(() => startTask(), 1000);
        const p1 =parseInt(d.option_a/(d.option_a + d.option_b)*100);
        this.total = d.option_a + d.option_b;
        this.op1 = `${p1}%`;
        this.op2 = `${100-p1}%`;
      }, ()=>{
        this.task = setTimeout(() => startTask(), 1000);
      });
    };
    startTask();
  },
  beforeDestroy(){
    clearTimeout(this.task);
  },
}
</script>

<style lang="sass">
.vote{
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  .total{
    position: absolute;
    font-size: 100px;
    z-index: 2;
    color: #fff;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    animation: display-words 0.3s ease 0.8s forwards;
  }
  .op{
    height: 100%;
    display: inline-block;
    position: absolute;
    transition: all 0.5s ease;


    .words{
      padding: 30px;
      font-family: 'Avenir Next Condensed';
      opacity: 0;
      animation: display-words 0.8s ease 0.8s forwards;
      color: #fff;

      .title{
        font-size: 35px;
        position: absolute;
      }
      .content{
        font-size: 60px;
        font-weight: bold;
        position: absolute;
        bottom: 30px;
      }
    }
  }

  .op1{
    background-color: #ffb217;
    transform-origin: right;
    animation: open1 1s cubic-bezier(0.78, 0.02, 0.9, 0.54) 0s forwards;
  }

  .op2{
    background-color: #3644f4;
    transform-origin: left;
    animation: open2 1s cubic-bezier(0.78, 0.02, 0.9, 0.54) 0s forwards;
    .words{
      text-align: right;

      .title{
        right:30px;
      }

      .content{
        right:30px;
      }
    }
  }

  @keyframes open1{
    0%{
      transform: scaleX(0);
    }

    100%{
      transform: scaleX(1);
      transform-origin: right;
    }
  }
  @keyframes open2{
    0%{
      transform: scaleX(0);
    }

    100%{
      transform: scaleX(1);
      transform-origin: left;
    }
  }

  @keyframes display-words{
    0%{
      opacity: 0;
    }

    100%{
      opacity: 1;
    }
  }
}
</style>
