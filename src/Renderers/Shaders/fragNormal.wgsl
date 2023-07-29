
struct lightSource {
    dir : vec3<f32>,
    sourceType : f32,
    color : vec3<f32>,
    angle : f32,
    pos : vec3<f32>,
    penumbra : f32,
    falloffFunc : vec3<f32>,
    falloffType : f32,
    range : f32
}

struct lightData {
    lightCount : i32,
    lightSources : array<lightSource>
}

@binding(0) @group(1) var<storage, read> lightDataBuffer : lightData;
@binding(1) @group(1) var<uniform> wsCamera : vec3<f32>;

@fragment
fn fs_normal(@location(0) wsPosition : vec4<f32>, @location(1) wsNormal : vec4<f32>,
    @location(2) texCoord : vec2<f32>) -> @location(0) vec4<f32> {

    let normal : vec3<f32> = vec3<f32>(wsNormal.x, wsNormal.y, wsNormal.z);
    var normal4 : vec4<f32> = vec4<f32>(normalize(normal) * 0.5 + 0.5, 1.0);

    return normal4;
}