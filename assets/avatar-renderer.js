"use strict";
var ClayAvatar = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // remotion-video/src/avatarRenderer.ts
  var avatarRenderer_exports = {};
  __export(avatarRenderer_exports, {
    avatarGazePoints: () => avatarGazePoints,
    avatarPoseGeometry: () => avatarPoseGeometry,
    createAvatarRenderer: () => createAvatarRenderer,
    poses: () => poses
  });
  var poses = ["front", "angle-left", "profile-left", "angle-right"];
  var common = [0, 60, 120, 160, 200, 240, 280, 320, 360, 420, 480];
  var edges = (features) => [0, 60, ...features, 420, 480];
  var grids = {
    front: [
      [0, common],
      [26, common],
      [78, common],
      [132, edges([126, 162, 194, 235, 268, 313, 347])],
      [154, edges([132, 165, 193, 237, 270, 312, 342])],
      [173, edges([140, 177, 207, 239, 269, 294, 335])],
      [192, edges([141, 164, 197, 240, 278, 309, 335])],
      [211, edges([144, 165, 195, 241, 272, 308, 331])],
      [244, edges([153, 174, 214, 247, 272, 296, 320])],
      [281, edges([163, 190, 220, 248, 273, 294, 315])],
      [320, common],
      [375, common],
      [480, common]
    ],
    "angle-left": [
      [0, common],
      [26, common],
      [78, common],
      [132, edges([123, 145, 174, 187, 225, 308, 352])],
      [154, edges([128, 144, 159, 173, 214, 298, 345])],
      [173, edges([137, 148, 157, 171, 208, 237, 325])],
      [192, edges([131, 143, 153, 165, 219, 274, 321])],
      [211, edges([130, 141, 148, 158, 204, 271, 319])],
      [238, edges([135, 147, 165, 181, 213, 257, 302])],
      [279, edges([145, 163, 185, 210, 240, 272, 294])],
      [320, common],
      [375, common],
      [480, common]
    ],
    "profile-left": [
      [0, common],
      [26, common],
      [78, common],
      [132, edges([119, 138, 149, 157, 192, 302, 349])],
      [154, edges([121, 136, 144, 151, 175, 284, 343])],
      [173, edges([135, 140, 144, 148, 173, 201, 307])],
      [192, edges([130, 138, 143, 148, 182, 247, 304])],
      [210, edges([119, 126, 130, 136, 177, 253, 299])],
      [239, edges([128, 135, 141, 148, 170, 236, 292])],
      [281, edges([136, 148, 164, 180, 207, 258, 287])],
      [320, common],
      [375, common],
      [480, common]
    ],
    "angle-right": [
      [0, common],
      [26, common],
      [78, common],
      [132, edges([118, 155, 248, 290, 312, 328, 346])],
      [154, edges([123, 152, 257, 298, 317, 330, 347])],
      [173, edges([131, 231, 266, 298, 318, 328, 341])],
      [192, edges([132, 189, 247, 314, 323, 329, 341])],
      [211, edges([137, 190, 241, 321, 328, 334, 349])],
      [240, edges([149, 200, 275, 302, 320, 333, 351])],
      [282, edges([165, 192, 231, 270, 299, 320, 345])],
      [320, common],
      [375, common],
      [480, common]
    ]
  };
  var positions = Object.fromEntries(
    poses.map((pose) => [
      pose,
      new Float32Array(grids[pose].flatMap(([y, xs]) => xs.flatMap((x) => [x / 480, y / 480])))
    ])
  );
  var columns = common.length;
  var triangles = [];
  for (let row = 0; row < grids.front.length - 1; row++) {
    for (let col = 0; col < columns - 1; col++) {
      const top = row * columns + col;
      const bottom = top + columns;
      triangles.push(top, bottom, top + 1, top + 1, bottom, bottom + 1);
    }
  }
  var avatarPoseGeometry = { positions, triangles };
  var eyeRegions = {
    front: [206, 173, 19, 8, 268, 171, 20, 8],
    "angle-left": [157, 173, 13, 8, 203, 172, 20, 8],
    "profile-left": [168, 173, 17, 8, 0, 0, 0, 0],
    "angle-right": [267, 175, 20, 8, 318, 171, 12, 7]
  };
  var eyePlates = {
    front: [5.6, 5.9, 196, 173, 5.4, 5.9, 280, 171],
    "angle-left": [4.5, 5.4, 163, 174, 5.1, 5.9, 214, 172],
    "profile-left": [4.7, 5.9, 179, 173, 0, 0, 0, 0],
    "angle-right": [5.2, 6.1, 254, 175, 4.5, 5, 312, 171]
  };
  var avatarGazePoints = {
    front: [237 / 480, 172 / 480],
    "angle-left": [203 / 480, 172 / 480],
    "profile-left": [168 / 480, 173 / 480],
    "angle-right": [267 / 480, 175 / 480]
  };
  var vertexSource = `
  attribute vec2 sourceA;
  attribute vec2 sourceB;
  attribute vec2 startCorrection;
  attribute vec2 endCorrection;
  varying vec2 uvA;
  varying vec2 uvB;
  uniform float blend;
  uniform float size;
  uniform float roll;
  uniform vec2 viewport;
  uniform vec2 anchor;
  void main() {
    uvA = sourceA;
    uvB = sourceB;
    float t = blend;
    // Both sides of a key pose have the same position and angular velocity.
    vec2 local = mix(uvA,uvB,t) + startCorrection*t*(1.0-t)*(1.0-t)
      + endCorrection*t*t*(t-1.0) - vec2(.50,.43);
    float c = cos(roll);
    float s = sin(roll);
    vec2 position = anchor + size * mat2(c,s,-s,c) * local;
    gl_Position = vec4(position.x/viewport.x*2.0-1.0, 1.0-position.y/viewport.y*2.0, 0.0, 1.0);
  }
`;
  var fragmentSource = `
  precision highp float;
  uniform sampler2D poseA;
  uniform sampler2D poseB;
  uniform sampler2D silhouette;
  uniform sampler2D eyeOpening;
  uniform sampler2D irisSource;
  uniform float blend;
  uniform vec4 eyeA0;
  uniform vec4 eyeA1;
  uniform vec4 eyeB0;
  uniform vec4 eyeB1;
  uniform vec4 plateA0;
  uniform vec4 plateA1;
  uniform vec4 plateB0;
  uniform vec4 plateB1;
  uniform vec4 whitesA;
  uniform vec4 whitesB;
  uniform vec4 irisPatch;
  uniform vec2 look;
  uniform float gazeStrength;
  uniform float blink;
  uniform float shade;
  uniform float fadeBottom;
  uniform float registered;
  uniform float hasSilhouette;
  uniform float hasEyeOpening;
  uniform float naturalEyes;
  uniform vec2 maskGrid;
  uniform vec2 maskTileA;
  uniform vec2 maskTileB;
  varying vec2 uvA;
  varying vec2 uvB;

  vec2 moveEye(vec2 uv, vec4 region) {
    if (region.z <= 0.0) return uv;
    vec2 shift = look*min(region.zw/vec2(.038,.017),1.0);
    vec2 d = uv - region.xy;
    float distance = length((d-.35*shift)/region.zw);
    float influence = 1.0-smoothstep(.12,1.0,distance);
    return uv - shift*influence + vec2(0.0,d.y*blink*influence*3.0);
  }

  vec2 maskUv(vec2 uv, vec2 tile) {
    return (clamp(uv,.001,.999)+tile)/maskGrid;
  }

  vec3 sphereNormal(vec2 point) {
    return normalize(vec3(point,sqrt(max(0.0,1.0-dot(point,point)))));
  }

  vec3 drawIris(sampler2D map, vec2 uv, vec3 rgb, vec4 region, vec4 plate, vec2 whiteAt, vec2 tile) {
    if (region.z <= 0.0) return rgb;
    vec2 eye = (uv-region.xy)/region.zw;
    if (any(greaterThan(abs(eye),vec2(1.04)))) return rgb;
    float opening = texture2D(eyeOpening,maskUv(uv,tile)).r;
    float activity = smoothstep(.005,.30,gazeStrength);
    if (opening*activity < .002) return rgb;

    if (naturalEyes > .5) {
      // Reproject the original eye across a sphere behind its fixed lid aperture.
      // Keeping its source colors avoids a separately painted iris or sclera.
      float ballRadius = max(.032,region.z*1.05);
      vec3 surface = sphereNormal((uv-region.xy)/ballRadius);
      vec2 relative = (plate.xy-region.xy)/region.zw;
      vec2 reach = clamp(1.0-sign(look)*relative,.30,1.0);
      vec2 angle = look*vec2(12.0,12.0)*reach*gazeStrength;
      float sx = sin(angle.x), cx = cos(angle.x);
      float sy = sin(angle.y), cy = cos(angle.y);
      vec3 turned = vec3(cx*surface.x-sx*surface.z,surface.y,sx*surface.x+cx*surface.z);
      turned = vec3(turned.x,cy*turned.y-sy*turned.z,sy*turned.y+cy*turned.z);

      // Hold the lid border and limit displacement before it reaches skin.
      float horizontal = 1.0-smoothstep(.36,.96,length(eye));
      float vertical = 1.0-smoothstep(.48,.96,length(eye*vec2(.62,1.0)));
      vec2 sampleAt = uv+(turned.xy-surface.xy)*ballRadius*vec2(horizontal,vertical);
      float safe = smoothstep(.12,.59,texture2D(eyeOpening,maskUv(sampleAt,tile)).r);
      return mix(rgb,texture2D(map,sampleAt).rgb,opening*safe);
    }

    // Move the sphere under the original eyelids and use the same painted iris in every view.
    vec2 rest = (plate.xy-region.xy)/region.zw;
    vec2 target = mix(rest,look*vec2(44.0,59.0),gazeStrength);
    target *= min(1.0,.91/max(length(target),.01));
    vec3 normal = vec3(eye,sqrt(max(0.0,1.0-dot(eye,eye))));
    vec3 aim = vec3(target,sqrt(max(.04,1.0-dot(target,target))));
    vec3 tangent = normalize(vec3(aim.z,0.0,-aim.x));
    vec3 bitangent = cross(aim,tangent);
    vec2 local = vec2(dot(normal,tangent),dot(normal,bitangent))/vec2(.49,.70);
    float radius = length(local);
    float irisAlpha = (1.0-smoothstep(.91,1.02,radius))*smoothstep(.0,.18,dot(normal,aim));
    vec2 patch = local/max(1.0,radius)*.96;
    vec3 iris = texture2D(irisSource,irisPatch.xy+patch*irisPatch.zw).rgb;
    // Shade the whole exposed sclera so the painted rest iris cannot leave a ring.
    float light = .75+.23*normal.z-.075*max(eye.y,0.0)-.065*max(-eye.y-.12,0.0);
    vec3 sclera = texture2D(map,whiteAt).rgb*(light/.91);
    return mix(rgb,mix(sclera,iris,irisAlpha),opening*activity);
  }

  vec4 character(sampler2D map, vec2 uv, vec4 eye0, vec4 eye1, vec4 plate0, vec4 plate1, vec4 whites, vec2 tile) {
    vec3 rgb;
    if (hasEyeOpening > .5) {
      rgb = texture2D(map,uv).rgb;
      rgb = drawIris(map,uv,rgb,eye0,plate0,whites.xy,tile);
      rgb = drawIris(map,uv,rgb,eye1,plate1,whites.zw,tile);
    } else {
      rgb = texture2D(map,moveEye(moveEye(uv,eye0),eye1)).rgb;
    }
    // The sage backdrop is green-dominant; clay skin, hair and clothing are warm or neutral.
    float luma = dot(rgb, vec3(.21,.72,.07));
    float green = smoothstep(-.020,.017,rgb.g-rgb.r)
      * smoothstep(.061,.104,rgb.r-rgb.b)
      * smoothstep(.20,.33,luma);
    return vec4(rgb,1.0-green);
  }

  void main() {
    vec4 a = character(poseA,uvA,eyeA0,eyeA1,plateA0,plateA1,whitesA,maskTileA);
    vec4 b = character(poseB,uvB,eyeB0,eyeB1,plateB0,plateB1,whitesB,maskTileB);
    float appearance = mix(smoothstep(.26,.74,blend),blend,registered);
    float coverage = mix(a.a,b.a,appearance);
    float alpha = smoothstep(.24,.76,coverage);
    if (hasSilhouette > .5) {
      float edgeA = texture2D(silhouette,maskUv(uvA,maskTileA)).r;
      float edgeB = texture2D(silhouette,maskUv(uvB,maskTileB)).r;
      // Interpolate the outline itself so occluded ears or cheeks do not double-expose.
      alpha = smoothstep(.481,.519,mix(edgeA,edgeB,blend));
    }
    alpha *= 1.0-fadeBottom*smoothstep(.78,.996,mix(uvA.y,uvB.y,blend));
    // The silhouette can retain antialiased pixels that the color key discards.
    // Give those pixels their source color rather than exposing black at the edge.
    float weightA = max(a.a,.04*hasSilhouette);
    float weightB = max(b.a,.04*hasSilhouette);
    vec3 color = mix(a.rgb*weightA,b.rgb*weightB,appearance)
      / max(mix(weightA,weightB,appearance),.001);
    gl_FragColor = vec4(color*(1.0-shade), alpha);
  }
`;
  function meshIndices(side) {
    const indices = [];
    for (let row = 0; row < side - 1; row++) {
      for (let col = 0; col < side - 1; col++) {
        const top = row * side + col;
        const bottom = top + side;
        indices.push(top, bottom, top + 1, top + 1, bottom, bottom + 1);
      }
    }
    return new Uint16Array(indices);
  }
  var createAvatarRenderer = (canvas, images, poseNames = poses, poseMeshes, distanceImage, eyeOpeningImage) => {
    var _a, _b;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error("The avatar animation requires WebGL.");
    const compile = (type, source) => {
      var _a2;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error((_a2 = gl.getShaderInfoLog(shader)) != null ? _a2 : "");
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error((_a = gl.getProgramInfoLog(program)) != null ? _a : "");
    gl.useProgram(program);
    const uniform = (name) => gl.getUniformLocation(program, name);
    const uniforms = {
      blend: uniform("blend"),
      size: uniform("size"),
      roll: uniform("roll"),
      anchor: uniform("anchor"),
      look: uniform("look"),
      blink: uniform("blink"),
      gazeStrength: uniform("gazeStrength"),
      shade: uniform("shade"),
      fadeBottom: uniform("fadeBottom"),
      eyeRegions: [[uniform("eyeA0"), uniform("eyeA1")], [uniform("eyeB0"), uniform("eyeB1")]],
      eyePlates: [[uniform("plateA0"), uniform("plateA1")], [uniform("plateB0"), uniform("plateB1")]],
      whites: [uniform("whitesA"), uniform("whitesB")],
      registered: uniform("registered"),
      maskTiles: [uniform("maskTileA"), uniform("maskTileB")]
    };
    const viewport = uniform("viewport");
    gl.uniform1i(uniform("poseA"), 0);
    gl.uniform1i(uniform("poseB"), 1);
    gl.uniform1i(uniform("silhouette"), distanceImage ? 2 : 0);
    gl.uniform1f(uniform("hasSilhouette"), Number(Boolean(distanceImage)));
    gl.uniform1i(uniform("eyeOpening"), eyeOpeningImage ? 3 : 0);
    gl.uniform1f(uniform("hasEyeOpening"), Number(Boolean(eyeOpeningImage)));
    gl.uniform1f(uniform("naturalEyes"), Number(Boolean(poseMeshes == null ? void 0 : poseMeshes.naturalEyes)));
    const [maskColumns, maskRows] = (_b = poseMeshes == null ? void 0 : poseMeshes.maskGrid) != null ? _b : [3, 2];
    gl.uniform2f(uniform("maskGrid"), maskColumns, maskRows);
    gl.uniform1i(uniform("irisSource"), eyeOpeningImage ? 4 : 0);
    let width = 0;
    let height = 0;
    const attributes = [gl.getAttribLocation(program, "sourceA"), gl.getAttribLocation(program, "sourceB")];
    const corrections = [gl.getAttribLocation(program, "startCorrection"), gl.getAttribLocation(program, "endCorrection")];
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles), gl.STATIC_DRAW);
    const refined = /* @__PURE__ */ new Map();
    const refinedIndices = poseMeshes && meshIndices(poseMeshes.side);
    const refinedIndexBuffer = refinedIndices && gl.createBuffer();
    if (poseMeshes && refinedIndexBuffer && refinedIndices) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, refinedIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, refinedIndices, gl.STATIC_DRAW);
      for (const [pair, data] of Object.entries(poseMeshes.pairs)) {
        if (!data) continue;
        const bytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
        const view = new DataView(bytes.buffer);
        const coords = new Uint16Array(bytes.length / 2);
        for (let i = 0; i < coords.length; i++) coords[i] = view.getUint16(i * 2, true);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
        refined.set(pair, buffer);
      }
    }
    const uploadTexture = (image) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return texture;
    };
    const resources = new Map(poseNames.map((pose, index) => {
      var _a2, _b2, _c, _d, _e;
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, (_a2 = positions[pose]) != null ? _a2 : positions.front, gl.STATIC_DRAW);
      const texture = uploadTexture(images[index]);
      const toEyeUniforms = (values) => [
        values.slice(0, 4).map((value) => value / 480),
        values.slice(4, 8).map((value) => value / 480)
      ];
      const rig = poseMeshes == null ? void 0 : poseMeshes.eyeRig[pose];
      const empty = Array(10).fill(0);
      const driven = [(_b2 = rig == null ? void 0 : rig[0]) != null ? _b2 : empty, (_c = rig == null ? void 0 : rig[1]) != null ? _c : empty];
      const eyes = rig ? driven.map((eye) => eye.slice(0, 4)) : toEyeUniforms((_d = eyeRegions[pose]) != null ? _d : eyeRegions.front);
      const plates = rig ? driven.map((eye) => eye.slice(4, 8)) : toEyeUniforms((_e = eyePlates[pose]) != null ? _e : eyePlates.front);
      const whites = driven.flatMap((eye) => eye.slice(8, 10));
      return [pose, { buffer, texture, eyes, plates, whites }];
    }));
    if (distanceImage) {
      gl.activeTexture(gl.TEXTURE2);
      uploadTexture(distanceImage);
    }
    if (eyeOpeningImage) {
      gl.activeTexture(gl.TEXTURE3);
      uploadTexture(eyeOpeningImage);
      const front = resources.get("front");
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, front.texture);
      gl.uniform4fv(uniform("irisPatch"), front.plates[0]);
    }
    return (shot) => {
      var _a2, _b2;
      if (width !== canvas.width || height !== canvas.height) {
        width = canvas.width;
        height = canvas.height;
        gl.viewport(0, 0, width, height);
        gl.uniform2f(viewport, width, height);
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const mesh = refined.get(`${shot.from}/${shot.to}`);
      const shared = Boolean(mesh && (poseMeshes == null ? void 0 : poseMeshes.sharedTrack));
      const stride = shared ? 16 : 8;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh ? refinedIndexBuffer : indexBuffer);
      corrections.forEach((attribute, index) => {
        if (shared) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh);
          gl.enableVertexAttribArray(attribute);
          gl.vertexAttribPointer(attribute, 2, gl.SHORT, true, stride, 8 + index * 4);
        } else {
          gl.disableVertexAttribArray(attribute);
          gl.vertexAttrib2f(attribute, 0, 0);
        }
      });
      [shot.from, shot.to].forEach((pose, unit) => {
        var _a3;
        const { buffer, texture, eyes, plates, whites } = resources.get(pose);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh != null ? mesh : buffer);
        gl.enableVertexAttribArray(attributes[unit]);
        if (mesh) {
          gl.vertexAttribPointer(attributes[unit], 2, gl.UNSIGNED_SHORT, true, stride, unit * 4);
        } else {
          gl.vertexAttribPointer(attributes[unit], 2, gl.FLOAT, false, 0, 0);
        }
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const tile = (_a3 = poseMeshes == null ? void 0 : poseMeshes.maskPoses.indexOf(pose)) != null ? _a3 : 0;
        gl.uniform2f(uniforms.maskTiles[unit], tile % maskColumns, Math.floor(tile / maskColumns));
        gl.uniform4fv(uniforms.eyeRegions[unit][0], eyes[0]);
        gl.uniform4fv(uniforms.eyeRegions[unit][1], eyes[1]);
        gl.uniform4fv(uniforms.eyePlates[unit][0], plates[0]);
        gl.uniform4fv(uniforms.eyePlates[unit][1], plates[1]);
        gl.uniform4fv(uniforms.whites[unit], whites);
      });
      gl.uniform1f(uniforms.blend, shot.blend);
      gl.uniform1f(uniforms.size, shot.size);
      gl.uniform1f(uniforms.roll, shot.roll);
      gl.uniform2f(uniforms.anchor, shot.x, shot.y);
      gl.uniform2f(uniforms.look, shot.lookX, shot.lookY);
      gl.uniform1f(uniforms.gazeStrength, (_a2 = shot.gazeStrength) != null ? _a2 : 0);
      gl.uniform1f(uniforms.blink, shot.blink);
      gl.uniform1f(uniforms.shade, shot.shade);
      gl.uniform1f(uniforms.fadeBottom, (_b2 = shot.fadeBottom) != null ? _b2 : 0);
      gl.uniform1f(uniforms.registered, Number(Boolean(mesh)));
      gl.drawElements(gl.TRIANGLES, mesh ? refinedIndices.length : triangles.length, gl.UNSIGNED_SHORT, 0);
    };
  };
  return __toCommonJS(avatarRenderer_exports);
})();
