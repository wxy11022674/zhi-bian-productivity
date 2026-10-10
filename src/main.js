import './style.css';
import './lab.css';
import { createWorld } from './scene.js';
import { mountLab } from './lab.js';
import { mountExplorer } from './explore.js';
import { mountFusion } from './fusion.js';

const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.4"/></svg>';
const mark = '<svg viewBox="0 0 44 44" fill="none" aria-hidden="true"><ellipse cx="22" cy="22" rx="18" ry="9" transform="rotate(-35 22 22)" stroke="currentColor"/><ellipse cx="22" cy="22" rx="18" ry="9" transform="rotate(55 22 22)" stroke="currentColor"/><circle cx="22" cy="22" r="3" fill="currentColor"/></svg>';
const sourceUrl = 'https://zjtx.miit.gov.cn/zxqySy/tzggView?allx=7&id=016822aa67ee4f7782964bbbc95bcf73&type=classic';
const chapters = ['唤醒', '产业重构', '生产力实验', '价值全景'];
const subtitles = ['AWAKEN THE INTELLIGENCE', 'REIMAGINE THE PROCESS', 'FIND YOUR BALANCE', 'PRODUCTIVITY RE:IMAGINED'];
const nextTitles = ['进入产业重构', '进入生产力实验', '探索价值全景', '重新开启探索'];
const hashes = ['awaken','industry','lab','panorama'];
const steps = {
  capture: { n:'01', title:'采集 · 让经验成为数据', text:'多角度采集零件图像，将人的检测经验转化为可用样本。数据质量，是智能判断的起点。', human:12, ai:8 },
  detect: { n:'02', title:'检测 · 从目测到辅助识别', text:'模型在图像中定位疑似缺陷，把检测结果与判断依据一起交给人。高亮框是识别过程的视觉示意。', human:36, ai:4 },
  review: { n:'03', title:'复核 · 人保留关键判断', text:'对低置信度与异常样本进行人工复核。智能负责筛选，经验负责判断边界，并纠正系统的错误。', human:18, ai:12 },
  feedback: { n:'04', title:'反馈 · 让下一次更有依据', text:'复核结果回到样本与流程，形成采集、判断、执行、反馈的闭环。改变的不只是单个工具。', human:14, ai:5 },
};

