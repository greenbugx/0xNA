const LUT_STEPS = 48;
const WHITE_BUCKETS = 8;

const BODY_STATE_STRIDE = 4; 
const BODY_STATIC_STRIDE = 5;
const WHITE_STATE_STRIDE = 6;
const WHITE_STATIC_STRIDE = 2;

const MIN_PARTICLES = 50000;
const MAX_PARTICLES = 96000;

const PCG = `
uint pcgHash(uint v) {
  uint st = v * 747796405u + 2891336453u;
  uint w = ((st >> ((st >> 28u) + 4u)) ^ st) * 277803737u;
  return (w >> 22u) ^ w;
}

float nextRand(inout uint state) {
  state = pcgHash(state);
  return float(state >> 8u) * (1.0 / 16777216.0);
}
`;

const VERT_BODY_UPDATE = `#version 300 es
precision highp float;
${PCG}

layout(location = 0) in float a_speedY;
layout(location = 1) in float a_speedU;
layout(location = 2) in vec4 a_state;

uniform float u_speed;
uniform float u_height;

out vec4 o_state;

void main() {
  float y = a_state.x;
  float u = a_state.y;
  float spdU = a_state.z;
  uint seed = floatBitsToUint(a_state.w);

  y += a_speedY * u_speed;
  float top = u_height + 20.0;
  if (y < -20.0) {
    y = top;
  } else if (y > top) {
    y = -20.0;
  }

  if (a_speedU > 0.0) {
    u -= spdU * u_speed;
    if (u <= 0.0) {
      u = 1.0 + nextRand(seed) * 0.04;
      spdU = 0.0005 + nextRand(seed) * 0.0007;
    }
  }

  o_state = vec4(y, u, spdU, uintBitsToFloat(seed));
  gl_Position = vec4(0.0);
}`;

const VERT_WHITE_UPDATE = `#version 300 es
precision highp float;
${PCG}

layout(location = 0) in vec4 a_state0;
layout(location = 1) in vec2 a_state1;
layout(location = 2) in float a_phase;
layout(location = 3) in float a_size;

uniform float u_speed;
uniform float u_height;
uniform float u_depth;
uniform float u_baseX;

out vec4 o_state0;
out vec2 o_state1;

void main() {
  float dist = a_state0.x;
  float y = a_state0.y;
  float vx = a_state0.z;
  float vy = a_state0.w;
  float reach = a_state1.x;
  uint seed = floatBitsToUint(a_state1.y);

  dist += vx * u_speed;
  y += vy * u_speed;

  float top = u_height + 20.0;
  float progress = y < 0.0 ? 0.0 : (y > u_height ? 1.0 : y / u_height);
  float cx = u_baseX + sin(progress * 3.141592653589793) * u_depth;

  if (abs(dist) > reach || y < -20.0 || y > top || cx + dist < 0.0) {
    dist = -nextRand(seed) * 3.0;
    y = -15.0 + nextRand(seed) * (u_height + 30.0);
    reach = 100.0 + nextRand(seed) * 150.0;
    vx = -(0.18 + nextRand(seed) * 0.35);
    vy = (nextRand(seed) - 0.48) * 0.28;
  }

  o_state0 = vec4(dist, y, vx, vy);
  o_state1 = vec2(reach, uintBitsToFloat(seed));
  gl_Position = vec4(0.0);
}`;

const VERT_BODY_DRAW = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_corner;
layout(location = 1) in float a_freq;
layout(location = 2) in float a_phase;
layout(location = 3) in float a_size;
layout(location = 4) in vec4 a_state;

uniform float u_width;
uniform float u_height;
uniform float u_depth;
uniform float u_baseX;
uniform float u_time;
uniform float u_turb;
uniform vec3 u_palette[${LUT_STEPS}];

out vec3 v_color;
out float v_alpha;
out vec4 v_rect;

