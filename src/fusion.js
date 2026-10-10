import './fusion.css';
import { mountRelationship } from './relationship.js';
import { mountDecisionLab } from './decision-lab.js';

const sources = {
  cost: {
    tag: '调用价格 · Stanford AI Index 2025',
    title: '同等基准能力的模型调用价格，下降 280 倍以上。',
    text: '达到 GPT-3.5 水平的 MMLU 成绩时，每百万 token 的模型调用价格从 2022 年 11 月的 20 美元，降至 2024 年 10 月的 0.07 美元。更低的调用门槛，为更多任务引入智能工具创造了条件。',
    note: '这是特定基准门槛下的价格比较；不表示所有任务能力相同，也不包含部署、培训和复核等企业总成本。',
    url: 'https://hai.stanford.edu/news/ai-index-2025-state-of-ai-in-10-charts',
    link: '阅读 Stanford HAI 原始说明',
  },
  work: {
    tag: '特定任务生产率 · NBER 2023 年 6 月摘要',
    title: 'AI 辅助客服，每小时解决的问题数增加约 14%。',
    text: '2023 年早期研究分析了 5,179 位客服人员。获得 AI 实时建议后，每小时成功解决的问题数平均增加 13.8%，约为 14%。员工结合自身判断决定是否采用建议。',
    note: '这是一家企业软件公司的技术客服研究，采用分阶段部署的准实验比较。它不代表所有岗位的通用增幅，也不是利润增长率。',
    url: 'https://www.nber.org/digest/20236/measuring-productivity-impact-generative-ai',
    link: '阅读 NBER 研究摘要',
  },
  protein: {
    tag: '开放预测规模 · EMBL-EBI · 2022-07-28',
    title: '超过 2 亿条结构预测，成为可共享的科研起点。',
    text: '2022 年 7 月，AlphaFold 数据库扩展至超过 2 亿条蛋白质结构预测，并向科研社区免费开放。研究者可以据此寻找线索、设计假设并安排后续验证。',
    note: '数字表示开放的结构预测规模；预测仍需置信度评估与实验验证，不能理解为经实验确认的发现数量或生产率增幅。',
    url: 'https://www.ebi.ac.uk/about/news/technology-and-innovation/alphafold-200-million/',
    link: '阅读 EMBL-EBI 官方发布',
  },
};

export function mountFusion(root) {
  root.innerHTML = `<div class="fusion-content">
    <div id="relationship-mount"></div>
    <div class="fusion-divider"><span>从价值路径，到投入决策</span><span>调整条件，让结果随之改变 ↓</span></div>
    <section id="decision-mount" aria-label="生产力决策实验"></section>
    <div class="fusion-end"><p>从一项任务，到一条流程，再到一套生产系统。</p><span>技术突破 × 要素重组 → 新质生产力</span><button type="button" data-fusion-top>回到关系场 ↑</button></div>
  </div>
  <dialog class="fusion-source-dialog" aria-labelledby="fusion-source-title"><div class="fusion-source-head"><span>THE EVIDENCE / 历史依据</span><button type="button" aria-label="关闭历史来源">×</button></div><div class="fusion-source-body"></div></dialog>`;
  const dialog = root.querySelector('dialog');
  const sourceBody = root.querySelector('.fusion-source-body');
  const closeButton = root.querySelector('.fusion-source-head button');
  const backButton = root.querySelector('[data-fusion-top]');
  let active = false;
  let paused = false;
  const scrollTo = target => root.scrollTo({top: target.offsetTop, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  function openEvidence(key = 'work') {
    const source = sources[key] || sources.work;
    sourceBody.innerHTML = `<span class="fusion-source-tag">${source.tag}</span><h2 id="fusion-source-title">${source.title}</h2><p>${source.text}</p><div class="fusion-source-note">${source.note}</div><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.link} ↗</a>`;
    if (!dialog.open) dialog.showModal();
  }
  const relationship = mountRelationship(root.querySelector('#relationship-mount'), {
    onOpenLab: () => scrollTo(root.querySelector('#decision-mount')),
    onEvidence: openEvidence,
  });
  const decisionLab = mountDecisionLab(root.querySelector('#decision-mount'));
  function syncMotion() {
    relationship.setActive?.(active && !document.hidden);
    decisionLab.setActive?.(active && !document.hidden);
    relationship.setPaused?.(paused);
    decisionLab.setPaused?.(paused);
  }
  const closeSource = () => dialog.close();
  const backToTop = () => root.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  const outsideClose = event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); };
  closeButton.addEventListener('click',closeSource);
  backButton.addEventListener('click',backToTop);
  dialog.addEventListener('click',outsideClose);
  document.addEventListener('visibilitychange',syncMotion);
  syncMotion();
  return {
    openEvidence,
    setActive(value) { active = value; syncMotion(); },
    setPaused(value) { paused = value; syncMotion(); },
    dispose() { relationship.dispose?.(); decisionLab.dispose?.(); closeButton.removeEventListener('click',closeSource); backButton.removeEventListener('click',backToTop); dialog.removeEventListener('click',outsideClose); document.removeEventListener('visibilitychange',syncMotion); dialog.close(); },
  };
}
