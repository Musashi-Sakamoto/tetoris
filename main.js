//moving tetra mino
const data = {
  score: 0,
  oldCoords: null,
  newCoords: null,
  pos: { x: 3, y: -2 },
  over: false,
};

const renderWell = () => {
  document.querySelector("pre").textContent = `${data.score}\n`;
  well.forEach((r) => {
    document.querySelector("pre").textContent += `${r.join("")}\n`;
  });
};

// 2 dimensional array 20(row) * 10(col)
let well = Array(20)
  .fill(0)
  .map(() => Array(10).fill("□"));

const tets = [
  [
    ["□", "■", "□"],
    ["■", "■", "■"],
    ["□", "□", "□"],
  ], // T
  [
    ["■", "□", "□"],
    ["■", "■", "■"],
    ["□", "□", "□"],
  ], // L
  [
    ["□", "□", "■"],
    ["■", "■", "■"],
    ["□", "□", "□"],
  ], // J
  [
    ["■", "■", "□"],
    ["■", "■", "□"],
    ["□", "□", "□"],
  ], // O
  [
    ["□", "■", "■"],
    ["■", "■", "□"],
    ["□", "□", "□"],
  ], // S
  [
    ["■", "■", "□"],
    ["□", "■", "■"],
    ["□", "□", "□"],
  ], // Z
  [
    ["□", "□", "□", "□"],
    ["■", "■", "■", "■"],
    ["□", "□", "□", "□"],
  ], // I
];

// get a tetra mino randomly
let tet = tets[Math.floor(Math.random() * tets.length)];

window.addEventListener("keydown", (e) => {
  e.code === "ArrowDown" && !data.over && canMove("down") && move("down");
  e.code === "ArrowLeft" && !data.over && canMove("left") && move("left");
  e.code === "ArrowRight" && !data.over && canMove("right") && move("right");
  e.code === "ArrowUp" && !data.over && canMove("rotate") && move();
});

// updating the coordinates of tetra mino
const setCoords = (t, p) =>
  t
    .map((r, i) => r.map((c, j) => ({ x: p.x + j, y: p.y + i, z: c === "■" })))
    .flat();

//placing the moving tetra mino on the well
const placeOnWell = (coords) => {
  coords.forEach((c) => {
    if (c.y >= 0 && c.z) {
      well[c.y][c.x] = "■";
    }
  });
};

//removing the moving tetra mino from the well
const removeFromWell = (coords, w) => {
  const ww = w;
  coords.forEach((c) => {
    if (c.y >= 0 && c.z) {
      ww[c.y][c.x] = "□";
    }
  });
};

// dry-run
const canMove = (dir) => {
  const tempWell = JSON.parse(JSON.stringify(well));
  const tempPos = { ...data.pos };
  data.oldCoords && removeFromWell(data.oldCoords, tempWell);
  if (dir === "rotate") {
    const flipTet = (t) => t[0].map((c, i) => t.map((te) => te[i]));
    const rotateTet = (t) => flipTet([...t].reverse());
    const tempTet = rotateTet(tet);
    const tempNC = setCoords(tempTet, tempPos);
    // ■check & on the well & (outside the well or overlapping)
    const collided = tempNC.some(
      (c) =>
        c.z && c.y >= 0 && (!tempWell[c.y][c.x] || tempWell[c.y][c.x] === "■")
    );
    if (!collided) {
      tet = rotateTet(tet);
      return true;
    }
    return false;
  }
  if (dir === "down") {
    tempPos.y += 1;
    const tempNC = setCoords(tet, tempPos);
    const collided = tempNC.some(
      (c) => c.z && c.y >= 0 && (!tempWell[c.y] || tempWell[c.y][c.x] === "■")
    );
    // inserting(resetting) new tetra mino
    if (data.oldCoords && collided && !well[0].slice(3, 6).includes("■")) {
      data.pos = { x: 3, y: -2 };
      data.newCoords = null;
      data.oldCoords = null;
      clearFullRows();
      tet = tets[Math.floor(Math.random() * tets.length)];
    }
    // game over
    if (collided && well[0].slice(3, 6).includes("■")) {
      well[8] = ["G", "A", "M", "E", " ", "O", "V", "E", "R"];
      data.over = true;
      renderWell();
    }
    return !collided;
  }
  if (dir === "left") {
    tempPos.x -= 1;
    const tempNC = setCoords(tet, tempPos);
    //true (canMove) unless ■ is there or outside the well
    return !tempNC.some(
      (c) =>
        c.z &&
        (!(tempWell[c.y] && tempWell[c.y][c.x]) || tempWell[c.y][c.x] === "■")
    );
  }
  if (dir === "right") {
    tempPos.x += 1;
    const tempNC = setCoords(tet, tempPos);
    //true (canMove) unless ■ is there or outside the well
    return !tempNC.some(
      (c) =>
        c.z &&
        (!(tempWell[c.y] && tempWell[c.y][c.x]) || tempWell[c.y][c.x] === "■")
    );
  }
  return true;
};

const move = (dir) => {
  if (dir === "down") {
    data.pos.y += 1;
  }
  if (dir === "left") {
    data.pos.x -= 1;
  }
  if (dir === "right") {
    data.pos.x += 1;
  }
  data.newCoords = setCoords(tet, data.pos);
  // update coordinates on well
  data.oldCoords && removeFromWell(data.oldCoords, well);
  placeOnWell(data.newCoords);

  data.oldCoords = data.newCoords;
  renderWell();
};

// insert new row only when getting score
const clearFullRows = () => {
  well = well.reduce((acc, cur) => {
    if (cur.every((c) => c === "■")) {
      data.score += 1;
      return [Array(10).fill("□"), ...acc];
    }
    return [...acc, cur];
  }, []);
};

let before = Date.now();

const freeFall = () => {
  const now = Date.now();
  if (now - before >= 500) {
    before = now;
    canMove("down") && move("down");
  }
  well[8][0] !== "G" && requestAnimationFrame(freeFall);
};

requestAnimationFrame(freeFall);
