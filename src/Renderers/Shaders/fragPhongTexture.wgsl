
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
    ka : vec3<f32>,
    shininess : f32,
    ks : vec3<f32>,
    kd : vec3<f32>,
    emissive : vec3<f32>,
}

@binding(0) @group(1) var<storage, read> lightDataBuffer : lightData;
@binding(1) @group(1) var<uniform> wsCamera : vec3<f32>;
@binding(0) @group(2) var<uniform> material : materialData;

@binding(0) @group(3) var Texture : texture_2d<f32>;
@binding(1) @group(3) var Sampler : sampler;

@fragment
fn fs_phong_texture(@location(0) wsPosition : vec4<f32>, @location(1) wsNormal : vec4<f32>,
    @location(2) texCoord : vec2<f32>) -> @location(0) vec4<f32> {

    let baseColor = textureSample(Texture, Sampler, texCoord);

    // 1 is directional light, 2 is point light, 3 is spot light

    let normal : vec3<f32> = normalize(vec3<f32>(wsNormal.x, wsNormal.y, wsNormal.z));
    let position : vec3<f32> = vec3<f32>(wsPosition.x, wsPosition.y, wsPosition.z);

    var fragColor : vec4<f32> = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    fragColor += vec4<f32>(material.ka.r, material.ka.g, material.ka.b, 0.0);
    fragColor += vec4<f32>(material.emissive.r, material.emissive.g, material.emissive.b, 0.0);
    var fragAcc : vec4<f32> = vec4<f32>(0.0, 0.0, 0.0, 0.0);

    for (var i = 0; i < lightDataBuffer.lightCount; i++) {
        let light : lightSource = lightDataBuffer.lightSources[i];

        if (light.sourceType == 1) {
            let dirToLight : vec3<f32> = normalize(-light.dir);
            let diff : vec3<f32> = material.kd * clamp(dot(normal, dirToLight), 0.0, 1.0);

            let reflectedLight : vec3<f32> = normalize(reflect(-dirToLight, normal));
            let dirToCam : vec3<f32> = normalize(wsCamera - position);
            var spec : vec3<f32>;
            if (material.shininess == 0) {
                spec = material.ks;
            }
            else {
                spec = material.ks * pow(clamp(dot(reflectedLight, dirToCam), 0.0, 1.0), material.shininess);
            }

            fragAcc = vec4<f32>(clamp(light.color * (diff + spec),
                vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0)), 0);
        }

        else if (light.sourceType == 2) {
            let distance : f32 = distance(light.pos, position);
            if (distance > light.range) {
                continue;
            }

            let dirToLight : vec3<f32> = normalize(light.pos - position);
            let diff : vec3<f32> = material.kd * clamp(dot(normal, dirToLight), 0.0, 1.0);

            let fatt : f32 = calculateFatt(light.falloffType, light.falloffFunc, distance);

            let reflectedLight : vec3<f32> = normalize(reflect(-dirToLight, normal));
            let dirToCam : vec3<f32> = normalize(wsCamera - position);
            var spec : vec3<f32>;
            if (material.shininess == 0) {
                spec = material.ks;
            }
            else {
                spec = material.ks * pow(clamp(dot(reflectedLight, dirToCam), 0.0, 1.0), material.shininess);
            }

            fragAcc = fatt * vec4<f32>(clamp(light.color * (diff + spec),
                vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0)), 0);
        }

        else if (light.sourceType == 3) {
            let distance : f32 = distance(light.pos, position);
            if (distance > light.range) {
                continue;
            }

            let dirToLight : vec3<f32> = normalize(light.pos - position);
            let diff : vec3<f32> = material.kd * clamp(dot(normal, dirToLight), 0.0, 1.0);

            let fatt : f32 = calculateFatt(light.falloffType, light.falloffFunc, distance);

            let reflectedLight : vec3<f32> = normalize(reflect(-dirToLight, normal));
            let dirToCam : vec3<f32> = normalize(wsCamera - position);
            var spec : vec3<f32>;
            if (material.shininess == 0) {
                spec = material.ks;
            }
            else {
                spec = material.ks * pow(clamp(dot(reflectedLight, dirToCam), 0.0, 1.0), material.shininess);
            }

            let lightDir : vec3<f32> = normalize(light.dir);

            var angleX : f32 = max(0, dot(lightDir, -dirToLight));
            angleX = acos(angleX);
            let thetaOuter : f32 = light.angle;
            let thetaInner : f32 = (light.angle - light.penumbra);

            if (angleX <= thetaOuter) {
                let fc : vec4<f32> = fatt * vec4<f32>(clamp(light.color * (diff + spec),
                    vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0)), 0);

                if (angleX <= thetaInner) {
                    fragAcc = fc;
                }
                else {
                    let fo : f32 = (1.0 - falloff(angleX, thetaInner, thetaOuter));
                    fragAcc = fo * fc;
                }
            }
        }

        fragAcc *= baseColor;
        fragColor += fragAcc;
    }

    return vec4<f32>(fragColor.rgb, baseColor.a);
}

fn calculateFatt(falloffType : f32, falloffFunc : vec3<f32>, distance : f32) -> f32 {
    // 0 is constant, 1 is linear, 2 is quadratic
    var fatt : f32;

    if (falloffType == 0) {
        fatt = 1.0;
    }
    else if (falloffType == 1) {
        fatt = min(1.0, 1.0 / (falloffFunc[0] + falloffFunc[1] * distance));
    }
    else if (falloffType == 2) {
        fatt = min(1.0, 1.0 / (falloffFunc[0] + falloffFunc[1] * distance
                + falloffFunc[2] * pow(distance, 2)));
    }

    return fatt;
}

fn falloff(x : f32, thetaInner : f32, thetaOuter : f32) -> f32 {
    let param : f32 = (x - thetaInner) / (thetaOuter - thetaInner);
    return -2.0 * pow(param, 3) + 3.0 * pow(param, 2);
}