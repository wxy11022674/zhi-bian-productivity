import './explore.css';

const foundations = [
  {name:'数据', en:'DATA', title:'把真实问题，转化为可学习的样本。', text:'图像、文本与传感器记录，提供模型学习的材料。标签说明哪些特征与任务有关；样本是否覆盖真实环境，决定了模型能学到什么。', input:'零件图像、缺陷标注、采集条件', output:'经过整理与检查的训练、验证样本', limit:'同一缺陷在不同光照下可能完全不同。只收集“容易的样本”，会留下应用盲区。'},
  {name:'模型', en:'MODEL', title:'从样本里学习规律，再处理新输入。', text:'训练阶段调整模型参数，让输出更接近任务目标。使用阶段把新图像交给已训练模型，获得位置、类别等预测结果。训练与使用，是两个不同的过程。', input:'样本、任务目标与模型结构', output:'可重复使用的参数与预测结果', limit:'模型输出是依据已学规律作出的预测。环境改变、罕见缺陷或错误标签，都可能让判断失效。'},
  {name:'算力', en:'COMPUTE', title:'让学习与推理，在可用时间内完成。', text:'计算资源承担模型训练与运行。训练侧关心试验成本与迭代速度，产线侧更关心推理延迟、设备稳定性和部署成本。', input:'计算设备、内存、能耗与运行环境', output:'可在业务约束内运行的智能能力', limit:'更大的模型需要更多资源。实际选择还要考虑延迟、成本与维护，不能只比较参数规模。'},
  {name:'应用', en:'APPLICATION', title:'接入流程，才形成可衡量的改变。', text:'预测结果要连接复核、处置和反馈，才能变成生产动作。评价目标也从单次识别准确率，扩展到漏检、复核负担、总耗时和运行可靠性。', input:'模型输出、业务规则与责任分工', output:'有依据的处置，以及可追踪的反馈', limit:'发现错误后先核验，再整理样本与验证模型。反馈不会自动保证系统变好。'},
];
const factors = [
  {name:'技术突破', title:'从手工编写规则，到从数据中学习。', text:'传统视觉规则通常需要明确阈值与特征。学习型方法能从样本中提取更复杂的模式，但也把难点转移到数据覆盖、验证与持续维护。', before:'靠固定规则筛选', after:'用样本学习复杂特征', consequence:'能处理更多变化，也更需要检查泛化能力。'},
  {name:'要素重组', title:'变化发生在人、工具、数据与组织之间。', text:'检测员的经验转化为标注与复核规则；相机和模型负责采集与筛选；数据平台记录问题；组织规定哪些结果能放行、哪些必须升级处理。', before:'经验留在个人与单个工位', after:'经验进入样本、规则与协作流程', consequence:'任务分工与信息流一起变化，单换一个工具还不够。'},
  {name:'价值创造', title:'把局部能力，变成流程中的实际收益。', text:'节省一次识别时间，不等于整条线的效率提升。如果复核积压、错误处置或设备停机会抵消收益，就需要重新分配任务与资源。', before:'只看单次识别表现', after:'联合观察效率、质量与投入', consequence:'第二幕看流程，第三幕亲手检验这些取舍。'},
];
const process = [
  {name:'采集', title:'先让缺陷在图像中“看得见”。', input:'零件表面、光源、相机与采集位置', change:'统一采集条件，保留批次和设备信息，再形成可追踪样本。', risk:'反光可能像划痕；阴影可能遮住缺陷。模型能力无法弥补完全缺失的信息。', feedback:'把难样本及其光照、角度等条件一并记录，改进采集方案。'},
  {name:'检测', title:'把全量检查，转化为有线索的筛选。', input:'采集图像与已验证的模型', change:'输出疑似位置与类别，辅助区分可处理样本和需要复核的样本。', risk:'漏检会让缺陷流出；误报会增加复核负担。两类错误需要分别评价。', feedback:'按缺陷类型与生产批次分析错误，避免只看一个平均准确率。'},
  {name:'复核', title:'让不确定性进入明确的处理路径。', input:'疑似缺陷、异常样本与判断依据', change:'检测人员结合图像、工艺条件或补充检测作出放行、返工、升级等决定。', risk:'如果所有样本都要人工重查，筛选收益会被复核负担抵消。', feedback:'记录复核结果与原因，使经验成为可复用的标注和处置规则。'},
  {name:'反馈', title:'把一次纠错，变成可验证的改进。', input:'复核记录、错误分布与过程日志', change:'核验标签，补充样本，离线评估更新后的模型，再决定是否部署。', risk:'直接把所有反馈喂给模型，可能放大错误标签或造成新旧能力退化。', feedback:'上线后持续监测；必要时回退版本，形成有检查点的闭环。'},
];

