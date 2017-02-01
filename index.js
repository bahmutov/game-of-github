// Paste this code in DevTools on GitHub profile page,
// like https://github.com/bahmutov
// Or store it as a Code Snippet to play many times
// - https://github.com/bahmutov/code-snippets
// - https://glebbahmutov.com/blog/chrome-dev-tools-code-snippets/
(function gameOfGitHub() {
    /*
    Rules: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
    Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
    Any live cell with two or three live neighbours lives on to the next generation.
    Any live cell with more than three live neighbours dies, as if by overpopulation.
    Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    */
    // sample "normal" implementation https://jsfiddle.net/concannon/sy9py6qa/
    const weeks = document.querySelector('.js-calendar-graph-svg')
        .querySelectorAll('g g')
    console.log('%d weeks', weeks.length)

    const textElement = document.querySelector('.js-contribution-graph h2')
    const linkElement = document.querySelector('.js-contribution-graph .contrib-footer a')
    linkElement.href = 'https://github.com/bahmutov/game-of-github'
    linkElement.innerText = 'Game of GitHub'

    const rows = 7
    const columns = 52

    function toDays(rect) {
        const count = Number(rect.getAttribute('data-count'))
        return {
            rect,
            fill: rect.getAttribute('fill'),
            count: count,
            // binary value in the current tick
            curr: count > 0 ? 1 : 0,
            // value in the next tick
            next: 0
        }
    }

    function weekDays(week) {
        console.log(week)
        const days = week.querySelectorAll('.day')
        return Array.from(days).map(toDays)
    }
    var grid = Array.from(weeks).map(weekDays)

    function hideWeek(week) {
        week.forEach(day => {
            day.rect.setAttribute('fill', '#ffffff')
        })
    }
    // drop the last "current" week
    const lastWeek = grid.pop()
    hideWeek(lastWeek)

    function findMinMax (grid) {
        let min = Infinity
        let max = -Infinity
        for (let k = 0; k < grid.length; k += 1) {
            const week = grid[k]
            for (let j = 0; j < week.length; j += 1) {
                let count = week[j].count
                if (count < min) {
                    min = count
                }
                if (count > max) {
                    max = count
                }
            }
        }
        return {min, max}
    }
    console.log(findMinMax(grid))
    // for now just transform every cell into binary value
    // our grid is 52x7 (52 columns, each with 7 days)

    function decision (curr, neighbours) {
        if (!curr && neighbours === 3) {
            // Any dead cell with exactly three live neighbours becomes a live cell,
            // as if by reproduction.
            // (gleb): shouldn't it be 2 neighbours?!
            return 1
        }
        if (curr) {
            if (neighbours < 2) {
                // Any live cell with fewer than two live neighbours dies
                return 0
            }
            if (neighbours > 3) {
                // Any live cell with more than three live neighbours dies
                return 0
            }
            // Any live cell with two or three live neighbours lives
            return 1
        }
        return 0
    }

    function computeNext(grid) {
        // do not forget to wrap around
        for (let k = 0; k < columns; k += 1) {
            const prevColumn = k === 0 ? columns - 1 : k - 1
            const nextColumn = k === columns - 1 ? 0 : k + 1

            for (let j = 0; j < rows; j += 1) {
                const prevRow = j === 0 ? rows - 1 : j - 1
                const nextRow = j === rows - 1 ? 0 : j + 1
                let total = 0
                // prev column
                total += grid[prevColumn][prevRow].curr
                total += grid[prevColumn][j].curr
                total += grid[prevColumn][nextRow].curr
                // this column
                total += grid[k][prevRow].curr
                total += grid[k][nextRow].curr
                // right column

                total += grid[nextColumn][prevRow].curr
                total += grid[nextColumn][j].curr
                total += grid[nextColumn][nextRow].curr

                grid[k][j].neighbours = total

                let curr = grid[k][j].curr
                grid[k][j].next = decision(curr, total)
            }
        }
    }

    function render(grid) {
        const deadFill = '#eeeeee'
        const aliveFill = '#d6e685'
        for (let k = 0; k < columns; k += 1) {
            for (let j = 0; j < rows; j += 1) {
                const day = grid[k][j]
                if (day.curr) {
                    const fill = day.fill === deadFill ? aliveFill : day.fill
                    day.rect.setAttribute('fill', fill)
                } else {
                    day.rect.setAttribute('fill', deadFill)
                }
            }
        }
    }

    function moveCounts(grid) {
        let changed = false
        for (let k = 0; k < columns; k += 1) {
            for (let j = 0; j < rows; j += 1) {
                const day = grid[k][j]
                if (day.curr !== day.next) {
                    changed = true
                }
                day.curr = day.next
            }
        }
        return changed
    }

    let generation = 0
    function tick() {
        const delay = 250
        computeNext(grid)
        render(grid)
        generation += 1
        const movement = moveCounts(grid)
        // TODO detect simple oscillators
        if (!movement) {
            let msg = `Game of GitHub lost after ${generation} generations 😞`
            textElement.innerText = msg
        } else {
            let msg = `${generation} generations`
            textElement.innerText = msg
            setTimeout(tick, delay)
        }
    }

    tick()
}())
