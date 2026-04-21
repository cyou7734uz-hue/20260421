let capture;
let pg;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  
  // 隱藏預設出現在畫布下方的 HTML 影片元素，只在畫布內繪製
  capture.hide();

  // 建立一個與預設視訊解析度相近的繪圖圖層
  // 註：通常攝影機啟動需時間，這裡先建立一個基礎大小，draw 中會依需求縮放
  pg = createGraphics(640, 480);
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 計算影像顯示的大小（畫布寬高的 60%）
  let videoWidth = width * 0.6;
  let videoHeight = height * 0.6;

  // 計算置中座標
  let x = (width - videoWidth) / 2;
  let y = (height - videoHeight) / 2;

  // 處理鏡像反轉並將影像繪製在中間
  push();
  // 將座標原點移到畫布右側，並水平翻轉座標系
  translate(width, 0);
  scale(-1, 1);
  image(capture, x, y, videoWidth, videoHeight);

  // 更新 Graphics 內容 (範例：在圖層中間畫一個圓與文字)
  pg.clear(); // 確保背景透明
  pg.stroke(255);
  pg.strokeWeight(4);
  pg.noFill();
  pg.ellipse(pg.width / 2, pg.height / 2, 100, 100); 
  pg.fill(255);
  pg.noStroke();
  pg.textSize(32);
  pg.textAlign(CENTER, CENTER);
  pg.text("Overlay Layer", pg.width / 2, pg.height / 2 + 80);

  // 將 Graphics 內容繪製在視訊畫面之上，並縮放到與視訊相同的大小
  image(pg, x, y, videoWidth, videoHeight);
  pop();
}

// 當視窗大小改變時，自動調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
