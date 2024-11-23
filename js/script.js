const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// キャラ画像リスト
const images = [
    './img/yu.jpeg', './img/ai.jpeg', './img/ayumu.jpeg', './img/emma.jpeg',
    './img/kanata.jpeg', './img/karin.jpeg', './img/kasumi.jpg',
    './img/mia.jpeg', './img/ranju.jpeg', './img/rina.jpeg',
    './img/setuna.jpeg', './img/shioriko.jpeg', './img/shizuku.jpg'
];

const gravity = 0.5; // 重力
const bounceFactor = 0.7; // バウンドの減衰

let characters = []; // 画面上のキャラ
let nextCharacterIndex = 0; // 次のキャラクターのインデックス
let currentCharacter = { x: canvas.width / 2, y: 50, radius: 30, img: null };
let score = 0; // スコア
let gameOver = false;

// スコア表示
function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// ゲームオーバー表示
function drawGameOver() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
}

// 画像読み込み
function loadImages(paths, callback) {
    const imgs = [];
    let loadedCount = 0;
    paths.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            imgs[index] = img;
            loadedCount++;
            console.log(`Loaded image: ${path}`); // デバッグ用
            if (loadedCount === paths.length) {
                console.log('All images loaded:', imgs); // デバッグ用
                callback(imgs);
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${path}`);
        };
    });
}

// 円を描画
function drawCircle(img, x, y, radius) {
    if (!img || !(img instanceof HTMLImageElement)) {
        console.error('Invalid image provided to drawCircle:', img);
        return; // エラー時は描画をスキップ
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
}

// キャラの衝突判定
function checkCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}

// キャラの進化処理
function handleEvolution() {
    for (let i = 0; i < characters.length; i++) {
        for (let j = i + 1; j < characters.length; j++) {
            if (
                characters[i].index === characters[j].index &&
                checkCollision(characters[i], characters[j])
            ) {
                // 進化可能か判定
                if (characters[i].index < images.length - 1) {
                    characters[i].index++;
                    characters[i].img = characters[characters[i].index]?.img || null;
                    characters.splice(j, 1); // 合成後のキャラを削除
                    score += 10; // スコア加算
                }
            }
        }
    }
}

// ゲームオーバー判定
function checkGameOver() {
    for (let char of characters) {
        if (char.y - char.radius <= 0) {
            gameOver = true;
            return true;
        }
    }
    return false;
}

// ゲームの更新処理
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        drawGameOver();
        return;
    }

    // キャラの描画と更新
    characters.forEach((char) => {
        char.y += char.vy;
        char.vy += gravity;

        if (char.x + char.radius > canvas.width || char.x - char.radius < 0) {
            char.vx *= -1;
        }

        if (char.y + char.radius > canvas.height) {
            char.y = canvas.height - char.radius;
            char.vy *= -bounceFactor;
        }

        char.x += char.vx;

        drawCircle(char.img, char.x, char.y, char.radius);
    });

    // キャラの進化
    handleEvolution();

    // 次のキャラの描画
    drawCircle(
        currentCharacter.img,
        currentCharacter.x,
        currentCharacter.y,
        currentCharacter.radius
    );

    // スコア表示
    drawScore();

    // ゲームオーバー判定
    checkGameOver();

    requestAnimationFrame(updateGame);
}

// キーボード操作
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentCharacter.x > currentCharacter.radius) {
        currentCharacter.x -= 20;
    }
    if (e.key === "ArrowRight" && currentCharacter.x < canvas.width - currentCharacter.radius) {
        currentCharacter.x += 20;
    }
    if (e.key === " ") {
        if (!currentCharacter.img) {
            console.error('currentCharacter.img is not set!');
            return;
        }

        // キャラを落下させる
        characters.push({
            x: currentCharacter.x,
            y: currentCharacter.y,
            radius: currentCharacter.radius,
            img: currentCharacter.img,
            index: nextCharacterIndex,
            vx: Math.random() * 4 - 2,
            vy: 0,
        });

        // 次のキャラクターを設定
        nextCharacterIndex = Math.floor(Math.random() * images.length);
        currentCharacter.img = characters[nextCharacterIndex]?.img || null;
        currentCharacter.x = canvas.width / 2;
        currentCharacter.y = 50;
    }
});

// ゲーム開始
loadImages(images, (loadedImages) => {
    characters = loadedImages.map((img, index) => ({
        img: img,
        index: index,
    }));
    currentCharacter.img = characters[0]?.img || null;
    updateGame();
});