/**
 * -----------------------> x++++
 * /\ ||
 * || ||
 * || ||
 * || ||
 * || ||
 * || \/   y++++
 */
//import './app.js';
// import { Stream } from './stream.js';
import Vue from 'vue';
import VueResource from 'vue-resource';
import summary from './components/summary.vue';
import imageStack from './components/image-stack.vue';
import vote from './components/vote.vue';

class point{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }

  toString(){
    return `${this.x},${this.y}`;
  }
};

const MARGIN = 12.5;

//画线条
function caculateLine(totalWdith, unitWidth, height){
  totalWdith = totalWdith - 2 * MARGIN;
  height = height - 2 * MARGIN;
  const unitLength = unitWidth + height;
  const sequence = [];
  sequence.push(new point(MARGIN, MARGIN));

  const unitCount = parseInt(totalWdith/unitWidth);

  for(let i = 0; i< unitCount; i++){
    if(i%2 === 0){
      sequence.push(new point(i*unitWidth + MARGIN, MARGIN));
      sequence.push(new point(i*unitWidth + MARGIN, height + MARGIN));
    } else {
      sequence.push(new point(i*unitWidth + MARGIN, height + MARGIN));
      sequence.push(new point(i*unitWidth + MARGIN, MARGIN));
    }
  }

  return [ sequence.map(e=>e.toString()).join(' '), unitLength*unitCount];
}

const [height, unitWidth, totalWidth] =  [490, 25, 1400];
const [bgLine] = caculateLine(1315, unitWidth, height);

const [ linePoints, totalLength ] = caculateLine(totalWidth, unitWidth, height);

function bytesToMB(bytes) {
  const k = 1024;
  return bytes/k/k;
}
// let data = [
//   {
//     type: 'c1',
//     mem: 100,
//     id: 1,
//   },
//   {
//     type: 'c2',
//     mem: 50,
//     id: 2,
//   },
//   {
//     type: 'c3',
//     mem: 75,
//     id: 3,
//   },
//   {
//     type: 'c1',
//     mem: 90,
//     id: 4,
//   },
//   {
//     type: 'c3',
//     mem: 60,
//     id: 5,
//   },
//   {
//     type: 'c1',
//     mem: 85,
//     id: 6,
//   },
//   {
//     type: 'c1',
//     mem: 90,
//     id: 7,
//   },
//   {
//     type: 'c2',
//     mem: 60,
//     id: 8,
//   },
//   {
//     type: 'c2',
//     mem: 70,
//     id: 9,
//   },
//   {
//     type: 'c3',
//     mem: 180,
//     id: 10,
//   },
// ];

// window.data = data;
let containers = {};



const [ strokeOffset ]  = [ 22 ];
const [ maxMem ] = [ 8000 ];

function draw(_data){
  _data = _data.sort((a,b) => a.id < b.id);
  const svgs = {};
  const container = $('.container');
  let headPosition = 0;

  const k = totalLength / maxMem;
  _data = _data.map(e=>{
    e.mem = parseInt(e.mem*k);
    if(e.mem < strokeOffset) e.mem = strokeOffset;
    return e;
  });
  _data.forEach(d => {
    let $svg = svgs[d.type];
    if($svg){
      const dPosition = headPosition - $svg.position;
      $svg.dasharray +=`, ${ strokeOffset + dPosition }`; // 空开距离
      $svg.dasharray +=`, ${d.mem - strokeOffset}`;
    } else {
      svgs[d.type] = {
        position: headPosition + d.mem,
        dasharray: `0, ${headPosition}, ${d.mem - strokeOffset}`,
      }
      $svg = svgs[d.type];
    }
    headPosition += d.mem;
    $svg.position = headPosition;
  });

  Object.keys(svgs).forEach(k => {
    const $svg = svgs[k];
    $svg.dasharray += `, ${totalLength - $svg.position + strokeOffset }`;
    container.append(`<svg id="${k}"><polyline points="${linePoints}" stroke-dasharray="${$svg.dasharray}"></polyline></svg>`);
  });

  if(_data.length > 0){
    $(`svg`).attr('style', '');
    $(`#${_data[0].type}`).attr('style', 'z-index: 100');
  }

  console.log(svgs);
  return svgs;
}

// draw(data);

