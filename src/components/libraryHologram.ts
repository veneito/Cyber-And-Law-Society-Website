import * as THREE from 'three';

// The raised laser pass shares the original geometry; no new textures or vertex buffers.
export function libraryHologramMaterial(glass = false, lasers = false) {
  return new THREE.ShaderMaterial({
    defines: { LASER_GRID: lasers ? 1 : 0 },
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { laserOffset: { value: lasers ? 0.006 : 0 }, hologramOpacity: { value: glass ? 0.16 : 1 }, gridColor: { value: new THREE.Color(0x26c578) } },
    ]),
    vertexShader: `
      uniform float laserOffset;
      varying vec3 surfacePosition;
      varying vec3 surfaceNormal;
      #include <fog_pars_vertex>
      #include <clipping_planes_pars_vertex>
      void main() {
        surfacePosition = (modelMatrix * vec4(position, 1.0)).xyz;
        surfaceNormal = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position + normal * laserOffset, 1.0);
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
      vec2 gridLines(vec2 grid) {
        vec2 pixelWidth = max(fwidth(grid), vec2(0.0001));
        vec2 distanceToLine = abs(fract(grid - 0.5) - 0.5) / pixelWidth;
        float nearest = min(distanceToLine.x, distanceToLine.y);
        float fade = 1.0 - smoothstep(0.2, 0.7, max(pixelWidth.x, pixelWidth.y));
        return vec2(1.0 - smoothstep(0.3, 1.0, nearest),
          1.0 - smoothstep(0.7, 3.2, nearest)) * fade;
      }
      void main() {
        #include <clipping_planes_fragment>
        vec3 n = normalize(surfaceNormal);
        vec3 axis = abs(n);
        vec2 surfaceUV = axis.y > max(axis.x, axis.z) ? surfacePosition.xz
          : (axis.x > axis.z ? surfacePosition.zy : surfacePosition.xy);
        vec2 grid = surfaceUV * 0.75;
        vec2 major = gridLines(grid);
        vec2 minor = gridLines(grid * 3.0);
        float wire = major.x * 0.68 + minor.x * 0.3;
        float glow = major.y * 0.11 + minor.y * 0.035;
        float floorFade = axis.y > 0.7 ? 0.22 : 1.0;
        #if LASER_GRID == 1
          float strength = clamp(wire + glow, 0.0, 1.0);
          if (strength < 0.01) discard;
          gl_FragColor = vec4(gridColor * floorFade, hologramOpacity * strength);
        #else
          gl_FragColor = vec4(0.00002, 0.00006, 0.00003, hologramOpacity);
        #endif
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
    side: THREE.DoubleSide,
    transparent: glass || lasers,
    blending: lasers ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: !glass && !lasers,
    fog: true,
    clipping: true,
  });
}
