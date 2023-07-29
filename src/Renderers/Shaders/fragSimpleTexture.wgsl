
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

@binding(0) @group(3) var Texture : texture_2d<f32>;
@binding(1) @group(3) var Sampler : sampler;

@fragment
fn fs_simple_texture(@location(0) wsPosition : vec4<f32>, @location(1) wsNormal : vec4<f32>,
    @location(2) texCoord : vec2<f32>) -> @location(0) vec4<f32> {

    let baseColor = textureSample(Texture, Sampler, texCoord);

    var fragColor = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    fragColor += vec4<f32>(material.emissive.r, material.emissive.g, material.emissive.b, 0.0);

    fragColor += vec4<f32>(baseColor.rgb, 0.0);

    return vec4<f32>(fragColor.rgb, baseColor.a);

}