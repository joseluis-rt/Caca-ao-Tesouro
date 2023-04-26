let grid_size_x = 10;
let grid_size_y = grid_size_x;
let square_size_height = 40;
let square_size_width = 40;
let grid = document.getElementById("massive-grid");
let current_scale = 1.0;
let path_len = grid_size_x * grid_size_y;
let grid_matrix = [];
let selected;
let num_obstacle = 20;


function init() {
  draw_grid(grid_size_x, grid_size_y);
  add_obstacles(num_obstacle);
  grid.addEventListener("wheel", scroll_handler);
}

function draw_grid(height, width) {
  let grid_width = width * square_size_width + width * 2;

  grid.style.width = `${grid_width}px`;

  for (let i = 0; i < height; i++) {
    grid_matrix.push([]);

    for (let j = 0; j < width; j++) {
      let square = document.createElement("div");
      square.classList.add("square");

      square.style.height = `${square_size_height}px`;

      square.style.width = `${square_size_width}px`;
      square.dataset.i = i;
      square.dataset.j = j;
      square.addEventListener("mouseenter", square_mouseenter);
      square.addEventListener("mouseleave", square_mouseleave);
      square.addEventListener("click", square_click);
      grid.appendChild(square);
      grid_matrix[i].push(square);
    }
  }
}

function add_obstacles(num_obstacle) {
  let added_obstacle = 0;
  
  while (added_obstacle < num_obstacle) {
    let i = Math.floor(Math.random() * grid_size_x);
    let j = Math.floor(Math.random() * grid_size_y);
    let node = grid_matrix[i][j];
    
    if (!node.classList.contains("start") && !node.classList.contains("end") && !node.classList.contains("obstacle")) {
      node.classList.add("obstacle");
      added_obstacle++;
    }
  }
}


function square_mouseenter(event) {
  let elem = event.target;
  elem.classList.add("highlight");
  draw_path(elem);
}

function square_mouseleave(event) {
  event.target.classList.remove("highlight");
}

let startNode = null;
let endNode = null;

function square_click(event) {
  let elem = event.target;
  
  if (startNode === null) {
    startNode = elem;
    elem.classList.add("start");
  } else if (endNode === null) {
    endNode = elem;
    elem.classList.add("end");
    draw_path();
  } else {
    startNode.classList.remove("start");
    endNode.classList.remove("end");
    startNode = elem;
    endNode = null;
    startNode.classList.add("start");
  }
}

function draw_path() {
  if (startNode === null || endNode === null) return;
  clear_path();
  let path = shortest_path(startNode, endNode);

  for (let elem of path) {
    elem.classList.add("path");
  }
}


function clear_path() {
  for (let elem of document.querySelectorAll(".path")) {
    elem.classList.remove("path");
  }
}

function shortest_path(start, end) {
  let visited = new Set();
  let queue = [[start, []]];
  
  while (queue.length > 0) {
    let [node, path] = queue.shift();
    
    if (node === end) {
      return path.concat([node]);
    }
    
    if (visited.has(node)) continue;
    visited.add(node);
    
    for (let neighbor of get_neighbors(node)) {
      if (!visited.has(neighbor)) {
        queue.push([neighbor, path.concat([node])]);
      }
    }
  }
  
  return null;
}

function get_neighbors(node) {
  let i = Number(node.dataset.i);
  let j = Number(node.dataset.j);
  let neighbors = [    (grid_matrix[i - 1] || [])[j],
    (grid_matrix[i] || [])[j + 1],
    (grid_matrix[i + 1] || [])[j],
    (grid_matrix[i] || [])[j - 1],
  ];
  
  return neighbors.filter(neighbor => neighbor !== undefined && !neighbor.classList.contains("obstacle"));
}


init();
