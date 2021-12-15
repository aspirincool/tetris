// ПРОБЛЕМА: при очищении ряда иногда остается/убирается лишняя ячейка (последняя в ряду)
// ПРОБЛЕМА: при повороте фигуры у границ, она заходит за границы

const cells = Array.from(document.querySelectorAll('.tetris__cell'))
/*cells.forEach((item, index) => {
    item.textContent = index // индексы для проверки
})*/
const n = 8 //
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

document.addEventListener('keyup', (e) => {
    /*console.log(e.keyCode)*/
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
        default:
            console.log('нерабочая клавиша')
            break
    }
})

let tetris = new Tetris(cells, shapes)

setSpeedButton.addEventListener('click', setSpeed(speed))

function setSpeed(speedVal) {
    const speed = speedVal.value
    if(speed) {
        document.querySelector('#speedWrap').remove()
        tetris.setMoveTime(speed) // установка времени хода
        tetris.startGame()
    }
}

const indexToggle = document.querySelector('#indexToggle')
indexToggle.addEventListener('change', () => {
    if(indexToggle.checked) {
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
    this.setMoveTime = t => { // установка времени хода вниз
        this.moveTime = t
    }
    // установка первоначальной фигуры (без позиции)
    this.currentShape = Object.keys(this.shapes)[Math.floor(Math.random()*Object.keys(this.shapes).length)]
    // установка первоначальной фигуры (копия первоначальной фигуры) для раскраски ниже ...marker1 начало
    this.paintCells = this.shapes[this.currentShape]
    // номер варианта фигуры (1 из 4)
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
        for(let i = start; i <= end; i++) {
            range.push(i)
        }
        return range
    }
    const rowsCount = this.cells.length/n // количество рядов
    this.stopRow = this.getRange(this.cells.length - n, this.cells.length - 1) // последний ряд (диапазон клеток)
    this.takenPlaces = [] // занятые клетки
    this.clearRow = rows => { // очистка ряда, где все клетки заполнены
        let clearCells = [] // клетки для очистки
        for(let row of rows) {
            clearCells.push(...this.getRange(n*row, n*(row + 1)-1))
        }
        clearCells.forEach(i => { // каждую клетку для очистки очищаем от цвета и убираем из массива занятых клеток
            this.cells[i].classList.remove('active')
            this.takenPlaces.splice(this.takenPlaces.indexOf(i), 1)
        })
        this.takenPlaces = this.takenPlaces.map(i => { // все клетки до очищаемых рядов сдвигаются на n клеток
            if (i < n * rows[rows.length-1] - 1) return i + n*rows.length
            return i
        })
        this.cells.forEach(i => i.classList.remove('active')) // очистить все клетки
        this.takenPlaces.map(i => this.cells[i].classList.add('active')) // закрасить все занятые клетки
    }
    this.nextStep = () => { // следующая фигура
        let clearRows = []
        for(let i = 0; i < rowsCount; i++) {
            let count = 0;
            for(let j = n * i; j < n*(i + 1); j++) {
                if(j > 1000) break
                if(this.takenPlaces.indexOf(j) != -1) {
                    count++
                }
            }
            if(count == n) {
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
        let intersections = this.currentPosition.filter(i => this.takenPlaces.indexOf(i) != -1)
        if(intersections.length) {
            this.endGame(this.cells, 25)
        }
        else {
            this.moveDown()
        }
    }
    this.updatePosition = (shape, direction = '', view = '') => {
        let prevShape = [...shape]
        let intersections
        let checkShape
        switch (direction) {
            case 'left':
                intersections = this.currentPosition.filter(i => this.stopRow.indexOf(i) != -1 || this.takenPlaces.indexOf(i + n) != -1)
                checkShape = this.currentPosition.filter(i => {
                    return i % n == 0 || this.takenPlaces.indexOf(i - 1) != -1 || this.stopRow.indexOf(i) != -1
                })
                if(!checkShape.length) {
                    prevShape.forEach(i => this.cells[i].classList.remove('active'))

                    this.currentPosition = this.currentPosition.map(i => i - 1)
                    this.currentPosition.forEach(i => this.cells[i].classList.add('active'))
                }
                break
            case 'right':
                intersections = this.currentPosition.filter(i => this.stopRow.indexOf(i) != -1 || this.takenPlaces.indexOf(i + n) != -1)
                checkShape = this.currentPosition.filter(i => {
                    return i % n == n-1 || this.takenPlaces.indexOf(i + 1) != -1 || this.stopRow.indexOf(i) != -1
                })
                if(!checkShape.length) {
                    prevShape.forEach(i => this.cells[i].classList.remove('active'))

                    this.currentPosition = this.currentPosition.map(i => i + 1)
                    this.currentPosition.forEach(i => this.cells[i].classList.add('active'))
                }
                break
            case 'rotate':
                const lastPaintIndex = this.initPaintIndex
                if(this.initPaintIndex < 3) {
                    this.initPaintIndex++
                }
                else {
                    this.initPaintIndex = 0
                }
                let prevPos = [...this.currentPosition]
                prevPos.forEach((i) => {
                    cells[i].classList.remove('active')
                })
                let newShape = this.paintCells[this.initPaintIndex].map(i => {
                    return i + this.currentPosition[0] - this.shapes[this.currentShape][lastPaintIndex][0]
                })
                checkShape = newShape.filter(i => {
                    return i % n == n-1 || this.takenPlaces.indexOf(i + 1) != -1 || this.stopRow.indexOf(i) != -1
                })
                if(!checkShape.length) {
                    this.currentPosition = newShape
                } else {
                    newShape = newShape.map(i => {
                        return i + 1 // для сдвига вправо
                    })
                    this.currentPosition = newShape
                }
                this.currentPosition.forEach((i) => {
                    cells[i].classList.add('active')
                })
                break
            default:
                prevShape.forEach(i => this.cells[i].classList.remove('active'))
                this.currentPosition = this.currentPosition.map(i => i + 8)
                this.currentPosition.forEach(i => this.cells[i].classList.add('active'))
                break
        }
    }


    this.moveDown = () => {
        setTimeout(() => {
            let intersections = this.currentPosition.filter(i => this.stopRow.indexOf(i) != -1 || this.takenPlaces.indexOf(i + n) != -1)
            if(!intersections.length) {
                this.updatePosition(this.currentPosition)
                this.moveDown()
            } else {
                this.takenPlaces.push(...this.currentPosition)
                this.nextStep()
            }
        }, this.moveTime)
    }
    this.moveLeft = () => {
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
    }
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
    }
}