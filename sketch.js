let capture;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  
  // 隱藏預設出現在畫布下方的 HTML 影片元素，只在畫布內繪製
  capture.hide();
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

  // 將攝影機影像繪製在畫布中間
  image(capture, x, y, videoWidth, videoHeight);
}

// 當視窗大小改變時，自動調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
