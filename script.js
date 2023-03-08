/** @type{HTMLCanvasElement} */

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const scoreId = document.getElementById("score");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const spaceship = new Image();
spaceship.src = "./img/spaceship.png";
const enemyship = new Image();
enemyship.src = "./img/enemy.png"
const playerProjectileSpeed = -5;
const enemyProjectileSpeed = 5;
const keys = {
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    space: {
        pressed: false
    }
}
const game = {
    over: false,
    active: true
}

class Player {
    constructor() {
        this.width = 70;
        this.height = 60;
        this.position = {
            x: canvas.width * 0.5 - this.width * 0.5,
            y: canvas.height - this.height - 20
        }
        this.rotation = 0;
        this.speed = 7;
        this.image = spaceship;
        this.frame = 0;
        this.staggeredFrame = 2;
        this.count = 0;
        this.opacity = 1;
    }
    update() {
        if (this.count / this.staggeredFrame >= 1) {
            (this.frame > 1) ? this.frame = 0 : this.frame++;
            this.count = 0;
        }
        else this.count++;
        if (keys.ArrowLeft.pressed && this.position.x >= 0) this.position.x -= this.speed;
        else if (keys.ArrowRight.pressed && this.position.x <= canvas.width - this.width) this.position.x += this.speed;
        else this.position.x += 0;
        this.draw();
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.position.x + this.width * 0.5, this.position.y + this.height * 0.5); // translating the origin of ctx to the player
        ctx.rotate(this.rotation); // rotating the ctx
        ctx.translate(-this.position.x - this.width * 0.5, -this.position.y - this.height * 0.5); //tranlating the orgin back to where it was

        ctx.drawImage(this.image, this.frame * 110, 0, 90, 103, this.position.x, this.position.y, this.width, this.height);

        ctx.restore();
    }
}

class Invader {
    constructor(x, y) {
        this.width = 40;
        this.height = 40;
        this.position = {
            x: x,
            y: y
        }
        this.image = enemyship;
        this.frame = 0;
        this.staggeredFrame = Math.floor(Math.random() * 5) + 1;
        this.count = 0;
    }
    update() {
        if (this.count / this.staggeredFrame >= 1) {
            (this.frame > 1) ? this.frame = 0 : this.frame++;
            this.count = 0;
        }
        else this.count++;
        this.draw();
    }
    draw() {
        ctx.drawImage(this.image, this.frame * 82, 0, 82, 87, this.position.x, this.position.y, this.width, this.height);
    }
}

class Grid {
    constructor() {
        this.columns = Math.floor(Math.random() * 8) + 5;
        this.rows = Math.floor(Math.random() * 4) + 2;
        this.width = this.columns * 50;
        this.height = this.rows * 50;
        this.position = {
            x: Math.random() * (canvas.width - this.width),
            y: 10
        };
        this.velocity = {
            x: Math.random() * 4 + 2,
            y: Math.random() * 50 + 20
        };
        this.invaders = [];

        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.invaders.push(new Invader(this.position.x + i * 50, this.position.y + j * 50));
            }
        }
    }
    update() {
        if (this.position.x < 10 || this.position.x + this.width >= canvas.width) {
            this.velocity.x *= -1;
            this.position.y += this.velocity.y;
            this.invaders.forEach(invader => {
                invader.position.y += this.velocity.y;
            });
        }
        if (this.position.y + this.height >= canvas.height-player.height) drawGameOver();
        this.position.x += this.velocity.x;
        this.invaders.forEach(invader => {
            invader.position.x += this.velocity.x;
        });
    }
}

class Projectile {
    constructor(person, speed) {
        this.radius = 4;           //for player projectile
        this.enemyHeight = person.height;  //simple fix
        this.height = 10;    // for enemy projectile
        this.width = 6;     //for enemy projectile
        this.position = {
            x: person.position.x + person.width / 2 - this.radius,
            y: person.position.y
        };
        this.speed = speed;
    }
    draw() {
        if (this.speed > 0) {      // enemy projectile
            ctx.fillStyle = "lightcyan";
            ctx.fillRect(this.position.x, this.position.y + this.enemyHeight, this.width, this.height);
        } else {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
        }

    }
    update() {
        this.draw();
        this.position.y += this.speed;
    }
}

class Particle {
    constructor({ position, velocity, radius, color }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.opacity -= 0.04;
    }
}

