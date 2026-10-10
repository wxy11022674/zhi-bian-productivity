import './relationship.css';

export function mountRelationship(root, { onOpenLab = () => {}, onEvidence = () => {} } = {}) {
  let active = false, externalPaused = false, disposed = false;
  const cleanups = [];
  const listen = (target, type, listener, options) => { if (!target) return; target.addEventListener(type, listener, options); cleanups.push(() => target.removeEventListener(type, listener, options)); };
  root.innerHTML = `<section class="relationship-exhibit" data-scrollable>
  <div class="relationship-top"><span><i></i> THE NEXT WAY TO WORK</span><span>人工智能 × 新质生产力 / 交互特展</span></div>
  <div class="relationship-display"><h2>智能，<em>改写生产。</em><span aria-hidden="true">↗</span></h2><div class="relationship-display-foot"><b>PRODUCTIVITY<br>RE:IMAGINED</b><p>效率只是起点。<br>真正的变化，是重新定义我们如何创造价值。</p></div></div>
  <div class="relationship-hero-grid"><div class="relationship-copy"><div class="relationship-chapter-label"><i></i>04 / INTERACTIVE EXPERIENCE</div><h3>假如，你能<br>重新设计工作？</h3><p class="relationship-lead">把 AI 放进真实的任务链。<br>亲手分配任务，观察人与技术的关系如何改变。</p><div class="relationship-actions"><button type="button" class="relationship-primary" data-open-lab>进入生产力决策 <span aria-hidden="true">↗</span></button><button type="button" data-trace-journey>探索价值路径 →</button></div><div class="relationship-note"><span>切换空间总览可旋转</span><i></i><span>点击节点探索</span></div><div class="relationship-inspector"><span>关系场 / LIVE</span><p data-relationship="stage-selection">智能制造</p></div></div>
  <div class="spatial-window" data-relationship="spatial-stage"><canvas aria-label="人工智能生产力关系图"></canvas><p class="relationship-graph-note">机制示意 · 节点位置与连线不代表数量大小</p><div class="relationship-window-head"><span>生产力关系场</span><div class="relationship-map-switch" aria-label="空间图显示方式"><button type="button" data-map-view="network" aria-pressed="false">空间总览</button><button type="button" data-map-view="path" aria-pressed="true">路径追踪</button></div></div><div class="relationship-window-foot"><p data-relationship="stage-caption"></p><div><button type="button" data-relationship="stage-motion">暂停流动 Ⅱ</button><button type="button" data-relationship="stage-reset">复位视角</button></div></div></div></div>
  <div class="relationship-metrics"><button type="button" data-source="cost"><span>01 / 技术门槛</span><b>280<small>倍以上</small></b><p>同等基准能力的推理价格下降<small>2022.11—2024.10</small></p></button><button type="button" data-source="work"><span>02 / 工作方式</span><b>≈14<small>%</small></b><p>特定客服研究中的平均生产率改善<small>NBER · 2023 摘要</small></p></button><button type="button" data-source="protein"><span>03 / 创新空间</span><b>2<small>亿+</small></b><p>向科研社区开放的结构预测<small>EMBL-EBI · 2022</small></p></button></div>
  <div class="relationship-bottom"><span>↓ SCROLL TO DECIDE</span><p>数据 <i>→</i> 能力 <i>→</i> 产业 <i>→</i> 价值</p><span>历史证据 / 机制示意 / 可操作实验</span></div>
</section>`;

  listen(root.querySelector('[data-open-lab]'), 'click', onOpenLab);
  root.querySelectorAll('[data-source]').forEach(button => listen(button, 'click', () => onEvidence(button.dataset.source)));
  const canvas = root.querySelector('canvas');
  let ctx = null;
  try { ctx = canvas?.getContext('2d') ?? null; } catch { /* Keep the exhibit usable without a drawing context. */ }
  if (!ctx) {
    if (canvas) canvas.hidden = true;
    const fallback = document.createElement('div');
    fallback.tabIndex = 0;
    fallback.setAttribute('role', 'group');
    fallback.setAttribute('aria-label', '生产力关系场文字说明');
    Object.assign(fallback.style, { position: 'absolute', inset: '75px 15px 85px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px', color: '#171921', fontSize: '13px', lineHeight: '1.9' });
    fallback.innerHTML = '<strong style="font-weight:500;color:#3759f0">图像数据 → 智能能力 → 制造应用 → 生产价值</strong><p style="margin:0">感知识别发现可疑缺陷，辅助决策与自动执行连接初筛、记录和分流，支持效率提升与资源配置。人的判断贯穿目标设定、异常复核与责任承担。</p><small style="color:#686b76;font-size:11px">当前设备无法显示关系图，可继续进入生产力决策，或点击下方历史指标查看证据。</small>';
    root.querySelector('[data-relationship="spatial-stage"]')?.append(fallback);
    root.querySelectorAll('[data-map-view],[data-relationship="stage-motion"],[data-relationship="stage-reset"]').forEach(button => { button.disabled = true; });
    const caption = root.querySelector('[data-relationship="stage-caption"]');
    if (caption) caption.textContent = '制造路径 · 文字关系示意';
    listen(root.querySelector('[data-trace-journey]'), 'click', () => fallback.focus());
    return { setActive() {}, setPaused() {}, dispose() { disposed = true; cleanups.forEach(remove => remove()); fallback.remove(); } };
  }
  canvas.dataset.initialized = 'true';
  const stage = root.querySelector('[data-relationship="spatial-stage"]');
  const caption = root.querySelector('[data-relationship="stage-caption"]');
  const selection = root.querySelector('[data-relationship="stage-selection"]');
  const resetButton = root.querySelector('[data-relationship="stage-reset"]');
  const motionButton = root.querySelector('[data-relationship="stage-motion"]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = { data: '#171921', ai: '#3759F0', industry: '#3759F0', value: '#9062E8', human: '#171921' };
  const rows = [
    [
      ['text', '文本与知识', 'data', '文档、业务记录与语言构成可处理的知识输入。数据需要合法获取、清洗和质量控制。'],
      ['image', '图像与影像', 'data', '图像进入视觉模型，可支持缺陷识别和影像辅助分析；识别结果仍需按场景复核。'],
      ['sensor', '传感信号', 'data', '设备与环境信号帮助模型识别状态、预测变化，数据质量决定应用上限。'],
      ['sequence', '科研序列', 'data', '序列与实验数据支持结构预测和候选方案探索，模型结果需要实验验证。']
    ],
    [
      ['perception', '感知识别', 'ai', '将图像、信号等输入转为可用信息，让生产系统发现异常。'],
      ['prediction', '预测推断', 'ai', '从数据中学习规律，支持田间状态分析与蛋白质结构预测；预测需要按具体任务验证。'],
      ['creation', '生成创造', 'ai', '生成文本、设计和候选方案，扩大人的探索空间；生成结果不等于事实。'],
      ['decision', '辅助决策', 'ai', '比较方案、协调资源，为人的决策提供依据；目标与责任由人确定。'],
      ['execution', '自动执行', 'ai', '在制造质检案例中，按流程完成初筛记录和风险分流；异常与争议由人复核处理。']
    ],
    [
      ['manufacturing', '智能制造', 'industry', '视觉质检先识别可疑缺陷并记录、分流，人复核异常。价值取决于漏检、返工与流程集成。'],
      ['agriculture', '精准农业', 'industry', '作物识别、环境预测与灌溉辅助连接到农业生产和投入品使用。'],
      ['health', '医疗健康', 'industry', 'AI 从医学影像提供辅助识别线索，由医生结合病史复核与判断；工具扩散不代表疗效提升。'],
      ['science', '科学研究', 'industry', '结构预测、候选生成与实验辅助缩短探索路径，发现仍需科学验证。'],
      ['service', '现代服务', 'industry', '知识检索、客服辅助和内容生成连接到响应效率与知识扩散。']
    ],
    [
      ['efficiency', '效率提升', 'value', '更少重复劳动、更快的信息处理。实际收益取决于任务、组织与落地成本。'],
      ['innovation', '创新扩展', 'value', '探索更多候选方案与研究方向，扩展人的创造能力。'],
      ['access', '服务可及', 'value', '降低获取知识和专业服务的门槛，同时关注可靠性与数字鸿沟。'],
      ['resource', '资源优化', 'value', '通过预测与调度改善资源配置，同时计算模型与设备本身的资源消耗。']
    ]
  ];
  const nodes = rows.flatMap((row, tier) => row.map((item, i) => {
    const angle = (i / row.length) * Math.PI * 2 + (tier % 2 ? 0.38 : -0.2);
    return { id: item[0], label: item[1], type: item[2], description: item[3], tier,
      x: Math.cos(angle) * (tier === 2 ? 235 : 205), y: (tier - 1.5) * 126,
      z: Math.sin(angle) * 118 };
  }));
  nodes.push({ id: 'human', label: '人的判断', type: 'human', tier: 1, x: 0, y: -24, z: 12,
    description: '人设定目标、审核结果并承担责任。培训、数据治理和流程重组让技术能力转化为生产力。' });
  const byId = Object.fromEntries(nodes.map(node => [node.id, node]));
  const capabilityMap = { '感知': 'perception', '预测': 'prediction', '创造': 'creation', '决策': 'decision', '执行': 'execution' };
  const fallbackCases = [
    { id: 'manufacturing', links: ['感知', '决策', '执行'] },
    { id: 'agriculture', links: ['感知', '预测', '决策'] },
    { id: 'health', links: ['感知', '决策'] },
    { id: 'science', links: ['预测', '创造', '决策'] },
    { id: 'service', links: ['创造', '决策'] }
  ];
  const cases = fallbackCases;
  const valueMap = {
    manufacturing: ['efficiency', 'resource'], agriculture: ['efficiency', 'resource'],
    health: ['efficiency', 'access'], science: ['innovation', 'access'], service: ['efficiency', 'access']
  };
  const caseInputMap = { manufacturing: 'image', agriculture: 'sensor', health: 'image', science: 'sequence', service: 'text' };
  cases.forEach(item => {
    if (byId[item.id] && item.intro) byId[item.id].description = item.intro + (item.note ? ' ' + item.note : '');
  });
  const links = [
    ['text', 'creation'], ['text', 'decision'], ['image', 'perception'], ['sensor', 'prediction'], ['sequence', 'prediction'], ['sequence', 'creation'],
    ...cases.flatMap(item => (item.links || []).map(label => [capabilityMap[label], item.id])),
    ...Object.entries(valueMap).flatMap(([id, values]) => values.map(value => [id, value])),
    ['human', 'perception'], ['human', 'prediction'], ['human', 'creation'], ['human', 'decision'], ['human', 'execution']
  ].filter(([a, b]) => byId[a] && byId[b])
    .map(([a, b], i) => ({ a: byId[a], b: byId[b], phase: (i * 0.618) % 1 }));
  const scenes = {
    story: { yaw: -0.22, pitch: 0.09, zoom: 1, focus: null, text: '从数据，到智能，再到产业价值。拖动关系图，探索每一条转化路径。' },
    mechanism: { yaw: 0.25, pitch: 0.14, zoom: 1.04, focus: 'ai', text: '能力如何形成：数据输入、模型能力与人的判断，共同连接生产过程。' },
    evidence: { yaw: 0.45, pitch: -0.04, zoom: 0.96, focus: 'data', text: '证据解释真实变化。此关系图仅展示机制，不代表统计比例或因果强度。' },
    industries: { yaw: -0.45, pitch: 0.04, zoom: 1.08, focus: 'industry', text: '同一种智能能力，可以进入不同产业。点击行业节点，追踪应用路径。' },
    people: { yaw: 0.12, pitch: 0.12, zoom: 1.03, focus: 'human', text: '人始终在转化链条中：提出问题、审核结果、重组工作方式。' },
    lab: { yaw: -0.3, pitch: -0.08, zoom: 0.97, focus: 'industry', text: '技术能力需要组织投入才能转化为收益。进入实验室，比较你的配置。' },
    meaning: { yaw: 0.3, pitch: -0.13, zoom: 1.06, focus: 'value', text: '效率、创新、可及与资源配置：生产力的意义，最终落在人的生活。' }
  };
  let width = 0, height = 0, dpr = 1, frame = 0, previous = 0, time = 0;
  let sceneId = 'story', sceneProgress = 0, industry = 'manufacturing', selected = byId.manufacturing, hovered = null;
  let motion = !reducedMotion.matches, yaw = -0.22, pitch = 0.09, zoom = 1;
  let dragYaw = 0, dragPitch = 0, userZoom = 1, pointer = null, projections = [];
  let heroLayout = null;
  let mapMode = 'path', pathMix = 1, pathNodeIds = new Set(), pathIndustryIds = new Set();
  let pathTargets = new Map(), pathPositions = new Map(), stageVisible = true;
  let transitionFrames = 90;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', '人工智能生产力关系图。拖动旋转，Ctrl 加滚轮缩放。方向键旋转，Tab 在图外的节点列表浏览，空格暂停动画，Home 复位。');
  canvas.style.touchAction = 'pan-y';

  // A compact semantic node list is keyboard/screen-reader accessible without a second visual diagram.
  const nodeList = document.createElement('div');
  nodeList.className = 'spatial-node-access';
  nodeList.setAttribute('aria-label', '关系图节点');
  Object.assign(nodeList.style, { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clipPath: 'inset(50%)' });
  nodes.forEach(node => {
    const button = document.createElement('button');
    button.textContent = node.label;
    button.type = 'button';
    listen(button, 'click', () => selectNode(node));
    listen(button, 'focus', () => { hovered = node; invalidate(); });
    listen(button, 'blur', () => { hovered = null; invalidate(); });
    nodeList.append(button);
  });
  if (stage) stage.append(nodeList);

  function updateMotionButton() {
    if (!motionButton) return;
    motionButton.textContent = externalPaused ? '全站动画已暂停' : motion ? '暂停流动 Ⅱ' : '开启流动 ▶';
    motionButton.disabled = externalPaused;
    motionButton.setAttribute('aria-pressed', String(!motion || externalPaused));
    motionButton.setAttribute('aria-label', motion && !externalPaused ? '暂停关系图动态' : '开启关系图动态');
  }
  function describe(text) { if (caption) caption.textContent = text; }
  function setMapMode(mode) {
    if (!['network', 'path'].includes(mode)) return;
    mapMode = mode;
    if (mode === 'path' && !industry && !selected) {
      industry = 'manufacturing'; selected = byId.manufacturing;
      if (selection) selection.textContent = selected.label;
      describe(selected.description);
    }
    if (mode === 'network') {
      selected = null; industry = null;
      if (selection) selection.textContent = '生产力转化网络';
      describe(scenes[sceneId].text);
    }
    rebuildPath();
    root.querySelectorAll('[data-map-view]').forEach(button => { const on = button.dataset.mapView === mode; button.setAttribute('aria-pressed', String(on)); });
    invalidate();
  }
  function rebuildPath() {
    pathIndustryIds = new Set();
    if (industry) pathIndustryIds.add(industry);
    else if (selected?.type === 'industry') pathIndustryIds.add(selected.id);
    else if (selected?.type === 'value') links.forEach(link => {
      if (link.b.id === selected.id && link.a.type === 'industry') pathIndustryIds.add(link.a.id);
    });
    else if (selected) {
      const abilities = new Set(selected.type === 'ai' ? [selected.id] : []);
      links.forEach(link => { if (link.a.id === selected.id && link.b.type === 'ai') abilities.add(link.b.id); });
      links.forEach(link => { if (abilities.has(link.a.id) && link.b.type === 'industry') pathIndustryIds.add(link.b.id); });
    }
    if (!pathIndustryIds.size) pathIndustryIds.add('manufacturing');
    pathNodeIds = new Set(pathIndustryIds);
    links.forEach(link => {
      if (pathIndustryIds.has(link.b.id) && link.a.type === 'ai') pathNodeIds.add(link.a.id);
      if (pathIndustryIds.has(link.a.id) && link.b.type === 'value' &&
        (selected?.type !== 'value' || selected.id === link.b.id)) pathNodeIds.add(link.b.id);
    });
    // Keep each foreground route attached to the input actually described by
    // the case, rather than implying every possible data source is used there.
    pathIndustryIds.forEach(id => { if (caseInputMap[id]) pathNodeIds.add(caseInputMap[id]); });
    pathNodeIds.add('human');
  }
  function layoutPath() {
    pathTargets = new Map();
    if (!heroLayout) return;
    const { left, right, top, bottom } = heroLayout;
    const xStart = left + 62, xStep = (right - left - 124) / 3;
    rows.forEach((row, tier) => {
      const relevant = nodes.filter(node => node.tier === tier && node.type !== 'human' && pathNodeIds.has(node.id));
      relevant.forEach((node, index) => {
        const yMin = top + 27, yMax = bottom - 71;
        const y = relevant.length === 1 ? (yMin + yMax) / 2 : yMin + (yMax - yMin) * index / (relevant.length - 1);
        pathTargets.set(node.id, { x: xStart + tier * xStep, y });
      });
    });
    pathTargets.set('human', { x: xStart + xStep * 1.5, y: bottom - 27 });
    const centerX = (left + right) / 2, centerY = (top + bottom) / 2;
    nodes.forEach(node => {
      const p = project(node), target = pathTargets.get(node.id);
      const desired = {
        x: target ? target.x + Math.sin(yaw) * 9 : centerX + (p.x - centerX) * 0.83,
        y: target ? target.y + Math.sin(pitch) * 6 : centerY + (p.y - centerY) * 0.68,
        z: target ? -130 : 280, scale: target ? 0.93 : 0.5
      };
      const current = pathPositions.get(node.id) || desired;
      const ease = reducedMotion.matches ? 1 : 0.085;
      for (const key of ['x', 'y', 'z', 'scale']) current[key] += (desired[key] - current[key]) * ease;
      pathPositions.set(node.id, current);
    });
  }
  function projectNode(node) {
    const p = project(node);
    if (pathMix < 0.001 || !heroLayout) return p;
    const target = pathPositions.get(node.id);
    if (!target) return p;
    return { x: p.x + (target.x - p.x) * pathMix, y: p.y + (target.y - p.y) * pathMix,
      z: p.z + (target.z - p.z) * pathMix, scale: p.scale + (target.scale - p.scale) * pathMix };
  }
  function selectNode(node) {
    selected = node;
    if (node.type !== 'industry') industry = null;
    if (selection) selection.textContent = node.label;
    describe(node.description);
    if (node.type === 'industry') {
      industry = node.id;
      setMapMode('path');

    } else if (node.type === 'value') setMapMode('path');
    else rebuildPath();
    invalidate();
  }
  function invalidate() {
    transitionFrames = 90;
    if (!disposed && active && !frame && !document.hidden && stageVisible) frame = requestAnimationFrame(draw);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width || innerWidth;
    height = bounds.height || innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measureHeroLayout();
    invalidate();
  }
  function measureHeroLayout() {
    const windowElement = root.querySelector('.spatial-window');
    if (!windowElement) { heroLayout = null; return; }
    const bounds = windowElement.getBoundingClientRect();
    const canvasBounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) { heroLayout = null; return; }
    const left = bounds.left - canvasBounds.left;
    const right = bounds.right - canvasBounds.left;
    const top = bounds.top - canvasBounds.top + 65;
    const bottom = bounds.bottom - canvasBounds.top - 70;
    // Fit the default view's projected node extents, including label clearance.
    // These measurements happen on resize / chapter changes, never during drawing.
    const defaultYaw = scenes.story.yaw, defaultPitch = scenes.story.pitch;
    const points = nodes.map(point => {
      const x = point.x * Math.cos(defaultYaw) + point.z * Math.sin(defaultYaw);
      const z1 = -point.x * Math.sin(defaultYaw) + point.z * Math.cos(defaultYaw);
      const y = point.y * Math.cos(defaultPitch) - z1 * Math.sin(defaultPitch);
      const z = point.y * Math.sin(defaultPitch) + z1 * Math.cos(defaultPitch);
      const perspective = 830 / (830 + z);
      return { x: x * perspective, y: y * perspective };
    });
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const scale = Math.min(Math.max(100, right - left - 140) / (maxX - minX),
      Math.max(100, bottom - top - 38) / (maxY - minY));
    heroLayout = {
      scale,
      x: (left + right + 40) / 2 - (minX + maxX) * scale / 2,
      y: (top + bottom - 20) / 2 - (minY + maxY) * scale / 2,
      labelX: left + 8, left, right, top, bottom
    };
  }
  function project(point) {
    const cosY = Math.cos(yaw), sinY = Math.sin(yaw), cosP = Math.cos(pitch), sinP = Math.sin(pitch);
    const x = point.x * cosY + point.z * sinY;
    const z1 = -point.x * sinY + point.z * cosY;
    const y = point.y * cosP - z1 * sinP;
    const z = point.y * sinP + z1 * cosP;
    const perspective = 830 / (830 + z);
    const layout = sceneId === 'story' ? heroLayout : null;
    const scale = (layout ? layout.scale : Math.min(width / 1280, height / 760)) * zoom * perspective;
    return { x: (layout ? layout.x : width * 0.706) + x * scale,
      y: (layout ? layout.y : height * 0.51) + y * scale, z, scale };
  }
  function relatedNodes() {
    const active = new Set();
    if (selected && !industry) {
      active.add(selected.id);
      links.forEach(link => {
        if (link.a.id === selected.id) active.add(link.b.id);
        if (link.b.id === selected.id) active.add(link.a.id);
      });
    }
    if (industry) {
      active.add(industry);
      links.forEach(link => { if (link.b.id === industry) active.add(link.a.id); if (link.a.id === industry) active.add(link.b.id); });
      links.forEach(link => { if (active.has(link.b.id) && link.a.type === 'data') active.add(link.a.id); });
      active.add('human');
    }
    return active;
  }
  function edgeActive(link, related) {
    if (sceneId === 'story' && mapMode === 'path') return pathNodeIds.has(link.a.id) && pathNodeIds.has(link.b.id) &&
      (link.a.type !== 'industry' || pathIndustryIds.has(link.a.id)) && (link.b.type !== 'industry' || pathIndustryIds.has(link.b.id));
    if (selected && !industry) return link.a.id === selected.id || link.b.id === selected.id;
    if (industry) return related.has(link.a.id) && related.has(link.b.id) &&
      (link.a.type !== 'industry' || link.a.id === industry) && (link.b.type !== 'industry' || link.b.id === industry);
    const focus = scenes[sceneId].focus;
    return !focus || link.a.type === focus || link.b.type === focus;
  }
  function strokeWorld(points, color, lineWidth = 1) {
    ctx.beginPath();
    points.forEach((point, index) => {
      const p = project(point);
      if (index) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  function draw(timestamp) {
    frame = 0;
    if (disposed || !active || document.hidden || !stageVisible) return;
    const delta = previous ? Math.min(timestamp - previous, 40) : 16;
    previous = timestamp;
    if (motion && !externalPaused) time += delta / 1000;
    const scene = scenes[sceneId];
    const targetYaw = scene.yaw + dragYaw + (motion && !externalPaused ? Math.sin(time * 0.11) * 0.055 : 0) + sceneProgress * 0.07;
    const targetPitch = clamp(scene.pitch + dragPitch, -0.65, 0.65);
    const easing = reducedMotion.matches ? 1 : 0.075;
    yaw += (targetYaw - yaw) * easing;
    pitch += (targetPitch - pitch) * easing;
    zoom += (scene.zoom * userZoom - zoom) * easing;
    const targetMix = sceneId === 'story' && mapMode === 'path' ? 1 : 0;
    pathMix += (targetMix - pathMix) * easing;
    if (Math.abs(pathMix - targetMix) < 0.001) pathMix = targetMix;
    layoutPath();
    ctx.clearRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(width * 0.72, height * 0.5, 10, width * 0.72, height * 0.5, height * 0.62);
    glow.addColorStop(0, 'rgba(55,89,240,0.17)');
    glow.addColorStop(0.65, 'rgba(246,245,241,0.08)');
    glow.addColorStop(1, 'rgba(246,245,241,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = (sceneId === 'story' ? 1 : 0.68) * (1 - pathMix * 0.86);
    // An abstract plinth anchors the sculpture; these rings carry no data scale.
    for (const radius of [130, 220, 310]) {
      const ground = Array.from({ length: 65 }, (_, i) => {
        const angle = i * Math.PI / 32;
        return { x: Math.cos(angle) * radius, y: 267, z: Math.sin(angle) * radius * .72 };
      });
      strokeWorld(ground, `rgba(55,89,240,${radius === 310 ? .11 : .045})`, .65);
    }
    const tierTitles = ['01  数据输入', '02  智能能力', '03  产业应用', '04  价值方向'];
    rows.forEach((row, tier) => {
      const radius = tier === 2 ? 255 : 227;
      const points = Array.from({ length: 97 }, (_, index) => {
        const angle = index * Math.PI / 48;
        return { x: Math.cos(angle) * radius, y: (tier - 1.5) * 126, z: Math.sin(angle) * 140 };
      });
      // Alternating rear and foreground arcs reveal the layer's spatial tilt.
      const orbit = points.map(project);
      // Batch four depth bands rather than issuing a stroke for every segment.
      for (let band = 0; band < 4; band++) {
        ctx.beginPath();
        for (let index = 0; index < orbit.length - 1; index++) {
          const a = orbit[index], b = orbit[index + 1];
          const near = clamp((170 - (a.z + b.z) / 2) / 340, 0, .999);
          if (Math.floor(near * 4) !== band) continue;
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        }
        ctx.strokeStyle = `rgba(55,89,240,${.06 + (band / 3) * .19})`;
        ctx.lineWidth = .55 + (band / 3) * .35; ctx.stroke();
      }
      // One softly moving glint per orbit, driven by the existing paused clock.
      const glintAngle = time * .045 + tier * 1.46;
      const glint = project({ x: Math.cos(glintAngle) * radius,
        y: (tier - 1.5) * 126, z: Math.sin(glintAngle) * 140 });
      ctx.beginPath(); ctx.arc(glint.x, glint.y, Math.max(.7, glint.scale * 1.25), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(23,25,33,0.54)'; ctx.fill();
      const p = project({ x: -285, y: (tier - 1.5) * 126, z: 0 });
      ctx.font = '10px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = 'rgba(55,89,240,0.65)';
      ctx.textAlign = sceneId === 'story' && heroLayout ? 'left' : 'right';
      ctx.fillText(tierTitles[tier], sceneId === 'story' && heroLayout ? heroLayout.labelX : p.x - 12, p.y + 4);
    });
    if (pathMix > 0.02 && heroLayout) {
      ctx.globalAlpha = pathMix;
      const xStart = heroLayout.left + 62, xStep = (heroLayout.right - heroLayout.left - 124) / 3;
      tierTitles.forEach((title, index) => {
        ctx.font = '10px "Microsoft YaHei", sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#5371FF'; ctx.fillText(title, xStart + index * xStep, heroLayout.top - 6);
        ctx.beginPath(); ctx.moveTo(xStart + index * xStep, heroLayout.top + 6);
        ctx.lineTo(xStart + index * xStep, heroLayout.bottom - 49);
        ctx.strokeStyle = 'rgba(55,89,240,0.08)'; ctx.lineWidth = 1; ctx.stroke();
      });
    }
    ctx.globalAlpha = sceneId === 'story' ? 1 : 0.68;
    const related = relatedNodes();
    links.forEach(link => {
      const a = projectNode(link.a), b = projectNode(link.b), active = edgeActive(link, related);
      const color = link.a.type === 'human' ? '144,98,232' : '55,89,240';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(${color},${active ? 0.25 + pathMix * 0.17 : 0.045 * (1 - pathMix * 0.85)})`;
      ctx.lineWidth = active ? .75 + pathMix * 0.4 : 0.5;
      ctx.shadowColor = `rgba(${color},0.3)`; ctx.shadowBlur = active ? pathMix * 3 : 0;
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (active) {
        const progress = (time * 0.10 + link.phase) % 1;
        const original = project({ x: link.a.x + (link.b.x - link.a.x) * progress,
          y: link.a.y + (link.b.y - link.a.y) * progress, z: link.a.z + (link.b.z - link.a.z) * progress });
        const p = { x: original.x + (a.x + (b.x - a.x) * progress - original.x) * pathMix,
          y: original.y + (a.y + (b.y - a.y) * progress - original.y) * pathMix,
          scale: original.scale + (0.95 - original.scale) * pathMix };
        if (pathMix > 0.05) {
          const tail = Math.max(0, progress - 0.07);
          ctx.beginPath(); ctx.moveTo(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail); ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(${color},${pathMix * 0.5})`; ctx.lineWidth = 1.2; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.65 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},0.9)`;
        ctx.shadowColor = `rgb(${color})`; ctx.shadowBlur = 4; ctx.fill(); ctx.shadowBlur = 0;
        // Arrowheads convey direction even when all animation is paused.
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const ax = a.x + (b.x - a.x) * 0.74, ay = a.y + (b.y - a.y) * 0.74;
        ctx.beginPath(); ctx.moveTo(ax - Math.cos(angle - 0.45) * 5, ay - Math.sin(angle - 0.45) * 5);
        ctx.lineTo(ax, ay); ctx.lineTo(ax - Math.cos(angle + 0.45) * 5, ay - Math.sin(angle + 0.45) * 5);
        ctx.strokeStyle = `rgba(${color},0.45)`; ctx.stroke();
      }
    });
    projections = nodes.map(node => ({ node, ...projectNode(node) })).sort((a, b) => b.z - a.z);
    projections.forEach(p => {
      const node = p.node, isSelected = selected?.id === node.id, isHovered = hovered?.id === node.id;
      const active = isSelected || isHovered || (mapMode === 'path' && sceneId === 'story' ? pathNodeIds.has(node.id) :
        industry || selected ? related.has(node.id) : !scene.focus || scene.focus === node.type);
      const radius = (node.type === 'human' ? 8 : node.type === 'ai' ? 7 : 5.5) * p.scale;
      const color = colors[node.type];
      ctx.globalAlpha = (sceneId === 'story' ? 1 : 0.7) * (active ? 1 : 0.32 - pathMix * 0.26);
      if (active) {
        const halo = ctx.createRadialGradient(p.x, p.y, radius * .8, p.x, p.y, radius * 3.8);
        halo.addColorStop(0, `${color}25`); halo.addColorStop(1, `${color}00`);
        ctx.beginPath(); ctx.arc(p.x, p.y, radius * 3.8, 0, Math.PI * 2); ctx.fillStyle = halo; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, radius + (isSelected || isHovered ? 7 : 4), 0, Math.PI * 2);
      ctx.strokeStyle = active ? `${color}78` : `${color}35`; ctx.lineWidth = 0.8; ctx.stroke();
      const pearl = ctx.createRadialGradient(p.x - radius * .32, p.y - radius * .38, 0, p.x, p.y, radius);
      pearl.addColorStop(0, '#F6F5F1'); pearl.addColorStop(.35, color);
      pearl.addColorStop(1, node.type === 'human' || node.type === 'value' ? '#241E43' : '#16288C');
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fillStyle = pearl; ctx.fill();
      ctx.strokeStyle = `${color}B0`; ctx.lineWidth = .6; ctx.stroke();
      if (isSelected || isHovered) {
        ctx.beginPath(); ctx.arc(p.x, p.y, radius + 9, -.55, 1.3);
        ctx.strokeStyle = '#F6F5F1'; ctx.lineWidth = 1.2; ctx.stroke();
      }
      const fontSize = clamp(12 * p.scale, 11, 15);
      ctx.font = `${isSelected || isHovered ? 600 : 400} ${fontSize}px "Microsoft YaHei", sans-serif`;
      const labelY = p.y + radius + 19, labelWidth = ctx.measureText(node.label).width + 12;
      p.hitRadius = radius + 13; p.radius = radius; p.labelY = labelY; p.labelWidth = labelWidth;
      p.labelFont = ctx.font; p.labelColor = isSelected || isHovered ? '#171921' : color;
      p.labelAlpha = ctx.globalAlpha; p.priority = isSelected ? 3 : isHovered ? 2 : node.type === 'human' ? 1 : active ? 0.5 : 0;
    });
    // Labels live in screen space, while nodes retain their 3D coordinates.
    // Greedy placement keeps text legible as rings rotate through one another.
    const placed = [];
    const labelBounds = sceneId === 'story' && heroLayout ? heroLayout : { left: 0, right: width, top: 70, bottom: height - 20 };
    const overlaps = (a, b) => a.left < b.right + 5 && a.right > b.left - 5 && a.top < b.bottom + 4 && a.bottom > b.top - 4;
    const labelOrder = [...projections].sort((a, b) => b.priority - a.priority || b.labelAlpha - a.labelAlpha || nodes.indexOf(a.node) - nodes.indexOf(b.node));
    labelOrder.forEach(p => {
      if (p.labelAlpha < 0.1) { p.labelX = -1000; p.labelY = -1000; return; }
      const candidates = [[0, p.radius + 19], [0, -p.radius - 20],
        [p.labelWidth / 2 + 15, 0], [-p.labelWidth / 2 - 15, 0]];
      for (let step = 1; step <= 7; step++) {
        candidates.push([0, p.radius + 19 + step * 26], [0, -p.radius - 20 - step * 26],
          [p.labelWidth / 2 + 17, step * 24], [-p.labelWidth / 2 - 17, -step * 24]);
      }
      let best = null;
      candidates.forEach(([dx, dy], index) => {
        const x = clamp(p.x + dx, labelBounds.left + p.labelWidth / 2 + 5, labelBounds.right - p.labelWidth / 2 - 5);
        const y = clamp(p.y + dy, labelBounds.top + 11, labelBounds.bottom - 11);
        const box = { left: x - p.labelWidth / 2, right: x + p.labelWidth / 2, top: y - 10, bottom: y + 10 };
        let conflicts = placed.filter(other => overlaps(box, other)).length;
        projections.forEach(other => {
          const nodeBox = { left: other.x - other.radius - 3, right: other.x + other.radius + 3,
            top: other.y - other.radius - 3, bottom: other.y + other.radius + 3 };
          if (other.labelAlpha > 0.1 && overlaps(box, nodeBox)) conflicts += 0.8;
        });
        const score = conflicts * 10000 + Math.hypot(dx, dy) + index * 0.1;
        if (!best || score < best.score) best = { x, y, box, score };
      });
      placed.push(best.box);
      p.labelX = best.x; p.labelY = best.y;
      ctx.globalAlpha = p.labelAlpha;
      if (Math.abs(best.x - p.x) > 2 || Math.abs(best.y - (p.y + p.radius + 19)) > 2) {
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(clamp(p.x, best.box.left, best.box.right), clamp(p.y, best.box.top, best.box.bottom));
        ctx.strokeStyle = colors[p.node.type] + '68'; ctx.lineWidth = 0.7; ctx.stroke();
      }
      ctx.fillStyle = 'rgba(246,245,241,0.91)'; ctx.fillRect(best.box.left, best.box.top, p.labelWidth, 20);
      ctx.font = p.labelFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = p.labelColor; ctx.fillText(p.node.label, best.x, best.y);
    });
    ctx.globalAlpha = 1;
    transitionFrames--;
    if ((motion && !externalPaused) || pointer || transitionFrames > 0) frame = requestAnimationFrame(draw);
  }
  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function hitTest(point) {
    for (let i = projections.length - 1; i >= 0; i--) {
      const p = projections[i];
      if (Math.hypot(point.x - p.x, point.y - p.y) <= p.hitRadius ||
        (Math.abs(point.x - p.labelX) < p.labelWidth / 2 && Math.abs(point.y - p.labelY) < 12)) return p.node;
    }
    return null;
  }
  listen(canvas, 'pointerdown', event => {
    if (event.button !== 0) return;
    pointer = { ...pointFromEvent(event), startX: event.clientX, startY: event.clientY, moved: false, id: event.pointerId };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    invalidate();
  });
  listen(canvas, 'pointermove', event => {
    const p = pointFromEvent(event);
    if (pointer) {
      dragYaw += (p.x - pointer.x) * 0.006;
      dragPitch = clamp(dragPitch + (p.y - pointer.y) * 0.004, -0.52, 0.52);
      pointer.moved ||= Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 5;
      pointer.x = p.x; pointer.y = p.y;
      invalidate();
    } else {
      const next = hitTest(p);
      if (next !== hovered) { hovered = next; canvas.style.cursor = next ? 'pointer' : 'grab'; invalidate(); }
    }
  });
  listen(canvas, 'pointerup', event => {
    if (!pointer) return;
    if (!pointer.moved) { const node = hitTest(pointFromEvent(event)); if (node) selectNode(node); }
    pointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = 'grab';
  });
  listen(canvas, 'pointercancel', () => { pointer = null; canvas.style.cursor = 'grab'; });
  listen(canvas, 'lostpointercapture', () => { pointer = null; });
  listen(canvas, 'pointerleave', () => { hovered = null; invalidate(); });
  listen(canvas, 'wheel', event => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    userZoom = clamp(userZoom * Math.exp(-event.deltaY * 0.002), 0.72, 1.38);
    invalidate();
  }, { passive: false });
  function reset() {
    dragYaw = 0; dragPitch = 0; userZoom = 1; selected = byId.manufacturing; industry = 'manufacturing';
    setMapMode('path');
    if (selection) selection.textContent = selected.label;
    describe(selected.description);
    invalidate();
  }
  function toggleMotion() { motion = !motion; updateMotionButton(); invalidate(); }
  listen(resetButton, 'click', reset);
  listen(motionButton, 'click', toggleMotion);
  listen(canvas, 'keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home', ' '].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'ArrowLeft') dragYaw -= 0.12;
    if (event.key === 'ArrowRight') dragYaw += 0.12;
    if (event.key === 'ArrowUp') dragPitch = clamp(dragPitch - 0.08, -0.52, 0.52);
    if (event.key === 'ArrowDown') dragPitch = clamp(dragPitch + 0.08, -0.52, 0.52);
    if (event.key === '+' || event.key === '=') userZoom = clamp(userZoom + 0.08, 0.72, 1.38);
    if (event.key === '-') userZoom = clamp(userZoom - 0.08, 0.72, 1.38);
    if (event.key === 'Home') reset();
    if (event.key === ' ') toggleMotion();
    invalidate();
  });
  listen(document, 'visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    else invalidate();
  });
  listen(reducedMotion, 'change', event => { motion = !event.matches; updateMotionButton(); invalidate(); });
  listen(window, 'resize', resize);
  root.querySelectorAll('[data-map-view]').forEach(button => listen(button, 'click', () => setMapMode(button.dataset.mapView)));
  listen(root.querySelector('[data-trace-journey]'), 'click', () => { selected = byId.manufacturing; industry = 'manufacturing'; setMapMode('path'); describe(selected.description); if (selection) selection.textContent = selected.label; });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(entries => { stageVisible = entries[0]?.isIntersecting ?? true; if (!stageVisible) { cancelAnimationFrame(frame); frame = 0; previous = 0; } else invalidate(); });
  visibilityObserver.observe(stage);
  updateMotionButton(); rebuildPath(); describe(selected.description); if (selection) selection.textContent = selected.label; resize();
  return {
    setActive(value) { active = Boolean(value); if (!active) { cancelAnimationFrame(frame); frame = 0; previous = 0; if (pointer && canvas.hasPointerCapture(pointer.id)) canvas.releasePointerCapture(pointer.id); pointer = null; } else { resize(); invalidate(); } },
    setPaused(value) { externalPaused = Boolean(value); updateMotionButton(); invalidate(); },
    dispose() { disposed = true; active = false; cancelAnimationFrame(frame); frame = 0; if (pointer && canvas.hasPointerCapture(pointer.id)) canvas.releasePointerCapture(pointer.id); pointer = null; resizeObserver.disconnect(); visibilityObserver.disconnect(); cleanups.forEach(remove => remove()); nodeList.remove(); }
  };
}
