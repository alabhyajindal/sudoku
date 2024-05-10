'use strict'

function generatePuzzle() {
  const grid = [...Array(9)].map(() => Array(9).fill(0))

  function backtrack(row, col) {
    if (row === 9) return true
    if (col === 9) return backtrack(row + 1, 0)
    if (grid[row][col] !== 0) return backtrack(row, col + 1)

    const shuffledNumbers = Array.from({ length: 9 }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5
    )

    for (const num of shuffledNumbers) {
      if (isValidPlacement(row, col, num)) {
        grid[row][col] = num
        if (backtrack(row, col + 1)) return true
        grid[row][col] = 0 // Backtrack
      }
    }
    return false // No valid placement found
  }

  function isValidPlacement(row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (
        grid[row][i] === num ||
        grid[i][col] === num ||
        grid[Math.floor(row / 3) * 3 + Math.floor(i / 3)][
          Math.floor(col / 3) * 3 + (i % 3)
        ] === num
      ) {
        return false
      }
    }
    return true
  }

  backtrack(0, 0)

  // Create the big squares
  const bigSquares = []
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 9; j += 3) {
      const square = []
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          square.push(grid[i + k][j + l])
        }
      }
      bigSquares.push(square)
    }
  }

  return bigSquares
}

function getHistory() {
  const solvedPuzzle = generatePuzzle()
  const flatSolved = solvedPuzzle.flat()

  const randomIndexes = new Set()
  while (randomIndexes.size < 35) {
    randomIndexes.add(Math.floor(Math.random() * flatSolved.length))
  }
  const flatPuzzle = flatSolved.map((value, index) =>
    randomIndexes.has(index) ? null : value
  )

  const smalls = document.querySelectorAll('.small')
  const data = {}

  for (let i = 0; i < smalls.length; ++i) {
    const small = smalls[i]
    const column = small.classList[2].split('-')[0]
    const row = small.classList[2].split('-')[1]

    data[`${column}-${row}`] = {
      value: flatPuzzle[i],
      answer: flatSolved[i],
      preFilled: true ? flatPuzzle[i] === flatSolved[i] : false,
    }
  }

  const history = [data]

  return history
}

function populateGrid() {
  const data = history[history.length - 1]
  if (!data) {
    return
  }
  for (const [className, info] of Object.entries(data)) {
    const square = document.querySelector(`.${className}`)

    if (info.value && info.value !== info.answer) {
      square.classList.add('incorrect')
    } else {
      square.classList.remove('incorrect')
    }

    square.innerHTML = info.value
  }
}

function resetStyles() {
  const smalls = document.querySelectorAll('.small')
  smalls.forEach((small) => {
    small.classList.remove('selected')
    small.classList.remove('highlighted')
    small.classList.remove('highlighted-number')
  })
}

function getAnswer(selectedSquare) {
  const data = history[history.length - 1]

  const squareClass = selectedSquare.classList[2]
  const answer = data[squareClass].answer
  return answer
}

function highlightGrid(selectedSquare) {
  resetStyles()
  const smalls = document.querySelectorAll('.small')

  const selectedColumn = selectedSquare.classList[2].split('-')[0]
  const selectedRow = selectedSquare.classList[2].split('-')[1]

  const bigNumber = Number(selectedSquare.classList[1].split('-')[1])
  const smallsInBig = document.querySelectorAll(`.big-${bigNumber} > div`)
  smallsInBig.forEach((s) => s.classList.add('highlighted'))

  const highlightedNumber = selectedSquare.innerHTML

  smalls.forEach((s) => {
    if (s.innerHTML === highlightedNumber && highlightedNumber !== '') {
      s.classList.add('highlighted-number')
    }

    const column = s.classList[2].split('-')[0]
    const row = s.classList[2].split('-')[1]

    if (column === selectedColumn) {
      s.classList.add('highlighted')
    }
    if (row === selectedRow) {
      s.classList.add('highlighted')
    }
  })

  selectedSquare.classList.add('selected')
}

function startGame() {
  const smalls = document.querySelectorAll('.small')

  smalls.forEach((small) => {
    small.addEventListener('click', (e) => {
      highlightGrid(e.target)

      const answer = getAnswer(e.target)
      // console.log(answer)
    })
  })

  removeCompletedNumbers()
  const selectedSquare = document.querySelector('.a-1')
  highlightGrid(selectedSquare)
  handleInput()
}

