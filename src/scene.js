import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Entire installation is procedural: no network assets or loading dependency.
export function createWorld(canvas, { onHotspot, onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .94;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 80);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .55;
  room.dispose();
  pmrem.dispose();
  const resources = new Set();
  const keep = value => (resources.add(value), value);
  const metal = keep(new THREE.MeshStandardMaterial({ color: 0x77838f, metalness: .95, roughness: .26 }));
  const lightMetal = keep(new THREE.MeshStandardMaterial({ color: 0xb9c5cf, metalness: .92, roughness: .22 }));
  const darkMetal = keep(new THREE.MeshStandardMaterial({ color: 0x20262d, metalness: .9, roughness: .31 }));
  const graphite = keep(new THREE.MeshStandardMaterial({ color: 0x090c10, metalness: .7, roughness: .34 }));
  const amber = keep(new THREE.MeshStandardMaterial({ color: 0x4c50fa, emissive: 0x3438ef, emissiveIntensity: 2.2, metalness: .25, roughness: .3 }));
  const paleAmber = keep(new THREE.MeshBasicMaterial({ color: 0x777aff }));
  const white = keep(new THREE.MeshStandardMaterial({ color: 0xcbd8df, emissive: 0x9db9d6, emissiveIntensity: 1.1 }));
  const beamMaterial = keep(new THREE.MeshBasicMaterial({ color: 0x4c50fa, transparent: true, opacity: .09, side: THREE.DoubleSide, depthWrite: false }));
  const wireMaterial = keep(new THREE.LineBasicMaterial({ color: 0x4c50fa, transparent: true, opacity: .95, depthTest: false }));
  const boxGeometry = keep(new THREE.BoxGeometry(1, 1, 1));
  const cylinderGeometry = keep(new THREE.CylinderGeometry(1, 1, 1, 48));
  function mesh(geometry, material, parent, position = [0, 0, 0], scale = [1, 1, 1]) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position); object.scale.set(...scale); parent.add(object); return object;
  }
  function box(parent, position, scale, material = metal) { return mesh(boxGeometry, material, parent, position, scale); }
  function cylinder(parent, position, radius, height, material = metal) { return mesh(cylinderGeometry, material, parent, position, [radius, height, radius]); }
  function torus(parent, radius, tube, material, z = 0) {
    return mesh(keep(new THREE.TorusGeometry(radius, tube, 10, 160)), material, parent, [0, 0, z]);
  }
  const keyLight = new THREE.DirectionalLight(0xe7f1ff, 3.1); keyLight.position.set(-4, 7, 6); scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xc2c5ed, 2.8); rimLight.position.set(5, 2, -3); scene.add(rimLight);
  const warmLight = new THREE.PointLight(0x4c50fa, 18, 10, 2); warmLight.position.set(1.4, .2, 1); scene.add(warmLight);
  const fill = new THREE.DirectionalLight(0xffffff, .65); fill.position.set(0, -3, 5); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xd6dcf3, 0x20232c, .40));

  const mechanism = new THREE.Group(); scene.add(mechanism);
  const rings = [];
  const dummy = new THREE.Object3D();
  // Extruded, bevelled annular sectors give the rings real machined surfaces.
  function annularSector(inner, outer, angle, depth) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outer, -angle / 2, angle / 2, false);
    shape.absarc(0, 0, inner, angle / 2, -angle / 2, true);
    shape.closePath();
    const geometry = keep(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .025, bevelThickness: .025, curveSegments: 12 }));
    geometry.translate(0, 0, -depth / 2); return geometry;
  }
  function makeRing(radius, width, depth, segments, rotation) {
    const group = new THREE.Group(); mechanism.add(group);
    group.rotation.set(...rotation);
    group.userData.rest = rotation;
    const sector = annularSector(radius - width / 2, radius + width / 2, Math.PI * 2 / segments - .024, depth);
    for (let i = 0; i < segments; i++) {
      const part = mesh(sector, i % 4 === 1 ? lightMetal : metal, group);
      part.rotation.z = i * Math.PI * 2 / segments;
    }
    torus(group, radius, width * .29, darkMetal, -depth * .52);
    torus(group, radius - width * .43, .028, amber, depth * .42);
    torus(group, radius + width * .44, .017, lightMetal, depth * .48);
    torus(group, radius + width * .14, .009, graphite, depth * .55);
    torus(group, radius - width * .06, .009, graphite, depth * .55);
    const boltGeometry = keep(new THREE.CylinderGeometry(.042, .042, .033, 6));
    boltGeometry.rotateX(Math.PI / 2);
    const bolts = new THREE.InstancedMesh(boltGeometry, darkMetal, segments * 4); group.add(bolts);
    for (let i = 0; i < segments * 4; i++) {
      const angle = (i + .5) * Math.PI * 2 / (segments * 4);
      dummy.position.set(Math.cos(angle) * (radius + width * .24), Math.sin(angle) * (radius + width * .24), depth * .57);
      dummy.rotation.set(0, 0, angle); dummy.scale.setScalar(1); dummy.updateMatrix(); bolts.setMatrixAt(i, dummy.matrix);
    }
    const count = segments * 10;
    const teeth = new THREE.InstancedMesh(boxGeometry, darkMetal, count); group.add(teeth);
    for (let i = 0; i < count; i++) {
      const angle = i * Math.PI * 2 / count;
      dummy.position.set(Math.cos(angle) * (radius - width * .5 - .045), Math.sin(angle) * (radius - width * .5 - .045), 0);
      dummy.rotation.set(0, 0, angle); dummy.scale.set(.1, .035, depth * .68); dummy.updateMatrix(); teeth.setMatrixAt(i, dummy.matrix);
    }
    // Four low, heavy hinge clamps interrupt the bright circumference.
    for (let i = 0; i < 4; i++) {
      const angle = i * Math.PI / 2;
      const clamp = new THREE.Group(); clamp.rotation.z = angle; group.add(clamp);
      box(clamp, [radius, 0, 0], [width + .15, .19, depth + .14], darkMetal);
      box(clamp, [radius, 0, depth * .7], [width * .5, .12, .035], metal);
      box(clamp, [radius, 0, depth * .75], [.045, .12, .02], amber);
    }
    rings.push(group); return group;
  }
  makeRing(2.66, .29, .26, 16, [.23, -.40, -.31]);
  makeRing(2.15, .26, .25, 14, [1.05, .26, .36]);
  makeRing(1.65, .25, .25, 12, [.20, 1.05, -.45]);
  makeRing(1.12, .22, .23, 10, [.63, -.48, .16]);
  const core = new THREE.Group(); mechanism.add(core);
  const coreShell = mesh(keep(new THREE.IcosahedronGeometry(.65, 0)), darkMetal, core);
  coreShell.rotation.set(.2, .4, .3);
  const coreEdges = new THREE.LineSegments(keep(new THREE.EdgesGeometry(coreShell.geometry)), keep(new THREE.LineBasicMaterial({ color: 0x6b737b }))); coreShell.add(coreEdges);
  const rotor = cylinder(core, [0, 0, 0], .36, 1.05, metal); rotor.rotation.x = Math.PI / 2;
  const rotorFace = cylinder(core, [0, 0, .55], .3, .055, darkMetal); rotorFace.rotation.x = Math.PI / 2;
  torus(core, .25, .022, amber, .59);
  const center = cylinder(core, [0, 0, .59], .13, .07, lightMetal); center.rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    const spoke = box(core, [Math.cos(angle) * .74, Math.sin(angle) * .74, 0], [.40, .10, .15], metal); spoke.rotation.z = angle;
  }

  // A single connected production line is revealed as the gyroscope opens.
  const production = new THREE.Group(); scene.add(production);
  const track = new THREE.Group(); production.add(track);
  box(track, [-1.15, -.84, 0], [8.65, .18, 1.6], darkMetal);
  box(track, [-1.15, -.71, 0], [8.4, .10, 1.18], graphite);
  box(track, [-1.15, -.68, -.73], [8.7, .035, .055], lightMetal);
  box(track, [-1.15, -.68, .73], [8.7, .035, .055], lightMetal);
  box(track, [-1.15, -.82, .815], [8.45, .025, .022], amber);
  const rollers = new THREE.InstancedMesh(cylinderGeometry, metal, 42); track.add(rollers);
  for (let i = 0; i < 42; i++) {
    dummy.position.set(-5.2 + i * .196, -.64, 0); dummy.rotation.set(Math.PI / 2, 0, 0); dummy.scale.set(.065, 1.25, .065); dummy.updateMatrix(); rollers.setMatrixAt(i, dummy.matrix);
  }
  for (const x of [-4.75, -1.2, 2.45]) {
    for (const z of [-.58, .58]) {
      box(track, [x, -1.32, z], [.17, .88, .17], darkMetal);
      box(track, [x, -1.78, z], [.48, .08, .43], metal);
    }
  }
  const stationIds = ['capture', 'detect', 'review', 'feedback'];
  const stationXs = [-4.4, -2.25, -.1, 2.05];
  const stations = [];
  const clickTargets = [];
  stationXs.forEach((x, i) => {
    const station = new THREE.Group(); station.position.x = x; production.add(station); stations.push(station);
    for (const z of [-.91, .91]) {
      box(station, [0, .14, z], [.14, 1.65, .18], metal);
      box(station, [0, -.63, z], [.43, .12, .4], darkMetal);
    }
    box(station, [0, .98, 0], [.36, .23, 2.05], darkMetal);
    box(station, [.19, .97, 0], [.02, .06, 1.75], i === 1 ? amber : white);
    box(station, [0, .71, 0], [.23, .27, .47], metal);
    const lens = cylinder(station, [0, .55, 0], .09, .12, graphite);
    cylinder(station, [0, .48, 0], .054, .01, i === 1 ? amber : white);
    const hit = box(station, [0, .1, 0], [1.65, 2, 2.2], keep(new THREE.MeshBasicMaterial({ visible: false })));
    hit.userData.hotspot = stationIds[i]; clickTargets.push(hit);
    const unit = new THREE.Group(); unit.position.set(0, -.48, .03); station.add(unit);
    box(unit, [0, -.02, 0], [1.02, .10, .84], darkMetal);
    cylinder(unit, [0, .19, 0], .32, .32, lightMetal);
    cylinder(unit, [0, .36, 0], .2, .06, darkMetal);
    cylinder(unit, [0, .40, 0], .10, .045, metal);
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2;
      cylinder(unit, [Math.cos(a) * .38, .08, Math.sin(a) * .3], .04, .07, metal);
    }
    if (i === 1) {
      const scan = box(station, [0, .04, 0], [.014, 1.2, 1.55], beamMaterial); scan.userData.scanner = true;
    }
    // Small machine-readable panel, built from geometry rather than text sprites.
    box(station, [.0, .45, .99], [.62, .38, .06], graphite);
    for (let k = 0; k < 3; k++) box(station, [-.17 + k * .17, .45, 1.03], [.09, .028 + k * .035, .008], i === 1 ? amber : white);
    lens.userData.station = stationIds[i];
  });
  const defects = [];
  for (let i = 0; i < 4; i++) {
    const bounds = new THREE.LineSegments(keep(new THREE.EdgesGeometry(keep(new THREE.BoxGeometry(.31, .25, .26)))), wireMaterial);
    bounds.position.set(stationXs[i] + .19, -.17, .18); bounds.renderOrder = 20; production.add(bounds); defects.push(bounds);
    const scratch = box(production, [stationXs[i] + .19, -.16, .285], [.13, .012, .035], graphite); scratch.rotation.z = -.48;
  }
  // A subdued floor catches light without making the canvas background opaque.
  const floorMat = keep(new THREE.MeshStandardMaterial({ color: 0x15191d, metalness: .7, roughness: .4, transparent: true, opacity: .65 }));
  box(production, [-1.1, -1.88, -.25], [9.4, .025, 3.2], floorMat);

  let width = 1, height = 1, aspect = 1, disposed = false, activeScene = 0;
  let paused = false, reducedMotion = false, comparison = .5, progress = 0, target = 0;
  let lastTime = 0, elapsed = 0, raf = 0, dirty = true;
  const projected = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  const look = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function resize() {
    const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height); aspect = width / height;
    renderer.setSize(width, height, false); camera.aspect = aspect; camera.updateProjectionMatrix(); dirty = true;
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas); resize();
  function update(delta) {
    const motion = paused || reducedMotion ? 0 : elapsed;
    const smooth = reducedMotion ? 1 : 1 - Math.exp(-delta * 3.1);
    progress = THREE.MathUtils.lerp(progress, target, smooth);
    if (Math.abs(progress - target) < .0005) progress = target;
    const p = progress * progress * (3 - 2 * progress);
    const narrow = aspect < 1.15;
    const distance = narrow ? 14.5 / Math.max(.65, aspect) : 10.9;
    desiredCamera.set(0, THREE.MathUtils.lerp(1.1, 4.0, p), THREE.MathUtils.lerp(distance, narrow ? 17 : 12.4, p));
    camera.position.copy(desiredCamera); look.set(0, THREE.MathUtils.lerp(0, -.05, p), 0); camera.lookAt(look);
    mechanism.position.set(THREE.MathUtils.lerp(narrow ? .3 : 1.65, -3.05, p), THREE.MathUtils.lerp(.10, .14, p), THREE.MathUtils.lerp(0, -.7, p));
    mechanism.scale.setScalar(THREE.MathUtils.lerp(1, .27, p));
    mechanism.rotation.set(Math.sin(motion * .15) * .027, Math.sin(motion * .1) * .04, 0);
    rings.forEach((ring, i) => {
      const r = ring.userData.rest;
      ring.rotation.set(THREE.MathUtils.lerp(r[0], .3 + i * .23, p), THREE.MathUtils.lerp(r[1], .15, p), r[2] + Math.sin(motion * .12 + i) * .035);
      ring.position.z = p * i * .55;
    });
    core.rotation.z = motion * .035;
    production.visible = p > .005;
    production.scale.setScalar(Math.max(.001, p * .77));
    production.position.set(-1.32 * p, (1 - p) * -1.2 - .1 * p, 0);
    stations.forEach((station, i) => { station.position.y = (1 - p) * (-.5 - i * .15); });
    warmLight.position.set(mechanism.position.x, mechanism.position.y, 1.1);
    scene.updateMatrixWorld(); camera.updateMatrixWorld();
    for (const defect of defects) {
      defect.getWorldPosition(projected); projected.project(camera);
      // setComparison is a fraction of the full canvas, matching the DOM divider.
      defect.visible = activeScene === 1 && (projected.x * .5 + .5) < comparison;
    }
    for (const station of stations) {
      const scanner = station.children.find(child => child.userData.scanner);
      if (scanner) scanner.position.x = Math.sin(motion * 1.2) * .48;
    }
  }
  function frame(time) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const delta = Math.min((time - (lastTime || time)) / 1000, .05); lastTime = time;
    if (activeScene > 1 || document.hidden) return;
    if (!paused && !reducedMotion) elapsed += delta;
    if (!dirty && (paused || reducedMotion) && progress === target) return;
    update(delta); renderer.render(scene, camera); dirty = false;
  }
  function click(event) {
    if (activeScene !== 1 || progress < .85) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(clickTargets, false)[0];
    if (hit) onHotspot?.(hit.object.userData.hotspot);
  }
  canvas.addEventListener('click', click);
  update(1); renderer.render(scene, camera); raf = requestAnimationFrame(frame);
  queueMicrotask(() => { if (!disposed) onReady?.(); });
  return {
    setScene(index) { activeScene = Math.max(0, Math.min(3, Number(index) || 0)); target = activeScene === 1 ? 1 : 0; dirty = true; },
    setComparison(value) { comparison = THREE.MathUtils.clamp(Number(value) || 0, 0, 1); dirty = true; },
    setPaused(value) { paused = Boolean(value); dirty = true; },
    setReducedMotion(value) { reducedMotion = Boolean(value); if (reducedMotion) progress = target; dirty = true; },
    dispose() {
      if (disposed) return; disposed = true; cancelAnimationFrame(raf); resizeObserver.disconnect(); canvas.removeEventListener('click', click);
      for (const resource of resources) resource.dispose();
      environment.dispose(); renderer.dispose();
    },
  };
}



