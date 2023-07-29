
struct TransformData {
    viewProjectionMatrix : mat4x4<f32>
}

struct ObjectData {
    model : array<mat4x4<f32>>,
}

//struct NormalData {
//    model3 : array<mat3x3<f32>>
//}

@binding(0) @group(0) var<uniform> transformUBO : TransformData;
@binding(1) @group(0) var<storage, read> objects : ObjectData;
//@binding(2) @group(0) var<storage, read> normals : NormalData;

struct Fragment {
    @builtin(position) position : vec4<f32>,
    @location(0) wsPosition : vec4<f32>,
    @location(1) wsNormal : vec4<f32>,
    @location(2) texCoord : vec2<f32>
}

@vertex
fn vs_main(@builtin(instance_index) ID : u32, @location(0) vertexPosition : vec3<f32>,
    @location(1) vertexNormal : vec3<f32>, @location(2) texCoord : vec2<f32>) -> Fragment {

    var output : Fragment;

    var mvp : mat4x4<f32> = transformUBO.viewProjectionMatrix * objects.model[ID];

    output.position = mvp * vec4<f32>(vertexPosition, 1.0);

    output.wsPosition = objects.model[ID] * vec4<f32>(vertexPosition, 1.0);

    let model3 : mat3x3<f32> = mat3x3<f32>(objects.model[ID][0].xyz, objects.model[ID][1].xyz, objects.model[ID][2].xyz);
    output.wsNormal = vec4<f32>(normalize(model3 * vertexNormal), 0.0);

    output.texCoord = texCoord;

    return output;
}
