// キャラクターマップ（番号: {img, kumo, txt}）
const charMap = {
  1: { img:"01.png", kumo:"kumo_b.png", txt:"01.txt" },
  2: { img:"02.png", kumo:"kumo_k.png", txt:"02.txt" },
  3: { img:"03.png", kumo:"kumo_w.png", txt:"03.txt" },
  4: { img:"04.png", kumo:"kumo_b.png", txt:"04.txt" }
  // 必要に応じて追加
};

const scrollContainer = document.getElementById('scroll-container');
const detailPanel = document.getElementById('detail-panel');
const detailText = document.getElementById('detail-text');
const detailClose = document.getElementById('detail-close');
const kumoImg = document.getElementById('kumo');

let currentIndex = Object.keys(charMap).length; // 初期表示は最大番号
let txtOpen = false;

// 旧スマホ判定（Android / iOS）
const userAgent = navigator.userAgent;
const isOldMobile = /Android\s[0-6]|iPhone|iPad|iPod.*OS\s[0-9_]/.test(userAgent);

// 画像生成
for (let i=1; i<=Object.keys(charMap).length; i++){
  const div = document.createElement('div');
  div.className = 'item';
  const img = document.createElement('img');
  img.src = charMap[i].img;
  img.alt = "キャラクター" + i;
  div.appendChild(img);
  scrollContainer.appendChild(div);
}

// 中央寄せスクロール（スムーズ補間）
function smoothScrollTo(container, targetLeft, duration = 2000){
  if(isOldMobile){ container.scrollLeft = targetLeft; return; }
  const start = container.scrollLeft;
  const change = targetLeft - start;
  const startTime = performance.now();
  function animate(time){
    const elapsed = time - startTime;
    const progress = Math.min(elapsed/duration,1);
    container.scrollLeft = start + change * easeInOutQuad(progress);
    if(progress<1) requestAnimationFrame(animate);
  }
  function easeInOutQuad(t){ return t<0.5?2*t*t:-1+(4-2*t)*t; }
  requestAnimationFrame(animate);
}

function scrollToCurrent(){
  const items = document.querySelectorAll('.item');
  const target = items[currentIndex-1];
  if(!target) return;
  const container = scrollContainer;
  let targetLeft = target.offsetLeft - (container.offsetWidth - target.offsetWidth)/2;
  if(currentIndex===1) targetLeft = 0;
  if(currentIndex===Object.keys(charMap).length) targetLeft = container.scrollWidth - container.offsetWidth;
  smoothScrollTo(container,targetLeft,2000);
  updateKumo(currentIndex);
  if(txtOpen) closeDetail();
}

// 雲更新
function updateKumo(index){
  const kumoFile = charMap[index].kumo;
  if(kumoImg.src.includes(kumoFile)) return;

  if(isOldMobile){
    kumoImg.src = kumoFile; // 即時切替
    kumoImg.style.left = -scrollContainer.scrollLeft*0.3 + 'px';
    return;
  }

  const newKumo = document.createElement('img');
  newKumo.src = kumoFile;
  newKumo.style.position='absolute';
  newKumo.style.top='0';
  newKumo.style.left='0';
  newKumo.style.height='100%';
  newKumo.style.width='auto';
  newKumo.style.zIndex='1';
  newKumo.style.opacity='0';
  newKumo.style.transition='opacity 0.5s';
  document.body.appendChild(newKumo);
  requestAnimationFrame(()=>{ newKumo.style.opacity='1'; });
  setTimeout(()=>{ kumoImg.src = kumoFile; newKumo.remove(); },500);
}

// ナビ
document.getElementById('next').addEventListener('click',()=>{
  if(currentIndex<Object.keys(charMap).length) currentIndex++;
  scrollToCurrent();
});
document.getElementById('prev').addEventListener('click',()=>{
  if(currentIndex>1) currentIndex--;
  scrollToCurrent();
});

// txt
document.getElementById('detail-toggle').addEventListener('click',()=>{
  if(txtOpen){ closeDetail(); } else { openDetail(); }
});
detailClose.addEventListener('click', closeDetail);

function openDetail(){
  txtOpen = true;
  const txtFile = charMap[currentIndex].txt;
  fetch(txtFile)
    .then(res=>res.text())
    .then(data=>{ detailText.innerText=data; detailPanel.style.display='block'; });
}
function closeDetail(){ txtOpen=false; detailPanel.style.display='none'; detailText.innerText=''; }

// 初期表示（右端）
window.addEventListener('load',()=>{ 
  const container = scrollContainer;
  container.scrollLeft = container.scrollWidth - container.offsetWidth;
  updateKumo(currentIndex);
});

// 雲横スクロール連動（パララックス）
scrollContainer.addEventListener('scroll',()=>{
  if(isOldMobile){ kumoImg.style.left = -scrollContainer.scrollLeft*0.3 + 'px'; return; }
  kumoImg.style.left = -scrollContainer.scrollLeft*0.3 + 'px';
});

// タッチ操作対応
let startX=0, scrollStart=0;
scrollContainer.addEventListener('touchstart', e=>{ startX=e.touches[0].pageX; scrollStart=scrollContainer.scrollLeft; });
scrollContainer.addEventListener('touchmove', e=>{
  const dx=startX - e.touches[0].pageX;
  scrollContainer.scrollLeft=scrollStart+dx;
});
