export const lightweightFragmentShader = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_timeOfDay;
  uniform float u_activity;
  uniform float u_energy;
  uniform float u_alert;
  uniform float u_progress;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec3 acesTonemap(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;

    float dawnMix = smoothstep(0.3, 0.8, u_progress);
    vec3 sky, fog, ambient;

    if (u_timeOfDay < 0.2) {
      sky = mix(vec3(0.01, 0.01, 0.06), vec3(0.02, 0.02, 0.08), u_timeOfDay / 0.2);
      fog = vec3(0.01, 0.01, 0.04);
      ambient = vec3(0.01, 0.01, 0.04);
    } else if (u_timeOfDay < 0.3) {
      float t = (u_timeOfDay - 0.2) / 0.1;
      sky = mix(vec3(0.02, 0.02, 0.08), vec3(0.35, 0.12, 0.05), t);
      fog = mix(vec3(0.01, 0.01, 0.05), vec3(0.15, 0.06, 0.03), t);
      ambient = mix(vec3(0.015, 0.01, 0.05), vec3(0.2, 0.08, 0.04), t);
    } else if (u_timeOfDay < 0.5) {
      float t = (u_timeOfDay - 0.3) / 0.2;
      sky = mix(vec3(0.35, 0.12, 0.05), vec3(0.25, 0.22, 0.18), t);
      fog = mix(vec3(0.15, 0.06, 0.03), vec3(0.12, 0.1, 0.08), t);
      ambient = vec3(0.3, 0.25, 0.18);
    } else if (u_timeOfDay < 0.7) {
      float t = (u_timeOfDay - 0.5) / 0.2;
      sky = mix(vec3(0.25, 0.22, 0.18), vec3(0.4, 0.15, 0.05), t);
      fog = mix(vec3(0.12, 0.1, 0.08), vec3(0.2, 0.08, 0.03), t);
      ambient = vec3(0.35, 0.25, 0.12);
    } else if (u_timeOfDay < 0.85) {
      float t = (u_timeOfDay - 0.7) / 0.15;
      sky = mix(vec3(0.4, 0.15, 0.05), vec3(0.06, 0.02, 0.12), t);
      fog = mix(vec3(0.2, 0.08, 0.03), vec3(0.03, 0.01, 0.06), t);
      ambient = vec3(0.15, 0.08, 0.1);
    } else {
      float t = (u_timeOfDay - 0.85) / 0.15;
      sky = mix(vec3(0.06, 0.02, 0.12), vec3(0.01, 0.01, 0.06), t);
      fog = vec3(0.01, 0.01, 0.04);
      ambient = vec3(0.01, 0.01, 0.04);
    }

    sky = mix(sky, sky + vec3(0.03, 0.02, 0.01) * dawnMix, 0.5);

    float horizY = uv.y - 0.5;
    vec3 col = sky;

    float fogBand = smoothstep(-0.1, 0.3, horizY) * (0.3 + u_alert * 0.3);
    col = mix(col, fog * 2.0, fogBand * 0.4);

    float neonIntensity = (u_timeOfDay < 0.25 || u_timeOfDay > 0.8) ? 1.0 : 0.2;
    neonIntensity *= 0.6 + u_activity * 0.4;

    vec3 neonEmit = vec3(0.0);
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float bx = (hash(vec2(fi * 7.3, fi * 13.1)) - 0.5) * 2.0 * aspect;
      float by = 0.3 + hash(vec2(fi * 3.7, fi * 9.1)) * 0.35;
      float h = hash(vec2(fi, fi * 2.0));
      vec3 nCol;
      if (h < 0.25) nCol = vec3(0.0, 0.85, 1.0);
      else if (h < 0.5) nCol = vec3(1.0, 0.1, 0.4);
      else if (h < 0.75) nCol = vec3(0.2, 1.0, 0.4);
      else nCol = vec3(0.8, 0.2, 1.0);

      float dist = length((uv - vec2(0.5)) * vec2(aspect, 1.0) - vec2(bx, by - 0.5));
      float glow = exp(-dist * 20.0) * 0.15;
      float blink = 0.7 + 0.3 * sin(u_time * 3.0 + fi * 2.5);
      neonEmit += nCol * glow * blink * neonIntensity;
    }

    if (horizY < 0.0) {
      float groundFade = smoothstep(0.0, -0.4, horizY);
      float gridX = fract(uv.x * aspect * 2.0 + u_time * 0.01);
      float gridZ = fract(-horizY * 8.0);
      float grid = (smoothstep(0.97, 1.0, gridX) + smoothstep(0.97, 1.0, gridZ));
      vec3 gridCol = mix(ambient, vec3(0.0, 0.4, 0.6), 0.3) * neonIntensity * 0.2;
      col += gridCol * grid * groundFade * 0.4;

      float wetSheen = hash(vec2(uv.x * 3.0, u_time * 0.02)) * 0.1;
      col += fog * wetSheen * groundFade * (0.3 + u_alert * 0.5);
    }

    col += neonEmit * 0.5;

    float rainIntensity = (u_timeOfDay < 0.25 || u_timeOfDay > 0.8) ? 0.5 + u_alert * 0.3 : 0.0;
    if (rainIntensity > 0.1) {
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float rx = hash(vec2(fi * 17.0, floor(u_time * 2.0 + fi))) * aspect;
        float ry = fract(uv.y * 3.0 + u_time * 2.0 * (1.0 + fi * 0.3) + fi * 0.4);
        float drop = smoothstep(0.08, 0.0, abs(uv.x * aspect - rx)) * smoothstep(0.0, 0.05, ry) * smoothstep(0.12, 0.06, ry);
        col += vec3(0.15, 0.18, 0.25) * drop * rainIntensity * 0.5;
      }
    }

    vec2 vig = uv - 0.5;
    float vignette = 1.0 - dot(vig, vig) * 0.8;
    col *= vignette;

    col = acesTonemap(col);
    col = pow(col, vec3(0.92));

    vec3 shadowTint = vec3(0.85, 0.95, 1.05);
    vec3 highlightTint = vec3(1.05, 0.98, 0.92);
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col *= mix(shadowTint, highlightTint, smoothstep(0.2, 0.8, lum));

    col = mix(col, col * vec3(1.0, 0.7, 0.7), u_alert * 0.3);

    float aberration = length(vig) * 0.02;
    col = vec3(col.r * (1.0 + aberration), col.g, col.b * (1.0 - aberration));

    float grain = (hash(gl_FragCoord.xy + vec2(floor(u_time * 24.0) * 7.13, floor(u_time * 24.0) * 11.31)) - 0.5) * 0.04;
    col += vec3(grain);

    gl_FragColor = vec4(col, 1.0);
  }
`;
