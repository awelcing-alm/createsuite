export interface BackgroundUniformLocations {
  time: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  timeOfDay: WebGLUniformLocation | null;
  activity: WebGLUniformLocation | null;
  energy: WebGLUniformLocation | null;
  alert: WebGLUniformLocation | null;
  progress: WebGLUniformLocation | null;
}

const CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: true,
};

export function createBackgroundContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  return (canvas.getContext('webgl', CONTEXT_ATTRIBUTES) ||
    canvas.getContext('experimental-webgl', CONTEXT_ATTRIBUTES)) as WebGLRenderingContext | null;
}

export function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return null;
  }

  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return null;
  }

  gl.deleteShader(vert);
  gl.deleteShader(frag);
  return program;
}

export function createFullscreenQuad(gl: WebGLRenderingContext, program: WebGLProgram): WebGLBuffer | null {
  const buffer = gl.createBuffer();
  if (!buffer) return null;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  return buffer;
}

export function getUniformLocations(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
): BackgroundUniformLocations {
  return {
    time: gl.getUniformLocation(program, 'u_time'),
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    timeOfDay: gl.getUniformLocation(program, 'u_timeOfDay'),
    activity: gl.getUniformLocation(program, 'u_activity'),
    energy: gl.getUniformLocation(program, 'u_energy'),
    alert: gl.getUniformLocation(program, 'u_alert'),
    progress: gl.getUniformLocation(program, 'u_progress'),
  };
}

export function getCurrentTimeOfDay(): number {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60.0 + now.getSeconds() / 3600.0;
  return hours / 24.0;
}
