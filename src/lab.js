import { simulate } from './simulation.js';
import './lab.css';

const PRESETS = {
  manual: { automation: 15, review: 85 },
  balance: { automation: 60, review: 55 },
  auto: { automation: 95, review: 15 },
};
const fmt = value => value.toFixed(1);

export function mountLab(element, { onEvidence = () => {} } = {}) {
  element.innerHTML = `
    <section class="lab" aria-label="人机协作教学实验台">
      <aside class="lab-controls" data-scrollable>
        <div class="lab-kicker"><span class="lab-signal"></span> COLLABORATION LAB</div>
        <h2>调节分工，<br>观察代价。</h2>
        <p class="lab-intro">同一批 100 件精密金属零件，<br>由你决定机器与人的边界。</p>
        <div class="lab-presets" aria-label="分工方案">
          <button type="button" data-preset="manual">人工主导</button>
          <button type="button" data-preset="balance" class="is-selected" aria-pressed="true">协作平衡</button>
          <button type="button" data-preset="auto">自动优先</button>
        </div>
        <div class="lab-control">
          <label for="lab-automation">AI 自动处理范围 <output id="lab-automation-value">60<span>%</span></output></label>
          <input id="lab-automation" type="range" min="0" max="100" step="1" value="60" aria-describedby="lab-automation-help">
          <div class="lab-scale"><span>人工判断</span><span>交给 AI</span></div>
          <p id="lab-automation-help">范围越大，AI 会遇到更多低置信度任务。</p>
        </div>
        <div class="lab-control">
          <label for="lab-review">人工复核强度 <output id="lab-review-value">55<span>%</span></output></label>
          <input id="lab-review" type="range" min="0" max="100" step="1" value="55" aria-describedby="lab-review-help">
          <div class="lab-scale"><span>直接输出</span><span>充分复核</span></div>
          <p id="lab-review-help">仅复核 AI 判定；更多复核意味着更多时间。</p>
        </div>
        <div class="lab-control-actions"><button type="button" class="lab-reset">↺ 重置参数</button><button type="button" class="lab-save">保存对照 <span>＋</span></button></div>
        <button type="button" class="lab-evidence">查看模拟口径 ↗</button>
        <details class="lab-rules">
          <summary>模型规则 <span>＋</span></summary>
          <div class="lab-rule-content">
            <p>这里只模拟“判定是否正确”，不模拟零件实际缺陷率，也不代表真实合格品数量。指标为期望值，因此可以有小数。</p>
            <p>100 件任务：人工单件 2 分钟，错误率 2%；AI 单件 0.25 分钟。设自动范围 a∈[0,1]，AI 错误率 = 1% + 11% × a²。</p>
            <p>人工复核覆盖所选比例的 AI 任务，每件 2 分钟，检出其中 95% 的错误；检出后更正，每件另计 3 分钟。假设复核不会引入新错误。</p>
            <p>正确判定量 = 100 − 人工错误 − AI 留存错误。总耗时为人工作业、AI 检测、复核与更正的串行相加，不等于并行产线的实际用时。</p>
            <p>人工基线：100 件全部人工判定，200 分钟，98 件正确。</p>
          </div>
        </details>
      </aside>
      <div class="lab-bench" data-scrollable>
        <header class="lab-bench-header"><div><span class="lab-micro">LIVE SIMULATION</span><div class="lab-view-tabs" role="tablist" aria-label="实验视图"><button type="button" id="lab-live-tab" role="tab" aria-selected="true" aria-controls="lab-live-panel" tabindex="0" data-lab-view="live">协作实验</button><button type="button" id="lab-analysis-tab" role="tab" aria-selected="false" aria-controls="lab-analysis-panel" tabindex="-1" data-lab-view="analysis">结果分析 <span>↗</span></button></div></div><span class="lab-model-label">交互教学模拟 · 非真实企业预测</span></header>
        <div class="lab-live-panel" id="lab-live-panel" role="tabpanel" aria-labelledby="lab-live-tab">
        <div class="lab-flow-wrap">
          <svg class="lab-flow" viewBox="0 0 850 205" role="img" aria-label="任务经过 AI 检测与人工复核，或人工直接判定，最终汇入判定输出">
            <defs><linearGradient id="lab-flow-gradient"><stop stop-color="#4c50fa" stop-opacity=".15"/><stop offset="1" stop-color="#4c50fa" stop-opacity=".9"/></linearGradient></defs>
            <path class="lab-path" d="M113 88H240 M345 88H460 M565 88H710 M112 103V170H710V103"/>
            <path class="lab-flow-motion" d="M113 88H240 M345 88H460 M565 88H710"/>
            <path class="lab-bypass" d="M345 75V25H710V75"/>
            <text class="lab-flow-note" x="510" y="17" text-anchor="middle">AI 直接输出</text>
            <text class="lab-flow-note" x="402" y="194" text-anchor="middle">人工直接判定 <tspan data-flow="manual">40</tspan> 件</text>
            <g class="lab-node"><rect x="8" y="55" width="105" height="67" rx="2"/><text x="60" y="82" text-anchor="middle">初始任务</text><text x="60" y="106" text-anchor="middle" class="lab-node-num">100 <tspan>件</tspan></text></g>
            <g class="lab-node lab-node-ai"><rect x="240" y="55" width="105" height="67" rx="2"/><text x="292" y="82" text-anchor="middle">AI 检测</text><text x="292" y="106" text-anchor="middle" class="lab-node-num"><tspan data-flow="ai">60</tspan> <tspan>件</tspan></text></g>
            <g class="lab-node lab-node-review"><rect x="460" y="55" width="105" height="67" rx="2"/><text x="512" y="82" text-anchor="middle">人工复核</text><text x="512" y="106" text-anchor="middle" class="lab-node-num"><tspan data-flow="review">33</tspan> <tspan>件</tspan></text></g>
            <g class="lab-node"><rect x="710" y="55" width="130" height="67" rx="2"/><text x="775" y="82" text-anchor="middle">判定输出</text><text x="775" y="106" text-anchor="middle" class="lab-node-num">100 <tspan>件</tspan></text></g>
            <text class="lab-flow-note" x="292" y="145" text-anchor="middle">错误率 <tspan data-flow="rate">4.96</tspan>%</text>
            <text class="lab-flow-note" x="512" y="145" text-anchor="middle">更正 <tspan data-flow="caught">1.6</tspan> 件</text>
          </svg>
        </div>
        <div class="lab-output">
          <div class="lab-output-caption"><span>100 次判定 · 结果分布</span><span>每点 ≈ 1 件，显示值四舍五入</span></div>
          <svg class="lab-dots" viewBox="0 0 850 48" role="img" aria-label="100 次判定结果分布"></svg>
          <div class="lab-legend"><span><i class="lab-key-ai"></i>AI 正确</span><span><i class="lab-key-caught"></i>复核更正</span><span><i class="lab-key-manual"></i>人工正确</span><span><i class="lab-key-error"></i>留存错误</span><strong>AI 留存错误 <b data-stat="retained">0</b> 件</strong></div>
        </div>
        <div class="lab-metrics" aria-live="polite" aria-atomic="true">
          <div class="lab-metric"><span>正确判定量 <small>期望值</small></span><div><b data-stat="correct">0</b><em>/ 100 件</em></div><p data-comparison="correct"></p></div>
          <div class="lab-metric"><span>人机串行总耗时</span><div><b data-stat="time">0</b><em>分钟</em></div><p data-comparison="time"></p></div>
          <div class="lab-metric"><span>人工复核量 <small>期望值</small></span><div><b data-stat="review">0</b><em>件</em></div><p>检出并更正 <strong data-stat="caught">0</strong> 件 AI 错误</p></div>
        </div>
        <footer class="lab-insight"><span class="lab-insight-mark">↗</span><p data-insight></p><span class="lab-snapshot" role="status">基线 · 全人工判定</span></footer>
        </div>
        <div class="lab-analysis" id="lab-analysis-panel" role="tabpanel" aria-labelledby="lab-analysis-tab" data-scrollable tabindex="0" hidden>
          <div class="lab-analysis-heading"><div><span class="lab-micro">READ THE TRADE-OFF</span><h3>更快，是否也更好？</h3><p>沿曲线读懂分工的代价，再用当前方案验证。</p></div><button type="button" class="lab-save lab-analysis-save">保存当前方案作对照 ＋</button></div>
          <div class="lab-tradeoff-card">
            <div class="lab-chart-caption"><span>效率 × 判定正确性</span><span>左上方：耗时更少、正确判定更多</span></div>
            <svg class="lab-tradeoff-chart" viewBox="0 0 680 242" role="img" aria-label="三条复核强度曲线展示自动范围变化的时间与正确判定量权衡"></svg>
            <div class="lab-chart-legend"><span class="lab-curve-key lab-curve-zero">复核 0%</span><span class="lab-curve-key lab-curve-half">复核 50%</span><span class="lab-curve-key lab-curve-full">复核 100%</span><span class="lab-current-key">当前方案</span><span class="lab-saved-key">对照方案</span></div>
            <p class="lab-chart-note">每条线将 AI 自动范围从 0% 递增至 100%，复核强度固定；曲线仅来自本页公式，不代表真实生产数据。</p>
          </div>
          <div class="lab-analysis-comparison"><div class="lab-analysis-section-title"><h4>同一批任务，两种选择</h4><span data-analysis-reference>未保存时，以全人工方案作对照</span></div><table><caption class="lab-sr-only">当前方案与保存方案或全人工基线的指标对比</caption><thead><tr><th scope="col">方案</th><th scope="col">AI / 复核</th><th scope="col">正确判定</th><th scope="col">串行总耗时</th><th scope="col">AI 留存错误</th></tr></thead><tbody data-analysis-table></tbody></table><p class="lab-analysis-delta" data-analysis-delta aria-live="polite"></p></div>
          <div class="lab-analysis-section-title"><h4>变化从哪里来</h4><span>期望值 · 决策正确性，不是实际良品率</span></div>
          <div class="lab-mechanisms">
            <article><span>01 / 自动范围</span><h4>更多任务，更低置信度</h4><p data-mechanism="scope"></p><code>AI 错误率 = 1% + 11% × a²</code></article>
            <article><span>02 / 人工复核</span><h4>追回错误，也付出时间</h4><p data-mechanism="review"></p><code>检出 = AI 错误 × 复核比例 × 95%</code></article>
            <article><span>03 / 串行耗时</span><h4>四段工作，一起计时</h4><p data-mechanism="time"></p><code>人工 + AI + 复核 + 更正</code></article>
          </div>
          <div class="lab-analysis-prompt"><p>没有脱离任务目标的“最佳方案”。试着固定自动范围，只改变复核强度，再比较正确判定和耗时的变化。</p><button type="button" data-lab-view="live">返回实验，验证一次 ↗</button></div>
        </div>
      </div>
    </section>`;

  const root = element.querySelector('.lab');
  const automation = root.querySelector('#lab-automation');
  const review = root.querySelector('#lab-review');
  let snapshot = null;
  let current;
  const dots = root.querySelector('.lab-dots');
  dots.innerHTML = Array.from({ length: 100 }, (_, i) => `<circle cx="${12 + (i % 50) * 16.85}" cy="${12 + Math.floor(i / 50) * 24}" r="3.5"/>`).join('');

  function renderAnalysis() {
    const comparison = snapshot || { ...simulate({ automation: 0, review: 0 }), name: '全人工基线' };
    const x = minutes => 54 + minutes / 270 * 570;
    const y = correct => 190 - (correct - 88) / 12 * 160;
    const gridX = [0, 50, 100, 150, 200, 250].map(t => `<line x1="${x(t)}" y1="30" x2="${x(t)}" y2="190"/><text x="${x(t)}" y="208" text-anchor="middle">${t}</text>`).join('');
    const gridY = [88, 92, 96, 100].map(c => `<line x1="54" y1="${y(c)}" x2="624" y2="${y(c)}"/><text x="43" y="${y(c) + 3}" text-anchor="end">${c}</text>`).join('');
    const curves = [0, 50, 100].map(r => {
      const points = Array.from({ length: 21 }, (_, i) => simulate({ automation: i * 5, review: r })).map(result => `${x(result.processingMinutes)},${y(result.correctCount)}`).join(' ');
      return `<polyline class="lab-curve lab-curve-${r}" points="${points}"/>`;
    }).join('');
    const cx = x(current.processingMinutes), cy = y(current.correctCount);
    const sx = x(comparison.processingMinutes), sy = y(comparison.correctCount);
    const chart = root.querySelector('.lab-tradeoff-chart');
    chart.innerHTML = `<g class="lab-chart-grid">${gridX}${gridY}</g><text class="lab-chart-axis-title" x="54" y="16">正确判定量 / 件（期望值）</text><text class="lab-chart-axis-title" x="624" y="232" text-anchor="end">人机串行总耗时 / 分钟 →</text>${curves}<path class="lab-chart-saved" d="M${sx} ${sy - 5}l5 5 -5 5 -5 -5z"><title>${snapshot ? '保存方案' : '全人工基线'}：${fmt(comparison.processingMinutes)} 分钟，${fmt(comparison.correctCount)} 件正确</title></path><circle class="lab-chart-current-ring" cx="${cx}" cy="${cy}" r="8"/><circle class="lab-chart-current" cx="${cx}" cy="${cy}" r="4"><title>当前方案：${fmt(current.processingMinutes)} 分钟，${fmt(current.correctCount)} 件正确</title></circle>`;
    chart.setAttribute('aria-label', `教学模型效率与正确性权衡图。当前方案 ${fmt(current.processingMinutes)} 分钟、${fmt(current.correctCount)} 件正确；对照 ${fmt(comparison.processingMinutes)} 分钟、${fmt(comparison.correctCount)} 件正确。曲线分别为复核强度 0%、50%、100%，自动范围沿曲线从 0% 到 100%。`);
    const row = (name, result, active) => `<tr${active ? ' class="lab-row-current"' : ''}><th scope="row">${name}</th><td>${fmt(result.automation)}% / ${fmt(result.review)}%</td><td>${fmt(result.correctCount)} <small>件</small></td><td>${fmt(result.processingMinutes)} <small>分钟</small></td><td>${fmt(result.retainedAiErrors)} <small>件</small></td></tr>`;
    root.querySelector('[data-analysis-table]').innerHTML = row('当前方案', current, true) + row(snapshot ? '已保存方案' : '全人工基线', comparison, false);
    root.querySelector('[data-analysis-reference]').textContent = snapshot ? '已保存方案保留，移动滑块继续比较' : '未保存时，以全人工方案作对照';
    const quality = current.correctCount - comparison.correctCount;
    const time = current.processingMinutes - comparison.processingMinutes;
    root.querySelector('[data-analysis-delta]').textContent = `当前方案较对照：正确判定${quality >= 0 ? '增加' : '减少'} ${fmt(Math.abs(quality))} 件，串行耗时${time >= 0 ? '增加' : '减少'} ${fmt(Math.abs(time))} 分钟。${Math.abs(quality) < 0.05 && Math.abs(time) < 0.05 ? '调整左侧参数，观察两者怎样分离。' : '两个指标需要一起读。'}`;
    root.querySelector('[data-mechanism="scope"]').textContent = `当前 AI 处理 ${fmt(current.aiCount)} 件，错误率为 ${fmt(current.aiErrorRate * 100)}%，复核前预计 ${fmt(current.aiErrorsBeforeReview)} 件判定错误。范围越大，错误率按平方上升。`;
    root.querySelector('[data-mechanism="review"]').textContent = `复核 ${fmt(current.reviewCount)} 件 AI 任务，预计追回 ${fmt(current.caughtErrors)} 件错误；仍有 ${fmt(current.retainedAiErrors)} 件 AI 错误留存。更正每件另计 3 分钟。`;
    root.querySelector('[data-mechanism="time"]').textContent = `人工直接判定 ${fmt(current.manualCount * 2)} 分钟 + AI 检测 ${fmt(current.aiCount * .25)} 分钟 + 复核 ${fmt(current.reviewCount * 2)} 分钟 + 更正 ${fmt(current.caughtErrors * 3)} 分钟。这里没有模拟并行排程。`;
  }

  function setView(view) {
    const analysis = view === 'analysis';
    root.querySelector('.lab-bench').classList.toggle('lab-analysis-active', analysis);
    root.querySelector('.lab-live-panel').hidden = analysis;
    root.querySelector('.lab-analysis').hidden = !analysis;
    root.querySelectorAll('[role="tab"]').forEach(tab => {
      const selected = tab.dataset.labView === view;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  function update() {
    current = simulate({ automation: automation.value, review: review.value });
    const baseline = snapshot || current.baseline;
    [automation, review].forEach(input => {
      input.style.setProperty('--range-progress', `${input.value}%`);
      root.querySelector(`#${input.id}-value`).innerHTML = `${input.value}<span>%</span>`;
    });
    root.querySelectorAll('[data-preset]').forEach(button => {
      const preset = PRESETS[button.dataset.preset];
      const selected = +automation.value === preset.automation && +review.value === preset.review;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const stats = { correct: current.correctCount, time: current.processingMinutes, review: current.reviewCount, caught: current.caughtErrors, retained: current.retainedAiErrors };
    for (const [key, value] of Object.entries(stats)) root.querySelectorAll(`[data-stat="${key}"]`).forEach(node => { node.textContent = fmt(value); });
    const flow = { manual: fmt(current.manualCount), ai: fmt(current.aiCount), review: fmt(current.reviewCount), rate: (current.aiErrorRate * 100).toFixed(2), caught: fmt(current.caughtErrors) };
    for (const [key, value] of Object.entries(flow)) root.querySelector(`[data-flow="${key}"]`).textContent = value;
    const correctDelta = current.correctCount - baseline.correctCount;
    const timeDelta = current.processingMinutes - baseline.processingMinutes;
    const reference = snapshot ? '已存方案' : '全人工基线';
    root.querySelector('[data-comparison="correct"]').textContent = `较${reference} ${correctDelta >= 0 ? '+' : '−'}${fmt(Math.abs(correctDelta))} 件`;
    root.querySelector('[data-comparison="time"]').textContent = `较${reference} ${timeDelta > 0 ? '增加' : '节省'} ${fmt(Math.abs(timeDelta))} 分钟`;
    root.querySelector('[data-insight]').textContent = current.aiCount === 0
      ? '全部任务由人工判定。复核比例只作用于 AI 任务，此时不会增加复核量。'
      : current.review > 75 ? '复核能追回更多判定错误，也会增加作业时间。准确与效率，需要共同衡量。'
      : current.automation > 80 ? '自动范围扩大，低置信度任务也进入 AI 流程。省下的时间，伴随着更高的错误风险。'
      : '把重复检测交给 AI，把判断余地留给人。尝试移动滑块，寻找适合任务的分工。';
    const errors = Math.round(current.retainedAiErrors + current.manualErrors);
    const caught = Math.min(100 - errors, Math.round(current.caughtErrors));
    const manual = Math.min(100 - errors - caught, Math.round(current.manualCount - current.manualErrors));
    const ai = 100 - errors - caught - manual;
    Array.from(dots.children).forEach((dot, i) => {
      dot.setAttribute('class', i < ai ? 'lab-dot-ai' : i < ai + caught ? 'lab-dot-caught' : i < ai + caught + manual ? 'lab-dot-manual' : 'lab-dot-error');
    });
    dots.setAttribute('aria-label', `100 次判定：约 ${ai} 件 AI 正确，${caught} 件复核更正，${manual} 件人工正确，${errors} 件留存错误。精确期望值见下方指标。`);
    renderAnalysis();
  }
  const handleInput = () => update();
  automation.addEventListener('input', handleInput);
  review.addEventListener('input', handleInput);
  const handleClick = event => {
    const viewButton = event.target.closest('[data-lab-view]');
    if (viewButton) { setView(viewButton.dataset.labView); return; }
    const presetButton = event.target.closest('[data-preset]');
    if (presetButton) {
      const preset = PRESETS[presetButton.dataset.preset];
      automation.value = preset.automation; review.value = preset.review; update();
    } else if (event.target.closest('.lab-reset')) {
      automation.value = 60; review.value = 55; snapshot = null;
      root.querySelector('.lab-snapshot').textContent = '基线 · 全人工判定'; update();
    } else if (event.target.closest('.lab-save')) {
      snapshot = { ...current };
      root.querySelector('.lab-snapshot').textContent = `已存对照 · AI ${fmt(current.automation)}% / 复核 ${fmt(current.review)}%`;
      update();
    } else if (event.target.closest('.lab-evidence')) {
      onEvidence({ type: 'lab', ...current });
    }
  };
  root.addEventListener('click', handleClick);
  const handleTabKeys = event => {
    if (!event.target.matches('[role="tab"]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const view = event.key === 'Home' ? 'live' : event.key === 'End' ? 'analysis' : event.target.dataset.labView === 'live' ? 'analysis' : 'live';
    setView(view);
    root.querySelector(`[role="tab"][data-lab-view="${view}"]`).focus();
  };
  root.addEventListener('keydown', handleTabKeys);
  update();
  return {
    setActive(active) { root.classList.toggle('lab-is-paused', !active); },
    dispose() { automation.removeEventListener('input', handleInput); review.removeEventListener('input', handleInput); root.removeEventListener('click', handleClick); root.removeEventListener('keydown', handleTabKeys); element.replaceChildren(); },
  };
}
