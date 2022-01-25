/**
    * v1.0.0
    * (c) 2022 baoyi.cui@klook.com
    */
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
var index = {
    inserted: function (el, _a, _b) {
        var modifiers = _a.modifiers, arg = _a.arg, value = _a.value;
        var context = _b.context;
        if (typeof window !== 'object' || typeof window.IntersectionObserver !== 'function') {
            return;
        }
        var options = {
            zIndex: 3,
            top: 0,
            bottom: 0
        };
        var stickyOffset = el.getAttribute('sticky-offset');
        if (stickyOffset) {
            if (/^\w$/.test(stickyOffset)) {
                var offsetValue = context[stickyOffset];
                if (typeof offsetValue === 'object') {
                    Object.assign(options, offsetValue);
                }
            }
            else {
                var matchedValue = stickyOffset.match(/\w+\s*:\s*\d+/g);
                matchedValue && matchedValue.forEach(function (str) {
                    var _a = str.split(/\s*:\s*/), key = _a[0], value = _a[1];
                    if (key in options) {
                        options[key] = +value;
                    }
                });
            }
        }
        var zIndex = Number(el.getAttribute('sticky-z-index'));
        if (zIndex) {
            options.zIndex = zIndex;
        }
        options.stickSide = el.getAttribute('sticky-side') || modifiers.both;
        var stickName = el.getAttribute('on-stick') || arg;
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
                var keyArr_1 = ['zIndex', 'top', 'bottom'];
                value.forEach(function (res, index) {
                    typeof res === 'number' && (options[keyArr_1[index]] = res);
                });
                break;
            case 'Number':
                options.top = value;
                break;
            case 'String':
                if (value) {
                    var stickyCallBack = context[value];
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
        var stickyElContainer = document.createElement('div');
        stickyElContainer.className = 'sticky-container';
        el.parentElement.insertBefore(stickyElContainer, el);
        stickyElContainer.appendChild(el);
        var wrapperIntersecting = false;
        var parentIntersecting = false;
        var laststatus = false;
        var updateStatus = function () {
            var status = parentIntersecting && wrapperIntersecting;
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
        var offset = options.top + el.clientHeight;
        var observers = [new EasyIntersectionObserver(stickyElContainer, function (_a) {
                var _b = _a[0], isIntersecting = _b.isIntersecting, top = _b.boundingClientRect.top;
                isIntersecting = !isIntersecting && top <= options.top;
                if (isIntersecting !== wrapperIntersecting) {
                    wrapperIntersecting = isIntersecting;
                    updateStatus();
                }
            }, {
                rootMargin: "-".concat(offset, "px 0px 0px 0px")
            })];
        if ((options.stickSide === 'both' || options.bottom > 0) && stickyElContainer.parentNode) {
            observers.push(new EasyIntersectionObserver(stickyElContainer.parentNode, function (_a) {
                var isIntersecting = _a[0].isIntersecting;
                if (isIntersecting !== parentIntersecting) {
                    parentIntersecting = isIntersecting;
                    updateStatus();
                }
            }, {
                rootMargin: "-".concat(offset + options.bottom, "px 0px 0px 0px")
            }));
        }
        else {
            parentIntersecting = true;
        }
        // @ts-ignore
        el.__destroy__ = function () {
            observers.forEach(function (ob) { return ob.disconnect(); });
            parentIntersecting = wrapperIntersecting = false;
            updateStatus();
            // @ts-ignore
            el.__destroy__ = updateStatus = null;
        };
    },
    unbind: function (el) {
        var _a;
        (_a = el.__destroy__) === null || _a === void 0 ? void 0 : _a.call(el);
    },
    install: function (Vue) {
        Vue.directive('Sticky', this);
    }
};

export { index as default };