document.querySelector('#app').innerHTML = `
  <div class="exhibition" data-scene="0">
    <div class="gallery-atmosphere" aria-hidden="true"></div>
    <canvas id="world" aria-label="可交互的三维智能引擎与质检生产线"></canvas>
    <div class="engine-fallback" aria-hidden="true"><div class="fallback-ring r1"></div><div class="fallback-ring r2"></div><div class="fallback-ring r3"></div><div class="fallback-core"></div></div>
    <div class="grain" aria-hidden="true"></div>
    <header class="site-header">
      <button class="brand" data-goto="0" aria-label="智变，返回第一幕">${mark}<span>智变<small>THE PRODUCTIVITY SHIFT</small></span></button>
      <span class="header-divider"></span><span class="header-caption">人工智能 · 新质生产力</span>
      <nav class="chapter-nav" aria-label="四幕章节导航">${chapters.map((c,i)=>`<button data-goto="${i}" class="${i===0?'active':''}" ${i===0?'aria-current="step"':''}><span>0${i+1}</span>${c}</button>`).join('')}</nav>
      <div class="header-tools"><button id="evidence-button" class="text-tool">查看证据 <span>↗</span></button><button id="motion-button" class="icon-tool" aria-label="暂停动态效果" aria-pressed="false" title="暂停动态效果"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 5v10m6-10v10" stroke="currentColor" stroke-width="1.5"/></svg></button><button id="fullscreen-button" class="icon-tool" aria-label="全屏展示" title="全屏展示"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4" stroke="currentColor" stroke-width="1.2"/></svg></button></div>
    </header>

    <main id="scenes">
      <section class="scene hero is-active" aria-labelledby="hero-title" data-index="0">
        <div class="hero-copy">
          <div class="eyebrow"><span class="live-dot"></span>智变 · 生产力跃迁 <span class="eyebrow-line"></span> 01 / 04</div>
          <h1 id="hero-title">生产力，<br>正在被<br><span class="warm-text">重新定义。</span></h1>
          <p class="hero-description">让智能工具连接数据与人的经验，<br>看 AI 如何驱动新质生产力。</p>
          <button class="hero-cta" data-goto="1"><span>启动智能引擎<small>BEGIN THE SHIFT</small></span><span class="round-arrow">${arrow}</span></button>
          <button class="hero-deeper" data-explore="foundation">拆解智能核心 <span>↗</span></button>
        </div>
        <div class="hero-concepts"><button data-explore="factors" data-explore-index="0">技术突破<small>从规则，到学习</small><span>↗</span></button><button data-explore="factors" data-explore-index="1">要素重组<small>让经验进入协作流程</small><span>↗</span></button><button data-explore="factors" data-explore-index="2">价值创造<small>从局部能力，到整体收益</small><span>↗</span></button></div>
        <div class="object-catalog"><span>INTELLIGENCE ENGINE</span><small>Ⅰ — 潜能态 / POTENTIAL</small><div class="catalog-line"></div></div>
        <div class="engine-label label-top"><span class="annotation-dot"></span><span>数据 × 模型 × 算力<small>THE FOUNDATION OF INTELLIGENCE</small></span></div>
        <div class="engine-label label-bottom"><span class="annotation-line"></span><span>同一个核心，新的组合。<small>ONE CORE. NEW POSSIBILITIES.</small></span></div>
        <div class="hero-axis" aria-hidden="true"><span>Y</span><i></i><span>X</span></div>
      </section>

      <section class="scene industry" aria-labelledby="industry-title" data-index="1" hidden>
        <div class="scene-heading"><div class="eyebrow">02 / 04 <span class="eyebrow-line"></span> INDUSTRIAL TRANSFORMATION</div><h2 id="industry-title">改变的，是整个流程<span class="warm-text">。</span></h2><p>拖动边界，观察一枚精密零件的质检，如何形成新的协作闭环。</p><button class="industry-deeper" data-explore="process">深入流程：输入、判断与反馈 <span>↗</span></button></div>
        <div class="production-label"><span class="live-dot"></span>精密零件 · 质检产线<small>Ⅱ — 展开态 / TRANSFORMATION</small></div>
        <div class="compare-area" id="compare-area"><span class="side-tag tag-ai">AI 协同</span><span class="side-tag tag-manual">人工流程</span><div class="compare-divider" id="compare-divider"><button id="compare-handle" aria-label="拖动比较边界" title="左右拖动比较"><span>‹</span><span>›</span></button><span class="divider-caption">拖动探索</span></div></div>
        <div class="pipeline-stations">${Object.entries(steps).map(([key,s],i)=>`<button data-step="${key}" class="${i===1?'selected':''}"><span>${s.n}</span>${s.title.split(' · ')[0]}<i></i></button>`).join('')}</div>
        <aside class="industry-insight">
          <div class="insight-head"><span>PROCESS INSIGHT</span><span id="step-counter">02 / 04</span></div>
          <h3 id="step-title">${steps.detect.title}</h3><p id="step-description">${steps.detect.text}</p>
          <div class="industry-subtabs" role="tablist" aria-label="产线观察内容"><button role="tab" id="industry-timing-tab" data-industry-view="timing" class="active" aria-selected="true" aria-controls="industry-timing">流程耗时</button><button role="tab" id="industry-samples-tab" data-industry-view="samples" aria-selected="false" aria-controls="industry-samples" tabindex="-1">缺陷观察</button></div>
          <div class="timing-chart" id="industry-timing" role="tabpanel" aria-labelledby="industry-timing-tab"><div class="chart-heading"><span>单件流程耗时</span><small>教学设定 · 秒</small></div>${Object.entries(steps).map(([key,s])=>`<div class="timing-row ${key==='detect'?'selected':''}" data-chart-step="${key}"><span>${s.title.split(' · ')[0]}</span><div class="timing-track"><i class="timing-baseline" style="width:${s.human/36*100}%"></i><i class="timing-current" id="time-${key}"></i></div><b id="time-value-${key}"></b></div>`).join('')}<div class="chart-legend"><span><i class="legend-gray"></i>人工流程</span><span><i class="legend-amber"></i>当前协作配置</span></div></div>
          <div class="industry-samples" id="industry-samples" role="tabpanel" aria-labelledby="industry-samples-tab" hidden><div id="defect-specimen"></div></div>
          <button class="case-link" data-evidence="case"><span><small>真实应用案例</small><b>85%<em>以上</em></b><span>人工质检成本降低</span></span><span class="case-arrow">↗</span></button>
          <p class="case-caption">高压组件单案例成效 · 工信部平台 · 2025<br>本产线为流程演示，与案例设备并非一一对应。</p>
        </aside>
        <div class="compare-control"><span>人工流程</span><input id="comparison" type="range" min="0" max="100" value="55" aria-label="AI 协同展开比例"><span>AI 协同</span><output id="comparison-value">55%</output><button id="industry-lab" data-goto="2">亲手配置协作 ${arrow}</button></div>
        <div class="industry-note">流程演示 · 非实时工业检测 <span>点击四个环节，查看变化发生在哪里</span></div>
      </section>

      <section class="scene experiment" aria-labelledby="lab-title" data-index="2" hidden>
        <div class="scene-heading"><div class="eyebrow">03 / 04 <span class="eyebrow-line"></span> PRODUCTIVITY LAB</div><h2 id="lab-title">让智能，<span class="warm-text">恰到好处。</span></h2><p>同一条产线，不同的协作方式。效率、质量与人的投入，由你平衡。</p></div>
        <div class="lab-object-state" aria-hidden="true">${mark}<span>Ⅲ — 协作态<small>THE ENGINE, AS A WORKFLOW</small></span></div>
        <div id="lab-mount"></div>
      </section>

      <section class="scene fusion-scene" aria-label="价值全景" data-index="3" hidden>
        <div id="fusion-mount" data-scrollable tabindex="-1"></div>
      </section>
    </main>

    <footer class="exhibition-footer"><div class="footer-section"><span id="current-index">01</span><span class="footer-separator">/</span><span>04</span><i></i><span id="current-subtitle">${subtitles[0]}</span></div><div class="chapter-track" aria-hidden="true"><span class="filled"></span><span></span><span></span><span></span></div><div class="footer-next"><span class="scroll-instruction">滚轮 / ↑ ↓ 切换章节</span><button id="next-scene"><span>${nextTitles[0]}</span>${arrow}</button></div></footer>
    <div class="scene-announcer" role="status" aria-live="polite"></div><div class="toast" role="status"></div>
  </div>
  <dialog id="evidence-dialog" class="evidence-dialog" aria-labelledby="evidence-title"><div class="dialog-top"><span>THE EVIDENCE ROOM</span><button id="close-evidence" aria-label="关闭证据面板">×</button></div><div class="evidence-content"><div class="eyebrow">事实、案例与模拟，各有边界。</div><h2 id="evidence-title">看见改变，<br><span class="warm-text">也看清依据。</span></h2><div class="evidence-tabs" role="tablist" aria-label="证据分类"><button id="tab-case" data-evidence-tab="case" role="tab" aria-controls="evidence-panel">制造案例</button><button id="tab-model" data-evidence-tab="model" role="tab" aria-controls="evidence-panel">模拟口径</button><button id="tab-theme" data-evidence-tab="theme" role="tab" aria-controls="evidence-panel">主题依据</button></div><div id="evidence-panel" role="tabpanel"></div></div></dialog>
`;

