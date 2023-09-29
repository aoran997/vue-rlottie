import Module from './rlottie-wasm'
let canvasStorage: { [key: string]: ImageBitmap[] } = {}
let canvasStorageLoaded: { [key: string]: number } = {}

let indexedDBB: IDBDatabase
let flag = 0

interface Data {
  url: string
  count: number
  data: ImageBitmap[]
}
const request = window.indexedDB.open('rlottie-sticker', 1)
request.onsuccess = function (e) {
  indexedDBB = this.result
}

request.onupgradeneeded = function (e) {
  indexedDBB = this.result

  if (1) {
    if (indexedDBB.objectStoreNames.contains('rlottie')) {
      indexedDBB.deleteObjectStore('rlottie')
    }
    const objectStore = indexedDBB.createObjectStore('rlottie', {
      keyPath: 'url',
    })
    objectStore.createIndex('data', 'data', { unique: false })
  }
}

async function getDbData(key: string) {
  return new Promise<Data>((resolve) => {
    const data: IDBRequest<Data> = indexedDBB
      .transaction(['rlottie'], 'readonly')
      .objectStore('rlottie')
      .get(key)
    data.onsuccess = () => {
      resolve(data.result)
    }
  })
}

export default class RlottieModule {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  lottieHandle?: Module.RlottieWasm
  totalFrame: any
  curFrame: number
  playing: boolean = false
  key: string
  observer?: IntersectionObserver
  canvasStorage: ImageBitmap[]
  buf: Uint8Array
  speed: String | Number = 1
  loop = true
  handle: {
    play?: () => void
    stop?: () => void
    destroy?: () => void
    update?: (frame: number) => void
    loaded?: () => void
  }

  constructor(canvas: HTMLCanvasElement, buf: Uint8Array, key: string) {
    this.handle = {}
    this.buf = buf
    this.canvasStorage = []
    this.context = canvas.getContext('2d')!
    this.curFrame = 0
    this.canvas = canvas
    if (buf.length === 0) {
      key = '__default__'
    }
    this.key = key
    if (this.key) {
      this.key = `${this.key}_${this.canvas.width}_${this.canvas.height}`
    }
    this.init()
  }

  private init() {
    if (!Module.RlottieWasm) {
      setTimeout(() => {
        this.init()
      }, 200)
    } else {
      this.bind()
    }
  }

  private bind() {
    this.context = this.canvas.getContext('2d')!
    //@ts-ignore
    this.lottieHandle = new Module.RlottieWasm()
    if (this.buf.length !== 0) {
      this.lottieHandle.load(this.buf)
    }
    this.curFrame = 0
    if (this.key) {
      if (!canvasStorage[this.key]) {
        canvasStorage[this.key] = []
      }
    }
    if (this.handle.loaded) {
      this.handle.loaded()
    }
    if (this.key) {
      if (!canvasStorageLoaded[this.key]) {
        getDbData(this.key).then((res) => {
          if (res) {
            this.totalFrame = res.count
            this.setFrameCountLoaded()
            for (let i = 0; i < res.data.length; i++) {
              this.setStoreImage(res.data[i], i)
            }
          } else {
            this.totalFrame = this.lottieHandle?.frames()
          }
          this.bindObserver()
        })
      } else {
        this.totalFrame = canvasStorageLoaded[this.key]
        for (let i = 0; i < canvasStorage[this.key].length; i++) {
          this.setStoreImage(canvasStorage[this.key][i], i)
        }
        this.bindObserver()
      }
    } else {
      this.totalFrame = this.lottieHandle.frames()
      this.bindObserver()
    }
  }