export function mountExplorer() {
  const dialog=document.createElement('dialog');
  dialog.className='explore-dialog';dialog.setAttribute('aria-labelledby','explore-title');dialog.dataset.scrollable='';
  dialog.innerHTML=`<div class="explore-top"><span>INSIDE THE SHIFT</span><button class="explore-close" aria-label="关闭深入探索">×</button></div><div class="explore-body"><div class="explore-kicker">从能力，到生产力。</div><h2 id="explore-title"></h2><div class="explore-tabs" role="tablist" aria-label="深入探索主题"><button role="tab" data-explore-view="foundation" id="explore-tab-foundation" aria-controls="explore-panel">智能如何形成</button><button role="tab" data-explore-view="factors" id="explore-tab-factors" aria-controls="explore-panel">为什么是新质生产力</button><button role="tab" data-explore-view="process" id="explore-tab-process" aria-controls="explore-panel">产线如何重组</button></div><div id="explore-panel" role="tabpanel"></div></div>`;
  document.body.append(dialog);
  let view='foundation',selected=0;
  const panel=dialog.querySelector('#explore-panel');
  function render() {
    const focused=panel.contains(document.activeElement)?document.activeElement:null;
    const restoreContinue=focused?.classList.contains('explore-continue');
    const restoreChoice=focused?.hasAttribute('data-explore-choice');
    dialog.querySelector('#explore-title').textContent=view==='foundation'?'智能，不止一个算法。':view==='factors'?'AI，如何转化为新质生产力？':'一条产线，四种改变。';
    dialog.querySelectorAll('[data-explore-view]').forEach(b=>{const active=b.dataset.exploreView===view;b.classList.toggle('active',active);b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;});
    panel.setAttribute('aria-labelledby',`explore-tab-${view}`);
    const data=view==='foundation'?foundations:view==='factors'?factors:process;
    const d=data[selected];
    const chooser=`<div class="explore-choices" role="group" aria-label="${view==='foundation'?'智能的四个组成':view==='factors'?'生产力变化的三个层次':'质检四环节'}">${data.map((item,i)=>`<button data-explore-choice="${i}" aria-pressed="${i===selected}" class="${i===selected?'active':''}"><small>0${i+1}</small>${item.name}<span>${item.en||'→'}</span></button>`).join('')}</div>`;
    const detail=view==='foundation'?`<p>${d.text}</p><dl><div><dt>输入</dt><dd>${d.input}</dd></div><div><dt>形成</dt><dd>${d.output}</dd></div></dl><div class="explore-limit"><span>需要检查什么</span><p>${d.limit}</p></div>`:view==='factors'?`<p>${d.text}</p><div class="factor-change"><div><small>原有方式</small><strong>${d.before}</strong></div><span>→</span><div><small>新的组合</small><strong>${d.after}</strong></div></div><div class="explore-limit"><span>改变意味着</span><p>${d.consequence}</p></div>`:`<dl class="process-detail"><div><dt>输入</dt><dd>${d.input}</dd></div><div><dt>流程改变</dt><dd>${d.change}</dd></div><div><dt>关键问题</dt><dd>${d.risk}</dd></div><div><dt>反馈动作</dt><dd>${d.feedback}</dd></div></dl>`;
    const visual=view==='foundation'?`<div class="foundation-loop" aria-hidden="true"><div class="foundation-center"><small>INTELLIGENCE</small><b>智能核心</b></div>${foundations.map((x,i)=>`<span class="foundation-node node-${i} ${i===selected?'active':''}"><small>0${i+1}</small>${x.name}</span>`).join('')}<i></i><em>数据与模型形成能力，应用检验价值。</em></div>`:view==='factors'?`<div class="factor-system"><small>THE PRODUCTIVITY SYSTEM</small><div class="factor-nodes"><span>劳动者<em>经验 · 复核 · 处置</em></span><span>劳动资料<em>设备 · 模型 · 算力</em></span><span>劳动对象<em>零件 · 数据 · 样本</em></span><span>组织方式<em>分工 · 规则 · 反馈</em></span><b>协作</b></div><p>四者共同作用于一条流程。</p></div>`:`<div class="process-loop"><small>从问题，到下一次改进</small>${process.map((x,i)=>`<div class="${i===selected?'active':''}"><span>0${i+1}</span>${x.name}<i>↓</i></div>`).join('')}<p>核验 → 评估 → 部署 → 监测<br><span>反馈回到采集与模型，而非无条件自我学习。</span></p></div>`;
    panel.innerHTML=`${chooser}<div class="explore-columns"><article><div class="explore-section-label">0${selected+1} / 0${data.length}</div><h3>${d.title}</h3>${detail}</article><aside>${visual}</aside></div><div class="explore-bottom"><span>${view==='process'?'概念流程示意 · 不表示实际企业完整工艺':'概念拆解 · 以质检应用帮助理解'}</span><button class="explore-continue">${selected<data.length-1?'继续探索下一项':'回到展览'} <span>→</span></button></div>`;
    panel.querySelectorAll('[data-explore-choice]').forEach(b=>b.addEventListener('click',()=>{selected=Number(b.dataset.exploreChoice);render();}));
    panel.querySelector('.explore-continue').addEventListener('click',()=>{if(selected<data.length-1){selected++;render();}else dialog.close();});
    if(restoreContinue)panel.querySelector('.explore-continue').focus();
    else if(restoreChoice)panel.querySelector(`[data-explore-choice="${selected}"]`).focus();
  }
  dialog.querySelectorAll('[data-explore-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.exploreView;selected=0;render();}));
  dialog.querySelector('.explore-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const keys=['foundation','factors','process'];view=e.key==='Home'?keys[0]:e.key==='End'?keys[2]:keys[(keys.indexOf(view)+(e.key==='ArrowRight'?1:2))%3];selected=0;render();dialog.querySelector(`[data-explore-view="${view}"]`).focus();});
  dialog.querySelector('.explore-close').addEventListener('click',()=>dialog.close());
  document.querySelectorAll('[data-explore]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.explore;selected=Number(b.dataset.exploreIndex)||0;render();dialog.showModal();}));

  const specimenRoot=document.querySelector('#defect-specimen');
  const specimens=[
    {name:'表面划痕',kind:'scratch',signal:'细长、连续的局部纹理变化',action:'结合其他角度，检查划痕位置与连续性。',return:'将确认后的区域和缺陷类型录入样本。'},
    {name:'反光干扰',kind:'glare',signal:'高亮区域也可能被误判为缺陷',action:'调整光照或补拍，区分表面异常与成像干扰。',return:'记录采集条件，补充容易误报的负样本。'},
    {name:'边缘缺口',kind:'notch',signal:'轮廓相对完整边缘发生局部变化',action:'核对设计轮廓与工艺标准，确认是否超限。',return:'将处置依据与标注一起留存，便于后续核验。'},
  ];
  function renderSpecimen(i=0) {
    const restoreFocus=specimenRoot.contains(document.activeElement);
    const d=specimens[i];
    specimenRoot.innerHTML=`<div class="specimen-choices" aria-label="选择缺陷示意样本">${specimens.map((x,n)=>`<button data-specimen="${n}" aria-pressed="${i===n}" class="${i===n?'active':''}">${x.name}</button>`).join('')}</div><div class="specimen-image"><svg viewBox="0 0 310 120" aria-label="${d.name}的教学示意图" role="img"><defs><linearGradient id="part-metal" x1="0" x2="1" y2="1"><stop stop-color="#73818a"/><stop offset=".45" stop-color="#25343c"/><stop offset="1" stop-color="#9aa5a9"/></linearGradient></defs><path d="M70 18h170l25 23v54l-25 16H70L45 95V41Z" fill="url(#part-metal)" stroke="#697580"/><circle cx="155" cy="65" r="32" fill="#f6f5f1" stroke="#b6c2c4aa" stroke-width="4"/><circle cx="77" cy="43" r="7" fill="#f6f5f1"/><circle cx="233" cy="87" r="7" fill="#f6f5f1"/>${d.kind==='scratch'?'<path d="m199 34-17 30m22-25-12 19" stroke="#d9dfe0" stroke-width="1.5"/><rect x="176" y="27" width="35" height="45" fill="none" stroke="#4c50fa" stroke-dasharray="3 3"/>':d.kind==='glare'?'<path d="m75 19 43 0 49 92h-44Z" fill="#fff" opacity=".35"/><rect x="79" y="25" width="61" height="69" fill="none" stroke="#4c50fa" stroke-dasharray="3 3"/>':'<path d="m221 18 8 14 10-14" fill="#fff" stroke="#b6c2c4"/><rect x="213" y="9" width="35" height="34" fill="none" stroke="#4c50fa" stroke-dasharray="3 3"/>'}</svg><span>教学示意 · 非模型检测输出</span></div><dl class="specimen-detail"><div><dt>识别线索</dt><dd>${d.signal}</dd></div><div><dt>复核动作</dt><dd>${d.action}</dd></div><div><dt>反馈去向</dt><dd>${d.return}</dd></div></dl>`;
    specimenRoot.querySelectorAll('[data-specimen]').forEach(b=>b.addEventListener('click',()=>renderSpecimen(Number(b.dataset.specimen))));
    if(restoreFocus)specimenRoot.querySelector(`[data-specimen="${i}"]`).focus();
  }
  if(specimenRoot)renderSpecimen();
  document.querySelectorAll('[data-industry-view]').forEach(b=>b.addEventListener('click',()=>{const samples=b.dataset.industryView==='samples';document.querySelector('.industry-insight').classList.toggle('is-samples',samples);document.querySelector('#industry-timing').hidden=samples;document.querySelector('#industry-samples').hidden=!samples;document.querySelectorAll('[data-industry-view]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b);x.tabIndex=x===b?0:-1;});}));
  const industryTabs=document.querySelector('.industry-subtabs');
  industryTabs?.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const other=e.key==='Home'?industryTabs.querySelector('[data-industry-view="timing"]'):e.key==='End'?industryTabs.querySelector('[data-industry-view="samples"]'):industryTabs.querySelector('[aria-selected="false"]');other.click();other.focus();});
  return {dispose(){dialog.remove();}};
}
