/* -------------------------------- Elements -------------------------------- */

const elem = {
  buttonAccept: document.querySelector('.display__button.accept'),
  buttonRestart: document.querySelector('.display__button.restart'),
  buttonAgain: document.querySelector('.display__button.again'),
  inputName: document.querySelector('.display__input'),
  playerNameSymbol: document.querySelector('.display__message.player .symbol'),
  smallStartDisplay: document.querySelector('.display.small .start'),
  smallGameDisplay: document.querySelector('.display.small .game'),
  largeStartDisplay: document.querySelector('.display.large .start'),
  largeGameDisplay: document.querySelector('.display.large .game'),
  displayName: document.querySelector('.display__name'),
  displayEnd: document.querySelector('.display__end'),
  symbolX: document.querySelector('.display__symbol .symbol.x'),
  symbolO: document.querySelector('.display__symbol .symbol.o'),
  nameX: document.querySelector('.display__name .name.x'),
  nameO: document.querySelector('.display__name .name.o'),
  arrCells: Array.from(document.querySelectorAll('.game-board__cell'))
}

elem.arrStartDisplay = [elem.smallStartDisplay, elem.largeStartDisplay];
elem.arrGameDisplay = [elem.smallGameDisplay, elem.largeGameDisplay];
elem.arrElementsX = [elem.symbolX, elem.nameX];
elem.arrElementsO = [elem.symbolO, elem.nameO];

/* ------------------------------ Constructors ------------------------------ */

function createBoard() {
  const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];

  let isBlocked = true;

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
      elem.inputName.value = '';

      const handleEnterPress = event => {
        if (event.key === "Enter") handleAccept();
      }

      const handleAccept = () => {
        const name = elem.inputName.value.trim();
        if (name) {
          elem.buttonAccept.removeEventListener('click', handleAccept);
          elem.inputName.removeEventListener('keydown', handleEnterPress);
          elem.inputName.value = '';
          handleInput();
          resolve({ name, symbol });
        }
      };

      elem.buttonAccept.addEventListener('click', handleAccept);
      elem.inputName.addEventListener('keydown', handleEnterPress);
    })
  }

  const switchElements = (arrOn, arrOff) => {
    if (arrOn.length > 0) arrOn.forEach(elem => elem.classList.add('switched-on'));
    if (arrOff.length > 0) arrOff.forEach(elem => elem.classList.remove('switched-on'));
  }

  const toggleElements = arr => {
    arr.forEach(elem => elem.classList.toggle('switched-on'));
  }

  const showHideElements = (arrShow, arrHide) => {
    if (arrShow.length > 0) arrShow.forEach(elem => elem.classList.remove('hidden'));
    if (arrHide.length > 0) arrHide.forEach(elem => elem.classList.add('hidden'));
  }

  const playAgain = () => {
    elem.arrCells.forEach(item => {
      item.classList.remove('filled');
    })

    board = createBoard();

    currentPlayer = 0;
    switchElements(
      [...elem.arrElementsX, elem.displayName],
      [...elem.arrElementsO, ...elem.arrCells, elem.buttonAgain, elem.displayEnd]
    );

    elem.buttonAgain.disabled = true;

    setTimeout(() => {
      elem.arrCells.forEach(item => {
        item.textContent = ''
      });
      board.isBlocked = false;
      board.show();
      playPrompt();
      switchElements(elem.arrCells, []);
    }, 600);


  }

  const initGame = async () => {

    elem.arrCells.forEach(item => {
      item.classList.remove('filled');
    })

    switchElements([...elem.arrStartDisplay], [...elem.arrGameDisplay, elem.nameX, elem.nameO]);

    const switchOnTransitionEnd = () => {
      switchElements([elem.symbolX], [elem.symbolO]);
    };

    elem.smallStartDisplay.addEventListener("transitionend", switchOnTransitionEnd, { once: true });

    players.splice(0, players.length,
      await createPlayer('X'),
      await createPlayer('O')
    );

    showHideElements([], [elem.displayEnd]);

    currentPlayer = 0;

    elem.nameX.textContent = players[0].name;
    elem.nameO.textContent = players[1].name;

    elem.arrCells.forEach(item => {
      item.textContent = ''
    });

    switchElements(
      [...elem.arrElementsX, ...elem.arrCells, ...elem.arrGameDisplay, elem.displayName],
      [...elem.arrStartDisplay, elem.buttonAgain, elem.displayEnd]
    );

    setTimeout(() => {
      showHideElements([elem.displayEnd], []);
    }, 1000);

    elem.buttonRestart.disabled = false;
    elem.buttonAgain.disabled = false;
    board.show();
    board.isBlocked = false;
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
    switchElements([elem.buttonAgain, elem.displayEnd], [...elem.arrCells, elem.displayName]);
    elem.buttonAgain.disabled = false;
    if (end === 'win') {
      console.log(`${players[currentPlayer].name}, you've won! Congratulations!`);
      elem.displayEnd.textContent = `${players[currentPlayer].name} won!\nCongratulations!`
    } else if (end === 'draw') {
      console.log(`It's a draw!`);
      elem.displayEnd.textContent = `It's a draw!`;
    }
    return 1;
  }

  const restartGame = () => {
    elem.buttonRestart.disabled = true;
    elem.buttonAgain.disabled = true;
    if (!elem.displayEnd.classList.contains('switched-on')) showHideElements([], [elem.displayEnd]);
    board = createBoard();
    initGame();
  }

  const fillCell = index => {
    elem.arrCells[index].textContent = players[currentPlayer].symbol;
    switchElements([], [elem.arrCells[index]]);
    elem.arrCells[index].classList.add('filled');
  }

  const play = (row, column) => {
    if (!board.isBlocked) {
      if (board.update(players[currentPlayer].symbol, row, column)) {
        board.show();
        fillCell(row * 3 + column);
        if (!checkForWin()) {
          currentPlayer = ++currentPlayer % 2;
          toggleElements([...elem.arrElementsX, ...elem.arrElementsO]);
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

  return { restartGame, play, playAgain };

})();

/* -------------------------------- Handlers -------------------------------- */

const handleInput = () => {
  if (elem.inputName.value) {
    elem.buttonAccept.classList.add("switched-on");
    elem.buttonAccept.disabled = false;
  } else {
    elem.buttonAccept.classList.remove("switched-on");
    elem.buttonAccept.disabled = true;
  }
}

const handleCell = event => {

  const index = Number(event.target.dataset.index)
  const row = Math.floor(index / 3);
  const col = index % 3;

  game.play(row, col)
}

/* --------------------------------- Events --------------------------------- */

elem.inputName.addEventListener('input', handleInput);
elem.buttonRestart.addEventListener('click', game.restartGame);
elem.buttonAgain.addEventListener('click', game.playAgain);
elem.arrCells.forEach(item => {
  item.addEventListener('click', handleCell);
})
