"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// The Monad logomark is an eye/lens shape — we sample points along its boundary
// to create a particle constellation that morphs between shapes
function monadLogoPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const cx = 90.5358, cy = 91.76, r = 90.5;

  for (let i = 0; i < count; i++) {
    const t = Math.random();
    let x: number, y: number;

    // Blend between outer circle and inner lens shape
    const which = Math.random();
    if (which < 0.45) {
      // Outer ellipse
      const angle = Math.random() * Math.PI * 2;
      const radius = r * (0.85 + Math.random() * 0.15);
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
    } else if (which < 0.75) {
      // Inner lens (the cutout ellipse — rotated)
      const angle = Math.random() * Math.PI * 2;
      const a = 52, b = 34;
      const rot = -0.45;
      const ox = Math.cos(angle) * a;
      const oy = Math.sin(angle) * b;
      x = ox * Math.cos(rot) - oy * Math.sin(rot) + 14;
      y = ox * Math.sin(rot) + oy * Math.cos(rot) + 7;
    } else {
      // Random fill inside the outer shape
      const angle = Math.random() * Math.PI * 2;
      const radius = r * Math.sqrt(Math.random());
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
    }

    positions[i * 3] = x * 0.022;
    positions[i * 3 + 1] = y * 0.022;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
  }
  return positions;
}

function spherePoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.8 + Math.random() * 0.4;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

const VERT = `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec3 pos = position;

    // Mouse repulsion
    vec2 toMouse = pos.xy - uMouse;
    float dist = length(toMouse);
    float repel = smoothstep(0.8, 0.0, dist) * 0.18;
    pos.xy += normalize(toMouse) * repel;

    // Subtle drift
    pos.x += sin(uTime * 0.3 + position.y * 2.0) * 0.012;
    pos.y += cos(uTime * 0.25 + position.x * 1.5) * 0.012;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (280.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    float distFromCenter = length(pos.xy);
    vAlpha = 0.6 - distFromCenter * 0.12;
  }
`;

const FRAG = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Background shader — flowing purple nebula
const BG_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BG_FRAG = `
  uniform float uTime;
  varying vec2 vUv;

  vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                  dot(p, vec2(269.5, 183.3)),
                  dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = dot(hash3(i).xy, f - vec2(0,0));
    float b = dot(hash3(i + vec2(1,0)).xy, f - vec2(1,0));
    float c = dot(hash3(i + vec2(0,1)).xy, f - vec2(0,1));
    float d = dot(hash3(i + vec2(1,1)).xy, f - vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.06;

    vec2 q = vec2(fbm(uv + t * 0.3), fbm(uv + vec2(1.0)));
    vec2 r = vec2(fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t),
                  fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t));
    float f = fbm(uv + r);

    // Monad purple palette
    vec3 c1 = vec3(0.055, 0.035, 0.11);   // deep #0E091C
    vec3 c2 = vec3(0.18, 0.10, 0.42);     // mid purple
    vec3 c3 = vec3(0.43, 0.33, 1.0);      // #6E54FF
    vec3 c4 = vec3(0.52, 0.90, 1.0);      // #85E6FF hint

    vec3 col = mix(c1, c2, clamp(f * f * 4.0, 0.0, 1.0));
    col = mix(col, c3, clamp(length(q), 0.0, 1.0) * 0.45);
    col = mix(col, c4, clamp(length(r.x), 0.0, 1.0) * 0.08);

    // Vignette
    float vig = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.6);
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ─── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 3.5;

    // ─── Background plane (shader) ─────────────────────────────────────────
    const bgGeo = new THREE.PlaneGeometry(2, 2);
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      uniforms: { uTime: { value: 0 } },
      depthWrite: false,
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = -2;
    bgMesh.scale.set(8, 5, 1);
    scene.add(bgMesh);

    // ─── Particles ─────────────────────────────────────────────────────────
    const N = 4800;
    const geo = new THREE.BufferGeometry();

    const positions = monadLogoPoints(N);
    const sizes = new Float32Array(N);
    const colors = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      sizes[i] = 0.8 + Math.random() * 2.2;
      // Color: purple core, cyan accent
      const t = Math.random();
      if (t < 0.65) {
        // Purple #6E54FF
        colors[i * 3] = 0.43 + Math.random() * 0.15;
        colors[i * 3 + 1] = 0.33 + Math.random() * 0.1;
        colors[i * 3 + 2] = 1.0;
      } else if (t < 0.85) {
        // Cyan #85E6FF
        colors[i * 3] = 0.52;
        colors[i * 3 + 1] = 0.90;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Pink hint
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.56;
        colors[i * 3 + 2] = 0.89;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Second particle layer — sparser, larger, slower
    const N2 = 600;
    const geo2 = new THREE.BufferGeometry();
    const pos2 = spherePoints(N2);
    const col2 = new Float32Array(N2 * 3);
    const siz2 = new Float32Array(N2);
    for (let i = 0; i < N2; i++) {
      col2[i * 3] = 0.43; col2[i * 3 + 1] = 0.33; col2[i * 3 + 2] = 1.0;
      siz2[i] = 0.4 + Math.random() * 1.0;
    }
    geo2.setAttribute("position", new THREE.BufferAttribute(pos2, 3));
    geo2.setAttribute("aColor", new THREE.BufferAttribute(col2, 3));
    geo2.setAttribute("aSize", new THREE.BufferAttribute(siz2, 1));
    const points2 = new THREE.Points(geo2, mat.clone());
    points2.rotation.x = 0.3;
    scene.add(points2);

    // ─── Mouse ─────────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 3;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 3;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ─── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ─── Animation loop ────────────────────────────────────────────────────
    let raf: number;
    let clock = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      clock += 0.016;

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      mat.uniforms.uTime.value = clock;
      mat.uniforms.uMouse.value.set(mouse.x, mouse.y);
      bgMat.uniforms.uTime.value = clock;

      // Slow rotation
      points.rotation.y = clock * 0.04;
      points.rotation.x = Math.sin(clock * 0.02) * 0.1;
      points2.rotation.y = -clock * 0.025;
      points2.rotation.x = Math.cos(clock * 0.018) * 0.15;

      // Camera parallax
      camera.position.x += (mouse.x * 0.06 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.04 - camera.position.y) * 0.05;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      geo2.dispose();
      mat.dispose();
      bgMat.dispose();
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
