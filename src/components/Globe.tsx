import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import Graticule from './Graticule';
import CountryLines from './CountryLines';
import CountryFill from './CountryFill';
import { latLonToVec3 } from '../lib/geo';

const RADIUS = 1;
const IDLE_MS = 1500;
const CAMERA_DISTANCE = 3.6;

export interface GlobeMarker {
    id: string;
    lat: number;
    lon: number;
}

export interface ProjectedMarker {
    x: number;
    y: number;
    visible: boolean;
}

interface GlobeProps {
    markers?: GlobeMarker[];
    selectedId?: string | null;
    onMarkerClick?: (id: string) => void;
    /** Updated each frame with the screen position of the selected marker. */
    projectedRef?: React.MutableRefObject<ProjectedMarker | null>;
}

/** A thin ring that always faces the camera, drawing the globe's silhouette outline. */
function GlobeOutline({ radius, color = '#3a3a35' }: { radius: number; color?: string }) {
    const { camera } = useThree();

    const lineObject = useMemo(() => {
        const segments = 256;
        const positions = new Float32Array((segments + 1) * 3);
        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            positions[i * 3] = Math.cos(t) * radius;
            positions[i * 3 + 1] = Math.sin(t) * radius;
            positions[i * 3 + 2] = 0;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.85,
        });
        return new THREE.Line(g, mat);
    }, [radius, color]);

    useFrame(() => {
        lineObject.quaternion.copy(camera.quaternion);
    });

    return <primitive object={lineObject} />;
}

/** Darker great circle at latitude 0. */
function Equator({ radius, color = '#a1a1a1' }: { radius: number; color?: string }) {
    const geometry = useMemo(() => {
        const segments = 360;
        const positions: number[] = [];
        for (let i = 0; i < segments; i++) {
            const lon1 = -180 + (i / segments) * 360;
            const lon2 = -180 + ((i + 1) / segments) * 360;
            const a = latLonToVec3(0, lon1, radius);
            const b = latLonToVec3(0, lon2, radius);
            positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return g;
    }, [radius]);

    return (
        <lineSegments geometry={geometry}>
            <lineBasicMaterial color={color} transparent opacity={0.75} depthWrite={false} />
        </lineSegments>
    );
}

/** Soft, flat dots at each pole that fade out at the edges (radial gradient sprite). */
function PoleDots({ radius, color = '#3a3a35' }: { radius: number; color?: string }) {
    const texture = useMemo(() => {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const c = new THREE.Color(color);
        const r = Math.round(c.r * 255);
        const g = Math.round(c.g * 255);
        const b = Math.round(c.b * 255);
        const gradient = ctx.createRadialGradient(
            size / 2, size / 2, 0,
            size / 2, size / 2, size / 2,
        );
        gradient.addColorStop(0.0, `rgba(${r},${g},${b},0.8)`);
        gradient.addColorStop(0.45, `rgba(${r},${g},${b},0.44)`);
        gradient.addColorStop(1.0, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, [color]);

    const dotScale = radius * 0.01;

    return (
        <>
            {/* North pole: circle tangent to the sphere, lying flat on the surface. */}
            <mesh position={[0, radius * 1.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[dotScale, 48]} />
                <meshBasicMaterial map={texture} transparent depthWrite={false} />
            </mesh>
            {/* South pole. */}
            <mesh position={[0, -radius * 1.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[dotScale, 48]} />
                <meshBasicMaterial map={texture} transparent depthWrite={false} />
            </mesh>
        </>
    );
}

/** Cartographic marker texture: crisp inked dot + thin ring on transparent paper. */
function makeMarkerTexture(opts: { ringOnly?: boolean } = {}) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;
    const ink = '#2a2a25';

    if (!opts.ringOnly) {
        // Solid filled dot, ~30% of texture radius.
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = ink;
        ctx.fill();
    }

    // Thin outer ring, ~46% radius, like a hand-drawn map marker.
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
    ctx.strokeStyle = ink;
    ctx.lineWidth = opts.ringOnly ? 2.5 : 2;
    ctx.globalAlpha = opts.ringOnly ? 1 : 0.85;
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
}

interface MarkersProps {
    radius: number;
    markers: GlobeMarker[];
    selectedId: string | null;
    onMarkerClick?: (id: string) => void;
}

function Markers({ radius, markers, selectedId, onMarkerClick }: MarkersProps) {
    const baseTex = useMemo(() => makeMarkerTexture(), []);
    const selectedTex = useMemo(() => makeMarkerTexture(), []);
    const pulseTex = useMemo(() => makeMarkerTexture({ ringOnly: true }), []);
    const pulseRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (pulseRef.current) {
            const t = state.clock.elapsedTime;
            // Slow pulse that expands and fades.
            const phase = (t * 0.9) % 1;
            const s = 1 + phase * 1.4;
            pulseRef.current.scale.set(s, s, 1);
            const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.55 * (1 - phase);
        }
    });

    const baseSize = radius * 0.022;
    const selected = markers.find(m => m.id === selectedId) ?? null;

    return (
        <>
            {markers.map((m) => {
                const pos = latLonToVec3(m.lat, m.lon, radius);
                const normal = pos.clone().normalize();
                const quat = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    normal,
                );
                const isSelected = m.id === selectedId;
                const size = baseSize * (isSelected ? 1.4 : 1);
                return (
                    <mesh
                        key={m.id}
                        position={pos}
                        quaternion={quat}
                        renderOrder={2}
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkerClick?.(m.id);
                        }}
                        onPointerOver={(e) => {
                            e.stopPropagation();
                            document.body.style.cursor = 'pointer';
                        }}
                        onPointerOut={() => {
                            document.body.style.cursor = '';
                        }}
                    >
                        <planeGeometry args={[size * 2, size * 2]} />
                        <meshBasicMaterial
                            map={isSelected ? selectedTex : baseTex}
                            transparent
                            depthWrite={false}
                            depthTest={false}
                        />
                    </mesh>
                );
            })}
            {selected && (() => {
                const pos = latLonToVec3(selected.lat, selected.lon, radius * 1.002);
                const normal = pos.clone().normalize();
                const quat = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    normal,
                );
                const size = baseSize * 1.4;
                return (
                    <mesh
                        ref={pulseRef}
                        position={pos}
                        quaternion={quat}
                        renderOrder={3}
                    >
                        <planeGeometry args={[size * 2, size * 2]} />
                        <meshBasicMaterial
                            map={pulseTex}
                            transparent
                            depthWrite={false}
                            depthTest={false}
                            opacity={0.5}
                        />
                    </mesh>
                );
            })()}
        </>
    );
}

