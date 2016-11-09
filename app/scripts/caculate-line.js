class point{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }

  toString(){
    return `${this.x},${this.y}`;
  }
};


export default function(totalWdith, unitWidth, height){
  const sequence = [];
  sequence.push(new point(0,0));

  const unitCount = parseInt(totalWdith/unitWidth);

  for(let i = 0; i< unitCount; i++){
    if(i%2 === 0){
      sequence.push(i*unitWidth, 0);
      sequence.push(i*unitWidth, height);
    } else {
      sequence.push(i*unitWidth, height);
      sequence.push(i*unitWidth, 0);
    }

    return sequence.map(e=>e.toString()).join(' ');
  }
}
