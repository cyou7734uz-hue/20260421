let capture;
let pg;
let bubbles = [];
let saveBtn;
let okBtn;
let previewImg;
let isPreviewing = false;
let flashAlpha = 0; // 用於控制閃光效果的透明度

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

  // 建立截圖按鈕
  saveBtn = createButton('擷取視訊圖片');
  saveBtn.mousePressed(takeSnapshot);

  // 美化按鈕外觀
  saveBtn.style('background-color', '#efd3d7'); // 使用與泡泡相同的配色
  saveBtn.style('color', '#4a4e69');             // 深色文字增加對比度
  saveBtn.style('border', 'none');              // 移除預設邊框
  saveBtn.style('padding', '12px 24px');        // 增加內距
  saveBtn.style('border-radius', '25px');       // 圓角效果
  saveBtn.style('font-size', '16px');           // 字體大小
  saveBtn.style('font-weight', 'bold');         // 粗體字
  saveBtn.style('cursor', 'pointer');           // 滑鼠移入時顯示手指圖示
  saveBtn.style('box-shadow', '0 4px 15px rgba(0,0,0,0.1)'); // 增加柔和陰影

  // 建立 OK 按鈕（初始隱藏）
  okBtn = createButton('OK');
  okBtn.mousePressed(handleOk);
  okBtn.style('background-color', '#4a4e69'); // 使用對比色
  okBtn.style('color', '#ffffff');
  okBtn.style('border', 'none');
  okBtn.style('padding', '12px 40px');
  okBtn.style('border-radius', '25px');
  okBtn.style('font-weight', 'bold');
  okBtn.style('cursor', 'pointer');
  okBtn.hide();
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

  // 根據狀態設定按鈕位置與顯示
  if (!isPreviewing) {
    saveBtn.show();
    saveBtn.position(width / 2 - saveBtn.width / 2, y + videoHeight + 20);
    okBtn.hide();
  } else {
    saveBtn.hide();
    okBtn.show();
    okBtn.position(width / 2 - okBtn.width / 2, y + videoHeight + 20);
  }

  // 步驟：確保 pg 的內部解析度與攝影機影像 (capture) 原始寬高完全一致
  if (capture.width > 0 && (pg.width !== capture.width || pg.height !== capture.height)) {
    pg.resizeCanvas(capture.width, capture.height);
  }

  // 處理鏡像反轉並將影像繪製在中間
  push();
  // 將座標原點移到畫布右側，並水平翻轉座標系
  translate(width, 0);
  scale(-1, 1);

  // 製作馬賽克黑白效果
  if (!isPreviewing && capture.width > 0) {
    capture.loadPixels();
    let unitSize = 20; // 定義 20x20 為一個單位
    
    // 預先計算單位在畫布上顯示的比例寬高，避免在迴圈內重複計算
    let dw = (unitSize / capture.width) * videoWidth;
    let dh = (unitSize / capture.height) * videoHeight;

    for (let cy = 0; cy < capture.height; cy += unitSize) {
      for (let cx = 0; cx < capture.width; cx += unitSize) {
        // 取得該單位起始像素的 RGB 值
        let i = (floor(cx) + floor(cy) * capture.width) * 4;
        let r = capture.pixels[i];
        let g = capture.pixels[i + 1];
        let b = capture.pixels[i + 2];
        
        // 根據需求公式計算黑白顏色值: (R+G+B)/3
        let gray = (r + g + b) / 3;
        
        fill(gray);
        noStroke();
        
        // 將攝影機座標與單位大小映射到畫布顯示區域
        let dx = map(cx, 0, capture.width, x, x + videoWidth);
        let dy = map(cy, 0, capture.height, y, y + videoHeight);
        
        rect(dx, dy, dw, dh);
      }
    }
  }

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

  // 繪製即時時間戳記 (放在鏡像 pop 之後，文字才不會顛倒)
  if (!isPreviewing) {
    drawTimestamp(x, y, videoWidth, videoHeight);
  }

  // 如果處於預覽模式，在最上方繪製截圖圖片
  if (isPreviewing && previewImg) {
    // 繪製一個稍微大一點的白色底框，更有「照片」感
    fill(255);
    rect(x - 5, y - 5, videoWidth + 10, videoHeight + 10, 5);
    image(previewImg, x, y, videoWidth, videoHeight);
  }

  // 繪製閃光回饋效果
  if (flashAlpha > 0) {
    noStroke();
    fill(255, 255, 255, flashAlpha);
    rect(0, 0, width, height);
    flashAlpha -= 20; // 每一幀減少透明度，數字越大閃得越快
  }
}

// 截圖功能
function takeSnapshot() {
  // 重新計算當前視訊的區域（與 draw 保持一致）
  let videoWidth = width * 0.6;
  let videoHeight = height * 0.6;
  let x = (width - videoWidth) / 2;
  let y = (height - videoHeight) / 2;

  // 擷取前先畫上時間戳記，這樣存下來的 JPG 就會包含時間
  drawTimestamp(x, y, videoWidth, videoHeight);

  // 擷取畫布內容並存入變數
  previewImg = get(x, y, videoWidth, videoHeight);
  save(previewImg, 'my_capture.jpg'); // 觸發儲存
  flashAlpha = 255; // 觸發閃光
  isPreviewing = true; // 進入預覽模式
}

// 結束預覽功能
function handleOk() {
  isPreviewing = false;
  previewImg = null;
}

// 產生時間戳記文字並繪製到指定位置的輔助函式
function drawTimestamp(vx, vy, vw, vh) {
  let ts = year() + "-" + nf(month(), 2) + "-" + nf(day(), 2) + " " + 
           nf(hour(), 2) + ":" + nf(minute(), 2) + ":" + nf(second(), 2);
  
  push();
  fill(255); // 白色文字
  noStroke();
  textSize(14);
  textAlign(RIGHT, BOTTOM);
  // 將文字放在視訊區域內的右下角，並預留 10 像素的間距
  text(ts, vx + vw - 10, vy + vh - 10);
  pop();
}

// 當視窗大小改變時，自動調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