void main() {
  float y = a_state.x;
  float u = a_state.y;

  float progress = y < 0.0 ? 0.0 : (y > u_height ? 1.0 : y / u_height);
  float cx = u_baseX + sin(progress * 3.141592653589793) * u_depth;
  float spread = max(40.0, u_width - cx);

  float timePhase = u_time * a_freq + a_phase;
  float wobbleX = sin(timePhase) * (2.0 + u * 5.5) * u_turb;
  float wobbleY = cos(timePhase * 0.8) * (1.5 + u * 3.5) * u_turb;

  float posX = floor(cx + u * spread + wobbleX);
  float posY = floor(y + wobbleY);

  float cu = max(0.0, u);
  float colorT = cu <= 0.0 ? 0.0 : pow(cu, 0.9);
  int lutIdx = min(int(floor(colorT * ${LUT_STEPS}.0)), ${LUT_STEPS - 1});

  vec2 rectMin = vec2(posX, posY);
  vec2 rectMax = rectMin + a_size;
  vec2 ndc = vec2(posX / u_width * 2.0 - 1.0, 1.0 - posY / u_height * 2.0);
  vec2 span = vec2(a_size / u_width * 2.0, -a_size / u_height * 2.0);
  vec2 pad = vec2(2.0 / u_width, -2.0 / u_height);
  gl_Position = vec4(ndc - pad + a_corner * (span + 2.0 * pad), 0.0, 1.0);

  v_color = u_palette[lutIdx];
  v_alpha = max(0.72, 0.95 - (float(lutIdx) / ${LUT_STEPS}.0) * 0.18);
  v_rect = vec4(rectMin.x, rectMax.x, u_height - rectMax.y, u_height - rectMin.y);
}`;

const VERT_WHITE_DRAW = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_corner;
layout(location = 1) in float a_phase;
layout(location = 2) in float a_size;
layout(location = 3) in vec4 a_state0;
layout(location = 4) in vec2 a_state1;

uniform float u_width;
uniform float u_height;
uniform float u_depth;
uniform float u_baseX;
uniform float u_time;
uniform float u_turb;

out vec3 v_color;
out float v_alpha;
out vec4 v_rect;

void main() {
  float dist = a_state0.x;
  float y = a_state0.y;
  float reach = a_state1.x;

  float progress = y < 0.0 ? 0.0 : (y > u_height ? 1.0 : y / u_height);
  float cx = u_baseX + sin(progress * 3.141592653589793) * u_depth;

  float wobbleX = sin(u_time * 0.5 + a_phase) * 1.5 * u_turb;
  float wobbleY = cos(u_time * 0.4 + a_phase) * 1.2 * u_turb;

  float posX = floor(cx + dist + wobbleX);
  float posY = floor(y + wobbleY);

  float distOut = abs(dist);
  float alphaFrac = max(0.0, 1.0 - distOut / reach);
  int alphaBucket = clamp(int(floor(alphaFrac * ${WHITE_BUCKETS}.0)), 0, ${WHITE_BUCKETS - 1});

  vec2 rectMin = vec2(posX, posY);
  vec2 rectMax = rectMin + a_size;
  vec2 ndc = vec2(posX / u_width * 2.0 - 1.0, 1.0 - posY / u_height * 2.0);
  vec2 span = vec2(a_size / u_width * 2.0, -a_size / u_height * 2.0);
  vec2 pad = vec2(2.0 / u_width, -2.0 / u_height);
  gl_Position = vec4(ndc - pad + a_corner * (span + 2.0 * pad), 0.0, 1.0);

  v_color = vec3(1.0);
  v_alpha = (float(alphaBucket) + 1.0) / ${WHITE_BUCKETS}.0 * 0.92;
  v_rect = vec4(rectMin.x, rectMax.x, u_height - rectMax.y, u_height - rectMin.y);
}`;

const FRAG_DRAW = `#version 300 es
precision highp float;

in vec3 v_color;
in float v_alpha;
in vec4 v_rect;

out vec4 fragColor;

void main() {
  float x = gl_FragCoord.x;
  float y = gl_FragCoord.y;
  float coverX = clamp(min(x + 0.5, v_rect.y) - max(x - 0.5, v_rect.x), 0.0, 1.0);
  float coverY = clamp(min(y + 0.5, v_rect.w) - max(y - 0.5, v_rect.z), 0.0, 1.0);
  float alpha = v_alpha * coverX * coverY;
  if (alpha <= 0.0) discard;
  fragColor = vec4(v_color * alpha, alpha);
}`;

