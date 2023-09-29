declare module Module {
  class RlottieWasm {
    load: (uint8: Uint8Array) => {}
    frames: () => number
    render: (cur: number, width: number, height: number) => Uint8Array
  }
}

export = Module