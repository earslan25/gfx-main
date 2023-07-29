
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

struct materialData {
    emissive : vec3<f32>,
}

@binding(0) @group(1) var<storage, read> lightDataBuffer : lightData;
@binding(1) @group(1) var<uniform> wsCamera : vec3<f32>;
@binding(0) @group(2) var<uniform> material : materialData;

@fragment
fn fs_simple(@location(0) wsPosition : vec4<f32>, @location(1) wsNormal : vec4<f32>,
    @location(2) texCoord : vec2<f32>) -> @location(0) vec4<f32> {

    return vec4<f32>(material.emissive.r, material.emissive.g, material.emissive.b, 1.0);
}