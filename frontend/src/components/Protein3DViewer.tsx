import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, RotateCcw, Eye, Zap, ZoomIn, ZoomOut, Play, Pause } from 'lucide-react';
import { SimulationResult } from '../types';

interface Protein3DViewerProps {
  result: SimulationResult | null;
}

// Amino acid color scheme
const AA_COLORS: Record<string, number> = {
  // Hydrophobic -> Warm Amber / Orange
  A: 0xf59e0b, I: 0xf59e0b, L: 0xf59e0b, M: 0xf59e0b, F: 0xd97706, W: 0xd97706, V: 0xf59e0b, P: 0x3b82f6,
  // Polar -> Bright Cyan
  S: 0x06b6d4, T: 0x06b6d4, C: 0x06b6d4, Y: 0x06b6d4, N: 0x06b6d4, Q: 0x06b6d4,
  // Charged Positive -> Indigo / Violet
  R: 0x8b5cf6, K: 0x8b5cf6, H: 0x8b5cf6,
  // Charged Negative -> Rose / Red
  D: 0xf43f5e, E: 0xf43f5e,
  // Special -> Emerald / Blue
  G: 0x10b981
};

export const Protein3DViewer: React.FC<Protein3DViewerProps> = ({ result }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showContacts, setShowContacts] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.8);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // 5. Container group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Mouse drag rotation controls
    const domElem = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !groupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      groupRef.current.rotation.y += deltaX * 0.01;
      groupRef.current.rotation.x += deltaY * 0.01;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      e.preventDefault();
      cameraRef.current.position.z += e.deltaY * 0.01;
      cameraRef.current.position.z = THREE.MathUtils.clamp(cameraRef.current.position.z, 5, 40);
    };

    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    // Render animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (groupRef.current && autoRotate && !isDraggingRef.current) {
        groupRef.current.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 450;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // Update 3D model geometry whenever result, showLabels, or showContacts changes
  useEffect(() => {
    if (!groupRef.current || !result || !result.coordinates) return;

    const group = groupRef.current;
    // Clear previous mesh objects
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const coords = result.coordinates;
    const sequence = result.sequence;
    const n = coords.length;

    // Center coordinates
    const center = new THREE.Vector3();
    coords.forEach(c => center.add(new THREE.Vector3(c[0], c[1], c[2])));
    center.divideScalar(n);

    // 1. Render Amino Acid Spheres
    coords.forEach((c, idx) => {
      const pos = new THREE.Vector3(c[0] - center.x, c[1] - center.y, c[2] - center.z);
      const aaCode = sequence[idx] || 'A';
      const color = AA_COLORS[aaCode] || 0x06b6d4;

      const geometry = new THREE.SphereGeometry(0.45, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.2,
        emissive: color,
        emissiveIntensity: 0.15
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(pos);
      group.add(sphere);

      // Render Text Sprite Labels if enabled
      if (showLabels) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#050811';
          ctx.beginPath();
          ctx.roundRect(10, 10, 108, 44, 10);
          ctx.fill();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${idx + 1}-${aaCode}`, 64, 32);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(pos.x, pos.y + 0.8, pos.z);
        sprite.scale.set(1.4, 0.7, 1);
        group.add(sprite);
      }
    });

    // 2. Render Backbone Bond Cylinders
    for (let i = 0; i < n - 1; i++) {
      const p1 = new THREE.Vector3(coords[i][0] - center.x, coords[i][1] - center.y, coords[i][2] - center.z);
      const p2 = new THREE.Vector3(coords[i+1][0] - center.x, coords[i+1][1] - center.y, coords[i+1][2] - center.z);

      const distance = p1.distanceTo(p2);
      const cylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, distance, 16);
      const cylinderMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.4,
        metalness: 0.5
      });
      const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);

      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      cylinder.position.copy(midPoint);

      const orientation = new THREE.Matrix4();
      orientation.lookAt(p2, p1, new THREE.Vector3(0, 1, 0));
      cylinder.quaternion.setFromRotationMatrix(orientation);
      cylinder.rotateX(Math.PI / 2);

      group.add(cylinder);
    }

    // 3. Render Interaction Dashed Lines if enabled
    if (showContacts && result.contacts) {
      result.contacts.forEach(contact => {
        const c1 = contact.pos1;
        const c2 = contact.pos2;
        const p1 = new THREE.Vector3(c1[0] - center.x, c1[1] - center.y, c1[2] - center.z);
        const p2 = new THREE.Vector3(c2[0] - center.x, c2[1] - center.y, c2[2] - center.z);

        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMat = new THREE.LineDashedMaterial({
          color: 0xf59e0b,
          dashSize: 0.2,
          gapSize: 0.1,
          linewidth: 2
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        group.add(line);
      });
    }

  }, [result, showLabels, showContacts]);

  const resetCamera = () => {
    if (cameraRef.current && groupRef.current) {
      cameraRef.current.position.set(0, 0, 15);
      groupRef.current.rotation.set(0, 0, 0);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(5, cameraRef.current.position.z - 2);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(40, cameraRef.current.position.z + 2);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 space-y-4 border border-cyan-500/20 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-pink-950 text-pink-400 border border-pink-500/30">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">3D Protein Structure Viewer</h3>
            <p className="text-xs text-slate-400">Interactive 3D lattice conformation & non-bonded contact topology</p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 font-mono-code text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Hydrophobic</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Polar</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Charged</span>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative w-full h-[450px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Controls Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all ${
                autoRotate ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
              }`}
              title="Toggle Auto Rotate"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoRotate ? 'Pause' : 'Rotate'}</span>
            </button>

            <button
              onClick={resetCamera}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={zoomIn}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={zoomOut}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-code flex items-center gap-1.5 transition-all ${
                showLabels ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Labels</span>
            </button>

            <button
              onClick={() => setShowContacts(!showContacts)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-code flex items-center gap-1.5 transition-all ${
                showContacts ? 'bg-amber-950 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Contacts ({result?.contacts?.length ?? 0})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
