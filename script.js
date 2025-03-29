const game = (() => {

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

  /* ---------------------------- Board constructor --------------------------- */

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

    return { update, board, isBlocked };
  }

  /* ------------------------ Game variables/constants ------------------------ */

  let board = createBoard();
  const PLAYERS = [];
  let currentPlayer = 0;

  /* ---------------------------- Helper functions ---------------------------- */

  const switchElements = (arrOn, arrOff) => {
    arrOn.forEach(elem => elem.classList.add('switched-on'));
    arrOff.forEach(elem => elem.classList.remove('switched-on'));
  }

  const toggleElements = arr => {
    arr.forEach(elem => elem.classList.toggle('switched-on'));
  }

  const showHideElements = (arrShow, arrHide) => {
    arrShow.forEach(elem => elem.classList.remove('hidden'));
    arrHide.forEach(elem => elem.classList.add('hidden'));
  }

  const fillCell = index => {
    elem.arrCells[index].textContent = PLAYERS[currentPlayer].symbol;
    switchElements([], [elem.arrCells[index]]);
    elem.arrCells[index].classList.add('filled');
  }

  const unfillCell = type => {
    if (type !== 'class' && type !== 'text') return;

    elem.arrCells.forEach(item => {
      type === 'class' ? item.classList.remove('filled') : item.textContent = '';
    });
  }

  /* ------------------------------- Game logic ------------------------------- */

  const createPlayer = (symbol) => {
    return new Promise(resolve => {
      elem.playerNameSymbol.textContent = symbol;
      elem.inputName.value = '';
      setTimeout(() => elem.inputName.focus(), 100);

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

  const initGame = async () => {

    unfillCell('class');
    switchElements([...elem.arrStartDisplay], [...elem.arrGameDisplay, elem.nameX, elem.nameO]);

    elem.smallStartDisplay.addEventListener("transitionend", () => {
      switchElements([elem.symbolX], [elem.symbolO]);
    }, { once: true });

    PLAYERS.splice(0, PLAYERS.length,
      await createPlayer('X'),
      await createPlayer('O')
    );

    showHideElements([], [elem.displayEnd]);

    currentPlayer = 0;
    elem.nameX.textContent = PLAYERS[0].name;
    elem.nameO.textContent = PLAYERS[1].name;

    unfillCell('text');
    switchElements(
      [...elem.arrElementsX, ...elem.arrCells, ...elem.arrGameDisplay, elem.displayName],
      [...elem.arrStartDisplay, elem.buttonAgain, elem.displayEnd]
    );

    setTimeout(() => {
      showHideElements([elem.displayEnd], []);
    }, 1000);

    elem.buttonRestart.disabled = false;
    elem.buttonAgain.disabled = false;
    board.isBlocked = false;
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
      elem.displayEnd.textContent = `${PLAYERS[currentPlayer].name} won!\nCongratulations!`
    } else if (end === 'draw') {
      elem.displayEnd.textContent = `It's a draw!`;
    }
    return 1;
  }

  const play = (row, column) => {
    if (!board.isBlocked) {
      if (board.update(PLAYERS[currentPlayer].symbol, row, column)) {
        fillCell(row * 3 + column);
        if (!checkForWin()) {
          currentPlayer = ++currentPlayer % 2;
          toggleElements([...elem.arrElementsX, ...elem.arrElementsO]);
        } else return
      };
    }
  }

  /* -------------------------------- Handlers -------------------------------- */

  const handleInput = () => {
    const enabled = Boolean(elem.inputName.value.trim());
    elem.buttonAccept.classList.toggle('switched-on', enabled);
    elem.buttonAccept.disabled = !enabled;
  }

  const restartGame = () => {
    elem.buttonRestart.disabled = true;
    elem.buttonAgain.disabled = true;
    if (!elem.displayEnd.classList.contains('switched-on')) showHideElements([], [elem.displayEnd]);
    board = createBoard();
    initGame();
  }

  const playAgain = () => {

    unfillCell('class')
    board = createBoard();
    currentPlayer = 0;

    switchElements(
      [...elem.arrElementsX, elem.displayName],
      [...elem.arrElementsO, ...elem.arrCells, elem.buttonAgain, elem.displayEnd]
    );
    elem.buttonAgain.disabled = true;

    setTimeout(() => {
      unfillCell('text');
      board.isBlocked = false;
      switchElements(elem.arrCells, []);
    }, 600);
  }

  const handleCell = event => {

    const index = Number(event.target.dataset.index)
    const row = Math.floor(index / 3);
    const col = index % 3;

    play(row, col);
  }

  /* --------------------------------- Events --------------------------------- */

  elem.inputName.addEventListener('input', handleInput);
  elem.buttonRestart.addEventListener('click', restartGame);
  elem.buttonAgain.addEventListener('click', playAgain);
  elem.arrCells.forEach(item => {
    item.addEventListener('click', handleCell);
  })

  /* -------------------------------- Init game ------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    initGame();
  });

})();
