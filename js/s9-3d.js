async function mountS9Viewer(root) {
  if (root.dataset.s9Mounted === 'true') return;
  root.dataset.s9Mounted = 'true';
  root.setAttribute('aria-busy', 'true');
  const stage = root.querySelector('.s9-palco');
  const loading = root.querySelector('#s9-carregando');
  const status = root.querySelector('#s9-status');
  const picker = root.querySelector('#s9-vista');
  const buttons = Array.from(root.querySelectorAll('button'));
  const poster = root.querySelector('.s9-poster');
  const fullscreenButton = root.querySelector('#s9-fullscreen');
  buttons.forEach(b => b.disabled = true);
  picker.disabled = true;
  try {
    const THREE = await import('/assets/vendor/three-0.180.0/three.module.js');
    const { OrbitControls } = await import('/assets/vendor/three-0.180.0/OrbitControls.js');
    const { RoundedBoxGeometry } = await import('/assets/vendor/three-0.180.0/RoundedBoxGeometry.js');
    const { RoomEnvironment } = await import('/assets/vendor/three-0.180.0/RoomEnvironment.js');
    if (!root.isConnected) throw new Error('A visualização foi fechada.');

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', 'Purificador S9 branco, com dois filtros turquesa CBPA e RO, visor frontal, base de apoio e conectores traseiros. Arraste para girar. Use a roda do mouse ou dois dedos para ampliar. Os botões permitem girar e ampliar pelo teclado.');
    stage.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();

    // Product colors follow the supplied photos; only the surrounding stage follows the host theme.
    const plastic = new THREE.MeshPhysicalMaterial({ color:0xf3f3f1, roughness:0.29, metalness:0, clearcoat:0.24, clearcoatRoughness:0.3, envMapIntensity:0.58 });
    const frontPlastic = new THREE.MeshPhysicalMaterial({ color:0xfafaf8, roughness:0.26, clearcoat:0.24, clearcoatRoughness:0.3, envMapIntensity:0.58 });
    const insetPlastic = new THREE.MeshStandardMaterial({ color:0xdedfdc, roughness:0.4, envMapIntensity:0.42 });
    const white = new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.32, clearcoat:0.14, envMapIntensity:0.46 });
    const teal = new THREE.MeshPhysicalMaterial({ color:0x10515a, roughness:0.32, metalness:0.08, clearcoat:0.3, envMapIntensity:0.62 });
    const rubber = new THREE.MeshStandardMaterial({ color:0x151a1b, roughness:0.67 });
    const holeMaterial = new THREE.MeshStandardMaterial({ color:0x03090b, roughness:0.85 });
    const blue = new THREE.MeshStandardMaterial({ color:0x055be8, roughness:0.4 });
    const metal = new THREE.MeshStandardMaterial({ color:0xc3c5bc, roughness:0.29, metalness:0.82 });
    const labelGrey = new THREE.MeshStandardMaterial({ color:0x959995, roughness:0.62 });
    const ledMaterial = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.35, emissive:0xe8f7f8, emissiveIntensity:0.24 });
    const model = new THREE.Group();
    scene.add(model);

    function add(geometry, material, x=0, y=0, z=0, parent=model) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x,y,z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    function roundedBox(w,h,d,r,material,x,y,z) {
      return add(new RoundedBoxGeometry(w,h,d,5,r), material,x,y,z);
    }
    function roundedShape(w,h,r,cx=0,cy=0) {
      const s = new THREE.Shape();
      const l=cx-w/2, right=cx+w/2, b=cy-h/2, t=cy+h/2;
      s.moveTo(l+r,b); s.lineTo(right-r,b);
      s.quadraticCurveTo(right,b,right,b+r); s.lineTo(right,t-r);
      s.quadraticCurveTo(right,t,right-r,t); s.lineTo(l+r,t);
      s.quadraticCurveTo(l,t,l,t-r); s.lineTo(l,b+r);
      s.quadraticCurveTo(l,b,l+r,b);
      return s;
    }
    function plate(shape,depth,bevel,material,z) {
      return add(new THREE.ExtrudeGeometry(shape,{ depth, steps:1, bevelEnabled:bevel>0, bevelSegments:4, bevelSize:bevel, bevelThickness:bevel, curveSegments:32 }),material,0,0,z);
    }
    function cylinder(radius,depth,material,x,y,z,segments=72) {
      const mesh=add(new THREE.CylinderGeometry(radius,radius,depth,segments),material,x,y,z);
      mesh.rotation.x=Math.PI/2;
      return mesh;
    }
    function torus(radius,tube,material,x,y,z) {
      return add(new THREE.TorusGeometry(radius,tube,12,96),material,x,y,z);
    }
    function label(text,w,h,x,y,z,color,rotationY=0) {
      const canvas=document.createElement('canvas'); canvas.width=768; canvas.height=256;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='400 172px Arial, sans-serif'; ctx.fillText(text,384,140);
      const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
      const mesh=add(new THREE.PlaneGeometry(w,h),material,x,y,z);
      mesh.rotation.y=rotationY; mesh.castShadow=false; mesh.receiveShadow=false;
      return mesh;
    }

    // Rounded enclosure and the separate front service cover.
    roundedBox(1.98,5.12,4.7,0.48,plastic,0,3.015,-0.55);
    const seamShape=roundedShape(1.994,5.15,0.97,0,3.02);
    plate(seamShape,0.016,0.016,insetPlastic,1.68);
    const coverShape=roundedShape(1.99,5.21,0.97,0,3.055);
    const opening=roundedShape(1.72,3.43,0.85,0,3.83);
    coverShape.holes.push(new THREE.Path(opening.getPoints(96)));
    plate(coverShape,0.12,0.023,frontPlastic,1.84);
    plate(roundedShape(1.735,3.445,0.857,0,3.83),0.025,0.009,insetPlastic,1.81);

    // Saddle base: four feet, low central tray and raised side supports.
    roundedBox(2.4,0.26,3.07,0.1,frontPlastic,0,0.285,-0.73);
    const saddle = new THREE.Shape();
    saddle.moveTo(-1.53,0.22); saddle.lineTo(1.42,0.22);
    saddle.quadraticCurveTo(1.51,0.22,1.49,0.36);
    saddle.lineTo(1.30,1.16); saddle.quadraticCurveTo(1.22,1.47,0.96,1.47);
    saddle.lineTo(-1.03,1.47); saddle.quadraticCurveTo(-1.32,1.47,-1.39,1.20);
    saddle.lineTo(-1.59,0.37); saddle.quadraticCurveTo(-1.62,0.22,-1.53,0.22);
    const saddleGeometry = new THREE.ExtrudeGeometry(saddle,{depth:0.16,bevelEnabled:true,bevelSize:0.07,bevelThickness:0.07,bevelSegments:5,curveSegments:28});
    [-1,1].forEach(side => {
      const support=add(saddleGeometry,frontPlastic,side===1?1.06:-1.22,0,-0.75);
      support.rotation.y=Math.PI/2;
      const panel=add(new THREE.PlaneGeometry(0.78,0.38),labelGrey,side*1.292,0.75,-0.68);
      panel.rotation.y=side*Math.PI/2;
      panel.geometry.dispose();
      panel.geometry=new THREE.ShapeGeometry(roundedShape(0.78,0.38,0.055));
      for(const zz of [-1.22,1.04]) {
        const foot=add(new THREE.CylinderGeometry(0.19,0.21,0.13,48),white,side*0.93,0.09,zz-0.61);
        const sole=add(new THREE.CylinderGeometry(0.192,0.2,0.025,48),rubber,side*0.93,0.028,zz-0.61);
        foot.receiveShadow=true; sole.receiveShadow=true;
      }
    });

    // Ribbed filter caps, retaining rings and turquoise faces.
    for (const [yy,text] of [[4.63,'CBPA'],[2.91,'RO']]) {
      cylinder(0.64,0.045,rubber,0,yy,1.89);
      torus(0.629,0.012,rubber,0,yy,1.94);
      cylinder(0.625,0.55,white,0,yy,2.19,96);
      torus(0.600,0.032,white,0,yy,2.475);
      const ridgeGeometry=new RoundedBoxGeometry(0.02,0.023,0.48,2,0.007);
      const ridges=new THREE.InstancedMesh(ridgeGeometry,white,88);
      ridges.castShadow=true; ridges.receiveShadow=true;
      const dummy=new THREE.Object3D();
      for(let i=0;i<88;i++) {
        const angle=i/88*Math.PI*2;
        dummy.position.set(Math.cos(angle)*0.628,yy+Math.sin(angle)*0.628,2.19);
        dummy.rotation.set(0,0,angle-Math.PI/2);
        dummy.updateMatrix(); ridges.setMatrixAt(i,dummy.matrix);
      }
      model.add(ridges);
      cylinder(0.542,0.045,teal,0,yy,2.49);
      torus(0.493,0.017,white,0,yy,2.516);
      label(text,0.68,0.225,0,yy,2.521,'#155a65');
    }
    label('IN',0.14,0.065,0,5.31,1.852,'#9daba7');
    label('RO',0.14,0.065,0,3.76,1.852,'#9daba7');

    // Digital display replicates the photographed 888 state, without a fabricated reading.
    roundedBox(0.535,0.3,0.035,0.035,rubber,0,1.76,1.993);
    const displayCanvas=document.createElement('canvas'); displayCanvas.width=600; displayCanvas.height=300;
    const displayCtx=displayCanvas.getContext('2d');
    displayCtx.fillStyle='#f0f4f2';
    const segmentPaths=[[[20,10],[87,10],[98,21],[87,31],[20,31],[9,21]],[[91,34],[104,24],[104,106],[93,118],[83,107],[83,44]],[[91,131],[104,120],[104,203],[93,215],[83,204],[83,141]],[[20,210],[87,210],[98,221],[87,233],[20,233],[9,221]],[[5,131],[17,141],[17,204],[5,215],[-6,203],[-6,120]],[[5,34],[17,44],[17,107],[5,118],[-6,106],[-6,24]],[[20,112],[87,112],[98,123],[87,135],[20,135],[9,123]]];
    for(let digit=0;digit<3;digit++) {
      displayCtx.save(); displayCtx.translate(108+digit*147,34); displayCtx.transform(1,0,-0.07,1,0,0);
      for(const polygon of segmentPaths) {
        displayCtx.beginPath(); polygon.forEach(([x,y],i)=>i?displayCtx.lineTo(x,y):displayCtx.moveTo(x,y)); displayCtx.closePath(); displayCtx.fill();
      }
      displayCtx.restore();
    }
    const displayTexture=new THREE.CanvasTexture(displayCanvas); displayTexture.colorSpace=THREE.SRGBColorSpace;
    const displayFace=add(new THREE.PlaneGeometry(0.47,0.26),new THREE.MeshBasicMaterial({map:displayTexture,transparent:true,depthWrite:false,toneMapped:false}),0,1.76,2.014);
    displayFace.castShadow=false;
    for(const [yy,txt] of [[1.455,'CBPA'],[1.305,'RO'],[1.155,'ON']]) {
      cylinder(0.028,0.012,ledMaterial,-0.057,yy,2.001,32);
      label(txt,0.27,0.087,0.15,yy,2.008,'#515955');
    }
    const powerArc=add(new THREE.TorusGeometry(0.115,0.013,12,64,Math.PI*1.65),ledMaterial,0,0.8,2.002);
    powerArc.rotation.z=Math.PI/2+Math.PI*0.175;
    roundedBox(0.025,0.125,0.015,0.01,ledMaterial,0,0.913,2.001);

    // The marked side and small service-cover latch visible in both side views.
    label('700G',0.77,0.23,-1.0,4.49,-1.59,'#737972',-Math.PI/2);
    for(const side of [-1,1]) {
      roundedBox(0.016,0.63,0.1,0.016,insetPlastic,side*1.006,3.31,1.676);
    }

    // Rear recessed connector bay, including the three blue quick-connect sockets.
    const rearFrame=plate(roundedShape(0.57,2.64,0.12,0.16,3.84),0.045,0.02,white,0);
    rearFrame.rotation.y=Math.PI; rearFrame.position.z=-2.874;
    const rearPlate=plate(roundedShape(0.43,2.47,0.075,0.16,3.84),0.026,0.008,insetPlastic,0);
    rearPlate.rotation.y=Math.PI; rearPlate.position.z=-2.927;
    const rearX=-0.16;
    const rearPorts=[{y:4.85,type:'dc'},{y:4.44,type:'water'},{y:4.03,type:'water'},{y:3.62,type:'water'},{y:3.19,type:'pins'},{y:2.79,type:'aux'}];
    for(const p of rearPorts) {
      const isWater=p.type==='water';
      cylinder(isWater?0.158:0.146,0.072,isWater||p.type==='aux'?white:rubber,rearX,p.y,-2.995);
      torus(isWater?0.132:0.12,0.015,isWater||p.type==='aux'?white:rubber,rearX,p.y,-3.035);
      cylinder(isWater?0.088:0.092,0.006,isWater?blue:holeMaterial,rearX,p.y,-3.04);
      cylinder(isWater?0.06:0.068,0.008,holeMaterial,rearX,p.y,-3.049);
      if(p.type==='dc') {
        torus(0.047,0.008,metal,rearX,p.y,-3.053);
        cylinder(0.017,0.012,metal,rearX,p.y,-3.061,32);
      }
      if(p.type==='pins') {
        for(const [px,py] of [[-0.033,0.033],[0.033,0.033],[-0.033,-0.033],[0.033,-0.033]]) cylinder(0.009,0.012,metal,rearX+px,p.y+py,-3.061,20);
      }
      if(p.type==='aux') cylinder(0.055,0.01,labelGrey,rearX,p.y,-3.056,40);
    }
    // Fine moulding seam above and below the connector bay.
    for(const [yy,hh] of [[1.49,2.01],[5.27,0.46]]) roundedBox(0.01,hh,0.008,0.003,insetPlastic,0,yy,-2.911);
    roundedBox(0.009,0.23,0.012,0.003,insetPlastic,0,0.291,-2.272);

    scene.add(new THREE.HemisphereLight(0xffffff,0x939ca1,0.85));
    const key=new THREE.DirectionalLight(0xffffff,1.8); key.position.set(-3.5,9,6);
    key.castShadow=true; key.shadow.mapSize.set(2048,2048);
    key.shadow.camera.left=-5; key.shadow.camera.right=5; key.shadow.camera.top=7; key.shadow.camera.bottom=-5;
    key.shadow.camera.near=0.1; key.shadow.camera.far=24;
    key.shadow.bias=-0.0002; key.shadow.normalBias=0.025;
    key.target.position.set(0,2.7,0); scene.add(key,key.target);
    const fill=new THREE.DirectionalLight(0xeaf8ff,0.8); fill.position.set(6,5,-4); scene.add(fill);
    const back=new THREE.DirectionalLight(0xffffff,1.0); back.position.set(-4,6,-6); scene.add(back);
    const shadowCanvas=document.createElement('canvas'); shadowCanvas.width=256; shadowCanvas.height=256;
    const shadowCtx=shadowCanvas.getContext('2d');
    const gradient=shadowCtx.createRadialGradient(128,128,18,128,128,126);
    gradient.addColorStop(0,'rgba(255,255,255,0.7)'); gradient.addColorStop(0.4,'rgba(255,255,255,0.4)'); gradient.addColorStop(1,'rgba(255,255,255,0)');
    shadowCtx.fillStyle=gradient; shadowCtx.fillRect(0,0,256,256);
    const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,opacity:0.24,color:0x25343c,depthWrite:false,toneMapped:false});
    const floor=add(new THREE.PlaneGeometry(4.5,6.1),shadowMaterial,0,0.012,-0.65,scene);
    floor.rotation.x=-Math.PI/2; floor.castShadow=false; floor.receiveShadow=false;

    const camera=new THREE.PerspectiveCamera(32,1,0.1,100);
    const center=new THREE.Vector3(0,2.86,-0.35);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.target.copy(center); controls.enablePan=false; controls.enableDamping=false;
    controls.minDistance=5.4; controls.maxDistance=24;
    controls.minPolarAngle=0.15; controls.maxPolarAngle=Math.PI*0.88;
    controls.rotateSpeed=0.72; controls.zoomSpeed=0.9;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let preset='perspectiva', transition=null, alive=true, frame=0;

    function render() { if(alive) renderer.render(scene,camera); }
    function defaultDistance() {
      return 13.1*Math.max(1,0.83/(stage.clientWidth/Math.max(1,stage.clientHeight)));
    }
    const presets={perspectiva:new THREE.Vector3(-0.64,0.21,0.74),frente:new THREE.Vector3(0,0.04,1),lateral:new THREE.Vector3(-1,0.04,0),traseira:new THREE.Vector3(0,0.04,-1)};
    function syncPicker() { if(picker.querySelector('option[value="'+preset+'"]')) picker.value=preset; }
    function moveTo(position,labelName,animate=true) {
      cancelAnimationFrame(frame); transition=null;
      const from=camera.position.clone(), fromTarget=controls.target.clone();
      if(reducedMotion.matches||!animate) { camera.position.copy(position); controls.target.copy(center); controls.update(); render(); status.textContent=labelName; return; }
      const start=performance.now();
      const fromOffset=from.clone().sub(fromTarget), toOffset=position.clone().sub(center);
      const sf=new THREE.Spherical().setFromVector3(fromOffset), st=new THREE.Spherical().setFromVector3(toOffset);
      let dtheta=st.theta-sf.theta;
      while(dtheta>Math.PI) dtheta-=Math.PI*2;
      while(dtheta<-Math.PI) dtheta+=Math.PI*2;
      transition=true;
      function tick(now) {
        if(!alive||!transition) return;
        const t=Math.min(1,(now-start)/320), eased=t*t*(3-2*t);
        const sphere=new THREE.Spherical(THREE.MathUtils.lerp(sf.radius,st.radius,eased),THREE.MathUtils.lerp(sf.phi,st.phi,eased),sf.theta+dtheta*eased);
        controls.target.lerpVectors(fromTarget,center,eased);
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sphere)); controls.update(); render();
        if(t<1) frame=requestAnimationFrame(tick);
        else { transition=null; status.textContent=labelName; }
      }
      frame=requestAnimationFrame(tick);
    }
    picker.addEventListener('change',()=>{
      preset=picker.value;
      moveTo(center.clone().addScaledVector(presets[preset].clone().normalize(),defaultDistance()),picker.selectedOptions[0].textContent);
    });
    function rotate(angle) {
      cancelAnimationFrame(frame); transition=null;
      const offset=camera.position.clone().sub(controls.target); offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);
      moveTo(controls.target.clone().add(offset),'Vista girada');
    }
    function zoom(factor) {
      cancelAnimationFrame(frame); transition=null;
      const offset=camera.position.clone().sub(controls.target);
      offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));
      camera.position.copy(controls.target).add(offset); controls.update(); render();
      status.textContent=factor<1?'Modelo ampliado':'Modelo reduzido';
    }
    root.querySelector('#s9-esquerda').addEventListener('click',()=>rotate(-Math.PI/8));
    root.querySelector('#s9-direita').addEventListener('click',()=>rotate(Math.PI/8));
    root.querySelector('#s9-ampliar').addEventListener('click',()=>zoom(0.83));
    root.querySelector('#s9-reduzir').addEventListener('click',()=>zoom(1/0.83));
    controls.addEventListener('change',render);
    controls.addEventListener('start',()=>{cancelAnimationFrame(frame);transition=null;});
    root.querySelector('#s9-reset').addEventListener('click',()=>{
      preset='perspectiva'; syncPicker();
      moveTo(center.clone().addScaledVector(presets.perspectiva.clone().normalize(),defaultDistance()),'Vista inicial');
    });
    fullscreenButton.addEventListener('click',async()=>{
      try {
        if(document.fullscreenElement===root) await document.exitFullscreen();
        else if(root.requestFullscreen) await root.requestFullscreen();
        else status.textContent='Tela cheia indisponível neste navegador.';
      } catch { status.textContent='Tela cheia indisponível neste navegador.'; }
    });
    function fullscreenChanged() {
      const active=document.fullscreenElement===root;
      fullscreenButton.setAttribute('aria-pressed',String(active));
      fullscreenButton.textContent=active?'Sair da tela cheia':'Tela cheia';
      resize();
    }
    document.addEventListener('fullscreenchange',fullscreenChanged);
    renderer.domElement.addEventListener('keydown',(event)=>{
      const actions={ArrowLeft:()=>rotate(-Math.PI/16),ArrowRight:()=>rotate(Math.PI/16),'+':()=>zoom(0.83),'=':()=>zoom(0.83),'-':()=>zoom(1/0.83),Home:()=>root.querySelector('#s9-reset').click()};
      if(actions[event.key]) { event.preventDefault(); actions[event.key](); }
    });
    function resize() {
      const width=stage.clientWidth,height=stage.clientHeight;
      if(width<=0||height<=0) return;
      camera.aspect=width/height; camera.updateProjectionMatrix(); renderer.setSize(width,height,false); render();
    }
    const observer=new ResizeObserver(resize); observer.observe(stage);
    camera.position.copy(center).addScaledVector(presets.perspectiva.clone().normalize(),defaultDistance()); controls.update();
    resize(); loading.hidden=true; if(poster) poster.hidden=true; buttons.forEach(b=>b.disabled=false); picker.disabled=false;
    if(!root.requestFullscreen) fullscreenButton.hidden=true;
    root.setAttribute('aria-busy','false');
    status.textContent='Modelo S9 pronto. Arraste para girar ou use os controles.';
    root.dataset.ready='true';
    // Only render on interaction, a resize, or the brief camera transitions.
    function contextLost(event) {
      event.preventDefault();
      alive=false; cancelAnimationFrame(frame); transition=null;
      root.dataset.ready='false'; root.setAttribute('aria-busy','false');
      renderer.domElement.hidden=true; if(poster) poster.hidden=false;
      loading.hidden=false; loading.setAttribute('role','alert');
      loading.textContent='A visualização 3D foi interrompida. Recarregue a página para tentar novamente.';
      buttons.forEach(b=>b.disabled=b!==fullscreenButton); picker.disabled=true;
    }
    renderer.domElement.addEventListener('webglcontextlost',contextLost);
    function pageShown(event) { if(event.persisted&&alive) { resize(); render(); } }
    window.addEventListener('pageshow',pageShown);
    function pageHidden(event) {
      cancelAnimationFrame(frame); transition=null;
      // Keep the renderer and controls intact when the browser caches this page.
      if(event.persisted) return;
      alive=false; controls.dispose(); observer.disconnect();
      document.removeEventListener('fullscreenchange',fullscreenChanged);
      window.removeEventListener('pageshow',pageShown);
      window.removeEventListener('pagehide',pageHidden);
      const geometries=new Set(), materials=new Set(), textures=new Set();
      scene.traverse(obj=>{
        if(obj.geometry) geometries.add(obj.geometry);
        if(obj.material) for(const mat of Array.isArray(obj.material)?obj.material:[obj.material]) materials.add(mat);
      });
      materials.forEach(mat=>{if(mat.map)textures.add(mat.map);mat.dispose();});
      textures.forEach(texture=>texture.dispose()); geometries.forEach(geometry=>geometry.dispose());
      environment.dispose(); renderer.dispose();
    }
    window.addEventListener('pagehide',pageHidden);
  } catch(error) {
    root.setAttribute('aria-busy','false');
    root.dataset.ready='false';
    stage.querySelector('canvas')?.remove();
    if(poster) poster.hidden=false;
    loading.hidden=false;
    loading.textContent='Não foi possível carregar o modelo 3D. Recarregue a página para tentar novamente ou consulte os desenhos técnicos abaixo.';
    loading.setAttribute('role','alert');
    console.error('S9 3D:',error);
  }
}

// Fetch Three.js and build the S9 only when its section approaches the viewport.
document.querySelectorAll('[data-s9-viewer]').forEach(root=> {
  if('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=> {
      if(entries.some(entry=>entry.isIntersecting)) { observer.disconnect(); void mountS9Viewer(root); }
    },{rootMargin:'300px'});
    observer.observe(root);
  } else void mountS9Viewer(root);
});
