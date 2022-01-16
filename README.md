# vue-sticky-directive-io

一个基于IntersectionObserver模拟实现 position: sticky的效果的高性能vue指令。
发现bug请联系baoyi.cui@klook.com

# 安装

```
npm ivue-sticky-directive-io --save
```

## 用法

```
import Sticky from 'vue-sticky-directive-io'

// 全局使用

Vue.use(Sticky)



// 局部使用

new Vue({

  directives: {Sticky}

})
```

## Html getAttribute选项

-   `sticky-offset` *(string)* - 设置偏移值, 可以是组件内部data的key, 可也以是string描述的对象 例如 `{top: 10, bottom: 20}` 

    -   `top` *(number)* - 默认0

    -   `bottom` *(number)* - （相对于父元素）默认0  *如果bottom > 0 则滑动过其父元素则保持sticky状态  相当于开启了sticky-side both 属性

-   `sticky-side` *(* `both` *)* - sticky元素滚动出其父元素外 是否还继续保持状态 设为both 则滑动过其父元素则不再保持sticky状态 `sticky-offset`的 bottom 是可以设置偏移值

<!---->

-   `sticky-z-index` *(number)* - 设置 z-index 值

<!---->

-   `on-stick` *(string)* - 当sticky的状态发生改变的回调函数。这里是vue component methods 中的函数名。它将要接受一个参数 值为sticky的状态 boolean

```

<div
    class="sticky"
    v-sticky
    sticky-offset="{top: 10, bottom: 30}"
    sticky-side="both"
    on-stick="onStick"
    sticky-z-index="20"
    sticky-side="both"
/>
```

## 指令选项
v-sticky:onStick.both=[zindex, top, bottom]
    -   指令参数arg: 回调函数名  v-sticky:onStick
    -   指令参数修饰符: sticky-side的值  v-sticky.both


## 指令value选项
```
<div
    class="sticky"
    v-sticky="{
        stickSide: 'both' 默认 -- // 滚动出父元素外 是否还继续保持状态
        top: number  默认 0
        bottom: number  默认 0
        zIndex: number  默认 3
        onStick?: Function | string  默认 undefined
    }"

/>
```

-   v-sticky="20" 值为 number 时 20 会赋值给top
-   v-sticky="'onStick'" 值为 string 时 onStick为回调函数名
-   v-sticky="false" 值为 boolean 时 false为滚动出父元素外 是否还继续保持状态
-   v-sticky="{ top: 10 }" 值为 object 时 会使用{ top: 0 } 和默认选项合并
-   v-sticky="methods"  methods 如果是当前vue 的一个方法  则设置为回调函数名
-   v-sticky="[10, 20, 30]" value还可以是一个number[]  分别对应设置 选项的 ['zIndex', 'top', 'bottom']
