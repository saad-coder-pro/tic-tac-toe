const elem = {
  acceptButton: document.querySelector('.display__button.accept'),
  nameInput: document.querySelector('.display__input'),
  playerNameSymbol: document.querySelector('.display__message.player .symbol'),
  smallStartDisplay: document.querySelector('.display.small .start'),
  smallGameDisplay: document.querySelector('.display.small .game'),
  largeStartDisplay: document.querySelector('.display.large .start'),
  largeGameDisplay: document.querySelector('.display.large .game'),
}

elem.arrStartDisplay = [elem.smallStartDisplay, elem.largeStartDisplay];
elem.arrGameDisplay = [elem.smallGameDisplay, elem.largeGameDisplay];

console.log(elem)

/* ------------------------------ Constructors ------------------------------ */

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

// function createPlayer(name, symbol) {
//   return { name, symbol };
// }

/* ---------------------------------- Game ---------------------------------- */

const game = (() => {
  let board = createBoard();
  const players = [];
  let currentPlayer = 0;

  const playPrompt = () => {
    console.log(`${players[currentPlayer].name} to play.`);
  }

  const createPlayer = (symbol) => {
    return new Promise(resolve => {
      elem.playerNameSymbol.textContent = symbol;
      elem.nameInput.value = '';
      elem.nameInput.focus();

      const handleEnterPress = event => {
        if (event.key === "Enter") handleAccept();
      }

      const handleAccept = () => {
        const name = elem.nameInput.value.trim();
        if (name) {
          elem.acceptButton.removeEventListener('click', handleAccept);
          elem.nameInput.removeEventListener('keydown', handleEnterPress);
          elem.nameInput.value = '';
          handleInput();
          resolve({ name, symbol });
        }
      };

      elem.acceptButton.addEventListener('click', handleAccept);
      elem.nameInput.addEventListener('keydown', handleEnterPress);
    })
  }

  const switchElements = (arrOn, arrOff) => {
    arrOn.forEach(elem => elem.classList.add('switched-on'));
    arrOff.forEach(elem => elem.classList.remove('switched-on'));
  }

  const initGame = async () => {

    switchElements(elem.arrStartDisplay, elem.arrGameDisplay)
    // switchElements(elem.arrGameDisplay, elem.arrStartDisplay)

    players.splice(0, players.length,
      await createPlayer('X'),
      await createPlayer('O')
    );

    switchElements(elem.arrGameDisplay, elem.arrStartDisplay)

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

  document.addEventListener("DOMContentLoaded", () => {
    initGame();
  });

  return { restartGame, play };

})();

/* -------------------------------- Handlers -------------------------------- */

const handleInput = () => {

  if (elem.nameInput.value) {
    elem.acceptButton.classList.add("switched-on");
    elem.acceptButton.disabled = false;
  } else {
    elem.acceptButton.classList.remove("switched-on");
    elem.acceptButton.disabled = true;
  }
}

/* --------------------------------- Events --------------------------------- */

elem.nameInput.addEventListener("input", handleInput);