  private bindObserver() {
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.play()
      } else {
        this.stop()
      }
    })
    this.observer.observe(this.canvas)
  }

  private setStoreImage(img: ImageBitmap, currentFrame: number) {
    this.canvasStorage[currentFrame] = img
    if (this.key && canvasStorage[this.key]) {
      canvasStorage[this.key][currentFrame] = img
    }
  }

  private setFrameCountLoaded() {
    if (!this.key) {
      return
    }
    canvasStorageLoaded[this.key] = this.totalFrame
  }

  private async render(speed: number) {
    if (this.canvas.width == 0 || this.canvas.height == 0) return
    if (!!this.canvasStorage[this.curFrame]) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.drawImage(this.canvasStorage[this.curFrame], 0, 0)
      this.curFrame = Number(this.curFrame) + speed
      if (this.totalFrame <= this.curFrame) {
        if (this.loop) {
          this.curFrame = 0
        } else {
          this.stop()
        }
      }
      return
    }
    var buffer = this.lottieHandle!.render(
      this.curFrame,
      this.canvas.width,
      this.canvas.height
    )
    let currentFrame = this.curFrame
    var result = Uint8ClampedArray.from(buffer)
    var imageData = new ImageData(result, this.canvas.width, this.canvas.height)
    let img = await createImageBitmap(imageData)
    this.setStoreImage(img, currentFrame)
    if (currentFrame === 0) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.drawImage(this.canvasStorage[currentFrame], 0, 0)
    }
    this.curFrame = Number(this.curFrame) + speed
    if (this.totalFrame <= this.curFrame) {
      if (this.loop) {
        this.curFrame = 0
      } else {
        this.stop()
      }
      this.setFrameCountLoaded()
      if (this.key) {
        let hv = indexedDBB
          ?.transaction(['rlottie'], 'readwrite')
          ?.objectStore('rlottie')
          .count(this.key)
        hv.onsuccess = () => {
          if (hv.result > 0) {
            indexedDBB
              ?.transaction(['rlottie'], 'readwrite')
              ?.objectStore('rlottie')
              .put({
                url: this.key,
                count: this.totalFrame,
                data: this.canvasStorage,
              })
          } else {
            indexedDBB
              ?.transaction(['rlottie'], 'readwrite')
              ?.objectStore('rlottie')
              .add({
                url: this.key,
                count: this.totalFrame,
                data: this.canvasStorage,
              })
          }
        }
        indexedDBB
          ?.transaction(['rlottie'], 'readwrite')
          ?.objectStore('rlottie')
          .add({
            url: this.key,
            count: this.totalFrame,
            data: this.canvasStorage,
          })
      }
    }
  }

  play() {
    if (flag === -1) {
      throw new Error('indexedDb open faild')
    }
    this.playing = true
    if (this.handle.play) {
      this.handle.play()
    }
    this.update()
  }

  stop() {
    if (flag === -1) {
      throw new Error('indexedDb open faild')
    }
    if (this.handle.stop) {
      this.handle.stop()
    }
    this.playing = false
  }

  reload(data: Uint8Array, key: string) {
    if (this.lottieHandle) {
      this.stop()
      requestAnimationFrame(() => {
        this.buf = data
        this.canvasStorage = []
        if (data.length === 0) {
          key = '__default__'
          this.lottieHandle = new Module.RlottieWasm()
        } else {
          this.lottieHandle?.load(data)
        }
        this.key = key
        if (this.key) {
          this.key = `${this.key}_${this.canvas.width}_${this.canvas.height}`
        }
        this.curFrame = 0
        if (this.key) {
          if (!canvasStorageLoaded[this.key]) {
            getDbData(this.key)
              .then((res) => {
                if (res) {
                  this.totalFrame = res.count
                  this.setFrameCountLoaded()
                  for (let i = 0; i < res.data.length; i++) {
                    this.setStoreImage(res.data[i], i)
                  }
                } else {
                  this.totalFrame = this.lottieHandle?.frames()
                }
                this.bindObserver()
              })
              .finally(() => {
                this.play()
              })
          } else {
            this.totalFrame = canvasStorageLoaded[this.key]
            for (let i = 0; i < canvasStorage[this.key].length; i++) {
              this.setStoreImage(canvasStorage[this.key][i], i)
            }
            this.play()
          }
        } else {
          this.play()
        }
      })
    } else {
      this.buf = data
      this.key = key
    }
  }

  private update() {
    if (!this.canvas || !this.canvas.isConnected) {
      delete this.lottieHandle
      this.observer?.disconnect()
      this.observer = undefined
      this.stop()
      if (this.handle.destroy) {
        this.handle.destroy()
      }
      return
    }
    if (!this.playing) {
      return
    }
    requestAnimationFrame(async () => {
      await this.render(Number(this.speed))
      if (this.handle.update) {
        this.handle.update(this.curFrame)
      }
      this.update()
    })
  }
}