const exhibition = document.querySelector('.exhibition');
const scenes = [...document.querySelectorAll('.scene')];
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
let scene = 0, lockedUntil = 0, world = null, paused = reducedQuery.matches, lab = null, fusion = null;
let comparison = 0.55;
const dialog = document.querySelector('#evidence-dialog');

function toast(message) {
  const el = document.querySelector('.toast');
  el.textContent = message; el.classList.add('visible');
  clearTimeout(toast.timer); toast.timer = setTimeout(()=>el.classList.remove('visible'),3000);
}

function selectStep(key) {
  if (!steps[key]) return;
  const s=steps[key];
  document.querySelector('#step-counter').textContent = `${s.n} / 04`;
  document.querySelector('#step-title').textContent = s.title;
  document.querySelector('#step-description').textContent = s.text;
  document.querySelectorAll('[data-step]').forEach(b=>{b.classList.toggle('selected', b.dataset.step===key);b.setAttribute('aria-pressed',String(b.dataset.step===key));});
  document.querySelectorAll('[data-chart-step]').forEach(b=>b.classList.toggle('selected',b.dataset.chartStep===key));
}

function updateComparison(value) {
  comparison=Math.min(1,Math.max(0,value));
  document.querySelector('#comparison').value=String(Math.round(comparison*100));
  document.querySelector('#comparison-value').textContent=`${Math.round(comparison*100)}%`;
  document.querySelector('#compare-divider').style.left=`${comparison*100}%`;
  for (const [key,s] of Object.entries(steps)) {
    const duration=s.human+(s.ai-s.human)*comparison;
    document.querySelector(`#time-${key}`).style.width=`${duration/36*100}%`;
    document.querySelector(`#time-value-${key}`).textContent=duration.toFixed(1);
  }
  const comparisonRect = document.querySelector('#compare-area').getBoundingClientRect();
  if (comparisonRect.width > 0) world?.setComparison((comparisonRect.left + comparisonRect.width * comparison) / document.documentElement.clientWidth);
}

