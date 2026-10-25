import * as THREE from 'three';

// A procedural square grid needs no texture, copied mesh, or postprocessing buffers.
export function libraryHologramMaterial(glass = false) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { hologramOpacity: { value: glass ? 0.16 : 1 }, gridColor: { value: new THREE.Color(0x1c8f50) } },
    ]),
    vertexShader: `
      varying vec3 surfacePosition;
      varying vec3 surfaceNormal;
      #include <fog_pars_vertex>
      #include <clipping_planes_pars_vertex>
      void main() {
        surfacePosition = (modelMatrix * vec4(position, 1.0)).xyz;
        surfaceNormal = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
        #include <clipping_planes_vertex>
      }
    `,
    fragmentShader: `
      uniform float hologramOpacity;
      uniform vec3 gridColor;
      varying vec3 surfacePosition;
      varying vec3 surfaceNormal;
      #include <fog_pars_fragment>
      #include <clipping_planes_pars_fragment>
      void main() {
        #include <clipping_planes_fragment>
        vec3 n = normalize(surfaceNormal);
        vec3 axis = abs(n);
        vec2 surfaceUV = axis.y > max(axis.x, axis.z) ? surfacePosition.xz
          : (axis.x > axis.z ? surfacePosition.zy : surfacePosition.xy);
        vec2 grid = surfaceUV * 0.75;
        vec2 pixelWidth = max(fwidth(grid), vec2(0.0001));
        vec2 distanceToLine = abs(fract(grid - 0.5) - 0.5) / pixelWidth;
        float nearest = min(distanceToLine.x, distanceToLine.y);
        float wire = 1.0 - smoothstep(0.35, 1.1, nearest);
        // Fade subpixel cells instead of letting distant polygons shimmer.
        wire *= 1.0 - smoothstep(0.2, 0.7, max(pixelWidth.x, pixelWidth.y));
        float floorFade = axis.y > 0.7 ? 0.15 : 1.0;
        float rim = pow(1.0 - abs(dot(n, normalize(cameraPosition - surfacePosition))), 3.0);
        vec3 color = vec3(0.0003, 0.0012, 0.0005)
          + gridColor * (wire * floorFade * 0.55 + rim * 0.08);
        gl_FragColor = vec4(color, hologramOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
    side: THREE.DoubleSide,
    transparent: glass,
    depthWrite: !glass,
    fog: true,
    clipping: true,
  });
}
