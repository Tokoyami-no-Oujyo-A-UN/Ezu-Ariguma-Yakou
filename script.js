const container = document.getElementById("scroll-container");
const kumo = document.getElementById("kumo");
const detailPanel = document.getElementById("detail-panel");
const detailContent = document.getElementById("detail-content");
const closeBtn = document.getElementById("close-detail");

/* 設定 */
const IMAGE_COUNT =4;      // 最大99枚
const IMAGE_PREFIX = "img";
const IMAGE_EXT = ".png";

/* キャラごとの雲色指定（1開始：1=img01, 2=img02 ...） */
const kumoColorByIndex = {
  1: "b", // img01
  2: "k", // img02
  3: "w", // img03
  4: "b", // img04
  // 必要に応じて4〜99も追加
};

/* 左から順に画像生成 */
for (let i = 1; i <= IMAGE_COUNT; i++) {
  const num = String(i).padStart(2,"0");
  const div = document.createElement("div");
  div.className = "item";
  const img = document.createElement("img");
  img.src = IMAGE_PREFIX + num + IMAGE_EXT;
  div.appendChild(img);

  // 詳細ボタン
  const detailBtn = document.createElement("button");
  detailBtn.className = "detail-btn";
  detailBtn.textContent = "詳細";
  detailBtn.addEventListener("click", () => loadDetail(i));
  div.appendChild(detailBtn);

  container.appendChild(div);
}

const items = [...document.querySelectorAll(".item")];
let index = items.length;

/* イージング */
function easeInOut(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

/* 2秒スクロール */
function smoothScrollTo(target,duration=2000){
  const start=container.scrollLeft;
  const change=target-start;
  const startTime=performance.now();
  function animate(now){
    const elapsed=now-startTime;
    const progress=Math.min(elapsed/duration,1);
    const eased=easeInOut(progress);
    container.scrollLeft=start+change*eased;
    if(progress<1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* 雲切替 */
function updateKumoColor(i){
  const color=kumoColorByIndex[i];
  if(!color) return;
  const newURL="url(kumo_"+color+".png)";
  if(kumo.style.backgroundImage===newURL) return;
  kumo.style.transition="opacity 0.5s ease";
  kumo.style.opacity=0.5;
  setTimeout(()=>{kumo.style.backgroundImage=newURL;kumo.style.opacity=1;},500);
}

/* 中央寄せ（端は端表示） */
function scrollToIndex(i){
  if(i<1||i>items.length) return;
  index=i;
  updateKumoColor(i);
  const item=items[i-1];
  const center=container.clientWidth/2;
  const itemCenter=item.offsetLeft+item.clientWidth/2;
  let targetScroll;
  if(i===1) targetScroll=0;
  else if(i===items.length) targetScroll=container.scrollWidth-container.clientWidth;
  else targetScroll=itemCenter-center;
  smoothScrollTo(targetScroll);

  if(detailPanel.style.display==="block") loadDetail(i);
}

/* 詳細表示 */
function loadDetail(i){
  const num=String(i).padStart(2,"0");
  fetch(num+".txt")
    .then(res=>res.text())
    .then(text=>{
      detailContent.textContent=text;
      detailPanel.style.display="block";
    })
    .catch(()=>{detailContent.textContent="説明がありません。"; detailPanel.style.display="block";});
}

closeBtn.addEventListener("click",()=>{detailPanel.style.display="none";});

/* ナビ操作 */
document.getElementById("next").onclick=()=>scrollToIndex(index-1);
document.getElementById("prev").onclick=()=>scrollToIndex(index+1);

/* 雲パララックス */
container.addEventListener("scroll",()=>{kumo.style.backgroundPositionX=-(container.scrollLeft*0.3)+"px";});

/* 初期表示 */
window.addEventListener("load",()=>{
  const lastItem=items[items.length-1];
  const center=container.clientWidth/2;
  const itemCenter=lastItem.offsetLeft+lastItem.clientWidth/2;
  const maxScroll=container.scrollWidth-container.clientWidth;
  container.scrollLeft=Math.min(itemCenter-center,maxScroll);
  index=items.length;
  updateKumoColor(index);
});

/* リサイズ対応 */
window.addEventListener("resize",()=>{scrollToIndex(index);});

/* タッチ対応 */
let touchStartX=0;
container.addEventListener("touchstart",e=>{touchStartX=e.touches[0].clientX;});
container.addEventListener("touchmove",e=>{const deltaX=touchStartX-e.touches[0].clientX; container.scrollLeft+=deltaX; touchStartX=e.touches[0].clientX;});
