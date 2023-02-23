const gameScreenElement = document.querySelector('.game-screen');
const startScreenElement = document.querySelector('.start-screen');
const startGameButtonElement = document.querySelector('button:nth-child(1)');
const playerStatsElement = document.querySelector('.player-stats');
const gameOverElement = document.querySelector('.game-over');
startGameButtonElement.addEventListener('click', startGame);

function startGame() {
    startScreenElement.classList.add('hide');

    let player = initializeMainCharacter(200, 200);
    let scoreBoard = initializeTheScoreBoard();
    let wizard = document.querySelector('.wizard');
    let clouds = initializeTheClouds();
    let enemy = initializeTheEnemy();

    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(gameLoop);
    let keys = {};

    function gameLoop(timeStamp){
        if (keys['KeyW'] && player.positionY > 21){
            player.moveUp();
        }
        if (keys['KeyS'] && player.positionY < 554){
            player.moveDown();
        }
        if (keys['KeyA'] && player.positionX > 0){
            player.moveLeft();
        }
        if (keys['KeyD'] && player.positionX < 1250){
            player.moveRight();
        }
        if (keys['Space']){
            wizard.classList.add('wizard-fire');
        } else {
            wizard.classList.remove('wizard-fire');
        }
        if (keys['Space'] && timeStamp - player.lastTimeFiredInterval > player.skills.fireball.cooldown * 1000){
            player.skills.fireball.cast();
            player.lastTimeFiredInterval = timeStamp;
        } 

        playerStatsElement.textContent = `HP: ${player.hp}`;

        let fireBallElements = document.querySelectorAll('.fireball');
        fireBallElements.forEach(fb => {
            let initialPosition = parseInt(fb.style.left);
            let newPosition = initialPosition + (player.skills.fireball.speed / 10);
            if (newPosition < 1300){
                fb.style.left = newPosition + 'px';
            } else {
                fb.parentElement.removeChild(fb);
            }
        });

        if (timeStamp - clouds.lastSpawn > clouds.spawnTime + 20000 * Math.random()){
            clouds = initializeTheClouds();
            clouds.lastSpawn = timeStamp;
        }
        let cloudElements = document.querySelectorAll('.cloud');
        cloudElements.forEach(c => {
            let initialPosition = parseInt(c.style.left);
            let newPosition = initialPosition - (clouds.speed / 10);
            if (newPosition > 0){
                c.style.left = newPosition + 'px';
            } else {
                c.parentElement.removeChild(c);
            }
        });

        if (timeStamp - enemy.lastSpawn > enemy.spawnTime + 10000 * Math.random()){
            enemy = initializeTheEnemy();
            enemy.lastSpawn = timeStamp;
        }

        let enemyElements = document.querySelectorAll('.bug');
        enemyElements.forEach(c => {
            let initialPosition = parseInt(c.style.left);
            let progressiveSpeed = timeStamp / 5000;
            if (progressiveSpeed > 7){
                progressiveSpeed = 7;
            }
            let newPosition = initialPosition - (enemy.movementSpeed / 10) - progressiveSpeed;
            if (newPosition > 0){
                c.style.left = newPosition + 'px';
            } else {
                c.parentElement.removeChild(c);
                scoreBoard.evadedEnemyBonus();
            }
        });
        let gameOver = false;
        //check for player collision
        enemyElements.forEach(bug => {
            if (isCollision(wizard, bug)){
                player.hp -= enemy.damage;
                bug.parentElement.removeChild(bug);
                if (player.hp <= 0){
                    gameOverElement.textContent = `Game Over!\nYour Total Score: ${scoreBoard.scorePoints}!`;
                    gameOverElement.style.display = 'block';
                    gameOver = true;
                }
            }
            fireBallElements.forEach(fireball => {
                if (isCollision(fireball, bug)){
                    bug.parentElement.removeChild(bug);
                    fireball.parentElement.removeChild(fireball);
                    scoreBoard.killedEnemyBonus(enemy.bounty);
                }
            })
        });
        if (!gameOver){
            window.requestAnimationFrame(gameLoop);
        } 
    }

    function isCollision(firstElement, secondElement){
        let first = firstElement.getBoundingClientRect();
        let second = secondElement.getBoundingClientRect();

        return !(first.top + 5 > second.bottom || first.bottom - 5 < second.top || 
            first.right - 5 < second.left ||
            first.left + 5 > second.right);
    }

    function onKeyUp(e){
        keys[e.code] = false;
    }
    
    function onKeyDown(e){
        keys[e.code] = true;
    }
}

