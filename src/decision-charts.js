import { calculate } from './decision-model.js';
  const mint='var(--viz-accent)',orange='var(--viz-warm)',muted='var(--viz-muted)',line='var(--viz-line)',ink='var(--viz-text)';
  const svg=(body,w=600,h=260,label='')=>`<svg xmlns="http://www.w3.org/2000/svg" class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
  const text=(x,y,t,opts='')=>`<text x="${x}" y="${y}" ${opts}>${t}</text>`;
  export function returns(series){
    const all=series.flatMap(s=>s.result.timeline.map(p=>p.value/10000));let min=Math.min(0,...all),max=Math.max(1,...all);const pad=(max-min)*.12;min-=pad;max+=pad;
    const W=760,H=255,L=62,R=25,T=15,B=40,x=m=>L+m/24*(W-L-R),y=v=>T+(max-v)/(max-min)*(H-T-B);let b='';
    for(let i=0;i<=4;i++){const v=min+(max-min)*i/4;b+=`<line x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}" class="grid"/>${text(L-10,y(v)+4,v.toFixed(0),'text-anchor="end"')}`;}
    b+=`<line x1="${L}" y1="${y(0)}" x2="${W-R}" y2="${y(0)}" stroke="${orange}" stroke-dasharray="5 4"/>`;
    for(const m of [0,6,12,18,24])b+=text(x(m),H-13,m+'月','text-anchor="middle"');
    for(const s of series){const pts=s.result.timeline.map(p=>`${x(p.month)},${y(p.value/10000)}`).join(' ');b+=`<polyline points="${pts}" fill="none" stroke="${s.color||mint}" stroke-width="2.5" stroke-linejoin="round"/>`;for(const p of s.result.timeline.filter(p=>p.month%6===0))b+=`<circle cx="${x(p.month)}" cy="${y(p.value/10000)}" r="4" fill="${s.color||mint}"><title>${s.name} 第${p.month}月：${(p.value/10000).toFixed(2)}万元</title></circle>`;}
    return svg(b,W,H,'24个月累计增量净收益，零线为不使用AI的基线；单位万元');
  }
  export function landscape(params){
    calculate(params);
    const x=a=>68+420*a,y=d=>248-200*d;
    const mix=(from,to,t)=>'#'+from.map((v,i)=>Math.round(v+(to[i]-v)*t).toString(16).padStart(2,'0')).join('');
    const color=v=>v<0?mix([236,238,245],[183,148,237],Math.min(1,-v/15)):mix([236,238,245],[55,89,240],Math.min(1,v/30));
    const label=(xx,yy,s,extra='')=>text(xx,yy,s,`style="fill:var(--viz-muted);font-size:11px" ${extra}`);
    let b='<rect width="640" height="340" rx="10" fill="var(--viz-surface)"/>';
    b+=label(58,23,'数据质量 ↑')+label(535,23,'月增量收益','text-anchor="middle"');
    for(let j=0;j<=20;j++)for(let i=0;i<=20;i++){
      const a=i/20,d=j/20,value=calculate({...params,a,d}).delta/10000;
      b+=`<rect x="${x(a)-10}" y="${y(d)-5}" width="20" height="10" fill="${color(value)}" data-land-a="${a}" data-land-d="${d}" style="cursor:crosshair"><title>AI 应用率 ${i*5}% · 数据质量 ${j*5}% · 培训 ${Math.round(params.t*100)}% · 复核 ${Math.round(params.r*100)}%：月增量收益 ${value>=0?'+':''}${value.toFixed(2)} 万元</title></rect>`;
    }
    // Locate the actual zero-profit crossing at each sampled application rate.
    // All points at a=0 have zero profit, so that degenerate edge is not a contour.
    let contour='',pen=false;
    for(let i=1;i<=80;i++){
      const a=i/80,f=d=>calculate({...params,a,d}).delta;
      if(f(0)*f(1)>0){pen=false;continue;}
      let low=0,high=1;
      for(let n=0;n<28;n++){const mid=(low+high)/2;if(f(mid)<0)low=mid;else high=mid;}
      contour+=`${pen?'L':'M'}${x(a).toFixed(2)} ${y((low+high)/2).toFixed(2)} `;pen=true;
    }
    b+=`<path d="${contour}" fill="none" stroke="#171921" stroke-width="1.5" stroke-dasharray="4 4" pointer-events="none"/>`;
    [0,.25,.5,.75,1].forEach(v=>{b+=label(x(v),273,`${v*100}%`,'text-anchor="middle"')+label(48,y(v)+4,`${v*100}%`,'text-anchor="end"');});
    b+=label(276,290,'AI 应用率 →','text-anchor="middle"');
    for(let i=0;i<90;i++){const v=30-i*.5;b+=`<rect x="526" y="${44+i*2}" width="15" height="2.1" fill="${color(v)}"/>`;}
    [[30,46],[0,166],[-15,226]].forEach(([v,yy])=>b+=label(549,yy,`${v>0?'+':''}${v} 万`));
    b+=`<path d="M523 249h24" stroke="#171921" stroke-dasharray="4 4"/>`+label(552,253,'盈亏分界');
    b+=`<g pointer-events="none"><circle cx="${x(params.a)}" cy="${y(params.d)}" r="8" fill="none" stroke="#10121A" stroke-width="5"/><circle cx="${x(params.a)}" cy="${y(params.d)}" r="8" fill="none" stroke="#F6F5F1" stroke-width="2"/><circle cx="${x(params.a)}" cy="${y(params.d)}" r="2" fill="#F6F5F1"/></g>`;
    b+=label(58,315,'点击格子选择方案 · 白圈为当前配置 · 固定色域 −15 至 +30 万元');
    b+=label(58,332,`教学模型 · 培训 ${Math.round(params.t*100)}% / 复核 ${Math.round(params.r*100)}% 固定 · 非实证预测`);
    return svg(b,640,340,'应用率与数据质量的收益热力图；点击格子更新方案，颜色表示固定色域下的月增量收益');
  }
  export function waterfall(params){
    const result=calculate(params);
    const items=[['新增合格品价值',(result.good-9500)*80],['AI 月成本',-50000*params.a],['培训月成本',-30000*params.a*params.t],['复核月成本',-40000*params.a*params.r],['净增收益',result.delta]];
    const y=v=>180-(v+15)/60*150;
    let b='<rect width="700" height="240" rx="10" fill="var(--viz-surface)"/>',sum=0;
    const label=(xx,yy,s,extra='')=>text(xx,yy,s,`style="fill:var(--viz-muted);font-size:11px" ${extra}`);
    b+=label(17,19,'月收益分解 / 万元 · 相对不使用 AI 的基线');
    [-15,0,15,30,45].forEach(v=>{b+=`<line x1="48" y1="${y(v)}" x2="678" y2="${y(v)}" stroke="${v===0?'var(--viz-muted)':'var(--viz-line)'}" stroke-dasharray="${v===0?'0':'3 5'}"/>`+label(38,y(v)+4,String(v),'text-anchor="end"');});
    items.forEach(([name,value],i)=>{
      const v=value/10000,start=i===4?0:sum,end=i===4?v:sum+v,xx=67+i*123;
      const fill=i===4?(v>=0?'var(--viz-warm)':'var(--viz-warm)'):(v>=0?'var(--viz-accent)':'var(--viz-warm)');
      if(i>0&&i<4)b+=`<line x1="${xx-41}" y1="${y(start)}" x2="${xx}" y2="${y(start)}" stroke="var(--viz-muted)" stroke-dasharray="3 3"/>`;
      b+=`<rect x="${xx}" y="${y(Math.max(start,end))}" width="82" height="${Math.max(.8,Math.abs(y(start)-y(end)))}" rx="2" fill="${fill}" opacity="${i===4?1:.85}"><title>${name}：${v>=0?'+':''}${v.toFixed(2)} 万元；累计 ${end.toFixed(2)} 万元</title></rect>`;
      b+=text(xx+41,y(Math.max(start,end))-7,`${v>0?'+':''}${v.toFixed(2)}`,`text-anchor="middle" style="fill:${fill};font-size:13px;font-weight:600"`)+label(xx+41,204,name,'text-anchor="middle"');
      if(i<4)sum=end;
    });
    b+=label(350,229,'青色增加价值 · 琥珀色扣除成本 · 最右为净增收益 · 全部采用同一教学模型','text-anchor="middle"');
    return svg(b,700,240,'月增量收益瀑布图：新增合格品价值减去AI、培训与复核成本，得到净增收益；单位万元');
  }