class Star {
    constructor() {
        this.position = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
        this.velocity = Math.random();
        this.radius = Math.random() * 1.5;
        this.color = "white";
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.draw();
        this.position.y += this.velocity;
    }
}

const player = new Player();
let projectiles = [];
let enemyProjectiles = [];
let particles = [];
let stars = [];
const grids = [];
let frames = 0;
let randomInterval = Math.floor(Math.random() * 500) + 700;
let score = 0;
ctx.font = "50px Impact";

for(let i = 0; i< 100; i++){
    stars.push(new Star());
};

function createParticles(object, radius, colorArg) {
    for (let iter = 0; iter < 15; iter++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * radius,
            color: colorArg
        }));
    }
}

function drawGameOver(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "black"; 
    ctx.fillText("GAME OVER!", canvas.width*0.5, canvas.height*0.5 - 50);
    ctx.fillText("Your Score: "+score, canvas.width * 0.5, canvas.height * 0.5 + 50);
    ctx.fillStyle = "white"; 
    ctx.fillText("GAME OVER!", canvas.width*0.5+3, canvas.height*0.5 - 47);
    ctx.fillText("Your Score: " + score, canvas.width * 0.5 + 3, canvas.height * 0.5 + 53);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        star.update();
        if(star.position.y > canvas.height) star.position.y -= canvas.height;
    });
    player.update();

    if (frames % randomInterval == 0) {
        grids.push(new Grid());
        randomInterval = Math.floor(Math.random() * 500) + 700;
    }
    frames++;
    grids.forEach((grid, index) => {
        grid.update();
        if (grid.invaders.length == 0) {
            grids.splice(index, 1);
        }
        if (frames % 100 == 0) {
            enemyProjectiles.push(new Projectile(grid.invaders[Math.floor(Math.random() * grid.invaders.length)], enemyProjectileSpeed));
        }
        grid.invaders.forEach((invader, i) => {
            invader.update();

            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height && projectile.position.y - projectile.radius > invader.position.y && projectile.position.x <= invader.position.x + invader.width && projectile.position.x >= invader.position.x) {
                    setTimeout(() => {
                        grid.invaders.splice(i, 1);
                        projectiles.splice(j, 1);
                        
                        createParticles(invader, 3, "khaki");
                        if (grid.invaders.length > 0) {
                            const firstInvader = grid.invaders[0];
                            const lastInvader = grid.invaders[grid.invaders.length - 1];
                            grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                            grid.position.x = firstInvader.position.x;
                        }
                        score+=10;
                        scoreId.innerHTML = score;
                    }, 0);
                }
            });
        });
    });

    particles.forEach((particle, index) => {
        if (particle.opacity <= 0) particles.splice(index, 1);
        else particle.update();
    });

    projectiles.forEach((projectile, index) => {
        if (projectile.position.y < 0) projectiles.splice(index, 1);
        else projectile.update();
    });
    
    enemyProjectiles.forEach((projectile, index) => {
        if (projectile.position.y > canvas.height) enemyProjectiles.splice(index, 1);
        else projectile.update();
        
        if (projectile.position.y + projectile.height >= player.position.y && projectile.position.x <= player.position.x + player.width && projectile.position.x >= player.position.x) {
            player.opacity = 0;
            game.over = true;
            enemyProjectiles.splice(index, 1);
            createParticles(player, 6, "cyan");

            setTimeout(()=>{
                game.active = false;
            }, 700);
        }
    });
    if(game.active) requestAnimationFrame(animate);
    else if(game.over) drawGameOver();
}
animate();

window.addEventListener("keydown", (e) => {
    if(game.over) return;
    switch (e.key) {
        case "ArrowLeft":
            keys.ArrowLeft.pressed = true;
            player.rotation = -0.15;
            break;
        case "ArrowRight":
            keys.ArrowRight.pressed = true;
            player.rotation = 0.15;
            break;
        case " ":
            if (!keys.space.pressed) {
                projectiles.push(new Projectile(player, playerProjectileSpeed));
                keys.space.pressed = true;
            }
            break;
    }
});
window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            player.rotation = 0;
            break;
        case "ArrowRight":
            keys.ArrowRight.pressed = false;
            player.rotation = 0;
            break;
        case " ":
            keys.space.pressed = false;
            break;
    }
});