function goTo(index, updateHash = true) {
  if (index<0 || index>3 || index===scene) return;
  const previous=scene; scene=index; lockedUntil=performance.now()+950;
  scenes.forEach((el,i)=>{el.hidden=i!==scene;el.classList.toggle('is-active',i===scene);el.inert=i!==scene;});
  exhibition.dataset.scene=String(scene);
  document.querySelectorAll('.chapter-nav button').forEach((el,i)=>{el.classList.toggle('active',i===scene);if(i===scene)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  document.querySelector('#current-index').textContent=`0${scene+1}`;
  document.querySelector('#current-subtitle').textContent=subtitles[scene];
  document.querySelector('#next-scene span').textContent=nextTitles[scene];
  document.querySelectorAll('.chapter-track span').forEach((el,i)=>el.classList.toggle('filled',i<=scene));
  world?.setScene(scene); world?.setPaused(paused||document.hidden||scene>1);
  if (scene===1) updateComparison(comparison);
  lab?.setActive?.(scene===2&&!paused);
  fusion?.setActive(scene===3);
  document.querySelector('.scroll-instruction').textContent=scene===3?'滚轮浏览本章 · 顶部切换章节':'滚轮 / ↑ ↓ 切换章节';
  document.querySelector('.scene-announcer').textContent=`第${scene+1}幕，${chapters[scene]}`;
  if(updateHash) history.replaceState(null,'',`#${hashes[scene]}`);
  if (previous!==scene) document.querySelectorAll('.scene [data-scene-enter]').forEach(el=>el.scrollTop=0);
}

document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>goTo(Number(b.dataset.goto))));
document.querySelector('#next-scene').addEventListener('click',()=>goTo((scene+1)%4));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>selectStep(b.dataset.step)));
document.querySelector('#comparison').addEventListener('input',e=>updateComparison(Number(e.target.value)/100));

const compareHandle=document.querySelector('#compare-handle');
const compareArea=document.querySelector('#compare-area');
let dragging=false;
function dragComparison(e) { const rect=compareArea.getBoundingClientRect();updateComparison((e.clientX-rect.left)/rect.width); }
compareHandle.addEventListener('pointerdown',e=>{dragging=true;compareHandle.setPointerCapture(e.pointerId);dragComparison(e);});
compareHandle.addEventListener('pointermove',e=>{if(dragging)dragComparison(e);});
compareHandle.addEventListener('pointerup',()=>{dragging=false;});
compareHandle.addEventListener('pointercancel',()=>{dragging=false;});
compareHandle.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();updateComparison(comparison+(e.key==='ArrowRight' ? .05 : -.05));}});