function initializeMainCharacter(coordX, coordY) {
    const wizard = document.createElement('div');
    let positionX = coordX + 'px';
    let positionY = coordY + 'px';
    wizard.classList.add('wizard');
    wizard.style.top = positionX;
    wizard.style.left = positionY;
    gameScreenElement.appendChild(wizard);

    return player = {
        hp: 100,
        mana: 200,
        attackSpeed: 0,
        defense: 0,
        positionX: parseInt(positionX),
        positionY: parseInt(positionY),
        movementSpeed: 35,
        lastTimeFiredInterval: 0,
        skills: {
            fireball: { 
                dmg: 10, 
                speed: 50, 
                range: 60, 
                cooldown: 0.5, 
                mana: 20,
                cast: function () {
                    const fireBall = document.createElement('div');
                    fireBall.classList.add('fireball');
                    fireBall.style.top = player.positionY + 20 + 'px';
                    fireBall.style.left = player.positionX + 85 + 'px';
                    gameScreenElement.appendChild(fireBall);
                }
            }
        },
        moveUp: function () {
            this.positionY -= this.movementSpeed / 10;
            wizard.style.top = this.positionY + 'px';
        },
        moveDown: function () {
            this.positionY += this.movementSpeed / 10;
            wizard.style.top = this.positionY + 'px';
        },
        moveLeft: function () {
            this.positionX -= this.movementSpeed / 10;
            wizard.style.left = this.positionX + 'px';
        },
        moveRight: function () {
            this.positionX += this.movementSpeed / 10;
            wizard.style.left = this.positionX + 'px';
        }
    }

}

function initializeTheEnemy(){
    const enemy = document.createElement('div');
    let positionX = gameScreenElement.offsetWidth - 200;
    enemy.style.left = positionX + 'px';
    enemy.style.top = (gameScreenElement.offsetHeight - 200) * Math.random() + 'px';
    enemy.classList.add('bug');
    gameScreenElement.appendChild(enemy);

    return bug = {
        hp: 20,
        mana: 0,
        attackSpeed: 0,
        defense: 0,
        damage: 30,
        movementSpeed: 45,
        lastTimeFiredInterval: 0,
        spawnTime: 200,
        lastSpawn: 0,
        bounty: 20,
    }
}

function initializeTheClouds(){
    const clouds = document.createElement('div');
    let positionX = gameScreenElement.offsetWidth - 200;
    clouds.style.left = positionX + 'px';
    clouds.style.top = (gameScreenElement.offsetHeight - 200) * Math.random() + 'px';
    clouds.classList.add('cloud');
    gameScreenElement.appendChild(clouds);

    return {
        spawnTime: 2500,
        coord: positionX,
        speed: 40,
        lastSpawn: 0
    }
}

function initializeTheScoreBoard(){
    const scoreBoard = document.createElement('div');
    scoreBoard.classList.add('score-board');
    scoreBoard.textContent = `Score: 0 points.`
    gameScreenElement.appendChild(scoreBoard);

    const score = {
        scorePoints: 0,
        evadedEnemyBonus: function () {
            this.scorePoints += 5;
            scoreBoard.textContent = `Score ${this.scorePoints} points.`
        },
        killedEnemyBonus: function (bounty) {
            this.scorePoints += bounty;
            scoreBoard.textContent = `Score ${this.scorePoints} points.`
        },
        killedBossBonus: function (bounty) {
            this.scorePoints += bounty;
            scoreBoard.textContent = `Score ${this.scorePoints} points.`
        }
    }
    return score;
}