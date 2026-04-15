import { requestGPUBackend, writeUniformBuffer, createUniformBuffer } from './gpu';
import { createBackgroundContext, createProgram, createFullscreenQuad, getUniformLocations, getCurrentTimeOfDay } from './webgl';
import { getWGSLFragmentShader, wgslVertex } from './shaders/city';
import type { PhoenixVisualState } from './types';

export interface GPURenderState {
  type: 'webgpu';
  device: GPUDevice;
  queue: GPUQueue;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  pipeline: GPURenderPipeline;
  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;
  canvas: HTMLCanvasElement;
  dispose: () => void;
}

export function createGPURenderState(
  canvas: HTMLCanvasElement,
): Promise<GPURenderState | null> {
  return new Promise((resolve) => {
    requestGPUBackend(canvas).then((backend) => {
      if (!backend) {
        resolve(null);
        return;
      }

      if (backend.type === 'webgpu') {
        const fragmentShader = getWGSLFragmentShader();

        const shaderModule = backend.device.createShaderModule({
          code: `${wgslVertex}\n${fragmentShader}`,
        });

        const uniformBuffer = createUniformBuffer(backend.device);

        const bindGroupLayout = backend.device.createBindGroupLayout({
          entries: [{
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: { type: 'uniform' },
          }],
        });

        const bindGroup = backend.device.createBindGroup({
          layout: bindGroupLayout,
          entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer },
          }],
        });

        const pipelineLayout = backend.device.createPipelineLayout({
          bindGroupLayouts: [bindGroupLayout],
        });

        const pipeline = backend.device.createRenderPipeline({
          layout: pipelineLayout,
          vertex: {
            module: shaderModule,
            entryPoint: 'vertexMain',
          },
          fragment: {
            module: shaderModule,
            entryPoint: 'fragmentMain',
            targets: [{ format: backend.format }],
          },
          primitive: { topology: 'triangle-list' },
        });

        resolve({
          type: 'webgpu',
          device: backend.device,
          queue: backend.queue,
          context: backend.context,
          format: backend.format,
          pipeline,
          uniformBuffer,
          bindGroup,
          canvas,
          dispose: () => {
            backend.device.destroy();
          },
        });
      } else {
        resolve(null);
      }
    });
  });
}

export function updateGPURenderUniforms(
  state: GPURenderState,
  elapsed: number,
  canvas: HTMLCanvasElement,
  visualState: PhoenixVisualState,
  timeOfDayOverride?: number,
  progress?: number,
): void {
  const data = new Float32Array([
    elapsed,
    canvas.width,
    canvas.height,
    timeOfDayOverride ?? getCurrentTimeOfDay(),
    visualState.activity,
    visualState.energy,
    visualState.alert,
    progress ?? 0,
  ]);
  writeUniformBuffer(state.device, state.uniformBuffer, 0, data);
}

export function renderGPUSingle(state: GPURenderState): void {
  const view = state.context.getCurrentTexture().createView();
  const encoder = state.device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view,
      clearValue: { r: 0.01, g: 0.01, b: 0.06, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  pass.setPipeline(state.pipeline);
  pass.setBindGroup(0, state.bindGroup);
  pass.draw(3);
  pass.end();
  state.queue.submit([encoder.finish()]);
}

export interface GLRenderState {
  type: 'webgl';
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  uniforms: ReturnType<typeof getUniformLocations>;
  canvas: HTMLCanvasElement;
  dispose: () => void;
}

export function createGLRenderState(
  canvas: HTMLCanvasElement,
  vertexShader: string,
  fragmentShader: string,
): GLRenderState | null {
  const gl = createBackgroundContext(canvas);
  if (!gl) return null;

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return null;

  gl.useProgram(program);
  const buffer = createFullscreenQuad(gl, program);
  if (!buffer) return null;

  const uniforms = getUniformLocations(gl, program);

  return {
    type: 'webgl',
    gl,
    program,
    uniforms,
    canvas,
    dispose: () => {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    },
  };
}

export function renderGLSingle(
  state: GLRenderState,
  elapsed: number,
  visualState: PhoenixVisualState,
  timeOfDayOverride?: number,
  progress?: number,
): void {
  const { gl, uniforms, canvas } = state;
  gl.uniform1f(uniforms.time, elapsed);
  gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
  gl.uniform1f(uniforms.timeOfDay, timeOfDayOverride ?? getCurrentTimeOfDay());
  gl.uniform1f(uniforms.activity, visualState.activity);
  gl.uniform1f(uniforms.energy, visualState.energy);
  gl.uniform1f(uniforms.alert, visualState.alert);
  gl.uniform1f(uniforms.progress, progress ?? 0);
  gl.clearColor(0.01, 0.01, 0.06, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export type RenderState = GPURenderState | GLRenderState;

export function isGPURenderState(state: RenderState): state is GPURenderState {
  return state.type === 'webgpu';
}

export function resizeCanvas(canvas: HTMLCanvasElement, dprCap: number): void {
  const dpr = Math.min(window.devicePixelRatio, dprCap);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
}