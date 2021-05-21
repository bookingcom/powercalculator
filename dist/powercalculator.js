
/** MIT licence */
/** https://github.com/bookingcom/powercalculator */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('powercalculator', factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.powercalculator = factory());
}(this, (function () { 'use strict';

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  // Known bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1248186
  var script$8 = {
    template: '#pc-block-field',
    props: [
      'lockedField',
      'enableEdit',
      'isReadOnly',
      'fieldProp',
      'fieldValue',
      'prefix',
      'suffix',
    ],
    data() {
      return {
        islockedFieldSet: (this.lockedField || '').length > 0,
        isFocused: false,
      }
    },
    updated() {
      // Resync the editable fields
      const el = this.$refs['pc-value'];
      if (el && el.textContent != this.formattedVal) {
        el.textContent = this.formattedVal;
      }

      // Once it updates, places the cursor back where it was. This is a visual
      // glitch caused by the interaction between content editable and the prop drilling.
      const focus = document.activeElement;
      if (el === focus) {
        const range = document.createRange();
        range.selectNodeContents(focus);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    },
    computed: {
      isLocked() {
        return this.lockedField && this.lockedField == this.fieldProp
      },
      formattedVal() {
        let result = this.fieldValue;
        const sep = ',';

        if (result / 1000 >= 1) {
          const [integer, decimal] = (result + '').split('.');

          result = integer.split('').reduceRight((prev, cur, i, arr) => {
            const iFromLeft = arr.length - i;
            let resultStr = cur + prev;

            if (iFromLeft % 3 == 0 && iFromLeft != 0 && i != 0) {
              resultStr = sep + resultStr;
            }

            return resultStr
          }, '');

          if (decimal) {
            result += '.' + decimal;
          }
        }

        return result
      },
      fieldClass() {
        if (this.fieldProp != null) {
          return `pc-value-formatting-${this.fieldProp}`
        }
        return ''
      },
      fieldWrapperClasses() {
        const obj = {};

        obj['pc-field--read-only'] = this.isReadOnly;
        obj['pc-field--focused'] = this.isFocused;
        obj['pc-field-' + this.fieldProp] = true;

        return obj
      },
      fieldFormattedStyle() {
        const result = {};
        if (this.isFocused) {
          result.display = 'none';
        }

        return result
      },
      fieldEditableStyle() {
        const result = {};
        if (!this.isFocused) {
          result.opacity = 0;
        }

        return result
      },
      testType() {
        return this.$store.getters.testType
      },
    },
    methods: {
      getSanitizedPcValue() {
        // People will use copy paste. We need some data sanitization

        // remove markup
        const oldValue = this.$refs['pc-value'].textContent + '';

        // remove commas
        // try to extract numbers from it
        const newValue = parseFloat(oldValue.replace(/,/g, ''));

        return newValue
      },
      updateVal() {
        if (this.enableEdit) {
          const value = this.getSanitizedPcValue();

          if (value != this.fieldValue) {
            this.$emit('update:fieldValue', value);
          }
        }
      },
      setFocusStyle(bool) {
        this.isFocused = bool;
      },
      setFocus() {
        const el = this.$refs['pc-value'];
        el.focus();
      },
    },
    watch: {},
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  const isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return (id, style) => addStyle(id, style);
  }
  let HEAD;
  const styles = {};
  function addStyle(id, css) {
      const group = isOldIE ? css.media || 'default' : id;
      const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          let code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  style.element.setAttribute('media', css.media);
              if (HEAD === undefined) {
                  HEAD = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              const index = style.ids.size - 1;
              const textNode = document.createTextNode(code);
              const nodes = style.element.childNodes;
              if (nodes[index])
                  style.element.removeChild(nodes[index]);
              if (nodes.length)
                  style.element.insertBefore(textNode, nodes[index]);
              else
                  style.element.appendChild(textNode);
          }
      }
  }

  /* script */
  const __vue_script__$8 = script$8;

  /* template */
  var __vue_render__$8 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.enableEdit)?_c('span',{staticClass:"pc-value-field-wrapper",class:_vm.fieldWrapperClasses,on:{"click":function($event){return _vm.setFocus()}}},[_c('span',{staticClass:"pc-value-formatting pc-value--formatted",class:'pc-value-formatting-' + _vm.fieldProp,style:(_vm.fieldFormattedStyle),attrs:{"aria-hidden":"true","data-prefix":_vm.prefix,"data-suffix":_vm.suffix}},[_c('span',{ref:"pc-formatted-value",staticClass:"pc-value-display",domProps:{"textContent":_vm._s(_vm.formattedVal)}})]),_vm._v(" "),_c('span',{staticClass:"pc-value-formatting",class:_vm.fieldClass,style:(_vm.fieldEditableStyle),attrs:{"data-prefix":_vm.prefix,"data-suffix":_vm.suffix}},[_c('span',{ref:"pc-value",staticClass:"pc-value-display",attrs:{"contenteditable":!_vm.isReadOnly},domProps:{"textContent":_vm._s(_vm.formattedVal)},on:{"focus":function($event){return _vm.setFocusStyle(true)},"blur":function($event){return _vm.setFocusStyle(false)},"input":_vm.updateVal,"keydown":function($event){if(!$event.type.indexOf('key')&&_vm._k($event.keyCode,"enter",13,$event.key,"Enter")){ return null; }$event.preventDefault();}}})])]):_c('span',{staticClass:"pc-value-display pc-field-not-editable"},[_vm._v("\n  "+_vm._s(_vm.prefix)+" "),_c('strong',[_vm._v(_vm._s(_vm.formattedVal))]),_vm._v(" "+_vm._s(_vm.suffix)+"\n")])};
  var __vue_staticRenderFns__$8 = [];

    /* style */
    const __vue_inject_styles__$8 = function (inject) {
      if (!inject) return
      inject("data-v-19d3c266_0", { source: ".pc-value-field-wrapper{--base-padding:5px;display:block;position:relative;box-sizing:border-box;width:100%;filter:drop-shadow(0 4px 2px rgba(0, 0, 0, .1));border-radius:5px;background:var(--white);padding:var(--base-padding);overflow:hidden}.pc-field--focused{box-shadow:inset 0 0 0 1px var(--dark-blue)}.pc-value--formatted{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;width:100%}.pc-value-display{box-sizing:border-box;font-size:1em;line-height:1.8em;align-self:center;min-height:1em;display:inline-block}.pc-value-display:focus{outline:0}.pc-false-positive-input,.pc-non-inf-treshold-input,.pc-power-input,.pc-variants-input{display:inline-block;vertical-align:middle;padding:4px 8px;text-align:center;width:4em;border:2px solid var(--gray);border-radius:8px;font-size:inherit}.pc-variants-input{width:6.5em}.pc-top-fields-error{color:var(--red)}.pc-value-formatting:before{color:var(--gray);content:attr(data-prefix)}.pc-value-formatting:after{color:var(--gray);content:attr(data-suffix)}.pc-block-to-calculate .pc-value-field-wrapper:not(.pc-value-display){background:var(--light-yellow);outline:2px solid var(--dark-yellow)}.pc-block-to-calculate .pc-value .pc-value-formatting:before{content:'=' attr(data-prefix);color:var(--black)}.pc-block-to-calculate .pc-value-formatting:after{color:var(--black)}", map: undefined, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$8 = undefined;
    /* module identifier */
    const __vue_module_identifier__$8 = undefined;
    /* functional template */
    const __vue_is_functional_template__$8 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$8 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
      __vue_inject_styles__$8,
      __vue_script__$8,
      __vue_scope_id__$8,
      __vue_is_functional_template__$8,
      __vue_module_identifier__$8,
      false,
      createInjector,
      undefined,
      undefined
    );

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$7 = {
    props: ['isBlockFocused'],
    data() {
      return {
        svgBoxWidth: 26,
      }
    },
    computed: {
      svgFillColor() {
        return this.isBlockFocused ? '#E2B634' : '#C1CFD8'
      },
      svgBgColor() {
        return this.isBlockFocused ? '#FEF1CB' : '#F0F0F0'
      },
      svgBgLine() {
        const { svgFillColor, svgBgColor, svgBoxWidth } = this,
          strokeWidth = 2,
          stokeStyle = `linear-gradient(
                    0deg,
                    transparent,
                    transparent calc(50% - ${strokeWidth / 2}px - 1px),
                    ${svgFillColor} calc(50% - ${strokeWidth / 2}px),
                    ${svgFillColor} calc(50% + ${strokeWidth / 2}px),
                    transparent calc(50% + ${strokeWidth / 2}px + 1px),
                    transparent 100%
                )`,
          strokeMask = `linear-gradient(
                    90deg,
                    transparent,
                    transparent calc(50% - ${svgBoxWidth / 2}px - 1px),
                    ${svgBgColor} calc(50% - ${svgBoxWidth / 2}px),
                    ${svgBgColor} calc(50% + ${svgBoxWidth / 2}px),
                    transparent calc(50% + ${svgBoxWidth / 2}px + 1px),
                    transparent 100%
                )`;

        return `background: ${strokeMask}, ${stokeStyle};`.replace(/\n/g, '')
      },
    },
  };

  /* script */
  const __vue_script__$7 = script$7;

  /* template */
  var __vue_render__$7 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('svg',{staticClass:"pc-svg-chain-icon",style:(_vm.svgBgLine),attrs:{"width":"100%","height":"59px","viewBox":("0 0 " + _vm.svgBoxWidth + " 59"),"version":"1.1","xmlns":"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","aria-hidden":"true"}},[_c('g',{attrs:{"id":"Power-Calculator","transform":"translate(-811.000000, -485.000000)"}},[_c('g',{attrs:{"transform":"translate(676.000000, 327.000000)"}},[_c('g',{attrs:{"id":"Chain","transform":"translate(132.000000, 158.000000)"}},[_c('path',{attrs:{"d":"M12.1680332,24.5 L14.5,24.5 C16.709139,24.5 18.5,26.290861 18.5,28.5 L18.5,29.5 C18.5,31.709139 16.709139,33.5 14.5,33.5 L9.5,33.5 C7.290861,33.5 5.5,31.709139 5.5,29.5 L5.5,28.5 C6.20701437,28.5 6.87368104,28.5 7.5,28.5 L7.5,29.5 C7.5,30.6045695 8.3954305,31.5 9.5,31.5 L14.5,31.5 C15.6045695,31.5 16.5,30.6045695 16.5,29.5 L16.5,28.5 C16.5,27.3954305 15.6045695,26.5 14.5,26.5 L13.7237764,26.5 C13.463452,25.7924504 12.944871,25.1257837 12.1680332,24.5 Z","id":"Rectangle-5","fill":_vm.svgFillColor,"fill-rule":"nonzero","transform":"translate(12.000000, 29.000000) scale(-1, -1) translate(-12.000000, -29.000000) "}}),_vm._v(" "),_c('path',{attrs:{"d":"M18.1680332,24.5 L20.5,24.5 C22.709139,24.5 24.5,26.290861 24.5,28.5 L24.5,29.5 C24.5,31.709139 22.709139,33.5 20.5,33.5 L15.5,33.5 C13.290861,33.5 11.5,31.709139 11.5,29.5 L11.5,28.5 C12.2070144,28.5 12.873681,28.5 13.5,28.5 L13.5,29.5 C13.5,30.6045695 14.3954305,31.5 15.5,31.5 L20.5,31.5 C21.6045695,31.5 22.5,30.6045695 22.5,29.5 L22.5,28.5 C22.5,27.3954305 21.6045695,26.5 20.5,26.5 L19.7237764,26.5 C19.463452,25.7924504 18.944871,25.1257837 18.1680332,24.5 Z","id":"Rectangle-5","fill":_vm.svgFillColor,"fill-rule":"nonzero"}})])])])])};
  var __vue_staticRenderFns__$7 = [];

    /* style */
    const __vue_inject_styles__$7 = function (inject) {
      if (!inject) return
      inject("data-v-b46b9c9c_0", { source: ".pc-svg-chain-icon{position:absolute;top:138px;pointer-events:none;z-index:0}", map: undefined, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$7 = undefined;
    /* module identifier */
    const __vue_module_identifier__$7 = undefined;
    /* functional template */
    const __vue_is_functional_template__$7 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$7 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
      __vue_inject_styles__$7,
      __vue_script__$7,
      __vue_scope_id__$7,
      __vue_is_functional_template__$7,
      __vue_module_identifier__$7,
      false,
      createInjector,
      undefined,
      undefined
    );

  //

  var script$6 = {
    props: ['blockName', 'lockedField', 'focusedBlock'],
    data: () => ({}),
    computed: {
      testType() {
        return this.$store.getters.testType
      },
      isBlockFocused() {
        return this.focusedBlock === this.blockName
      },
      isReadOnly() {
        return this.calculateProp == this.blockName
      },
    },
    components: {
      // eslint-disable-next-line vue/no-unused-components
      'pc-block-field': __vue_component__$8,
      // eslint-disable-next-line vue/no-unused-components
      'pc-svg-chain': __vue_component__$7,
    },
  };

  /* script */
  const __vue_script__$6 = script$6;

  /* template */
  var __vue_render__$6 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div')};
  var __vue_staticRenderFns__$6 = [];

    /* style */
    const __vue_inject_styles__$6 = function (inject) {
      if (!inject) return
      inject("data-v-0ffdbf67_0", { source: ".pc-block{position:relative;padding-bottom:25px;border-bottom:3px solid var(--pale-blue)}.pc-block-to-calculate{border-bottom-color:var(--dark-yellow)}.pc-calc-radio{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);background:var(--light-gray);border-radius:25%/100%;padding:7px 15px}.pc-calc-radio--active{background:var(--white)}.pc-inputs{display:block;list-style-type:none;margin:0;padding:0;--row-gap:10px;--padding:25px;--columns-gap:70px;--grid-column-width:calc(50% - (var(--columns-gap) / 2));display:grid;grid-template-columns:var(--grid-column-width) var(--grid-column-width);grid-template-rows:auto;grid-template-areas:'pc-input-left pc-input-right' 'pc-input-left-bottom pc-input-right-bottom';align-items:start;grid-gap:var(--row-gap) var(--columns-gap);padding:0 var(--padding)}.pc-input-item{text-align:center}.pc-input-title{position:relative;display:block;margin-bottom:25px}.pc-input-sub-title{position:absolute;top:100%;left:0;right:0;text-align:center;font-size:9px}.pc-input-left{grid-area:pc-input-left}.pc-input-right{grid-area:pc-input-right}.pc-input-left-bottom{grid-area:pc-input-left-bottom}.pc-input-right-bottom{grid-area:pc-input-right-bottom}.pc-input-details{font-size:10px;color:var(--dark-gray)}.pc-field-not-editable{position:relative;padding:5px;display:block}.pc-input-left .pc-field-not-editable,.pc-input-right .pc-field-not-editable{background:var(--light-gray);outline:2px solid var(--light-blue)}", map: undefined, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$6 = undefined;
    /* module identifier */
    const __vue_module_identifier__$6 = undefined;
    /* functional template */
    const __vue_is_functional_template__$6 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$6 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
      __vue_inject_styles__$6,
      __vue_script__$6,
      __vue_scope_id__$6,
      __vue_is_functional_template__$6,
      __vue_module_identifier__$6,
      false,
      createInjector,
      undefined,
      undefined
    );

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var jstat = createCommonjsModule(function (module, exports) {
  (function (window, factory) {
      {
          module.exports = factory();
      }
  })(commonjsGlobal, function () {
  var jStat = (function(Math, undefined$1) {

  // For quick reference.
  var concat = Array.prototype.concat;
  var slice = Array.prototype.slice;
  var toString = Object.prototype.toString;

  // Calculate correction for IEEE error
  // TODO: This calculation can be improved.
  function calcRdx(n, m) {
    var val = n > m ? n : m;
    return Math.pow(10,
                    17 - ~~(Math.log(((val > 0) ? val : -val)) * Math.LOG10E));
  }


  var isArray = Array.isArray || function isArray(arg) {
    return toString.call(arg) === '[object Array]';
  };


  function isFunction(arg) {
    return toString.call(arg) === '[object Function]';
  }


  function isNumber(num) {
    return (typeof num === 'number') ? num - num === 0 : false;
  }


  // Converts the jStat matrix to vector.
  function toVector(arr) {
    return concat.apply([], arr);
  }


  // The one and only jStat constructor.
  function jStat() {
    return new jStat._init(arguments);
  }


  // TODO: Remove after all references in src files have been removed.
  jStat.fn = jStat.prototype;


  // By separating the initializer from the constructor it's easier to handle
  // always returning a new instance whether "new" was used or not.
  jStat._init = function _init(args) {
    // If first argument is an array, must be vector or matrix.
    if (isArray(args[0])) {
      // Check if matrix.
      if (isArray(args[0][0])) {
        // See if a mapping function was also passed.
        if (isFunction(args[1]))
          args[0] = jStat.map(args[0], args[1]);
        // Iterate over each is faster than this.push.apply(this, args[0].
        for (var i = 0; i < args[0].length; i++)
          this[i] = args[0][i];
        this.length = args[0].length;

      // Otherwise must be a vector.
      } else {
        this[0] = isFunction(args[1]) ? jStat.map(args[0], args[1]) : args[0];
        this.length = 1;
      }

    // If first argument is number, assume creation of sequence.
    } else if (isNumber(args[0])) {
      this[0] = jStat.seq.apply(null, args);
      this.length = 1;

    // Handle case when jStat object is passed to jStat.
    } else if (args[0] instanceof jStat) {
      // Duplicate the object and pass it back.
      return jStat(args[0].toArray());

    // Unexpected argument value, return empty jStat object.
    // TODO: This is strange behavior. Shouldn't this throw or some such to let
    // the user know they had bad arguments?
    } else {
      this[0] = [];
      this.length = 1;
    }

    return this;
  };
  jStat._init.prototype = jStat.prototype;
  jStat._init.constructor = jStat;


  // Utility functions.
  // TODO: for internal use only?
  jStat.utils = {
    calcRdx: calcRdx,
    isArray: isArray,
    isFunction: isFunction,
    isNumber: isNumber,
    toVector: toVector
  };


  jStat._random_fn = Math.random;
  jStat.setRandom = function setRandom(fn) {
    if (typeof fn !== 'function')
      throw new TypeError('fn is not a function');
    jStat._random_fn = fn;
  };


  // Easily extend the jStat object.
  // TODO: is this seriously necessary?
  jStat.extend = function extend(obj) {
    var i, j;

    if (arguments.length === 1) {
      for (j in obj)
        jStat[j] = obj[j];
      return this;
    }

    for (i = 1; i < arguments.length; i++) {
      for (j in arguments[i])
        obj[j] = arguments[i][j];
    }

    return obj;
  };


  // Returns the number of rows in the matrix.
  jStat.rows = function rows(arr) {
    return arr.length || 1;
  };


  // Returns the number of columns in the matrix.
  jStat.cols = function cols(arr) {
    return arr[0].length || 1;
  };


  // Returns the dimensions of the object { rows: i, cols: j }
  jStat.dimensions = function dimensions(arr) {
    return {
      rows: jStat.rows(arr),
      cols: jStat.cols(arr)
    };
  };


  // Returns a specified row as a vector or return a sub matrix by pick some rows
  jStat.row = function row(arr, index) {
    if (isArray(index)) {
      return index.map(function(i) {
        return jStat.row(arr, i);
      })
    }
    return arr[index];
  };


  // return row as array
  // rowa([[1,2],[3,4]],0) -> [1,2]
  jStat.rowa = function rowa(arr, i) {
    return jStat.row(arr, i);
  };


  // Returns the specified column as a vector or return a sub matrix by pick some
  // columns
  jStat.col = function col(arr, index) {
    if (isArray(index)) {
      var submat = jStat.arange(arr.length).map(function() {
        return new Array(index.length);
      });
      index.forEach(function(ind, i){
        jStat.arange(arr.length).forEach(function(j) {
          submat[j][i] = arr[j][ind];
        });
      });
      return submat;
    }
    var column = new Array(arr.length);
    for (var i = 0; i < arr.length; i++)
      column[i] = [arr[i][index]];
    return column;
  };


  // return column as array
  // cola([[1,2],[3,4]],0) -> [1,3]
  jStat.cola = function cola(arr, i) {
    return jStat.col(arr, i).map(function(a){ return a[0] });
  };


  // Returns the diagonal of the matrix
  jStat.diag = function diag(arr) {
    var nrow = jStat.rows(arr);
    var res = new Array(nrow);
    for (var row = 0; row < nrow; row++)
      res[row] = [arr[row][row]];
    return res;
  };


  // Returns the anti-diagonal of the matrix
  jStat.antidiag = function antidiag(arr) {
    var nrow = jStat.rows(arr) - 1;
    var res = new Array(nrow);
    for (var i = 0; nrow >= 0; nrow--, i++)
      res[i] = [arr[i][nrow]];
    return res;
  };

  // Transpose a matrix or array.
  jStat.transpose = function transpose(arr) {
    var obj = [];
    var objArr, rows, cols, j, i;

    // Make sure arr is in matrix format.
    if (!isArray(arr[0]))
      arr = [arr];

    rows = arr.length;
    cols = arr[0].length;

    for (i = 0; i < cols; i++) {
      objArr = new Array(rows);
      for (j = 0; j < rows; j++)
        objArr[j] = arr[j][i];
      obj.push(objArr);
    }

    // If obj is vector, return only single array.
    return obj.length === 1 ? obj[0] : obj;
  };


  // Map a function to an array or array of arrays.
  // "toAlter" is an internal variable.
  jStat.map = function map(arr, func, toAlter) {
    var row, nrow, ncol, res, col;

    if (!isArray(arr[0]))
      arr = [arr];

    nrow = arr.length;
    ncol = arr[0].length;
    res = toAlter ? arr : new Array(nrow);

    for (row = 0; row < nrow; row++) {
      // if the row doesn't exist, create it
      if (!res[row])
        res[row] = new Array(ncol);
      for (col = 0; col < ncol; col++)
        res[row][col] = func(arr[row][col], row, col);
    }

    return res.length === 1 ? res[0] : res;
  };


  // Cumulatively combine the elements of an array or array of arrays using a function.
  jStat.cumreduce = function cumreduce(arr, func, toAlter) {
    var row, nrow, ncol, res, col;

    if (!isArray(arr[0]))
      arr = [arr];

    nrow = arr.length;
    ncol = arr[0].length;
    res = toAlter ? arr : new Array(nrow);

    for (row = 0; row < nrow; row++) {
      // if the row doesn't exist, create it
      if (!res[row])
        res[row] = new Array(ncol);
      if (ncol > 0)
        res[row][0] = arr[row][0];
      for (col = 1; col < ncol; col++)
        res[row][col] = func(res[row][col-1], arr[row][col]);
    }
    return res.length === 1 ? res[0] : res;
  };


  // Destructively alter an array.
  jStat.alter = function alter(arr, func) {
    return jStat.map(arr, func, true);
  };


  // Generate a rows x cols matrix according to the supplied function.
  jStat.create = function  create(rows, cols, func) {
    var res = new Array(rows);
    var i, j;

    if (isFunction(cols)) {
      func = cols;
      cols = rows;
    }

    for (i = 0; i < rows; i++) {
      res[i] = new Array(cols);
      for (j = 0; j < cols; j++)
        res[i][j] = func(i, j);
    }

    return res;
  };


  function retZero() { return 0; }


  // Generate a rows x cols matrix of zeros.
  jStat.zeros = function zeros(rows, cols) {
    if (!isNumber(cols))
      cols = rows;
    return jStat.create(rows, cols, retZero);
  };


  function retOne() { return 1; }


  // Generate a rows x cols matrix of ones.
  jStat.ones = function ones(rows, cols) {
    if (!isNumber(cols))
      cols = rows;
    return jStat.create(rows, cols, retOne);
  };


  // Generate a rows x cols matrix of uniformly random numbers.
  jStat.rand = function rand(rows, cols) {
    if (!isNumber(cols))
      cols = rows;
    return jStat.create(rows, cols, jStat._random_fn);
  };


  function retIdent(i, j) { return i === j ? 1 : 0; }


  // Generate an identity matrix of size row x cols.
  jStat.identity = function identity(rows, cols) {
    if (!isNumber(cols))
      cols = rows;
    return jStat.create(rows, cols, retIdent);
  };


  // Tests whether a matrix is symmetric
  jStat.symmetric = function symmetric(arr) {
    var size = arr.length;
    var row, col;

    if (arr.length !== arr[0].length)
      return false;

    for (row = 0; row < size; row++) {
      for (col = 0; col < size; col++)
        if (arr[col][row] !== arr[row][col])
          return false;
    }

    return true;
  };


  // Set all values to zero.
  jStat.clear = function clear(arr) {
    return jStat.alter(arr, retZero);
  };


  // Generate sequence.
  jStat.seq = function seq(min, max, length, func) {
    if (!isFunction(func))
      func = false;

    var arr = [];
    var hival = calcRdx(min, max);
    var step = (max * hival - min * hival) / ((length - 1) * hival);
    var current = min;
    var cnt;

    // Current is assigned using a technique to compensate for IEEE error.
    // TODO: Needs better implementation.
    for (cnt = 0;
         current <= max && cnt < length;
         cnt++, current = (min * hival + step * hival * cnt) / hival) {
      arr.push((func ? func(current, cnt) : current));
    }

    return arr;
  };


  // arange(5) -> [0,1,2,3,4]
  // arange(1,5) -> [1,2,3,4]
  // arange(5,1,-1) -> [5,4,3,2]
  jStat.arange = function arange(start, end, step) {
    var rl = [];
    var i;
    step = step || 1;
    if (end === undefined$1) {
      end = start;
      start = 0;
    }
    if (start === end || step === 0) {
      return [];
    }
    if (start < end && step < 0) {
      return [];
    }
    if (start > end && step > 0) {
      return [];
    }
    if (step > 0) {
      for (i = start; i < end; i += step) {
        rl.push(i);
      }
    } else {
      for (i = start; i > end; i += step) {
        rl.push(i);
      }
    }
    return rl;
  };


  // A=[[1,2,3],[4,5,6],[7,8,9]]
  // slice(A,{row:{end:2},col:{start:1}}) -> [[2,3],[5,6]]
  // slice(A,1,{start:1}) -> [5,6]
  // as numpy code A[:2,1:]
  jStat.slice = (function(){
    function _slice(list, start, end, step) {
      // note it's not equal to range.map mode it's a bug
      var i;
      var rl = [];
      var length = list.length;
      if (start === undefined$1 && end === undefined$1 && step === undefined$1) {
        return jStat.copy(list);
      }

      start = start || 0;
      end = end || list.length;
      start = start >= 0 ? start : length + start;
      end = end >= 0 ? end : length + end;
      step = step || 1;
      if (start === end || step === 0) {
        return [];
      }
      if (start < end && step < 0) {
        return [];
      }
      if (start > end && step > 0) {
        return [];
      }
      if (step > 0) {
        for (i = start; i < end; i += step) {
          rl.push(list[i]);
        }
      } else {
        for (i = start; i > end;i += step) {
          rl.push(list[i]);
        }
      }
      return rl;
    }

    function slice(list, rcSlice) {
      var colSlice, rowSlice;
      rcSlice = rcSlice || {};
      if (isNumber(rcSlice.row)) {
        if (isNumber(rcSlice.col))
          return list[rcSlice.row][rcSlice.col];
        var row = jStat.rowa(list, rcSlice.row);
        colSlice = rcSlice.col || {};
        return _slice(row, colSlice.start, colSlice.end, colSlice.step);
      }

      if (isNumber(rcSlice.col)) {
        var col = jStat.cola(list, rcSlice.col);
        rowSlice = rcSlice.row || {};
        return _slice(col, rowSlice.start, rowSlice.end, rowSlice.step);
      }

      rowSlice = rcSlice.row || {};
      colSlice = rcSlice.col || {};
      var rows = _slice(list, rowSlice.start, rowSlice.end, rowSlice.step);
      return rows.map(function(row) {
        return _slice(row, colSlice.start, colSlice.end, colSlice.step);
      });
    }

    return slice;
  }());


  // A=[[1,2,3],[4,5,6],[7,8,9]]
  // sliceAssign(A,{row:{start:1},col:{start:1}},[[0,0],[0,0]])
  // A=[[1,2,3],[4,0,0],[7,0,0]]
  jStat.sliceAssign = function sliceAssign(A, rcSlice, B) {
    var nl, ml;
    if (isNumber(rcSlice.row)) {
      if (isNumber(rcSlice.col))
        return A[rcSlice.row][rcSlice.col] = B;
      rcSlice.col = rcSlice.col || {};
      rcSlice.col.start = rcSlice.col.start || 0;
      rcSlice.col.end = rcSlice.col.end || A[0].length;
      rcSlice.col.step = rcSlice.col.step || 1;
      nl = jStat.arange(rcSlice.col.start,
                            Math.min(A.length, rcSlice.col.end),
                            rcSlice.col.step);
      var m = rcSlice.row;
      nl.forEach(function(n, i) {
        A[m][n] = B[i];
      });
      return A;
    }

    if (isNumber(rcSlice.col)) {
      rcSlice.row = rcSlice.row || {};
      rcSlice.row.start = rcSlice.row.start || 0;
      rcSlice.row.end = rcSlice.row.end || A.length;
      rcSlice.row.step = rcSlice.row.step || 1;
      ml = jStat.arange(rcSlice.row.start,
                            Math.min(A[0].length, rcSlice.row.end),
                            rcSlice.row.step);
      var n = rcSlice.col;
      ml.forEach(function(m, j) {
        A[m][n] = B[j];
      });
      return A;
    }

    if (B[0].length === undefined$1) {
      B = [B];
    }
    rcSlice.row.start = rcSlice.row.start || 0;
    rcSlice.row.end = rcSlice.row.end || A.length;
    rcSlice.row.step = rcSlice.row.step || 1;
    rcSlice.col.start = rcSlice.col.start || 0;
    rcSlice.col.end = rcSlice.col.end || A[0].length;
    rcSlice.col.step = rcSlice.col.step || 1;
    ml = jStat.arange(rcSlice.row.start,
                          Math.min(A.length, rcSlice.row.end),
                          rcSlice.row.step);
    nl = jStat.arange(rcSlice.col.start,
                          Math.min(A[0].length, rcSlice.col.end),
                          rcSlice.col.step);
    ml.forEach(function(m, i) {
      nl.forEach(function(n, j) {
        A[m][n] = B[i][j];
      });
    });
    return A;
  };


  // [1,2,3] ->
  // [[1,0,0],[0,2,0],[0,0,3]]
  jStat.diagonal = function diagonal(diagArray) {
    var mat = jStat.zeros(diagArray.length, diagArray.length);
    diagArray.forEach(function(t, i) {
      mat[i][i] = t;
    });
    return mat;
  };


  // return copy of A
  jStat.copy = function copy(A) {
    return A.map(function(row) {
      if (isNumber(row))
        return row;
      return row.map(function(t) {
        return t;
      });
    });
  };


  // TODO: Go over this entire implementation. Seems a tragic waste of resources
  // doing all this work. Instead, and while ugly, use new Function() to generate
  // a custom function for each static method.

  // Quick reference.
  var jProto = jStat.prototype;

  // Default length.
  jProto.length = 0;

  // For internal use only.
  // TODO: Check if they're actually used, and if they are then rename them
  // to _*
  jProto.push = Array.prototype.push;
  jProto.sort = Array.prototype.sort;
  jProto.splice = Array.prototype.splice;
  jProto.slice = Array.prototype.slice;


  // Return a clean array.
  jProto.toArray = function toArray() {
    return this.length > 1 ? slice.call(this) : slice.call(this)[0];
  };


  // Map a function to a matrix or vector.
  jProto.map = function map(func, toAlter) {
    return jStat(jStat.map(this, func, toAlter));
  };


  // Cumulatively combine the elements of a matrix or vector using a function.
  jProto.cumreduce = function cumreduce(func, toAlter) {
    return jStat(jStat.cumreduce(this, func, toAlter));
  };


  // Destructively alter an array.
  jProto.alter = function alter(func) {
    jStat.alter(this, func);
    return this;
  };


  // Extend prototype with methods that have no argument.
  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      jProto[passfunc] = function(func) {
        var self = this,
        results;
        // Check for callback.
        if (func) {
          setTimeout(function() {
            func.call(self, jProto[passfunc].call(self));
          });
          return this;
        }
        results = jStat[passfunc](this);
        return isArray(results) ? jStat(results) : results;
      };
    })(funcs[i]);
  })('transpose clear symmetric rows cols dimensions diag antidiag'.split(' '));


  // Extend prototype with methods that have one argument.
  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      jProto[passfunc] = function(index, func) {
        var self = this;
        // check for callback
        if (func) {
          setTimeout(function() {
            func.call(self, jProto[passfunc].call(self, index));
          });
          return this;
        }
        return jStat(jStat[passfunc](this, index));
      };
    })(funcs[i]);
  })('row col'.split(' '));


  // Extend prototype with simple shortcut methods.
  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      jProto[passfunc] = function() {
        return jStat(jStat[passfunc].apply(null, arguments));
      };
    })(funcs[i]);
  })('create zeros ones rand identity'.split(' '));


  // Exposing jStat.
  return jStat;

  }(Math));
  (function(jStat, Math) {

  var isFunction = jStat.utils.isFunction;

  // Ascending functions for sort
  function ascNum(a, b) { return a - b; }

  function clip(arg, min, max) {
    return Math.max(min, Math.min(arg, max));
  }


  // sum of an array
  jStat.sum = function sum(arr) {
    var sum = 0;
    var i = arr.length;
    while (--i >= 0)
      sum += arr[i];
    return sum;
  };


  // sum squared
  jStat.sumsqrd = function sumsqrd(arr) {
    var sum = 0;
    var i = arr.length;
    while (--i >= 0)
      sum += arr[i] * arr[i];
    return sum;
  };


  // sum of squared errors of prediction (SSE)
  jStat.sumsqerr = function sumsqerr(arr) {
    var mean = jStat.mean(arr);
    var sum = 0;
    var i = arr.length;
    var tmp;
    while (--i >= 0) {
      tmp = arr[i] - mean;
      sum += tmp * tmp;
    }
    return sum;
  };

  // sum of an array in each row
  jStat.sumrow = function sumrow(arr) {
    var sum = 0;
    var i = arr.length;
    while (--i >= 0)
      sum += arr[i];
    return sum;
  };

  // product of an array
  jStat.product = function product(arr) {
    var prod = 1;
    var i = arr.length;
    while (--i >= 0)
      prod *= arr[i];
    return prod;
  };


  // minimum value of an array
  jStat.min = function min(arr) {
    var low = arr[0];
    var i = 0;
    while (++i < arr.length)
      if (arr[i] < low)
        low = arr[i];
    return low;
  };


  // maximum value of an array
  jStat.max = function max(arr) {
    var high = arr[0];
    var i = 0;
    while (++i < arr.length)
      if (arr[i] > high)
        high = arr[i];
    return high;
  };


  // unique values of an array
  jStat.unique = function unique(arr) {
    var hash = {}, _arr = [];
    for(var i = 0; i < arr.length; i++) {
      if (!hash[arr[i]]) {
        hash[arr[i]] = true;
        _arr.push(arr[i]);
      }
    }
    return _arr;
  };


  // mean value of an array
  jStat.mean = function mean(arr) {
    return jStat.sum(arr) / arr.length;
  };


  // mean squared error (MSE)
  jStat.meansqerr = function meansqerr(arr) {
    return jStat.sumsqerr(arr) / arr.length;
  };


  // geometric mean of an array
  jStat.geomean = function geomean(arr) {
    return Math.pow(jStat.product(arr), 1 / arr.length);
  };


  // median of an array
  jStat.median = function median(arr) {
    var arrlen = arr.length;
    var _arr = arr.slice().sort(ascNum);
    // check if array is even or odd, then return the appropriate
    return !(arrlen & 1)
      ? (_arr[(arrlen / 2) - 1 ] + _arr[(arrlen / 2)]) / 2
      : _arr[(arrlen / 2) | 0 ];
  };


  // cumulative sum of an array
  jStat.cumsum = function cumsum(arr) {
    return jStat.cumreduce(arr, function (a, b) { return a + b; });
  };


  // cumulative product of an array
  jStat.cumprod = function cumprod(arr) {
    return jStat.cumreduce(arr, function (a, b) { return a * b; });
  };


  // successive differences of a sequence
  jStat.diff = function diff(arr) {
    var diffs = [];
    var arrLen = arr.length;
    var i;
    for (i = 1; i < arrLen; i++)
      diffs.push(arr[i] - arr[i - 1]);
    return diffs;
  };


  // ranks of an array
  jStat.rank = function (arr) {
    var i;
    var distinctNumbers = [];
    var numberCounts = {};
    for (i = 0; i < arr.length; i++) {
      var number = arr[i];
      if (numberCounts[number]) {
        numberCounts[number]++;
      } else {
        numberCounts[number] = 1;
        distinctNumbers.push(number);
      }
    }

    var sortedDistinctNumbers = distinctNumbers.sort(ascNum);
    var numberRanks = {};
    var currentRank = 1;
    for (i = 0; i < sortedDistinctNumbers.length; i++) {
      var number = sortedDistinctNumbers[i];
      var count = numberCounts[number];
      var first = currentRank;
      var last = currentRank + count - 1;
      var rank = (first + last) / 2;
      numberRanks[number] = rank;
      currentRank += count;
    }

    return arr.map(function (number) {
      return numberRanks[number];
    });
  };


  // mode of an array
  // if there are multiple modes of an array, return all of them
  // is this the appropriate way of handling it?
  jStat.mode = function mode(arr) {
    var arrLen = arr.length;
    var _arr = arr.slice().sort(ascNum);
    var count = 1;
    var maxCount = 0;
    var numMaxCount = 0;
    var mode_arr = [];
    var i;

    for (i = 0; i < arrLen; i++) {
      if (_arr[i] === _arr[i + 1]) {
        count++;
      } else {
        if (count > maxCount) {
          mode_arr = [_arr[i]];
          maxCount = count;
          numMaxCount = 0;
        }
        // are there multiple max counts
        else if (count === maxCount) {
          mode_arr.push(_arr[i]);
          numMaxCount++;
        }
        // resetting count for new value in array
        count = 1;
      }
    }

    return numMaxCount === 0 ? mode_arr[0] : mode_arr;
  };


  // range of an array
  jStat.range = function range(arr) {
    return jStat.max(arr) - jStat.min(arr);
  };

  // variance of an array
  // flag = true indicates sample instead of population
  jStat.variance = function variance(arr, flag) {
    return jStat.sumsqerr(arr) / (arr.length - (flag ? 1 : 0));
  };

  // pooled variance of an array of arrays
  jStat.pooledvariance = function pooledvariance(arr) {
    var sumsqerr = arr.reduce(function (a, samples) {return a + jStat.sumsqerr(samples);}, 0);
    var count = arr.reduce(function (a, samples) {return a + samples.length;}, 0);
    return sumsqerr / (count - arr.length);
  };

  // deviation of an array
  jStat.deviation = function (arr) {
    var mean = jStat.mean(arr);
    var arrlen = arr.length;
    var dev = new Array(arrlen);
    for (var i = 0; i < arrlen; i++) {
      dev[i] = arr[i] - mean;
    }
    return dev;
  };

  // standard deviation of an array
  // flag = true indicates sample instead of population
  jStat.stdev = function stdev(arr, flag) {
    return Math.sqrt(jStat.variance(arr, flag));
  };

  // pooled standard deviation of an array of arrays
  jStat.pooledstdev = function pooledstdev(arr) {
    return Math.sqrt(jStat.pooledvariance(arr));
  };

  // mean deviation (mean absolute deviation) of an array
  jStat.meandev = function meandev(arr) {
    var mean = jStat.mean(arr);
    var a = [];
    for (var i = arr.length - 1; i >= 0; i--) {
      a.push(Math.abs(arr[i] - mean));
    }
    return jStat.mean(a);
  };


  // median deviation (median absolute deviation) of an array
  jStat.meddev = function meddev(arr) {
    var median = jStat.median(arr);
    var a = [];
    for (var i = arr.length - 1; i >= 0; i--) {
      a.push(Math.abs(arr[i] - median));
    }
    return jStat.median(a);
  };


  // coefficient of variation
  jStat.coeffvar = function coeffvar(arr) {
    return jStat.stdev(arr) / jStat.mean(arr);
  };


  // quartiles of an array
  jStat.quartiles = function quartiles(arr) {
    var arrlen = arr.length;
    var _arr = arr.slice().sort(ascNum);
    return [
      _arr[ Math.round((arrlen) / 4) - 1 ],
      _arr[ Math.round((arrlen) / 2) - 1 ],
      _arr[ Math.round((arrlen) * 3 / 4) - 1 ]
    ];
  };


  // Arbitary quantiles of an array. Direct port of the scipy.stats
  // implementation by Pierre GF Gerard-Marchant.
  jStat.quantiles = function quantiles(arr, quantilesArray, alphap, betap) {
    var sortedArray = arr.slice().sort(ascNum);
    var quantileVals = [quantilesArray.length];
    var n = arr.length;
    var i, p, m, aleph, k, gamma;

    if (typeof alphap === 'undefined')
      alphap = 3 / 8;
    if (typeof betap === 'undefined')
      betap = 3 / 8;

    for (i = 0; i < quantilesArray.length; i++) {
      p = quantilesArray[i];
      m = alphap + p * (1 - alphap - betap);
      aleph = n * p + m;
      k = Math.floor(clip(aleph, 1, n - 1));
      gamma = clip(aleph - k, 0, 1);
      quantileVals[i] = (1 - gamma) * sortedArray[k - 1] + gamma * sortedArray[k];
    }

    return quantileVals;
  };

  // Return the k-th percentile of values in a range, where k is in the range 0..1, inclusive.
  // Passing true for the exclusive parameter excludes both endpoints of the range.
  jStat.percentile = function percentile(arr, k, exclusive) {
    var _arr = arr.slice().sort(ascNum);
    var realIndex = k * (_arr.length + (exclusive ? 1 : -1)) + (exclusive ? 0 : 1);
    var index = parseInt(realIndex);
    var frac = realIndex - index;
    if (index + 1 < _arr.length) {
      return _arr[index - 1] + frac * (_arr[index] - _arr[index - 1]);
    } else {
      return _arr[index - 1];
    }
  };

  // The percentile rank of score in a given array. Returns the percentage
  // of all values in the input array that are less than (kind='strict') or
  // less or equal than (kind='weak') score. Default is weak.
  jStat.percentileOfScore = function percentileOfScore(arr, score, kind) {
    var counter = 0;
    var len = arr.length;
    var strict = false;
    var value, i;

    if (kind === 'strict')
      strict = true;

    for (i = 0; i < len; i++) {
      value = arr[i];
      if ((strict && value < score) ||
          (!strict && value <= score)) {
        counter++;
      }
    }

    return counter / len;
  };


  // Histogram (bin count) data
  jStat.histogram = function histogram(arr, binCnt) {
    binCnt = binCnt || 4;
    var first = jStat.min(arr);
    var binWidth = (jStat.max(arr) - first) / binCnt;
    var len = arr.length;
    var bins = [];
    var i;

    for (i = 0; i < binCnt; i++)
      bins[i] = 0;
    for (i = 0; i < len; i++)
      bins[Math.min(Math.floor(((arr[i] - first) / binWidth)), binCnt - 1)] += 1;

    return bins;
  };


  // covariance of two arrays
  jStat.covariance = function covariance(arr1, arr2) {
    var u = jStat.mean(arr1);
    var v = jStat.mean(arr2);
    var arr1Len = arr1.length;
    var sq_dev = new Array(arr1Len);
    var i;

    for (i = 0; i < arr1Len; i++)
      sq_dev[i] = (arr1[i] - u) * (arr2[i] - v);

    return jStat.sum(sq_dev) / (arr1Len - 1);
  };


  // (pearson's) population correlation coefficient, rho
  jStat.corrcoeff = function corrcoeff(arr1, arr2) {
    return jStat.covariance(arr1, arr2) /
        jStat.stdev(arr1, 1) /
        jStat.stdev(arr2, 1);
  };

    // (spearman's) rank correlation coefficient, sp
  jStat.spearmancoeff =  function (arr1, arr2) {
    arr1 = jStat.rank(arr1);
    arr2 = jStat.rank(arr2);
    //return pearson's correlation of the ranks:
    return jStat.corrcoeff(arr1, arr2);
  };


  // statistical standardized moments (general form of skew/kurt)
  jStat.stanMoment = function stanMoment(arr, n) {
    var mu = jStat.mean(arr);
    var sigma = jStat.stdev(arr);
    var len = arr.length;
    var skewSum = 0;

    for (var i = 0; i < len; i++)
      skewSum += Math.pow((arr[i] - mu) / sigma, n);

    return skewSum / arr.length;
  };

  // (pearson's) moment coefficient of skewness
  jStat.skewness = function skewness(arr) {
    return jStat.stanMoment(arr, 3);
  };

  // (pearson's) (excess) kurtosis
  jStat.kurtosis = function kurtosis(arr) {
    return jStat.stanMoment(arr, 4) - 3;
  };


  var jProto = jStat.prototype;


  // Extend jProto with method for calculating cumulative sums and products.
  // This differs from the similar extension below as cumsum and cumprod should
  // not be run again in the case fullbool === true.
  // If a matrix is passed, automatically assume operation should be done on the
  // columns.
  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      // If a matrix is passed, automatically assume operation should be done on
      // the columns.
      jProto[passfunc] = function(fullbool, func) {
        var arr = [];
        var i = 0;
        var tmpthis = this;
        // Assignment reassignation depending on how parameters were passed in.
        if (isFunction(fullbool)) {
          func = fullbool;
          fullbool = false;
        }
        // Check if a callback was passed with the function.
        if (func) {
          setTimeout(function() {
            func.call(tmpthis, jProto[passfunc].call(tmpthis, fullbool));
          });
          return this;
        }
        // Check if matrix and run calculations.
        if (this.length > 1) {
          tmpthis = fullbool === true ? this : this.transpose();
          for (; i < tmpthis.length; i++)
            arr[i] = jStat[passfunc](tmpthis[i]);
          return arr;
        }
        // Pass fullbool if only vector, not a matrix. for variance and stdev.
        return jStat[passfunc](this[0], fullbool);
      };
    })(funcs[i]);
  })(('cumsum cumprod').split(' '));


  // Extend jProto with methods which don't require arguments and work on columns.
  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      // If a matrix is passed, automatically assume operation should be done on
      // the columns.
      jProto[passfunc] = function(fullbool, func) {
        var arr = [];
        var i = 0;
        var tmpthis = this;
        // Assignment reassignation depending on how parameters were passed in.
        if (isFunction(fullbool)) {
          func = fullbool;
          fullbool = false;
        }
        // Check if a callback was passed with the function.
        if (func) {
          setTimeout(function() {
            func.call(tmpthis, jProto[passfunc].call(tmpthis, fullbool));
          });
          return this;
        }
        // Check if matrix and run calculations.
        if (this.length > 1) {
          if (passfunc !== 'sumrow')
            tmpthis = fullbool === true ? this : this.transpose();
          for (; i < tmpthis.length; i++)
            arr[i] = jStat[passfunc](tmpthis[i]);
          return fullbool === true
              ? jStat[passfunc](jStat.utils.toVector(arr))
              : arr;
        }
        // Pass fullbool if only vector, not a matrix. for variance and stdev.
        return jStat[passfunc](this[0], fullbool);
      };
    })(funcs[i]);
  })(('sum sumsqrd sumsqerr sumrow product min max unique mean meansqerr ' +
      'geomean median diff rank mode range variance deviation stdev meandev ' +
      'meddev coeffvar quartiles histogram skewness kurtosis').split(' '));


  // Extend jProto with functions that take arguments. Operations on matrices are
  // done on columns.
  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      jProto[passfunc] = function() {
        var arr = [];
        var i = 0;
        var tmpthis = this;
        var args = Array.prototype.slice.call(arguments);
        var callbackFunction;

        // If the last argument is a function, we assume it's a callback; we
        // strip the callback out and call the function again.
        if (isFunction(args[args.length - 1])) {
          callbackFunction = args[args.length - 1];
          var argsToPass = args.slice(0, args.length - 1);

          setTimeout(function() {
            callbackFunction.call(tmpthis,
                                  jProto[passfunc].apply(tmpthis, argsToPass));
          });
          return this;

        // Otherwise we curry the function args and call normally.
        } else {
          callbackFunction = undefined;
          var curriedFunction = function curriedFunction(vector) {
            return jStat[passfunc].apply(tmpthis, [vector].concat(args));
          };
        }

        // If this is a matrix, run column-by-column.
        if (this.length > 1) {
          tmpthis = tmpthis.transpose();
          for (; i < tmpthis.length; i++)
            arr[i] = curriedFunction(tmpthis[i]);
          return arr;
        }

        // Otherwise run on the vector.
        return curriedFunction(this[0]);
      };
    })(funcs[i]);
  })('quantiles percentileOfScore'.split(' '));

  }(jStat, Math));
  // Special functions //
  (function(jStat, Math) {

  // Log-gamma function
  jStat.gammaln = function gammaln(x) {
    var j = 0;
    var cof = [
      76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
    ];
    var ser = 1.000000000190015;
    var xx, y, tmp;
    tmp = (y = xx = x) + 5.5;
    tmp -= (xx + 0.5) * Math.log(tmp);
    for (; j < 6; j++)
      ser += cof[j] / ++y;
    return Math.log(2.5066282746310005 * ser / xx) - tmp;
  };

  /*
   * log-gamma function to support poisson distribution sampling. The
   * algorithm comes from SPECFUN by Shanjie Zhang and Jianming Jin and their
   * book "Computation of Special Functions", 1996, John Wiley & Sons, Inc.
   */
  jStat.loggam = function loggam(x) {
    var x0, x2, xp, gl, gl0;
    var k, n;

    var a = [8.333333333333333e-02, -2.777777777777778e-03,
            7.936507936507937e-04, -5.952380952380952e-04,
            8.417508417508418e-04, -1.917526917526918e-03,
            6.410256410256410e-03, -2.955065359477124e-02,
            1.796443723688307e-01, -1.39243221690590e+00];
    x0 = x;
    n = 0;
    if ((x == 1.0) || (x == 2.0)) {
        return 0.0;
    }
    if (x <= 7.0) {
        n = Math.floor(7 - x);
        x0 = x + n;
    }
    x2 = 1.0 / (x0 * x0);
    xp = 2 * Math.PI;
    gl0 = a[9];
    for (k = 8; k >= 0; k--) {
        gl0 *= x2;
        gl0 += a[k];
    }
    gl = gl0 / x0 + 0.5 * Math.log(xp) + (x0 - 0.5) * Math.log(x0) - x0;
    if (x <= 7.0) {
        for (k = 1; k <= n; k++) {
            gl -= Math.log(x0 - 1.0);
            x0 -= 1.0;
        }
    }
    return gl;
  };

  // gamma of x
  jStat.gammafn = function gammafn(x) {
    var p = [-1.716185138865495, 24.76565080557592, -379.80425647094563,
             629.3311553128184, 866.9662027904133, -31451.272968848367,
             -36144.413418691176, 66456.14382024054
    ];
    var q = [-30.8402300119739, 315.35062697960416, -1015.1563674902192,
             -3107.771671572311, 22538.118420980151, 4755.8462775278811,
             -134659.9598649693, -115132.2596755535];
    var fact = false;
    var n = 0;
    var xden = 0;
    var xnum = 0;
    var y = x;
    var i, z, yi, res;
    if (x > 171.6243769536076) {
      return Infinity;
    }
    if (y <= 0) {
      res = y % 1 + 3.6e-16;
      if (res) {
        fact = (!(y & 1) ? 1 : -1) * Math.PI / Math.sin(Math.PI * res);
        y = 1 - y;
      } else {
        return Infinity;
      }
    }
    yi = y;
    if (y < 1) {
      z = y++;
    } else {
      z = (y -= n = (y | 0) - 1) - 1;
    }
    for (i = 0; i < 8; ++i) {
      xnum = (xnum + p[i]) * z;
      xden = xden * z + q[i];
    }
    res = xnum / xden + 1;
    if (yi < y) {
      res /= yi;
    } else if (yi > y) {
      for (i = 0; i < n; ++i) {
        res *= y;
        y++;
      }
    }
    if (fact) {
      res = fact / res;
    }
    return res;
  };


  // lower incomplete gamma function, which is usually typeset with a
  // lower-case greek gamma as the function symbol
  jStat.gammap = function gammap(a, x) {
    return jStat.lowRegGamma(a, x) * jStat.gammafn(a);
  };


  // The lower regularized incomplete gamma function, usually written P(a,x)
  jStat.lowRegGamma = function lowRegGamma(a, x) {
    var aln = jStat.gammaln(a);
    var ap = a;
    var sum = 1 / a;
    var del = sum;
    var b = x + 1 - a;
    var c = 1 / 1.0e-30;
    var d = 1 / b;
    var h = d;
    var i = 1;
    // calculate maximum number of itterations required for a
    var ITMAX = -~(Math.log((a >= 1) ? a : 1 / a) * 8.5 + a * 0.4 + 17);
    var an;

    if (x < 0 || a <= 0) {
      return NaN;
    } else if (x < a + 1) {
      for (; i <= ITMAX; i++) {
        sum += del *= x / ++ap;
      }
      return (sum * Math.exp(-x + a * Math.log(x) - (aln)));
    }

    for (; i <= ITMAX; i++) {
      an = -i * (i - a);
      b += 2;
      d = an * d + b;
      c = b + an / c;
      d = 1 / d;
      h *= d * c;
    }

    return (1 - h * Math.exp(-x + a * Math.log(x) - (aln)));
  };

  // natural log factorial of n
  jStat.factorialln = function factorialln(n) {
    return n < 0 ? NaN : jStat.gammaln(n + 1);
  };

  // factorial of n
  jStat.factorial = function factorial(n) {
    return n < 0 ? NaN : jStat.gammafn(n + 1);
  };

  // combinations of n, m
  jStat.combination = function combination(n, m) {
    // make sure n or m don't exceed the upper limit of usable values
    return (n > 170 || m > 170)
        ? Math.exp(jStat.combinationln(n, m))
        : (jStat.factorial(n) / jStat.factorial(m)) / jStat.factorial(n - m);
  };


  jStat.combinationln = function combinationln(n, m){
    return jStat.factorialln(n) - jStat.factorialln(m) - jStat.factorialln(n - m);
  };


  // permutations of n, m
  jStat.permutation = function permutation(n, m) {
    return jStat.factorial(n) / jStat.factorial(n - m);
  };


  // beta function
  jStat.betafn = function betafn(x, y) {
    // ensure arguments are positive
    if (x <= 0 || y <= 0)
      return undefined;
    // make sure x + y doesn't exceed the upper limit of usable values
    return (x + y > 170)
        ? Math.exp(jStat.betaln(x, y))
        : jStat.gammafn(x) * jStat.gammafn(y) / jStat.gammafn(x + y);
  };


  // natural logarithm of beta function
  jStat.betaln = function betaln(x, y) {
    return jStat.gammaln(x) + jStat.gammaln(y) - jStat.gammaln(x + y);
  };


  // Evaluates the continued fraction for incomplete beta function by modified
  // Lentz's method.
  jStat.betacf = function betacf(x, a, b) {
    var fpmin = 1e-30;
    var m = 1;
    var qab = a + b;
    var qap = a + 1;
    var qam = a - 1;
    var c = 1;
    var d = 1 - qab * x / qap;
    var m2, aa, del, h;

    // These q's will be used in factors that occur in the coefficients
    if (Math.abs(d) < fpmin)
      d = fpmin;
    d = 1 / d;
    h = d;

    for (; m <= 100; m++) {
      m2 = 2 * m;
      aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      // One step (the even one) of the recurrence
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin)
        d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin)
        c = fpmin;
      d = 1 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      // Next step of the recurrence (the odd one)
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin)
        d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin)
        c = fpmin;
      d = 1 / d;
      del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < 3e-7)
        break;
    }

    return h;
  };


  // Returns the inverse of the lower regularized inomplete gamma function
  jStat.gammapinv = function gammapinv(p, a) {
    var j = 0;
    var a1 = a - 1;
    var EPS = 1e-8;
    var gln = jStat.gammaln(a);
    var x, err, t, u, pp, lna1, afac;

    if (p >= 1)
      return Math.max(100, a + 100 * Math.sqrt(a));
    if (p <= 0)
      return 0;
    if (a > 1) {
      lna1 = Math.log(a1);
      afac = Math.exp(a1 * (lna1 - 1) - gln);
      pp = (p < 0.5) ? p : 1 - p;
      t = Math.sqrt(-2 * Math.log(pp));
      x = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t;
      if (p < 0.5)
        x = -x;
      x = Math.max(1e-3,
                   a * Math.pow(1 - 1 / (9 * a) - x / (3 * Math.sqrt(a)), 3));
    } else {
      t = 1 - a * (0.253 + a * 0.12);
      if (p < t)
        x = Math.pow(p / t, 1 / a);
      else
        x = 1 - Math.log(1 - (p - t) / (1 - t));
    }

    for(; j < 12; j++) {
      if (x <= 0)
        return 0;
      err = jStat.lowRegGamma(a, x) - p;
      if (a > 1)
        t = afac * Math.exp(-(x - a1) + a1 * (Math.log(x) - lna1));
      else
        t = Math.exp(-x + a1 * Math.log(x) - gln);
      u = err / t;
      x -= (t = u / (1 - 0.5 * Math.min(1, u * ((a - 1) / x - 1))));
      if (x <= 0)
        x = 0.5 * (x + t);
      if (Math.abs(t) < EPS * x)
        break;
    }

    return x;
  };


  // Returns the error function erf(x)
  jStat.erf = function erf(x) {
    var cof = [-1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
               -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
               4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
               1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8,
               6.529054439e-9, 5.059343495e-9, -9.91364156e-10,
               -2.27365122e-10, 9.6467911e-11, 2.394038e-12,
               -6.886027e-12, 8.94487e-13, 3.13092e-13,
               -1.12708e-13, 3.81e-16, 7.106e-15,
               -1.523e-15, -9.4e-17, 1.21e-16,
               -2.8e-17];
    var j = cof.length - 1;
    var isneg = false;
    var d = 0;
    var dd = 0;
    var t, ty, tmp, res;

    if (x < 0) {
      x = -x;
      isneg = true;
    }

    t = 2 / (2 + x);
    ty = 4 * t - 2;

    for(; j > 0; j--) {
      tmp = d;
      d = ty * d - dd + cof[j];
      dd = tmp;
    }

    res = t * Math.exp(-x * x + 0.5 * (cof[0] + ty * d) - dd);
    return isneg ? res - 1 : 1 - res;
  };


  // Returns the complmentary error function erfc(x)
  jStat.erfc = function erfc(x) {
    return 1 - jStat.erf(x);
  };


  // Returns the inverse of the complementary error function
  jStat.erfcinv = function erfcinv(p) {
    var j = 0;
    var x, err, t, pp;
    if (p >= 2)
      return -100;
    if (p <= 0)
      return 100;
    pp = (p < 1) ? p : 2 - p;
    t = Math.sqrt(-2 * Math.log(pp / 2));
    x = -0.70711 * ((2.30753 + t * 0.27061) /
                    (1 + t * (0.99229 + t * 0.04481)) - t);
    for (; j < 2; j++) {
      err = jStat.erfc(x) - pp;
      x += err / (1.12837916709551257 * Math.exp(-x * x) - x * err);
    }
    return (p < 1) ? x : -x;
  };


  // Returns the inverse of the incomplete beta function
  jStat.ibetainv = function ibetainv(p, a, b) {
    var EPS = 1e-8;
    var a1 = a - 1;
    var b1 = b - 1;
    var j = 0;
    var lna, lnb, pp, t, u, err, x, al, h, w, afac;
    if (p <= 0)
      return 0;
    if (p >= 1)
      return 1;
    if (a >= 1 && b >= 1) {
      pp = (p < 0.5) ? p : 1 - p;
      t = Math.sqrt(-2 * Math.log(pp));
      x = (2.30753 + t * 0.27061) / (1 + t* (0.99229 + t * 0.04481)) - t;
      if (p < 0.5)
        x = -x;
      al = (x * x - 3) / 6;
      h = 2 / (1 / (2 * a - 1)  + 1 / (2 * b - 1));
      w = (x * Math.sqrt(al + h) / h) - (1 / (2 * b - 1) - 1 / (2 * a - 1)) *
          (al + 5 / 6 - 2 / (3 * h));
      x = a / (a + b * Math.exp(2 * w));
    } else {
      lna = Math.log(a / (a + b));
      lnb = Math.log(b / (a + b));
      t = Math.exp(a * lna) / a;
      u = Math.exp(b * lnb) / b;
      w = t + u;
      if (p < t / w)
        x = Math.pow(a * w * p, 1 / a);
      else
        x = 1 - Math.pow(b * w * (1 - p), 1 / b);
    }
    afac = -jStat.gammaln(a) - jStat.gammaln(b) + jStat.gammaln(a + b);
    for(; j < 10; j++) {
      if (x === 0 || x === 1)
        return x;
      err = jStat.ibeta(x, a, b) - p;
      t = Math.exp(a1 * Math.log(x) + b1 * Math.log(1 - x) + afac);
      u = err / t;
      x -= (t = u / (1 - 0.5 * Math.min(1, u * (a1 / x - b1 / (1 - x)))));
      if (x <= 0)
        x = 0.5 * (x + t);
      if (x >= 1)
        x = 0.5 * (x + t + 1);
      if (Math.abs(t) < EPS * x && j > 0)
        break;
    }
    return x;
  };


  // Returns the incomplete beta function I_x(a,b)
  jStat.ibeta = function ibeta(x, a, b) {
    // Factors in front of the continued fraction.
    var bt = (x === 0 || x === 1) ?  0 :
      Math.exp(jStat.gammaln(a + b) - jStat.gammaln(a) -
               jStat.gammaln(b) + a * Math.log(x) + b *
               Math.log(1 - x));
    if (x < 0 || x > 1)
      return false;
    if (x < (a + 1) / (a + b + 2))
      // Use continued fraction directly.
      return bt * jStat.betacf(x, a, b) / a;
    // else use continued fraction after making the symmetry transformation.
    return 1 - bt * jStat.betacf(1 - x, b, a) / b;
  };


  // Returns a normal deviate (mu=0, sigma=1).
  // If n and m are specified it returns a object of normal deviates.
  jStat.randn = function randn(n, m) {
    var u, v, x, y, q;
    if (!m)
      m = n;
    if (n)
      return jStat.create(n, m, function() { return jStat.randn(); });
    do {
      u = jStat._random_fn();
      v = 1.7156 * (jStat._random_fn() - 0.5);
      x = u - 0.449871;
      y = Math.abs(v) + 0.386595;
      q = x * x + y * (0.19600 * y - 0.25472 * x);
    } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));
    return v / u;
  };


  // Returns a gamma deviate by the method of Marsaglia and Tsang.
  jStat.randg = function randg(shape, n, m) {
    var oalph = shape;
    var a1, a2, u, v, x, mat;
    if (!m)
      m = n;
    if (!shape)
      shape = 1;
    if (n) {
      mat = jStat.zeros(n,m);
      mat.alter(function() { return jStat.randg(shape); });
      return mat;
    }
    if (shape < 1)
      shape += 1;
    a1 = shape - 1 / 3;
    a2 = 1 / Math.sqrt(9 * a1);
    do {
      do {
        x = jStat.randn();
        v = 1 + a2 * x;
      } while(v <= 0);
      v = v * v * v;
      u = jStat._random_fn();
    } while(u > 1 - 0.331 * Math.pow(x, 4) &&
            Math.log(u) > 0.5 * x*x + a1 * (1 - v + Math.log(v)));
    // alpha > 1
    if (shape == oalph)
      return a1 * v;
    // alpha < 1
    do {
      u = jStat._random_fn();
    } while(u === 0);
    return Math.pow(u, 1 / oalph) * a1 * v;
  };


  // making use of static methods on the instance
  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      jStat.fn[passfunc] = function() {
        return jStat(
            jStat.map(this, function(value) { return jStat[passfunc](value); }));
      };
    })(funcs[i]);
  })('gammaln gammafn factorial factorialln'.split(' '));


  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      jStat.fn[passfunc] = function() {
        return jStat(jStat[passfunc].apply(null, arguments));
      };
    })(funcs[i]);
  })('randn'.split(' '));

  }(jStat, Math));
  (function(jStat, Math) {

  // generate all distribution instance methods
  (function(list) {
    for (var i = 0; i < list.length; i++) (function(func) {
      // distribution instance method
      jStat[func] = function f(a, b, c) {
        if (!(this instanceof f))
          return new f(a, b, c);
        this._a = a;
        this._b = b;
        this._c = c;
        return this;
      };
      // distribution method to be used on a jStat instance
      jStat.fn[func] = function(a, b, c) {
        var newthis = jStat[func](a, b, c);
        newthis.data = this;
        return newthis;
      };
      // sample instance method
      jStat[func].prototype.sample = function(arr) {
        var a = this._a;
        var b = this._b;
        var c = this._c;
        if (arr)
          return jStat.alter(arr, function() {
            return jStat[func].sample(a, b, c);
          });
        else
          return jStat[func].sample(a, b, c);
      };
      // generate the pdf, cdf and inv instance methods
      (function(vals) {
        for (var i = 0; i < vals.length; i++) (function(fnfunc) {
          jStat[func].prototype[fnfunc] = function(x) {
            var a = this._a;
            var b = this._b;
            var c = this._c;
            if (!x && x !== 0)
              x = this.data;
            if (typeof x !== 'number') {
              return jStat.fn.map.call(x, function(x) {
                return jStat[func][fnfunc](x, a, b, c);
              });
            }
            return jStat[func][fnfunc](x, a, b, c);
          };
        })(vals[i]);
      })('pdf cdf inv'.split(' '));
      // generate the mean, median, mode and variance instance methods
      (function(vals) {
        for (var i = 0; i < vals.length; i++) (function(fnfunc) {
          jStat[func].prototype[fnfunc] = function() {
            return jStat[func][fnfunc](this._a, this._b, this._c);
          };
        })(vals[i]);
      })('mean median mode variance'.split(' '));
    })(list[i]);
  })((
    'beta centralF cauchy chisquare exponential gamma invgamma kumaraswamy ' +
    'laplace lognormal noncentralt normal pareto studentt weibull uniform ' +
    'binomial negbin hypgeom poisson triangular tukey arcsine'
  ).split(' '));



  // extend beta function with static methods
  jStat.extend(jStat.beta, {
    pdf: function pdf(x, alpha, beta) {
      // PDF is zero outside the support
      if (x > 1 || x < 0)
        return 0;
      // PDF is one for the uniform case
      if (alpha == 1 && beta == 1)
        return 1;

      if (alpha < 512 && beta < 512) {
        return (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) /
            jStat.betafn(alpha, beta);
      } else {
        return Math.exp((alpha - 1) * Math.log(x) +
                        (beta - 1) * Math.log(1 - x) -
                        jStat.betaln(alpha, beta));
      }
    },

    cdf: function cdf(x, alpha, beta) {
      return (x > 1 || x < 0) ? (x > 1) * 1 : jStat.ibeta(x, alpha, beta);
    },

    inv: function inv(x, alpha, beta) {
      return jStat.ibetainv(x, alpha, beta);
    },

    mean: function mean(alpha, beta) {
      return alpha / (alpha + beta);
    },

    median: function median(alpha, beta) {
      return jStat.ibetainv(0.5, alpha, beta);
    },

    mode: function mode(alpha, beta) {
      return (alpha - 1 ) / ( alpha + beta - 2);
    },

    // return a random sample
    sample: function sample(alpha, beta) {
      var u = jStat.randg(alpha);
      return u / (u + jStat.randg(beta));
    },

    variance: function variance(alpha, beta) {
      return (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
    }
  });

  // extend F function with static methods
  jStat.extend(jStat.centralF, {
    // This implementation of the pdf function avoids float overflow
    // See the way that R calculates this value:
    // https://svn.r-project.org/R/trunk/src/nmath/df.c
    pdf: function pdf(x, df1, df2) {
      var p, q, f;

      if (x < 0)
        return 0;

      if (df1 <= 2) {
        if (x === 0 && df1 < 2) {
          return Infinity;
        }
        if (x === 0 && df1 === 2) {
          return 1;
        }
        return (1 / jStat.betafn(df1 / 2, df2 / 2)) *
                Math.pow(df1 / df2, df1 / 2) *
                Math.pow(x, (df1/2) - 1) *
                Math.pow((1 + (df1 / df2) * x), -(df1 + df2) / 2);
      }

      p = (df1 * x) / (df2 + x * df1);
      q = df2 / (df2 + x * df1);
      f = df1 * q / 2.0;
      return f * jStat.binomial.pdf((df1 - 2) / 2, (df1 + df2 - 2) / 2, p);
    },

    cdf: function cdf(x, df1, df2) {
      if (x < 0)
        return 0;
      return jStat.ibeta((df1 * x) / (df1 * x + df2), df1 / 2, df2 / 2);
    },

    inv: function inv(x, df1, df2) {
      return df2 / (df1 * (1 / jStat.ibetainv(x, df1 / 2, df2 / 2) - 1));
    },

    mean: function mean(df1, df2) {
      return (df2 > 2) ? df2 / (df2 - 2) : undefined;
    },

    mode: function mode(df1, df2) {
      return (df1 > 2) ? (df2 * (df1 - 2)) / (df1 * (df2 + 2)) : undefined;
    },

    // return a random sample
    sample: function sample(df1, df2) {
      var x1 = jStat.randg(df1 / 2) * 2;
      var x2 = jStat.randg(df2 / 2) * 2;
      return (x1 / df1) / (x2 / df2);
    },

    variance: function variance(df1, df2) {
      if (df2 <= 4)
        return undefined;
      return 2 * df2 * df2 * (df1 + df2 - 2) /
          (df1 * (df2 - 2) * (df2 - 2) * (df2 - 4));
    }
  });


  // extend cauchy function with static methods
  jStat.extend(jStat.cauchy, {
    pdf: function pdf(x, local, scale) {
      if (scale < 0) { return 0; }

      return (scale / (Math.pow(x - local, 2) + Math.pow(scale, 2))) / Math.PI;
    },

    cdf: function cdf(x, local, scale) {
      return Math.atan((x - local) / scale) / Math.PI + 0.5;
    },

    inv: function(p, local, scale) {
      return local + scale * Math.tan(Math.PI * (p - 0.5));
    },

    median: function median(local/*, scale*/) {
      return local;
    },

    mode: function mode(local/*, scale*/) {
      return local;
    },

    sample: function sample(local, scale) {
      return jStat.randn() *
          Math.sqrt(1 / (2 * jStat.randg(0.5))) * scale + local;
    }
  });



  // extend chisquare function with static methods
  jStat.extend(jStat.chisquare, {
    pdf: function pdf(x, dof) {
      if (x < 0)
        return 0;
      return (x === 0 && dof === 2) ? 0.5 :
          Math.exp((dof / 2 - 1) * Math.log(x) - x / 2 - (dof / 2) *
                   Math.log(2) - jStat.gammaln(dof / 2));
    },

    cdf: function cdf(x, dof) {
      if (x < 0)
        return 0;
      return jStat.lowRegGamma(dof / 2, x / 2);
    },

    inv: function(p, dof) {
      return 2 * jStat.gammapinv(p, 0.5 * dof);
    },

    mean : function(dof) {
      return dof;
    },

    // TODO: this is an approximation (is there a better way?)
    median: function median(dof) {
      return dof * Math.pow(1 - (2 / (9 * dof)), 3);
    },

    mode: function mode(dof) {
      return (dof - 2 > 0) ? dof - 2 : 0;
    },

    sample: function sample(dof) {
      return jStat.randg(dof / 2) * 2;
    },

    variance: function variance(dof) {
      return 2 * dof;
    }
  });



  // extend exponential function with static methods
  jStat.extend(jStat.exponential, {
    pdf: function pdf(x, rate) {
      return x < 0 ? 0 : rate * Math.exp(-rate * x);
    },

    cdf: function cdf(x, rate) {
      return x < 0 ? 0 : 1 - Math.exp(-rate * x);
    },

    inv: function(p, rate) {
      return -Math.log(1 - p) / rate;
    },

    mean : function(rate) {
      return 1 / rate;
    },

    median: function (rate) {
      return (1 / rate) * Math.log(2);
    },

    mode: function mode(/*rate*/) {
      return 0;
    },

    sample: function sample(rate) {
      return -1 / rate * Math.log(jStat._random_fn());
    },

    variance : function(rate) {
      return Math.pow(rate, -2);
    }
  });



  // extend gamma function with static methods
  jStat.extend(jStat.gamma, {
    pdf: function pdf(x, shape, scale) {
      if (x < 0)
        return 0;
      return (x === 0 && shape === 1) ? 1 / scale :
              Math.exp((shape - 1) * Math.log(x) - x / scale -
                      jStat.gammaln(shape) - shape * Math.log(scale));
    },

    cdf: function cdf(x, shape, scale) {
      if (x < 0)
        return 0;
      return jStat.lowRegGamma(shape, x / scale);
    },

    inv: function(p, shape, scale) {
      return jStat.gammapinv(p, shape) * scale;
    },

    mean : function(shape, scale) {
      return shape * scale;
    },

    mode: function mode(shape, scale) {
      if(shape > 1) return (shape - 1) * scale;
      return undefined;
    },

    sample: function sample(shape, scale) {
      return jStat.randg(shape) * scale;
    },

    variance: function variance(shape, scale) {
      return shape * scale * scale;
    }
  });

  // extend inverse gamma function with static methods
  jStat.extend(jStat.invgamma, {
    pdf: function pdf(x, shape, scale) {
      if (x <= 0)
        return 0;
      return Math.exp(-(shape + 1) * Math.log(x) - scale / x -
                      jStat.gammaln(shape) + shape * Math.log(scale));
    },

    cdf: function cdf(x, shape, scale) {
      if (x <= 0)
        return 0;
      return 1 - jStat.lowRegGamma(shape, scale / x);
    },

    inv: function(p, shape, scale) {
      return scale / jStat.gammapinv(1 - p, shape);
    },

    mean : function(shape, scale) {
      return (shape > 1) ? scale / (shape - 1) : undefined;
    },

    mode: function mode(shape, scale) {
      return scale / (shape + 1);
    },

    sample: function sample(shape, scale) {
      return scale / jStat.randg(shape);
    },

    variance: function variance(shape, scale) {
      if (shape <= 2)
        return undefined;
      return scale * scale / ((shape - 1) * (shape - 1) * (shape - 2));
    }
  });


  // extend kumaraswamy function with static methods
  jStat.extend(jStat.kumaraswamy, {
    pdf: function pdf(x, alpha, beta) {
      if (x === 0 && alpha === 1)
        return beta;
      else if (x === 1 && beta === 1)
        return alpha;
      return Math.exp(Math.log(alpha) + Math.log(beta) + (alpha - 1) *
                      Math.log(x) + (beta - 1) *
                      Math.log(1 - Math.pow(x, alpha)));
    },

    cdf: function cdf(x, alpha, beta) {
      if (x < 0)
        return 0;
      else if (x > 1)
        return 1;
      return (1 - Math.pow(1 - Math.pow(x, alpha), beta));
    },

    inv: function inv(p, alpha, beta) {
      return Math.pow(1 - Math.pow(1 - p, 1 / beta), 1 / alpha);
    },

    mean : function(alpha, beta) {
      return (beta * jStat.gammafn(1 + 1 / alpha) *
              jStat.gammafn(beta)) / (jStat.gammafn(1 + 1 / alpha + beta));
    },

    median: function median(alpha, beta) {
      return Math.pow(1 - Math.pow(2, -1 / beta), 1 / alpha);
    },

    mode: function mode(alpha, beta) {
      if (!(alpha >= 1 && beta >= 1 && (alpha !== 1 && beta !== 1)))
        return undefined;
      return Math.pow((alpha - 1) / (alpha * beta - 1), 1 / alpha);
    },

    variance: function variance(/*alpha, beta*/) {
      throw new Error('variance not yet implemented');
      // TODO: complete this
    }
  });



  // extend lognormal function with static methods
  jStat.extend(jStat.lognormal, {
    pdf: function pdf(x, mu, sigma) {
      if (x <= 0)
        return 0;
      return Math.exp(-Math.log(x) - 0.5 * Math.log(2 * Math.PI) -
                      Math.log(sigma) - Math.pow(Math.log(x) - mu, 2) /
                      (2 * sigma * sigma));
    },

    cdf: function cdf(x, mu, sigma) {
      if (x < 0)
        return 0;
      return 0.5 +
          (0.5 * jStat.erf((Math.log(x) - mu) / Math.sqrt(2 * sigma * sigma)));
    },

    inv: function(p, mu, sigma) {
      return Math.exp(-1.41421356237309505 * sigma * jStat.erfcinv(2 * p) + mu);
    },

    mean: function mean(mu, sigma) {
      return Math.exp(mu + sigma * sigma / 2);
    },

    median: function median(mu/*, sigma*/) {
      return Math.exp(mu);
    },

    mode: function mode(mu, sigma) {
      return Math.exp(mu - sigma * sigma);
    },

    sample: function sample(mu, sigma) {
      return Math.exp(jStat.randn() * sigma + mu);
    },

    variance: function variance(mu, sigma) {
      return (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
    }
  });



  // extend noncentralt function with static methods
  jStat.extend(jStat.noncentralt, {
    pdf: function pdf(x, dof, ncp) {
      var tol = 1e-14;
      if (Math.abs(ncp) < tol)  // ncp approx 0; use student-t
        return jStat.studentt.pdf(x, dof)

      if (Math.abs(x) < tol) {  // different formula for x == 0
        return Math.exp(jStat.gammaln((dof + 1) / 2) - ncp * ncp / 2 -
                        0.5 * Math.log(Math.PI * dof) - jStat.gammaln(dof / 2));
      }

      // formula for x != 0
      return dof / x *
          (jStat.noncentralt.cdf(x * Math.sqrt(1 + 2 / dof), dof+2, ncp) -
           jStat.noncentralt.cdf(x, dof, ncp));
    },

    cdf: function cdf(x, dof, ncp) {
      var tol = 1e-14;
      var min_iterations = 200;

      if (Math.abs(ncp) < tol)  // ncp approx 0; use student-t
        return jStat.studentt.cdf(x, dof);

      // turn negative x into positive and flip result afterwards
      var flip = false;
      if (x < 0) {
        flip = true;
        ncp = -ncp;
      }

      var prob = jStat.normal.cdf(-ncp, 0, 1);
      var value = tol + 1;
      // use value at last two steps to determine convergence
      var lastvalue = value;
      var y = x * x / (x * x + dof);
      var j = 0;
      var p = Math.exp(-ncp * ncp / 2);
      var q = Math.exp(-ncp * ncp / 2 - 0.5 * Math.log(2) -
                       jStat.gammaln(3 / 2)) * ncp;
      while (j < min_iterations || lastvalue > tol || value > tol) {
        lastvalue = value;
        if (j > 0) {
          p *= (ncp * ncp) / (2 * j);
          q *= (ncp * ncp) / (2 * (j + 1 / 2));
        }
        value = p * jStat.beta.cdf(y, j + 0.5, dof / 2) +
            q * jStat.beta.cdf(y, j+1, dof/2);
        prob += 0.5 * value;
        j++;
      }

      return flip ? (1 - prob) : prob;
    }
  });


  // extend normal function with static methods
  jStat.extend(jStat.normal, {
    pdf: function pdf(x, mean, std) {
      return Math.exp(-0.5 * Math.log(2 * Math.PI) -
                      Math.log(std) - Math.pow(x - mean, 2) / (2 * std * std));
    },

    cdf: function cdf(x, mean, std) {
      return 0.5 * (1 + jStat.erf((x - mean) / Math.sqrt(2 * std * std)));
    },

    inv: function(p, mean, std) {
      return -1.41421356237309505 * std * jStat.erfcinv(2 * p) + mean;
    },

    mean : function(mean/*, std*/) {
      return mean;
    },

    median: function median(mean/*, std*/) {
      return mean;
    },

    mode: function (mean/*, std*/) {
      return mean;
    },

    sample: function sample(mean, std) {
      return jStat.randn() * std + mean;
    },

    variance : function(mean, std) {
      return std * std;
    }
  });



  // extend pareto function with static methods
  jStat.extend(jStat.pareto, {
    pdf: function pdf(x, scale, shape) {
      if (x < scale)
        return 0;
      return (shape * Math.pow(scale, shape)) / Math.pow(x, shape + 1);
    },

    cdf: function cdf(x, scale, shape) {
      if (x < scale)
        return 0;
      return 1 - Math.pow(scale / x, shape);
    },

    inv: function inv(p, scale, shape) {
      return scale / Math.pow(1 - p, 1 / shape);
    },

    mean: function mean(scale, shape) {
      if (shape <= 1)
        return undefined;
      return (shape * Math.pow(scale, shape)) / (shape - 1);
    },

    median: function median(scale, shape) {
      return scale * (shape * Math.SQRT2);
    },

    mode: function mode(scale/*, shape*/) {
      return scale;
    },

    variance : function(scale, shape) {
      if (shape <= 2)
        return undefined;
      return (scale*scale * shape) / (Math.pow(shape - 1, 2) * (shape - 2));
    }
  });



  // extend studentt function with static methods
  jStat.extend(jStat.studentt, {
    pdf: function pdf(x, dof) {
      dof = dof > 1e100 ? 1e100 : dof;
      return (1/(Math.sqrt(dof) * jStat.betafn(0.5, dof/2))) *
          Math.pow(1 + ((x * x) / dof), -((dof + 1) / 2));
    },

    cdf: function cdf(x, dof) {
      var dof2 = dof / 2;
      return jStat.ibeta((x + Math.sqrt(x * x + dof)) /
                         (2 * Math.sqrt(x * x + dof)), dof2, dof2);
    },

    inv: function(p, dof) {
      var x = jStat.ibetainv(2 * Math.min(p, 1 - p), 0.5 * dof, 0.5);
      x = Math.sqrt(dof * (1 - x) / x);
      return (p > 0.5) ? x : -x;
    },

    mean: function mean(dof) {
      return (dof > 1) ? 0 : undefined;
    },

    median: function median(/*dof*/) {
      return 0;
    },

    mode: function mode(/*dof*/) {
      return 0;
    },

    sample: function sample(dof) {
      return jStat.randn() * Math.sqrt(dof / (2 * jStat.randg(dof / 2)));
    },

    variance: function variance(dof) {
      return (dof  > 2) ? dof / (dof - 2) : (dof > 1) ? Infinity : undefined;
    }
  });



  // extend weibull function with static methods
  jStat.extend(jStat.weibull, {
    pdf: function pdf(x, scale, shape) {
      if (x < 0 || scale < 0 || shape < 0)
        return 0;
      return (shape / scale) * Math.pow((x / scale), (shape - 1)) *
          Math.exp(-(Math.pow((x / scale), shape)));
    },

    cdf: function cdf(x, scale, shape) {
      return x < 0 ? 0 : 1 - Math.exp(-Math.pow((x / scale), shape));
    },

    inv: function(p, scale, shape) {
      return scale * Math.pow(-Math.log(1 - p), 1 / shape);
    },

    mean : function(scale, shape) {
      return scale * jStat.gammafn(1 + 1 / shape);
    },

    median: function median(scale, shape) {
      return scale * Math.pow(Math.log(2), 1 / shape);
    },

    mode: function mode(scale, shape) {
      if (shape <= 1)
        return 0;
      return scale * Math.pow((shape - 1) / shape, 1 / shape);
    },

    sample: function sample(scale, shape) {
      return scale * Math.pow(-Math.log(jStat._random_fn()), 1 / shape);
    },

    variance: function variance(scale, shape) {
      return scale * scale * jStat.gammafn(1 + 2 / shape) -
          Math.pow(jStat.weibull.mean(scale, shape), 2);
    }
  });



  // extend uniform function with static methods
  jStat.extend(jStat.uniform, {
    pdf: function pdf(x, a, b) {
      return (x < a || x > b) ? 0 : 1 / (b - a);
    },

    cdf: function cdf(x, a, b) {
      if (x < a)
        return 0;
      else if (x < b)
        return (x - a) / (b - a);
      return 1;
    },

    inv: function(p, a, b) {
      return a + (p * (b - a));
    },

    mean: function mean(a, b) {
      return 0.5 * (a + b);
    },

    median: function median(a, b) {
      return jStat.mean(a, b);
    },

    mode: function mode(/*a, b*/) {
      throw new Error('mode is not yet implemented');
    },

    sample: function sample(a, b) {
      return (a / 2 + b / 2) + (b / 2 - a / 2) * (2 * jStat._random_fn() - 1);
    },

    variance: function variance(a, b) {
      return Math.pow(b - a, 2) / 12;
    }
  });


  // Got this from http://www.math.ucla.edu/~tom/distributions/binomial.html
  function betinc(x, a, b, eps) {
    var a0 = 0;
    var b0 = 1;
    var a1 = 1;
    var b1 = 1;
    var m9 = 0;
    var a2 = 0;
    var c9;

    while (Math.abs((a1 - a2) / a1) > eps) {
      a2 = a1;
      c9 = -(a + m9) * (a + b + m9) * x / (a + 2 * m9) / (a + 2 * m9 + 1);
      a0 = a1 + c9 * a0;
      b0 = b1 + c9 * b0;
      m9 = m9 + 1;
      c9 = m9 * (b - m9) * x / (a + 2 * m9 - 1) / (a + 2 * m9);
      a1 = a0 + c9 * a1;
      b1 = b0 + c9 * b1;
      a0 = a0 / b1;
      b0 = b0 / b1;
      a1 = a1 / b1;
      b1 = 1;
    }

    return a1 / a;
  }


  // extend uniform function with static methods
  jStat.extend(jStat.binomial, {
    pdf: function pdf(k, n, p) {
      return (p === 0 || p === 1) ?
        ((n * p) === k ? 1 : 0) :
        jStat.combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    },

    cdf: function cdf(x, n, p) {
      var betacdf;
      var eps = 1e-10;

      if (x < 0)
        return 0;
      if (x >= n)
        return 1;
      if (p < 0 || p > 1 || n <= 0)
        return NaN;

      x = Math.floor(x);
      var z = p;
      var a = x + 1;
      var b = n - x;
      var s = a + b;
      var bt = Math.exp(jStat.gammaln(s) - jStat.gammaln(b) -
                        jStat.gammaln(a) + a * Math.log(z) + b * Math.log(1 - z));

      if (z < (a + 1) / (s + 2))
        betacdf = bt * betinc(z, a, b, eps);
      else
        betacdf = 1 - bt * betinc(1 - z, b, a, eps);

      return Math.round((1 - betacdf) * (1 / eps)) / (1 / eps);
    }
  });



  // extend uniform function with static methods
  jStat.extend(jStat.negbin, {
    pdf: function pdf(k, r, p) {
      if (k !== k >>> 0)
        return false;
      if (k < 0)
        return 0;
      return jStat.combination(k + r - 1, r - 1) *
          Math.pow(1 - p, k) * Math.pow(p, r);
    },

    cdf: function cdf(x, r, p) {
      var sum = 0,
      k = 0;
      if (x < 0) return 0;
      for (; k <= x; k++) {
        sum += jStat.negbin.pdf(k, r, p);
      }
      return sum;
    }
  });



  // extend uniform function with static methods
  jStat.extend(jStat.hypgeom, {
    pdf: function pdf(k, N, m, n) {
      // Hypergeometric PDF.

      // A simplification of the CDF algorithm below.

      // k = number of successes drawn
      // N = population size
      // m = number of successes in population
      // n = number of items drawn from population

      if(k !== k | 0) {
        return false;
      } else if(k < 0 || k < m - (N - n)) {
        // It's impossible to have this few successes drawn.
        return 0;
      } else if(k > n || k > m) {
        // It's impossible to have this many successes drawn.
        return 0;
      } else if (m * 2 > N) {
        // More than half the population is successes.

        if(n * 2 > N) {
          // More than half the population is sampled.

          return jStat.hypgeom.pdf(N - m - n + k, N, N - m, N - n)
        } else {
          // Half or less of the population is sampled.

          return jStat.hypgeom.pdf(n - k, N, N - m, n);
        }

      } else if(n * 2 > N) {
        // Half or less is successes.

        return jStat.hypgeom.pdf(m - k, N, m, N - n);

      } else if(m < n) {
        // We want to have the number of things sampled to be less than the
        // successes available. So swap the definitions of successful and sampled.
        return jStat.hypgeom.pdf(k, N, n, m);
      } else {
        // If we get here, half or less of the population was sampled, half or
        // less of it was successes, and we had fewer sampled things than
        // successes. Now we can do this complicated iterative algorithm in an
        // efficient way.

        // The basic premise of the algorithm is that we partially normalize our
        // intermediate product to keep it in a numerically good region, and then
        // finish the normalization at the end.

        // This variable holds the scaled probability of the current number of
        // successes.
        var scaledPDF = 1;

        // This keeps track of how much we have normalized.
        var samplesDone = 0;

        for(var i = 0; i < k; i++) {
          // For every possible number of successes up to that observed...

          while(scaledPDF > 1 && samplesDone < n) {
            // Intermediate result is growing too big. Apply some of the
            // normalization to shrink everything.

            scaledPDF *= 1 - (m / (N - samplesDone));

            // Say we've normalized by this sample already.
            samplesDone++;
          }

          // Work out the partially-normalized hypergeometric PDF for the next
          // number of successes
          scaledPDF *= (n - i) * (m - i) / ((i + 1) * (N - m - n + i + 1));
        }

        for(; samplesDone < n; samplesDone++) {
          // Apply all the rest of the normalization
          scaledPDF *= 1 - (m / (N - samplesDone));
        }

        // Bound answer sanely before returning.
        return Math.min(1, Math.max(0, scaledPDF));
      }
    },

    cdf: function cdf(x, N, m, n) {
      // Hypergeometric CDF.

      // This algorithm is due to Prof. Thomas S. Ferguson, <tom@math.ucla.edu>,
      // and comes from his hypergeometric test calculator at
      // <http://www.math.ucla.edu/~tom/distributions/Hypergeometric.html>.

      // x = number of successes drawn
      // N = population size
      // m = number of successes in population
      // n = number of items drawn from population

      if(x < 0 || x < m - (N - n)) {
        // It's impossible to have this few successes drawn or fewer.
        return 0;
      } else if(x >= n || x >= m) {
        // We will always have this many successes or fewer.
        return 1;
      } else if (m * 2 > N) {
        // More than half the population is successes.

        if(n * 2 > N) {
          // More than half the population is sampled.

          return jStat.hypgeom.cdf(N - m - n + x, N, N - m, N - n)
        } else {
          // Half or less of the population is sampled.

          return 1 - jStat.hypgeom.cdf(n - x - 1, N, N - m, n);
        }

      } else if(n * 2 > N) {
        // Half or less is successes.

        return 1 - jStat.hypgeom.cdf(m - x - 1, N, m, N - n);

      } else if(m < n) {
        // We want to have the number of things sampled to be less than the
        // successes available. So swap the definitions of successful and sampled.
        return jStat.hypgeom.cdf(x, N, n, m);
      } else {
        // If we get here, half or less of the population was sampled, half or
        // less of it was successes, and we had fewer sampled things than
        // successes. Now we can do this complicated iterative algorithm in an
        // efficient way.

        // The basic premise of the algorithm is that we partially normalize our
        // intermediate sum to keep it in a numerically good region, and then
        // finish the normalization at the end.

        // Holds the intermediate, scaled total CDF.
        var scaledCDF = 1;

        // This variable holds the scaled probability of the current number of
        // successes.
        var scaledPDF = 1;

        // This keeps track of how much we have normalized.
        var samplesDone = 0;

        for(var i = 0; i < x; i++) {
          // For every possible number of successes up to that observed...

          while(scaledCDF > 1 && samplesDone < n) {
            // Intermediate result is growing too big. Apply some of the
            // normalization to shrink everything.

            var factor = 1 - (m / (N - samplesDone));

            scaledPDF *= factor;
            scaledCDF *= factor;

            // Say we've normalized by this sample already.
            samplesDone++;
          }

          // Work out the partially-normalized hypergeometric PDF for the next
          // number of successes
          scaledPDF *= (n - i) * (m - i) / ((i + 1) * (N - m - n + i + 1));

          // Add to the CDF answer.
          scaledCDF += scaledPDF;
        }

        for(; samplesDone < n; samplesDone++) {
          // Apply all the rest of the normalization
          scaledCDF *= 1 - (m / (N - samplesDone));
        }

        // Bound answer sanely before returning.
        return Math.min(1, Math.max(0, scaledCDF));
      }
    }
  });



  // extend uniform function with static methods
  jStat.extend(jStat.poisson, {
    pdf: function pdf(k, l) {
      if (l < 0 || (k % 1) !== 0 || k < 0) {
        return 0;
      }

      return Math.pow(l, k) * Math.exp(-l) / jStat.factorial(k);
    },

    cdf: function cdf(x, l) {
      var sumarr = [],
      k = 0;
      if (x < 0) return 0;
      for (; k <= x; k++) {
        sumarr.push(jStat.poisson.pdf(k, l));
      }
      return jStat.sum(sumarr);
    },

    mean : function(l) {
      return l;
    },

    variance : function(l) {
      return l;
    },

    sampleSmall: function sampleSmall(l) {
      var p = 1, k = 0, L = Math.exp(-l);
      do {
        k++;
        p *= jStat._random_fn();
      } while (p > L);
      return k - 1;
    },

    sampleLarge: function sampleLarge(l) {
      var lam = l;
      var k;
      var U, V, slam, loglam, a, b, invalpha, vr, us;

      slam = Math.sqrt(lam);
      loglam = Math.log(lam);
      b = 0.931 + 2.53 * slam;
      a = -0.059 + 0.02483 * b;
      invalpha = 1.1239 + 1.1328 / (b - 3.4);
      vr = 0.9277 - 3.6224 / (b - 2);

      while (1) {
        U = Math.random() - 0.5;
        V = Math.random();
        us = 0.5 - Math.abs(U);
        k = Math.floor((2 * a / us + b) * U + lam + 0.43);
        if ((us >= 0.07) && (V <= vr)) {
            return k;
        }
        if ((k < 0) || ((us < 0.013) && (V > us))) {
            continue;
        }
        /* log(V) == log(0.0) ok here */
        /* if U==0.0 so that us==0.0, log is ok since always returns */
        if ((Math.log(V) + Math.log(invalpha) - Math.log(a / (us * us) + b)) <= (-lam + k * loglam - jStat.loggam(k + 1))) {
            return k;
        }
      }
    },

    sample: function sample(l) {
      if (l < 10)
        return this.sampleSmall(l);
      else
        return this.sampleLarge(l);
    }
  });

  // extend triangular function with static methods
  jStat.extend(jStat.triangular, {
    pdf: function pdf(x, a, b, c) {
      if (b <= a || c < a || c > b) {
        return NaN;
      } else {
        if (x < a || x > b) {
          return 0;
        } else if (x < c) {
            return (2 * (x - a)) / ((b - a) * (c - a));
        } else if (x === c) {
            return (2 / (b - a));
        } else { // x > c
            return (2 * (b - x)) / ((b - a) * (b - c));
        }
      }
    },

    cdf: function cdf(x, a, b, c) {
      if (b <= a || c < a || c > b)
        return NaN;
      if (x <= a)
        return 0;
      else if (x >= b)
        return 1;
      if (x <= c)
        return Math.pow(x - a, 2) / ((b - a) * (c - a));
      else // x > c
        return 1 - Math.pow(b - x, 2) / ((b - a) * (b - c));
    },

    inv: function inv(p, a, b, c) {
      if (b <= a || c < a || c > b) {
        return NaN;
      } else {
        if (p <= ((c - a) / (b - a))) {
          return a + (b - a) * Math.sqrt(p * ((c - a) / (b - a)));
        } else { // p > ((c - a) / (b - a))
          return a + (b - a) * (1 - Math.sqrt((1 - p) * (1 - ((c - a) / (b - a)))));
        }
      }
    },

    mean: function mean(a, b, c) {
      return (a + b + c) / 3;
    },

    median: function median(a, b, c) {
      if (c <= (a + b) / 2) {
        return b - Math.sqrt((b - a) * (b - c)) / Math.sqrt(2);
      } else if (c > (a + b) / 2) {
        return a + Math.sqrt((b - a) * (c - a)) / Math.sqrt(2);
      }
    },

    mode: function mode(a, b, c) {
      return c;
    },

    sample: function sample(a, b, c) {
      var u = jStat._random_fn();
      if (u < ((c - a) / (b - a)))
        return a + Math.sqrt(u * (b - a) * (c - a))
      return b - Math.sqrt((1 - u) * (b - a) * (b - c));
    },

    variance: function variance(a, b, c) {
      return (a * a + b * b + c * c - a * b - a * c - b * c) / 18;
    }
  });


  // extend arcsine function with static methods
  jStat.extend(jStat.arcsine, {
    pdf: function pdf(x, a, b) {
      if (b <= a) return NaN;

      return (x <= a || x >= b) ? 0 :
        (2 / Math.PI) *
          Math.pow(Math.pow(b - a, 2) -
                    Math.pow(2 * x - a - b, 2), -0.5);
    },

    cdf: function cdf(x, a, b) {
      if (x < a)
        return 0;
      else if (x < b)
        return (2 / Math.PI) * Math.asin(Math.sqrt((x - a)/(b - a)));
      return 1;
    },

    inv: function(p, a, b) {
      return a + (0.5 - 0.5 * Math.cos(Math.PI * p)) * (b - a);
    },

    mean: function mean(a, b) {
      if (b <= a) return NaN;
      return (a + b) / 2;
    },

    median: function median(a, b) {
      if (b <= a) return NaN;
      return (a + b) / 2;
    },

    mode: function mode(/*a, b*/) {
      throw new Error('mode is not yet implemented');
    },

    sample: function sample(a, b) {
      return ((a + b) / 2) + ((b - a) / 2) *
        Math.sin(2 * Math.PI * jStat.uniform.sample(0, 1));
    },

    variance: function variance(a, b) {
      if (b <= a) return NaN;
      return Math.pow(b - a, 2) / 8;
    }
  });


  function laplaceSign(x) { return x / Math.abs(x); }

  jStat.extend(jStat.laplace, {
    pdf: function pdf(x, mu, b) {
      return (b <= 0) ? 0 : (Math.exp(-Math.abs(x - mu) / b)) / (2 * b);
    },

    cdf: function cdf(x, mu, b) {
      if (b <= 0) { return 0; }

      if(x < mu) {
        return 0.5 * Math.exp((x - mu) / b);
      } else {
        return 1 - 0.5 * Math.exp(- (x - mu) / b);
      }
    },

    mean: function(mu/*, b*/) {
      return mu;
    },

    median: function(mu/*, b*/) {
      return mu;
    },

    mode: function(mu/*, b*/) {
      return mu;
    },

    variance: function(mu, b) {
      return 2 * b * b;
    },

    sample: function sample(mu, b) {
      var u = jStat._random_fn() - 0.5;

      return mu - (b * laplaceSign(u) * Math.log(1 - (2 * Math.abs(u))));
    }
  });

  function tukeyWprob(w, rr, cc) {
    var nleg = 12;
    var ihalf = 6;

    var C1 = -30;
    var C2 = -50;
    var C3 = 60;
    var bb   = 8;
    var wlar = 3;
    var wincr1 = 2;
    var wincr2 = 3;
    var xleg = [
      0.981560634246719250690549090149,
      0.904117256370474856678465866119,
      0.769902674194304687036893833213,
      0.587317954286617447296702418941,
      0.367831498998180193752691536644,
      0.125233408511468915472441369464
    ];
    var aleg = [
      0.047175336386511827194615961485,
      0.106939325995318430960254718194,
      0.160078328543346226334652529543,
      0.203167426723065921749064455810,
      0.233492536538354808760849898925,
      0.249147045813402785000562436043
    ];

    var qsqz = w * 0.5;

    // if w >= 16 then the integral lower bound (occurs for c=20)
    // is 0.99999999999995 so return a value of 1.

    if (qsqz >= bb)
      return 1.0;

    // find (f(w/2) - 1) ^ cc
    // (first term in integral of hartley's form).

    var pr_w = 2 * jStat.normal.cdf(qsqz, 0, 1, 1, 0) - 1; // erf(qsqz / M_SQRT2)
    // if pr_w ^ cc < 2e-22 then set pr_w = 0
    if (pr_w >= Math.exp(C2 / cc))
      pr_w = Math.pow(pr_w, cc);
    else
      pr_w = 0.0;

    // if w is large then the second component of the
    // integral is small, so fewer intervals are needed.

    var wincr;
    if (w > wlar)
      wincr = wincr1;
    else
      wincr = wincr2;

    // find the integral of second term of hartley's form
    // for the integral of the range for equal-length
    // intervals using legendre quadrature.  limits of
    // integration are from (w/2, 8).  two or three
    // equal-length intervals are used.

    // blb and bub are lower and upper limits of integration.

    var blb = qsqz;
    var binc = (bb - qsqz) / wincr;
    var bub = blb + binc;
    var einsum = 0.0;

    // integrate over each interval

    var cc1 = cc - 1.0;
    for (var wi = 1; wi <= wincr; wi++) {
      var elsum = 0.0;
      var a = 0.5 * (bub + blb);

      // legendre quadrature with order = nleg

      var b = 0.5 * (bub - blb);

      for (var jj = 1; jj <= nleg; jj++) {
        var j, xx;
        if (ihalf < jj) {
          j = (nleg - jj) + 1;
          xx = xleg[j-1];
        } else {
          j = jj;
          xx = -xleg[j-1];
        }
        var c = b * xx;
        var ac = a + c;

        // if exp(-qexpo/2) < 9e-14,
        // then doesn't contribute to integral

        var qexpo = ac * ac;
        if (qexpo > C3)
          break;

        var pplus = 2 * jStat.normal.cdf(ac, 0, 1, 1, 0);
        var pminus= 2 * jStat.normal.cdf(ac, w, 1, 1, 0);

        // if rinsum ^ (cc-1) < 9e-14,
        // then doesn't contribute to integral

        var rinsum = (pplus * 0.5) - (pminus * 0.5);
        if (rinsum >= Math.exp(C1 / cc1)) {
          rinsum = (aleg[j-1] * Math.exp(-(0.5 * qexpo))) * Math.pow(rinsum, cc1);
          elsum += rinsum;
        }
      }
      elsum *= (((2.0 * b) * cc) / Math.sqrt(2 * Math.PI));
      einsum += elsum;
      blb = bub;
      bub += binc;
    }

    // if pr_w ^ rr < 9e-14, then return 0
    pr_w += einsum;
    if (pr_w <= Math.exp(C1 / rr))
      return 0;

    pr_w = Math.pow(pr_w, rr);
    if (pr_w >= 1) // 1 was iMax was eps
      return 1;
    return pr_w;
  }

  function tukeyQinv(p, c, v) {
    var p0 = 0.322232421088;
    var q0 = 0.993484626060e-01;
    var p1 = -1.0;
    var q1 = 0.588581570495;
    var p2 = -0.342242088547;
    var q2 = 0.531103462366;
    var p3 = -0.204231210125;
    var q3 = 0.103537752850;
    var p4 = -0.453642210148e-04;
    var q4 = 0.38560700634e-02;
    var c1 = 0.8832;
    var c2 = 0.2368;
    var c3 = 1.214;
    var c4 = 1.208;
    var c5 = 1.4142;
    var vmax = 120.0;

    var ps = 0.5 - 0.5 * p;
    var yi = Math.sqrt(Math.log(1.0 / (ps * ps)));
    var t = yi + (((( yi * p4 + p3) * yi + p2) * yi + p1) * yi + p0)
       / (((( yi * q4 + q3) * yi + q2) * yi + q1) * yi + q0);
    if (v < vmax) t += (t * t * t + t) / v / 4.0;
    var q = c1 - c2 * t;
    if (v < vmax) q += -c3 / v + c4 * t / v;
    return t * (q * Math.log(c - 1.0) + c5);
  }

  jStat.extend(jStat.tukey, {
    cdf: function cdf(q, nmeans, df) {
      // Identical implementation as the R ptukey() function as of commit 68947
      var rr = 1;
      var cc = nmeans;

      var nlegq = 16;
      var ihalfq = 8;

      var eps1 = -30.0;
      var eps2 = 1.0e-14;
      var dhaf  = 100.0;
      var dquar = 800.0;
      var deigh = 5000.0;
      var dlarg = 25000.0;
      var ulen1 = 1.0;
      var ulen2 = 0.5;
      var ulen3 = 0.25;
      var ulen4 = 0.125;
      var xlegq = [
        0.989400934991649932596154173450,
        0.944575023073232576077988415535,
        0.865631202387831743880467897712,
        0.755404408355003033895101194847,
        0.617876244402643748446671764049,
        0.458016777657227386342419442984,
        0.281603550779258913230460501460,
        0.950125098376374401853193354250e-1
      ];
      var alegq = [
        0.271524594117540948517805724560e-1,
        0.622535239386478928628438369944e-1,
        0.951585116824927848099251076022e-1,
        0.124628971255533872052476282192,
        0.149595988816576732081501730547,
        0.169156519395002538189312079030,
        0.182603415044923588866763667969,
        0.189450610455068496285396723208
      ];

      if (q <= 0)
        return 0;

      // df must be > 1
      // there must be at least two values

      if (df < 2 || rr < 1 || cc < 2) return NaN;

      if (!Number.isFinite(q))
        return 1;

      if (df > dlarg)
        return tukeyWprob(q, rr, cc);

      // calculate leading constant

      var f2 = df * 0.5;
      var f2lf = ((f2 * Math.log(df)) - (df * Math.log(2))) - jStat.gammaln(f2);
      var f21 = f2 - 1.0;

      // integral is divided into unit, half-unit, quarter-unit, or
      // eighth-unit length intervals depending on the value of the
      // degrees of freedom.

      var ff4 = df * 0.25;
      var ulen;
      if      (df <= dhaf)  ulen = ulen1;
      else if (df <= dquar) ulen = ulen2;
      else if (df <= deigh) ulen = ulen3;
      else                  ulen = ulen4;

      f2lf += Math.log(ulen);

      // integrate over each subinterval

      var ans = 0.0;

      for (var i = 1; i <= 50; i++) {
        var otsum = 0.0;

        // legendre quadrature with order = nlegq
        // nodes (stored in xlegq) are symmetric around zero.

        var twa1 = (2 * i - 1) * ulen;

        for (var jj = 1; jj <= nlegq; jj++) {
          var j, t1;
          if (ihalfq < jj) {
            j = jj - ihalfq - 1;
            t1 = (f2lf + (f21 * Math.log(twa1 + (xlegq[j] * ulen))))
                - (((xlegq[j] * ulen) + twa1) * ff4);
          } else {
            j = jj - 1;
            t1 = (f2lf + (f21 * Math.log(twa1 - (xlegq[j] * ulen))))
                + (((xlegq[j] * ulen) - twa1) * ff4);
          }

          // if exp(t1) < 9e-14, then doesn't contribute to integral
          var qsqz;
          if (t1 >= eps1) {
            if (ihalfq < jj) {
              qsqz = q * Math.sqrt(((xlegq[j] * ulen) + twa1) * 0.5);
            } else {
              qsqz = q * Math.sqrt(((-(xlegq[j] * ulen)) + twa1) * 0.5);
            }

            // call wprob to find integral of range portion

            var wprb = tukeyWprob(qsqz, rr, cc);
            var rotsum = (wprb * alegq[j]) * Math.exp(t1);
            otsum += rotsum;
          }
          // end legendre integral for interval i
          // L200:
        }

        // if integral for interval i < 1e-14, then stop.
        // However, in order to avoid small area under left tail,
        // at least  1 / ulen  intervals are calculated.
        if (i * ulen >= 1.0 && otsum <= eps2)
          break;

        // end of interval i
        // L330:

        ans += otsum;
      }

      if (otsum > eps2) { // not converged
        throw new Error('tukey.cdf failed to converge');
      }
      if (ans > 1)
        ans = 1;
      return ans;
    },

    inv: function(p, nmeans, df) {
      // Identical implementation as the R qtukey() function as of commit 68947
      var rr = 1;
      var cc = nmeans;

      var eps = 0.0001;
      var maxiter = 50;

      // df must be > 1 ; there must be at least two values
      if (df < 2 || rr < 1 || cc < 2) return NaN;

      if (p < 0 || p > 1) return NaN;
      if (p === 0) return 0;
      if (p === 1) return Infinity;

      // Initial value

      var x0 = tukeyQinv(p, cc, df);

      // Find prob(value < x0)

      var valx0 = jStat.tukey.cdf(x0, nmeans, df) - p;

      // Find the second iterate and prob(value < x1).
      // If the first iterate has probability value
      // exceeding p then second iterate is 1 less than
      // first iterate; otherwise it is 1 greater.

      var x1;
      if (valx0 > 0.0)
        x1 = Math.max(0.0, x0 - 1.0);
      else
        x1 = x0 + 1.0;
      var valx1 = jStat.tukey.cdf(x1, nmeans, df) - p;

      // Find new iterate

      var ans;
      for(var iter = 1; iter < maxiter; iter++) {
        ans = x1 - ((valx1 * (x1 - x0)) / (valx1 - valx0));
        valx0 = valx1;

        // New iterate must be >= 0

        x0 = x1;
        if (ans < 0.0) {
          ans = 0.0;
          valx1 = -p;
        }
        // Find prob(value < new iterate)

        valx1 = jStat.tukey.cdf(ans, nmeans, df) - p;
        x1 = ans;

        // If the difference between two successive
        // iterates is less than eps, stop

        var xabs = Math.abs(x1 - x0);
        if (xabs < eps)
          return ans;
      }

      throw new Error('tukey.inv failed to converge');
    }
  });

  }(jStat, Math));
  /* Provides functions for the solution of linear system of equations, integration, extrapolation,
   * interpolation, eigenvalue problems, differential equations and PCA analysis. */

  (function(jStat, Math) {

  var push = Array.prototype.push;
  var isArray = jStat.utils.isArray;

  function isUsable(arg) {
    return isArray(arg) || arg instanceof jStat;
  }

  jStat.extend({

    // add a vector/matrix to a vector/matrix or scalar
    add: function add(arr, arg) {
      // check if arg is a vector or scalar
      if (isUsable(arg)) {
        if (!isUsable(arg[0])) arg = [ arg ];
        return jStat.map(arr, function(value, row, col) {
          return value + arg[row][col];
        });
      }
      return jStat.map(arr, function(value) { return value + arg; });
    },

    // subtract a vector or scalar from the vector
    subtract: function subtract(arr, arg) {
      // check if arg is a vector or scalar
      if (isUsable(arg)) {
        if (!isUsable(arg[0])) arg = [ arg ];
        return jStat.map(arr, function(value, row, col) {
          return value - arg[row][col] || 0;
        });
      }
      return jStat.map(arr, function(value) { return value - arg; });
    },

    // matrix division
    divide: function divide(arr, arg) {
      if (isUsable(arg)) {
        if (!isUsable(arg[0])) arg = [ arg ];
        return jStat.multiply(arr, jStat.inv(arg));
      }
      return jStat.map(arr, function(value) { return value / arg; });
    },

    // matrix multiplication
    multiply: function multiply(arr, arg) {
      var row, col, nrescols, sum, nrow, ncol, res, rescols;
      // eg: arr = 2 arg = 3 -> 6 for res[0][0] statement closure
      if (arr.length === undefined && arg.length === undefined) {
        return arr * arg;
      }
      nrow = arr.length,
      ncol = arr[0].length,
      res = jStat.zeros(nrow, nrescols = (isUsable(arg)) ? arg[0].length : ncol),
      rescols = 0;
      if (isUsable(arg)) {
        for (; rescols < nrescols; rescols++) {
          for (row = 0; row < nrow; row++) {
            sum = 0;
            for (col = 0; col < ncol; col++)
            sum += arr[row][col] * arg[col][rescols];
            res[row][rescols] = sum;
          }
        }
        return (nrow === 1 && rescols === 1) ? res[0][0] : res;
      }
      return jStat.map(arr, function(value) { return value * arg; });
    },

    // outer([1,2,3],[4,5,6])
    // ===
    // [[1],[2],[3]] times [[4,5,6]]
    // ->
    // [[4,5,6],[8,10,12],[12,15,18]]
    outer:function outer(A, B) {
      return jStat.multiply(A.map(function(t){ return [t] }), [B]);
    },


    // Returns the dot product of two matricies
    dot: function dot(arr, arg) {
      if (!isUsable(arr[0])) arr = [ arr ];
      if (!isUsable(arg[0])) arg = [ arg ];
      // convert column to row vector
      var left = (arr[0].length === 1 && arr.length !== 1) ? jStat.transpose(arr) : arr,
      right = (arg[0].length === 1 && arg.length !== 1) ? jStat.transpose(arg) : arg,
      res = [],
      row = 0,
      nrow = left.length,
      ncol = left[0].length,
      sum, col;
      for (; row < nrow; row++) {
        res[row] = [];
        sum = 0;
        for (col = 0; col < ncol; col++)
        sum += left[row][col] * right[row][col];
        res[row] = sum;
      }
      return (res.length === 1) ? res[0] : res;
    },

    // raise every element by a scalar
    pow: function pow(arr, arg) {
      return jStat.map(arr, function(value) { return Math.pow(value, arg); });
    },

    // exponentiate every element
    exp: function exp(arr) {
      return jStat.map(arr, function(value) { return Math.exp(value); });
    },

    // generate the natural log of every element
    log: function exp(arr) {
      return jStat.map(arr, function(value) { return Math.log(value); });
    },

    // generate the absolute values of the vector
    abs: function abs(arr) {
      return jStat.map(arr, function(value) { return Math.abs(value); });
    },

    // computes the p-norm of the vector
    // In the case that a matrix is passed, uses the first row as the vector
    norm: function norm(arr, p) {
      var nnorm = 0,
      i = 0;
      // check the p-value of the norm, and set for most common case
      if (isNaN(p)) p = 2;
      // check if multi-dimensional array, and make vector correction
      if (isUsable(arr[0])) arr = arr[0];
      // vector norm
      for (; i < arr.length; i++) {
        nnorm += Math.pow(Math.abs(arr[i]), p);
      }
      return Math.pow(nnorm, 1 / p);
    },

    // computes the angle between two vectors in rads
    // In case a matrix is passed, this uses the first row as the vector
    angle: function angle(arr, arg) {
      return Math.acos(jStat.dot(arr, arg) / (jStat.norm(arr) * jStat.norm(arg)));
    },

    // augment one matrix by another
    // Note: this function returns a matrix, not a jStat object
    aug: function aug(a, b) {
      var newarr = [];
      var i;
      for (i = 0; i < a.length; i++) {
        newarr.push(a[i].slice());
      }
      for (i = 0; i < newarr.length; i++) {
        push.apply(newarr[i], b[i]);
      }
      return newarr;
    },

    // The inv() function calculates the inverse of a matrix
    // Create the inverse by augmenting the matrix by the identity matrix of the
    // appropriate size, and then use G-J elimination on the augmented matrix.
    inv: function inv(a) {
      var rows = a.length;
      var cols = a[0].length;
      var b = jStat.identity(rows, cols);
      var c = jStat.gauss_jordan(a, b);
      var result = [];
      var i = 0;
      var j;

      //We need to copy the inverse portion to a new matrix to rid G-J artifacts
      for (; i < rows; i++) {
        result[i] = [];
        for (j = cols; j < c[0].length; j++)
          result[i][j - cols] = c[i][j];
      }
      return result;
    },

    // calculate the determinant of a matrix
    det: function det(a) {
      var alen = a.length,
      alend = alen * 2,
      vals = new Array(alend),
      rowshift = alen - 1,
      colshift = alend - 1,
      mrow = rowshift - alen + 1,
      mcol = colshift,
      i = 0,
      result = 0,
      j;
      // check for special 2x2 case
      if (alen === 2) {
        return a[0][0] * a[1][1] - a[0][1] * a[1][0];
      }
      for (; i < alend; i++) {
        vals[i] = 1;
      }
      for (i = 0; i < alen; i++) {
        for (j = 0; j < alen; j++) {
          vals[(mrow < 0) ? mrow + alen : mrow ] *= a[i][j];
          vals[(mcol < alen) ? mcol + alen : mcol ] *= a[i][j];
          mrow++;
          mcol--;
        }
        mrow = --rowshift - alen + 1;
        mcol = --colshift;
      }
      for (i = 0; i < alen; i++) {
        result += vals[i];
      }
      for (; i < alend; i++) {
        result -= vals[i];
      }
      return result;
    },

    gauss_elimination: function gauss_elimination(a, b) {
      var i = 0,
      j = 0,
      n = a.length,
      m = a[0].length,
      factor = 1,
      sum = 0,
      x = [],
      maug, pivot, temp, k;
      a = jStat.aug(a, b);
      maug = a[0].length;
      for(i = 0; i < n; i++) {
        pivot = a[i][i];
        j = i;
        for (k = i + 1; k < m; k++) {
          if (pivot < Math.abs(a[k][i])) {
            pivot = a[k][i];
            j = k;
          }
        }
        if (j != i) {
          for(k = 0; k < maug; k++) {
            temp = a[i][k];
            a[i][k] = a[j][k];
            a[j][k] = temp;
          }
        }
        for (j = i + 1; j < n; j++) {
          factor = a[j][i] / a[i][i];
          for(k = i; k < maug; k++) {
            a[j][k] = a[j][k] - factor * a[i][k];
          }
        }
      }
      for (i = n - 1; i >= 0; i--) {
        sum = 0;
        for (j = i + 1; j<= n - 1; j++) {
          sum = sum + x[j] * a[i][j];
        }
        x[i] =(a[i][maug - 1] - sum) / a[i][i];
      }
      return x;
    },

    gauss_jordan: function gauss_jordan(a, b) {
      var m = jStat.aug(a, b);
      var h = m.length;
      var w = m[0].length;
      var c = 0;
      var x, y, y2;
      // find max pivot
      for (y = 0; y < h; y++) {
        var maxrow = y;
        for (y2 = y+1; y2 < h; y2++) {
          if (Math.abs(m[y2][y]) > Math.abs(m[maxrow][y]))
            maxrow = y2;
        }
        var tmp = m[y];
        m[y] = m[maxrow];
        m[maxrow] = tmp;
        for (y2 = y+1; y2 < h; y2++) {
          c = m[y2][y] / m[y][y];
          for (x = y; x < w; x++) {
            m[y2][x] -= m[y][x] * c;
          }
        }
      }
      // backsubstitute
      for (y = h-1; y >= 0; y--) {
        c = m[y][y];
        for (y2 = 0; y2 < y; y2++) {
          for (x = w-1; x > y-1; x--) {
            m[y2][x] -= m[y][x] * m[y2][y] / c;
          }
        }
        m[y][y] /= c;
        for (x = h; x < w; x++) {
          m[y][x] /= c;
        }
      }
      return m;
    },

    // solve equation
    // Ax=b
    // A is upper triangular matrix
    // A=[[1,2,3],[0,4,5],[0,6,7]]
    // b=[1,2,3]
    // triaUpSolve(A,b) // -> [2.666,0.1666,1.666]
    // if you use matrix style
    // A=[[1,2,3],[0,4,5],[0,6,7]]
    // b=[[1],[2],[3]]
    // will return [[2.666],[0.1666],[1.666]]
    triaUpSolve: function triaUpSolve(A, b) {
      var size = A[0].length;
      var x = jStat.zeros(1, size)[0];
      var parts;
      var matrix_mode = false;

      if (b[0].length != undefined) {
        b = b.map(function(i){ return i[0] });
        matrix_mode = true;
      }

      jStat.arange(size - 1, -1, -1).forEach(function(i) {
        parts = jStat.arange(i + 1, size).map(function(j) {
          return x[j] * A[i][j];
        });
        x[i] = (b[i] - jStat.sum(parts)) / A[i][i];
      });

      if (matrix_mode)
        return x.map(function(i){ return [i] });
      return x;
    },

    triaLowSolve: function triaLowSolve(A, b) {
      // like to triaUpSolve but A is lower triangular matrix
      var size = A[0].length;
      var x = jStat.zeros(1, size)[0];
      var parts;

      var matrix_mode=false;
      if (b[0].length != undefined) {
        b = b.map(function(i){ return i[0] });
        matrix_mode = true;
      }

      jStat.arange(size).forEach(function(i) {
        parts = jStat.arange(i).map(function(j) {
          return A[i][j] * x[j];
        });
        x[i] = (b[i] - jStat.sum(parts)) / A[i][i];
      });

      if (matrix_mode)
        return x.map(function(i){ return [i] });
      return x;
    },


    // A -> [L,U]
    // A=LU
    // L is lower triangular matrix
    // U is upper triangular matrix
    lu: function lu(A) {
      var size = A.length;
      //var L=jStat.diagonal(jStat.ones(1,size)[0]);
      var L = jStat.identity(size);
      var R = jStat.zeros(A.length, A[0].length);
      var parts;
      jStat.arange(size).forEach(function(t) {
        R[0][t] = A[0][t];
      });
      jStat.arange(1, size).forEach(function(l) {
        jStat.arange(l).forEach(function(i) {
          parts = jStat.arange(i).map(function(jj) {
            return L[l][jj] * R[jj][i];
          });
          L[l][i] = (A[l][i] - jStat.sum(parts)) / R[i][i];
        });
        jStat.arange(l, size).forEach(function(j) {
          parts = jStat.arange(l).map(function(jj) {
            return L[l][jj] * R[jj][j];
          });
          R[l][j] = A[parts.length][j] - jStat.sum(parts);
        });
      });
      return [L, R];
    },

    // A -> T
    // A=TT'
    // T is lower triangular matrix
    cholesky: function cholesky(A) {
      var size = A.length;
      var T = jStat.zeros(A.length, A[0].length);
      var parts;
      jStat.arange(size).forEach(function(i) {
        parts = jStat.arange(i).map(function(t) {
          return Math.pow(T[i][t],2);
        });
        T[i][i] = Math.sqrt(A[i][i] - jStat.sum(parts));
        jStat.arange(i + 1, size).forEach(function(j) {
          parts = jStat.arange(i).map(function(t) {
            return T[i][t] * T[j][t];
          });
          T[j][i] = (A[i][j] - jStat.sum(parts)) / T[i][i];
        });
      });
      return T;
    },


    gauss_jacobi: function gauss_jacobi(a, b, x, r) {
      var i = 0;
      var j = 0;
      var n = a.length;
      var l = [];
      var u = [];
      var d = [];
      var xv, c, h, xk;
      for (; i < n; i++) {
        l[i] = [];
        u[i] = [];
        d[i] = [];
        for (j = 0; j < n; j++) {
          if (i > j) {
            l[i][j] = a[i][j];
            u[i][j] = d[i][j] = 0;
          } else if (i < j) {
            u[i][j] = a[i][j];
            l[i][j] = d[i][j] = 0;
          } else {
            d[i][j] = a[i][j];
            l[i][j] = u[i][j] = 0;
          }
        }
      }
      h = jStat.multiply(jStat.multiply(jStat.inv(d), jStat.add(l, u)), -1);
      c = jStat.multiply(jStat.inv(d), b);
      xv = x;
      xk = jStat.add(jStat.multiply(h, x), c);
      i = 2;
      while (Math.abs(jStat.norm(jStat.subtract(xk,xv))) > r) {
        xv = xk;
        xk = jStat.add(jStat.multiply(h, xv), c);
        i++;
      }
      return xk;
    },

    gauss_seidel: function gauss_seidel(a, b, x, r) {
      var i = 0;
      var n = a.length;
      var l = [];
      var u = [];
      var d = [];
      var j, xv, c, h, xk;
      for (; i < n; i++) {
        l[i] = [];
        u[i] = [];
        d[i] = [];
        for (j = 0; j < n; j++) {
          if (i > j) {
            l[i][j] = a[i][j];
            u[i][j] = d[i][j] = 0;
          } else if (i < j) {
            u[i][j] = a[i][j];
            l[i][j] = d[i][j] = 0;
          } else {
            d[i][j] = a[i][j];
            l[i][j] = u[i][j] = 0;
          }
        }
      }
      h = jStat.multiply(jStat.multiply(jStat.inv(jStat.add(d, l)), u), -1);
      c = jStat.multiply(jStat.inv(jStat.add(d, l)), b);
      xv = x;
      xk = jStat.add(jStat.multiply(h, x), c);
      i = 2;
      while (Math.abs(jStat.norm(jStat.subtract(xk, xv))) > r) {
        xv = xk;
        xk = jStat.add(jStat.multiply(h, xv), c);
        i = i + 1;
      }
      return xk;
    },

    SOR: function SOR(a, b, x, r, w) {
      var i = 0;
      var n = a.length;
      var l = [];
      var u = [];
      var d = [];
      var j, xv, c, h, xk;
      for (; i < n; i++) {
        l[i] = [];
        u[i] = [];
        d[i] = [];
        for (j = 0; j < n; j++) {
          if (i > j) {
            l[i][j] = a[i][j];
            u[i][j] = d[i][j] = 0;
          } else if (i < j) {
            u[i][j] = a[i][j];
            l[i][j] = d[i][j] = 0;
          } else {
            d[i][j] = a[i][j];
            l[i][j] = u[i][j] = 0;
          }
        }
      }
      h = jStat.multiply(jStat.inv(jStat.add(d, jStat.multiply(l, w))),
                         jStat.subtract(jStat.multiply(d, 1 - w),
                                        jStat.multiply(u, w)));
      c = jStat.multiply(jStat.multiply(jStat.inv(jStat.add(d,
          jStat.multiply(l, w))), b), w);
      xv = x;
      xk = jStat.add(jStat.multiply(h, x), c);
      i = 2;
      while (Math.abs(jStat.norm(jStat.subtract(xk, xv))) > r) {
        xv = xk;
        xk = jStat.add(jStat.multiply(h, xv), c);
        i++;
      }
      return xk;
    },

    householder: function householder(a) {
      var m = a.length;
      var n = a[0].length;
      var i = 0;
      var w = [];
      var p = [];
      var alpha, r, k, j, factor;
      for (; i < m - 1; i++) {
        alpha = 0;
        for (j = i + 1; j < n; j++)
        alpha += (a[j][i] * a[j][i]);
        factor = (a[i + 1][i] > 0) ? -1 : 1;
        alpha = factor * Math.sqrt(alpha);
        r = Math.sqrt((((alpha * alpha) - a[i + 1][i] * alpha) / 2));
        w = jStat.zeros(m, 1);
        w[i + 1][0] = (a[i + 1][i] - alpha) / (2 * r);
        for (k = i + 2; k < m; k++) w[k][0] = a[k][i] / (2 * r);
        p = jStat.subtract(jStat.identity(m, n),
            jStat.multiply(jStat.multiply(w, jStat.transpose(w)), 2));
        a = jStat.multiply(p, jStat.multiply(a, p));
      }
      return a;
    },

    // A -> [Q,R]
    // Q is orthogonal matrix
    // R is upper triangular
    QR: (function() {
      // x -> Q
      // find a orthogonal matrix Q st.
      // Qx=y
      // y is [||x||,0,0,...]

      // quick ref
      var sum   = jStat.sum;
      var range = jStat.arange;

      function qr2(x) {
        // quick impletation
        // https://www.stat.wisc.edu/~larget/math496/qr.html

        var n = x.length;
        var p = x[0].length;

        var r = jStat.zeros(p, p);
        x = jStat.copy(x);

        var i,j,k;
        for(j = 0; j < p; j++){
          r[j][j] = Math.sqrt(sum(range(n).map(function(i){
            return x[i][j] * x[i][j];
          })));
          for(i = 0; i < n; i++){
            x[i][j] = x[i][j] / r[j][j];
          }
          for(k = j+1; k < p; k++){
            r[j][k] = sum(range(n).map(function(i){
              return x[i][j] * x[i][k];
            }));
            for(i = 0; i < n; i++){
              x[i][k] = x[i][k] - x[i][j]*r[j][k];
            }
          }
        }
        return [x, r];
      }

      return qr2;
    }()),

    lstsq: (function() {
      // solve least squard problem for Ax=b as QR decomposition way if b is
      // [[b1],[b2],[b3]] form will return [[x1],[x2],[x3]] array form solution
      // else b is [b1,b2,b3] form will return [x1,x2,x3] array form solution
      function R_I(A) {
        A = jStat.copy(A);
        var size = A.length;
        var I = jStat.identity(size);
        jStat.arange(size - 1, -1, -1).forEach(function(i) {
          jStat.sliceAssign(
              I, { row: i }, jStat.divide(jStat.slice(I, { row: i }), A[i][i]));
          jStat.sliceAssign(
              A, { row: i }, jStat.divide(jStat.slice(A, { row: i }), A[i][i]));
          jStat.arange(i).forEach(function(j) {
            var c = jStat.multiply(A[j][i], -1);
            var Aj = jStat.slice(A, { row: j });
            var cAi = jStat.multiply(jStat.slice(A, { row: i }), c);
            jStat.sliceAssign(A, { row: j }, jStat.add(Aj, cAi));
            var Ij = jStat.slice(I, { row: j });
            var cIi = jStat.multiply(jStat.slice(I, { row: i }), c);
            jStat.sliceAssign(I, { row: j }, jStat.add(Ij, cIi));
          });
        });
        return I;
      }

      function qr_solve(A, b){
        var array_mode = false;
        if (b[0].length === undefined) {
          // [c1,c2,c3] mode
          b = b.map(function(x){ return [x] });
          array_mode = true;
        }
        var QR = jStat.QR(A);
        var Q = QR[0];
        var R = QR[1];
        var attrs = A[0].length;
        var Q1 = jStat.slice(Q,{col:{end:attrs}});
        var R1 = jStat.slice(R,{row:{end:attrs}});
        var RI = R_I(R1);
        var Q2 = jStat.transpose(Q1);

        if(Q2[0].length === undefined){
          Q2 = [Q2]; // The confusing jStat.multifly implementation threat nature process again.
        }

        var x = jStat.multiply(jStat.multiply(RI, Q2), b);

        if(x.length === undefined){
          x = [[x]]; // The confusing jStat.multifly implementation threat nature process again.
        }


        if (array_mode)
          return x.map(function(i){ return i[0] });
        return x;
      }

      return qr_solve;
    }()),

    jacobi: function jacobi(a) {
      var condition = 1;
      var n = a.length;
      var e = jStat.identity(n, n);
      var ev = [];
      var b, i, j, p, q, maxim, theta, s;
      // condition === 1 only if tolerance is not reached
      while (condition === 1) {
        maxim = a[0][1];
        p = 0;
        q = 1;
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            if (i != j) {
              if (maxim < Math.abs(a[i][j])) {
                maxim = Math.abs(a[i][j]);
                p = i;
                q = j;
              }
            }
          }
        }
        if (a[p][p] === a[q][q])
          theta = (a[p][q] > 0) ? Math.PI / 4 : -Math.PI / 4;
        else
          theta = Math.atan(2 * a[p][q] / (a[p][p] - a[q][q])) / 2;
        s = jStat.identity(n, n);
        s[p][p] = Math.cos(theta);
        s[p][q] = -Math.sin(theta);
        s[q][p] = Math.sin(theta);
        s[q][q] = Math.cos(theta);
        // eigen vector matrix
        e = jStat.multiply(e, s);
        b = jStat.multiply(jStat.multiply(jStat.inv(s), a), s);
        a = b;
        condition = 0;
        for (i = 1; i < n; i++) {
          for (j = 1; j < n; j++) {
            if (i != j && Math.abs(a[i][j]) > 0.001) {
              condition = 1;
            }
          }
        }
      }
      for (i = 0; i < n; i++) ev.push(a[i][i]);
      //returns both the eigenvalue and eigenmatrix
      return [e, ev];
    },

    rungekutta: function rungekutta(f, h, p, t_j, u_j, order) {
      var k1, k2, u_j1, k3, k4;
      if (order === 2) {
        while (t_j <= p) {
          k1 = h * f(t_j, u_j);
          k2 = h * f(t_j + h, u_j + k1);
          u_j1 = u_j + (k1 + k2) / 2;
          u_j = u_j1;
          t_j = t_j + h;
        }
      }
      if (order === 4) {
        while (t_j <= p) {
          k1 = h * f(t_j, u_j);
          k2 = h * f(t_j + h / 2, u_j + k1 / 2);
          k3 = h * f(t_j + h / 2, u_j + k2 / 2);
          k4 = h * f(t_j +h, u_j + k3);
          u_j1 = u_j + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
          u_j = u_j1;
          t_j = t_j + h;
        }
      }
      return u_j;
    },

    romberg: function romberg(f, a, b, order) {
      var i = 0;
      var h = (b - a) / 2;
      var x = [];
      var h1 = [];
      var g = [];
      var m, a1, j, k, I;
      while (i < order / 2) {
        I = f(a);
        for (j = a, k = 0; j <= b; j = j + h, k++) x[k] = j;
        m = x.length;
        for (j = 1; j < m - 1; j++) {
          I += (((j % 2) !== 0) ? 4 : 2) * f(x[j]);
        }
        I = (h / 3) * (I + f(b));
        g[i] = I;
        h /= 2;
        i++;
      }
      a1 = g.length;
      m = 1;
      while (a1 !== 1) {
        for (j = 0; j < a1 - 1; j++)
        h1[j] = ((Math.pow(4, m)) * g[j + 1] - g[j]) / (Math.pow(4, m) - 1);
        a1 = h1.length;
        g = h1;
        h1 = [];
        m++;
      }
      return g;
    },

    richardson: function richardson(X, f, x, h) {
      function pos(X, x) {
        var i = 0;
        var n = X.length;
        var p;
        for (; i < n; i++)
          if (X[i] === x) p = i;
        return p;
      }
      var h_min = Math.abs(x - X[pos(X, x) + 1]);
      var i = 0;
      var g = [];
      var h1 = [];
      var y1, y2, m, a, j;
      while (h >= h_min) {
        y1 = pos(X, x + h);
        y2 = pos(X, x);
        g[i] = (f[y1] - 2 * f[y2] + f[2 * y2 - y1]) / (h * h);
        h /= 2;
        i++;
      }
      a = g.length;
      m = 1;
      while (a != 1) {
        for (j = 0; j < a - 1; j++)
          h1[j] = ((Math.pow(4, m)) * g[j + 1] - g[j]) / (Math.pow(4, m) - 1);
        a = h1.length;
        g = h1;
        h1 = [];
        m++;
      }
      return g;
    },

    simpson: function simpson(f, a, b, n) {
      var h = (b - a) / n;
      var I = f(a);
      var x = [];
      var j = a;
      var k = 0;
      var i = 1;
      var m;
      for (; j <= b; j = j + h, k++)
        x[k] = j;
      m = x.length;
      for (; i < m - 1; i++) {
        I += ((i % 2 !== 0) ? 4 : 2) * f(x[i]);
      }
      return (h / 3) * (I + f(b));
    },

    hermite: function hermite(X, F, dF, value) {
      var n = X.length;
      var p = 0;
      var i = 0;
      var l = [];
      var dl = [];
      var A = [];
      var B = [];
      var j;
      for (; i < n; i++) {
        l[i] = 1;
        for (j = 0; j < n; j++) {
          if (i != j) l[i] *= (value - X[j]) / (X[i] - X[j]);
        }
        dl[i] = 0;
        for (j = 0; j < n; j++) {
          if (i != j) dl[i] += 1 / (X [i] - X[j]);
        }
        A[i] = (1 - 2 * (value - X[i]) * dl[i]) * (l[i] * l[i]);
        B[i] = (value - X[i]) * (l[i] * l[i]);
        p += (A[i] * F[i] + B[i] * dF[i]);
      }
      return p;
    },

    lagrange: function lagrange(X, F, value) {
      var p = 0;
      var i = 0;
      var j, l;
      var n = X.length;
      for (; i < n; i++) {
        l = F[i];
        for (j = 0; j < n; j++) {
          // calculating the lagrange polynomial L_i
          if (i != j) l *= (value - X[j]) / (X[i] - X[j]);
        }
        // adding the lagrange polynomials found above
        p += l;
      }
      return p;
    },

    cubic_spline: function cubic_spline(X, F, value) {
      var n = X.length;
      var i = 0, j;
      var A = [];
      var B = [];
      var alpha = [];
      var c = [];
      var h = [];
      var b = [];
      var d = [];
      for (; i < n - 1; i++)
        h[i] = X[i + 1] - X[i];
      alpha[0] = 0;
      for (i = 1; i < n - 1; i++) {
        alpha[i] = (3 / h[i]) * (F[i + 1] - F[i]) -
            (3 / h[i-1]) * (F[i] - F[i-1]);
      }
      for (i = 1; i < n - 1; i++) {
        A[i] = [];
        B[i] = [];
        A[i][i-1] = h[i-1];
        A[i][i] = 2 * (h[i - 1] + h[i]);
        A[i][i+1] = h[i];
        B[i][0] = alpha[i];
      }
      c = jStat.multiply(jStat.inv(A), B);
      for (j = 0; j < n - 1; j++) {
        b[j] = (F[j + 1] - F[j]) / h[j] - h[j] * (c[j + 1][0] + 2 * c[j][0]) / 3;
        d[j] = (c[j + 1][0] - c[j][0]) / (3 * h[j]);
      }
      for (j = 0; j < n; j++) {
        if (X[j] > value) break;
      }
      j -= 1;
      return F[j] + (value - X[j]) * b[j] + jStat.sq(value-X[j]) *
          c[j] + (value - X[j]) * jStat.sq(value - X[j]) * d[j];
    },

    gauss_quadrature: function gauss_quadrature() {
      throw new Error('gauss_quadrature not yet implemented');
    },

    PCA: function PCA(X) {
      var m = X.length;
      var n = X[0].length;
      var i = 0;
      var j, temp1;
      var u = [];
      var D = [];
      var result = [];
      var temp2 = [];
      var Y = [];
      var Bt = [];
      var B = [];
      var C = [];
      var V = [];
      var Vt = [];
      for (i = 0; i < m; i++) {
        u[i] = jStat.sum(X[i]) / n;
      }
      for (i = 0; i < n; i++) {
        B[i] = [];
        for(j = 0; j < m; j++) {
          B[i][j] = X[j][i] - u[j];
        }
      }
      B = jStat.transpose(B);
      for (i = 0; i < m; i++) {
        C[i] = [];
        for (j = 0; j < m; j++) {
          C[i][j] = (jStat.dot([B[i]], [B[j]])) / (n - 1);
        }
      }
      result = jStat.jacobi(C);
      V = result[0];
      D = result[1];
      Vt = jStat.transpose(V);
      for (i = 0; i < D.length; i++) {
        for (j = i; j < D.length; j++) {
          if(D[i] < D[j])  {
            temp1 = D[i];
            D[i] = D[j];
            D[j] = temp1;
            temp2 = Vt[i];
            Vt[i] = Vt[j];
            Vt[j] = temp2;
          }
        }
      }
      Bt = jStat.transpose(B);
      for (i = 0; i < m; i++) {
        Y[i] = [];
        for (j = 0; j < Bt.length; j++) {
          Y[i][j] = jStat.dot([Vt[i]], [Bt[j]]);
        }
      }
      return [X, D, Vt, Y];
    }
  });

  // extend jStat.fn with methods that require one argument
  (function(funcs) {
    for (var i = 0; i < funcs.length; i++) (function(passfunc) {
      jStat.fn[passfunc] = function(arg, func) {
        var tmpthis = this;
        // check for callback
        if (func) {
          setTimeout(function() {
            func.call(tmpthis, jStat.fn[passfunc].call(tmpthis, arg));
          }, 15);
          return this;
        }
        if (typeof jStat[passfunc](this, arg) === 'number')
          return jStat[passfunc](this, arg);
        else
          return jStat(jStat[passfunc](this, arg));
      };
    }(funcs[i]));
  }('add divide multiply subtract dot pow exp log abs norm angle'.split(' ')));

  }(jStat, Math));
  (function(jStat, Math) {

  var slice = [].slice;
  var isNumber = jStat.utils.isNumber;
  var isArray = jStat.utils.isArray;

  // flag==true denotes use of sample standard deviation
  // Z Statistics
  jStat.extend({
    // 2 different parameter lists:
    // (value, mean, sd)
    // (value, array, flag)
    zscore: function zscore() {
      var args = slice.call(arguments);
      if (isNumber(args[1])) {
        return (args[0] - args[1]) / args[2];
      }
      return (args[0] - jStat.mean(args[1])) / jStat.stdev(args[1], args[2]);
    },

    // 3 different paramter lists:
    // (value, mean, sd, sides)
    // (zscore, sides)
    // (value, array, sides, flag)
    ztest: function ztest() {
      var args = slice.call(arguments);
      var z;
      if (isArray(args[1])) {
        // (value, array, sides, flag)
        z = jStat.zscore(args[0],args[1],args[3]);
        return (args[2] === 1) ?
          (jStat.normal.cdf(-Math.abs(z), 0, 1)) :
          (jStat.normal.cdf(-Math.abs(z), 0, 1)*2);
      } else {
        if (args.length > 2) {
          // (value, mean, sd, sides)
          z = jStat.zscore(args[0],args[1],args[2]);
          return (args[3] === 1) ?
            (jStat.normal.cdf(-Math.abs(z),0,1)) :
            (jStat.normal.cdf(-Math.abs(z),0,1)* 2);
        } else {
          // (zscore, sides)
          z = args[0];
          return (args[1] === 1) ?
            (jStat.normal.cdf(-Math.abs(z),0,1)) :
            (jStat.normal.cdf(-Math.abs(z),0,1)*2);
        }
      }
    }
  });

  jStat.extend(jStat.fn, {
    zscore: function zscore(value, flag) {
      return (value - this.mean()) / this.stdev(flag);
    },

    ztest: function ztest(value, sides, flag) {
      var zscore = Math.abs(this.zscore(value, flag));
      return (sides === 1) ?
        (jStat.normal.cdf(-zscore, 0, 1)) :
        (jStat.normal.cdf(-zscore, 0, 1) * 2);
    }
  });

  // T Statistics
  jStat.extend({
    // 2 parameter lists
    // (value, mean, sd, n)
    // (value, array)
    tscore: function tscore() {
      var args = slice.call(arguments);
      return (args.length === 4) ?
        ((args[0] - args[1]) / (args[2] / Math.sqrt(args[3]))) :
        ((args[0] - jStat.mean(args[1])) /
         (jStat.stdev(args[1], true) / Math.sqrt(args[1].length)));
    },

    // 3 different paramter lists:
    // (value, mean, sd, n, sides)
    // (tscore, n, sides)
    // (value, array, sides)
    ttest: function ttest() {
      var args = slice.call(arguments);
      var tscore;
      if (args.length === 5) {
        tscore = Math.abs(jStat.tscore(args[0], args[1], args[2], args[3]));
        return (args[4] === 1) ?
          (jStat.studentt.cdf(-tscore, args[3]-1)) :
          (jStat.studentt.cdf(-tscore, args[3]-1)*2);
      }
      if (isNumber(args[1])) {
        tscore = Math.abs(args[0]);
        return (args[2] == 1) ?
          (jStat.studentt.cdf(-tscore, args[1]-1)) :
          (jStat.studentt.cdf(-tscore, args[1]-1) * 2);
      }
      tscore = Math.abs(jStat.tscore(args[0], args[1]));
      return (args[2] == 1) ?
        (jStat.studentt.cdf(-tscore, args[1].length-1)) :
        (jStat.studentt.cdf(-tscore, args[1].length-1) * 2);
    }
  });

  jStat.extend(jStat.fn, {
    tscore: function tscore(value) {
      return (value - this.mean()) / (this.stdev(true) / Math.sqrt(this.cols()));
    },

    ttest: function ttest(value, sides) {
      return (sides === 1) ?
        (1 - jStat.studentt.cdf(Math.abs(this.tscore(value)), this.cols()-1)) :
        (jStat.studentt.cdf(-Math.abs(this.tscore(value)), this.cols()-1)*2);
    }
  });

  // F Statistics
  jStat.extend({
    // Paramter list is as follows:
    // (array1, array2, array3, ...)
    // or it is an array of arrays
    // array of arrays conversion
    anovafscore: function anovafscore() {
      var args = slice.call(arguments),
      expVar, sample, sampMean, sampSampMean, tmpargs, unexpVar, i, j;
      if (args.length === 1) {
        tmpargs = new Array(args[0].length);
        for (i = 0; i < args[0].length; i++) {
          tmpargs[i] = args[0][i];
        }
        args = tmpargs;
      }
      // Builds sample array
      sample = new Array();
      for (i = 0; i < args.length; i++) {
        sample = sample.concat(args[i]);
      }
      sampMean = jStat.mean(sample);
      // Computes the explained variance
      expVar = 0;
      for (i = 0; i < args.length; i++) {
        expVar = expVar + args[i].length * Math.pow(jStat.mean(args[i]) - sampMean, 2);
      }
      expVar /= (args.length - 1);
      // Computes unexplained variance
      unexpVar = 0;
      for (i = 0; i < args.length; i++) {
        sampSampMean = jStat.mean(args[i]);
        for (j = 0; j < args[i].length; j++) {
          unexpVar += Math.pow(args[i][j] - sampSampMean, 2);
        }
      }
      unexpVar /= (sample.length - args.length);
      return expVar / unexpVar;
    },

    // 2 different paramter setups
    // (array1, array2, array3, ...)
    // (anovafscore, df1, df2)
    anovaftest: function anovaftest() {
      var args = slice.call(arguments),
      df1, df2, n, i;
      if (isNumber(args[0])) {
        return 1 - jStat.centralF.cdf(args[0], args[1], args[2]);
      }
      var anovafscore = jStat.anovafscore(args);
      df1 = args.length - 1;
      n = 0;
      for (i = 0; i < args.length; i++) {
        n = n + args[i].length;
      }
      df2 = n - df1 - 1;
      return 1 - jStat.centralF.cdf(anovafscore, df1, df2);
    },

    ftest: function ftest(fscore, df1, df2) {
      return 1 - jStat.centralF.cdf(fscore, df1, df2);
    }
  });

  jStat.extend(jStat.fn, {
    anovafscore: function anovafscore() {
      return jStat.anovafscore(this.toArray());
    },

    anovaftes: function anovaftes() {
      var n = 0;
      var i;
      for (i = 0; i < this.length; i++) {
        n = n + this[i].length;
      }
      return jStat.ftest(this.anovafscore(), this.length - 1, n - this.length);
    }
  });

  // Tukey's range test
  jStat.extend({
    // 2 parameter lists
    // (mean1, mean2, n1, n2, sd)
    // (array1, array2, sd)
    qscore: function qscore() {
      var args = slice.call(arguments);
      var mean1, mean2, n1, n2, sd;
      if (isNumber(args[0])) {
          mean1 = args[0];
          mean2 = args[1];
          n1 = args[2];
          n2 = args[3];
          sd = args[4];
      } else {
          mean1 = jStat.mean(args[0]);
          mean2 = jStat.mean(args[1]);
          n1 = args[0].length;
          n2 = args[1].length;
          sd = args[2];
      }
      return Math.abs(mean1 - mean2) / (sd * Math.sqrt((1 / n1 + 1 / n2) / 2));
    },

    // 3 different parameter lists:
    // (qscore, n, k)
    // (mean1, mean2, n1, n2, sd, n, k)
    // (array1, array2, sd, n, k)
    qtest: function qtest() {
      var args = slice.call(arguments);

      var qscore;
      if (args.length === 3) {
        qscore = args[0];
        args = args.slice(1);
      } else if (args.length === 7) {
        qscore = jStat.qscore(args[0], args[1], args[2], args[3], args[4]);
        args = args.slice(5);
      } else {
        qscore = jStat.qscore(args[0], args[1], args[2]);
        args = args.slice(3);
      }

      var n = args[0];
      var k = args[1];

      return 1 - jStat.tukey.cdf(qscore, k, n - k);
    },

    tukeyhsd: function tukeyhsd(arrays) {
      var sd = jStat.pooledstdev(arrays);
      var means = arrays.map(function (arr) {return jStat.mean(arr);});
      var n = arrays.reduce(function (n, arr) {return n + arr.length;}, 0);

      var results = [];
      for (var i = 0; i < arrays.length; ++i) {
          for (var j = i + 1; j < arrays.length; ++j) {
              var p = jStat.qtest(means[i], means[j], arrays[i].length, arrays[j].length, sd, n, arrays.length);
              results.push([[i, j], p]);
          }
      }

      return results;
    }
  });

  // Error Bounds
  jStat.extend({
    // 2 different parameter setups
    // (value, alpha, sd, n)
    // (value, alpha, array)
    normalci: function normalci() {
      var args = slice.call(arguments),
      ans = new Array(2),
      change;
      if (args.length === 4) {
        change = Math.abs(jStat.normal.inv(args[1] / 2, 0, 1) *
                          args[2] / Math.sqrt(args[3]));
      } else {
        change = Math.abs(jStat.normal.inv(args[1] / 2, 0, 1) *
                          jStat.stdev(args[2]) / Math.sqrt(args[2].length));
      }
      ans[0] = args[0] - change;
      ans[1] = args[0] + change;
      return ans;
    },

    // 2 different parameter setups
    // (value, alpha, sd, n)
    // (value, alpha, array)
    tci: function tci() {
      var args = slice.call(arguments),
      ans = new Array(2),
      change;
      if (args.length === 4) {
        change = Math.abs(jStat.studentt.inv(args[1] / 2, args[3] - 1) *
                          args[2] / Math.sqrt(args[3]));
      } else {
        change = Math.abs(jStat.studentt.inv(args[1] / 2, args[2].length - 1) *
                          jStat.stdev(args[2], true) / Math.sqrt(args[2].length));
      }
      ans[0] = args[0] - change;
      ans[1] = args[0] + change;
      return ans;
    },

    significant: function significant(pvalue, alpha) {
      return pvalue < alpha;
    }
  });

  jStat.extend(jStat.fn, {
    normalci: function normalci(value, alpha) {
      return jStat.normalci(value, alpha, this.toArray());
    },

    tci: function tci(value, alpha) {
      return jStat.tci(value, alpha, this.toArray());
    }
  });

  // internal method for calculating the z-score for a difference of proportions test
  function differenceOfProportions(p1, n1, p2, n2) {
    if (p1 > 1 || p2 > 1 || p1 <= 0 || p2 <= 0) {
      throw new Error("Proportions should be greater than 0 and less than 1")
    }
    var pooled = (p1 * n1 + p2 * n2) / (n1 + n2);
    var se = Math.sqrt(pooled * (1 - pooled) * ((1/n1) + (1/n2)));
    return (p1 - p2) / se;
  }

  // Difference of Proportions
  jStat.extend(jStat.fn, {
    oneSidedDifferenceOfProportions: function oneSidedDifferenceOfProportions(p1, n1, p2, n2) {
      var z = differenceOfProportions(p1, n1, p2, n2);
      return jStat.ztest(z, 1);
    },

    twoSidedDifferenceOfProportions: function twoSidedDifferenceOfProportions(p1, n1, p2, n2) {
      var z = differenceOfProportions(p1, n1, p2, n2);
      return jStat.ztest(z, 2);
    }
  });

  }(jStat, Math));
  jStat.models = (function(){
    function sub_regress(exog) {
      var var_count = exog[0].length;
      var modelList = jStat.arange(var_count).map(function(endog_index) {
        var exog_index =
            jStat.arange(var_count).filter(function(i){return i!==endog_index});
        return ols(jStat.col(exog, endog_index).map(function(x){ return x[0] }),
                   jStat.col(exog, exog_index))
      });
      return modelList;
    }

    // do OLS model regress
    // exog have include const columns ,it will not generate it .In fact, exog is
    // "design matrix" look at
    //https://en.wikipedia.org/wiki/Design_matrix
    function ols(endog, exog) {
      var nobs = endog.length;
      var df_model = exog[0].length - 1;
      var df_resid = nobs-df_model - 1;
      var coef = jStat.lstsq(exog, endog);
      var predict =
          jStat.multiply(exog, coef.map(function(x) { return [x] }))
              .map(function(p) { return p[0] });
      var resid = jStat.subtract(endog, predict);
      var ybar = jStat.mean(endog);
      // constant cause problem
      // var SST = jStat.sum(endog.map(function(y) {
      //   return Math.pow(y-ybar,2);
      // }));
      var SSE = jStat.sum(predict.map(function(f) {
        return Math.pow(f - ybar, 2);
      }));
      var SSR = jStat.sum(endog.map(function(y, i) {
        return Math.pow(y - predict[i], 2);
      }));
      var SST = SSE + SSR;
      var R2 = (SSE / SST);
      return {
          exog:exog,
          endog:endog,
          nobs:nobs,
          df_model:df_model,
          df_resid:df_resid,
          coef:coef,
          predict:predict,
          resid:resid,
          ybar:ybar,
          SST:SST,
          SSE:SSE,
          SSR:SSR,
          R2:R2
      };
    }

    // H0: b_I=0
    // H1: b_I!=0
    function t_test(model) {
      var subModelList = sub_regress(model.exog);
      //var sigmaHat=jStat.stdev(model.resid);
      var sigmaHat = Math.sqrt(model.SSR / (model.df_resid));
      var seBetaHat = subModelList.map(function(mod) {
        var SST = mod.SST;
        var R2 = mod.R2;
        return sigmaHat / Math.sqrt(SST * (1 - R2));
      });
      var tStatistic = model.coef.map(function(coef, i) {
        return (coef - 0) / seBetaHat[i];
      });
      var pValue = tStatistic.map(function(t) {
        var leftppf = jStat.studentt.cdf(t, model.df_resid);
        return (leftppf > 0.5 ? 1 - leftppf : leftppf) * 2;
      });
      var c = jStat.studentt.inv(0.975, model.df_resid);
      var interval95 = model.coef.map(function(coef, i) {
        var d = c * seBetaHat[i];
        return [coef - d, coef + d];
      });
      return {
          se: seBetaHat,
          t: tStatistic,
          p: pValue,
          sigmaHat: sigmaHat,
          interval95: interval95
      };
    }

    function F_test(model) {
      var F_statistic =
          (model.R2 / model.df_model) / ((1 - model.R2) / model.df_resid);
      var fcdf = function(x, n1, n2) {
        return jStat.beta.cdf(x / (n2 / n1 + x), n1 / 2, n2 / 2)
      };
      var pvalue = 1 - fcdf(F_statistic, model.df_model, model.df_resid);
      return { F_statistic: F_statistic, pvalue: pvalue };
    }

    function ols_wrap(endog, exog) {
      var model = ols(endog,exog);
      var ttest = t_test(model);
      var ftest = F_test(model);
      // Provide the Wherry / Ezekiel / McNemar / Cohen Adjusted R^2
      // Which matches the 'adjusted R^2' provided by R's lm package
      var adjust_R2 =
          1 - (1 - model.R2) * ((model.nobs - 1) / (model.df_resid));
      model.t = ttest;
      model.f = ftest;
      model.adjust_R2 = adjust_R2;
      return model;
    }

    return { ols: ols_wrap };
  })();
  //To regress, simply build X matrix
  //(append column of 1's) using
  //buildxmatrix and build the Y
  //matrix using buildymatrix
  //(simply the transpose)
  //and run regress.



  //Regressions

  jStat.extend({
    buildxmatrix: function buildxmatrix(){
      //Parameters will be passed in as such
      //(array1,array2,array3,...)
      //as (x1,x2,x3,...)
      //needs to be (1,x1,x2,x3,...)
      var matrixRows = new Array(arguments.length);
      for(var i=0;i<arguments.length;i++){
        var array = [1];
        matrixRows[i]= array.concat(arguments[i]);
      }
      return jStat(matrixRows);

    },

    builddxmatrix: function builddxmatrix() {
      //Paramters will be passed in as such
      //([array1,array2,...]
      var matrixRows = new Array(arguments[0].length);
      for(var i=0;i<arguments[0].length;i++){
        var array = [1];
        matrixRows[i]= array.concat(arguments[0][i]);
      }
      return jStat(matrixRows);

    },

    buildjxmatrix: function buildjxmatrix(jMat) {
      //Builds from jStat Matrix
      var pass = new Array(jMat.length);
      for(var i=0;i<jMat.length;i++){
        pass[i] = jMat[i];
      }
      return jStat.builddxmatrix(pass);

    },

    buildymatrix: function buildymatrix(array){
      return jStat(array).transpose();
    },

    buildjymatrix: function buildjymatrix(jMat){
      return jMat.transpose();
    },

    matrixmult: function matrixmult(A,B){
      var i, j, k, result, sum;
      if (A.cols() == B.rows()) {
        if(B.rows()>1){
          result = [];
          for (i = 0; i < A.rows(); i++) {
            result[i] = [];
            for (j = 0; j < B.cols(); j++) {
              sum = 0;
              for (k = 0; k < A.cols(); k++) {
                sum += A.toArray()[i][k] * B.toArray()[k][j];
              }
              result[i][j] = sum;
            }
          }
          return jStat(result);
        }
        result = [];
        for (i = 0; i < A.rows(); i++) {
          result[i] = [];
          for (j = 0; j < B.cols(); j++) {
            sum = 0;
            for (k = 0; k < A.cols(); k++) {
              sum += A.toArray()[i][k] * B.toArray()[j];
            }
            result[i][j] = sum;
          }
        }
        return jStat(result);
      }
    },

    //regress and regresst to be fixed

    regress: function regress(jMatX,jMatY){
      //print("regressin!");
      //print(jMatX.toArray());
      var innerinv = jStat.xtranspxinv(jMatX);
      //print(innerinv);
      var xtransp = jMatX.transpose();
      var next = jStat.matrixmult(jStat(innerinv),xtransp);
      return jStat.matrixmult(next,jMatY);

    },

    regresst: function regresst(jMatX,jMatY,sides){
      var beta = jStat.regress(jMatX,jMatY);

      var compile = {};
      compile.anova = {};
      var jMatYBar = jStat.jMatYBar(jMatX, beta);
      compile.yBar = jMatYBar;
      var yAverage = jMatY.mean();
      compile.anova.residuals = jStat.residuals(jMatY, jMatYBar);

      compile.anova.ssr = jStat.ssr(jMatYBar, yAverage);
      compile.anova.msr = compile.anova.ssr / (jMatX[0].length - 1);

      compile.anova.sse = jStat.sse(jMatY, jMatYBar);
      compile.anova.mse =
          compile.anova.sse / (jMatY.length - (jMatX[0].length - 1) - 1);

      compile.anova.sst = jStat.sst(jMatY, yAverage);
      compile.anova.mst = compile.anova.sst / (jMatY.length - 1);

      compile.anova.r2 = 1 - (compile.anova.sse / compile.anova.sst);
      if (compile.anova.r2 < 0) compile.anova.r2 = 0;

      compile.anova.fratio = compile.anova.msr / compile.anova.mse;
      compile.anova.pvalue =
          jStat.anovaftest(compile.anova.fratio,
                           jMatX[0].length - 1,
                           jMatY.length - (jMatX[0].length - 1) - 1);

      compile.anova.rmse = Math.sqrt(compile.anova.mse);

      compile.anova.r2adj = 1 - (compile.anova.mse / compile.anova.mst);
      if (compile.anova.r2adj < 0) compile.anova.r2adj = 0;

      compile.stats = new Array(jMatX[0].length);
      var covar = jStat.xtranspxinv(jMatX);
      var sds, ts, ps;

      for(var i=0; i<beta.length;i++){
        sds=Math.sqrt(compile.anova.mse * Math.abs(covar[i][i]));
        ts= Math.abs(beta[i] / sds);
        ps= jStat.ttest(ts, jMatY.length - jMatX[0].length - 1, sides);

        compile.stats[i]=[beta[i], sds, ts, ps];
      }

      compile.regress = beta;
      return compile;
    },

    xtranspx: function xtranspx(jMatX){
      return jStat.matrixmult(jMatX.transpose(),jMatX);
    },


    xtranspxinv: function xtranspxinv(jMatX){
      var inner = jStat.matrixmult(jMatX.transpose(),jMatX);
      var innerinv = jStat.inv(inner);
      return innerinv;
    },

    jMatYBar: function jMatYBar(jMatX, beta) {
      var yBar = jStat.matrixmult(jMatX, beta);
      return new jStat(yBar);
    },

    residuals: function residuals(jMatY, jMatYBar) {
      return jStat.matrixsubtract(jMatY, jMatYBar);
    },

    ssr: function ssr(jMatYBar, yAverage) {
      var ssr = 0;
      for(var i = 0; i < jMatYBar.length; i++) {
        ssr += Math.pow(jMatYBar[i] - yAverage, 2);
      }
      return ssr;
    },

    sse: function sse(jMatY, jMatYBar) {
      var sse = 0;
      for(var i = 0; i < jMatY.length; i++) {
        sse += Math.pow(jMatY[i] - jMatYBar[i], 2);
      }
      return sse;
    },

    sst: function sst(jMatY, yAverage) {
      var sst = 0;
      for(var i = 0; i < jMatY.length; i++) {
        sst += Math.pow(jMatY[i] - yAverage, 2);
      }
      return sst;
    },

    matrixsubtract: function matrixsubtract(A,B){
      var ans = new Array(A.length);
      for(var i=0;i<A.length;i++){
        ans[i] = new Array(A[i].length);
        for(var j=0;j<A[i].length;j++){
          ans[i][j]=A[i][j]-B[i][j];
        }
      }
      return jStat(ans);
    }
  });
    // Make it compatible with previous version.
    jStat.jStat = jStat;

    return jStat;
  });
  });

  function get_alpha_sidaks_correction(alpha, variants) {
    if (variants == 1) {
      return alpha
    }

    return 1 - Math.pow(1 - alpha, 1 / variants)
  }

  // SOLVING FOR POWER
  function solveforpower_Gtest(data) {
    var { base_rate, effect_size } = data;
    var mean_var = base_rate * (1 + effect_size);
    data.variance = base_rate * (1 - base_rate) + mean_var * (1 - mean_var);

    return solve_for_power(data)
  }

  function solveforpower_Ttest(data) {
    var { sd_rate } = data;
    data.variance = 2 * sd_rate ** 2;

    return solve_for_power(data)
  }

  function solve_for_power(data) {
    var {
      total_sample_size,
      base_rate,
      variance,
      effect_size,
      alpha,
      variants,
      alternative,
      mu,
    } = data;
    var sample_size = total_sample_size / (1 + variants);

    var mean_base = base_rate;
    var mean_var = base_rate * (1 + effect_size);

    var mean_diff = mean_var - mean_base;
    var delta = mean_diff - mu;

    var z = jstat.normal.inv(1 - alpha / 2, 0, 1);
    var mean = delta * Math.sqrt(sample_size / variance);

    var power;
    if (alternative == 'lower') {
      power = jstat.normal.cdf(jstat.normal.inv(alpha, 0, 1), mean, 1);
    } else if (alternative == 'greater') {
      power = 1 - jstat.normal.cdf(jstat.normal.inv(1 - alpha, 0, 1), mean, 1);
    } else {
      power = 1 - (jstat.normal.cdf(z, mean, 1) - jstat.normal.cdf(-z, mean, 1));
    }

    return power
  }

  function is_valid_input(data) {
    var { base_rate, effect_size, alternative, opts, mu } = data;
    var change = effect_size * base_rate;
    if (typeof mu != 'undefined') {
      if (alternative == 'greater' && mu >= change) {
        return false
      }
      if (alternative == 'lower' && mu <= change) {
        return false
      }
    }

    if (opts && opts.type == 'relative') {
      if (alternative == 'greater' && opts.threshold >= effect_size) {
        return false
      }
      if (alternative == 'lower' && opts.threshold <= effect_size) {
        return false
      }
    }

    if (opts && opts.type == 'absolutePerDay' && opts.calculating == 'days') {
      if (
        alternative == 'greater' &&
        opts.threshold / opts.visitors_per_day >= change
      ) {
        return false
      }
      if (
        alternative == 'lower' &&
        opts.threshold / opts.visitors_per_day <= change
      ) {
        return false
      }
    }

    return true
  }

  // SOLVING FOR SAMPLE SIZE
  function solve_quadratic_for_sample({
    mean_diff,
    Z,
    days,
    threshold,
    variance,
  }) {
    var a = mean_diff;
    if (a == 0) {
      return (threshold * Math.sqrt(days)) / (2 * Math.sqrt(variance) * Z)
    }

    var b = (Math.sqrt(variance) * Z) / Math.sqrt(days);
    var c = -threshold / 2;

    var det = b ** 2 - 4 * a * c;
    if (det < 0) {
      return NaN
    }

    var sol_h = (-b + Math.sqrt(det)) / (2 * a);
    var sol_l = (-b - Math.sqrt(det)) / (2 * a);

    return sol_h >= 0 ? sol_h : sol_l
  }

  function solveforsample_Ttest(data) {
    var { sd_rate } = data;
    data.variance = 2 * sd_rate ** 2;
    return sample_size_calculation(data)
  }

  function solveforsample_Gtest(data) {
    var { base_rate, effect_size } = data;
    var mean_var = base_rate * (1 + effect_size);
    data.variance = base_rate * (1 - base_rate) + mean_var * (1 - mean_var);

    return sample_size_calculation(data)
  }

  function sample_size_calculation(data) {
    var {
      base_rate,
      variance,
      effect_size,
      alpha,
      beta,
      variants,
      alternative,
      mu,
      opts,
    } = data;

    if (!is_valid_input(data)) {
      return NaN
    }

    var mean_base = base_rate;
    var mean_var = base_rate * (1 + effect_size);
    var mean_diff = mean_var - mean_base;

    var multiplier;
    var sample_one_group;
    if (opts && opts.type == 'absolutePerDay') {
      if (opts.calculating == 'visitorsPerDay') {
        var Z;
        if (alternative == 'greater') {
          Z = jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1 - alpha, 0, 1);
        } else if (alternative == 'lower') {
          Z = jstat.normal.inv(1 - beta, 0, 1) - jstat.normal.inv(alpha, 0, 1);
        } else {
          Z =
            jstat.normal.inv(1 - beta, 0, 1) +
            jstat.normal.inv(1 - alpha / 2, 0, 1);
        }
        var sqrt_visitors_per_day = solve_quadratic_for_sample({
          mean_diff: mean_diff,
          Z: Z,
          days: opts.days,
          threshold: opts.threshold,
          variance: variance,
        });
        sample_one_group = opts.days * sqrt_visitors_per_day ** 2;
      } else {
        multiplier =
          variance /
          (mean_diff * Math.sqrt(opts.visitors_per_day / 2) -
            opts.threshold / Math.sqrt(2 * opts.visitors_per_day)) **
            2;
        var days;
        if (alternative == 'greater' || alternative == 'lower') {
          days =
            multiplier *
            (jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1 - alpha, 0, 1)) **
              2;
        } else {
          days =
            multiplier *
            (jstat.normal.inv(1 - beta, 0, 1) +
              jstat.normal.inv(1 - alpha / 2, 0, 1)) **
              2;
        }
        sample_one_group = (days * opts.visitors_per_day) / 2;
      }
    } else {
      multiplier = variance / (mu - mean_diff) ** 2;

      if (alternative == 'greater' || alternative == 'lower') {
        sample_one_group =
          multiplier *
          (jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1 - alpha, 0, 1)) ** 2;
      } else {
        sample_one_group =
          multiplier *
          (jstat.normal.inv(1 - beta, 0, 1) +
            jstat.normal.inv(1 - alpha / 2, 0, 1)) **
            2;
      }
    }

    return (1 + variants) * Math.ceil(sample_one_group)
  }

  // SOLVING FOR EFFECT SIZE
  function solveforeffectsize_Ttest({
    total_sample_size,
    base_rate,
    sd_rate,
    alpha,
    beta,
    variants,
    alternative,
    mu,
  }) {
    var sample_size = total_sample_size / (1 + variants);
    var variance = 2 * sd_rate ** 2;

    var z = jstat.normal.inv(1 - beta, 0, 1);
    var multiplier = Math.sqrt(variance / sample_size);
    var effect_size;
    if (alternative == 'greater') {
      effect_size = mu + (z - jstat.normal.inv(alpha, 0, 1)) * multiplier;
    } else if (alternative == 'lower') {
      effect_size = mu - (z - jstat.normal.inv(alpha, 0, 1)) * multiplier;
    } else {
      var delta = (z + jstat.normal.inv(1 - alpha / 2, 0, 1)) * multiplier;
      effect_size = mu + delta;
    }

    return effect_size / base_rate
  }

  function solve_quadratic(Z, sample_size, control_rate, mu) {
    var a = (Z ** 2 + sample_size) * control_rate ** 2;
    var b =
      -(Z ** 2) * control_rate -
      2 * (control_rate + mu) * sample_size * control_rate;
    var c =
      sample_size * (control_rate + mu) ** 2 -
      Z ** 2 * control_rate * (1 - control_rate);

    var det = b ** 2 - 4 * a * c;
    if (det < 0) {
      return [NaN, NaN]
    }

    var sol_h = (-b + Math.sqrt(det)) / (2 * a);
    var sol_l = (-b - Math.sqrt(det)) / (2 * a);

    return [sol_h, sol_l]
  }

  function solveforeffectsize_Gtest({
    total_sample_size,
    base_rate,
    alpha,
    beta,
    variants,
    alternative,
    mu,
  }) {
    var sample_size = total_sample_size / (1 + variants);

    var rel_effect_size;
    var Z;
    var solutions;
    if (alternative == 'greater' || alternative == 'lower') {
      Z = jstat.normal.inv(beta, 0, 1) + jstat.normal.inv(alpha, 0, 1);
      solutions = solve_quadratic(Z, sample_size, base_rate, mu);
      if (alternative == 'greater') {
        rel_effect_size = solutions[0] - 1;
      } else {
        rel_effect_size = solutions[1] - 1;
      }
    } else {
      Z = jstat.normal.inv(1 - beta, 0, 1) + jstat.normal.inv(1 - alpha / 2, 0, 1);
      solutions = solve_quadratic(Z, sample_size, base_rate, mu);
      rel_effect_size = solutions[0] - 1;
    }

    return rel_effect_size
  }

  function get_visitors_with_goals({ total_sample_size, base_rate }) {
    return total_sample_size * base_rate
  }

  function get_base_rate({ total_sample_size, visitors_with_goals }) {
    return visitors_with_goals / total_sample_size
  }

  function get_absolute_impact_in_metric_hash({ base_rate, effect_size }) {
    const value = base_rate * effect_size;
    return {
      value,
      min: base_rate - value,
      max: base_rate + value,
    }
  }

  function get_relative_impact_from_absolute({
    base_rate,
    absolute_effect_size,
  }) {
    return (base_rate + absolute_effect_size) / base_rate - 1
  }

  function get_absolute_impact_in_visitors({
    total_sample_size,
    base_rate,
    effect_size,
  }) {
    const absoluteImpactInMetric = get_absolute_impact_in_metric_hash({
      base_rate,
      effect_size,
    }).value;
    return absoluteImpactInMetric * total_sample_size
  }

  function get_relative_impact_from_visitors({
    total_sample_size,
    base_rate,
    visitors,
  }) {
    const absoluteImpactInMetric = visitors / total_sample_size;

    return get_relative_impact_from_absolute({
      base_rate,
      absolute_effect_size: absoluteImpactInMetric,
    })
  }

  function get_mu_from_relative_difference({ threshold, base_rate }) {
    return threshold * base_rate
  }

  function get_mu_from_absolute_per_day({ threshold, visitors_per_day }) {
    return threshold / visitors_per_day
  }

  function get_alternative({ type }) {
    let alternative = 'two-sided';
    if (type == 'noninferiority') {
      alternative = 'greater';
    }
    return alternative
  }

  var math = {
    gTest: {
      power: solveforpower_Gtest,
      sample: solveforsample_Gtest,
      impact: solveforeffectsize_Gtest,
    },
    tTest: {
      power: solveforpower_Ttest,
      sample: solveforsample_Ttest,
      impact: solveforeffectsize_Ttest,
    },
    getVisitorsWithGoals: get_visitors_with_goals,
    getBaseRate: get_base_rate,
    getAbsoluteImpactInMetricHash: get_absolute_impact_in_metric_hash,
    getAbsoluteImpactInVisitors: get_absolute_impact_in_visitors,
    getRelativeImpactFromAbsolute: get_relative_impact_from_absolute,
    getRelativeImpactFromVisitors: get_relative_impact_from_visitors,
    getMuFromRelativeDifference: get_mu_from_relative_difference,
    getMuFromAbsolutePerDay: get_mu_from_absolute_per_day,
    getAlternative: get_alternative,
    getCorrectedAlpha: get_alpha_sidaks_correction,
  };

  const TEST_TYPE = Object.freeze({
    CONTINUOUS: 'tTest',
    BINOMIAL: 'gTest',
  });

  const TRAFFIC_MODE = Object.freeze({
    DAILY: 'daily',
    TOTAL: 'total',
  });

  const COMPARISON_MODE = Object.freeze({
    ALL: 'all',
    ONE: 'one',
  });

  Object.freeze({
    ABSOLUTE: 'absolute',
    IMPACT: 'impact',
    RELATIVE: 'relative',
  });

  const FOCUS = Object.freeze({
    SAMPLE: 'sample',
    IMPACT: 'impact',
    BASE: 'base',
  });

  const BLOCKED = Object.freeze({
    VISITORS_PER_DAY: 'visitorsPerDay',
    DAYS: 'days',
  });

  const SELECTED = Object.freeze({
    RELATIVE: 'relative',
    ABSOLUTE: 'absolute',
  });

  function displayValue(value, type = 'int') {
    const alternativeToNaN = (val) => (!Number.isInteger(val) && !isFinite(val) ? '-' : val);

    switch (type) {
      case 'float':
        return alternativeToNaN(+parseFloat(value).toFixed(2))
      case 'percentage':
        return alternativeToNaN(+(parseFloat(value) * 100).toFixed(2))
      case 'int':
      default:
        return alternativeToNaN(parseInt(value, 10))
    }
  }

  function getAlternative(isNonInferiority) {
    return isNonInferiority ? 'greater' : 'two-sided'
  }

  function getAbsoluteImpact(baseRate, impactRelative) {
    const { value } = math.getAbsoluteImpactInMetricHash({
      base_rate: baseRate,
      effect_size: impactRelative,
    });
    return value
  }

  function getRelativeImpact(baseRate, absoluteImpact) {
    return math.getRelativeImpactFromAbsolute({
      base_rate: baseRate,
      absolute_effect_size: absoluteImpact,
    })
  }

  function getAbsoluteThreshold(state) {
    const visitorsPerDay = state.visitorsPerDay;
    const baseRate = state.baseRate;
    const runtime = state.runtime;
    const relativeThreshold = +state.relativeThreshold;

    let absoluteThreshold = relativeThreshold * baseRate * visitorsPerDay;

    if (state.trafficMode === TRAFFIC_MODE.TOTAL) {
      absoluteThreshold = absoluteThreshold * runtime;
    }

    return isNaN(absoluteThreshold) ? 0 : displayValue(absoluteThreshold, 'float')
  }

  function getRelativeThreshold(state) {
    const visitorsPerDay = +state.visitorsPerDay;
    const baseRate = +state.baseRate;
    const runtime = +state.runtime;
    const absoluteThreshold = +state.absoluteThreshold;

    let relativeThreshold = absoluteThreshold / (baseRate * visitorsPerDay);

    if (state.trafficMode === TRAFFIC_MODE.TOTAL) {
      relativeThreshold = relativeThreshold / runtime;
    }

    return isNaN(relativeThreshold) ? 0 : relativeThreshold
  }

  const calculator = {
    state: () => ({
      // Metrics
      baseRate: 0.1, // [0..1]
      confidenceLevel: 0.9, // [0..1]
      falsePositiveRate: 0.1, // [0..1]
      targetPower: 0.8, // [0..1]
      runtime: 14,
      visitorsPerDay: 40098,
      sample: 561364,
      standardDeviation: 10,
      // It would make sense to store it as variants + 1 but everywhere it uses
      // this format.
      variants: 1, // A/A = 0, A/B = 1...
      relativeImpact: 0.02, // [0..1]
      absoluteImpact: 0.2,
      relativeThreshold: 0.02,
      absoluteThreshold: 80.2,

      // Configuration
      isNonInferiority: false,
      comparisonMode: COMPARISON_MODE.ALL,
      trafficMode: TRAFFIC_MODE.DAILY,
      testType: TEST_TYPE.BINOMIAL,
    }),
    mutations: {
      // Initial update
      // eslint-disable-next-line complexity
      SET_IMPORTED_METRICS(state, props) {
        // Test setup
        if (props.testType && Object.values(TEST_TYPE).includes(props.testType)) {
          state.testType = props.testType;
        }

        if (
          props.comparisonMode &&
          Object.values(COMPARISON_MODE).includes(props.comparisonMode)
        ) {
          state.comparisonMode = props.comparisonMode;
        }

        if (
          props.trafficMode &&
          Object.values(TRAFFIC_MODE).includes(props.trafficMode)
        ) {
          state.trafficMode = props.trafficMode;
        }

        if (props.isNonInferiority) {
          state.isNonInferiority =
            typeof props.isNonInferiority === 'boolean'
              ? props.isNonInferiority
              : props.isNonInferiority === 'true';
        }

        // Configuration values
        if (props.targetPower) {
          state.targetPower = props.targetPower / 100;
        }

        if (props.falsePositiveRate) {
          state.falsePositiveRate = props.falsePositiveRate / 100;
        }

        if (props.variants) {
          state.variants = +props.variants;
        }

        // Base Rate
        if (props.baseRate) {
          state.baseRate =
            props.testType === TEST_TYPE.BINOMIAL
              ? props.baseRate / 100
              : +props.baseRate;
        }

        if (props.standardDeviation) {
          state.standardDeviation = +props.standardDeviation;
        }

        // Sample
        if (props.sample) {
          state.sample = +props.sample;
        }
        if (props.runtime) {
          state.runtime = +props.runtime;
        }
        if (props.visitorsPerDay) {
          state.visitorsPerDay = +props.visitorsPerDay;
        }

        // Impact
        // non-inferiority
        if (props.relativeThreshold && props.absoluteThreshold) {
          state.relativeThreshold = props.relativeThreshold / 100;
          state.absoluteThreshold = +props.absoluteThreshold;
        } else if (props.absoluteThreshold) {
          state.absoluteThreshold = +props.absoluteThreshold;
          state.relativeThreshold = getRelativeThreshold(props);
        } else if (props.relativeThreshold) {
          state.relativeThreshold = props.relativeThreshold / 100;
          state.absoluteThreshold = getAbsoluteThreshold(props);
        }

        // comparative
        // Ideal case
        if (props.relativeImpact && props.absoluteImpact) {
          state.relativeImpact = props.relativeImpact / 100;
          state.absoluteImpact = +props.absoluteImpact;
          // Backwards compatibility (1)
        } else if (props.relativeImpact && props.baseRate) {
          state.relativeImpact = props.relativeImpact / 100;
          state.absoluteImpact = getAbsoluteImpact(
            props.baseRate,
            props.relativeImpact / 100
          );
          if (props.trafficMode === TRAFFIC_MODE.DAILY) {
            state.absoluteImpact = state.absoluteImpact / 100;
          }
          // Necessary for backwards compatibility (2)
        } else if (props.absoluteImpact && props.baseRate) {
          state.absoluteImpact = props.absoluteImpact;
          state.realativeImpact = getRelativeImpact(
            props.baseRate,
            props.absoluteImpact
          );
        }
      },
      // Configuration
      SET_VARIANTS(state, amount) {
        if (!isNaN(amount) && amount >= 0) {
          state.variants = amount;
        }
      },
      // We can choose between compare the base vs one variant or vs all.
      SET_COMPARISON_MODE(state, val) {
        if (Object.values(COMPARISON_MODE).includes(val)) {
          state.comparisonMode = val;
        }
      },
      SET_TRAFFIC_MODE(state, val) {
        if (Object.values(TRAFFIC_MODE).includes(val)) {
          state.trafficMode = val;
        }
      },
      // In the UI is [0,100], in the store is [0,1]
      SET_FALSE_POSITIVE_RATE(state, rate) {
        if (!isNaN(rate) && rate >= 0 && rate <= 100) {
          state.falsePositiveRate = rate / 100;
        }
      },
      // In the UI is [0,100], in the store is [0,1]
      SET_TARGET_POWER(state, power) {
        if (!isNaN(power) && power >= 0 && power <= 100) {
          state.targetPower = power / 100;
        }
      },

      SET_IS_NON_INFERIORITY(state, flag) {
        state.isNonInferiority = !!flag;
      },

      SET_TEST_TYPE(state, { testType, focused, lockedField }) {
        if (!Object.values(TEST_TYPE).includes(testType)) {
          return
        }

        // If the new type is a gTest, it means that before it was in 0 -> 100
        // scale, which means we need to move it ot 0 -> 1 scale. If the new type
        // is tTest, it means that it was in 0 -> 1 and we need to move it to 0 ->
        // 100
        const newBaseRate =
          testType === TEST_TYPE.BINOMIAL
            ? state.baseRate / 100
            : state.baseRate * 100;

        // We need to recalculate based on the selected fields.
        // the result will be something like [tTest/gTest][impact/sample]
        const formula = math[testType][focused];
        const alpha =
          state.comparisonMode === COMPARISON_MODE.ALL
            ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
            : state.falsePositiveRate;

        const impact = state.isNonInferiority ? 0 : state.relativeImpact;
        const opts = state.isNonInferiority
          ? {
              type: 'relative',
              alternative: getAlternative(state.isNonInferiority),
              calculating: lockedField,
              runtime: state.runtime,
              // The current threshold is invalid as it is the result of a
              // different test. Also, it would turn the calculation stateful
              threshold: 0,
              visitors_per_day: state.visitorsPerDay,
              base_rate: newBaseRate,
            }
          : {};

        const mu = state.isNonInferiority
          ? math.getMuFromRelativeDifference(opts)
          : 0;

        if (focused === FOCUS.SAMPLE) {
          const sample = Math.ceil(formula({
              base_rate: newBaseRate,
              effect_size: impact,
              sd_rate: state.standardDeviation,
              alpha,
              beta: 1 - state.targetPower,
              variants: state.variants,
              alternative: getAlternative(state.isNonInferiority),
              mu,
              opts,
            }));

          if (lockedField === BLOCKED.DAYS) {
            state.runtime = Math.ceil(sample / state.visitorsPerDay);
          } else {
            state.visitorsPerDay = Math.ceil(sample / state.runtime);
          }

          if (state.isNonInferiority) {
            state.absoluteThreshold = getAbsoluteThreshold({
              ...state,
              baseRate: newBaseRate,
            });
          } else {
            state.absoluteImpact = getAbsoluteImpact(newBaseRate, impact);
          }
          state.sample = sample;
        } else {
          const effect = formula({
            total_sample_size: state.sample,
            base_rate: newBaseRate,
            sd_rate: state.standardDeviation,
            alpha,
            beta: 1 - state.targetPower,
            variants: state.variants,
            alternative: getAlternative(state.isNonInferiority),
            mu,
            opts,
          });

          if (state.isNonInferiority) {
            state.relativeThreshold = effect;
            state.absoluteThreshold = getAbsoluteThreshold({
              ...state,
              baseRate: newBaseRate,
              relativeThreshold: effect,
            });
          } else {
            state.relativeImpact = effect;
            state.absoluteImpact = getAbsoluteImpact(newBaseRate, effect);
          }
        }

        state.baseRate = newBaseRate;
        state.testType = testType;
      },

      // == BASE ==
      SET_BASE_RATE(state, { baseRate, lockedField, focusedBlock }) {
        if (
          // Do not allow not numbers
          isNaN(baseRate) ||
          // gTest (percentage) -- 0 < base rate < 100
          (state.testType === TEST_TYPE.BINOMIAL && (baseRate >= 100 || baseRate <= 0)) ||
          // tTest (amount) -- 0 <= base rate
          (state.testType === TEST_TYPE.CONTINUOUS && baseRate <= 0)
        ) {
          return
        }

        // If it is binomial, it is a percentage. If it is continuos, it is a
        // float. Therefore, we need to divide by 100 if it is a gTest.
        const newBaseRate =
          state.testType === TEST_TYPE.BINOMIAL ? baseRate / 100 : baseRate;

        // We use relative threshold = 0 when we are calculating the impact.
        const relativeThreshold =
          focusedBlock === FOCUS.SAMPLE ? state.relativeThreshold : 0;

        const impact = state.isNonInferiority ? 0 : state.relativeImpact;
        const opts = state.isNonInferiority
          ? {
              type: 'relative',
              alternative: getAlternative(state.isNonInferiority),
              calculating: lockedField,
              runtime: state.runtime,
              threshold: -relativeThreshold,
              visitors_per_day: state.visitorsPerDay,
              base_rate: newBaseRate,
            }
          : {};

        const mu = state.isNonInferiority
          ? math.getMuFromRelativeDifference(opts)
          : 0;

        const type = state.testType;
        const formula = math[type][focusedBlock];
        const alpha =
          state.comparisonMode === COMPARISON_MODE.ALL
            ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
            : state.falsePositiveRate;

        if (focusedBlock === FOCUS.SAMPLE) {
          const sample = Math.ceil(formula({
              base_rate: newBaseRate,
              effect_size: impact,
              sd_rate: state.standardDeviation,
              alpha,
              beta: 1 - state.targetPower,
              variants: state.variants,
              alternative: getAlternative(state.isNonInferiority),
              mu,
              opts,
            }));

          if (lockedField === BLOCKED.DAYS) {
            state.runtime = Math.ceil(sample / state.visitorsPerDay);
          } else {
            state.visitorsPerDay = Math.ceil(sample / state.runtime);
          }

          if (state.isNonInferiority) {
            state.absoluteThreshold = getAbsoluteThreshold({
              ...state,
              baseRate: newBaseRate,
            });
          } else {
            state.absoluteImpact = getAbsoluteImpact(
              newBaseRate,
              state.relativeImpact
            );
          }

          state.sample = sample;
        } else {
          const effect = formula({
            total_sample_size: state.sample,
            base_rate: newBaseRate, // It uses the displayed value
            sd_rate: state.standardDeviation,
            alpha,
            beta: 1 - state.targetPower,
            variants: state.variants,
            alternative: getAlternative(state.isNonInferiority),
            mu,
            opts,
          });

          if (state.isNonInferiority) {
            state.relativeThreshold = effect;
            state.absoluteThreshold = getAbsoluteThreshold({
              ...state,
              baseRate: newBaseRate,
              relativeThreshold: effect,
            });
          } else {
            state.relativeImpact = effect;
            state.absoluteImpact = getAbsoluteImpact(newBaseRate, effect);
          }
        }

        state.baseRate = newBaseRate;
      },

      SET_STANDARD_DEVIATION(state, stddev) {
        if (isNaN(stddev) || stddev < 0) {
          return
        }
        state.standardDeviation = stddev;
      },

      // == SAMPLE ==
      SET_SAMPLE(state, { sample, lockedField, focusedBlock }) {
        if (isNaN(sample) || sample < 0) {
          return
        }

        const newSample = Math.ceil(sample);

        // We use relative threshold = 0 when we are calculating the impact.
        const relativeThreshold =
          focusedBlock === FOCUS.SAMPLE ? state.relativeThreshold : 0;

        const impact = state.isNonInferiority ? 0 : state.relativeImpact;
        const opts = state.isNonInferiority
          ? {
              type: 'relative',
              alternative: getAlternative(state.isNonInferiority),
              calculating: lockedField,
              runtime: state.runtime,
              threshold: relativeThreshold,
              visitors_per_day: state.visitorsPerDay,
              base_rate: state.baseRate,
            }
          : {};

        const mu = state.isNonInferiority
          ? math.getMuFromRelativeDifference(opts)
          : 0;

        const type = state.testType;
        const impactFormula = math[type].impact;
        const alpha =
          state.comparisonMode === COMPARISON_MODE.ALL
            ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
            : state.falsePositiveRate;

        const newImpact = impactFormula({
          // It is totally unclear when the current engine rounds up and when it
          // doesnt.
          total_sample_size: newSample,
          base_rate: state.baseRate,
          sd_rate: state.standardDeviation,
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        });

        if (lockedField === BLOCKED.DAYS) {
          state.runtime = Math.ceil(newSample / state.visitorsPerDay);
        } else {
          state.visitorsPerDay = Math.ceil(newSample / state.runtime);
        }

        if (state.isNonInferiority) {
          state.relativeThreshold = newImpact;
          state.absoluteThreshold = getAbsoluteThreshold({
            ...state,
            sample: newSample,
            relativeThreshold: newImpact,
          });
        } else {
          state.relativeImpact = impact;
          state.absoluteImpact = getAbsoluteImpact(state.baseRate, newImpact);
        }

        state.sample = newSample;
      },
      SET_RUNTIME(state, { runtime, lockedField, focusedBlock }) {
        if (isNaN(runtime) || runtime <= 0) {
          return
        }

        const newRuntime = Math.ceil(runtime);

        if (focusedBlock === FOCUS.SAMPLE) {
          state.visitorsPerDay = Math.ceil(state.sample / newRuntime);
        } else {
          const newSample = Math.ceil(newRuntime * state.visitorsPerDay);

          // We use relative threshold = 0 when we are calculating the impact.
          const relativeThreshold =
            focusedBlock === FOCUS.SAMPLE ? state.relativeThreshold : 0;

          const opts = state.isNonInferiority
            ? {
                type: 'relative',
                alternative: getAlternative(state.isNonInferiority),
                calculating: BLOCKED.VISITORS_PER_DAY,
                runtime: newRuntime,
                threshold: relativeThreshold,
                visitors_per_day: state.visitorsPerDay,
                base_rate: state.baseRate,
              }
            : {};

          const mu = state.isNonInferiority
            ? math.getMuFromRelativeDifference(opts)
            : 0;

          const type = state.testType;
          const impactFormula = math[type].impact;
          const alpha =
            state.comparisonMode === COMPARISON_MODE.ALL
              ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
              : state.falsePositiveRate;

          const newImpact = impactFormula({
            total_sample_size: newSample,
            base_rate: state.baseRate,
            sd_rate: state.standardDeviation,
            alpha,
            beta: 1 - state.targetPower,
            variants: state.variants,
            alternative: getAlternative(state.isNonInferiority),
            mu,
            opts,
          });

          if (state.isNonInferiority) {
            state.relativeThreshold = newImpact;
            state.absoluteThreshold = getAbsoluteThreshold({
              ...state,
              sample: newSample,
              runtime: newRuntime,
              relativeThreshold: newImpact,
            });
          } else {
            state.relativeImpact = newImpact;
            state.absoluteImpact = getAbsoluteImpact(state.baseRate, newImpact);
          }
          state.sample = newSample;
        }

        state.runtime = newRuntime;
      },

      SET_VISITORS_PER_DAY(state, { visitorsPerDay, lockedField, focusedBlock }) {
        if (isNaN(visitorsPerDay) || visitorsPerDay < 0) {
          return
        }

        const newVisitorsPerDay = Math.ceil(visitorsPerDay);
        if (focusedBlock === FOCUS.SAMPLE) {
          state.runtime = Math.ceil(state.sample / newVisitorsPerDay);
        } else {
          const newSample = Math.ceil(state.runtime * newVisitorsPerDay);

          // We use relative threshold = 0 when we are calculating the impact.
          const relativeThreshold =
            focusedBlock === FOCUS.SAMPLE ? state.relativeThreshold : 0;

          const opts = state.isNonInferiority
            ? {
                type: 'relative',
                alternative: getAlternative(state.isNonInferiority),
                calculating: BLOCKED.DAYS,
                runtime: state.runtime,
                threshold: relativeThreshold,
                visitors_per_day: newVisitorsPerDay,
                base_rate: state.baseRate,
              }
            : {};

          const mu = state.isNonInferiority
            ? math.getMuFromRelativeDifference(opts)
            : 0;

          const type = state.testType;
          const impactFormula = math[type].impact;
          const alpha =
            state.comparisonMode === COMPARISON_MODE.ALL
              ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
              : state.falsePositiveRate;

          const newImpact = impactFormula({
            // It is totally unclear when the current engine rounds up and when it
            // doesnt.
            total_sample_size: newSample,
            base_rate: state.baseRate,
            sd_rate: state.standardDeviation,
            alpha,
            beta: 1 - state.targetPower,
            variants: state.variants,
            alternative: getAlternative(state.isNonInferiority),
            mu,
            opts,
          });

          if (state.isNonInferiority) {
            state.relativeThreshold = newImpact;
            state.absoluteThreshold = getAbsoluteThreshold({
              ...state,
              relativeThreshold: newImpact,
            });
          } else {
            state.relativeImpact = newImpact;
            state.absoluteImpact = getAbsoluteImpact(state.baseRate, newImpact);
          }

          state.sample = newSample;
        }
        state.visitorsPerDay = newVisitorsPerDay;
      },

      // == IMPACT ==
      SET_IMPACT(state, { impact, isAbsolute, lockedField }) {
        if (
          // Do not allow not numbers
          isNaN(impact) ||
          // No percetages or values less than 0
          impact <= 0 ||
          // If it is not absolute, do not allow percentages higher or equal than 100
          (!isAbsolute && impact >= 100) ||
          // If it is absolute, do not allow percentages higher or equal than 100
          // when it is binomial
          (isAbsolute && state.testType === TEST_TYPE.BINOMIAL && impact >= 100)
        ) {
          return
        }
        const newImpact =
          (isAbsolute
            ? math.getRelativeImpactFromAbsolute({
                base_rate: state.baseRate,
                absolute_effect_size: impact,
              })
            : impact) / 100;

        const type = state.testType;
        const sampleFormula = math[type].sample;
        const alpha =
          state.comparisonMode === COMPARISON_MODE.ALL
            ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
            : state.falsePositiveRate;

        const sample = Math.ceil(sampleFormula({
            base_rate: state.baseRate,
            effect_size: newImpact,
            sd_rate: state.standardDeviation,
            alpha,
            beta: 1 - state.targetPower,
            variants: state.variants,
            alternative: getAlternative(state.isNonInferiority),
            mu: 0, // if it isn't non-inferiority, it is always 0
            opts: {}, // emtpy if it isn't non-inferiority
          }));

        if (lockedField === BLOCKED.DAYS) {
          state.runtime = Math.ceil(sample / state.visitorsPerDay);
        } else {
          state.visitorsPerDay = Math.ceil(sample / state.runtime);
        }

        state.relativeImpact = newImpact;
        state.absoluteImpact = getAbsoluteImpact(state.baseRate, newImpact);
        state.sample = sample;
      },

      // This is only triggered when non-inferity == true and focusedBlock === sample
      SET_THRESHOLD(state, { threshold, isAbsolute, lockedField }) {
        if (
          // Disallow not numbers
          isNaN(threshold) ||
          // Not values lower than 0 in general
          threshold <= 0 ||
          // If it is relative, do not allow 100 or more.
          (!isAbsolute && threshold >= 100)
        ) {
          return
        }

        const baseRate = state.baseRate;
        const visitorsPerDay = state.visitorsPerDay;

        // eslint-disable-next-line no-nested-ternary
        const normaliseThreshold = isAbsolute
          ? state.trafficMode === TRAFFIC_MODE.TOTAL
            ? threshold / state.runtime
            : threshold
          : threshold / 100;

        const impact = state.isNonInferiority ? 0 : state.relativeImpact;
        const opts = {
          type: isAbsolute ? 'absolutePerDay' : 'relative',
          alternative: getAlternative(state.isNonInferiority),
          calculating: lockedField,
          runtime: state.runtime,
          threshold: -normaliseThreshold,
          visitors_per_day: visitorsPerDay,
          base_rate: baseRate,
        };

        const mu = isAbsolute
          ? math.getMuFromAbsolutePerDay(opts)
          : math.getMuFromRelativeDifference(opts);

        const type = state.testType;
        const sampleFormula = math[type].sample;
        const alpha =
          state.comparisonMode === COMPARISON_MODE.ALL
            ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
            : state.falsePositiveRate;

        const sample = Math.ceil(sampleFormula({
            base_rate: baseRate,
            effect_size: impact,
            sd_rate: state.standardDeviation,
            alpha,
            beta: 1 - state.targetPower,
            variants: state.variants,
            alternative: getAlternative(state.isNonInferiority),
            mu,
            opts,
          }));

        if (lockedField === BLOCKED.DAYS) {
          state.runtime = Math.ceil(sample / visitorsPerDay);
        } else {
          state.visitorsPerDay = Math.ceil(sample / state.runtime);
        }

        state.sample = sample;

        if (isAbsolute) {
          state.absoluteThreshold = threshold;
          state.relativeThreshold = getRelativeThreshold({
            ...state,
            sample,
            absoluteThreshold: threshold,
          });
        } else {
          state.relativeThreshold = normaliseThreshold;
          state.absoluteThreshold = getAbsoluteThreshold({
            ...state,
            sample,
            relativeThreshold: normaliseThreshold,
          });
        }
      },
    },
    getters: {
      // UI getters
      // Configuration
      variants: (state) => state.variants,
      falsePositiveRate: (state) => displayValue(state.falsePositiveRate, 'percentage'),
      targetPower: (state) => displayValue(state.targetPower, 'percentage'),
      isNonInferiority: (state) => state.isNonInferiority,
      testType: (state) => state.testType,
      comparisonMode: (state) => state.comparisonMode,
      trafficMode: (state) => state.trafficMode,

      // Base rate
      baseRate: (state) => displayValue(
          state.baseRate,
          state.testType === TEST_TYPE.BINOMIAL ? 'percentage' : 'float'
        ),
      standardDeviation: (state) => displayValue(state.standardDeviation, 'float'),
      metricTotal: (state) => (state.sample * state.baseRate).toFixed(0),

      // Sample
      visitorsPerDay: (state) => displayValue(state.visitorsPerDay, 'int'),
      sample: (state) => {
        if (
          (state.isNonInferiority && state.relativeThreshold === 0) ||
          (!state.isNonInferiority && state.relativeImpact === 0)
        ) {
          return '-'
        }
        return displayValue(Math.ceil(state.sample), 'int')
      },
      runtime: (state) => {
        if (
          (state.isNonInferiority && state.relativeThreshold === 0) ||
          (!state.isNonInferiority && state.relativeImpact === 0)
        ) {
          return '-'
        }
        return displayValue(Math.ceil(state.runtime), 'int')
      },

      // Impact
      relativeImpact: (state) => displayValue(state.relativeImpact, 'percentage'),
      absoluteImpact: (state) => displayValue(state.absoluteImpact, 'percentage'),
      minAbsoluteImpact: (state) => {
        const { min } = math.getAbsoluteImpactInMetricHash({
          base_rate: state.baseRate,
          effect_size: state.relativeImpact,
        });
        return displayValue(min, 'percentage')
      },
      maxAbsoluteImpact: (state) => {
        const { max } = math.getAbsoluteImpactInMetricHash({
          base_rate: state.baseRate,
          effect_size: state.relativeImpact,
        });
        return displayValue(max, 'percentage')
      },
      absoluteImpactPerVisitor: (state) => {
        const impactPerVisitor = math.getAbsoluteImpactInVisitors({
          base_rate: state.baseRate,
          effect_size: state.relativeImpact,
          total_sample_size: state.sample,
        });

        return displayValue(impactPerVisitor, 'int')
      },
      absoluteImpactPerVisitorPerDay: (state) => {
        const impactPerVisitor = math.getAbsoluteImpactInVisitors({
          base_rate: state.baseRate,
          effect_size: state.relativeImpact,
          total_sample_size: state.sample,
        });
        // We need to use the parsed display value for consistency
        return displayValue(Math.floor(impactPerVisitor / state.runtime), 'int')
      },

      // THRESHOLD
      relativeThreshold: (state) => displayValue(state.relativeThreshold, 'percentage'),
      absoluteThreshold: (state) => displayValue(state.absoluteThreshold, 'float'),
    },
  };

  //

  const DEBOUNCE$3 = 500;

  var script$5 = {
    extends: __vue_component__$6,
    template: '#base-comp',
    data: () => ({
      baseDebouncer: null,
      sdRateDebouncer: null,
    }),
    computed: {
      TEST_TYPE: () => TEST_TYPE,
      base: {
        get() {
          return this.$store.getters.baseRate
        },
        set(val) {
          if (this.baseDebouncer != null) {
            clearTimeout(this.baseDebouncer);
          }
          this.baseDebouncer = setTimeout(() => {
            if (this.$store.getters.baseRate !== val) {
              this.$store.commit('SET_BASE_RATE', {
                baseRate: val,
                lockedField: this.lockedField,
                focusedBlock: this.focusedBlock,
              });
            }
          }, DEBOUNCE$3);
        },
      },
      sdRate: {
        get() {
          return this.$store.getters.standardDeviation
        },
        set(val) {
          if (this.sdRateDebouncer != null) {
            clearTimeout(this.sdRateDebouncer);
          }
          this.sdRateDebouncer = setTimeout(() => {
            this.$store.commit('SET_STANDARD_DEVIATION', val);
            // Little hack to not rewrite everything again.
            this.$store.commit('SET_BASE_RATE', {
              baseRate: this.base,
              lockedField: this.lockedField,
              focusedBlock: this.focusedBlock,
            });
          }, DEBOUNCE$3);
        },
      },
      visitorsWithGoals() {
        return this.$store.getters.metricTotal
      },
      sample() {
        return this.$store.getters.sample
      },
      testType() {
        return this.$store.getters.testType
      },
    },
  };

  /* script */
  const __vue_script__$5 = script$5;

  /* template */
  var __vue_render__$5 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pc-block pc-block--base",class:{ 'pc-block-focused': _vm.isBlockFocused }},[_c('pc-svg-chain',{attrs:{"isBlockFocused":_vm.isBlockFocused}}),_vm._v(" "),(_vm.testType == 'gTest')?_c('div',{staticClass:"pc-header"},[_vm._v("Base Rate")]):_c('div',{staticClass:"pc-header"},[_vm._v("Base Average")]),_vm._v(" "),_c('ul',{staticClass:"pc-inputs"},[_c('li',{staticClass:"pc-input-item pc-input-left"},[_c('label',[_c('span',{staticClass:"pc-input-title"},[_vm._v(_vm._s(_vm.testType == 'gTest' ? 'Base Rate' : 'Base Average')+"\n          "),_c('small',{staticClass:"pc-input-sub-title"},[_vm._v("conversion")])]),_vm._v(" "),_c('pc-block-field',{attrs:{"fieldProp":"base","suffix":_vm.testType === _vm.TEST_TYPE.BINOMIAL ? '%' : '',"fieldValue":_vm.base,"isReadOnly":_vm.isReadOnly,"isBlockFocused":_vm.isBlockFocused,"enableEdit":"true"},on:{"update:fieldValue":function($event){_vm.base=$event;},"update:field-value":function($event){_vm.base=$event;}}})],1)]),_vm._v(" "),_c('li',{staticClass:"pc-input-item pc-input-right"},[_c('label',[_vm._m(0),_vm._v(" "),_c('pc-block-field',{attrs:{"fieldProp":"visitorsWithGoals","fieldValue":_vm.visitorsWithGoals,"isBlockFocused":_vm.isBlockFocused,"isReadOnly":true,"enableEdit":false}})],1)]),_vm._v(" "),(_vm.testType == 'tTest')?_c('li',{staticClass:"pc-input-item pc-input-sd-rate"},[_c('label',[_c('pc-block-field',{attrs:{"prefix":"±","fieldProp":"sdRate","fieldValue":_vm.sdRate,"isReadOnly":_vm.isReadOnly,"isBlockFocused":_vm.isBlockFocused,"enableEdit":"true"},on:{"update:fieldValue":function($event){_vm.sdRate=$event;},"update:field-value":function($event){_vm.sdRate=$event;}}}),_vm._v(" "),_c('span',{staticClass:"pc-input-details"},[_vm._v("Base Standard deviation")])],1)]):_vm._e()])],1)};
  var __vue_staticRenderFns__$5 = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticClass:"pc-input-title"},[_vm._v("Metric Totals"),_c('small',{staticClass:"pc-input-sub-title"},[_vm._v("visitors reached goal")])])}];

    /* style */
    const __vue_inject_styles__$5 = function (inject) {
      if (!inject) return
      inject("data-v-150e359e_0", { source: ".pc-input-sd-rate{margin-top:-10px;z-index:1;position:relative;text-align:center}.pc-field-sdRate{width:90%;display:inline-block}", map: undefined, media: undefined })
  ,inject("data-v-150e359e_1", { source: ".pc-input-left[data-v-150e359e]{position:relative;z-index:2}", map: undefined, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$5 = "data-v-150e359e";
    /* module identifier */
    const __vue_module_identifier__$5 = undefined;
    /* functional template */
    const __vue_is_functional_template__$5 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$5 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
      __vue_inject_styles__$5,
      __vue_script__$5,
      __vue_scope_id__$5,
      __vue_is_functional_template__$5,
      __vue_module_identifier__$5,
      false,
      createInjector,
      undefined,
      undefined
    );

  //

  const DEBOUNCE$2 = 500;

  var script$4 = {
    extends: __vue_component__$6,
    template: '#impact-comp',
    data: () => ({
      absoluteImpactDebouncer: null,
      relativeImpactDebouncer: null,
    }),
    computed: {
      isFocused: {
        get() {
          return this.focusedBlock
        },
        set(val) {
          if (val === this.blockName) {
            this.$emit('update:focusedBlock', this.blockName);
          }
        },
      },
      isNonInferiority() {
        return this.$store.getters.isNonInferiority
      },
      relativeImpact: {
        get() {
          return this.$store.getters.relativeImpact
        },
        set(val) {
          if (this.focusedBlock === FOCUS.SAMPLE) {
            if (this.relativeImpactDebouncer != null) {
              clearTimeout(this.relativeImpactDebouncer);
            }
            this.relativeImpactDebouncer = setTimeout(() => {
              this.$emit('update:selected', SELECTED.RELATIVE);
              this.$store.commit('SET_IMPACT', {
                impact: val,
                isAbsolute: false,
                lockedField: this.lockedField,
              });
            }, DEBOUNCE$2);
          }
        },
      },
      baseRate() {
        return this.$store.getters.baseRate
      },
      absoluteImpact: {
        get() {
          return this.$store.getters.absoluteImpact
        },
        set(val) {
          if (this.focusedBlock === FOCUS.SAMPLE) {
            if (this.absoluteImpactDebouncer != null) {
              clearTimeout(this.absoluteImpactDebouncer);
            }
            this.absoluteImpactDebouncer = setTimeout(() => {
              this.$emit('update:selected', SELECTED.ABSOLUTE);
              this.$store.commit('SET_IMPACT', {
                impact: val,
                isAbsolute: true,
                lockedField: this.lockedField,
              });
            }, DEBOUNCE$2);
          }
        },
      },
      minAbsoluteImpact() {
        return this.$store.getters.minAbsoluteImpact
      },
      maxAbsoluteImpact() {
        return this.$store.getters.maxAbsoluteImpact
      },
      absoluteImpactPerVisitor() {
        return this.$store.getters.absoluteImpactPerVisitor
      },
      absoluteImpactPerVisitorPerDay() {
        return this.$store.getters.absoluteImpactPerVisitorPerDay
      },
      testType() {
        return this.$store.getters.testType
      },
      onlyTotalVisitors() {
        return this.$store.getters.trafficMode === TRAFFIC_MODE.TOTAL
      },
    },
    methods: {
      addPercentToString(str) {
        let result = str;
        if (this.testType === TEST_TYPE.BINOMIAL) {
          result += '%';
        }
        return result
      },
    },
  };

  /* script */
  const __vue_script__$4 = script$4;

  /* template */
  var __vue_render__$4 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pc-block pc-block--impact",class:{
      'pc-block-focused': _vm.isBlockFocused,
      'pc-block-to-calculate': _vm.isBlockFocused,
    }},[_c('pc-svg-chain',{attrs:{"isBlockFocused":_vm.isBlockFocused}}),_vm._v(" "),_c('label',{staticClass:"pc-calc-radio pc-calc-radio--impact",class:{ 'pc-calc-radio--active': _vm.isBlockFocused },attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.isFocused),expression:"isFocused"}],attrs:{"type":"radio"},domProps:{"value":_vm.blockName,"checked":_vm._q(_vm.isFocused,_vm.blockName)},on:{"change":function($event){_vm.isFocused=_vm.blockName;}}}),_vm._v("\n    "+_vm._s(_vm.isBlockFocused ? 'Calculating' : 'Calculate')+"\n  ")]),_vm._v(" "),_c('div',{staticClass:"pc-header"},[_vm._v("Impact")]),_vm._v(" "),_c('ul',{staticClass:"pc-inputs"},[_c('li',{staticClass:"pc-input-item pc-input-left"},[_c('label',[_c('span',{staticClass:"pc-input-title"},[_vm._v("Relative")]),_vm._v(" "),_c('pc-block-field',{staticClass:"pc-input-field",attrs:{"prefix":_vm.isNonInferiority ? '' : '±',"suffix":"%","fieldProp":"impact","fieldValue":_vm.relativeImpact,"isReadOnly":_vm.isBlockFocused,"isBlockFocused":_vm.isBlockFocused,"enableEdit":"true"},on:{"update:fieldValue":function($event){_vm.relativeImpact=$event;},"update:field-value":function($event){_vm.relativeImpact=$event;}}})],1)]),_vm._v(" "),_c('li',{staticClass:"pc-input-item pc-input-right"},[_c('label',[_c('span',{staticClass:"pc-input-title"},[_vm._v("Absolute")]),_vm._v(" "),_c('pc-block-field',{staticClass:"pc-input-field",attrs:{"fieldProp":"impactByMetricValue","suffix":_vm.testType == 'gTest' ? '%' : '',"fieldValue":_vm.absoluteImpact,"isReadOnly":_vm.isBlockFocused,"isBlockFocused":_vm.isBlockFocused,"enableEdit":"true","aria-label":"visitors with goals"},on:{"update:fieldValue":function($event){_vm.absoluteImpact=$event;},"update:field-value":function($event){_vm.absoluteImpact=$event;}}}),_vm._v(" "),_c('span',{staticClass:"pc-input-details"},[_vm._v("\n          going from "+_vm._s(_vm.addPercentToString(_vm.baseRate))+" to either\n          "+_vm._s(_vm.addPercentToString(_vm.minAbsoluteImpact))+" or\n          "+_vm._s(_vm.addPercentToString(_vm.maxAbsoluteImpact))+"\n        ")])],1)]),_vm._v(" "),_c('li',{staticClass:"pc-input-item pc-input-bottom-left"},[_c('label',[_c('pc-block-field',{staticClass:"pc-input-field",attrs:{"fieldProp":"impactByVisitors","fieldValue":_vm.absoluteImpactPerVisitor,"isReadOnly":"true","isBlockFocused":_vm.isBlockFocused,"enableEdit":false}}),_vm._v(" "),_c('span',{staticClass:"pc-input-details"},[_vm._v("\n          "+_vm._s(_vm.testType == 'gTest'
                ? ' Incremental units'
                : ' Incremental change in the metric')+"\n        ")])],1)]),_vm._v(" "),(!_vm.onlyTotalVisitors)?_c('li',{staticClass:"pc-input-item pc-input-bottom-right"},[_c('label',[_c('pc-block-field',{attrs:{"fieldProp":"impactByVisitorsPerDay","fieldValue":_vm.absoluteImpactPerVisitorPerDay,"isReadOnly":"true","isBlockFocused":_vm.isBlockFocused,"enableEdit":false}}),_vm._v(" "),_c('span',{staticClass:"pc-input-details"},[_vm._v("\n          "+_vm._s(_vm.testType == 'gTest'
                ? ' Incremental units per day'
                : ' Incremental change in the metric per day')+"\n        ")])],1)]):_vm._e()])],1)};
  var __vue_staticRenderFns__$4 = [];

    /* style */
    const __vue_inject_styles__$4 = undefined;
    /* scoped */
    const __vue_scope_id__$4 = undefined;
    /* module identifier */
    const __vue_module_identifier__$4 = undefined;
    /* functional template */
    const __vue_is_functional_template__$4 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$4 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
      __vue_inject_styles__$4,
      __vue_script__$4,
      __vue_scope_id__$4,
      __vue_is_functional_template__$4,
      __vue_module_identifier__$4,
      false,
      undefined,
      undefined,
      undefined
    );

  //

  const DEBOUNCE$1 = 500;

  var script$3 = {
    extends: __vue_component__$6,
    template: '#base-comp',
    data: () => ({
      relativeDebouncer: null,
      absoluteDebouncer: null,
    }),
    computed: {
      FOCUS: () => FOCUS,
      isFocused: {
        get() {
          return this.focusedBlock
        },
        set(val) {
          if (val === this.blockName) {
            this.$emit('update:focusedBlock', this.blockName);
          }
        },
      },
      enabled() {
        return this.$store.getters.isNonInferiority
      },
      thresholdRelative: {
        get() {
          return this.$store.getters.relativeThreshold
        },
        set(threshold) {
          if (this.focusedBlock === FOCUS.SAMPLE) {
            if (this.relativeDebouncer != null) {
              clearTimeout(this.relativeDebouncer);
            }
            this.relativeDebouncer = setTimeout(() => {
              this.$emit('update:selected', SELECTED.RELATIVE);
              this.$store.commit('SET_THRESHOLD', {
                threshold,
                isAbsolute: false,
                lockedField: this.lockedField,
              });
            }, DEBOUNCE$1);
          }
        },
      },
      thresholdAbsolute: {
        get() {
          return this.$store.getters.absoluteThreshold
        },
        set(threshold) {
          if (this.focusedBlock === FOCUS.SAMPLE) {
            if (this.absoluteDebouncer != null) {
              clearTimeout(this.absoluteDebouncer);
            }
            this.absoluteDebouncer = setTimeout(() => {
              this.$emit('update:selected', SELECTED.ABSOLUTE);
              this.$store.commit('SET_THRESHOLD', {
                threshold,
                isAbsolute: true,
                lockedField: this.lockedField,
              });
            }, DEBOUNCE$1);
          }
        },
      },
      onlyTotalVisitors() {
        return this.$store.getters.trafficMode === TRAFFIC_MODE.TOTAL
      },
      testType() {
        return this.$store.getters.testType
      },
    },
  };

  /* script */
  const __vue_script__$3 = script$3;

  /* template */
  var __vue_render__$3 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pc-block pc-block--noninferiority",class:{
      'pc-block-focused': _vm.isBlockFocused,
      'pc-block-to-calculate': _vm.isBlockFocused,
    }},[_c('pc-svg-chain',{attrs:{"isBlockFocused":_vm.isBlockFocused}}),_vm._v(" "),_c('label',{staticClass:"pc-calc-radio pc-calc-radio--impact",class:{ 'pc-calc-radio--active': _vm.isBlockFocused },attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.isFocused),expression:"isFocused"}],attrs:{"type":"radio"},domProps:{"value":_vm.blockName,"checked":_vm._q(_vm.isFocused,_vm.blockName)},on:{"change":function($event){_vm.isFocused=_vm.blockName;}}}),_vm._v("\n    "+_vm._s(_vm.isBlockFocused ? 'Calculating' : 'Calculate')+"\n  ")]),_vm._v(" "),_c('div',{staticClass:"pc-header"},[_vm._v("Acceptable Cost")]),_vm._v(" "),_c('ul',{staticClass:"pc-inputs"},[_c('li',{staticClass:"pc-input-item pc-input-left"},[_c('label',[_vm._m(0),_vm._v(" "),_c('pc-block-field',{staticClass:"pc-input-field",attrs:{"fieldProp":"thresholdRelative","suffix":"%","fieldValue":_vm.thresholdRelative,"isBlockFocused":_vm.isBlockFocused,"isReadOnly":_vm.isBlockFocused,"enableEdit":"true"},on:{"update:fieldValue":function($event){_vm.thresholdRelative=$event;},"update:field-value":function($event){_vm.thresholdRelative=$event;}}})],1)]),_vm._v(" "),_c('li',{staticClass:"pc-input-item pc-input-right"},[_c('label',[_c('span',{staticClass:"pc-input-title"},[_vm._v("Absolute\n          "),(!_vm.onlyTotalVisitors)?_c('small',{staticClass:"pc-input-sub-title"},[_vm._v("impact per day")]):_vm._e()]),_vm._v(" "),_c('pc-block-field',{staticClass:"pc-input-field",attrs:{"fieldProp":"thresholdAbsolute","suffix":"","fieldValue":_vm.thresholdAbsolute,"isBlockFocused":_vm.isBlockFocused,"isReadOnly":_vm.isBlockFocused,"enableEdit":"true"},on:{"update:fieldValue":function($event){_vm.thresholdAbsolute=$event;},"update:field-value":function($event){_vm.thresholdAbsolute=$event;}}})],1)])])],1)};
  var __vue_staticRenderFns__$3 = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticClass:"pc-input-title"},[_vm._v("Relative "),_c('small',{staticClass:"pc-input-sub-title"},[_vm._v("change")])])}];

    /* style */
    const __vue_inject_styles__$3 = function (inject) {
      if (!inject) return
      inject("data-v-199efaae_0", { source: ".pc-non-inf-select{--base-padding:5px;font-size:inherit;line-height:28px;border:none;display:block;position:relative;box-sizing:border-box;width:100%;filter:drop-shadow(0 4px 2px rgba(0, 0, 0, .1));border-radius:5px;background:var(--white);padding:var(--base-padding);overflow:hidden;-webkit-appearance:none;-moz-appearance:none;appearance:none}.pc-non-inf-select:focus{outline:0;box-shadow:inset 0 0 0 1px var(--dark-blue)}.pc-non-inf-select-wrapper{position:relative}.pc-non-inf-select-wrapper:after{--border-size:7px;content:'';position:absolute;right:5px;bottom:0;pointer-events:none;border:var(--border-size) solid transparent;border-top:var(--border-size) solid var(--gray);transform:translateY(calc(-50% - var(--border-size)/ 2))}.no-sub-title{margin:15px 0 10px 0}", map: undefined, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$3 = undefined;
    /* module identifier */
    const __vue_module_identifier__$3 = undefined;
    /* functional template */
    const __vue_is_functional_template__$3 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$3 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
      __vue_inject_styles__$3,
      __vue_script__$3,
      __vue_scope_id__$3,
      __vue_is_functional_template__$3,
      __vue_module_identifier__$3,
      false,
      createInjector,
      undefined,
      undefined
    );

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$2 = {
    template: '#pc-tooltip',
    data() {
      return {
        isTooltipShown: false,
      }
    },
    methods: {
      showTooltip(bool) {
        this.isTooltipShown = bool;
      },
    },
  };

  /* script */
  const __vue_script__$2 = script$2;

  /* template */
  var __vue_render__$2 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pc-tooltip"},[_c('div',{on:{"mouseover":function($event){return _vm.showTooltip(true)},"mouseout":function($event){return _vm.showTooltip(false)}}},[_vm._t("text")],2),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.isTooltipShown),expression:"isTooltipShown"}],staticClass:"tooltip-wrapper"},[_vm._t("tooltip")],2)])};
  var __vue_staticRenderFns__$2 = [];

    /* style */
    const __vue_inject_styles__$2 = function (inject) {
      if (!inject) return
      inject("data-v-cb374198_0", { source: ".pc-tooltip{--tooltip-background-color:var(--black);position:relative}.tooltip-wrapper{position:absolute;left:0;top:calc(100% + 10px);background:var(--tooltip-background-color);color:var(--light-gray);padding:5px;border-radius:4px;z-index:10;width:400px;white-space:normal;pointer-events:none}.tooltip-wrapper:after{--size:5px;content:'';position:absolute;left:50px;bottom:calc(100% - var(--size));transform:translate(-50%,0) rotateZ(45deg);border:var(--size) solid var(--tooltip-background-color);border-right-color:transparent;border-bottom-color:transparent}", map: undefined, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$2 = undefined;
    /* module identifier */
    const __vue_module_identifier__$2 = undefined;
    /* functional template */
    const __vue_is_functional_template__$2 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$2 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
      __vue_inject_styles__$2,
      __vue_script__$2,
      __vue_scope_id__$2,
      __vue_is_functional_template__$2,
      __vue_module_identifier__$2,
      false,
      createInjector,
      undefined,
      undefined
    );

  //

  const DEBOUNCE = 500;

  var script$1 = {
    template: '#sample-comp',
    extends: __vue_component__$6,
    data: () => ({
      sampleDebouncer: null,
      runtimeDebouncer: null,
      visitorsDebouncer: null,
    }),
    computed: {
      BLOCKED: () => BLOCKED,
      isSelected: {
        get() {
          return this.focusedBlock
        },
        set(val) {
          if (val === this.blockName) {
            this.$emit('update:focusedBlock', this.blockName);
          }
        },
      },
      sample: {
        get() {
          return this.$store.getters.sample
        },
        set(val) {
          if (this.sampleDebouncer != null) {
            clearTimeout(this.sampleDebouncer);
          }
          this.sampleDebouncer = setTimeout(() => {
            if (
              this.focusedBlock !== FOCUS.SAMPLE &&
              this.$store.getters.trafficMode === TRAFFIC_MODE.TOTAL &&
              val !== this.$store.getters.sample
            ) {
              this.$store.commit('SET_SAMPLE', {
                sample: val,
                lockedField: this.lockedField,
                focusedBlock: this.focusedBlock,
              });
            }
          }, DEBOUNCE);
        },
      },
      visitorsPerDay: {
        get() {
          return this.$store.getters.visitorsPerDay
        },
        set(val) {
          if (this.visitorsDebouncer != null) {
            clearTimeout(this.visitorsDebouncer);
          }
          this.visitorsDebouncer = setTimeout(() => {
            if (
              this.lockedField === BLOCKED.DAYS &&
              val !== this.$store.getters.visitorsPerDay
            ) {
              this.$store.commit('SET_VISITORS_PER_DAY', {
                visitorsPerDay: val,
                focusedBlock: this.focusedBlock,
                lockedField: this.lockedField,
              });
            }
          }, DEBOUNCE);
        },
      },
      runtime: {
        get() {
          return this.$store.getters.runtime
        },
        set(val) {
          if (this.runtimeDebouncer != null) {
            clearTimeout(this.runtimeDebouncer);
          }
          this.runtimeDebouncer = setTimeout(() => {
            if (
              this.lockedField === BLOCKED.VISITORS_PER_DAY &&
              val !== this.$store.getters.runtime
            ) {
              this.$store.commit('SET_RUNTIME', {
                runtime: val,
                focusedBlock: this.focusedBlock,
                lockedField: this.lockedField,
              });
            }
          }, DEBOUNCE);
        },
      },
      onlyTotalVisitors() {
        return this.$store.getters.trafficMode === TRAFFIC_MODE.TOTAL
      },
      isNonInferiority() {
        return this.$store.getters.isNonInferiority
      },
    },
    methods: {
      switchLockedField() {
        if (this.lockedField === BLOCKED.DAYS) {
          this.$emit('update:lockedField', BLOCKED.VISITORS_PER_DAY);
        } else {
          this.$emit('update:lockedField', BLOCKED.DAYS);
        }
      },
      getLockedStateClass(param) {
        return this.lockedField == param
          ? 'pc-value-field--locked'
          : 'pc-value-field--unlocked'
      },
    },
  };

  /* script */
  const __vue_script__$1 = script$1;

  /* template */
  var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pc-block pc-block--sample",class:{
      'pc-block-focused': _vm.isBlockFocused,
      'pc-block-to-calculate': _vm.isBlockFocused,
    }},[_c('pc-svg-chain',{attrs:{"isBlockFocused":_vm.isBlockFocused}}),_vm._v(" "),_c('label',{staticClass:"pc-calc-radio pc-calc-radio--sample",class:{ 'pc-calc-radio--active': _vm.isBlockFocused },attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.isSelected),expression:"isSelected"}],attrs:{"type":"radio"},domProps:{"value":_vm.blockName,"checked":_vm._q(_vm.isSelected,_vm.blockName)},on:{"change":function($event){_vm.isSelected=_vm.blockName;}}}),_vm._v("\n    "+_vm._s(_vm.isBlockFocused ? 'Calculating' : 'Calculate')+"\n  ")]),_vm._v(" "),_c('div',{staticClass:"pc-header"},[_vm._v("Sample Size")]),_vm._v(" "),_c('ul',{staticClass:"pc-inputs",class:{ 'pc-inputs-no-grid': _vm.onlyTotalVisitors }},[_c('li',{staticClass:"pc-input-item pc-input-left"},[_c('label',[_vm._m(0),_vm._v(" "),_c('pc-block-field',{attrs:{"fieldProp":"sample","fieldValue":_vm.sample,"isReadOnly":!(_vm.onlyTotalVisitors && !_vm.isBlockFocused),"enableEdit":_vm.onlyTotalVisitors || _vm.isBlockFocused},on:{"update:fieldValue":function($event){_vm.sample=$event;},"update:field-value":function($event){_vm.sample=$event;}}})],1)]),_vm._v(" "),_c('li',{staticClass:"pc-input-item pc-input-right pc-value-field--lockable",class:[
          _vm.getLockedStateClass(_vm.BLOCKED.VISITORS_PER_DAY),
          { 'pc-hidden': _vm.onlyTotalVisitors } ]},[_c('label',[_vm._m(1),_vm._v(" "),_c('pc-block-field',{attrs:{"fieldProp":"visitorsPerDay","fieldValue":_vm.visitorsPerDay,"isReadOnly":_vm.lockedField === _vm.BLOCKED.VISITORS_PER_DAY,"isBlockFocused":_vm.isBlockFocused,"enableEdit":"true","lockedField":_vm.lockedField},on:{"update:fieldValue":function($event){_vm.visitorsPerDay=$event;},"update:field-value":function($event){_vm.visitorsPerDay=$event;}}})],1),_vm._v(" "),_c('button',{staticClass:"pc-swap-button",attrs:{"type":"button"},on:{"click":_vm.switchLockedField}},[_c('svg',{attrs:{"width":"20px","height":"20px","viewBox":"0 0 20 20","version":"1.1","xmlns":"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink"}},[_c('desc',[_vm._v("\n            Lock\n            "+_vm._s(_vm.lockedField === _vm.BLOCKED.DAYS
                  ? 'number of days'
                  : 'visitors per day')+"\n          ")]),_vm._v(" "),_c('defs',[_c('circle',{attrs:{"id":"path-1","cx":"13","cy":"13","r":"10"}}),_vm._v(" "),_c('filter',{attrs:{"x":"-5.0%","y":"-5.0%","width":"110.0%","height":"110.0%","filterUnits":"objectBoundingBox","id":"filter-2"}},[_c('feGaussianBlur',{attrs:{"stdDeviation":"0.5","in":"SourceAlpha","result":"shadowBlurInner1"}}),_vm._v(" "),_c('feOffset',{attrs:{"dx":"0","dy":"1","in":"shadowBlurInner1","result":"shadowOffsetInner1"}}),_vm._v(" "),_c('feComposite',{attrs:{"in":"shadowOffsetInner1","in2":"SourceAlpha","operator":"arithmetic","k2":"-1","k3":"1","result":"shadowInnerInner1"}}),_vm._v(" "),_c('feColorMatrix',{attrs:{"values":"0 0 0 0 0.489716199   0 0 0 0 0.489716199   0 0 0 0 0.489716199  0 0 0 0.5 0","type":"matrix","in":"shadowInnerInner1"}})],1)]),_vm._v(" "),_c('g',{attrs:{"id":"Page-1","stroke":"none","stroke-width":"1","fill":"none","fill-rule":"evenodd"}},[_c('g',{attrs:{"id":"Power-Calculator","transform":"translate(-550.000000, -522.000000)"}},[_c('g',{attrs:{"id":"Switcher","transform":"translate(547.000000, 519.000000)"}},[_c('g',{attrs:{"id":"Oval-3"}},[_c('use',{attrs:{"fill":"#EFEFEF","fill-rule":"evenodd","xlink:href":"#path-1"}}),_vm._v(" "),_c('use',{attrs:{"fill":"black","fill-opacity":"1","filter":"url(#filter-2)","xlink:href":"#path-1"}})]),_vm._v(" "),_c('g',{attrs:{"id":"Group","stroke-width":"1","fill-rule":"evenodd","transform":"translate(7.000000, 7.000000)","fill":"#155EAB"}},[_c('path',{attrs:{"d":"M4.5,4.20404051 L4.5,9.9127641 L2.5,9.9127641 L2.5,4.20404051 L0.5,4.20404051 L3.5,0.70872359 L6.5,4.20404051 L4.5,4.20404051 Z","id":"Combined-Shape"}}),_vm._v(" "),_c('path',{attrs:{"d":"M9.5,5.49531692 L9.5,11.2040405 L7.5,11.2040405 L7.5,5.49531692 L5.5,5.49531692 L8.5,2 L11.5,5.49531692 L9.5,5.49531692 Z","id":"Combined-Shape","transform":"translate(8.500000, 6.602020) scale(1, -1) translate(-8.500000, -6.602020) "}})])])])])])])]),_vm._v(" "),_c('li',{staticClass:"pc-input-item pc-input-right-swap pc-value-field--lockable",class:[
          _vm.getLockedStateClass(_vm.BLOCKED.DAYS),
          { 'pc-hidden': _vm.onlyTotalVisitors } ]},[_c('label',[_c('pc-block-field',{attrs:{"fieldProp":"runtime","prefix":"","suffix":" days","fieldValue":_vm.runtime,"isReadOnly":_vm.lockedField === _vm.BLOCKED.DAYS,"isBlockFocused":_vm.isBlockFocused,"enableEdit":"true","lockedField":_vm.lockedField,"aria-label":"Days"},on:{"update:fieldValue":function($event){_vm.runtime=$event;},"update:field-value":function($event){_vm.runtime=$event;}}})],1)])])],1)};
  var __vue_staticRenderFns__$1 = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticClass:"pc-input-title"},[_vm._v("Total #\n          "),_c('small',{staticClass:"pc-input-sub-title"},[_vm._v("of new visitors")])])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{staticClass:"pc-input-title"},[_vm._v("Daily #\n          "),_c('small',{staticClass:"pc-input-sub-title"},[_vm._v("of new visitors")])])}];

    /* style */
    const __vue_inject_styles__$1 = function (inject) {
      if (!inject) return
      inject("data-v-03548728_0", { source: ".pc-swap-button{-webkit-appearance:none;background:0 0;border:0;margin:0;padding:0;position:absolute;top:calc(100% - 10px);left:5px;z-index:5}.pc-value-field--unlocked .pc-value-field-wrapper{z-index:1}.pc-block-to-calculate .pc-value-field--locked .pc-value-formatting:after,.pc-block-to-calculate .pc-value-field--locked .pc-value-formatting:before,.pc-value-field--locked .pc-value-field-wrapper,.pc-value-field--locked .pc-value-formatting:after,.pc-value-field--locked .pc-value-formatting:before{color:var(--dark-gray)}", map: undefined, media: undefined })
  ,inject("data-v-03548728_1", { source: ".pc-inputs[data-v-03548728]{grid-template-areas:'pc-input-left pc-input-right' 'pc-input-left-swap pc-input-right-swap'}.pc-input-right[data-v-03548728],.pc-input-right-swap[data-v-03548728]{position:relative}.pc-input-right-swap[data-v-03548728]{grid-area:pc-input-right-swap;margin-top:-10px;filter:drop-shadow(0 4px 2px rgba(0, 0, 0, .1)) drop-shadow(0 -4px 2px rgba(0, 0, 0, .1))}.pc-input-right-swap .pc-value-field-wrapper[data-v-03548728]{filter:none}.pc-value-formatting[data-v-03548728]:after{font-size:14px}.pc-block-to-calculate .pc-field-runtime[data-v-03548728],.pc-block-to-calculate .pc-field-visitorsPerDay[data-v-03548728]{background:var(--white)}.pc-value-field--lockable.pc-value-field--locked .pc-value-field-wrapper[data-v-03548728]{background:linear-gradient(0deg,var(--light-gray) 0,var(--white) 100%)}.pc-inputs-no-grid[data-v-03548728]{display:block}", map: undefined, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$1 = "data-v-03548728";
    /* module identifier */
    const __vue_module_identifier__$1 = undefined;
    /* functional template */
    const __vue_is_functional_template__$1 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
      __vue_inject_styles__$1,
      __vue_script__$1,
      __vue_scope_id__$1,
      __vue_is_functional_template__$1,
      __vue_module_identifier__$1,
      false,
      createInjector,
      undefined,
      undefined
    );

  //

  var script = {
    props: ['parentmetricdata'],
    data() {
      // values if parent component sends them
      const importedData = JSON.parse(JSON.stringify(this.parentmetricdata || {}));
      const data = {
        focusedBlock: importedData.calculateProp || FOCUS.SAMPLE,
        lockedField: importedData.lockedField || BLOCKED.DAYS,
        selected: importedData.selected || SELECTED.RELATIVE,
      };

      return data
    },
    created() {
      const importedData = JSON.parse(JSON.stringify(this.parentmetricdata || {}));

      if (
        importedData.lockedField &&
        Object.values(BLOCKED).includes(importedData.lockedField)
      ) {this.lockedField = importedData.lockedField;}

      if (
        importedData.focusedBlock &&
        Object.values(FOCUS).includes(importedData.focusedBlock)
      ) {this.focusedBlock = importedData.focusedBlock;}

      if (
        importedData.selected &&
        Object.values(SELECTED).includes(importedData.selected)
      ) {this.selected = importedData.selected;}

      // Import the metrics.
      this.$store.commit('SET_IMPORTED_METRICS', importedData);
      // Recalculate possible missing values.
      this.refreshValues();
      // Trigger the update event.
      this.updateMetrics();
      this.$store.subscribe(() => {
        this.updateMetrics();
      });
    },

    computed: {
      // Constants
      TEST_TYPE: () => TEST_TYPE,
      TRAFFIC_MODE: () => TRAFFIC_MODE,
      COMPARISON_MODE: () => COMPARISON_MODE,
      FOCUS: () => FOCUS,

      // Getters
      isNonInferiority: {
        get() {
          return this.$store.getters.isNonInferiority
        },
        set(val) {
          this.$store.commit('SET_IS_NON_INFERIORITY', val);
          this.refreshValues();
          this.updateMetrics();
        },
      },
      falsePositiveRate: {
        get() {
          return this.$store.getters.falsePositiveRate
        },
        set(val) {
          this.$store.commit('SET_FALSE_POSITIVE_RATE', val);
          this.refreshValues();
          this.updateMetrics();
        },
      },
      power: {
        get() {
          return this.$store.getters.targetPower
        },
        set(val) {
          this.$store.commit('SET_TARGET_POWER', val);
          this.refreshValues();
          this.updateMetrics();
        },
      },
      variants: {
        get() {
          return this.$store.getters.variants
        },
        set(val) {
          this.$store.commit('SET_VARIANTS', val);
          this.refreshValues();
          this.updateMetrics();
        },
      },
      testType: {
        get() {
          return this.$store.getters.testType
        },
        set(val) {
          this.$store.commit('SET_TEST_TYPE', {
            testType: val,
            focused: this.focusedBlock,
            lockedField: this.lockedField,
          });
          this.updateMetrics();
        },
      },
      comparisonMode: {
        get() {
          return this.$store.getters.comparisonMode
        },
        set(val) {
          this.$store.commit('SET_COMPARISON_MODE', val);
          this.refreshValues();
          this.updateMetrics();
        },
      },
      trafficMode: {
        get() {
          return this.$store.getters.trafficMode
        },
        set(val) {
          this.$store.commit('SET_TRAFFIC_MODE', val);
          this.refreshValues();
          this.updateMetrics();
        },
      },
    },
    methods: {
      refreshValues() {
        this.$store.commit('SET_BASE_RATE', {
          baseRate: this.$store.getters.baseRate,
          lockedField: this.lockedField,
          focusedBlock: this.focusedBlock,
        });
      },
      updateMetrics() {
        this.$emit('update:metricdata', {
          testType: this.$store.getters.testType,
          focusedBlock: this.focusedBlock,
          sample: this.$store.getters.sample,
          baseRate: this.$store.getters.baseRate,
          impact: this.$store.getters.relativeImpact,
          absoluteImpact: this.$store.getters.absoluteImpact,
          targetPower: this.$store.getters.targetPower,
          falsePositiveRate: this.$store.getters.falsePositiveRate,
          standardDeviation: this.$store.getters.standardDeviation,
          runtime: this.$store.getters.runtime,
          visitorsPerDay: this.$store.getters.visitorsPerDay,
          threshold: this.$store.getters.thresholdRelative,
          absoluteThreshold: this.$store.getters.absoluteThreshold,
          relativeThreshold: this.$store.getters.relativeThreshold,
          variants: this.$store.getters.variants,
          comparisonMode: this.$store.getters.comparisonMode,
          trafficMode: this.$store.getters.trafficMode,
          lockedField: this.lockedField,
          selected: this.selected,
          isNonInferiority: this.$store.getters.isNonInferiority,
          // expId:              'exp_id',
        });
      },
    },

    components: {
      'pc-block-field': __vue_component__$8,
      'pc-tooltip': __vue_component__$2,
      'sample-comp': __vue_component__$1,
      'impact-comp': __vue_component__$4,
      'base-comp': __vue_component__$5,
      'non-inferiority-comp': __vue_component__$3,
    },
  };

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"power-calculator"},[_c('form',{staticClass:"pc-form",attrs:{"action":"."}},[_c('div',{staticClass:"pc-main-header"},[_c('div',{staticClass:"pc-controls-left"},[_c('div',{staticClass:"pc-test-type"},[_c('pc-tooltip',{staticClass:"pc-test-type-tooltip-wrapper"},[_c('label',{staticClass:"pc-test-type-labels",attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.testType),expression:"testType"}],attrs:{"type":"radio","name":"test-mode"},domProps:{"value":_vm.TEST_TYPE.BINOMIAL,"checked":_vm._q(_vm.testType,_vm.TEST_TYPE.BINOMIAL)},on:{"change":function($event){_vm.testType=_vm.TEST_TYPE.BINOMIAL;}}}),_vm._v("\n              Binomial Metric\n            ")]),_vm._v(" "),_c('span',{attrs:{"slot":"tooltip"},slot:"tooltip"},[_vm._v("\n              A binomial metric is one that can be only two values like 0 or\n              1, yes or no, converted or not converted\n            ")])]),_vm._v(" "),_c('pc-tooltip',{staticClass:"pc-test-type-tooltip-wrapper"},[_c('label',{staticClass:"pc-test-type-labels",attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.testType),expression:"testType"}],attrs:{"type":"radio","name":"test-mode"},domProps:{"value":_vm.TEST_TYPE.CONTINUOUS,"checked":_vm._q(_vm.testType,_vm.TEST_TYPE.CONTINUOUS)},on:{"change":function($event){_vm.testType=_vm.TEST_TYPE.CONTINUOUS;}}}),_vm._v("\n              Continuous Metric\n            ")]),_vm._v(" "),_c('span',{attrs:{"slot":"tooltip"},slot:"tooltip"},[_vm._v("\n              A continuous metric is one that can be any number like time on\n              site or the number of rooms sold\n            ")])])],1),_vm._v(" "),_c('div',{staticClass:"pc-traffic-mode"},[_c('label',{staticClass:"pc-traffic-mode-labels",attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.trafficMode),expression:"trafficMode"}],attrs:{"type":"radio","name":"traffic-mode","checked":""},domProps:{"value":_vm.TRAFFIC_MODE.DAILY,"checked":_vm._q(_vm.trafficMode,_vm.TRAFFIC_MODE.DAILY)},on:{"change":function($event){_vm.trafficMode=_vm.TRAFFIC_MODE.DAILY;}}}),_vm._v("\n            Daily traffic\n          ")]),_vm._v(" "),_c('label',{staticClass:"pc-traffic-mode-labels",attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.trafficMode),expression:"trafficMode"}],attrs:{"type":"radio","name":"traffic-mode"},domProps:{"value":_vm.TRAFFIC_MODE.TOTAL,"checked":_vm._q(_vm.trafficMode,_vm.TRAFFIC_MODE.TOTAL)},on:{"change":function($event){_vm.trafficMode=_vm.TRAFFIC_MODE.TOTAL;}}}),_vm._v("\n            Total traffic\n          ")])]),_vm._v(" "),_c('div',{staticClass:"pc-non-inferiority"},[_c('label',{staticClass:"pc-non-inf-label"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.isNonInferiority),expression:"isNonInferiority"}],attrs:{"type":"checkbox"},domProps:{"checked":Array.isArray(_vm.isNonInferiority)?_vm._i(_vm.isNonInferiority,null)>-1:(_vm.isNonInferiority)},on:{"change":function($event){var $$a=_vm.isNonInferiority,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.isNonInferiority=$$a.concat([$$v]));}else {$$i>-1&&(_vm.isNonInferiority=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.isNonInferiority=$$c;}}}}),_vm._v("\n            Use non inferiority test\n          ")])]),_vm._v(" "),_c('div',{staticClass:"pc-comparison-mode"},[_c('label',{staticClass:"pc-comparison-mode-labels",attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.comparisonMode),expression:"comparisonMode"}],attrs:{"type":"radio","name":"comparison-mode"},domProps:{"value":_vm.COMPARISON_MODE.ALL,"checked":_vm._q(_vm.comparisonMode,_vm.COMPARISON_MODE.ALL)},on:{"change":function($event){_vm.comparisonMode=_vm.COMPARISON_MODE.ALL;}}}),_vm._v("\n            Base vs All variants\n          ")]),_vm._v(" "),_c('label',{staticClass:"pc-traffic-mode-labels",attrs:{"slot":"text"},slot:"text"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.comparisonMode),expression:"comparisonMode"}],attrs:{"type":"radio","name":"comparison-mode"},domProps:{"value":_vm.COMPARISON_MODE.ONE,"checked":_vm._q(_vm.comparisonMode,_vm.COMPARISON_MODE.ONE)},on:{"change":function($event){_vm.comparisonMode=_vm.COMPARISON_MODE.ONE;}}}),_vm._v("\n            Base vs One variant\n          ")])])]),_vm._v(" "),_vm._m(0),_vm._v(" "),_c('div',{staticClass:"pc-controls-right"},[_c('label',{staticClass:"pc-variants"},[_c('pc-block-field',{staticClass:"pc-variants-input",attrs:{"fieldProp":"variants","prefix":"base + ","fieldValue":_vm.variants,"enableEdit":"true"},on:{"update:fieldValue":function($event){_vm.variants=$event;},"update:field-value":function($event){_vm.variants=$event;}}}),_vm._v("\n          variant"+_vm._s(_vm.variants > 1 ? 's' : '')+"\n        ")],1),_vm._v(" "),_c('label',{staticClass:"pc-false-positive"},[_c('pc-block-field',{staticClass:"pc-false-positive-input",class:{ 'pc-top-fields-error': _vm.falsePositiveRate > 10 },attrs:{"suffix":"%","fieldProp":"falsePositiveRate","fieldValue":_vm.falsePositiveRate,"enableEdit":"true"},on:{"update:fieldValue":function($event){_vm.falsePositiveRate=$event;},"update:field-value":function($event){_vm.falsePositiveRate=$event;}}}),_vm._v("\n          false positive rate\n        ")],1),_vm._v(" "),_c('label',{staticClass:"pc-power"},[_c('pc-block-field',{staticClass:"pc-power-input",class:{ 'pc-top-fields-error': _vm.power < 80 },attrs:{"suffix":"%","fieldProp":"power","fieldValue":_vm.power,"enableEdit":"true"},on:{"update:fieldValue":function($event){_vm.power=$event;},"update:field-value":function($event){_vm.power=$event;}}}),_vm._v("\n          power\n        ")],1)])]),_vm._v(" "),_c('div',{staticClass:"pc-blocks-wrapper",class:{ 'pc-blocks-wrapper-ttest': _vm.testType == 'tTest' }},[_c('base-comp',{attrs:{"blockName":_vm.FOCUS.BASE,"focusedBlock":_vm.focusedBlock,"lockedField":_vm.lockedField}}),_vm._v(" "),_c('sample-comp',{attrs:{"blockName":_vm.FOCUS.SAMPLE,"focusedBlock":_vm.focusedBlock,"lockedField":_vm.lockedField},on:{"update:focusedBlock":function($event){_vm.focusedBlock=$event;},"update:focused-block":function($event){_vm.focusedBlock=$event;},"update:lockedField":function($event){_vm.lockedField=$event;},"update:locked-field":function($event){_vm.lockedField=$event;}}}),_vm._v(" "),(!_vm.isNonInferiority)?_c('impact-comp',{attrs:{"blockName":_vm.FOCUS.IMPACT,"focusedBlock":_vm.focusedBlock,"lockedField":_vm.lockedField},on:{"update:focusedBlock":function($event){_vm.focusedBlock=$event;},"update:focused-block":function($event){_vm.focusedBlock=$event;},"update:selected":function($event){_vm.selected = $event;}}}):_vm._e(),_vm._v(" "),(_vm.isNonInferiority)?_c('non-inferiority-comp',{attrs:{"blockName":_vm.FOCUS.IMPACT,"focusedBlock":_vm.focusedBlock,"lockedField":_vm.lockedField},on:{"update:focusedBlock":function($event){_vm.focusedBlock=$event;},"update:focused-block":function($event){_vm.focusedBlock=$event;},"update:selected":function($event){_vm.selected = $event;}}}):_vm._e()],1)])])};
  var __vue_staticRenderFns__ = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pc-title"},[_vm._v("\n        Power Calculator "),_c('sup',{staticStyle:{"color":"#f00","font-size":"11px"}},[_vm._v("β")])])}];

    /* style */
    const __vue_inject_styles__ = function (inject) {
      if (!inject) return
      inject("data-v-d7936b7e_0", { source: ".power-calculator{--white:#fff;--black:#000;--gray:#b5b5b5;--light-gray:#f0f0f0;--dark-gray:#525252;--light-blue:#c1cfd8;--pale-blue:#7898ae;--blue:#155eab;--dark-blue:#3d78df;--light-yellow:#fef1cb;--dark-yellow:#e2b634;--fade-black:rgba(0, 0, 0, 0.3);--red:#f00}.pc-main-header{display:grid;grid-template-columns:33.33% 33.33% 33.33%;grid-template-rows:auto;grid-template-areas:'controls-left title controls-right';align-items:center;margin:25px 10px}.pc-controls-left{grid-area:controls-left;display:grid;grid-template-columns:min-content min-content min-content;grid-template-rows:2;grid-template-areas:'calc-options calc-options calc-options' 'test-type traffic comparison';align-items:center}.pc-controls-right{grid-area:controls-right;display:grid;grid-template-columns:auto min-content min-content;grid-template-rows:auto;grid-template-areas:'variants false-positive power';align-items:center;justify-items:end}.pc-title{grid-area:title;font-size:30px;text-align:center}.pc-traffic-mode{grid-area:traffic}.pc-comparison-mode,.pc-false-positive,.pc-non-inf-label,.pc-power,.pc-test-type,.pc-traffic-mode,.pc-variants{font-size:.8em}.pc-test-type{grid-area:test-type}.pc-non-inferiority{grid-area:calc-options;margin-bottom:8px}.pc-comparison-mode{grid-area:comparison}.pc-comparison-mode-label,.pc-non-inf-label,.pc-test-type-labels,.pc-traffic-mode-labels{white-space:nowrap}.pc-comparison-mode,.pc-non-inferiority,.pc-test-type,.pc-traffic-mode{margin-left:15px}.pc-test-type-tooltip-wrapper{display:inline-block}.pc-non-inf-label{white-space:nowrap}.pc-non-inf-treshold{display:flex;align-items:center}.pc-non-inf-treshold-input{margin-left:5px}.pc-variants{grid-area:variants;white-space:nowrap;align-self:end}.pc-false-positive{grid-area:false-positive;margin-left:15px;white-space:nowrap;align-self:end}.pc-power{grid-area:power;margin-left:15px;margin-right:15px;white-space:nowrap;align-self:end}.pc-blocks-wrapper{grid-area:pc-blocks-wrapper;display:grid;grid-template-columns:33% 33% 33%;grid-template-rows:auto;grid-template-areas:'block-base block-sample block-impact' 'block-graph block-graph block-graph';grid-template-rows:auto;grid-column-gap:8px;grid-row-gap:8px}.pc-block--base{grid-area:block-base}.pc-block--sample{grid-area:block-sample}.pc-block--impact{grid-area:block-impact}.pc-block--graph{grid-area:block-graph}.pc-block{background:var(--light-gray)}.pc-header{color:var(--white);text-align:center;font-size:28px;line-height:80px;height:80px;text-shadow:0 1px 1px rgba(0,0,0,.29);background:var(--pale-blue);margin-bottom:25px}.pc-calculate{display:inline-block;margin-bottom:25px;font-weight:700;font-size:.8em}.pc-value{display:block;margin-bottom:25px}.pc-block-to-calculate{background:var(--light-yellow)}.pc-block-to-calculate .pc-header{background:var(--dark-yellow)}.pc-hidden{display:none!important}", map: undefined, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__ = undefined;
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      createInjector,
      undefined,
      undefined
    );

  const store = {
    calculator,
  };

  var index = {
    powerCalculator: __vue_component__,
    store,
  };

  return index;

})));