let wheelSum=0, wheelTime=0;
window.addEventListener('wheel',e=>{
  if(document.querySelector('dialog[open]') || performance.now()<lockedUntil || e.ctrlKey || dragging || e.target.closest('input,select,textarea,details,[data-scrollable]'))return;
  const now=performance.now(); if(now-wheelTime>220)wheelSum=0;wheelTime=now;
  wheelSum+=e.deltaY;
  if(Math.abs(wheelSum)>75){const next=scene+(wheelSum>0?1:-1);wheelSum=0;goTo(next);}
},{passive:true});
window.addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]') || e.defaultPrevented || e.target.closest('input,textarea,select,summary,[data-scrollable]'))return;
  if(['ArrowDown','PageDown','ArrowUp','PageUp','Home','End'].includes(e.key)){
    e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?3:scene+(['ArrowDown','PageDown'].includes(e.key)?1:-1);goTo(next);
  }
});

function setPaused(value){
  paused=value;exhibition.classList.toggle('motion-paused',paused);
  const b=document.querySelector('#motion-button');b.setAttribute('aria-pressed',String(paused));b.setAttribute('aria-label',paused?'恢复动态效果':'暂停动态效果');b.title=paused?'恢复动态效果':'暂停动态效果';
  b.innerHTML=paused?'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 4 8 6-8 6V4Z" stroke="currentColor" stroke-width="1.2"/></svg>':'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 5v10m6-10v10" stroke="currentColor" stroke-width="1.5"/></svg>';
  world?.setReducedMotion(paused);world?.setPaused(paused||document.hidden||scene>1);lab?.setActive?.(scene===2&&!paused);fusion?.setPaused(paused);
}
document.querySelector('#motion-button').addEventListener('click',()=>setPaused(!paused));
reducedQuery.addEventListener('change',e=>setPaused(e.matches));
document.addEventListener('visibilitychange',()=>world?.setPaused(paused||document.hidden||scene>1));
document.querySelector('#fullscreen-button').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('可按 F11 进入浏览器全屏展示');}
});

