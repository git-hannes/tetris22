class Piece {
  constructor({ type, matrix }) {
    this.type = type;
    this.pos = { x: 3, y: 0 };
    this.matrix = matrix;
    this.rows = this.cols = this.matrix.length;
    this.ghost = structuredClone(this);
  }

  static select() {
    const randNr = Math.random() * 7 | 0;
    return new Piece(pieces[randNr]);
  }

  draw(ghost = false) {
    /**
    * Losing condition: If piece is immediately blocked
    * at spawn location (pos.y === 0), the game is over
    */
    if (!this.pos.y && this.collision()) {
      game.stop();
    }

    const matrix = ghost ? this.ghost.matrix : this.matrix;
    const posX = ghost ? this.ghost.pos.x : this.pos.x;
    const posY = ghost ? this.ghost.pos.y : this.pos.y;
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.drawImage(images[value - 1], x + posX, y + posY, 1, 1);
        }
      })
    })
  }

  drop() {
    this.pos.y++;
    game.loop.dropCounter = 0;
    if (this.collision()) {
      this.lock();
    }
  }
  
  getGhost() {
    this.ghost = structuredClone(this);
    while(!this.collision(this.ghost)) {
      this.ghost.pos.y++;
    }
    this.ghost.pos.y--;
    this.draw(this.ghost);
  }

  hardDrop() {
    while (!this.collision()) {
      this.pos.y++;
    }
    this.pos.y--;
    game.loop.lastTime = 0;
  }

  move(dir) {
    this.pos.x += dir;
    if (this.collision()) {
      this.pos.x -= dir;
    }
  }

  rotate(dir) {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < y; x++) {
        [
          [this.matrix[y][x]],
          [this.matrix[x][y]],
        ] = [
            [this.matrix[x][y]],
            [this.matrix[y][x]],
          ];
      }
    }
    dir > 0 ? this.matrix.forEach(row => row.reverse()) : this.matrix.reverse();
    
    if (this.collision()) {
      this.wallKick();
    }
  }

  wallKick() {
    let offset = 1;
    while (this.collision()) {
      this.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1))
    }
  }

  collision(ghost = false) {
      const posX = ghost ? this.ghost.pos.x : this.pos.x;
      const posY = ghost ? this.ghost.pos.y : this.pos.y;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (
          
          // check if piece value is not 0
          this.matrix[y][x] &&
          (

            // check if row exists
            playfield.matrix[y + posY] &&

            // check if playfield value is also not 0
            playfield.matrix[y + posY][x + posX]
          ) !== 0
        ) {
          return true;
        }
      }
    }
    return false;
  }

  lock() {
    this.pos.y--;
    playfield.merge(this);
    playfield.scanForFullRows();

    piece = Piece.select();
    //this.pos.y = 0;
  }
}

const pieces = [
  {
    type: "iPiece",
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    image: "./img/iPiece.jpg"
  },
  {
    type: "jPiece",
    matrix: [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ],
    image: "./img/jPiece.jpg"
  },
  {
    type: "lPiece",
    matrix: [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ],
    image: "./img/lPiece.jpg"
  },
  {
    type: "oPiece",
    matrix: [
      [0, 4, 4, 0],
      [0, 4, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    image: "./img/oPiece.jpg"
  },
  {
    type: "sPiece",
    matrix: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ],
    image: "./img/sPiece.jpg"
  },
  {
    type: "tPiece",
    matrix: [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ],
    image: "./img/tPiece.jpg"
  },
  {
    type: "zPiece",
    matrix: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ],
    image: "./img/zPiece.jpg"
  },
]

function createImageArray() {
  const imgs = [];

  pieces.forEach(piece => {
    let img = new Image();
    img.src = piece.image;
    imgs.push(img);
  })
  return imgs;
}

const images = createImageArray();