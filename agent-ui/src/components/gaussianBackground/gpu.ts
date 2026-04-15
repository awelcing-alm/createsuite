import { createBackgroundContext } from './webgl';

export type GPUBackendType = 'webgpu' | 'webgl';

export interface GPUBackendWebGPU {
  type: 'webgpu';
  adapter: GPUAdapter;
  device: GPUDevice;
  format: GPUTextureFormat;
  queue: GPUQueue;
  context: GPUCanvasContext;
}

export interface GPUBackendWebGL {
  type: 'webgl';
  gl: WebGLRenderingContext;
}

export type GPUBackend = GPUBackendWebGPU | GPUBackendWebGL | null;

/**
 * Attempts WebGPU first with high-performance adapter preference.
 * Falls back to WebGL if WebGPU is unavailable or is a fallback adapter.
 * Returns null if neither is available.
 */
export async function requestGPUBackend(
  canvas: HTMLCanvasElement,
): Promise<GPUBackend> {
  if (typeof navigator !== 'undefined' && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
      });

      if (adapter) {
        const device = await adapter.requestDevice();
        const format = navigator.gpu.getPreferredCanvasFormat();
        const context = canvas.getContext('webgpu') as GPUCanvasContext;

        if (context) {
          context.configure({
            device,
            format,
            alphaMode: 'opaque',
          });

          return {
            type: 'webgpu',
            adapter,
            device,
            format,
            queue: device.queue,
            context,
          };
        }
      }
    } catch {
      // WebGPU unavailable or failed — fall through to WebGL
    }
  }

  // WebGL fallback
  const gl = createBackgroundContext(canvas);
  if (gl) {
    return { type: 'webgl', gl };
  }

  return null;
}

/**
 * Writes uniform values to a GPU buffer via the command queue.
 * Layout must match WGSL struct Uniforms { time:f32, resolution:vec2f, ... }
 * which is std140 layout (16-byte stride per vec2f field).
 */
export function writeUniformBuffer(
  device: GPUDevice,
  buffer: GPUBuffer,
  offset: number,
  data: Float32Array,
): void {
  const src = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  device.queue.writeBuffer(buffer, offset, src);
}

/**
 * Creates a uniform buffer suitable for the background shader uniforms.
 * Size is 48 bytes (7 floats × 4 bytes + 4 bytes padding for vec2 alignment).
 */
export function createUniformBuffer(device: GPUDevice): GPUBuffer {
  return device.createBuffer({
    size: 48,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    mappedAtCreation: false,
  });
}