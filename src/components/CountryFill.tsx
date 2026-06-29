import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import { geoContains, geoEquirectangular, geoPath } from 'd3-geo';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import worldTopo from 'world-atlas/countries-110m.json';

interface CountryFillProps {
    radius: number;
    lat: number | null;
    lon: number | null;
    color?: string;
    opacity?: number;
}

let cachedFeatures: Feature<Polygon | MultiPolygon>[] | null = null;
function getFeatures() {
    if (cachedFeatures) return cachedFeatures;
    const topo = worldTopo as unknown as Topology<{ countries: GeometryCollection }>;
    const collection = feature(topo, topo.objects.countries) as unknown as {
        features: Feature<Polygon | MultiPolygon>[];
    };
    cachedFeatures = collection.features;
    return cachedFeatures;
}

const TEX_WIDTH = 2048;
const TEX_HEIGHT = 1024;

export default function CountryFill({
    radius,
    lat,
    lon,
    color = '#3a3a35',
    opacity = 0.22,
}: CountryFillProps) {
    const texture = useMemo(() => {
        if (lat == null || lon == null) return null;
        const features = getFeatures();
        const country = features.find((f) => geoContains(f, [lon, lat]));
        if (!country) return null;

        const canvas = document.createElement('canvas');
        canvas.width = TEX_WIDTH;
        canvas.height = TEX_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Equirectangular projection mapping [-180,180] x [-90,90] -> [0,W] x [0,H].
        const projection = geoEquirectangular()
            .scale(TEX_WIDTH / (2 * Math.PI))
            .translate([TEX_WIDTH / 2, TEX_HEIGHT / 2])
            .precision(0.1);
        const path = geoPath(projection, ctx);

        ctx.clearRect(0, 0, TEX_WIDTH, TEX_HEIGHT);
        ctx.fillStyle = color;
        ctx.beginPath();
        path(country);
        ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        return tex;
    }, [lat, lon, color]);

    useEffect(() => {
        return () => {
            texture?.dispose();
        };
    }, [texture]);

    if (!texture) return null;

    // Three.js SphereGeometry default UVs map:
    //   u=0   -> -X axis   (lon = ±180)
    //   u=0.5 -> +X axis   (lon = 0)
    //   u=0.25 -> +Z axis  (lon = -90)
    //   u=0.75 -> -Z axis  (lon = +90)
    // Our latLonToVec3 puts lon=0 at +X, lon=-90 at +Z, lon=180 at -X — exactly
    // matching the equirectangular texture above. No rotation needed.
    return (
        <mesh renderOrder={1}>
            <sphereGeometry args={[radius, 128, 64]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={opacity}
                depthWrite={false}
                side={THREE.FrontSide}
            />
        </mesh>
    );
}


