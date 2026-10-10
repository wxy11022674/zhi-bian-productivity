import './decision-lab.css';
import { calculate, defaults } from './decision-model.js';
import { landscape, returns } from './decision-charts.js';
export function mountDecisionLab(root) {
let params={...defaults};
const number=v=>v.toLocaleString('zh-CN',{maximumFractionDigits:2,minimumFractionDigits:2});
const txt=(x,y,s,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${s}</text>`;
  function sampleRow(top,rate,name){
    let b=txt(18,top+13,name,'prod-row-name');
    const good=100*(1-rate);
    for(let i=0;i<100;i++){
      const x=160+(i%50)*9,y=top+Math.floor(i/50)*17;
      const fraction=Math.max(0,Math.min(1,good-i));
      b+=`<rect x="${x}" y="${y}" width="6" height="11" rx="1" class="prod-defect"/><rect x="${x}" y="${y}" width="${6*fraction}" height="11" rx="1" class="prod-good"/>`;
    }
    return b+txt(650,top+12,number(good),'prod-good-label')+txt(650,top+30,`合格 / 100 件`,'prod-small')+txt(160,top+49,`缺陷 ${number(rate*100)} 件 · 每个方块 1 件，边界方块按比例填色`,'prod-small');
  }
  function flowRow(top,rate,name,ai){
    const center=top+29;
    let b=txt(18,top+14,name,'prod-row-name')+txt(18,top+34,ai?`应用率 ${Math.round(params.a*100)}%`:'固定基线','prod-small');
    b+=`<path d="M163 ${center}H451M451 ${center}C484 ${center} 482 ${center-16} 521 ${center-16}H619M451 ${center}C484 ${center} 482 ${center+25} 521 ${center+25}H619" class="prod-rail"/><path d="M451 ${center}C484 ${center} 482 ${center-16} 521 ${center-16}H619" class="prod-good-rail"/><path d="M451 ${center}C484 ${center} 482 ${center+25} 521 ${center+25}H619" class="prod-defect-rail"/>`;
    b+=`<rect x="156" y="${top+11}" width="53" height="36" rx="7" class="prod-node"/>`+txt(182,top+34,'输入','prod-node-label');
    b+=`<rect x="276" y="${top+7}" width="159" height="44" rx="8" class="prod-node ${ai&&params.a>0?'prod-node-ai':''}"/>`+txt(355,top+25,ai&&params.a>0?'智能辅助 + 人工判断':'人工检查','prod-node-label')+txt(355,top+41,ai&&params.a>0?`复核强度 ${Math.round(params.r*100)}%`:'基线缺陷率 5%','prod-node-sub');
    for(let i=0;i<8;i++)b+=`<rect x="218" y="${center-2}" width="4" height="4" rx="1" class="prod-moving" style="animation-delay:-${i*.48}s"/>`;
    b+=txt(631,center-12,`${number(100*(1-rate))} 合格`,'prod-good-label')+txt(631,center+30,`${number(100*rate)} 缺陷`,'prod-defect-label');
    return b;
  }
  root.classList.add('decision-lab');
  const keys=['a','d','t','r'], storageKey='zhi-bian-decision-scenarios-v1';
  let active=false, externalPaused=false, paused=false, mode='flow', view='landscape', month=12, scenarios={}, disposed=false;
  const abort=new AbortController(), signal=abort.signal;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fmt=(v,n=0)=>v.toLocaleString('zh-CN',{minimumFractionDigits:n,maximumFractionDigits:n});
  const money=v=>`${v>=0?'+':''}${fmt(v/10000,2)} 万元`;
  const payback=x=>x.investment===0?'无新增投入':x.payback===null?'无法回本':x.payback>24?'>24 个月':`${x.payback} 个月`;
  const valid=s=>!!s&&typeof s==='object'&&!Array.isArray(s)&&typeof s.saved==='string'&&Number.isFinite(Date.parse(s.saved))&&s.params&&typeof s.params==='object'&&!Array.isArray(s.params)&&Object.keys(s.params).length===4&&keys.every(k=>typeof s.params[k]==='number'&&Number.isFinite(s.params[k])&&s.params[k]>=0&&s.params[k]<=1);
  let storageNotice='方案仅保存在当前浏览器；再次保存会覆盖对应槽位。';
  try { const raw=JSON.parse(localStorage.getItem(storageKey)||'{}'); for(const k of ['A','B'])if(valid(raw?.[k]))scenarios[k]={params:{...raw[k].params},saved:raw[k].saved}; } catch { storageNotice='浏览器存储不可用；方案仍可在当前页面保存和比较。'; }
  root.innerHTML=`<div class="decision-intro"><span>02 / DECISION LAB · 价值实验</span><h2>把 AI 的生产力，<br>变成可以比较的方案。</h2><p>调整四个条件，观察产出、质量与收益如何一起变化。<br>制造业 / 质检与生产协同 · 教学模型，非实证预测。</p></div>
  <div class="decision-baseline">统一基线：每月 10,000 件 · 缺陷率 5% · 月成本 50 万元 · 合格品单价 80 元</div>
  <div class="decision-layout"><aside class="decision-controls"><div class="decision-control-title"><h3>配置你的方案</h3><button data-reset>重置</button></div>
  ${[['a','AI 应用率','多少工作环节引入 AI'],['d','数据质量','输入数据的可靠程度'],['t','培训水平','团队使用与理解工具的能力'],['r','人工复核强度','对模型结果的人工检查程度']].map(([k,title,hint])=>`<label class="decision-slider"><span>${title}<output data-value="${k}"></output></span><small>${hint}</small><input type="range" data-param="${k}" aria-label="${title}" min="0" max="100" value="${defaults[k]*100}"><span class="decision-range"><small>0%</small><small>100%</small></span></label>`).join('')}
  <div class="decision-presets"><small>试试一种情境</small><div><button data-preset="ready">准备充分</button><button data-preset="rushed">仓促上线</button></div></div><div class="decision-save"><button data-save="A">存为方案 A</button><button data-save="B">存为方案 B</button></div><p class="decision-storage" role="status">${storageNotice}</p></aside>
  <div class="decision-results"><div class="decision-kpis" aria-live="polite"></div>
  <section class="decision-production"><div class="decision-panel-heading"><div><span>PROCESS OBSERVATORY</span><h3>生产过程显影</h3></div><div class="decision-actions"><div role="group" aria-label="生产过程视图"><button data-mode="flow" aria-pressed="true">流程</button><button data-mode="samples" aria-pressed="false">百件样本</button></div><button data-pause aria-pressed="false">暂停</button></div></div><div class="decision-stage"></div><p class="decision-note"></p></section>
  <section class="decision-chart-panel"><div class="decision-panel-heading"><h3 data-chart-title>收益地形：找到投入的边界</h3><div class="decision-actions" role="group" aria-label="收益视图"><button data-view="landscape" aria-pressed="true">收益地形</button><button data-view="returns" aria-pressed="false">时间轨迹</button></div></div><div class="decision-terrain" tabindex="0" role="group" aria-label="收益热力图。方向键左右调整AI应用率，上下调整数据质量；每次5%。"></div><div class="decision-timeline" hidden><div data-returns></div><label class="decision-month">观察第 <output data-month-label>12</output> 个月<input aria-label="观察月份" data-month type="range" min="0" max="24" value="12"><strong data-month-value></strong></label><p>累计增量净收益 / 万元 · 0–24 月 · 已扣除一次性投入</p></div><p class="decision-chart-hint">点击或拖动热图选择应用率与数据质量；培训和复核保持当前值。也可聚焦热图后使用方向键。</p></section>
  <p class="decision-insight" aria-live="polite"></p></div></div>
  <section class="decision-comparison"><h3>把两种选择放在一起</h3><p>保存后可恢复参数；比较使用同一模型、同一单位。</p><div data-scenarios></div></section>
  <details class="decision-model-details"><summary>模型公式、假设与适用边界</summary><p>所有系数均为教学假设，未经实证校准。本模型未计入折现、需求波动、税费及设备折旧，不构成真实企业预测。</p><p>a：AI 应用率；d：数据质量；t：培训水平；r：人工复核强度，范围均为 0–1。基线月净贡献为 260,000 元。</p><code>有效应用 e = a × d × (0.4 + 0.6t)<br>毛产出 = 10000 × (1 + 0.5e − 0.12ar)<br>缺陷率 = clamp(0.05 − 0.035e − 0.01ar + 0.04a(1−d)(1−r), 0.005, 0.15)<br>合格产出 = 毛产出 × (1 − 缺陷率)<br>月成本 = 500000 + 50000a + 30000at + 40000ar<br>一次性投入 = 200000a + 100000at<br>月增量收益 = 合格产出 × 80 − 月成本 − 260000<br>第 n 月累计净收益 = n × 月增量收益 − 一次性投入</code><p>正增量收益时，回本月数向上取整“投入 ÷ 月增量收益”；非正收益显示无法回本，零投入显示无新增投入。</p></details>`;
  const $=s=>root.querySelector(s), $$=s=>root.querySelectorAll(s);
  const notice=s=>$('.decision-storage').textContent=s;
  function motion(){const stop=!active||externalPaused||paused||reduced.matches||document.hidden;root.classList.toggle('decision-stopped',stop);const b=$('[data-pause]');b.textContent=reduced.matches?'低动效':paused?'继续':'暂停';b.disabled=reduced.matches;b.setAttribute('aria-pressed',String(paused||reduced.matches));}
  function renderScenarios(){
    const slots=['A','B'], results=slots.map(k=>scenarios[k]?calculate(scenarios[k].params):null);
    if(!results.some(Boolean)){$('[data-scenarios]').innerHTML='<p class="decision-empty">调整参数后，存为方案 A 或 B，即可在这里比较。</p>';return;}
    const row=(name,f)=>`<tr><th scope="row">${name}</th>${results.map((x,i)=>`<td>${x?f(x,scenarios[slots[i]]):'尚未保存'}</td>`).join('')}</tr>`;
    $('[data-scenarios]').innerHTML=`<div class="decision-table-wrap"><table><thead><tr><th>比较维度</th>${slots.map(k=>`<th>方案 ${k} ${scenarios[k]?`<button data-load="${k}">载入参数</button>`:''}</th>`).join('')}</tr></thead><tbody>${row('应用 / 数据 / 培训 / 复核',(x,s)=>keys.map(k=>`${Math.round(s.params[k]*100)}%`).join(' / '))}${row('月合格产出',x=>`${fmt(x.good)} 件`)}${row('缺陷率',x=>`${fmt(x.defectRate*100,2)}%`)}${row('月增量收益',x=>money(x.delta))}${row('一次性投入',x=>`${fmt(x.investment/10000,2)} 万元`)}${row('回本',payback)}${row('24 个月累计增量净收益',x=>money(x.timeline[24].value))}</tbody></table></div>${results.every(Boolean)?`<div class="decision-scenario-chart"><p><span style="color:#4d50ff">━ 方案 A</span>　<span style="color:#8c51ce">━ 方案 B</span> · 累计增量净收益 / 万元</p>${returns(results.map((result,i)=>({result,name:`方案 ${slots[i]}`,color:i?'#8c51ce':'#4d50ff'})))}</div>`:''}`;
  }
  function render(){
    const x=calculate(params);
    keys.forEach(k=>{$(`[data-param="${k}"]`).value=Math.round(params[k]*100);$(`[data-value="${k}"]`).textContent=`${Math.round(params[k]*100)}%`;});
    $('.decision-kpis').innerHTML=[['月合格产出',`${fmt(x.good)}<small>件</small>`,`较基线 ${x.good>=9500?'+':''}${fmt((x.good/9500-1)*100,1)}%`],['缺陷率',`${fmt(x.defectRate*100,2)}<small>%</small>`,'基线为 5.00%'],['月增量收益',`${x.delta>=0?'+':''}${fmt(x.delta/10000,2)}<small>万元</small>`,'相对不使用 AI 的基线'],['预计回本',payback(x),'按当前参数估算']].map(([label,value,note])=>`<div><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join('');
    const body=mode==='flow'?flowRow(10,.05,'传统基线',false)+flowRow(108,x.defectRate,'当前配置',true):sampleRow(18,.05,'传统基线')+sampleRow(112,x.defectRate,'当前配置');
    $('.decision-stage').innerHTML=`<svg viewBox="0 0 760 206" role="img" aria-label="百件归一化教学批次，传统合格95件；当前合格${number(100*(1-x.defectRate))}件">${body}</svg>`;
    $('.decision-note').textContent=`教学模型 · 百件归一化期望值，非实测样本；动画仅示意流向。月毛产出 ${number(x.gross)} 件 → 合格 ${number(x.good)} 件。`;
    $('.decision-terrain').innerHTML=landscape(params);
    $('[data-returns]').innerHTML=returns([{name:'当前方案',result:x}]);
    $('[data-month-label]').textContent=month;$('[data-month-value]').textContent=money(x.timeline[month].value);
    $('.decision-insight').textContent=params.a===0?'尚未引入 AI：当前结果回到基线。':x.delta<=0?'当前方案没有产生正向增量收益。改善数据质量和培训，观察新增产出能否覆盖成本。':'当前假设下，新增合格产出的价值超过新增月成本。比较复核强度，观察质量与速度的取舍。';
    $$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));motion();
  }
  root.addEventListener('input',e=>{const k=e.target.dataset.param;if(keys.includes(k)){params[k]=Number(e.target.value)/100;render();}else if(e.target.hasAttribute('data-month')){month=Number(e.target.value);const x=calculate(params);$('[data-month-label]').textContent=month;$('[data-month-value]').textContent=money(x.timeline[month].value);}},{signal});
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!root.contains(b))return;
    if(b.hasAttribute('data-reset')){params={...defaults};render();notice('参数已恢复默认，保存方案保持不变。');}
    else if(b.dataset.preset){params=b.dataset.preset==='ready'?{a:.8,d:.95,t:.85,r:.5}:{a:.95,d:.2,t:.1,r:.1};render();}
    else if(b.dataset.mode){mode=b.dataset.mode;render();}
    else if(b.hasAttribute('data-pause')){paused=!paused;motion();}
    else if(b.dataset.view){view=b.dataset.view;$('.decision-terrain').hidden=view!=='landscape';$('.decision-timeline').hidden=view!=='returns';$('.decision-chart-hint').hidden=view!=='landscape';$('[data-chart-title]').textContent=view==='landscape'?'收益地形：找到投入的边界':'时间轨迹：看见投入与回报';$$('[data-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.view===view)));}
    else if(['A','B'].includes(b.dataset.save)){scenarios[b.dataset.save]={params:{...params},saved:new Date().toISOString()};try{localStorage.setItem(storageKey,JSON.stringify(scenarios));notice(`方案 ${b.dataset.save} 已保存在此浏览器。`);}catch{notice('浏览器存储不可用，方案暂存当前页面，刷新会丢失。');}renderScenarios();}
    else if(['A','B'].includes(b.dataset.load)&&valid(scenarios[b.dataset.load])){params={...scenarios[b.dataset.load].params};render();notice(`已载入方案 ${b.dataset.load}。`);}
  },{signal});
  const terrain=$('.decision-terrain');let pointer=null,frame=0,pending=null;
  const apply=()=>{frame=0;if(!pending||disposed)return;params={...params,...pending};pending=null;render();};
  const probe=e=>{const svg=terrain.querySelector('svg'),matrix=svg?.getScreenCTM();if(!matrix)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());pending={a:Math.round(Math.max(0,Math.min(1,(p.x-68)/420))*100)/100,d:Math.round(Math.max(0,Math.min(1,(248-p.y)/200))*100)/100};if(!frame)frame=requestAnimationFrame(apply);};
  terrain.addEventListener('pointerdown',e=>{if(e.button!==0||!e.target.closest('[data-land-a]'))return;e.preventDefault();pointer=e.pointerId;terrain.setPointerCapture(pointer);terrain.focus({preventScroll:true});probe(e);},{signal});
  terrain.addEventListener('pointermove',e=>{if(pointer===e.pointerId){e.preventDefault();probe(e);}},{signal});
  const end=e=>{if(pointer!==e.pointerId)return;if(frame)cancelAnimationFrame(frame);apply();if(terrain.hasPointerCapture(pointer))terrain.releasePointerCapture(pointer);pointer=null;};
  terrain.addEventListener('pointerup',end,{signal});terrain.addEventListener('pointercancel',end,{signal});terrain.addEventListener('lostpointercapture',()=>{pointer=null;},{signal});
  terrain.addEventListener('keydown',e=>{const directions={ArrowRight:['a',.05],ArrowLeft:['a',-.05],ArrowUp:['d',.05],ArrowDown:['d',-.05]};if(!directions[e.key])return;e.preventDefault();e.stopPropagation();const[k,v]=directions[e.key];params[k]=Math.round(Math.max(0,Math.min(1,params[k]+v))*100)/100;render();},{signal});
  document.addEventListener('visibilitychange',motion,{signal});reduced.addEventListener('change',motion,{signal});
  render();renderScenarios();
  return {setActive(value){active=!!value;motion();},setPaused(value){externalPaused=!!value;motion();},dispose(){disposed=true;abort.abort();if(frame)cancelAnimationFrame(frame);root.classList.add('decision-stopped');}};
}
