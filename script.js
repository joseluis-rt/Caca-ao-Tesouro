let grid_size_x = 10;
let grid_size_y = grid_size_x;
let square_size_height = 35;
let square_size_width = 35;
let grid = document.getElementById("massive-grid");
let current_scale = 1.0;
let path_len = grid_size_x * grid_size_y;
let grid_matrix = [];
let selected;
let num_obstacle = 20;
let search_mode = "bfs";


const pirate_music = new Audio("assets/pirate_music.mp3"); //music
pirate_music.loop = true;
pirate_music.volume = 0.3;

function init() {
  draw_grid(grid_size_x, grid_size_y);
  add_obstacles(num_obstacle);
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
  for (let i = 0; i < num_obstacle; i++) {
    let row = Math.floor(Math.random() * grid_size_x);
    let col = Math.floor(Math.random() * grid_size_y);
    let square = document.querySelector(`.square[data-i="${row}"][data-j="${col}"]`);

    if (square.classList.contains("obstacle")) {
      i--;
    } else {
      let obstacleClass = "";
      let random = Math.random();

      if (random < 0.8) {
        obstacleClass = "obstacle-1";
      } else if (random < 0.9) {
        obstacleClass = "obstacle-2";
      } else {
        obstacleClass = "obstacle-3";
      }

      square.classList.add("obstacle", obstacleClass);
    }
  }
}



function limit_input_obstacle(input) {
  if (input.value > 100) {
    input.value = input.max;
  }
}

function limit_input_x(input) {
  if (input.value > 20) {
    input.value = input.max;
  }
}

function limit_input_y(input) {
  if (input.value > 20) {
    input.value = input.max;
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

  if (elem.classList.contains("obstacle")) {
    return;
  }

  if (startNode === null) {
    startNode = elem;
    elem.classList.add("start");
  } else if (endNode === null) {
    endNode = elem;

    if (draw_path() == false) {
      elem.classList.add("end2");
    } else {
      elem.classList.add("end");
      draw_path();
    }
  } else {
    startNode.classList.remove("start");
    endNode.classList.remove("end");
    endNode.classList.remove("end2");
    startNode = elem;
    endNode = null;
    startNode.classList.add("start");
    clear_path();
  }
}

function change_search_mode() {
  search_mode = document.getElementById("search-mode").value;
}

function draw_path() {
  if (startNode === null || endNode === null) return;
  clear_path();

  let path;

  if (search_mode === "bfs") {
    path = shortest_path(startNode, endNode);
  } else if (search_mode === "dfs") {
    path = depth_first_search(startNode, endNode);
    /*} else if (search_mode === "dijkstra") {
    path = dijkstra(startNode, endNode);*/
  } else {
    console.error("Invalid search mode:", search_mode);
    return;
  }

  if (path == null) {
    return false;
  } else {
    for (let elem of path) {
      elem.classList.add("path");
    }
  }

  let count = path.length;
  update_step_count(count);
}

function update_step_count(count) {
  let stepCount = document.getElementById("step-count");
  stepCount.innerText = count - 1;
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
  let neighbors = [
    (grid_matrix[i - 1] || [])[j],
    (grid_matrix[i] || [])[j + 1],
    (grid_matrix[i + 1] || [])[j],
    (grid_matrix[i] || [])[j - 1]
  ];

  return neighbors.filter(
    (neighbor) =>
      neighbor !== undefined && !neighbor.classList.contains("obstacle")
  );
}

function depth_first_search(start, end) {
  let visited = new Set();
  let stack = [[start, []]];

  while (stack.length > 0) {
    let [node, path] = stack.pop();

    if (node === end) {
      return path.concat([node]);
    }

    if (visited.has(node)) continue;
    visited.add(node);

    for (let neighbor of get_neighbors(node)) {
      if (!visited.has(neighbor)) {
        stack.push([neighbor, path.concat([node])]);
      }
    }
  }

  return null;
}

//function dijkstra(start, end) {}

function restart_obstacles() {
  let obstacles = document.querySelectorAll(".obstacle");

  for (let obstacle of obstacles) {
    obstacle.classList.remove("obstacle");
  }

  // remove "start" and "end" classes from grid_matrix
  for (let row of grid_matrix) {
    for (let elem of row) {
      elem.classList.remove("start");
      elem.classList.remove("end");
    }
  }

  // reset grid_matrix to an empty array
  grid_matrix = [];
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  // redraw the grid and add new obstacles
  draw_grid(grid_size_x, grid_size_y);
  add_obstacles(num_obstacle);
  clear_path();
}

function update_obstacles() {
  let num_input = document.getElementById("num-obstacles");
  let new_num_obstacle = parseInt(num_input.value);

  if (!isNaN(new_num_obstacle)) {
    num_obstacle = new_num_obstacle;
    restart_obstacles();
  }

  startNode.classList.remove("start");
  endNode.classList.remove("end");
  endNode.classList.remove("end2");
  clear_path();
}

function change_grid_size() {
  let grid_size_x_input = document.getElementById("grid-size-x");
  let grid_size_y_input = document.getElementById("grid-size-y");

  let new_grid_size_x = parseInt(grid_size_x_input.value);
  let new_grid_size_y = parseInt(grid_size_y_input.value);

  if (new_grid_size_x !== grid_size_x || new_grid_size_y !== grid_size_y) {
    grid_size_x = new_grid_size_x;
    grid_size_y = new_grid_size_y;
    grid_matrix = [];
    path_len = grid_size_x * grid_size_y;
    grid.innerHTML = "";
    init();
  }
}

init();

window.onclick = function () {
  pirate_music.play();
};