const FRAG_DUMMY = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() { fragColor = vec4(0.0); }`;

export interface FizzRenderer {
  readonly bodyCount: number;
  readonly whiteCount: number;
  resize(width: number, height: number): void;
  render(time: number, speed: number, turbulence: number, advance: boolean): void;
  dispose(): void;
}

function hexToRgb(color: string): [number, number, number] {
  let hex = color.trim().replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const val = parseInt(hex, 16);
  if (Number.isNaN(val)) return [255, 255, 255];
  return [(val >> 16) & 255, (val >> 8) & 255, val & 255];
}

function buildPalette(colors: string[]): Float32Array {
  const rgb = colors.map(hexToRgb);
  const segments = rgb.length - 1;
  const out = new Float32Array(LUT_STEPS * 3);
  for (let s = 0; s < LUT_STEPS; s++) {
    const scaled = (s / (LUT_STEPS - 1)) * segments;
    const idx = Math.min(Math.floor(scaled), segments - 1);
    const frac = scaled - idx;
    const c1 = rgb[idx];
    const c2 = rgb[idx + 1];
    out[s * 3] = Math.round(c1[0] + (c2[0] - c1[0]) * frac) / 255;
    out[s * 3 + 1] = Math.round(c1[1] + (c2[1] - c1[1]) * frac) / 255;
    out[s * 3 + 2] = Math.round(c1[2] + (c2[2] - c1[2]) * frac) / 255;
  }
  return out;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("FizzingParticles: could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`FizzingParticles: shader compile failed: ${log}`);
  }
  return shader;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
  feedbackVaryings?: string[]
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("FizzingParticles: could not create program");
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  if (feedbackVaryings) {
    gl.transformFeedbackVaryings(program, feedbackVaryings, gl.INTERLEAVED_ATTRIBS);
  }
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`FizzingParticles: program link failed: ${log}`);
  }
  return program;
}

export function createFizzRenderer(
  canvas: HTMLCanvasElement,
  colors: string[],
  particleCount?: number
): FizzRenderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  let programs: WebGLProgram[] = [];
  let buffers: WebGLBuffer[] = [];
  let vaos: WebGLVertexArrayObject[] = [];

  try {
    const width = canvas.width;
    const height = canvas.height;

    const targetTotal =
      particleCount ||
      Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.round((width * height) / 22)));
    const whiteCount = Math.round(targetTotal * 0.22);
    const bodyCount = targetTotal - whiteCount;
    const anchorCount = Math.round(bodyCount * 0.65);

    const bodyStatic = new Float32Array(bodyCount * BODY_STATIC_STRIDE);
    const bodyState = new Float32Array(bodyCount * BODY_STATE_STRIDE);
    const whiteStatic = new Float32Array(whiteCount * WHITE_STATIC_STRIDE);
    const whiteState = new Float32Array(whiteCount * WHITE_STATE_STRIDE);
    const bodySeed = new Uint32Array(bodyState.buffer);
    const whiteSeed = new Uint32Array(whiteState.buffer);
    for (let i = 0; i < anchorCount; i++) {
      const o = i * BODY_STATIC_STRIDE;
      bodyState[i * BODY_STATE_STRIDE] = -20 + Math.random() * (height + 40);

      const r = Math.random();
      let u: number;
      if (r < 0.28) u = Math.pow(Math.random(), 1.6) * 0.28;
      else if (r < 0.6) u = 1.04 - Math.pow(Math.random(), 1.5) * 0.36;
      else u = Math.random() * 1.04;
      bodyState[i * BODY_STATE_STRIDE + 1] = u;

      bodyStatic[o] = -(0.03 + Math.random() * 0.1);
      bodyStatic[o + 1] = 0;
      bodyState[i * BODY_STATE_STRIDE + 2] = 0;
      bodySeed[i * BODY_STATE_STRIDE + 3] = (Math.random() * 4294967296) >>> 0;
      bodyStatic[o + 2] = 0.5 + Math.random() * 1.5;
      bodyStatic[o + 3] = Math.random() * Math.PI * 2;

      const sizeRand = Math.random();
      bodyStatic[o + 4] = sizeRand < 0.55 ? 1 : sizeRand < 0.88 ? 1.5 : 2;
    }

    for (let i = anchorCount; i < bodyCount; i++) {
      const o = i * BODY_STATIC_STRIDE;
      bodyState[i * BODY_STATE_STRIDE] = -20 + Math.random() * (height + 40);
      bodyState[i * BODY_STATE_STRIDE + 1] = Math.random() * 1.04;
      bodyStatic[o] = -(0.04 + Math.random() * 0.12);
      const speedU = 0.0005 + Math.random() * 0.0007;
      bodyStatic[o + 1] = speedU;
      bodyState[i * BODY_STATE_STRIDE + 2] = speedU;
      bodySeed[i * BODY_STATE_STRIDE + 3] = (Math.random() * 4294967296) >>> 0;
      bodyStatic[o + 2] = 0.6 + Math.random() * 1.6;
      bodyStatic[o + 3] = Math.random() * Math.PI * 2;

      const sizeRand = Math.random();
      bodyStatic[o + 4] = sizeRand < 0.6 ? 1 : sizeRand < 0.9 ? 1.5 : 2;
    }

    for (let i = 0; i < whiteCount; i++) {
      const s = i * WHITE_STATE_STRIDE;
      const o = i * WHITE_STATIC_STRIDE;
      whiteState[s + 1] = -20 + Math.random() * (height + 40);
      whiteState[s + 4] = 100 + Math.random() * 150;
      whiteState[s] = -Math.random() * whiteState[s + 4] * 0.95;
      whiteState[s + 2] = -(0.18 + Math.random() * 0.35);
      whiteState[s + 3] = (Math.random() - 0.48) * 0.28;
      whiteStatic[o + 1] = Math.random() < 0.78 ? 1 : 1.5;
      whiteStatic[o] = Math.random() * Math.PI * 2;
      whiteSeed[s + 5] = (Math.random() * 4294967296) >>> 0;
    }

    const bodyUpdate = linkProgram(gl, VERT_BODY_UPDATE, FRAG_DUMMY, ["o_state"]);
    const bodyDraw = linkProgram(gl, VERT_BODY_DRAW, FRAG_DRAW);
    const whiteUpdate = linkProgram(gl, VERT_WHITE_UPDATE, FRAG_DUMMY, ["o_state0", "o_state1"]);
    const whiteDraw = linkProgram(gl, VERT_WHITE_DRAW, FRAG_DRAW);
    programs = [bodyUpdate, bodyDraw, whiteUpdate, whiteDraw];

    const makeBuffer = (target: number, data: Float32Array, usage: number) => {
      const buf = gl.createBuffer();
      if (!buf) throw new Error("FizzingParticles: could not create buffer");
      buffers.push(buf);
      gl.bindBuffer(target, buf);
      gl.bufferData(target, data, usage);
      return buf;
    };

    const quadBuffer = makeBuffer(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const bodyStaticBuf = makeBuffer(gl.ARRAY_BUFFER, bodyStatic, gl.STATIC_DRAW);
    const bodyStateA = makeBuffer(gl.ARRAY_BUFFER, bodyState, gl.DYNAMIC_COPY);
    const bodyStateB = makeBuffer(gl.ARRAY_BUFFER, bodyState, gl.DYNAMIC_COPY);
    const whiteStaticBuf = makeBuffer(gl.ARRAY_BUFFER, whiteStatic, gl.STATIC_DRAW);
    const whiteStateA = makeBuffer(gl.ARRAY_BUFFER, whiteState, gl.DYNAMIC_COPY);
    const whiteStateB = makeBuffer(gl.ARRAY_BUFFER, whiteState, gl.DYNAMIC_COPY);

    const bodyStateBufs = [bodyStateA, bodyStateB];
    const whiteStateBufs = [whiteStateA, whiteStateB];

    const bodyUpdateVaos = [0, 1].map((parity) => {
      const vao = gl.createVertexArray();
      if (!vao) throw new Error("FizzingParticles: could not create VAO");
      vaos.push(vao);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, bodyStaticBuf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 1, gl.FLOAT, false, BODY_STATIC_STRIDE * 4, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 1, gl.FLOAT, false, BODY_STATIC_STRIDE * 4, 4);
      gl.bindBuffer(gl.ARRAY_BUFFER, bodyStateBufs[parity]);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
      return vao;
    });

    const whiteUpdateVaos = [0, 1].map((parity) => {
      const vao = gl.createVertexArray();
      if (!vao) throw new Error("FizzingParticles: could not create VAO");
      vaos.push(vao);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, whiteStateBufs[parity]);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, WHITE_STATE_STRIDE * 4, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, WHITE_STATE_STRIDE * 4, 16);
      gl.bindBuffer(gl.ARRAY_BUFFER, whiteStaticBuf);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 1, gl.FLOAT, false, WHITE_STATIC_STRIDE * 4, 0);
      gl.enableVertexAttribArray(3);
      gl.vertexAttribPointer(3, 1, gl.FLOAT, false, WHITE_STATIC_STRIDE * 4, 4);
      return vao;
    });

    const bodyDrawVaos = [0, 1].map((parity) => {
      const vao = gl.createVertexArray();
      if (!vao) throw new Error("FizzingParticles: could not create VAO");
      vaos.push(vao);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bodyStaticBuf);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 1, gl.FLOAT, false, BODY_STATIC_STRIDE * 4, 8);
      gl.vertexAttribDivisor(1, 1);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 1, gl.FLOAT, false, BODY_STATIC_STRIDE * 4, 12);
      gl.vertexAttribDivisor(2, 1);
      gl.enableVertexAttribArray(3);
      gl.vertexAttribPointer(3, 1, gl.FLOAT, false, BODY_STATIC_STRIDE * 4, 16);
      gl.vertexAttribDivisor(3, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, bodyStateBufs[parity]);
      gl.enableVertexAttribArray(4);
      gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(4, 1);
      return vao;
    });

    const whiteDrawVaos = [0, 1].map((parity) => {
      const vao = gl.createVertexArray();
      if (!vao) throw new Error("FizzingParticles: could not create VAO");
      vaos.push(vao);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, whiteStaticBuf);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 1, gl.FLOAT, false, WHITE_STATIC_STRIDE * 4, 0);
      gl.vertexAttribDivisor(1, 1);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 1, gl.FLOAT, false, WHITE_STATIC_STRIDE * 4, 4);
      gl.vertexAttribDivisor(2, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, whiteStateBufs[parity]);
      gl.enableVertexAttribArray(3);
      gl.vertexAttribPointer(3, 4, gl.FLOAT, false, WHITE_STATE_STRIDE * 4, 0);
      gl.vertexAttribDivisor(3, 1);
      gl.enableVertexAttribArray(4);
      gl.vertexAttribPointer(4, 2, gl.FLOAT, false, WHITE_STATE_STRIDE * 4, 16);
      gl.vertexAttribDivisor(4, 1);
      return vao;
    });

    const bodyFeedback = gl.createTransformFeedback();
    const whiteFeedback = gl.createTransformFeedback();
    if (!bodyFeedback || !whiteFeedback) {
      throw new Error("FizzingParticles: could not create transform feedback");
    }

    gl.bindVertexArray(null);

    const palette = buildPalette(colors);

    const uBodyUpdate = {
      speed: gl.getUniformLocation(bodyUpdate, "u_speed"),
      height: gl.getUniformLocation(bodyUpdate, "u_height"),
    };
    const uWhiteUpdate = {
      speed: gl.getUniformLocation(whiteUpdate, "u_speed"),
      height: gl.getUniformLocation(whiteUpdate, "u_height"),
      depth: gl.getUniformLocation(whiteUpdate, "u_depth"),
      baseX: gl.getUniformLocation(whiteUpdate, "u_baseX"),
    };
    const uBodyDraw = {
      width: gl.getUniformLocation(bodyDraw, "u_width"),
      height: gl.getUniformLocation(bodyDraw, "u_height"),
      depth: gl.getUniformLocation(bodyDraw, "u_depth"),
      baseX: gl.getUniformLocation(bodyDraw, "u_baseX"),
      time: gl.getUniformLocation(bodyDraw, "u_time"),
      turb: gl.getUniformLocation(bodyDraw, "u_turb"),
      palette: gl.getUniformLocation(bodyDraw, "u_palette"),
    };
    const uWhiteDraw = {
      width: gl.getUniformLocation(whiteDraw, "u_width"),
      height: gl.getUniformLocation(whiteDraw, "u_height"),
      depth: gl.getUniformLocation(whiteDraw, "u_depth"),
      baseX: gl.getUniformLocation(whiteDraw, "u_baseX"),
      time: gl.getUniformLocation(whiteDraw, "u_time"),
      turb: gl.getUniformLocation(whiteDraw, "u_turb"),
    };

    gl.useProgram(bodyDraw);
    gl.uniform3fv(uBodyDraw.palette, palette);
    gl.useProgram(null);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let curWidth = width;
    let curHeight = height;
    let parity = 0;

    return {
      bodyCount,
      whiteCount,

      resize(nextWidth: number, nextHeight: number) {
        curWidth = nextWidth;
        curHeight = nextHeight;
      },

      render(time: number, speed: number, turbulence: number, advance: boolean) {
        const depth = Math.min(260, curWidth * 0.18);
        const baseX = curWidth - Math.min(420, curWidth * 0.3);

        if (advance) {
          gl.bindBuffer(gl.ARRAY_BUFFER, null);
          gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, bodyFeedback);
          gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bodyStateBufs[1 - parity]);
          gl.useProgram(bodyUpdate);
          gl.uniform1f(uBodyUpdate.speed, speed);
          gl.uniform1f(uBodyUpdate.height, curHeight);
          gl.bindVertexArray(bodyUpdateVaos[parity]);
          gl.enable(gl.RASTERIZER_DISCARD);
          gl.beginTransformFeedback(gl.POINTS);
          gl.drawArrays(gl.POINTS, 0, bodyCount);
          gl.endTransformFeedback();
          gl.disable(gl.RASTERIZER_DISCARD);

          gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, whiteFeedback);
          gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, whiteStateBufs[1 - parity]);
          gl.useProgram(whiteUpdate);
          gl.uniform1f(uWhiteUpdate.speed, speed);
          gl.uniform1f(uWhiteUpdate.height, curHeight);
          gl.uniform1f(uWhiteUpdate.depth, depth);
          gl.uniform1f(uWhiteUpdate.baseX, baseX);
          gl.bindVertexArray(whiteUpdateVaos[parity]);
          gl.enable(gl.RASTERIZER_DISCARD);
          gl.beginTransformFeedback(gl.POINTS);
          gl.drawArrays(gl.POINTS, 0, whiteCount);
          gl.endTransformFeedback();
          gl.disable(gl.RASTERIZER_DISCARD);

          for (let b = 0; b < 2; b++) gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, b, null);
          gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
          parity = 1 - parity;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, curWidth, curHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(bodyDraw);
        gl.uniform1f(uBodyDraw.width, curWidth);
        gl.uniform1f(uBodyDraw.height, curHeight);
        gl.uniform1f(uBodyDraw.depth, depth);
        gl.uniform1f(uBodyDraw.baseX, baseX);
        gl.uniform1f(uBodyDraw.time, time);
        gl.uniform1f(uBodyDraw.turb, turbulence);
        gl.bindVertexArray(bodyDrawVaos[parity]);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, bodyCount);

        gl.useProgram(whiteDraw);
        gl.uniform1f(uWhiteDraw.width, curWidth);
        gl.uniform1f(uWhiteDraw.height, curHeight);
        gl.uniform1f(uWhiteDraw.depth, depth);
        gl.uniform1f(uWhiteDraw.baseX, baseX);
        gl.uniform1f(uWhiteDraw.time, time);
        gl.uniform1f(uWhiteDraw.turb, turbulence);
        gl.bindVertexArray(whiteDrawVaos[parity]);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, whiteCount);

        gl.bindVertexArray(null);
      },

      dispose() {
        for (const p of programs) gl.deleteProgram(p);
        for (const b of buffers) gl.deleteBuffer(b);
        for (const v of vaos) gl.deleteVertexArray(v);
        gl.deleteTransformFeedback(bodyFeedback);
        gl.deleteTransformFeedback(whiteFeedback);
        programs = [];
        buffers = [];
        vaos = [];
      },
    };
  } catch (error) {
    console.warn(
      error instanceof Error ? `FizzingParticles: ${error.message}` : String(error)
    );
    for (const p of programs) gl.deleteProgram(p);
    for (const b of buffers) gl.deleteBuffer(b);
    for (const v of vaos) gl.deleteVertexArray(v);
    return null;
  }
}
