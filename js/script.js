const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// キャラ画像リスト
const images = [
    './/img/yu.jpeg', './/img/ai.jpeg', './/img/ayumu.jpeg', './/img/emma.jpeg',
    './/img/kanata.jpeg', './/img/karin.jpeg', './/img/kasumi.jpg',
    './/img/mia.jpeg', './/img/ranju.jpeg', './/img/rina.jpeg',
    './/img/setuna.jpeg', './/img/shioriko.jpeg', './/img/shizuku.jpg'
];

const gravity = 0.5; // 重力
const bounceFactor = 0.7; // バウンドの減衰

// キャラクターオブジェクトリスト
let characters = [];
let nextCharacterIndex = 0;
let currentCharacter = { x: canvas.width / 2, y: 50, radius: 30, img: null };

function loadImages(paths, callback) {
    const imgs = [];
    let loadedCount = 0;
    paths.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            imgs[index] = img;
            loadedCount++;
            if (loadedCount === paths.length) callback(imgs);
        };
    });
}

// ランダム位置生成
function getRandomX() {
    return Math.random() * (canvas.width - 60) + 30;
}

function drawCircle(img, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 描画: 既存の落下キャラ
    characters.forEach((char) => {
        char.y += char.vy;
        char.vy += gravity;

        // 壁のバウンド処理
        if (char.x + char.radius > canvas.width || char.x - char.radius < 0) {
            char.vx *= -1;
        }
        // 底でバウンド処理
        if (char.y + char.radius > canvas.height) {
            char.y = canvas.height - char.radius;
            char.vy *= -bounceFactor;
        }

        char.x += char.vx;

        drawCircle(char.img, char.x, char.y, char.radius);
    });

    // 次のキャラを表示
    drawCircle(
        currentCharacter.img,
        currentCharacter.x,
        currentCharacter.y,
        currentCharacter.radius
    );

    // 次のキャラクター情報を画面上部に表示
    const nextCharacterDiv = document.getElementById("nextCharacter");
    nextCharacterDiv.textContent = `Next Character: ${nextCharacterIndex + 1}`;

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
        // 現在のキャラクターを落下させる
        characters.push({
            x: currentCharacter.x,
            y: currentCharacter.y,
            radius: currentCharacter.radius,
            img: currentCharacter.img,
            vx: Math.random() * 4 - 2, // 横方向のランダム速度
            vy: 0,
        });

        // 次のキャラクターを準備
        nextCharacterIndex = (nextCharacterIndex + 1) % images.length;
        currentCharacter.img = characters[nextCharacterIndex].img;
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
    currentCharacter.img = characters[0].img; // 最初のキャラクター画像を設定
    updateGame();
});