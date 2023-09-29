# vue-rlottie
rlottie vue tool
Thanks [rlottie](https://github.com/Samsung/rlottie)

### Install
```
pnpm install vue-rlottie
```
#### or
```
npm install vue-rlottie
```


###Example
```
<script setup lang="ts">
import VueRlottie from 'vue-rlottie'
</script>

<template>
  <VueRlottie speed="1" :loop="false" name="example"/>
</template>
```

| **Props** | **Type** | **description** |
|:--|:-:|:-:|
| name | String | required |
| data | Object \| String \| Uint8Array | lottie json data
| speed | number \| String | >= 1 |
| loop | Boolean | default = true |
| autoPlay | Boolean | default = true |

| **attribute** | **Name** |
|:--|:-:|
| totalFrame | Number |
| currentFrame | Number |

| **Listener** | **params** |
|:--|:-:|
| onUpdate | name: string |
| onPlay | name: string |
| onStop | name: string |
| onDestroy | name: string |
| onLoaded | name: string |

| **Function** | **params** | **description** |
|:--|:-:|:-:|
| play | |
| stop | |
| seek | frame: numer | frame > totalFrame ? totalFrame : frame |
| reload | data: string \| object \| Uint8Array, name: string |