const refresh = (_data) => {
  _data = _data.sort((a,b) => a.id < b.id);
  const svgs = {};
  const container = $('.container');
  let headPosition = 0;

  const k = totalLength / maxMem;
  _data = _data.map(e=>{
    e.mem = parseInt(e.mem*k);
    if(e.mem < strokeOffset) e.mem = strokeOffset;
    return e;
  });
  _data.forEach(d => {
    let $svg = svgs[d.type];
    if($svg){
      const dPosition = headPosition - $svg.position;
      $svg.dasharray +=`, ${ strokeOffset + dPosition }`; // 空开距离
      $svg.dasharray +=`, ${d.mem - strokeOffset}`;
    } else {
      svgs[d.type] = {
        position: headPosition + d.mem,
        dasharray: `0, ${headPosition}, ${d.mem - strokeOffset}`,
      }
      $svg = svgs[d.type];
    }
    headPosition += d.mem;
    $svg.position = headPosition;
  });
  //console.log(svgs);

  Object.keys(svgs).forEach(k => {
    const $svg = svgs[k];
    $svg.dasharray += `, ${totalLength - $svg.position + strokeOffset }`;
    $('#'+k+' polyline').attr('stroke-dasharray', $svg.dasharray);
  });

  if(_data.length > 0){
    $(`svg`).attr('style', '');
    $(`#${_data[0].type}`).attr('style', 'z-index: 100');
  }

  return svgs;
}

let hasChange = false;

window.refresh = refresh;


const deleteContainer = id => {
  const len = data.length;
  for(let i=0; i < len; i++){
    if(data[i].id = id) {
      data.splice(i);
      hasChange = true;
      break;
    }
  }
}

const addContainer = container => {
  console.log('add')
  if(!data.find(e=>e.id === container.id)){
    data.push(container);
    console.log(data);
    hasChange = true;
  }
}

const updateContainer = container => {
  const c = data.find(e=>e.id === container.id);
  if(c){
    c.mem = container.mem;
    hasChange = true;
  }
}

const createWS = () => {
  // Open up a connection to our server
  let ws = new WebSocket("ws://54.238.140.58:10000/");

  // What do we do when we get a message?
  ws.onmessage = function(evt) {
      const dd = JSON.parse(evt.data);
      dd.mem = bytesToMB(data.mem);
      switch(dd.event){
        case 'created':
          addContainer(dd);
          break;
        case 'stat':
          updateContainer(dd);
          break;
        case 'deleted':
          deleteContainer(dd.id);
          break;
      }
  }
  // Just update our conn_status field with the connection status
  ws.onopen = function(evt) {
    console.log('connected');
  }
  ws.onerror = function(evt) {
    console.log('error');
  }
  ws.onclose = function(evt) {
    console.log('close');
  }

  return ws;
}

const createStream = () => {
  const stream = new Stream('http://54.249.38.5:10000/stat');
  stream.get().notify(d => {
    const dd = JSON.parse(evt.data);
      dd.mem = bytesToMB(data.mem);
      switch(dd.event){
        case 'created':
          addContainer(dd);
          break;
        case 'stat':
          updateContainer(dd);
          break;
        case 'deleted':
          deleteContainer(dd.id);
          break;
      }
  })
}

let created = false;

const registerRefresh = ()=>{
  return setInterval(()=>{
    if(!created){
      const dd = {};
      data.forEach(e => {
        dd[e.type] = true;
      })
      console.log(Object.keys(dd).length);
      if(Object.keys(dd).length === 5){
        draw(data);
        created = true;
      }
    } else {
      console.log(data);
      if(hasChange) refresh(data);
    }

  }, 5000);
}

//window.interval = registerRefresh();

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
    images: [],
    container: 0,
  }),
  methods:{
    toggleVote(){
      this.displayVote = !this.displayVote;
    },
    fetchData(){
      return this.$http.get('http://54.249.38.5:10000/stat').then(d => d.data);
    },
    getImages(svgs){
      console.log(svgs);
      this.images = Object.keys(svgs).map( e=> ({
        name: e,
        count: svgs[e].dasharray.split(',').length,
      }));
    }
  },
  created(){
    const startTask = () => {
      this.fetchData().then(d=>{
        if(!d[0] || !d[0].mem) {
          setTimeout(() => startTask(), 2500);
          return;
        }
        const dd = {};
        d = d.map(e => {
          e.mem = bytesToMB(e.mem);
          e.type = e.type.replace(/\/|#|\.|:/g, '-')
          dd[e.type] = true;
          return e;
        });
        console.log(Object.keys(dd).length);
        this.container = d.length;
        if(!created){
          if(Object.keys(dd).length === 9){
            this.getImages(draw(d));
            created = true;
          }
        } else {
          this.getImages(refresh(d));
        }
        setTimeout(() => startTask(), 2500);
      }, ()=>{
        setTimeout(() => startTask(), 2500);
      });
    };

    startTask();
  }
});
