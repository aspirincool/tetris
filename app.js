// ПРОБЛЕМА: при очищении ряда иногда остается/убирается лишняя ячейка (последняя в ряду)
// ПРОБЛЕМА: при повороте фигуры у границ, она заходит за границы
//console.log('ПРОБЛЕМА: при очищении ряда иногда остается/убирается лишняя ячейка (последняя в ряду)') // проблема 1
//console.log('ПРОБЛЕМА: при повороте фигуры у границ, она заходит за границы')
console.log('ПРОБЛЕМА: при развороте фигуры рядом с другой фигурой у второй теряется активная клетка')
console.log('ИДЕЯ: сделать игру "найди пару"')
const cells = Array.from(document.querySelectorAll('.tetris__cell'))
/*cells.forEach((item, index) => {
    item.textContent = index // индексы для проверки
})*/
const n = 8 // количество клеток в ряду
const shapes = { // фигуры
    'L' : [
        [1, n+1, 2*n+1, 2*n+2],
        [2, n, n+1, n+2],
        [0, 1, n+1, 2*n+1],
        [n, n+1, n+2, 2*n],
    ],
    'T' : [
        [n, n+1, n+2, 2*n+1],
        [1, n+1, n+2, 2*n+1],
        [1, n, n+1, n+2],
        [1, n, n+1, 2*n+1],
    ],
    'o' : [
        [0, 1, n, n+1],
        [0, 1, n, n+1],
        [0, 1, n, n+1],
        [0, 1, n, n+1],
    ],
    '|' : [
        [1, n+1, 2*n+1, 3*n+1],
        [n, n+1, n+2, n+3],
        [1, n+1, 2*n+1, 3*n+1],
        [n, n+1, n+2, n+3],
    ],
    'z' : [
        [n+1, n+2, 2*n, 2*n+1],
        [0, n, n+1, 2*n+1],
        [n+1, n+2, 2*n, 2*n+1],
        [0, n, n+1, 2*n+1],
    ]
}

const setSpeedButton = document.querySelector('#setSpeedButton')
const speed = document.querySelector('#speed')
let paused = false;

document.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
        case 37: // влево
            tetris.updatePosition(tetris.currentPosition, 'left')
            break
        case 39: // вправо
            tetris.updatePosition(tetris.currentPosition, 'right')
            break
        case 32: // пробел
            tetris.updatePosition(tetris.currentPosition, 'rotate')
            break
        case 13: // Enter
            if (document.querySelectorAll('#setSpeedButton').length) {
                setSpeed(speed)
            }
            break
        case 40: // вниз
            tetris.setMoveTime(speed.value)
            break
        case 27: // esc
            paused = !paused
            tetris.setPause(paused)
            break
        default:
            console.log('нерабочая клавиша')
            break
    }
})

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 40) {
        tetris.setMoveTime(speed.value / 2)
    }
})

let tetris = new Tetris(cells, shapes)

setSpeedButton.addEventListener('click', setSpeed.bind(null, speed))

function setSpeed(speedVal) {
    const speed = speedVal.value
    if (speed) {
        document.querySelector('#speedWrap').remove()
        tetris.setMoveTime(speed) // установка времени хода
        tetris.startGame()
    }
}

const indexToggle = document.querySelector('#indexToggle')
indexToggle.addEventListener('change', () => {
    if (indexToggle.checked) {
        cells.forEach((item, index) => {
            item.textContent = index // индексы для проверки
        })
    } else {
        cells.forEach((item, index) => {
            item.textContent = '' // индексы для проверки
        })
    }
})

