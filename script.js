function createBoard() {
  const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];

  let isBlocked = false;

  const update = (symbol, row, column) => {
    if (board[row][column] === '') {
      board[row][column] = symbol;
      return 1;
    } else return 0;
  }

  const show = () => {
    console.table(board);
  }

  return { update, show, board, isBlocked };
}

function createPlayer(name, symbol) {
  return { name, symbol };
}

const game = (() => {
  let board = createBoard();
  const players = [];
  let currentPlayer = 0;

  const playPrompt = () => {
    console.log(`${players[currentPlayer].name} to play.`);
  }

  const initGame = () => {
    players.splice(0);
    players.push(createPlayer(prompt('X – Enter your name:'), 'X'))
    players.push(createPlayer(prompt('O – Enter your name:'), 'O'))
    board.show();
    playPrompt();
  }

  const checkForWin = () => {
    const checkLine = (a, b, c) => a && a === b && b === c;
    const brd = board.board;
    let isDraw = true;

    if (
      checkLine(brd[0][0], brd[1][1], brd[2][2]) ||
      checkLine(brd[0][2], brd[1][1], brd[2][0])
    ) return handleEnd('win');

    for (let i = 0; i <= 2; i++) {
      if (brd[i].includes('')) isDraw = false;
      if (
        checkLine(brd[0][i], brd[1][i], brd[2][i]) ||
        checkLine(brd[i][0], brd[i][1], brd[i][2])
      ) return handleEnd('win');
    }

    if (isDraw) return handleEnd('draw');

    return 0;
  }

  const handleEnd = end => {
    board.isBlocked = true;
    if (end === 'win') {
      console.log(`${players[currentPlayer].name}, you've won! Congratulations!`);
    } else if (end === 'draw') {
      console.log(`It's a draw!`);
    }
    return 1;
  }

  const restartGame = () => {
    board = createBoard();
    initGame();
  }

  const play = (row, column) => {
    if (!board.isBlocked) {
      if (board.update(players[currentPlayer].symbol, row, column)) {
        board.show();
        if (!checkForWin()) {
          currentPlayer = ++currentPlayer % 2;
        } else return
      } else {
        board.show();
        console.log('Wrong move!');
      };
      playPrompt();
    }
  }

  // initGame();
  return { restartGame, play };

})();
