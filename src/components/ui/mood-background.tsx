'use client'

import { useEffect, useRef } from 'react'

export function MoodBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // Fragment shader with mood gradients
    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      vec3 moodColor1 = vec3(0.9, 0.6, 0.3); // Warm orange (starting color)
      vec3 moodColor2 = vec3(0.2, 0.4, 0.8); // Deeper blue
      vec3 moodColor3 = vec3(0.4, 0.7, 0.4); // Richer green
      vec3 moodColor4 = vec3(0.6, 0.3, 0.7); // Deeper purple

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        
        // Create multiple gradient layers
        float time1 = u_time * 0.3;
        float time2 = u_time * 0.2;
        float time3 = u_time * 0.4;
        
        // First gradient layer
        vec2 center1 = vec2(0.3 + 0.2 * sin(time1), 0.4 + 0.2 * cos(time1 * 0.7));
        float dist1 = distance(uv, center1);
        float gradient1 = smoothstep(1.2, 0.0, dist1);
        
        // Second gradient layer
        vec2 center2 = vec2(0.7 + 0.15 * sin(time2), 0.6 + 0.15 * cos(time2 * 0.8));
        float dist2 = distance(uv, center2);
        float gradient2 = smoothstep(1.0, 0.0, dist2);
        
        // Third gradient layer
        vec2 center3 = vec2(0.2 + 0.25 * sin(time3), 0.8 + 0.25 * cos(time3 * 0.6));
        float dist3 = distance(uv, center3);
        float gradient3 = smoothstep(1.1, 0.0, dist3);
        
        // Blend gradients
        float blend1 = gradient1 * 0.4 + gradient2 * 0.3 + gradient3 * 0.3;
        float blend2 = gradient2 * 0.5 + gradient1 * 0.3 + gradient3 * 0.2;
        float blend3 = gradient3 * 0.4 + gradient1 * 0.4 + gradient2 * 0.2;
        
        // Create smooth transitions between mood colors
        float transition1 = 0.7 + 0.3 * sin(u_time * 0.08); // Start more orange
        float transition2 = 0.5 + 0.5 * sin(u_time * 0.15 + 1.0);
        float transition3 = 0.5 + 0.5 * sin(u_time * 0.12 + 2.0);
        
        // Mix colors based on transitions
        vec3 color1 = mix(moodColor1, moodColor2, transition1);
        vec3 color2 = mix(moodColor3, moodColor4, transition2);
        vec3 color3 = mix(moodColor2, moodColor1, transition3);
        
        // Combine all gradients
        vec3 finalColor = color1 * blend1 + color2 * blend2 + color3 * blend3;
        
        // Add subtle noise for texture
        float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
        finalColor += vec3(noise * 0.02);
        
        // Add a base color to prevent white areas
        vec3 baseColor = vec3(0.1, 0.15, 0.25); // Dark blue-gray base
        finalColor = mix(baseColor, finalColor, 0.7); // Blend with base color
        
        // Ensure colors stay within reasonable bounds and never get too light
        finalColor = clamp(finalColor, 0.05, 0.85); // Prevent pure white and pure black
        
        gl_FragColor = vec4(finalColor, 0.8); // More prominent opacity
      }
    `

    // Create shaders
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (!vertexShader || !fragmentShader) return

    // Create program
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Create full-screen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ])

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')

    // Animation loop
    const startTime = Date.now()
    const animate = () => {
      const time = (Date.now() - startTime) * 0.001 // Convert to seconds
      
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(positionBuffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
} 