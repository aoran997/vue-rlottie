import { AllowedComponentProps } from 'vue';
import { ComponentCustomProps } from 'vue';
import { ComponentOptionsMixin } from 'vue';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { PropType } from 'vue';
import { VNodeProps } from 'vue';

declare const _default: DefineComponent<{
    name: StringConstructor;
    data: PropType<Object | String | Uint8Array>;
    /**
     * speed >= 1
     */
    speed: {
        type: PropType<String | Number>;
        default: number;
    };
    loop: {
        type: BooleanConstructor;
        default: boolean;
    };
    autoPlay: {
        type: BooleanConstructor;
        default: boolean;
    };
}, {
    totalFrame: number;
    currentFrame: number;
    play: typeof play;
    stop: typeof stop_2;
    seek: typeof seek;
    reload: typeof reload;
}, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
    update: (name: string) => void;
    play: (name: string) => void;
    stop: (name: string) => void;
    destroy: (name: string) => void;
    loaded: (name: string) => void;
}, string, VNodeProps & AllowedComponentProps & ComponentCustomProps, Readonly<ExtractPropTypes<{
    name: StringConstructor;
    data: PropType<Object | String | Uint8Array>;
    /**
     * speed >= 1
     */
    speed: {
        type: PropType<String | Number>;
        default: number;
    };
    loop: {
        type: BooleanConstructor;
        default: boolean;
    };
    autoPlay: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & {
    onUpdate?: (name: string) => any;
    onPlay?: (name: string) => any;
    onStop?: (name: string) => any;
    onDestroy?: (name: string) => any;
    onLoaded?: (name: string) => any;
}, {
    speed: String | Number;
    loop: boolean;
    autoPlay: boolean;
}, {}>;
export default _default;

declare function play(): void;

declare function reload(data: string | object | Uint8Array, name: string): void;

declare function seek(frame: number): void;

declare function stop_2(): void;

export { }
