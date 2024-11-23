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
const imageNames = [
    'Yu', 'Ai', 'Ayumu', 'Emma',
    'Kanata', 'Karin', 'Kasumi',
    'Mia', 'Ranju', 'Rina',
    'Setuna', 'Shioriko', 'Shizuku'
];

const gravity = 0.5; // 重力
let characters = []; // 落下したキャラを保持
let nextCharacterIndex = 0; // 次のキャラクター
let currentCharacter = { x: canvas.width / 2, y: 50, radius: 30, img: null, name: '', index: 0 };
let score = 0; // スコア
let gameOver = false;

// 画像リスト
let loadedImages = [];

// スコア表示
function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 30);
}

// Next Character 表示
function drawNextCharacter() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.fillText(`Next: ${currentCharacter.name}`, 10, 30);
}

// ゲームオーバー表示
function drawGameOver() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
}

// 画像をロード
function loadImages(paths, callback) {
    const imgs = [];
    let loadedCount = 0;
    paths.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            imgs[index] = img;
            loadedCount++;
            if (loadedCount === paths.length) {
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
        console.error('Invalid image provided to drawCircle');
        return;
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
    const toRemove = []; // 削除するキャラクターのインデックス

    for (let i = 0; i < characters.length; i++) {
        for (let j = i + 1; j < characters.length; j++) {
            if (
                characters[i].name === characters[j].name && // 同じ名前同士のみ合成
                checkCollision(characters[i], characters[j])
            ) {
                // 進化可能か確認
                if (characters[i].index < images.length - 1) {
                    // 進化処理
                    characters[i].index++;
                    characters[i].img = loadedImages[characters[i].index];
                    characters[i].name = imageNames[characters[i].index];
                    characters[i].radius += 5; // サイズを大きくする
                    score += characters[i].radius * 10; // スコア加算
                    toRemove.push(j); // 削除対象のインデックスを記録
                }
            }
        }
    }

    // 削除リストを反映
    toRemove.sort((a, b) => b - a).forEach((index) => {
        characters.splice(index, 1);
    });
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

        // 床で固定（積み上げる）
        if (char.y + char.radius > canvas.height) {
            char.y = canvas.height - char.radius;
            char.vy = 0;
        }

        // 他のキャラに当たった場合
        for (let other of characters) {
            if (char !== other && checkCollision(char, other)) {
                char.y = other.y - char.radius - other.radius;
                char.vy = 0;
                break;
            }
        }

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

    // Next Character 表示
    drawNextCharacter();

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
        // キャラを落下させる
        characters.push({
            x: currentCharacter.x,
            y: currentCharacter.y,
            radius: currentCharacter.radius,
            img: currentCharacter.img,
            name: currentCharacter.name,
            index: currentCharacter.index,
            vx: 0,
            vy: gravity,
        });

        // 次のキャラクターを設定
        nextCharacterIndex = Math.floor(Math.random() * images.length);
        currentCharacter.img = loadedImages[nextCharacterIndex];
        currentCharacter.name = imageNames[nextCharacterIndex];
        currentCharacter.index = nextCharacterIndex;
        currentCharacter.x = canvas.width / 2;
        currentCharacter.y = 50;
    }
});

// ゲーム開始
loadImages(images, (imgs) => {
    loadedImages = imgs; // ロードされた画像を保存
    currentCharacter.img = loadedImages[0];
    currentCharacter.name = imageNames[0];
    currentCharacter.index = 0;
    updateGame();
});