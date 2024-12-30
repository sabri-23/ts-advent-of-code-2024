let i=require('fs').readFileSync(0,'utf8').trim().split('\n'),r=[],u=[];
i.forEach(l=>l.includes('|')?r.push(l.split('|').map(Number)):l.includes(',')&&u.push(l.split(',').map(Number)));
let p1=0,p2=0;
u.forEach(U=>{
  let s=new Set(U),m=new Map(U.map((v,i)=>[v,i]));
  if(r.every(([x,y])=>!s.has(x)||!s.has(y)||m.get(x)<m.get(y))) p1+=U[U.length>>1];
  else {
    let g={},d={};
    s.forEach(v=>(g[v]=[],d[v]=0));
    r.forEach(([x,y])=>s.has(x)&&s.has(y)&&(g[x].push(y),d[y]++));
    let q=Object.keys(d).filter(v=>!d[v]),o=[];
    for(;q.length;){
      let v=q.shift();
      o.push(+v);
      g[v].forEach(w=>!--d[w]&&q.push(''+w));
    }
    p2+=o[o.length>>1];
  }
});
console.log(p1),console.log(p2);
