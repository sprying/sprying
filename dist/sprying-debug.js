(function() {

  // es5-safe
  // ----------------
  // Provides compatibility shims so that legacy JavaScript engines behave as
  // closely as possible to ES5.
  //
  // Thanks to:
  //  - http://es5.github.com/
  //  - http://kangax.github.com/es5-compat-table/
  //  - https://github.com/kriskowal/es5-shim
  //  - http://perfectionkills.com/extending-built-in-native-objects-evil-or-not/
  //  - https://gist.github.com/1120592
  //  - https://code.google.com/p/v8/


  var OP = Object.prototype;
  var AP = Array.prototype;
  var FP = Function.prototype;
  var SP = String.prototype;
  var hasOwnProperty = OP.hasOwnProperty;
  var slice = AP.slice;


  /*---------------------------------------*
   * Function
   *---------------------------------------*/

  // ES-5 15.3.4.5
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
  FP.bind || (FP.bind = function(that) {
    var target = this;

    // If IsCallable(func) is false, throw a TypeError exception.
    // 个人觉得没用
    if (typeof target !== 'function') {
      throw new TypeError('Bind must be called on a function');
    }

    var boundArgs = slice.call(arguments, 1);

    function bound() {
      // 返回的bind函数被当构造函数
      if (this instanceof bound) {
        var self = createObject(target.prototype);
        var result = target.apply(
            self,
            boundArgs.concat(slice.call(arguments))
        );
        // Object(result) === result 判断调用返回是不是对象
        return Object(result) === result ? result : self;
      }
      // 返回的bind函数以一般函数形式调用
      else {
        return target.apply(
            that,
            boundArgs.concat(slice.call(arguments))
        );
      }
    }

    // NOTICE: The function.length is not writable.
    //bound.length = Math.max(target.length - boundArgs.length, 0);

    return bound;
  });


  // Helpers
  function createObject(proto) {
    var o;

    if (Object.create) {
      o = Object.create(proto);
    }
    else {
      /** @constructor */
      function F() {
      }

      F.prototype = proto;
      o = new F();
    }

    return o;
  }


  /*---------------------------------------*
   * Object
   *---------------------------------------*/
  // http://ejohn.org/blog/ecmascript-5-objects-and-properties/

  // ES5 15.2.3.14
  // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
  // https://developer.mozilla.org/en/ECMAScript_DontEnum_attribute
  // http://msdn.microsoft.com/en-us/library/adebfyya(v=vs.94).aspx
  Object.keys || (Object.keys = (function() {
    var hasDontEnumBug = !{toString: ''}.propertyIsEnumerable('toString');
    var DontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var DontEnumsLength = DontEnums.length;

    return function(o) {
      if (o !== Object(o)) {
        throw new TypeError(o + ' is not an object');
      }

      var result = [];

      for (var name in o) {
        if (hasOwnProperty.call(o, name)) {
          result.push(name);
        }
      }

      if (hasDontEnumBug) {
        for (var i = 0; i < DontEnumsLength; i++) {
          if (hasOwnProperty.call(o, DontEnums[i])) {
            result.push(DontEnums[i]);
          }
        }
      }

      return result;
    };

  })());


  /*---------------------------------------*
   * Array
   *---------------------------------------*/
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array
  // https://github.com/kangax/fabric.js/blob/gh-pages/src/util/lang_array.js

  // ES5 15.4.3.2
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
  Array.isArray || (Array.isArray = function(obj) {
    return OP.toString.call(obj) === '[object Array]';
  });


  // ES5 15.4.4.18
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
  AP.forEach || (AP.forEach = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this) {
        fn.call(context, this[i], i, this);
      }
    }
  });


  // ES5 15.4.4.19
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
  AP.map || (AP.map = function(fn, context) {
    var len = this.length >>> 0;
    var result = new Array(len);

    for (var i = 0; i < len; i++) {
      if (i in this) {
        result[i] = fn.call(context, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.20
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
  AP.filter || (AP.filter = function(fn, context) {
    var result = [], val;

    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this) {
        val = this[i]; // in case fn mutates this
        if (fn.call(context, val, i, this)) {
          result.push(val);
        }
      }
    }

    return result;
  });


  // ES5 15.4.4.16
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/every
  AP.every || (AP.every = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this && !fn.call(context, this[i], i, this)) {
        return false;
      }
    }
    return true;
  });


  // ES5 15.4.4.17
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/some
  AP.some || (AP.some = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this && fn.call(context, this[i], i, this)) {
        return true;
      }
    }
    return false;
  });


  // ES5 15.4.4.21
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
  AP.reduce || (AP.reduce = function(fn /*, initial*/) {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not an function');
    }

    var len = this.length >>> 0, i = 0, result;

    if (arguments.length > 1) {
      result = arguments[1];
    }
    else {
      do {
        if (i in this) {
          result = this[i++];
          break;
        }
        // if array contains no values, no initial value to return
        if (++i >= len) {
          throw new TypeError('reduce of empty array with on initial value');
        }
      }
      while (true);
    }

    for (; i < len; i++) {
      if (i in this) {
        result = fn.call(null, result, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.22
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
  AP.reduceRight || (AP.reduceRight = function(fn /*, initial*/) {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not an function');
    }

    var len = this.length >>> 0, i = len - 1, result;

    if (arguments.length > 1) {
      result = arguments[1];
    }
    else {
      do {
        if (i in this) {
          result = this[i--];
          break;
        }
        // if array contains no values, no initial value to return
        if (--i < 0)
          throw new TypeError('reduce of empty array with on initial value');
      }
      while (true);
    }

    for (; i >= 0; i--) {
      if (i in this) {
        result = fn.call(null, result, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.14
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/indexOf
  AP.indexOf || (AP.indexOf = function(value, from) {
    var len = this.length >>> 0;

    from = Number(from) || 0;
    from = Math[from < 0 ? 'ceil' : 'floor'](from);
    if (from < 0) {
      from = Math.max(from + len, 0);
    }

    for (; from < len; from++) {
      if (from in this && this[from] === value) {
        return from;
      }
    }

    return -1;
  });


  // ES5 15.4.4.15
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/indexOf
  AP.lastIndexOf || (AP.lastIndexOf = function(value, from) {
    var len = this.length >>> 0;

    from = Number(from) || len - 1;
    from = Math[from < 0 ? 'ceil' : 'floor'](from);
    if (from < 0) {
      from += len;
    }
    from = Math.min(from, len - 1);

    for (; from >= 0; from--) {
      if (from in this && this[from] === value) {
        return from;
      }
    }

    return -1;
  });


  /*---------------------------------------*
   * String
   *---------------------------------------*/

  // ES5 15.5.4.20
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/trim
  // http://blog.stevenlevithan.com/archives/faster-trim-javascript
  // http://jsperf.com/mega-trim-test
  SP.trim || (SP.trim = (function() {

    // http://perfectionkills.com/whitespace-deviations/
    var whiteSpaces = [

      '\\s',
      //'0009', // 'HORIZONTAL TAB'
      //'000A', // 'LINE FEED OR NEW LINE'
      //'000B', // 'VERTICAL TAB'
      //'000C', // 'FORM FEED'
      //'000D', // 'CARRIAGE RETURN'
      //'0020', // 'SPACE'

      '00A0', // 'NO-BREAK SPACE'
      '1680', // 'OGHAM SPACE MARK'
      '180E', // 'MONGOLIAN VOWEL SEPARATOR'

      '2000-\\u200A',
      //'2000', // 'EN QUAD'
      //'2001', // 'EM QUAD'
      //'2002', // 'EN SPACE'
      //'2003', // 'EM SPACE'
      //'2004', // 'THREE-PER-EM SPACE'
      //'2005', // 'FOUR-PER-EM SPACE'
      //'2006', // 'SIX-PER-EM SPACE'
      //'2007', // 'FIGURE SPACE'
      //'2008', // 'PUNCTUATION SPACE'
      //'2009', // 'THIN SPACE'
      //'200A', // 'HAIR SPACE'

      '200B', // 'ZERO WIDTH SPACE (category Cf)
      '2028', // 'LINE SEPARATOR'
      '2029', // 'PARAGRAPH SEPARATOR'
      '202F', // 'NARROW NO-BREAK SPACE'
      '205F', // 'MEDIUM MATHEMATICAL SPACE'
      '3000' //  'IDEOGRAPHIC SPACE'

    ].join('\\u');

    var trimLeftReg = new RegExp('^[' + whiteSpaces + ']+');
    var trimRightReg = new RegExp('[' + whiteSpaces + ']+$');

    return function() {
      return String(this).replace(trimLeftReg, '').replace(trimRightReg, '');
    }

  })());


  /*---------------------------------------*
   * Date
   *---------------------------------------*/

  // ES5 15.9.4.4
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
  Date.now || (Date.now = function() {
    return +new Date;
  });

})();

;
/**
 * Sprying框架原型
 * 为了练习正则表达式，在实现选择器时绕了些弯路
 * 2013年4月15日7:36:52 添加文档渲染完成后要执行的函数
 * 2013年4月17日20:56:59 each原型方法的回调返回false时，就停止循环
 * 2013年4月19日7:30:09 添加isFunction判断、类数组转换数组toArray
 * 2013年4月27日13:18:53 解决IE8下兼容问题
 * 2013年4月28日8:23:32 解决IE7兼容模式下，选择器问题
 * 2013年5月6日6:35:47 解决文档渲染完成的多次调用（$(function(){})），并按序执行
 * 2013年5月11日0:22:31 解决Sprying.isArray类似工具函数无法调用问题；新增extend方法
 * 2014年03月18日08:39:36 规范注释(js doc) 更改事件绑定内部实现逻辑
 * @fileOverview 封装Js基层操作的库
 * @author sprying <sprying.fang@gmail.com>
 * @version 0.1.0
 * @require es5-safe.js
 */
(function () {
    /**
     *  解决IE兼容问题，实现通用ES5标准方法
     *  @namespace nEvent
     */
    var nEvent = {
        /**
         * 返回事件触发对象
         * @returns {HTMLElement}
         */
        getTarget: function () {
            return this.target || this.srcElement;
        },
        /**
         * 阻止事件默认处理
         */
        preventDefault: function () {
            if (this.preventDefault)
                this.preventDefault();
            else
                this.returnValue = false;
        },
        /**
         * 停止冒泡
         */
        stopPropagation: function () {
            if (this.stopPropagation) {
                Event.prototype.stopPropagation.apply(this);
            } else {
                this.cancelBubble = true;
            }
        },
        /**
         * 获取相关联Dom对象
         * @returns {null|HTMLElement}
         */
        getRelatedTarget: function () {
            if (this.relatedTarget) {
                return this.relatedTarget;
            } else if (this.toElement) {
                return this.toElement;
            } else if (this.fromElement) {
                return this.fromElement;
            } else {
                return null;
            }
        },
        /**
         * 获取按键
         * @returns {Number}
         */
        getButton: function () {
            if (document.implementation.hasFeature("MouseEvents", "2.0")) {
                return this.button;
            } else {
                switch (this.button) {
                    case 0:
                    case 1:
                    case 3:
                    case 5:
                    case 7:
                        return 0;
                    case 2:
                    case 6:
                        return 2;
                    case 4:
                        return 1;
                }
            }
        },
        /**
         * 获得滚轮值
         * @returns {number}
         */
        getWheelDelta: function () {
            if (this.wheelDelta) {
                return  (browser.name == "opera" && browser.version < 9.5) ?
                    -this.wheelDelta : this.wheelDelta;
            } else {
                return -this.detail * 40;
            }
        },
        /**
         * 获得字符编码
         * @returns {Number}
         */
        getCharCode: function () {
            if (typeof this.charCode == "number") {
                return this.charCode;
            } else {
                return this.keyCode;
            }
        }
    };
    var _Sprying = window.Sprying,
        _$ = window.$,
        data_storage = {};
    /**
     * 生成选择器对象
     * @function
     */
    window.$ = window.Sprying = function (selector) {
        return new Sprying(selector);
    };

    /**
     * 解决IE7以下对class选取兼容
     * http://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
     * @param {String} searchClass
     * @param {HTMLElement} [node]
     * @param {String} [tag]
     * @returns {Array} 匹配的Dom
     */
    var getElementsByClassName = function (searchClass, node, tag) {
        if (document.getElementsByClassName) {
            var nodes = (node || document).getElementsByClassName(searchClass), result = [];
            for (var i = 0; node = nodes[i++];) {
                if (tag !== "*" && node.tagName === tag.toUpperCase()) {
                    result.push(node)
                } else {
                    result.push(node)
                }
            }
            return result
        } else {
            node = node || document;
            tag = tag || "*";
            var classes = searchClass.split(" "),
                elements = (tag === "*" && node.all) ? node.all : node.getElementsByTagName(tag),
                patterns = [],
                current,
                match,
                result = [];
            var i = classes.length;
            while (--i >= 0) {
                patterns.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
            }
            var j = elements.length;
            while (--j >= 0) {
                current = elements[j];
                match = false;
                for (var k = 0, kl = patterns.length; k < kl; k++) {
                    match = patterns[k].test(current.className);
                    if (!match)  break;
                }
                if (match)  result.push(current);
            }
            return result;
        }
    }

    /**
     * 类数组对象生成数组，过滤不存在的元素、null、undefined
     * @param {Object} arr 类数组对象
     * @returns {Array}
     * @private
     */
    var _buildArray = function (arr) {
        var ret = [], i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (!arr[i]) continue;
            ret.push(arr[i]);
        }
        return ret;
    };

    /**
     * 两数组中，找出第二个数组元素属于第一个数组任一元素的子节点
     * @param {Array} parent
     * @param {Array} children
     * @returns {Array}  从children中找出所有parent数组元素下的子节点
     * @private
     */
    var _obtainChild = function (parent, children) {
        var belongChild = [], upNode, i, i_len, j, j_len;
        for (i = 0, i_len = parent.length; i < i_len; i++) {
            if (!parent[i]) continue;
            for (j = 0, j_len = children.length; j < j_len; j++) {
                upNode = children[j];
                if (!upNode) continue;
                // arr2一层层向上找，直到为null
                while (upNode) {
                    if (upNode === parent[i]) {
                        belongChild.push(children[j]);
//                        delete arr2[j];
                        children.splice(i, 1);
                        break;
                    }
                    upNode = upNode.parentNode;
                }
            }
        }
        return belongChild;
    };

    /**
     * 获取两数组中公共的元素
     * @param {Array} arr1数组一
     * @param {Array} arr2数组二
     * @returns {Array}返回共有的元素
     * @private
     */
    var _buildCommon = function (arr1, arr2) {
        var comArray = [], i, j, i_len, j_len;
        for (i = 0, i_len = arr1.length; i < i_len; i++) {
            if (!arr1[i]) continue;
            for (j = 0, j_len = arr2.length; j < j_len; j++) {
                if (!arr2[j]) continue;
                if (arr1[i] === arr2[j]) {
                    comArray.push(arr1[i]);
                    // delete  arr2[j];
                    arr2.splice(j, 1);
                    break;
                }
            }
        }
        return comArray;
    };

    /**
     * 合并两数组
     * @param {Array} arr1 数组一
     * @param {Array} arr2 数组二
     * @returns {Array}
     * @private
     */
    var _buildUnion = function (arr1, arr2) {
        return arr1.concat(arr2);
    };
    /**
     * 选取多层限制的Dom
     * @param {String} selector 无空格的选择器字符串
     * @returns {null|Array} 匹配的Dom
     * @example _selectWord(body#aa.class.class2)
     * @private
     */
    var _selectWord = function (selector) {
        var returns = [], births, matchStr = [], isAdded = 0, selContainer = new Array(3);
        // body、tr类似这类标签,只会在首部出现
        if (/^([\w_]+)/.test(selector)) {
            matchStr = /^([\w_]+)/.exec(selector);
            births = document.getElementsByTagName(matchStr[1]);
            // 将查找后Dom放入
            selContainer[0] = Sprying.toArray(births);
        }
        // .class.app
        if (/(?:\.[\w_]+)+/.test(selector)) {
            // IE8及以下不支持getElementsByClassName方法
            if (Sprying.browser.ie && parseInt(Sprying.browser.ie) == 8) {
                births = document.querySelectorAll(selector);
            } else if (Sprying.browser.ie && parseInt(Sprying.browser.ie) < 8) {
                matchStr = /\.([\w_]+(?:\.[\w_]+)*)/.exec(selector);
                births = getElementsByClassName(matchStr[1].replace(/\./, ' '), null, null);
            } else {
                matchStr = /\.([\w_]+(?:\.[\w_]+)*)/.exec(selector);
                // 结果转换成 class app
                births = document.getElementsByClassName(matchStr[1].replace(/\./, ' '));
            }
            // 将查找后Dom放入
//            selContainer[1] = [].slice.call(births, 0);
            selContainer[1] = Sprying.toArray(births);
        }
        // #id
        if (/#([\w_]+)/.test(selector)) {
            matchStr = /#([\w_]+)/.exec(selector);
            births = document.getElementById(matchStr[1]);
            selContainer[2] = Sprying.toArray(births ? [births] : [])
        }
        // 一层层过滤，得出共有的Dom
        return selContainer.reduce(_buildCommon);
    };

    /**
     * 选取层次关系的元素
     * @param {String} arg 选择器字符
     * @returns {null|Array} 匹配的Dom
     * @example _selectBlock(body div#wrap)
     * @private
     */
    var _selectBlock = function (arg) {
        var matches, queryResults = [];
        if (typeof arg === 'string' && /\s+/.test(arg)) {
            matches = arg.trim().split(/\s+/);
            for (var i = 0, len = matches.length; i < len; i++) {
                // 拆分子字符串处理
                queryResults[i] = _selectWord(matches[i]);
            }
            // 合并每个字串查找后的结果
            return queryResults.reduce(_obtainChild);
        } else {
            return _selectWord(arg);
        }
    };

    /**
     * 缓存所有选择器Dom节点
     * @private
     */
    var _cacheDom = [];
    /**
     * Dom渲染完的回调数组缓存
     * @type {Array}
     * @private
     */
        _domLoaded_Fns = [];

    /**
     * 选择器构造函数
     * param {String} [arg] 选择器字符串
     * @constructor
     * @namespace Sprying
     */
    function Sprying(arg) {
        this.elems = [];
        this.arg = arg;
        var matches, queryResults = [];
        // 传入为Sprying对象
        if (arg.constructor === Sprying) {
            return arg;
            // 传入为字符串且逗号相隔
        } else if (typeof arg === 'string' && /^|[\s]*,[\s]*|&/.test(arg)) {
            matches = arg.trim().split(/\s*,\s*/);
            for (var i = 0, len = matches.length; i < len; i++) {
                queryResults[i] = _selectBlock(matches[i]);
            }
            this.elems = queryResults.reduce(_buildUnion);
            // 传入为Dom
        } else if (arg.nodeType) {
            this.elems.push(arg);
            // 传入为函数
        } else if (typeof arg === 'function') {
            var fnCache = _domLoaded_Fns;
            fnCache.push(arg);
            if (!Sprying.isReady){
                Sprying.isReady = true;
                Sprying.ready(function () {
                    for (var i = 0, l = fnCache.length; i < l; i++) {
                        fnCache[i]();
                    }
                });
            }
        }
        // 实现类似$('#aa')[0]访问
        for (var i = 0, len = this.elems.length; i < len; i++) {
            this[i] = this.elems[i];
        }
        this.length = this.elems.length;
    }

    Sprying.fn = Sprying.prototype = {
        /**
         * @inner
         */
        constructor: Sprying,
        /**
         * 实现绑定事件函数
         * @function
         * @param {String} type 事件类型
         * @param {Function} handler 事件回调
         * @returns {Sprying}
         */
        bind: (function(){
            var rtn,callback,innerHandler;
            /**
             * 封装事件回调
             * @param handler
             * @returns {Function}
             */
            callback = function(handler){
                return function(event){
                    var event = event ? event : window.event,
                        isBubble;
                    for (var val in nEvent) {
                        event[val] = nEvent[val];
                    }
                    isBubble = handler.call(this, event) || true;
                    if (!isBubble) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            };
            if(document.addEventListener){
                rtn = function(type,handler){
                    this.each(function(){
                        innerHandler = callback.call(this,handler);
                        this.addEventListener(type, innerHandler, false);
                    });
                    return this;
                }
            }else if(document.attachEvent){
                rtn = function(type,handler){
                    this.each(function(){
                        innerHandler = callback.call(this,handler);
                        this.attachEvent("on" + type, innerHandler);
                    })
                    return this;
                }
            }else{
                rtn = function(type,handler){
                    this.each(function(){
                        innerHandler = callback.call(this,handler);
                        this["on" + type] = innerHandler;
                    })
                    return this;
                }
            }
            return rtn;
        })(),
        /**
         * 返回Dom对象
         * @param index
         * @returns {Element|null}
         */
        get: function (index) {
            return this.elems[index] || null;
        },
        /**
         * 针对选择的的每个Dom节点，迭代应用回调
         * @param {Function} fns 回调返回false时，停止迭代
         * @returns {Sprying}
         */
        each: function (fns) {
            for (var i = 0, l = this.elems.length; i < l; i++) {
                // 回调返回false,则跳出循环
                if (!(fns.call(this.elems[i], i) || true))
                    return this;
            }
            return this;
        },
        /**
         * 比较两选择器选中内容是否一样
         * @param {*} arg
         * @returns {boolean}
         */
        is: function (arg) {
            if (this.length == (_buildCommon(this.elems, new Sprying(arg))).length)
                return true;
            return false;
        },
        data: function (name, data) {
            this.each(function () {

            })
        }
    }
    /**
     * 类数组判断
     * @param {*} 待判断的对象
     * @returns {boolean}
     */
    Sprying.isArrayLike = function (o) {
        if (o &&
            typeof o === 'object' &&
            o.nodeType != 3 &&
            isFinite(o.length) &&
            o.length >= 0 &&
            o.length === Math.floor(o.length) &&
            o.length < 4294967296)
            return true;
        else
            return false;
    };
    /**
     * 数组判断
     * @param {*} 待判断的对象
     * @returns {boolean}
     */
    Sprying.isArray = function (o) {
        return typeof o === "object" &&
            Object.prototype.toString.call(o) === "[object Array]";
    };
    /**
     * 函数判断
     * @param o待判断的对象
     * @returns {boolean}
     */
    Sprying.isFunction = function (o) {
        return Object.prototype.toString.call(o) === "[object Function]";
    };
    /**
     * 转换成数组
     * @param {*} seq 要转换成数组的对象
     * @returns {Array}
     */
    Sprying.toArray = function (seq) {
        var arr = new Array(seq.length);
        for (var i = seq.length; i-- > 0;)
            if (i in seq)
                arr[i] = seq[i];
        return arr;
    };

    /**
     * 以对象形式返回浏览器信息
     * @namespace Sprying.browser
     */
    Sprying.browser = (function () {
        var s = navigator.userAgent.toLowerCase()

        var match = /(webkit)[\/]([\w.]+)/.exec(s) ||
            /(opera)(?:.*version)?[\/]([\w.]+)/.exec(s) ||
            /(msie)([\w.]+)/.exec(s) ||
            !/compatible/.test(s) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(s) ||
            [];
        return {
            /**
             * memberOf Sprying.browser
             * @type {String}
             */
            name: match[1] || "",
            /**
             * memberOf Sprying.browser
             * @type {String}
             */
            version: match[2] || "0"
        }
    })();
    /**
     * ie equals one of false|6|7|8|9 values, ie5 is fucked down.
     * Based on the method: https://gist.github.com/527683
     * @type {Number|Boolean}
     */
    Sprying.browser.ie = function () {
        var v = 4, //原作者的此处代码是3，考虑了IE5的情况，我改为4。
            div = document.createElement('div'),
            i = div.getElementsByTagName('i');
        do {
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
        } while (i[0]);
        return v > 5 ? v : false; //如果不是IE，返回false。
    }();

    /**
     * 是否严格模式
     * @type {Boolean}
     */
    Sprying.isStrict = (function () {
        return !this;
    })();

    /**
     * Dom渲染完成后执行fn
     * http://www.planabc.net/2009/07/30/adddomloadevent/
     * @param fn
     */
    Sprying.ready = function (fn) {
        var done = false,
        // only fire once
            init = function () {
                if (!done) {
                    done = true;
                    fn();
                }
            };
        // polling for no errors
        (function () {
            try {
                // throws errors until after ondocumentready
                document.documentElement.doScroll('left');
            } catch (e) {
                setTimeout(arguments.callee, 50);
                return;
            }
            // no errors, fire
            init();
        })();
        // trying to always fire before onload
        document.onreadystatechange = function () {
            if (document.readyState == 'complete') {
                document.onreadystatechange = null;
                init();
            }
        };
    };
    /**
     * 还原变量命名空间
     * @param {boolean}arg 是否还原引入Sprying框架前的Sprying值
     * @returns {Function}
     */
    Sprying.noConfict = function (arg) {
        window.$ = _$;
        if (arg) {
            window.Sprying = _Sprying;
        }
        return function (str) {
            return new Sprying(str);
        }
    }

    Sprying.isNumber = function (value) {
        return !isNaN(value) && typeof value == 'number';
    };
    /**
     * 获取参数类型
     * 对象直接量、Object.create、自定义构造函数的类属性皆为Object;
     * 识别出原生类型 （内置构造函数和宿主对象）
     * @function
     * @inner
     */
    function classOf(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    /**
     * 返回函数的名字，可能为空串；不是函数，返回null
     * @function
     * @inner
     */
    Function.prototype.getName = function () {
        if ("name" in this) return this.name;
        return this.name = this.toString().match(/function\s*([^(]*)\(/)[1];
    };
    /**
     * 判断传入对象的类型，可识别出自定义类型
     * @param {*} o 基本数据类型、自定义类型
     * returns {String}
     */
    Sprying.type = function (o) {
        var t, c, n;
        // 处理null值特殊情形
        if (o === null) return "null";
        // NaN：和自身值不相等
        if (o !== o) return "NaN";
        // 识别出原生值类型和函数、undefined null|NaN|undefined|string|number|boolean
        // if ((t = typeof o) !== "object") return t;
        if (o === undefined) return undefined;
        // 识别出原生类型
        if ((c = classOf(o)) !== "Object") return c;
        // 返回自定义类型构造函数名字
        if (o.constructor && typeof o.constructor === "function" &&
            (n = o.constructor.getName()))
            return n;
        return "Object";
    };

    /**
     * 复制对象属性
     * @param {Object} obj1 对象一
     * @param {Object} [obj2] 对象二
     */
    Sprying.extend = function(obj1,/*{object,optional}*/obj2){
            for(var i= 1,l=arguments.length;i<l;i++){
                var obj_from = arguments[i];
                for(var pro in obj_from){
                    if(!obj_from[pro]) continue;
                    obj1[pro] = obj_from[pro];
                }
            }
        if(arguments.length === 1){
            for(var pro in obj){
                if(!obj[pro]) continue;
                this[pro] = obj[pro];
            }
        }
    };
    Sprying.fn.extend = Sprying.extend;
    Sprying.extend(window.Sprying,/**@lends window.Sprying*/Sprying);
})();
