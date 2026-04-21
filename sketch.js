let capture;
let pg;
let bubbles = [];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  
  // 隱藏預設出現在畫布下方的 HTML 影片元素，只在畫布內繪製
  capture.hide();

  // 初始建立一個空的圖層，大小會在 draw 中根據攝影機解析度同步
  pg = createGraphics(1, 1);

  // 初始化泡泡資料 (使用 0-1 的比例座標以適應不同解析度)
  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: random(0, 1),
      y: random(0, 1),
      size: random(5, 20),
      speed: random(0.0005, 0.0015), // 降低速度，讓飄移更緩慢
      offset: random(0, 1000) // 隨機初始偏移量，讓每個泡泡擺動不同步
    });
  }
}

function draw() {
  // 設定背景顏色為 cbc0d3
  background('#cbc0d3');

  // 計算���像顯示的大小（畫布寬高的 60%）
  let videoWidth = width * 0.6;
  let videoHeight = height * 0.6;

  // 計算置中座標
  let x = (width - videoWidth) / 2;
  let y = (height - videoHeight) / 2;

  // 步驟：確保 pg 的內部解析度與攝影機影像 (capture) 原始寬高完全一致
  if (capture.width > 0 && (pg.width !== capture.width || pg.height !== capture.height)) {
    pg.resizeCanvas(capture.width, capture.height);
  }

  // 處理鏡像反轉並將影像繪製在中間
  push();
  // 將座標原點移到畫布右側，並水平翻轉座標系
  translate(width, 0);
  scale(-1, 1);
  image(capture, x, y, videoWidth, videoHeight);

  // 在 pg 圖層上繪製內容（這些內容會顯示在視訊上方）
  pg.clear(); // 確保背景透明
  pg.stroke('#efd3d7'); // 設定描邊顏色為 efd3d7
  pg.strokeWeight(4);
  pg.noFill();
  // 畫一個跟視訊一樣大的矩形邊框
  pg.rect(0, 0, pg.width, pg.height);
  pg.fill('#efd3d7'); // 設定填充顏色為 efd3d7
  pg.circle(pg.width / 2, pg.height / 2, 50);

  // 繪製並更新冒泡效果
  pg.noStroke(); // 不要框線
  for (let b of bubbles) {
    b.y -= b.speed; // 向上移動
    if (b.y < -0.05) b.y = 1.05; // 超過頂部後回到下方
    // 降低 sin 頻率 (0.02) 讓左右晃動更平滑
    let xSway = sin(frameCount * 0.02 + b.offset) * 15;
    let bx = b.x * pg.width + xSway;
    let by = b.y * pg.height;

    // 繪製泡泡主體 (更透明一點)
    pg.fill(255, 255, 255, 80);
    pg.circle(bx, by, b.size);
    // 繪製左上方的高光點，增加立體感
    pg.fill(255, 255, 255, 180);
    pg.circle(bx - b.size * 0.2, by - b.size * 0.2, b.size * 0.25);
  }

  // 將 Graphics 內容繪製在視訊畫面之上，並縮放到與視訊相同的大小
  image(pg, x, y, videoWidth, videoHeight);
  pop();
}

// 當視窗大小改變時，自動調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