interface CameraControllerProps {
    controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
    target: THREE.Vector3 | null;
    idleTimerRef: React.MutableRefObject<number | null>;
}

function CameraController({ controlsRef, target, idleTimerRef }: CameraControllerProps) {
    const { camera } = useThree();
    const targetRef = useRef<THREE.Vector3 | null>(null);

    useEffect(() => {
        targetRef.current = target ? target.clone() : null;
        if (target && controlsRef.current) {
            // Suppress auto-rotation while flying to a location.
            controlsRef.current.autoRotate = false;
            if (idleTimerRef.current !== null) {
                window.clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
        }
    }, [target, controlsRef, idleTimerRef]);

    useFrame(() => {
        const t = targetRef.current;
        if (!t) return;
        const distance = camera.position.distanceTo(t);
        if (distance < 0.002) {
            camera.position.copy(t);
            targetRef.current = null;
            return;
        }
        // Slerp the camera along a great-circle arc around the origin so it
        // never tunnels through the globe when flying between antipodal points.
        const from = camera.position;
        const fromLen = from.length();
        const toLen = t.length();
        const fromDir = from.clone().normalize();
        const toDir = t.clone().normalize();
        const dot = THREE.MathUtils.clamp(fromDir.dot(toDir), -1, 1);
        const angle = Math.acos(dot);
        const alpha = 0.08;

        if (angle < 1e-4) {
            // Same direction — just lerp the radius.
            const r = THREE.MathUtils.lerp(fromLen, toLen, alpha);
            from.copy(fromDir).multiplyScalar(r);
        } else {
            const sinA = Math.sin(angle);
            const targetR = THREE.MathUtils.lerp(fromLen, toLen, alpha);
            const a = Math.sin((1 - alpha) * angle) / sinA;
            const b = Math.sin(alpha * angle) / sinA;
            from.copy(fromDir).multiplyScalar(a).addScaledVector(toDir, b).normalize().multiplyScalar(targetR);
        }
        camera.lookAt(0, 0, 0);
        controlsRef.current?.update();
    });

    return null;
}

interface MarkerProjectorProps {
    position: THREE.Vector3 | null;
    projectedRef?: React.MutableRefObject<ProjectedMarker | null>;
}

function MarkerProjector({ position, projectedRef }: MarkerProjectorProps) {
    const { camera, size, gl } = useThree();
    const tmp = useRef(new THREE.Vector3());
    const cameraForward = useRef(new THREE.Vector3());

    useFrame(() => {
        if (!projectedRef) return;
        if (!position) {
            projectedRef.current = null;
            return;
        }
        // Determine if marker faces the camera (front of sphere).
        camera.getWorldDirection(cameraForward.current);
        const toMarker = tmp.current.copy(position).normalize();
        const facing = toMarker.dot(cameraForward.current) < -0.05;

        tmp.current.copy(position).project(camera);
        const canvasRect = gl.domElement.getBoundingClientRect();
        const x = canvasRect.left + (tmp.current.x * 0.5 + 0.5) * size.width;
        const y = canvasRect.top + (-tmp.current.y * 0.5 + 0.5) * size.height;
        projectedRef.current = { x, y, visible: facing };
    });

    return null;
}

function Scene({ markers, selectedId, onMarkerClick, projectedRef }: GlobeProps) {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const idleTimer = useRef<number | null>(null);
    const selectedMarker = useMemo(() => {
        if (!selectedId || !markers) return null;
        return markers.find(x => x.id === selectedId) ?? null;
    }, [selectedId, markers]);
    const selectedTarget = useMemo(() => {
        if (!selectedMarker) return null;
        return latLonToVec3(selectedMarker.lat, selectedMarker.lon, CAMERA_DISTANCE);
    }, [selectedMarker]);

    const markerWorldPos = useMemo(() => {
        if (!selectedMarker) return null;
        return latLonToVec3(selectedMarker.lat, selectedMarker.lon, RADIUS * 1.003);
    }, [selectedMarker]);

    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;

        const onStart = () => {
            if (idleTimer.current !== null) {
                window.clearTimeout(idleTimer.current);
                idleTimer.current = null;
            }
            controls.autoRotate = false;
        };

        const onEnd = () => {
            if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
            idleTimer.current = window.setTimeout(() => {
                controls.autoRotate = true;
            }, IDLE_MS);
        };

        controls.addEventListener('start', onStart);
        controls.addEventListener('end', onEnd);
        return () => {
            controls.removeEventListener('start', onStart);
            controls.removeEventListener('end', onEnd);
            if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
        };
    }, []);

    return (
        <>
            {/* Solid sphere matching the paper background. Hides back-side lines. */}
            <mesh>
                <sphereGeometry args={[RADIUS * 0.998, 64, 64]} />
                <meshBasicMaterial color="#e8e6dc" />
            </mesh>

            <Graticule radius={RADIUS} />
            <Equator radius={RADIUS * 1.0005} />
            <CountryFill
                radius={RADIUS * 1.0008}
                lat={selectedMarker?.lat ?? null}
                lon={selectedMarker?.lon ?? null}
            />
            <CountryLines radius={RADIUS * 1.001} />
            <PoleDots radius={RADIUS * 1.002} />

            <GlobeOutline radius={RADIUS} />
            <GlobeOutline radius={RADIUS * 1.06} color="#919191" />

            {markers && (
                <Markers
                    radius={RADIUS * 1.003}
                    markers={markers}
                    selectedId={selectedId ?? null}
                    onMarkerClick={onMarkerClick}
                />
            )}

            <CameraController
                controlsRef={controlsRef}
                target={selectedTarget}
                idleTimerRef={idleTimer}
            />

            <MarkerProjector position={markerWorldPos} projectedRef={projectedRef} />

            <OrbitControls
                ref={controlsRef}
                enableZoom={false}
                enablePan={false}
                rotateSpeed={0.5}
                autoRotate
                autoRotateSpeed={0.35}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
            />
        </>
    );
}

export default function Globe({ markers, selectedId, onMarkerClick, projectedRef }: GlobeProps) {
    return (
        <Canvas
            camera={{ position: [0, 0, 3.6], fov: 38 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            flat
        >
            <Scene
                markers={markers}
                selectedId={selectedId}
                onMarkerClick={onMarkerClick}
                projectedRef={projectedRef}
            />
        </Canvas>
    );
}