const evidence = {
  case: `<span class="evidence-type">企业案例自报 · 2025-11-19</span><h3>AI 无损检测赋能高压组件质检</h3><div class="evidence-stat">85%<small>以上</small></div><p>该案例报告人工质检成本降低 85% 以上。它反映的是 AI、设备与业务系统集成后的单案例成效，不能作为全行业平均值，也不能归因于 AI 单一因素。</p><dl><div><dt>发布平台</dt><dd>工信部 · 优质中小企业梯度培育平台</dd></div><div><dt>应用对象</dt><dd>新能源汽车高压平台无源功率组件</dd></div><div><dt>展示关系</dt><dd>本作品以精密金属零件产线解释流程，非案例设备复刻。</dd></div></dl><a class="source-link" href="${sourceUrl}" target="_blank" rel="noopener noreferrer">阅读原始案例 ${arrow}</a>`,
  theme: `<span class="evidence-type">主题依据 · 生产要素与创新</span><h3>AI 如何驱动新质生产力？</h3><p>新质生产力强调创新引领，以及劳动者、劳动资料、劳动对象和它们组合方式的跃升，并以全要素生产率提升作为核心标志。AI 的意义，要落到生产过程与成果上理解。</p><dl><div><dt>劳动者</dt><dd>检测与科研人员需要结合专业经验，学习使用、判断和验证模型输出。</dd></div><div><dt>劳动资料</dt><dd>模型、算力与数据库进入工具体系，并与仪器、产线和业务规则协同。</dd></div><div><dt>劳动对象</dt><dd>在实体零件、实验样本之外，图像、序列和结构数据成为可处理、可复用的对象。</dd></div><div><dt>优化组合</dt><dd>从孤立的识别或预测，走向采集、判断、验证、反馈联动的新流程。</dd></div></dl><p>本展以制造业案例、教学实验和科研路径解释这一微观机制。效率、质量和投入需要一起检验；本展没有测算宏观全要素生产率，也不把“使用 AI”直接等同于实现新质生产力。</p><a class="source-link" href="https://www.ndrc.gov.cn/wsdwhfz/202403/t20240301_1364322_ext.html" target="_blank" rel="noopener noreferrer">国家发改委：内涵特征与发展重点 ${arrow}</a>`,
  model: `<span class="evidence-type">交互教学模型 · 非真实企业预测</span><h3>参数是设定，取舍是真实问题。</h3><p>第三幕采用固定 100 件任务的确定性教学模型。自动处理范围和人工复核强度共同影响正确判定的期望数量、串行总耗时和人工复核量。</p><dl><div><dt>人工检测</dt><dd>2 分钟 / 件，判断错误率设定为 2%</dd></div><div><dt>AI 检测</dt><dd>0.25 分钟 / 件；自动范围越大，覆盖越难的样本，设定错误率随之提高。</dd></div><div><dt>人工复核</dt><dd>每件 2 分钟，发现被复核 AI 错误的 95%；纠错每件另计 3 分钟。</dd></div><div><dt>图表口径</dt><dd>数量是数学期望；总耗时按串行相加，不等同于真实产线节拍或工时收益。</dd></div></dl><p>第二幕的耗时条为独立的流程示意，人工 / AI 四环节设定为 12 / 8、36 / 4、18 / 12、14 / 5 秒；拖动值采用线性插值，仅帮助观察流程变化。它与真实案例成效及第三幕计算相互独立。</p>`,
};
let activeTab='case';
function openEvidence(tab='case'){
  activeTab=tab in evidence?tab:'case';
  document.querySelector('#evidence-panel').innerHTML=evidence[activeTab];
  document.querySelector('#evidence-panel').setAttribute('aria-labelledby',`tab-${activeTab}`);
  document.querySelectorAll('[data-evidence-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.evidenceTab===activeTab);b.setAttribute('aria-selected',String(b.dataset.evidenceTab===activeTab));b.tabIndex=b.dataset.evidenceTab===activeTab?0:-1;});
  if(!dialog.open)dialog.showModal();
}
document.querySelector('#evidence-button').addEventListener('click',()=>scene===3?fusion?.openEvidence():openEvidence(scene===0?'theme':scene===2?'model':'case'));
document.querySelectorAll('[data-evidence]').forEach(b=>b.addEventListener('click',()=>openEvidence(b.dataset.evidence)));
document.querySelectorAll('[data-evidence-tab]').forEach(b=>b.addEventListener('click',()=>openEvidence(b.dataset.evidenceTab)));
document.querySelector('.evidence-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();const keys=[...document.querySelectorAll('[data-evidence-tab]')].map(tab=>tab.dataset.evidenceTab),index=keys.indexOf(activeTab),key=e.key==='Home'?keys[0]:e.key==='End'?keys.at(-1):keys[(index+(e.key==='ArrowRight'?1:-1)+keys.length)%keys.length];openEvidence(key);document.querySelector(`#tab-${key}`).focus();});
document.querySelector('#close-evidence').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});

lab=mountLab(document.querySelector('#lab-mount'),{onEvidence:()=>openEvidence('model')});
const explorer=mountExplorer();
fusion=mountFusion(document.querySelector('#fusion-mount'));
try {
  world=createWorld(document.querySelector('#world'),{onHotspot:selectStep,onReady:()=>exhibition.classList.add('world-ready')});
  exhibition.classList.add('world-ready');
} catch(error) {
  console.warn('3D preview unavailable:',error.message);
  exhibition.classList.add('world-fallback');
  toast('当前浏览器已启用装置示意模式，内容与实验仍可操作');
}
setPaused(paused);updateComparison(comparison);selectStep('detect');
const sceneFromHash=()=>['#human','#frontier'].includes(location.hash)?3:hashes.indexOf(location.hash.slice(1));
const initial=sceneFromHash();if(initial>0)goTo(initial,false);
window.addEventListener('hashchange',()=>{const i=sceneFromHash();if(i>=0)goTo(i,false);});
window.addEventListener('resize',()=>{if(scene===1)updateComparison(comparison);});
window.addEventListener('pagehide',event=>{if(!event.persisted){world?.dispose();lab?.dispose?.();explorer?.dispose();fusion?.dispose();}});
window.addEventListener('pageshow',event=>{if(event.persisted){world?.setPaused(paused||document.hidden||scene>1);lab?.setActive?.(scene===2&&!paused);fusion?.setActive(scene===3);}});
