import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('scrollspy moves only the horizontal menu at the page bottom; clicks still navigate',async()=> {
  const source=await readFile('js/manual.js','utf8');
  const start=source.indexOf('(function subnav()'),end=source.indexOf('/* ---------- 2.',start);
  const rail={scrollLeft:0,clientWidth:320,scrollWidth:1800,getBoundingClientRect:()=>({left:80,right:400})};
  const sections=Array.from({length:13},(_,i)=>({id:'section-'+i,offsetTop:i*1000,getBoundingClientRect:()=>({top:i*1000-window.scrollY})}));
  const links=sections.map((section,i)=> ({
    active:false,events:{},
    getAttribute:()=>section.id,
    classList:{toggle(name,value){links[i].active=value;}},
    addEventListener(name,handler){this.events[name]=handler;},
    getBoundingClientRect:()=>({left:80+i*135-rail.scrollLeft,right:80+i*135-rail.scrollLeft+100,width:100}),
    scrollIntoView(){window.scrollY=300;}
  }));
  const nav={querySelectorAll:()=>links,querySelector:(selector)=>selector==='.manual-subnav-inner'?rail:links.find(link=>link.active)};
  const listeners={},calls=[];
  const window={scrollY:13000,addEventListener:(event,handler)=>listeners[event]=handler,scrollTo:(options)=>{calls.push(options);window.scrollY=options.top;}};
  const document={getElementById:(id)=>id==='manualSubnav'?nav:sections.find(section=>section.id===id)};
  vm.runInNewContext(source.slice(start,end),{document,window});
  assert.equal(window.scrollY,13000,'automatic highlighting must not jump the page');
  assert.ok(rail.scrollLeft>0,'the last navigation item must become visible');
  assert.equal(calls.length,0);assert.equal(links[12].active,true);
  for(let i=0;i<10;i++)listeners.scroll();
  assert.equal(window.scrollY,13000);assert.equal(calls.length,0);
  window.scrollY=0;listeners.scroll();assert.equal(rail.scrollLeft,0);assert.equal(window.scrollY,0);
  links[5].events.click({preventDefault(){}});
  assert.equal(calls.length,1);assert.equal(window.scrollY,4860);
});
