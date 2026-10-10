import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculate,defaults} from '../src/decision-model.js';
test('无 AI 应用时精确恢复基线',()=>{const x=calculate({a:0,d:1,t:1,r:1});assert.equal(x.good,9500);assert.equal(x.delta,0);assert.equal(x.investment,0);assert.equal(x.payback,0);});
test('低质量无培训方案可产生负收益且不回本',()=>{const x=calculate({a:1,d:0,t:0,r:0});assert.ok(x.delta<0);assert.equal(x.payback,null);assert.ok(x.defectRate>.05);});
test('参数边界全部给出有限且合理的结果',()=>{for(const a of [0,1])for(const d of [0,1])for(const t of [0,1])for(const r of [0,1]){const x=calculate({a,d,t,r});for(const key of ['gross','good','cost','investment','profit','delta'])assert.ok(Number.isFinite(x[key]),key);assert.ok(x.good<=x.gross);assert.ok(x.defectRate>=.005&&x.defectRate<=.15);assert.equal(x.timeline.length,25);assert.ok(Math.abs(x.timeline[0].value+x.investment)<1e-8);assert.equal(x.timeline[24].value,24*x.delta-x.investment);}});
test('默认方案回本月是累计净收益首次非负的月份',()=>{const x=calculate(defaults);assert.ok(x.payback>0);assert.ok(x.timeline[x.payback].value>=0);assert.ok(x.timeline[x.payback-1].value<0);});
test('非法输入被拒绝',()=>{for(const bad of [-.1,1.1,NaN,Infinity,'0.5'])assert.throws(()=>calculate({...defaults,a:bad}),RangeError);});


test('截图默认配置保持原模型结果',()=>{const x=calculate(defaults);assert.equal(Math.round(x.good),11724);assert.equal((x.defectRate*100).toFixed(2),'2.95');assert.equal((x.delta/10000).toFixed(2),'12.07');assert.equal(x.payback,2);});
