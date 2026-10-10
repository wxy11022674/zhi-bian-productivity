  export function calculate(input){
    for(const key of ['a','d','t','r'])if(typeof input[key]!=='number'||!Number.isFinite(input[key])||input[key]<0||input[key]>1)throw new RangeError('参数必须在 0 与 1 之间');
    const {a,d,t,r}=input;
    const effective=a*d*(.4+.6*t);
    const gross=10000*(1+.5*effective-.12*a*r);
    const defectRate=Math.max(.005,Math.min(.15,.05-.035*effective-.01*a*r+.04*a*(1-d)*(1-r)));
    const good=gross*(1-defectRate);
    const cost=500000+50000*a+30000*a*t+40000*a*r;
    const investment=200000*a+100000*a*t;
    const profit=good*80-cost;
    const delta=profit-260000;
    const payback=investment===0?0:delta>0?Math.ceil(investment/delta):null;
    return {effective,gross,defectRate,good,cost,investment,profit,delta,payback,timeline:Array.from({length:25},(_,month)=>({month,value:month*delta-investment}))};
  }
  export const defaults={a:.65,d:1,t:.6,r:.5};
