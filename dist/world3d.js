(()=>{
'use strict';
const canvas=document.querySelector('#world3d');if(!canvas)return;
const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
if(!gl){canvas.hidden=true;return}
const vs=`#version 300 es
precision highp float;
layout(location=0)in vec3 p;layout(location=1)in vec3 n;layout(location=2)in vec3 c;
uniform vec4 view;uniform float time;out vec3 N;out vec3 C;out float fog;
void main(){vec3 P=p;C=c;if(C.b>1.5)P.y+=sin(time*1.4+P.x*.08+P.z*.06)*.7;float sx=P.x,sy=P.z-P.y;vec2 q=(vec2(sx,sy)-view.xy)/view.zw;gl_Position=vec4(q.x*2.-1.,1.-q.y*2.,.98-clamp((P.z+P.y*.18)/900.,0.,.98),1.);N=n;fog=clamp(P.z/650.,0.,.42);}`;
const fs=`#version 300 es
precision highp float;in vec3 N;in vec3 C;in float fog;out vec4 outColor;
void main(){vec3 sun=normalize(vec3(-.5,.85,-.35));float d=max(dot(normalize(N),sun),0.);float rim=pow(1.-max(N.y,0.),2.)*.12;vec3 col=C*(.42+d*.68)+vec3(1.,.73,.38)*rim;col=mix(col,vec3(.46,.68,.78),fog);outColor=vec4(pow(col,vec3(.92)),1.);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
const vao=gl.createVertexArray(),buf=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buf);for(let i=0;i<3;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,36,i*12)}
const Uview=gl.getUniformLocation(prog,'view'),Utime=gl.getUniformLocation(prog,'time');
let vertices=[],count=0,last=null,lastGeometrySignature='',contextLost=false,start=performance.now(),quality=devicePixelRatio>1.6&&innerWidth<800?.72:1;
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;canvas.hidden=true;document.body.classList.remove('webgl-ready')});
const colors={ground:[.24,.55,.18],forest:[.10,.32,.16],water:[.04,.48,1.8],marsh:[.19,.34,.21],ridge:[.38,.39,.38],road:[.48,.35,.21],snow:[.78,.91,.95],lava:[1.15,.18,.035],objective:[.72,.58,.12]};
function tri(a,b,c,n,col){for(const p of[a,b,c])vertices.push(...p,...n,...col)}
function quad(a,b,c,d,n,col){tri(a,b,c,n,col);tri(a,c,d,n,col)}
function prism(cx,cz,r,y0,y1,col,sides=6){const top=[];for(let i=0;i<sides;i++){const a=Math.PI*2*i/sides-Math.PI/6;top.push([cx+Math.cos(a)*r,y1,cz+Math.sin(a)*r])}for(let i=1;i<sides-1;i++)tri(top[0],top[i],top[i+1],[0,1,0],col);for(let i=0;i<sides;i++){const j=(i+1)%sides,a=top[i],b=top[j],aa=[a[0],y0,a[2]],bb=[b[0],y0,b[2]],nx=Math.cos(Math.PI*2*(i+.5)/sides-Math.PI/6),nz=Math.sin(Math.PI*2*(i+.5)/sides-Math.PI/6);quad(aa,bb,b,a,[nx,.08,nz],col.map(v=>v*.72))}}
function box(cx,y,cz,w,h,d,col){const x=cx-w/2,X=cx+w/2,z=cz-d/2,Z=cz+d/2,Y=y+h;quad([x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z],[0,1,0],col);quad([x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z],[0,0,1],col);quad([X,y,z],[x,y,z],[x,Y,z],[X,Y,z],[0,0,-1],col);quad([X,y,Z],[X,y,z],[X,Y,z],[X,Y,Z],[1,0,0],col);quad([x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z],[-1,0,0],col)}
function cone(cx,y,cz,r,h,col,sides=7){const tip=[cx,y+h,cz],ring=[];for(let i=0;i<sides;i++){const a=Math.PI*2*i/sides;ring.push([cx+Math.cos(a)*r,y,cz+Math.sin(a)*r])}for(let i=0;i<sides;i++){const j=(i+1)%sides,n=[Math.cos(Math.PI*2*(i+.5)/sides),.42,Math.sin(Math.PI*2*(i+.5)/sides)];tri(ring[i],ring[j],tip,n,col)}}
function shadow(cx,y,cz,r){prism(cx,cz,r,y,y+.12,[.035,.05,.05],12)}
function hash(q,r,s=0){let x=(q*374761393+r*668265263+s*69069)>>>0;x=(x^(x>>13))*1274126177;return((x^(x>>16))>>>0)/4294967295}
function center(q,r,h=0){return{x:Math.sqrt(3)*27*(q+.5*(r&1))+Math.sqrt(3)*27*.8,z:27*1.5*r+27*1.05,y:h*8+7}}
function tree(x,y,z,s=1){shadow(x,y+.1,z,7*s);prism(x,z,2.2*s,y,y+12*s,[.22,.12,.055],8);cone(x,y+8*s,z,9*s,18*s,[.08,.31,.12],8);cone(x,y+17*s,z,7*s,14*s,[.14,.46,.16],8)}
function rock(x,y,z,s=1,col=[.38,.39,.36]){prism(x,z,5*s,y,y+4*s,col,7)}
function building(st,p){const stone=[.40,.42,.43],wood=[.35,.18,.07],gold=[.88,.52,.10];shadow(p.x,p.y,p.z,15);if(st.type==='tower'){prism(p.x,p.z,13,p.y,p.y+28,stone,8);cone(p.x,p.y+28,p.z,16,15,gold,8)}else if(st.type==='wall'){box(p.x,p.y,p.z,38,19,8,stone);for(let i=-1;i<=1;i++)box(p.x+i*13,p.y+19,p.z,8,5,9,stone)}else if(st.type==='ladder'){box(p.x,p.y,p.z,4,19,15,wood)}else if(st.type==='beacon'){prism(p.x,p.z,8,p.y,p.y+22,stone,6);cone(p.x,p.y+22,p.z,7,11,[.15,.72,1.1],8)}else if(st.type==='barricade'){box(p.x,p.y,p.z,27,8,6,wood)}else{box(p.x,p.y,p.z,23,13,17,stone);box(p.x,p.y+13,p.z,27,5,20,wood)}}
function miniature(u,p,index,total){const spread=(index-(total-1)/2)*8,x=p.x+spread,z=p.z+(index%2?3:-2),team=u.team==='enemy'?[.64,.08,.10]:u.team==='ally'?[.86,.58,.10]:[.06,.42,.72],scale=u.size===1?1.15:.86;shadow(x,p.y+.15,z,6*scale);prism(x,z,6.3*scale,p.y,p.y+2.1,team,18);prism(x,z,3.2*scale,p.y+2.1,p.y+13*scale,team.map(v=>v*.82),8);prism(x,z,3.1*scale,p.y+13*scale,p.y+18*scale,[.77,.63,.48],10);if(u.range>2)box(x+4*scale,p.y+8*scale,z,9*scale,1.3,1.5,[.20,.13,.07]);else cone(x+4*scale,p.y+6*scale,z,1.2,10*scale,[.72,.75,.78],5)}
function geometrySignature(data){const tileKey=data.tiles.map(x=>`${x.q},${x.r},${x.t},${x.h}`).join(';'),structureKey=(data.state.structures||[]).map(x=>`${x.id||''},${x.type},${x.q},${x.r}`).join(';'),baseKey=(data.state.bases||[]).map(x=>`${x.id||''},${x.team},${x.q},${x.r},${x.hp}`).join(';'),unitKey=(data.state.units||[]).map(x=>`${x.id},${x.team},${x.q},${x.r},${x.hp},${x.maxHp},${x.size},${x.range}`).join(';');return tileKey+'|'+structureKey+'|'+baseKey+'|'+unitKey}
function rebuild(data){vertices=[];for(const tile of data.tiles){const p=center(tile.q,tile.r,tile.h),col=colors[tile.t]||colors.ground,water=tile.t==='water';prism(p.x,p.z,26.2,tile.h*8-3,p.y+(water?-7:0),col);if(tile.t==='forest'){tree(p.x-7,p.y,p.z+2,.75);tree(p.x+8,p.y,p.z-5,.62)}else if(!['water','lava','objective','road'].includes(tile.t)&&hash(tile.q,tile.r)<.32)rock(p.x+(hash(tile.q,tile.r,2)-.5)*24,p.y,p.z+(hash(tile.q,tile.r,3)-.5)*20,.45+hash(tile.q,tile.r,4)*.45,tile.t==='snow'?[.7,.8,.82]:undefined)}
for(const st of data.state.structures||[])building(st,center(st.q,st.r,data.height[st.q+','+st.r]||0));
for(const b of data.state.bases||[]){if(b.hp<=0)continue;const p=center(b.q,b.r,data.height[b.q+','+b.r]||0);shadow(p.x,p.y,p.z,18);prism(p.x,p.z,15,p.y,p.y+24,b.team==='enemy'?[.42,.07,.09]:[.05,.38,.58],8);cone(p.x,p.y+24,p.z,18,18,[.72,.52,.16],8)}
for(const u of data.state.units||[]){if(u.hp<=0)continue;const p=center(u.q,u.r,data.height[u.q+','+u.r]||0),n=Math.min(u.size,Math.max(1,Math.ceil(u.size*u.hp/u.maxHp)));for(let i=0;i<n;i++)miniature(u,p,i,n)}
gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);count=vertices.length/9;document.body.classList.add('webgl-ready')}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1)*quality,w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}}
function frame(){if(!contextLost){resize();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(.20,.44,.58,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);if(last){gl.useProgram(prog);gl.uniform4f(Uview,last.view.x,last.view.y,last.view.w,last.view.h);gl.uniform1f(Utime,(performance.now()-start)/1000);gl.bindVertexArray(vao);gl.drawArrays(gl.TRIANGLES,0,count)}}requestAnimationFrame(frame)}
window.Valhalla3D={render(data){if(contextLost)return;last=data;const signature=geometrySignature(data);if(signature!==lastGeometrySignature){lastGeometrySignature=signature;rebuild(data)}},setView(view){if(last)last.view=view},get available(){return!contextLost}};requestAnimationFrame(frame);
})();