function handleInput() {
  function processInput(userInput) {
    const data = history[history.length - 1]

    const selectedSquare = document.querySelector('.selected')
    const squareClass = selectedSquare.classList[2]

    if (data[squareClass].preFilled) {
      return
    }

    const newData = structuredClone(data)
    newData[squareClass].value = userInput
    history.push(newData)
    populateGrid()
    highlightGrid(selectedSquare)

    removeCompletedNumbers()
    checkCompletion()
  }

  const inputs = document.querySelectorAll('.inputs > p')
  inputs.forEach((input) => {
    input.addEventListener('click', (e) => {
      const userInput = Number(e.target.innerHTML)
      processInput(userInput)
    })
  })

  function undo() {
    if (history.length > 1) {
      history.pop()
      populateGrid()
    }
  }

  function navigateGrid(key) {
    const selectedSquare = document.querySelector('.selected')
    const selectedColumn = selectedSquare.classList[2].split('-')[0]
    const selectedRow = Number(selectedSquare.classList[2].split('-')[1])

    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
    let nextColumn = selectedColumn
    let nextRow = selectedRow

    const shortcutMap = {
      j: () => {
        nextRow = Number(selectedRow) + 1
      },
      k: () => {
        nextRow = Number(selectedRow) - 1
      },
      h: () => {
        nextColumn = columns[columns.indexOf(selectedColumn) - 1]
      },
      l: () => {
        nextColumn = columns[columns.indexOf(selectedColumn) + 1]
      },
      G: () => {
        nextRow = 9
      },
      H: () => {
        nextRow = 1
      },
      M: () => {
        nextRow = 5
      },
      L: () => {
        nextRow = 9
      },
      g: () => {
        gCount++
        if (gCount < 2) {
          gTime = new Date().getTime()
        } else if (gCount === 2) {
          gCount = 0
          const currentTime = new Date().getTime()
          if (currentTime - gTime < 700) {
            nextColumn = selectedColumn
            nextRow = 1
          }
        }
      },
      0: () => {
        nextColumn = columns[0]
        nextRow = Number(selectedRow)
      },
      $: () => {
        nextColumn = columns[columns.length - 1]
        nextRow = Number(selectedRow)
      },
    }

    if (!shortcutMap[key]) return
    shortcutMap[key]()

    const nextSquare = document.querySelector(`.${nextColumn}-${nextRow}`)
    if (nextSquare) highlightGrid(nextSquare)
  }

  let gCount = 0
  let gTime

  document.addEventListener('keydown', (e) => {
    if (e.key >= 1 && e.key <= 9) {
      const userInput = Number(e.key)
      processInput(userInput)
    } else if (e.key === 'u') {
      undo()
    } else if (!e.ctrlKey) {
      e.preventDefault()
      navigateGrid(e.key)
    }
  })
}

function removeCompletedNumbers() {
  const inputs = document.querySelectorAll('.inputs > p')

  const data = history[history.length - 1]
  for (let i = 1; i <= 9; ++i) {
    let count = 0
    for (const [className, info] of Object.entries(data)) {
      if (info.value === i && info.value === info.answer) {
        count++
      }
    }
    if (count === 9) {
      inputs.forEach((input) => {
        if (Number(input.innerHTML) === i) {
          input.style.visibility = 'hidden'
        }
      })
    }
  }
}

function checkCompletion() {
  const data = history[history.length - 1]

  let allEqual = true
  for (const key in data) {
    const currentObject = data[key]
    if (currentObject.value !== currentObject.answer) {
      allEqual = false
      break
    }
  }

  if (allEqual) {
    celebrateCompletion()
  }
}

function celebrateCompletion() {
  const container = document.querySelector('.container')

  const height = container.offsetHeight
  const width = container.offsetWidth

  const formattedTime = stopTimer()
  const celebrationTime = getCelebrationTime(formattedTime)

  const celebrationContent = document.querySelector('.celebration')
  const timeElem = document.getElementById('celebration-time')
  timeElem.innerHTML = celebrationTime

  const undoButton = document.querySelector('.undo')
  undoButton.style.visibility = 'hidden'

  container.innerHTML = celebrationContent.innerHTML
  container.style.height = `${height}px`
  container.style.width = `${width}px`
  container.classList.add('completed')
}

function getCelebrationTime(timeString) {
  const [minutes, seconds] = timeString.split(':').map(Number)

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${
      seconds > 1 ? 's' : ''
    }`
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''}`
  }
}

function startTimer() {
  const timerP = document.querySelector('.timer > p')
  let startTime = Date.now()
  let elapsedTime = 0
  let intervalId
  let formattedTime

  function updateTimerDisplay() {
    elapsedTime = Date.now() - startTime
    let minutes = Math.floor(elapsedTime / 1000 / 60)
    let seconds = Math.floor(elapsedTime / 1000) % 60
    formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
    timerP.textContent = formattedTime
  }

  intervalId = setInterval(updateTimerDisplay, 1000)

  return function stopTimer() {
    clearInterval(intervalId)
    return formattedTime
  }
}

const history = getHistory()
populateGrid()
const stopTimer = startTimer()
startGame()
