/**
 * -----------------------> x++++
 * /\ ||
 * || ||
 * || ||
 * || ||
 * || ||
 * || \/   y++++
 */

/** -- prepare data -- **/

const sample = [30, 33, 65, 38, 3 ,86, 34,14,4,23,56];
const [sizeX, sizeY] = [20, 10];
class container {
  constructor(size, before) {
    this.before = before;;
    if (!before) {
      this.start = 0;
      this.end = size - 1;
      return this;
    }
    this.start = before.end + 1;
    this.end = this.start + size - 1;
  }
}

class Point {
  constructor(x, y, before, after) {
    this.x = x;
    this.y = y;
    this.before = before;
    this.after = after;
  }
}

const containers = sample.reduce((preResult, data) => [...preResult, new container(data, preResult[preResult.length - 1])], []);

/* -- matrix related -- */

/**
 * [description]
 * @param  {[type]} offset    从 (0,0) 开始计算的偏移量
 * @param  {[type]} options.x [description]
 * @param  {[type]} options.y [description]
 * @return {[type]}           [description]
 */
const find = (offset, {x = sizeX, y = sizeY} = {}) => { // x:0~99 y: 0~99
  let col = parseInt(offset / x);
  const dy = y - offset % x;
  if (col % 2 === 0) {
    return {
      x: col,
      y: dy - 1,
    };
  }

  const row = y - dy;
  return {
    x: col,
    y: row,
  }
}
// 连成一条
const link = (matrix, from, to, type) => {
  const raise = (start, end, i, startPoint) => {
    matrix[i][start] = new Point(i, start, startPoint);
    matrix[i][start].type = type;
    startPoint && (startPoint.after = matrix[i][start]);
    for (let j = start - 1; j >= end; j--) {
      const p = new Point(i, j);
      p.type = type;
      p.before = matrix[i][j + 1];
      matrix[i][j + 1].after = p;
      matrix[i][j] = p;
    }
    return [0, matrix[i][end]];
  };

  const down = (start, end, i, startPoint) => {
    matrix[i][start] = new Point(i, start, startPoint);
    matrix[i][start].type = type;
    startPoint && (startPoint.after = matrix[i][start]);
    for (let j = start + 1; j <= end; j++) {
      const p = new Point(i, j);
      p.type = type;
      p.before = matrix[i][j - 1];
      matrix[i][j - 1].after = p;
      matrix[i][j] = p;
    }
    return [sizeY - 1, matrix[i][end]];
  }
  let [$start, $end, startPoint] = [from.y];
  for (let i = from.x; i <= to.x; i++) {
    if (i % 2 === 0) {
      $end = (to.x === i) ? to.y : 0;
      [$start, startPoint] = raise($start, $end, i, startPoint);
    } else {
      $end = (to.x === i) ? to.y : sizeY - 1;
      [$start, startPoint] = down($start, $end, i, startPoint);
    }
  }

  return from;
}
/** -------------------- */

const $container = $('.container');
const createNode = (r, c, type) => {
  const node = $(`<div class="unit c-${c} r-${r} ${type}"></div>`);
  $container.append(node);
  return node;
}

let containerMatrix = new Array(sizeX).fill(0).map(()=>new Array(sizeY).fill({}));
console.log(containerMatrix);
containers.forEach((aContainer,i) => {
  let {start, end} = aContainer;
  start = find(start);
  end = find(end);
  const {x,y} = link(containerMatrix, start, end, 'type-'+ 2*i);
  console.log(containerMatrix);
});

containerMatrix.forEach(row => row.forEach(p => p.x !== undefined && (p.node = createNode(p.y, p.x, `${p.type} ${p.after ? '' : 'tail'}`))));

