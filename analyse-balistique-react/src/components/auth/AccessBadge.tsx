/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import { TvStatic } from '../transitions/TvStatic';
import './AccessBadge.css';

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * Creates a canvas texture for the badge card face.
 * Draws "ACCES AUTORISE" text + crosshair/target logo.
 */
function createCardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  // Background - dark military green
  ctx.fillStyle = '#020d04';
  ctx.fillRect(0, 0, 512, 720);

  // Border
  ctx.strokeStyle = '#00ff41';
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, 488, 696);

  // Inner border
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, 472, 680);

  // Top bar
  ctx.fillStyle = 'rgba(0, 255, 65, 0.1)';
  ctx.fillRect(20, 20, 472, 50);
  ctx.fillStyle = '#00ff41';
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('S.A.G. — BADGE SÉCURISÉ', 256, 52);

  // Crosshair / Target logo
  const cx = 256;
  const cy = 250;
  const r = 80;

  ctx.strokeStyle = '#00ff41';
  ctx.lineWidth = 2.5;

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Middle circle
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = '#00ff41';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Crosshair lines
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r - 15, cy);
  ctx.lineTo(cx - r * 0.25 - 5, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.25 + 5, cy);
  ctx.lineTo(cx + r + 15, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r - 15);
  ctx.lineTo(cx, cy - r * 0.25 - 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.25 + 5);
  ctx.lineTo(cx, cy + r + 15);
  ctx.stroke();

  // Corner ticks on the outer circle
  const tickLen = 12;
  for (let angle = 0; angle < 360; angle += 45) {
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + Math.cos(rad) * (r - tickLen);
    const y1 = cy + Math.sin(rad) * (r - tickLen);
    const x2 = cx + Math.cos(rad) * (r + tickLen);
    const y2 = cy + Math.sin(rad) * (r + tickLen);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Divider line
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 370);
  ctx.lineTo(452, 370);
  ctx.stroke();

  // Main text: ACCÈS AUTORISÉ
  ctx.fillStyle = '#00ff41';
  ctx.font = 'bold 42px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 255, 65, 0.6)';
  ctx.shadowBlur = 15;
  ctx.fillText('ACCÈS', 256, 430);
  ctx.fillText('AUTORISÉ', 256, 480);
  ctx.shadowBlur = 0;

  // Divider line 2
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
  ctx.beginPath();
  ctx.moveTo(60, 510);
  ctx.lineTo(452, 510);
  ctx.stroke();

  // Sub text
  ctx.fillStyle = 'rgba(0, 255, 65, 0.5)';
  ctx.font = '16px "Courier New", monospace';
  ctx.fillText('NIVEAU: OPÉRATEUR', 256, 550);
  ctx.fillText("SYSTÈME D'ANALYSE DE GERBE", 256, 580);

  // Bottom serial
  ctx.fillStyle = 'rgba(0, 255, 65, 0.25)';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('ID: SAG-2025-0042 // CONFIDENTIEL', 256, 660);

  // Scanlines overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let y = 0; y < 720; y += 3) {
    ctx.fillRect(0, y, 512, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a canvas texture for the lanyard band.
 */
function createLanyardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Dark green band
  ctx.fillStyle = '#031a06';
  ctx.fillRect(0, 0, 512, 64);

  // Repeating pattern
  ctx.fillStyle = 'rgba(0, 255, 65, 0.15)';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = 'center';
  for (let x = 0; x < 512; x += 120) {
    ctx.fillText('S.A.G.', x + 60, 36);
  }

  // Edge lines
  ctx.fillStyle = '#00ff41';
  ctx.fillRect(0, 0, 512, 2);
  ctx.fillRect(0, 62, 512, 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }: BandProps) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type: 'dynamic' as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  const cardTexture = useMemo(() => createCardTexture(), []);
  const lanyardTexture = useMemo(() => createLanyardTexture(), []);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - (dragged as THREE.Vector3).x,
        y: vec.y - (dragged as THREE.Vector3).y,
        z: vec.z - (dragged as THREE.Vector3).z,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped!);
      curve.points[2].copy(j1.current.lerped!);
      curve.points[3].copy(fixed.current.translation());

      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, 0.26, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              );
            }}
          >
            {/* Card body - front */}
            <mesh>
              <boxGeometry args={[0.71, 1, 0.01]} />
              <meshPhysicalMaterial
                map={cardTexture}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
            {/* Clip */}
            <mesh position={[0, 0.55, 0]}>
              <boxGeometry args={[0.13, 0.12, 0.03]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Clip ring */}
            <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.04, 0.015, 8, 16]} />
              <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        {/* @ts-expect-error meshline JSX */}
        <meshLineGeometry />
        {/* @ts-expect-error meshline JSX */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={lanyardTexture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

function SceneSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.setClearColor(new THREE.Color(0x010a01), 1);
  }, [gl]);
  return null;
}

interface AccessBadgeProps {
  onComplete: () => void;
}

export default function AccessBadge({ onComplete }: AccessBadgeProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const [showButton, setShowButton] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show the continue button after the badge has dropped
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = useCallback(() => {
    setTransitioning(true);
  }, []);

  return (
    <div className="access-badge-overlay">
      <Canvas camera={{ position: [0, 0, 20], fov: 20 }} dpr={[1, isMobile ? 1.5 : 2]}>
        <SceneSetup />
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
      <div className="access-badge-status">
        <div className="access-badge-status-text">Accès autorisé</div>
        {showButton && (
          <button className="access-badge-button" onClick={handleContinue}>
            CONTINUER VERS LE TABLEAU DE BORD
          </button>
        )}
      </div>
      <TvStatic active={transitioning} onComplete={onComplete} duration={600} />
    </div>
  );
}
