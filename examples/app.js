"use strict";
var getType = function (obj) { return Object.prototype.toString.call(obj).slice(8, -1); };
var EasyIntersectionObserver = /** @class */ (function () {
    function EasyIntersectionObserver(el, cb, options) {
        this.elList = [];
        this.io = new window.IntersectionObserver(cb, options);
        el && this.initObserver(el);
    }
    EasyIntersectionObserver.prototype.initObserver = function (el) {
        if (this.elList && this.elList.length) {
            this.unobserve();
        }
        if (el.length) {
            if (typeof el === 'string') {
                el = document.querySelectorAll(el) || [];
            }
            this.elList = Array.from(el);
        }
        else if (getType(el).includes('Element')) {
            this.elList = [el];
        }
        this.elList.length && this.observe();
    };
    EasyIntersectionObserver.prototype.observe = function (el) {
        var _this = this;
        if (el) {
            if (!this.elList.includes(el)) {
                this.elList.push(el);
                this.io.observe(el);
            }
        }
        else {
            this.elList.forEach(function (_el) { return _this.io.observe(_el); });
        }
    };
    EasyIntersectionObserver.prototype.unobserve = function (el) {
        var _this = this;
        if (el === undefined) {
            this.elList.forEach(function (_el) { return _this.io.unobserve(_el); });
            this.elList = [];
        }
        else {
            if (typeof el !== 'number') {
                el = this.elList.indexOf(el);
            }
            if (this.elList[el]) {
                var _el = this.elList.splice(el, 1)[0];
                this.io.unobserve(_el);
            }
        }
    };
    EasyIntersectionObserver.prototype.disconnect = function () {
        this.unobserve();
        this.io.disconnect();
    };
    return EasyIntersectionObserver;
}());
var Sticky = {
    inserted(el, { modifiers, arg, value }, { context }) {
        if (typeof window !== 'object' || typeof window.IntersectionObserver !== 'function') {
            return;
        }
        const options = {
            zIndex: 3,
            top: 0,
            bottom: 0
        };
        const stickyOffset = el.getAttribute('sticky-offset');
        if (stickyOffset) {
            if (/^\w$/.test(stickyOffset)) {
                const offsetValue = context[stickyOffset];
                if (typeof offsetValue === 'object') {
                    Object.assign(options, offsetValue);
                }
            }
            else {
                const matchedValue = stickyOffset.match(/\w+\s*:\s*\d+/g);
                matchedValue && matchedValue.forEach((str) => {
                    const [key, value] = str.split(/\s*:\s*/);
                    if (key in options) {
                        options[key] = +value;
                    }
                });
            }
        }
        const zIndex = Number(el.getAttribute('sticky-z-index'));
        if (zIndex) {
            options.zIndex = zIndex;
        }
        options.stickSide = el.getAttribute('sticky-side') || modifiers.both;
        const stickName = el.getAttribute('on-stick') || arg;
        if (stickName && typeof context[stickName] === 'function') {
            options.onStick = context[stickName].bind(context);
        }
        switch (getType(value)) {
            case 'Object':
                Object.assign(options, value);
                break;
            case 'Boolean':
                options.stickSide = value && 'both';
                break;
            case 'Array':
                const keyArr = ['zIndex', 'top', 'bottom'];
                value.forEach((res, index) => {
                    typeof res === 'number' && (options[keyArr[index]] = res);
                });
                break;
            case 'Number':
                options.top = value;
                break;
            case 'String':
                if (value) {
                    const stickyCallBack = context[value];
                    if (typeof stickyCallBack === 'function') {
                        options.onStick = stickyCallBack.bind(context);
                    }
                }
                break;
            case 'Function':
                options.onStick = value.bind(context);
                break;
        }
        Object.assign(el.style, {
            top: options.top + 'px',
            left: 0,
            right: 0,
            zIndex: options.zIndex
        });
        const stickyElContainer = document.createElement('div');
        stickyElContainer.className = 'sticky-container';
        el.parentElement.insertBefore(stickyElContainer, el);
        stickyElContainer.appendChild(el);
        let wrapperIntersecting = false;
        let parentIntersecting = false;
        let laststatus = false;
        let updateStatus = () => {
            const status = parentIntersecting && wrapperIntersecting;
            if (status === laststatus) {
                return;
            }
            if (status) {
                stickyElContainer.style.height = el.clientHeight + 'px';
                el.style.position = 'fixed';
                el.classList.add('top-sticky');
            }
            else {
                el.style.position = '';
                stickyElContainer.style.height = '';
                el.classList.remove('top-sticky');
            }
            laststatus = status;
            options.onStick && setTimeout(options.onStick, 10, status);
        };
        const offset = options.top + el.clientHeight;
        const observers = [new EasyIntersectionObserver(stickyElContainer, ([{ isIntersecting, boundingClientRect: { top } }]) => {
                isIntersecting = !isIntersecting && top <= options.top;
                if (isIntersecting !== wrapperIntersecting) {
                    wrapperIntersecting = isIntersecting;
                    updateStatus();
                }
            }, {
                rootMargin: `-${offset}px 0px 0px 0px`
            })];
        if ((options.stickSide === 'both' || options.bottom > 0) && stickyElContainer.parentNode) {
            observers.push(new EasyIntersectionObserver(stickyElContainer.parentNode, ([{ isIntersecting }]) => {
                if (isIntersecting !== parentIntersecting) {
                    parentIntersecting = isIntersecting;
                    updateStatus();
                }
            }, {
                rootMargin: `-${offset + options.bottom}px 0px 0px 0px`
            }));
        }
        else {
            parentIntersecting = true;
        }
        // @ts-ignore
        el.__destroy__ = () => {
            observers.forEach(ob => ob.disconnect());
            parentIntersecting = wrapperIntersecting = false;
            updateStatus();
            // @ts-ignore
            el.__destroy__ = updateStatus = null;
        };
    },
    unbind(el) {
        var _a;
        (_a = el.__destroy__) === null || _a === void 0 ? void 0 : _a.call(el);
    },
    install(Vue) {
        Vue.directive('Sticky', this);
    }
};


Vue.use(Sticky);
new Vue({
  el: '#app',
  data: {
    stickyEnabled: true,
  },
  methods: {
    onStick(data) {
      console.log(data);
    },
  },
})