function Tetris(cells, shapes) {
    this.cells = cells // все клетки
    this.shapes = shapes // все фигуры
    this.score = 0 // текущий счет
    this.rowScore = 100 // счет за 1 ряд
    this.scoreMultiplier = 1 // множитель очков за один ряд
    this.scoreAddMultiplier = 0.2 // добавление к множителю за каждый доп. ряд

    this.overlay = document.querySelector('.tetris__overlay'); // блок с оверлеем для паузы
    this.pauseItem = document.querySelector('.tetris__pause'); // блок для вывода паузы

    this.overBlock = document.querySelector('.tetris__over')
    this.overValBlock = document.querySelector('.tetris__over-score-val')
    this.overRestartBlock = document.querySelector('.tetris__over-restart')
    this.overRestartBlock.addEventListener('click', () => {
        this.restartGame()
    })

    this.scoreBlock = document.querySelector('.tetris__score .tetris__score-val');

    this.setMoveTime = t => { // установка времени хода вниз
        this.moveTime = t
    }
    this.paused = false
    this.setPause = paused => {
        this.paused = paused
        if (paused === false) {
            this.moveDown()
        }
    }
    this.hidePause = () => {
        this.overlay.classList.remove('active')
        this.pauseItem.classList.remove('active')
    }
    this.showPause = () => {
        this.overlay.classList.add('active')
        this.pauseItem.classList.add('active')
    }
    this.showGameOver = timeout => {
        setTimeout(() => {
            this.overBlock.classList.add('active')
            this.overValBlock.innerText = this.score
        }, timeout)
        setTimeout(() => {
            this.overRestartBlock.classList.add('active')
        }, timeout + 1000)
    }
    this.hideGameOver = () => {
        this.overBlock.classList.remove('active')
        this.overValBlock.innerText = this.score
    }
    this.scoreInterval = false
    this.updateScore = (addScore, reset = false) => {
        if (reset) {
            this.score = 0
            this.scoreBlock.innerText = this.score
        }
        clearInterval(this.scoreInterval)
        let prevScore = this.score
        this.score += addScore
        let currentScore = this.score

        let increment = 1; // начальный инкремент для повышения значения в интервале
        let maxInterval = 400; // выбрали максимальный интервал полного обновления счета в 400 милисекунд
        let interval = Math.ceil(maxInterval / addScore) // высчитываем время на одну итерацию в мс
        if (addScore > maxInterval) { // если очков добавления больше, чем максимальный интервал (> 400),
            interval = 1 // делаем обновление каждую милисекунду
            increment = Math.ceil(addScore / (maxInterval / (addScore / maxInterval))) // высчитываем кол-во очков, добавляемое в 1 мс
        }
        this.scoreInterval = setInterval( () => {
            if (prevScore < currentScore) { // пока прошлый счет + инкремент не догонит реальный счет, выполняем
                prevScore += increment;
                this.scoreBlock.innerText = prevScore
            } else {
                this.scoreBlock.innerText = currentScore
                clearInterval(this.scoreInterval)
            }
        }, interval);
    }

    // установка первоначальной фигуры (без позиции)
    this.currentShape = Object.keys(this.shapes)[Math.floor(Math.random()*Object.keys(this.shapes).length)]
    // установка первоначальной фигуры (копия первоначальной фигуры) для раскраски ниже ...marker1 начало
    this.paintCells = this.shapes[this.currentShape]
    // номер варианта поворота фигуры (1 из 4)
    this.initPaintIndex = 0
    // выбор варианта
    this.initPaintCells = this.paintCells[this.initPaintIndex]
    // раскраска варианта
    this.initPaintCells.forEach((i) => {
        cells[i].classList.add('active')
    })
    // установка текущей позиции фигуры по клеткам
    this.currentPosition = this.initPaintCells
    this.getRange = (start, end) => { // получить диапазон чисел от start до end
        let range = []
        for (let i = start; i <= end; i++) {
            range.push(i)
        }
        return range
    }
    const rowsCount = this.cells.length/n // количество рядов
    this.stopRow = this.getRange(this.cells.length - n, this.cells.length - 1) // последний ряд (диапазон клеток)
    this.takenPlaces = [] // занятые клетки
    this.clearRow = rows => { // очистка ряда, где все клетки заполнены
        let clearCells = [] // клетки для очистки
        for (let row of rows) {
            clearCells.push(...this.getRange(n*row, n*(row + 1)-1))
        }
        if (clearCells.length) {
            const rowCount = clearCells.length / n
            // пример: 100 * 4 * (1 + 0.2 * (4 - 1)) = 640 за 4 ряда с бонусом
            let scoreAdd = this.rowScore * rowCount * (this.scoreMultiplier + this.scoreAddMultiplier * (rowCount - 1))
            this.updateScore(scoreAdd)
        }
        clearCells.forEach(i => { // каждую клетку для очистки очищаем от цвета и убираем из массива занятых клеток
            this.cells[i].classList.remove('active')
            this.takenPlaces.splice(this.takenPlaces.indexOf(i), 1)
        })
        this.takenPlaces = this.takenPlaces.map(i => { // все клетки до очищаемых рядов сдвигаются на n клеток
            // было i < n * rows[rows.length-1] - 1 (проблема 1)
            if (i < n * rows[rows.length-1]) return i + n * rows.length
            return i
        })
        this.cells.forEach(i => i.classList.remove('active')) // очистить все клетки
        this.takenPlaces.map(i => this.cells[i].classList.add('active')) // закрасить все занятые клетки
    }
    this.nextStep = () => { // следующая фигура
        let clearRows = []
        for (let i = 0; i < rowsCount; i++) {
            let count = 0;
            for (let j = n * i; j < n * (i + 1); j++) {
                if (j > 1000) break
                if (this.takenPlaces.indexOf(j) !== -1) {
                    count++
                }
            }
            if (count === n) {
                clearRows.push(i)
            }
        }
        this.clearRow(clearRows)
        // Доделать выбор фигуры при повороте
        this.currentShape = Object.keys(this.shapes)[Math.floor(Math.random()*Object.keys(this.shapes).length)]
        this.paintCells = this.shapes[this.currentShape]
        this.initPaintIndex = 0
        this.currentPosition = this.paintCells[this.initPaintIndex]
        this.currentPosition.forEach((i) => {
            cells[i].classList.add('active')
        })
        let intersections = this.currentPosition.filter(i => this.takenPlaces.indexOf(i) !== -1)
        if (intersections.length) {
            this.endGame(this.cells, 25)
        }
        else {
            this.moveDown()
        }
    }
    this.updatePosition = (shape, direction = '', view = '') => {
        let prevShape = [...shape]
        let intersections = []
        let checkShape = []
        switch (direction) {
            case 'left':
                intersections = this.currentPosition.filter(i => this.stopRow.indexOf(i) !== -1 || this.takenPlaces.indexOf(i + n) !== -1)
                checkShape = this.currentPosition.filter(i => {
                    return i % n === 0 || this.takenPlaces.indexOf(i - 1) !== -1 || this.stopRow.indexOf(i) !== -1
                })
                if (!checkShape.length) {
                    prevShape.forEach(i => this.cells[i].classList.remove('active'))

                    this.currentPosition = this.currentPosition.map(i => i - 1)
                    this.currentPosition.forEach(i => this.cells[i].classList.add('active'))
                }
                break
            case 'right':
                intersections = this.currentPosition.filter(i => this.stopRow.indexOf(i) !== -1 || this.takenPlaces.indexOf(i + n) !== -1)
                checkShape = this.currentPosition.filter(i => {
                    return i % n === n - 1 || this.takenPlaces.indexOf(i + 1) !== -1 || this.stopRow.indexOf(i) !== -1
                })
                if (!checkShape.length) {
                    prevShape.forEach(i => this.cells[i].classList.remove('active'))

                    this.currentPosition = this.currentPosition.map(i => i + 1)
                    this.currentPosition.forEach(i => this.cells[i].classList.add('active'))
                }
                break
            case 'rotate':
                const lastPaintIndex = this.initPaintIndex
                if (this.initPaintIndex < 3) {
                    this.initPaintIndex++
                }
                else {
                    this.initPaintIndex = 0
                }
                // координаты предыдущей позиции
                let prevPos = [...this.currentPosition]
                prevPos.forEach((i) => {
                    cells[i].classList.remove('active')
                })
                let newShape = this.paintCells[this.initPaintIndex].map(i => {
                    return i + this.currentPosition[0] - this.shapes[this.currentShape][lastPaintIndex][0]
                })
                checkShape = newShape.filter(i => { // i % b === n - 1 – проверка на касание крайнего правого столбика
                    // было this.takenPlaces.indexOf(i + 1) !== -1
                    return i % n === n - 1 || this.takenPlaces.indexOf(i) !== -1 || this.stopRow.indexOf(i) !== -1
                })
                if (!checkShape.length) {
                    this.currentPosition = newShape
                } else {
                    newShape = newShape.map(i => {
                        return i + 1 // для сдвига вправо
                    })

                    let conflictWithOther = false

                    let leftTouch = false;
                    let rightTouch = false;
                    newShape.forEach(function (i) {
                        if (i % n === n - 1) { // тронул справа
                            rightTouch = true;
                        } else if (i % n === 0) { // тронул слева
                            leftTouch = true
                        } else if (this.takenPlaces.indexOf(i) !== -1) {
                            conflictWithOther = true
                        }
                    }, this);
                    // если переносится при переворачивании с правого края на левый, то возвращаем обратно
                    while (leftTouch && rightTouch) {
                        newShape = newShape.map(i => { // ... с этим
                            return i - 1 // для сдвига влево
                        })
                        leftTouch = false;
                        rightTouch = false;
                        newShape.forEach(function (i) {
                            if (i % n === n - 1) { // тронул справа
                                rightTouch = true;
                            } else if (i % n === 0) { // тронул слева
                                leftTouch = true
                            }
                        });
                    }
                    if (conflictWithOther) {
                        newShape = prevPos
                    }
                    this.currentPosition = newShape
                }
                this.currentPosition.forEach((i) => {
                    cells[i].classList.add('active')
                })
                break
            default:
                prevShape.forEach(i => this.cells[i].classList.remove('active'))
                this.currentPosition = this.currentPosition.map(i => i + n) //n=8
                this.currentPosition.forEach(i => this.cells[i].classList.add('active'))
                break
        }
    }


    this.moveDown = () => {
        this.hidePause()
        let nonstop = setTimeout(() => {
            let intersections = this.currentPosition.filter(i => this.stopRow.indexOf(i) !== -1 || this.takenPlaces.indexOf(i + n) !== -1)
            if (!intersections.length) {
                this.updatePosition(this.currentPosition)
                this.moveDown()
            } else {
                this.takenPlaces.push(...this.currentPosition)
                this.nextStep()
            }
        }, this.moveTime)
        if (this.paused) {
            clearTimeout(nonstop)
            this.showPause()
        }
    }
    /*this.moveLeft = () => {
        this.currentPosition = this.initPaintCells.map((i) => i - 1)
        let previousCells = this.currentPosition.length ? this.currentPosition : this.initPaintCells
        previousCells.forEach(i => this.cells[i].classList.remove('active'))
        this.initPaintCells = this.initPaintCells.map(i => i - 1)
        this.initPaintCells.forEach(i => this.cells[i].classList.add('active'))
    }
    this.moveRight = () => {
        this.currentPosition = this.initPaintCells.map((i) => i + 1)
        let previousCells = this.currentPosition.length ? this.currentPosition : this.initPaintCells
        previousCells.forEach(i => this.cells[i].classList.remove('active'))
        this.initPaintCells = this.initPaintCells.map(i => i + 1)
        this.initPaintCells.forEach(i => this.cells[i].classList.add('active'))
    }*/
    this.startGame = () => {
        this.moveDown()
    }
    this.endGame = (items, time) => {
        let seconds = time
        items.forEach(item => {
            seconds += time
            setTimeout(() => {
                item.classList.add('active')
            }, seconds)
        })
        this.showGameOver(seconds + 25)
    }
    this.restartGame = () => {
        this.currentShape = Object.keys(this.shapes)[Math.floor(Math.random()*Object.keys(this.shapes).length)]
        // установка первоначальной фигуры (копия первоначальной фигуры) для раскраски ниже ...marker1 начало
        this.paintCells = this.shapes[this.currentShape]
        // номер варианта поворота фигуры (1 из 4)
        this.initPaintIndex = 0
        // выбор варианта
        this.initPaintCells = this.paintCells[this.initPaintIndex]
        // раскраска варианта
        this.initPaintCells.forEach((i) => {
            cells[i].classList.add('active')
        })
        // установка текущей позиции фигуры по клеткам
        this.currentPosition = this.initPaintCells
        this.takenPlaces = []

        this.score = 0

        this.hideGameOver()

        this.cells.forEach(item => item.classList.remove('active'))

        this.updateScore(0, true)

        this.startGame()
    }
}