
class TestShader extends Phaser.Renderer.WebGL.Pipelines.PreFXPipeline {


  constructor(game){
      super({
          game, 
          fragShader: `
        precision mediump float;

        uniform sampler2D uMainSampler;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uRadius;
        uniform float uIntensity;

        varying vec2 outTexCoord;

        void main(void) {
          vec4 texel = texture2D(uMainSampler, outTexCoord);

          float t = mod(uTime * uSpeed, 1.0);
          vec2 shinePos = vec2(t, t);

          float dist = length(outTexCoord - shinePos);
          float glow = smoothstep(uRadius, 0.0, dist);

          // Measure how far the shine centre is from the edges (0=outside, 1=fully inside)
          float edgeDist = min(
            min(shinePos.x, 1.0 - shinePos.x),
            min(shinePos.y, 1.0 - shinePos.y)
          );
          float fade = smoothstep(0.0, uRadius, edgeDist);

          vec3 result = texel.rgb + vec3(1.0) * glow * fade * uIntensity * texel.a;

          gl_FragColor = vec4(result, texel.a);
        }
      `
      });}

      onPreRender(gameObject) {
        super.onBind(gameObject);
        this.set1f('uTime', this.game.loop.time / 500);
        this.set1f('uSpeed', 0.3);
        this.set1f('uRadius', 0.8);  
        this.set1f('uIntensity',0.3);
      }
}