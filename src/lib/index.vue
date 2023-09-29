<template>
  <canvas ref="canvas" onload="onload"></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted, PropType, watch } from 'vue'
import RlottieModule from './RlottieModule';

const canvas = ref(document.createElement('canvas'))
let totalFrame = 0
let currentFrame = 0
let rlottie: RlottieModule
const props = defineProps({
  name: String,
  data: Object as PropType<String | Object | Uint8Array>,
  /**
   * speed >= 1
   */
  speed: {
    type: String as PropType<Number | String>,
    default: 1
  },
  loop: {
    type: Boolean,
    default: true
  },
  autoPlay: {
    type: Boolean,
    default: true
  }
})

watch(() => props.speed, () => {
  rlottie.speed = props.speed
})

const emit = defineEmits<{
  (e: 'update', name: string): void
  (e: 'play', name: string): void
  (e: 'stop', name: string): void
  (e: 'destroy', name: string): void
  (e: 'loaded', name: string): void
}>()

//string to utf8
function strToUtf8Bytes(text: string) {
  const code = encodeURIComponent(text)
  const bytes = []
  for (let i = 0; i < code.length; i++) {
    const c = code.charAt(i)
    if (c === '%') {
      const hex = code.charAt(i + 1) + code.charAt(i + 2)
      const hexval = parseInt(hex, 16)
      bytes.push(hexval)
      i += 2
    } else {
      bytes.push(c.charCodeAt(0))
    }
  }
  return Uint8Array.from(bytes)
}
let name = props.name

let tmp = ''
let bytes = Uint8Array.from([])
if (props.data) {
  if (props.data instanceof Uint8Array) {
    bytes = props.data
  } else {
    if (typeof props.data === 'string') {
      tmp = JSON.stringify(props.data)
    } else {
      tmp = JSON.stringify(props.data)
    }
    bytes = strToUtf8Bytes(tmp)
  }
}
onMounted(() => {
  rlottie = new RlottieModule(canvas.value, bytes, name)
  rlottie.speed = props.speed
  rlottie.loop = props.loop
  rlottie.handle.play = () => emit('play', name)
  rlottie.handle.stop = () => emit('stop', name)
  rlottie.handle.destroy = () => emit('destroy', name)
  rlottie.handle.update = () => emit('update', name)
  rlottie.handle.loaded = () => {
    if (props.autoPlay) {
      rlottie.play()
    }
    emit('loaded', name)
  }
  totalFrame = rlottie.totalFrame
  currentFrame = rlottie.curFrame
})

function play() {
  rlottie.play()
}

function stop() {
  rlottie.stop()
}

function seek(frame: number) {
  rlottie.curFrame = frame > rlottie.totalFrame ? rlottie.totalFrame : frame
}

function reload(data: string | object | Uint8Array, name: string) {
  let bytes = Uint8Array.from([])
  if (data) {
    if (data instanceof Uint8Array) {
      bytes = data
    } else {
      if (typeof props.data === 'string') {
        tmp = JSON.stringify(data)
      } else {
        tmp = JSON.stringify(data)
      }
      bytes = strToUtf8Bytes(tmp)
    }
  }
  rlottie.reload(bytes, name)
}

defineExpose({
  totalFrame,
  currentFrame,
  play,
  stop,
  seek,
  reload
})

</script>
