"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERT = /* glsl */`
  uniform vec2  uMouse;
  uniform float uTime;
  attribute float aSize;
  attribute vec3  aColor;
  varying   vec3  vColor;
  varying   float vAlpha;

  void main() {
    vColor = aColor;
    vec3 pos = position;

    // Mouse repulsion (spring physics feel)
    vec2  toMouse = pos.xy - uMouse;
    float dist    = length(toMouse);
    float repel   = smoothstep(0.6, 0.0, dist) * 0.2;
    pos.xy += normalize(toMouse + vec2(0.001)) * repel;

    // Idle float
    pos.y += sin(uTime * 0.5 + pos.x * 3.0) * 0.008;
    pos.x += cos(uTime * 0.3 + pos.y * 2.5) * 0.005;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (200.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;

    vAlpha = 0.7 - length(pos.xy) * 0.09;
  }
`;

const FRAG = /* glsl */`
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

export function WebGLHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 4;

    // ── Particles (max 3000 as specified) ─────────────────────────────────
    const N = 3000;
    const geo = new THREE.BufferGeometry();

    const positions = new Float32Array(N * 3);
    const sizes     = new Float32Array(N);
    const colors    = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      // Scatter in a sphere with slight disc flattening
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.5 + Math.random() * 1.2;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

      sizes[i] = 0.8 + Math.random() * 2.0;

      const t = Math.random();
      if (t < 0.70) {
        // Monad purple #6E54FF
        colors[i*3]=0.43; colors[i*3+1]=0.33; colors[i*3+2]=1.0;
      } else if (t < 0.88) {
        // Cyan #85E6FF
        colors[i*3]=0.52; colors[i*3+1]=0.90; colors[i*3+2]=1.0;
      } else {
        // Light purple #DDD7FE
        colors[i*3]=0.87; colors[i*3+1]=0.84; colors[i*3+2]=1.0;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aColor",   new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:  { value: 0 },
        uMouse: { value: new THREE.Vector2(99, 99) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ── Mouse ────────────────────────────────────────────────────────────────
    const mouse = { x: 99, y: 99, tx: 99, ty: 99 };
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 5;
      mouse.ty = -((e.clientY - rect.top)  / rect.height - 0.5) * 3;
    };
    canvas.addEventListener("mousemove", onMouse);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    };
    window.addEventListener("resize", onResize);

    // ── Loop ─────────────────────────────────────────────────────────────────
    let raf: number;
    let t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.012;

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      mat.uniforms.uTime.value  = t;
      mat.uniforms.uMouse.value.set(mouse.x, mouse.y);

      points.rotation.y = t * 0.035;
      points.rotation.x = Math.sin(t * 0.018) * 0.08;

      camera.position.x += (mouse.x * 0.04 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * 0.03 - camera.position.y) * 0.03;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose(); geo.dispose(); mat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
