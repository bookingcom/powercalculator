
/** MIT licence */
/** https://github.com/bookingcom/powercalculator */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('powercalculator', factory) :
    (global = global || self, global.powercalculator = factory());
}(this, (function () { 'use strict';

    var _impact = {
        getGraphYTicks () {
            let impact = isNaN(this.impact) ? 0 : this.impact,
                arr = [impact/1.50, impact/1.25, impact, impact*1.25, impact*1.50];
            return arr
        },
        getGraphYTicksFormatted (y) {
            let num = window.parseFloat(y);
            if ((num % 1) !== 0) {
                num = num.toFixed(2);
            }

            if (isNaN(num)) {
                num = 0;
            }

            return `${num}%`
        },
        updateClonedValues (clonedObj, value) {
            clonedObj.effect_size = this.$store.getters.extractValue('impact', value);

            return clonedObj;
        },
        getCurrentYValue () {
            return this.impact
        },
        getGraphXTicksFormatted (x) {
            let result = x;

            result += '%';

            return result
        },
    };

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
        jStat[func] = function(a, b, c) {
          if (!(this instanceof arguments.callee))
            return new arguments.callee(a, b, c);
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
            return alpha;
        }

        return 1 - (Math.pow(1-alpha, 1/variants));
    }

    // SOLVING FOR POWER
    function solveforpower_Gtest(data) {
        var { base_rate, effect_size } = data;
        var mean_var = base_rate*(1+effect_size);
        data.variance = base_rate*(1-base_rate) + mean_var*(1-mean_var);

        return solve_for_power(data);
    }

    function solveforpower_Ttest(data) {
        var { sd_rate } = data;
        data.variance = 2*sd_rate**2;

        return solve_for_power(data);
    }

    function solve_for_power(data) {
        var {total_sample_size, base_rate, variance, effect_size, alpha, variants, alternative, mu} = data;
        var sample_size = total_sample_size / (1 + variants);

        var mean_base = base_rate;
        var mean_var = base_rate * (1+effect_size);

        var mean_diff = mean_var - mean_base;
        var delta = mean_diff - mu;

        var z = jstat.normal.inv(1-alpha/2, 0, 1);
        var mean = delta*Math.sqrt(sample_size/variance);

        var power;
        if (alternative == 'lower') {
            power = jstat.normal.cdf(jstat.normal.inv(alpha, 0, 1), mean, 1);
        } else if (alternative == 'greater') {
            power = 1-jstat.normal.cdf(jstat.normal.inv(1-alpha, 0, 1), mean, 1);
        } else {
            power = 1 - (jstat.normal.cdf(z, mean, 1) - jstat.normal.cdf(-z, mean, 1));
       }

        return power;
    }


    function is_valid_input(data) {
        var { base_rate, effect_size, alternative, opts, mu } = data;
        var change = effect_size*base_rate;
        if (typeof(mu) != 'undefined') {
            if (alternative == 'greater' && mu >= change) {
                return false;
            }
            if (alternative == 'lower' && mu <= change) {
                return false;
            }
         }

         if (opts && opts.type == 'relative') {
            if (alternative == 'greater' && opts.threshold >= effect_size) {
                return false;
            }
            if (alternative == 'lower' && opts.threshold <= effect_size) {
                return false;
            }
         }

         if (opts && opts.type == 'absolutePerDay' && opts.calculating == 'days') {
            if (alternative == 'greater' && opts.threshold/opts.visitors_per_day >= change) {
                return false;
            }
            if (alternative == 'lower' && opts.threshold/opts.visitors_per_day <= change) {
                return false;
            }
         }

         return true;
    }

    // SOLVING FOR SAMPLE SIZE
    function solve_quadratic_for_sample({mean_diff, Z, days, threshold, variance}) {
        var a = mean_diff;
        if (a == 0) {
            return threshold*Math.sqrt(days)/(2*Math.sqrt(variance)*Z)
        }

        var b = Math.sqrt(variance)*Z/Math.sqrt(days);
        var c = -threshold/2;

        var det = b**2 - 4*a*c;
        if (det < 0) {
          return NaN;
        }

        var sol_h = (-b + Math.sqrt(det)) / (2*a);
        var sol_l = (-b - Math.sqrt(det)) / (2*a);

        return sol_h >= 0 ? sol_h : sol_l;
    }

    function solveforsample_Ttest(data){
        var { sd_rate } = data;
        data.variance = 2*sd_rate**2;
        return sample_size_calculation(data);
    }

    function solveforsample_Gtest(data){
        var { base_rate, effect_size } = data;
        var mean_var = base_rate*(1+effect_size);
        data.variance = base_rate*(1-base_rate) + mean_var*(1-mean_var);

        return sample_size_calculation(data);
    }

    function sample_size_calculation(data) {
        var { base_rate, variance, effect_size, alpha, beta, variants, alternative, mu, opts } = data;

        if (!is_valid_input(data)) {
            return NaN;
        }

        var mean_base = base_rate;
        var mean_var = base_rate*(1+effect_size);
        var mean_diff = mean_var - mean_base;

        var multiplier;
        var sample_one_group;
        if (opts && opts.type == 'absolutePerDay') {
            if (opts.calculating == 'visitorsPerDay') {
                var Z;
                if (alternative == "greater") {
                    Z = jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1);
                } else if (alternative == "lower") {
                    Z = jstat.normal.inv(1-beta, 0, 1) - jstat.normal.inv(alpha, 0, 1);
                } else {
                    Z = jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1);
                }
                var sqrt_visitors_per_day = solve_quadratic_for_sample({mean_diff: mean_diff, Z: Z,
                    days: opts.days, threshold: opts.threshold, variance: variance});
                sample_one_group = opts.days*sqrt_visitors_per_day**2;
            } else {
                multiplier = variance/(mean_diff*Math.sqrt(opts.visitors_per_day/2) - opts.threshold/(Math.sqrt(2*opts.visitors_per_day)))**2;
                var days;
                if (alternative == "greater" || alternative == "lower") {
                    days = multiplier * (jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1))**2;
                } else {
                    days = multiplier * (jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1))**2;
                }
                sample_one_group = days*opts.visitors_per_day/2;
            }
        } else {
            multiplier = variance/(mu - mean_diff)**2;

            if (alternative == "greater" || alternative == "lower") {
                sample_one_group = multiplier * (jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1))**2;
            } else {
                sample_one_group = multiplier * (jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1))**2;
            }
        }

        return (1+variants)*Math.ceil(sample_one_group);
    }



    // SOLVING FOR EFFECT SIZE
    function solveforeffectsize_Ttest({total_sample_size, base_rate, sd_rate, alpha, beta, variants, alternative, mu}){
        var sample_size = total_sample_size / (1 + variants);
        var variance = 2*sd_rate**2;

        var z = jstat.normal.inv(1-beta, 0, 1);
        var multiplier = Math.sqrt(variance/sample_size);
        var effect_size;
        if (alternative == "greater") {
            effect_size = mu + (z - jstat.normal.inv(alpha, 0, 1)) * multiplier;
        } else if (alternative == "lower") {
            effect_size = mu - (z - jstat.normal.inv(alpha, 0, 1)) * multiplier;
        } else {
            var delta = (z + jstat.normal.inv(1-alpha/2, 0, 1) )* multiplier;
            effect_size = mu + delta;
        }

        return effect_size/base_rate;
    }

    function solve_quadratic(Z, sample_size, control_rate, mu) {
        var a = (Z**2 + sample_size) * control_rate**2;
        var b = -(Z**2) * control_rate - 2 * (control_rate + mu) * sample_size * control_rate;
        var c = sample_size * (control_rate + mu)**2 - Z**2 * control_rate * (1-control_rate);

        var det = b**2 - 4*a*c;
        if (det < 0) {
          return [NaN, NaN];
        }

        var sol_h = (-b + Math.sqrt(det)) / (2*a);
        var sol_l = (-b - Math.sqrt(det)) / (2*a);

        return [sol_h, sol_l];
    }

    function solveforeffectsize_Gtest({total_sample_size, base_rate, alpha, beta, variants, alternative, mu}){
        var sample_size = total_sample_size / (1 + variants);

        var rel_effect_size;
        var Z;
        var solutions;
        if (alternative == "greater" || alternative == "lower") {
            Z = jstat.normal.inv(beta, 0, 1) + jstat.normal.inv(alpha, 0, 1);
            solutions = solve_quadratic(Z, sample_size, base_rate, mu);
            if (alternative == 'greater') {
                rel_effect_size = solutions[0] - 1;
            } else {
                rel_effect_size = solutions[1] - 1;
            }
        } else {
            Z = jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1);
            solutions = solve_quadratic(Z, sample_size, base_rate, mu);
            rel_effect_size = solutions[0] - 1;
        }

        return rel_effect_size;
    }


    function get_visitors_with_goals({total_sample_size, base_rate}){
        return total_sample_size * base_rate;
    }

    function get_base_rate({total_sample_size, visitors_with_goals}){
        return visitors_with_goals / total_sample_size;
    }

    function get_absolute_impact_in_metric_hash({base_rate, effect_size}) {
        let value = base_rate * effect_size;
        return {
            value,
            min: base_rate - value,
            max: base_rate + value
        }
    }

    function get_relative_impact_from_absolute({base_rate, absolute_effect_size}) {
        return ((base_rate + absolute_effect_size) / base_rate) - 1
    }

    function get_absolute_impact_in_visitors({total_sample_size, base_rate, effect_size}) {
        let absoluteImpactInMetric = get_absolute_impact_in_metric_hash({base_rate, effect_size}).value;
        return absoluteImpactInMetric * total_sample_size
    }

    function get_relative_impact_from_visitors({total_sample_size, base_rate, visitors}) {
        let absoluteImpactInMetric = visitors / total_sample_size;

        return get_relative_impact_from_absolute({
            base_rate,
            absolute_effect_size: absoluteImpactInMetric
        })
    }

    function get_mu_from_relative_difference ({threshold, base_rate}) {
        return threshold*base_rate;
    }

    function get_mu_from_absolute_per_day ({threshold, visitors_per_day}) {
        return threshold/visitors_per_day;
    }

    function get_alternative ({type}) {
        let alternative = 'two-sided';
        if (type == 'noninferiority') {
            alternative = 'greater';
        }
        return alternative;
    }

    var statFormulas = {
        gTest: {
            power: solveforpower_Gtest,
            sample: solveforsample_Gtest,
            impact: solveforeffectsize_Gtest
        },
        tTest: {
            power: solveforpower_Ttest,
            sample: solveforsample_Ttest,
            impact: solveforeffectsize_Ttest
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

    var _incrementalTrials = {
        getGraphYTicks () {
            let impact = isNaN(this.impact) ? 0 : this.impact,
                arr = [impact/1.50, impact/1.25, impact, impact*1.25, impact*1.50];

            return arr
        },
        getGraphYTicksFormatted (y) {
            let sample = this.sample,
                base = this.base,

                result = statFormulas.getAbsoluteImpactInVisitors({
                    total_sample_size: this.$store.getters.extractValue('sample', sample),
                    base_rate: this.$store.getters.extractValue('base', base),
                    effect_size: this.$store.getters.extractValue('impact', y)
                });

            return this.$store.getters.displayValue('impactByVisitors', result);
        },
        updateClonedValues (clonedObj, value) {
            clonedObj.effect_size = this.$store.getters.extractValue('impact', value);

            return clonedObj;
        },
        getCurrentYValue () {
            return this.impact
        },
        getGraphXTicksFormatted (x) {
            let { displayValue } = this,
                result = x / this.runtime;

            result = displayValue('impactByVisitors', result);
            if (result >= 1000) {
                result = window.parseInt(result / 1000) + 'k';
            }

            return result
        },
        getGraphXValueForClonedValues (clonedValues) {
            let {total_sample_size, base_rate, effect_size} = clonedValues,

                impactByVisitor = statFormulas.getAbsoluteImpactInVisitors({
                    total_sample_size,
                    base_rate,
                    effect_size,
                });

            return this.$store.getters.displayValue('impactByVisitors', impactByVisitor);
        }
    };

    var _incrementalTrialsPerDay = {
        getGraphYTicks () {
            let impact = isNaN(this.impact) ? 0 : this.impact,
                arr = [impact/1.50, impact/1.25, impact, impact*1.25, impact*1.50];

            return arr
        },
        getGraphYTicksFormatted (y) {
            let sample = this.sample,
                base = this.base,

                result = statFormulas.getAbsoluteImpactInVisitors({
                    total_sample_size: this.$store.getters.extractValue('sample', sample / this.runtime),
                    base_rate: this.$store.getters.extractValue('base', base),
                    effect_size: this.$store.getters.extractValue('impact', y)
                });

            if (isNaN(result)) {
                result = 0;
            }

            return this.$store.getters.displayValue('impactByVisitors', result);
        },
        updateClonedValues (clonedObj, value) {
            clonedObj.effect_size = this.$store.getters.extractValue('impact', value);

            return clonedObj;
        },
        getCurrentYValue () {
            return this.impact
        },
        getGraphXTicksFormatted (x) {
            let { displayValue } = this,
                result = x / this.runtime;

            result = displayValue('impactByVisitors', result);
            if (result >= 1000) {
                result = window.parseInt(result / 1000) + 'k';
            }

            return result
        },
        getGraphXValueForClonedValues (clonedValues) {
            let {total_sample_size, base_rate, effect_size} = clonedValues,

                impactByVisitor = statFormulas.getAbsoluteImpactInVisitors({
                    total_sample_size,
                    base_rate,
                    effect_size,
                });

            return this.$store.getters.displayValue('impactByVisitors', impactByVisitor);
        }
    };

    var _days = {
        getGraphXTicksFormatted (x) {
            let samplePerDay = this.sample / this.runtime,
                result = x / samplePerDay;
            result = this.$store.getters.displayValue('sample', result);
            if (result >= 1000) {
                result = window.parseInt(result / 1000) + 'k';
            }

            return result
        },
        getGraphXValueForClonedValues (clonedValues) {
            let graphX = 'sample';
            return this.$store.getters.displayValue(graphX, (this.math[graphX](clonedValues)));
        }
    };

    var _sample = {
        getGraphXTicksFormatted (x) {
            let result = x;

            result = this.$store.getters.displayValue('sample', result);
            if (result >= 1000) {
                result = window.parseInt(result / 1000) + 'k';
            }

            return result
        }
    };

    var _samplePerDay = {
        getGraphXTicksFormatted (x) {
            let result = x / this.runtime;
            result = this.$store.getters.displayValue('sample', result);
            if (result >= 1000) {
                result = window.parseInt(result / 1000) + 'k';
            }

            return result
        },
        getGraphXValueForClonedValues (clonedValues) {
            let graphX = 'sample';
            return this.$store.getters.displayValue(graphX, (this.math[graphX](clonedValues)));
        }
    };

    var _power = {
        getGraphYTicks () {
            let arr = [10, 25, 50, 75, 100];
            return arr
        },
        getGraphYTicksFormatted (y) {
            return `${y}%`
        },
        updateClonedValues (clonedObj, value) {
            clonedObj.beta = 1 - this.$store.getters.extractValue('power', value);

            return clonedObj;
        },
        getCurrentYValue () {
            return this.power
        },
        getGraphXTicksFormatted () {
            // not needed yet
        },
    };

    var _threshold = {
        getGraphYTicks () {
            let threshold = isNaN(this.$store.state.nonInferiority.threshold) ? 0 : this.$store.state.nonInferiority.threshold,
                arr = [threshold/1.50, threshold/1.25, threshold, threshold*1.25, threshold*1.50];
            return arr
        },
        getGraphYTicksFormatted (y) {
            let num = window.parseFloat(y);
            if ((num % 1) !== 0) {
                num = num.toFixed(2);
            }

            if (isNaN(num)) {
                num = 0;
            }

            const suffix = this.$store.state.nonInferiority.selected == 'relative' ? '%' : '';

            return `${num}${suffix}`
        },
        getCurrentYValue () {
            return this.$store.state.nonInferiority.threshold
        },
        updateClonedValues (clonedObj, value) {
            let { getters, state } = this.$store,
                { customMu, customOpts, customAlternative, customThresholdCorrectedValue } = getters;

            const thresholdCorrectedValue = customThresholdCorrectedValue({
                threshold: value,
                selected: state.nonInferiority.selected
            });

            const mu = customMu({
                runtime: getters.runtime,
                thresholdCorrectedValue: thresholdCorrectedValue,
                visitors_per_day: getters.visitorsPerDay,
                base_rate: getters.extractValue('base'),
            });

            const opts = customOpts({
                selected: state.nonInferiority.selected,
                lockedField: getters.lockedField,
                thresholdCorrectedValue: thresholdCorrectedValue,
                runtime: getters.runtime,
                visitorsPerDay: getters.visitorsPerDay,
            });

            const alternative = customAlternative({ type: 'noninferiority' });

            Object.assign(clonedObj, {
                mu,
                opts,
                alternative
            });

            return clonedObj;
        },
    };

    // name convention is the name used to set the graphY and graphX with a underscore before it


    var defaultConfig = {
        getGraphYTicks () {
            throw Error (`getGraphYTicks not defined for ${this.graphY}`)
        },
        getGraphYTicksFormatted () {
            throw Error (`getGraphYTicksFormatted not defined for ${this.graphY}`)
        },
        getGraphYDataSet ({amount}) {
            let yTicks = this.getGraphYTicks(),
                curYValue = this.getCurrentYValue(),
                firstTick = yTicks[0],
                lastTick = yTicks[yTicks.length - 1],
                ratio = (lastTick - firstTick) / amount,
                result = Array.from(new Array(amount));

            result = result.map((cur, i, arr) => {
                let value = firstTick + ratio * i;
                return value
            });

            // add the current value in case it isn't there
            result.push(curYValue);

            // sort current value
            result.sort((a,b) => { return a - b});

            // remove duplicates
            result = [...new Set(result)];

            return result
        },
        updateClonedValues () {
            throw Error (`updateClonedValues not defined for ${this.graphY}`)
        },
        getCurrentYValue () {
            throw Error (`getCurrentYValue not defined for ${this.graphY}`)
        },
        getGraphXTicksFormatted () {
            throw Error (`getGraphXTicksFormatted not defined for ${this.graphY}`)
        },
        getGraphXValueForClonedValues (clonedValues) {
            if (!this.math[this.graphX]) {
                throw Error (`getGraphXValueForClonedValues didn't find math formula for ${this.graphX}`)
            }
            return this.$store.getters.displayValue(this.graphX, (this.math[this.graphX](clonedValues)));
        }
    };



    var graphDataMixin = {
        beforeCreate () {
            // register configurations for metric params
            // this is done to agregate different pieces of configuration that need to work in harmony
            // for the svg graph
            Object.assign(this, {
                _sample:                    Object.assign({}, defaultConfig, _sample),
                _samplePerDay:              Object.assign({}, defaultConfig, _samplePerDay),
                _impact:                    Object.assign({}, defaultConfig, _impact),
                _incrementalTrials:         Object.assign({}, defaultConfig, _incrementalTrials),
                _power:                     Object.assign({}, defaultConfig, _power),
                _incrementalTrialsPerDay:   Object.assign({}, defaultConfig, _incrementalTrialsPerDay),
                _days:                      Object.assign({}, defaultConfig, _days),
                _threshold:                 Object.assign({}, defaultConfig, _threshold),
            });
        },
        methods: {
            getGraphYTicks () {
                return this._getGraphY().getGraphYTicks.apply(this, []);
            },
            getGraphYTicksFormatted () {
                return this._getGraphY().getGraphYTicksFormatted.apply(this, [...arguments]);
            },
            getGraphYDataSet () {
                return this._getGraphY().getGraphYDataSet.apply(this, [...arguments]);
            },
            updateClonedValues () {
                return this._getGraphY().updateClonedValues.apply(this, [...arguments]);
            },
            getCurrentYValue () {
                return this._getGraphY().getCurrentYValue.apply(this, [...arguments]);
            },
            getGraphXValueForClonedValues () {
                return this._getGraphX().getGraphXValueForClonedValues.apply(this, [...arguments]);
            },
            getGraphXTicksFormatted () {
                return this._getGraphX().getGraphXTicksFormatted.apply(this, [...arguments]);
            },
            _getGraphX () {
                let graphX = this[`_${this.graphX}`];

                if (!graphX) {
                    throw Error (`_${this.graphX} is not registered`);
                }

                return graphX
            },
            _getGraphY () {
                let graphY = this[`_${this.graphY}`];

                if (!graphY) {
                    throw Error (`_${this.graphY} is not registered`);
                }

                return graphY
            }
        }
    };

    //
    //
    //
    //
    //
    //
    //
    //

    var script = {
        props: ['graphType', 'graphX', 'graphY', 'getMetricDisplayName'],
        data () {
            return {
            }
        },
        computed: {
            graphName () {
                const graphXDisplay = this.getMetricDisplayName(this.graphX);
                const graphYDisplay = this.getMetricDisplayName(this.graphY);
                return `${graphYDisplay} / ${graphXDisplay}`
            },
            value () {
                return `${this.graphX}-${this.graphY}`
            },
            spanClass () {
                return {
                    'pc-graph-radio-selected': this.graphType == this.value
                }
            },
            graphTypeSynced: {
                get () {
                    return this.graphType
                },
                set (newValue) {
                    this.$emit('update:graphType', newValue);
                }
            }
        }
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
    const __vue_script__ = script;

    /* template */
    var __vue_render__ = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("label", { staticClass: "pc-graph-radio-label" }, [
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.graphTypeSynced,
              expression: "graphTypeSynced"
            }
          ],
          staticClass: "pc-graph-radio-input",
          attrs: { type: "radio", name: "graph" },
          domProps: {
            value: _vm.value,
            checked: _vm._q(_vm.graphTypeSynced, _vm.value)
          },
          on: {
            change: function($event) {
              _vm.graphTypeSynced = _vm.value;
            }
          }
        }),
        _vm._v(" "),
        _c("span", { staticClass: "pc-graph-radio-text", class: _vm.spanClass }, [
          _vm._v(_vm._s(_vm.graphName))
        ])
      ])
    };
    var __vue_staticRenderFns__ = [];
    __vue_render__._withStripped = true;

      /* style */
      const __vue_inject_styles__ = function (inject) {
        if (!inject) return
        inject("data-v-00ec026a_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"svg-graph-tab-item.vue"}, media: undefined });

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

    //

    let dataDefault = [
            ['x', 0, 0, 0, 0, 0, 0],
            ['Sample', 0, 0, 0, 0, 0],
            ['Current', null, null, 50]
        ];

    let style = document.createElement('style');

    style.innerHTML = `
    .pc-graph .c3-axis-y-label {
        pointer-events: none;
    }

    .pc-graph .c3-axis {
        font-size: 16px;
    }
`;

    document.querySelector('head').appendChild(style);



    var script$1 = {
        mixins: [graphDataMixin],
        props: [],
        data () {
            return {
                width: 100,
                height: 100,
                data:  this.dataDefault,
                graphType: this.getDefaultGraphOption() // x, y
                // graphX: 'sample' // computed
                // graphY: 'power' // computed
            }
        },
        computed: {
            style () {
                let { width, height } = this;

                return {
                    width: `${width}px`,
                    height: `${height}px`
                }
            },
            graphX () {
                // 'sample'
                return this.graphType.split('-')[0]
            },
            graphY () {
                // 'power'
                return this.graphType.split('-')[1]
            },
            math () {
                return this.$store.getters.formulaToSolveProp
            },
            isNonInferiorityEnabled () {
                return this.$store.state.nonInferiority.enabled
            },
            sample () {
                return this.$store.state.attributes.sample
            },
            impact () {
                return this.$store.state.attributes.impact
            },
            power () {
                return this.$store.state.attributes.power
            },
            base () {
                return this.$store.state.attributes.base
            },
            falsePosRate () {
                return this.$store.state.attributes.falsePosRate
            },
            sdRate () {
                return this.$store.state.attributes.sdRate
            },
            runtime () {
                return this.$store.state.attributes.runtime
            },
            graphList() {

                let list = [
                    {
                        name: 'days-incrementalTrialsPerDay',
                        cond: !this.isNonInferiorityEnabled
                    },
                    {
                        name: 'samplePerDay-incrementalTrials',
                        cond: !this.isNonInferiorityEnabled
                    },
                    {
                        name: 'sample-impact',
                        cond: !this.isNonInferiorityEnabled
                    },
                    {
                        name: 'sample-threshold',
                        cond: this.isNonInferiorityEnabled
                    },
                    {
                        name: 'sample-power',
                        cond: true
                    },
                    {
                        name: 'samplePerDay-power',
                        cond: true
                    },
                    {
                        name: 'impact-power',
                        cond: !this.isNonInferiorityEnabled
                    },
                ];

                return list.filter((obj) => {return obj.cond == true}).map((obj) => {
                        let [graphX, graphY] = obj.name.split('-');
                        return {
                            graphX,
                            graphY
                        }
                    })
            }
        },
        methods: {
            getDefaultGraphOption () {
                let result = 'days-incrementalTrialsPerDay';
                if (this.$store.state.nonInferiority.enabled) {
                    result = 'sample-threshold';
                }
                return result
            },
            resize () {
                let {width, paddingLeft, paddingRight} = window.getComputedStyle(this.$refs['pc-graph-size']);

                // update svg size
                this.width = window.parseInt(width) - window.parseInt(paddingLeft) - window.parseInt(paddingRight);
                this.height = 220;
            },
            createYList ({ amount, rate = 10, cur }) { //rate of 10 and amount of 10 will reach from 0 to 100
                let result = [];

                for (let i = 0; i <= amount; i += 1) {
                    let y = rate * i,
                        nextY = rate * (i + 1);

                    result.push(y);

                    if (cur > y && cur < nextY) {
                        result.push(cur);
                    }
                }

                return result;
            },
            trimInvalidSamples (newData) {
                let result = newData[0].reduce((prevArr, xValue, i) => {

                    if (i == 0) {
                        prevArr[0] = [];
                        prevArr[1] = [];
                        prevArr[2] = [];
                    }

                    // i == 0 is the name of the dataset
                    if (i == 0 || (!isNaN(xValue) && isFinite(xValue))) {
                        prevArr[0].push(newData[0][i]);
                        prevArr[1].push(newData[1][i]);
                        prevArr[2].push(newData[2][i]);
                    }

                    return prevArr;
                }, []);
                return result;
            },
            updateGraphData () {

                let clonedValues = this.deepCloneObject(this.$store.getters.convertDisplayedValues),
                    newData = this.deepCloneObject(dataDefault),
                    yList = this.getGraphYDataSet({amount: 10}),
                    curY = this.getCurrentYValue();

                // erase previous values but keep names of datasets
                newData[0].length = 1;
                newData[1].length = 1;
                newData[2].length = 1;

                yList.forEach((yValue, i) => {

                    clonedValues = this.updateClonedValues(clonedValues, yValue);

                    let xValues = this.getGraphXValueForClonedValues(clonedValues, yValue);

                     newData[0][i + 1] = xValues; // x
                     newData[1][i + 1] = yValue; // line
                     newData[2][i + 1] = yValue == curY ? yValue : null; // current power dot
                });

                newData = this.trimInvalidSamples(newData);

                this.chart.axis.labels({x: this.updateXLabel(), y: this.updateYLabel()});

                this.chart.load({
                    columns: newData
                });
            },
            deepCloneObject (obj) {
                return JSON.parse(JSON.stringify(obj))
            },
            createTooltip (V) {

                return {
                    grouped: false,
                    contents ([{x = 0, value = 0, id = ''}]) {

                        let {graphX, graphY, getMetricDisplayName, getGraphXTicksFormatted, getGraphYTicksFormatted} = V,
                            th = getMetricDisplayName(graphX),
                            name = getMetricDisplayName(graphY),
                            xFormatted = getGraphXTicksFormatted(x),
                            yFormatted = getGraphYTicksFormatted(value);

                        return `
                        <table class="c3-tooltip">
                            <tbody>
                                <tr>
                                    <th colspan="2">${th}: ${xFormatted}</th>
                                </tr>
                                <tr class="c3-tooltip-name--Current">
                                    <td class="name">
                                        <span style="background-color:#ff7f0e">
                                        </span>
                                        ${name}
                                    </td>
                                    <td class="value">${yFormatted}</td>
                                </tr>
                            </tbody>
                        </table>
                    `
                    }
                }
            },
            updateYLabel () {
                return this.getMetricDisplayName(this.graphY)
            },
            updateXLabel () {
                return this.getMetricDisplayName(this.graphX)
            },
            getMetricDisplayName (metric) {
                return {
                    sample: 'Sample',
                    impact: 'Impact',
                    power: 'Power',
                    base: 'Base',
                    falseposrate: 'False Positive Rate',
                    sdrate: 'Base Standard deviation',

                    samplePerDay: 'Daily Visitors',
                    incrementalTrials: 'Incremental Trials',

                    days: '# of days',
                    incrementalTrialsPerDay: 'Inc. Trials per day',
                    threshold: 'Non Inf. Threshold',
                }[metric] || ''
            }
        },
        watch: {
            sample () {
                this.updateGraphData();
            },
            impact () {
                this.updateGraphData();
            },
            power () {
                this.updateGraphData();
            },
            graphY () {
                this.updateGraphData();
            },
            graphX () {
                this.updateGraphData();
            },
            runtime () {
                this.updateGraphData();
            },
            isNonInferiorityEnabled (bool) {
                if (this.graphList.indexOf(this.graphType) == -1) {
                    let { graphX, graphY } = this.graphList[0];
                    this.graphType = `${graphX}-${graphY}`;
                }
            }
        },
        mounted () {
            let {resize, createTooltip} = this,
                vueInstance = this;
            resize();

            this.dataDefault = dataDefault;

            this.chart = c3.generate({
                bindto: this.$refs['pc-graph'],
                size: {
                    width: this.width,
                    height: this.height
                },
                legend: {
                    show: false
                },
                data: {
                    x: 'x',
                    columns: this.dataDefault,
                    type: 'area'
                },
                grid: {
                    x: {
                        show: true
                    },
                    y: {
                        show: true
                    }
                },
                axis: {
                    x: {
                        label:  this.updateXLabel(),
                        tick: {
                            values (minMax) {
                                let [min, max] = minMax.map((num) => {return window.parseInt(num)}),
                                    amount = 7,
                                    ratio = (max - min) / amount,
                                    result = new Array(amount + 1);

                                // create the values
                                result = Array.from(result).map((undef, i) => {
                                    return (min + (ratio * i)).toFixed(2)
                                });

                                return result
                            },
                            format (x) {
                                return vueInstance.getGraphXTicksFormatted(x)
                            }
                        }
                    },
                    y: {
                        label: this.updateYLabel(),
                        tick: {
                            values () {
                                return vueInstance.getGraphYTicks()
                            },
                            format (y) {
                                return vueInstance.getGraphYTicksFormatted(y)
                            }
                        }
                    }
                },
                padding: {
                    top: 20,
                    left: 70,
                    right: 20
                },
                tooltip: createTooltip(this)
            });

            this.updateGraphData();
        },
        components: {
            svgGraphTabItem: __vue_component__
        }
    };

    /* script */
    const __vue_script__$1 = script$1;

    /* template */
    var __vue_render__$1 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("div", { staticClass: "pc-block pc-block--graph" }, [
        _c(
          "div",
          { staticClass: "pc-graph-controls" },
          _vm._l(_vm.graphList, function(graph) {
            return _c("svgGraphTabItem", {
              key: graph.graphX + "-" + graph.graphY,
              attrs: {
                graphX: graph.graphX,
                graphY: graph.graphY,
                getMetricDisplayName: _vm.getMetricDisplayName,
                graphType: _vm.graphType
              },
              on: {
                "update:graphType": function($event) {
                  _vm.graphType = $event;
                }
              }
            })
          })
        ),
        _vm._v(" "),
        _c("div", { ref: "pc-graph-size", staticClass: "pc-graph" }, [
          _c("div", { ref: "pc-graph-wrapper", style: _vm.style }, [
            _c("div", { ref: "pc-graph" })
          ])
        ])
      ])
    };
    var __vue_staticRenderFns__$1 = [];
    __vue_render__$1._withStripped = true;

      /* style */
      const __vue_inject_styles__$1 = function (inject) {
        if (!inject) return
        inject("data-v-28a2d8b2_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n/* graph radio styles */\n.pc-graph-controls {\n    display: flex;\n    flex-direction: row;\n    padding: 30px 0 0 60px;\n    margin-bottom: 5px;\n    border-bottom: 1px solid var(--blue);\n}\n.pc-graph-radio-label {\n    position: relative;\n    font-size: 13px;\n    color: var(--blue);\n    margin-right: 20px;\n}\n.pc-graph-radio-input {\n    position: absolute;\n    visibility: hidden;\n}\n.pc-graph-radio-text {\n    display: block;\n    padding: 0 5px 15px;\n    position: relative;\n}\n.pc-graph-radio-input:checked + .pc-graph-radio-text::after {\n    content: '';\n    position: absolute;\n    left: 0;\n    bottom: 0;\n    width: 100%;\n    height: 4px;\n    background: var(--blue);\n}\n\n/* graph layout */\n.pc-graph {\n    padding: 10px;\n    width: 100%;\n    box-sizing: border-box;\n}\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/svg-graph.vue"],"names":[],"mappings":";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AAiZA,uBAAA;AACA;IACA,aAAA;IACA,mBAAA;IACA,sBAAA;IACA,kBAAA;IACA,oCAAA;AACA;AAEA;IACA,kBAAA;IACA,eAAA;IACA,kBAAA;IACA,kBAAA;AACA;AAEA;IACA,kBAAA;IACA,kBAAA;AACA;AAEA;IACA,cAAA;IACA,mBAAA;IACA,kBAAA;AACA;AAEA;IACA,WAAA;IACA,kBAAA;IACA,OAAA;IACA,SAAA;IACA,WAAA;IACA,WAAA;IACA,uBAAA;AACA;;AAEA,iBAAA;AAEA;IACA,aAAA;IACA,WAAA;IACA,sBAAA;AACA","file":"svg-graph.vue","sourcesContent":["<template id=\"svg-graph\">\n    <div class=\"pc-block pc-block--graph\">\n        <div class=\"pc-graph-controls\">\n\n            <svgGraphTabItem\n                v-for=\"graph in graphList\"\n                v-bind:key=\"graph.graphX + '-' + graph.graphY\"\n                v-bind:graphX=\"graph.graphX\"\n                v-bind:graphY=\"graph.graphY\"\n                v-bind:getMetricDisplayName=\"getMetricDisplayName\"\n                v-bind:graphType.sync=\"graphType\"\n            >\n            </svgGraphTabItem>\n\n        </div>\n        <div class=\"pc-graph\" ref=\"pc-graph-size\">\n            <div v-bind:style=\"style\" ref=\"pc-graph-wrapper\">\n                <div ref=\"pc-graph\"></div>\n            </div>\n        </div>\n    </div>\n</template>\n\n\n<script>\n/*global c3*/\n/*eslint no-undef: \"error\"*/\n\nimport graphDataMixin from '../js/graph-data-mixin.js'\nimport svgGraphTabItem from './svg-graph-tab-item.vue'\n\nlet dataDefault = [\n        ['x', 0, 0, 0, 0, 0, 0],\n        ['Sample', 0, 0, 0, 0, 0],\n        ['Current', null, null, 50]\n    ];\n\nlet style = document.createElement('style');\n\nstyle.innerHTML = `\n    .pc-graph .c3-axis-y-label {\n        pointer-events: none;\n    }\n\n    .pc-graph .c3-axis {\n        font-size: 16px;\n    }\n`;\n\ndocument.querySelector('head').appendChild(style);\n\n\n\nexport default {\n    mixins: [graphDataMixin],\n    props: [],\n    data () {\n        return {\n            width: 100,\n            height: 100,\n            data:  this.dataDefault,\n            graphType: this.getDefaultGraphOption() // x, y\n            // graphX: 'sample' // computed\n            // graphY: 'power' // computed\n        }\n    },\n    computed: {\n        style () {\n            let { width, height } = this;\n\n            return {\n                width: `${width}px`,\n                height: `${height}px`\n            }\n        },\n        graphX () {\n            // 'sample'\n            return this.graphType.split('-')[0]\n        },\n        graphY () {\n            // 'power'\n            return this.graphType.split('-')[1]\n        },\n        math () {\n            return this.$store.getters.formulaToSolveProp\n        },\n        isNonInferiorityEnabled () {\n            return this.$store.state.nonInferiority.enabled\n        },\n        sample () {\n            return this.$store.state.attributes.sample\n        },\n        impact () {\n            return this.$store.state.attributes.impact\n        },\n        power () {\n            return this.$store.state.attributes.power\n        },\n        base () {\n            return this.$store.state.attributes.base\n        },\n        falsePosRate () {\n            return this.$store.state.attributes.falsePosRate\n        },\n        sdRate () {\n            return this.$store.state.attributes.sdRate\n        },\n        runtime () {\n            return this.$store.state.attributes.runtime\n        },\n        graphList() {\n\n            let list = [\n                {\n                    name: 'days-incrementalTrialsPerDay',\n                    cond: !this.isNonInferiorityEnabled\n                },\n                {\n                    name: 'samplePerDay-incrementalTrials',\n                    cond: !this.isNonInferiorityEnabled\n                },\n                {\n                    name: 'sample-impact',\n                    cond: !this.isNonInferiorityEnabled\n                },\n                {\n                    name: 'sample-threshold',\n                    cond: this.isNonInferiorityEnabled\n                },\n                {\n                    name: 'sample-power',\n                    cond: true\n                },\n                {\n                    name: 'samplePerDay-power',\n                    cond: true\n                },\n                {\n                    name: 'impact-power',\n                    cond: !this.isNonInferiorityEnabled\n                },\n            ];\n\n            return list.filter((obj) => {return obj.cond == true}).map((obj) => {\n                    let [graphX, graphY] = obj.name.split('-');\n                    return {\n                        graphX,\n                        graphY\n                    }\n                })\n        }\n    },\n    methods: {\n        getDefaultGraphOption () {\n            let result = 'days-incrementalTrialsPerDay';\n            if (this.$store.state.nonInferiority.enabled) {\n                result = 'sample-threshold'\n            }\n            return result\n        },\n        resize () {\n            let {width, paddingLeft, paddingRight} = window.getComputedStyle(this.$refs['pc-graph-size']);\n\n            // update svg size\n            this.width = window.parseInt(width) - window.parseInt(paddingLeft) - window.parseInt(paddingRight);\n            this.height = 220;\n        },\n        createYList ({ amount, rate = 10, cur }) { //rate of 10 and amount of 10 will reach from 0 to 100\n            let result = [];\n\n            for (let i = 0; i <= amount; i += 1) {\n                let y = rate * i,\n                    nextY = rate * (i + 1);\n\n                result.push(y);\n\n                if (cur > y && cur < nextY) {\n                    result.push(cur);\n                }\n            }\n\n            return result;\n        },\n        trimInvalidSamples (newData) {\n            let result = newData[0].reduce((prevArr, xValue, i) => {\n\n                if (i == 0) {\n                    prevArr[0] = [];\n                    prevArr[1] = [];\n                    prevArr[2] = [];\n                }\n\n                // i == 0 is the name of the dataset\n                if (i == 0 || (!isNaN(xValue) && isFinite(xValue))) {\n                    prevArr[0].push(newData[0][i]);\n                    prevArr[1].push(newData[1][i]);\n                    prevArr[2].push(newData[2][i]);\n                }\n\n                return prevArr;\n            }, [])\n            return result;\n        },\n        updateGraphData () {\n\n            let clonedValues = this.deepCloneObject(this.$store.getters.convertDisplayedValues),\n                newData = this.deepCloneObject(dataDefault),\n                yList = this.getGraphYDataSet({amount: 10}),\n                curY = this.getCurrentYValue();\n\n            // erase previous values but keep names of datasets\n            newData[0].length = 1;\n            newData[1].length = 1;\n            newData[2].length = 1;\n\n            yList.forEach((yValue, i) => {\n\n                clonedValues = this.updateClonedValues(clonedValues, yValue);\n\n                let xValues = this.getGraphXValueForClonedValues(clonedValues, yValue);\n\n                 newData[0][i + 1] = xValues; // x\n                 newData[1][i + 1] = yValue; // line\n                 newData[2][i + 1] = yValue == curY ? yValue : null; // current power dot\n            })\n\n            newData = this.trimInvalidSamples(newData);\n\n            this.chart.axis.labels({x: this.updateXLabel(), y: this.updateYLabel()});\n\n            this.chart.load({\n                columns: newData\n            })\n        },\n        deepCloneObject (obj) {\n            return JSON.parse(JSON.stringify(obj))\n        },\n        createTooltip (V) {\n\n            return {\n                grouped: false,\n                contents ([{x = 0, value = 0, id = ''}]) {\n\n                    let {graphX, graphY, getMetricDisplayName, getGraphXTicksFormatted, getGraphYTicksFormatted} = V,\n                        th = getMetricDisplayName(graphX),\n                        name = getMetricDisplayName(graphY),\n                        xFormatted = getGraphXTicksFormatted(x),\n                        yFormatted = getGraphYTicksFormatted(value);\n\n                    return `\n                        <table class=\"c3-tooltip\">\n                            <tbody>\n                                <tr>\n                                    <th colspan=\"2\">${th}: ${xFormatted}</th>\n                                </tr>\n                                <tr class=\"c3-tooltip-name--Current\">\n                                    <td class=\"name\">\n                                        <span style=\"background-color:#ff7f0e\">\n                                        </span>\n                                        ${name}\n                                    </td>\n                                    <td class=\"value\">${yFormatted}</td>\n                                </tr>\n                            </tbody>\n                        </table>\n                    `\n                }\n            }\n        },\n        updateYLabel () {\n            return this.getMetricDisplayName(this.graphY)\n        },\n        updateXLabel () {\n            return this.getMetricDisplayName(this.graphX)\n        },\n        getMetricDisplayName (metric) {\n            return {\n                sample: 'Sample',\n                impact: 'Impact',\n                power: 'Power',\n                base: 'Base',\n                falseposrate: 'False Positive Rate',\n                sdrate: 'Base Standard deviation',\n\n                samplePerDay: 'Daily Visitors',\n                incrementalTrials: 'Incremental Trials',\n\n                days: '# of days',\n                incrementalTrialsPerDay: 'Inc. Trials per day',\n                threshold: 'Non Inf. Threshold',\n            }[metric] || ''\n        }\n    },\n    watch: {\n        sample () {\n            this.updateGraphData();\n        },\n        impact () {\n            this.updateGraphData();\n        },\n        power () {\n            this.updateGraphData();\n        },\n        graphY () {\n            this.updateGraphData();\n        },\n        graphX () {\n            this.updateGraphData();\n        },\n        runtime () {\n            this.updateGraphData();\n        },\n        isNonInferiorityEnabled (bool) {\n            if (this.graphList.indexOf(this.graphType) == -1) {\n                let { graphX, graphY } = this.graphList[0];\n                this.graphType = `${graphX}-${graphY}`;\n            }\n        }\n    },\n    mounted () {\n        let {resize, createTooltip} = this,\n            vueInstance = this;\n        resize();\n\n        this.dataDefault = dataDefault;\n\n        this.chart = c3.generate({\n            bindto: this.$refs['pc-graph'],\n            size: {\n                width: this.width,\n                height: this.height\n            },\n            legend: {\n                show: false\n            },\n            data: {\n                x: 'x',\n                columns: this.dataDefault,\n                type: 'area'\n            },\n            grid: {\n                x: {\n                    show: true\n                },\n                y: {\n                    show: true\n                }\n            },\n            axis: {\n                x: {\n                    label:  this.updateXLabel(),\n                    tick: {\n                        values (minMax) {\n                            let [min, max] = minMax.map((num) => {return window.parseInt(num)}),\n                                amount = 7,\n                                ratio = (max - min) / amount,\n                                result = new Array(amount + 1);\n\n                            // create the values\n                            result = Array.from(result).map((undef, i) => {\n                                return (min + (ratio * i)).toFixed(2)\n                            })\n\n                            return result\n                        },\n                        format (x) {\n                            return vueInstance.getGraphXTicksFormatted(x)\n                        }\n                    }\n                },\n                y: {\n                    label: this.updateYLabel(),\n                    tick: {\n                        values () {\n                            return vueInstance.getGraphYTicks()\n                        },\n                        format (y) {\n                            return vueInstance.getGraphYTicksFormatted(y)\n                        }\n                    }\n                }\n            },\n            padding: {\n                top: 20,\n                left: 70,\n                right: 20\n            },\n            tooltip: createTooltip(this)\n        });\n\n        this.updateGraphData()\n    },\n    components: {\n        svgGraphTabItem\n    }\n}\n\n</script>\n\n<style>\n\n/* graph radio styles */\n.pc-graph-controls {\n    display: flex;\n    flex-direction: row;\n    padding: 30px 0 0 60px;\n    margin-bottom: 5px;\n    border-bottom: 1px solid var(--blue);\n}\n\n.pc-graph-radio-label {\n    position: relative;\n    font-size: 13px;\n    color: var(--blue);\n    margin-right: 20px;\n}\n\n.pc-graph-radio-input {\n    position: absolute;\n    visibility: hidden;\n}\n\n.pc-graph-radio-text {\n    display: block;\n    padding: 0 5px 15px;\n    position: relative;\n}\n\n.pc-graph-radio-input:checked + .pc-graph-radio-text::after {\n    content: '';\n    position: absolute;\n    left: 0;\n    bottom: 0;\n    width: 100%;\n    height: 4px;\n    background: var(--blue);\n}\n\n/* graph layout */\n\n.pc-graph {\n    padding: 10px;\n    width: 100%;\n    box-sizing: border-box;\n}\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$1 = undefined;
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


    let validateFunctions = {
            '*': {
                // Base rate > 0
                base: {
                    fn (value) {
                        return value > 0
                    },
                    defaultVal: 10
                },
                // Power be between 0 and 100%(incl)
                power: {
                    fn (value) {
                        return value >= 0 && value <= 100
                    },
                    defaultVal: 80
                },
                days: {
                    fn (value) {
                        return value > 0
                    },
                    defaultVal: 14
                },
                nonInfThreshold: {
                    fn (value) {
                        return value > 0
                    },
                    defaultVal: 0
                },
                variants: {
                    fn (value) {
                        return Number.isInteger(value) && value > 1
                    },
                    defaultVal: 1
                }
            },
            gTest: {
                // Limit Gtest rate input to be between 0.0001% and 99.999%
                base: {
                    fn (value) {
                        return value >= 0.01 && value <= 99.9
                    }
                }
            },
            tTest: {
                // Standard deviation > 0
                sdRate: {
                    fn (value) {
                        return value > 0
                    },
                    defaultVal: 10
                }
            }
        },
        validationCache = {};

    var script$2 = {
        template: '#pc-block-field',
        props: [
            'lockedField',
            'enableEdit',
            'isReadOnly',
            'fieldProp',
            'fieldValue',
            'prefix',
            'suffix',
            'fieldFromBlock'
        ],
        data () {
            return {
                islockedFieldSet: (this.lockedField || '').length > 0,
                val: parseFloat(this.fieldValue),
                isFocused: false,
            }
        },
        computed: {
            isLocked () {
                return this.lockedField && this.lockedField == this.fieldProp
            },
            formattedVal () {
                let result = this.val;
                let sep = ',';

                if (result / 1000 >= 1) {
                    let [integer, decimal] = (result + '').split('.');

                    result = integer.split('').reduceRight((prev, cur, i, arr) => {
                        let resultStr = cur + prev,
                            iFromLeft = arr.length - i;

                        if (iFromLeft % 3 == 0 && iFromLeft != 0 && i != 0) {
                            resultStr = sep + resultStr;
                        }

                        return resultStr;
                    }, '');

                    if (decimal) {
                        result += '.' + decimal;

                    }

                }

                return result;
            },
            fieldWrapperClasses () {
                let obj = {};

                obj['pc-field--read-only'] = this.isReadOnly;
                obj['pc-field--focused'] = this.isFocused;
                obj['pc-field-' + this.fieldProp] = true;

                return obj
            },
            fieldFormattedStyle () {
                let result = {};
                if (this.isFocused) {
                    result.display = 'none';
                }

                return result
            },
            fieldEditableStyle () {
                let result = {};
                if (!this.isFocused) {
                    result.opacity = 0;
                }

                return result
            },
            testType () {
                return this.$store.state.attributes.testType
            }
        },
        methods: {
            getSanitizedPcValue () {
                // People will use copy paste. We need some data sanitization

                // remove markup
                let oldValue = this.$refs['pc-value'].textContent + '',
                    newValue;

                // remove commas
                newValue = oldValue.replace(/,/g, '');

                // try to extract numbers from it
                newValue = parseFloat(newValue);

                newValue = this.validateField(newValue);

                return newValue

            },
            updateVal () {
                if (this.enableEdit) {
                    let value = this.getSanitizedPcValue();

                    if (value != this.val) {
                        this.val = value;
                    }
                }
            },
            formatDisplay () {
                if (this.enableEdit) {
                    this.$refs['pc-value'].textContent = this.formatNumberFields(this.getSanitizedPcValue());
                } else {
                    this.val = this.formatNumberFields(this.val);
                }
            },
            formatNumberFields (value) {
                let result = parseFloat(value);

                result = this.validateField(result);

                return result || 0
            },

            blur () {
                this.formatDisplay();
                this.setFocusStyle(false);
            },
            setFocusStyle (bool) {
                this.isFocused = bool;
            },
            setFocus () {
                let el = this.$refs['pc-value'];
                el.focus();
            },
            validateField (value) {
                let validateConfigList = this.getValidationConfig(),
                    isValid = true,
                    result = value;

                if (isNaN(result) || !isFinite(result)) {
                    result = validateConfigList.defaultVal;
                }

                if (validateConfigList.fns.length > 0) {
                    validateConfigList.fns.forEach((fn) => {
                        if (!fn(result)) {
                            isValid = false;
                        }
                    });
                }

                if (!isValid) {
                    result = validateConfigList.defaultVal;
                }

                return result
            },
            getValidationConfig () {
                let {fieldProp, testtype} = this,
                    validationTypeCategories,
                    result;

                if (validationCache[testtype] && validationCache[testtype][fieldProp]) {
                    return validationCache[testtype][fieldProp]
                }

                validationTypeCategories = [validateFunctions['*'], validateFunctions[testtype]].filter(Boolean);

                result = validationTypeCategories.reduce((prev, cur) => {
                    let {fn, defaultVal} = cur[fieldProp] || {};

                    if (typeof fn != 'undefined') {
                        prev.fns.push(fn);
                    }
                    if (typeof defaultVal != 'undefined') {
                        prev.defaultVal = defaultVal;
                    }
                    return prev
                }, {fns: [], defaultVal: 0});

                //cacheing
                validationCache[testtype] = validationCache[testtype] || {};
                validationCache[testtype][fieldProp] = result;

                return result
            },
            placeCaretAtEnd (el) {
                if (typeof window.getSelection != "undefined"
                        && typeof document.createRange != "undefined") {
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else if (typeof document.body.createTextRange != "undefined") {
                    var textRange = document.body.createTextRange();
                    textRange.moveToElementText(el);
                    textRange.collapse(false);
                    textRange.select();
                }
            }

        },
        watch: {
            val (newValue, oldValue) {
                let newVal = parseFloat(this.formatNumberFields(newValue)),
                    oldVal = parseFloat(this.formatNumberFields(oldValue));

                if (this.isReadOnly || !this.isFocused || (newVal == oldVal)) {
                    return;
                }

                // updating calculations
                this.$store.dispatch('field:change', {
                    prop: this.fieldProp,
                    value: newVal || 0
                });
            },
            fieldValue () {
                // in case some input field on the same block changes the main math values
                // we need to update the input fiel
                let anotherFieldInBlockIsUpdating = !this.isFocused;
                if (!this.isReadOnly && !anotherFieldInBlockIsUpdating) {
                    return
                }

                this.val = this.fieldValue;
                if (this.enableEdit) {
                    this.$refs['pc-value'].textContent = this.val;
                }
            },
            isFocused (newValue) {
                this.$emit('update:focus', {
                    fieldProp: this.fieldFromBlock || this.fieldProp,
                    value: newValue
                });
            }
        },
        directives: {
            initialvalue: {
                inserted (el, directive, vnode) {
                    el.textContent = vnode.context.val;
                }
            }
        }
    };

    /* script */
    const __vue_script__$2 = script$2;

    /* template */
    var __vue_render__$2 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _vm.enableEdit
        ? _c(
            "span",
            {
              staticClass: "pc-value-field-wrapper",
              class: _vm.fieldWrapperClasses,
              on: {
                click: function($event) {
                  _vm.setFocus();
                }
              }
            },
            [
              _c(
                "span",
                {
                  staticClass: "pc-value-formatting pc-value--formatted",
                  class: "pc-value-formatting-" + _vm.fieldProp,
                  style: _vm.fieldFormattedStyle,
                  attrs: {
                    "aria-hidden": "true",
                    "data-prefix": _vm.prefix,
                    "data-suffix": _vm.suffix
                  }
                },
                [
                  _c(
                    "span",
                    { ref: "pc-formatted-value", staticClass: "pc-value-display" },
                    [_vm._v(_vm._s(_vm.formattedVal))]
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "span",
                {
                  staticClass: "pc-value-formatting",
                  class: "pc-value-formatting-" + _vm.fieldProp,
                  style: _vm.fieldEditableStyle,
                  attrs: { "data-prefix": _vm.prefix, "data-suffix": _vm.suffix }
                },
                [
                  _c("span", {
                    directives: [
                      { name: "initialvalue", rawName: "v-initialvalue" }
                    ],
                    ref: "pc-value",
                    staticClass: "pc-value-display",
                    attrs: {
                      "data-test": _vm.isFocused,
                      contenteditable: !_vm.isReadOnly
                    },
                    on: {
                      focus: function($event) {
                        _vm.setFocusStyle(true);
                      },
                      blur: _vm.blur,
                      input: _vm.updateVal
                    }
                  })
                ]
              )
            ]
          )
        : _c("span", { staticClass: "pc-value-display pc-field-not-editable" }, [
            _vm._v("\n    " + _vm._s(_vm.prefix) + " "),
            _c("strong", [_vm._v(_vm._s(_vm.formattedVal))]),
            _vm._v(" " + _vm._s(_vm.suffix) + "\n")
          ])
    };
    var __vue_staticRenderFns__$2 = [];
    __vue_render__$2._withStripped = true;

      /* style */
      const __vue_inject_styles__$2 = function (inject) {
        if (!inject) return
        inject("data-v-2300a621_0", { source: "\n.pc-value-field-wrapper {\n    --base-padding: 5px;\n\n    display: block;\n    position: relative;\n    box-sizing: border-box;\n    width: 100%;\n    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1));\n    border-radius: 5px;\n    background: var(--white);\n    padding: var(--base-padding);\n\n    overflow: hidden;\n}\n.pc-field--focused {\n    box-shadow: inset 0 0 0 1px var(--dark-blue);\n}\n.pc-value--formatted {\n    position: absolute;\n    left: 50%;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    pointer-events: none;\n    width: 100%;\n}\n.pc-value-display {\n    box-sizing: border-box;\n    font-size: 1em;\n    line-height: 1.8em;\n    align-self: center;\n    min-height: 1em;\n    display: inline-block;\n}\n.pc-value-display:focus {\n    outline: 0;\n}\n.pc-non-inf-treshold-input,\n.pc-power-input,\n.pc-false-positive-input,\n.pc-variants-input {\n    display: inline-block;\n    vertical-align: middle;\n    padding: 4px 8px;\n    text-align: center;\n    width: 4em;\n    border: 2px solid var(--gray);\n    border-radius: 8px;\n    font-size: inherit;\n}\n.pc-variants-input {\n    width: 6.5em;\n}\n.pc-top-fields-error {\n    color: var(--red);\n}\n\n/* prefixes and suffixes */\n.pc-value-formatting:before {\n    color: var(--gray);\n    content: attr(data-prefix);\n}\n.pc-value-formatting:after {\n    color: var(--gray);\n    content: attr(data-suffix);\n}\n\n/* block to calculate override rules*/\n.pc-block-to-calculate .pc-value-field-wrapper:not(.pc-value-display) {\n    background: var(--light-yellow);\n    outline: 2px solid var(--dark-yellow);\n}\n.pc-block-to-calculate .pc-value .pc-value-formatting:before {\n    content: \"=\" attr(data-prefix);\n    color: var(--black);\n}\n.pc-block-to-calculate .pc-value-formatting:after {\n    color: var(--black);\n}\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/pc-block-field.vue"],"names":[],"mappings":";AAqVA;IACA,mBAAA;;IAEA,cAAA;IACA,kBAAA;IACA,sBAAA;IACA,WAAA;IACA,8CAAA;IACA,kBAAA;IACA,wBAAA;IACA,4BAAA;;IAEA,gBAAA;AACA;AAEA;IACA,4CAAA;AACA;AAEA;IACA,kBAAA;IACA,SAAA;IACA,QAAA;IACA,gCAAA;IACA,oBAAA;IACA,WAAA;AACA;AAEA;IACA,sBAAA;IACA,cAAA;IACA,kBAAA;IACA,kBAAA;IACA,eAAA;IACA,qBAAA;AACA;AAEA;IACA,UAAA;AACA;AAEA;;;;IAIA,qBAAA;IACA,sBAAA;IACA,gBAAA;IACA,kBAAA;IACA,UAAA;IACA,6BAAA;IACA,kBAAA;IACA,kBAAA;AACA;AAEA;IACA,YAAA;AACA;AAEA;IACA,iBAAA;AACA;;AAEA,0BAAA;AAEA;IACA,kBAAA;IACA,0BAAA;AACA;AAEA;IACA,kBAAA;IACA,0BAAA;AACA;;AAEA,qCAAA;AAEA;IACA,+BAAA;IACA,qCAAA;AACA;AAEA;IACA,8BAAA;IACA,mBAAA;AACA;AAEA;IACA,mBAAA;AACA","file":"pc-block-field.vue","sourcesContent":["<template id=\"pc-block-field\">\n    <span v-if=\"enableEdit\" class=\"pc-value-field-wrapper\" :class=\"fieldWrapperClasses\" v-on:click=\"setFocus()\">\n\n        <span class=\"pc-value-formatting pc-value--formatted\" aria-hidden=\"true\"\n            :class=\"'pc-value-formatting-' + fieldProp\"\n            :data-prefix=\"prefix\"\n            :data-suffix=\"suffix\"\n            :style=\"fieldFormattedStyle\"\n        >\n            <span class=\"pc-value-display\" ref=\"pc-formatted-value\">{{formattedVal}}</span>\n        </span>\n\n        <span class=\"pc-value-formatting\"\n            :class=\"'pc-value-formatting-' + fieldProp\"\n            :data-prefix=\"prefix\"\n            :data-suffix=\"suffix\"\n            :style=\"fieldEditableStyle\"\n        >\n            <span class=\"pc-value-display\" :data-test=\"isFocused\"\n                :contenteditable=\"!isReadOnly\"\n\n                v-on:focus=\"setFocusStyle(true)\"\n                v-on:blur=\"blur\"\n                v-on:input=\"updateVal\"\n                v-initialvalue\n\n                ref=\"pc-value\"></span>\n        </span>\n    </span>\n    <span v-else class=\"pc-value-display pc-field-not-editable\">\n        {{prefix}} <strong>{{formattedVal}}</strong> {{suffix}}\n    </span>\n</template>\n\n<script>\n\nlet validateFunctions = {\n        '*': {\n            // Base rate > 0\n            base: {\n                fn (value) {\n                    return value > 0\n                },\n                defaultVal: 10\n            },\n            // Power be between 0 and 100%(incl)\n            power: {\n                fn (value) {\n                    return value >= 0 && value <= 100\n                },\n                defaultVal: 80\n            },\n            days: {\n                fn (value) {\n                    return value > 0\n                },\n                defaultVal: 14\n            },\n            nonInfThreshold: {\n                fn (value) {\n                    return value > 0\n                },\n                defaultVal: 0\n            },\n            variants: {\n                fn (value) {\n                    return Number.isInteger(value) && value > 1\n                },\n                defaultVal: 1\n            }\n        },\n        gTest: {\n            // Limit Gtest rate input to be between 0.0001% and 99.999%\n            base: {\n                fn (value) {\n                    return value >= 0.01 && value <= 99.9\n                }\n            }\n        },\n        tTest: {\n            // Standard deviation > 0\n            sdRate: {\n                fn (value) {\n                    return value > 0\n                },\n                defaultVal: 10\n            }\n        }\n    },\n    validationCache = {};\n\nexport default {\n    template: '#pc-block-field',\n    props: [\n        'lockedField',\n        'enableEdit',\n        'isReadOnly',\n        'fieldProp',\n        'fieldValue',\n        'prefix',\n        'suffix',\n        'fieldFromBlock'\n    ],\n    data () {\n        return {\n            islockedFieldSet: (this.lockedField || '').length > 0,\n            val: parseFloat(this.fieldValue),\n            isFocused: false,\n        }\n    },\n    computed: {\n        isLocked () {\n            return this.lockedField && this.lockedField == this.fieldProp\n        },\n        formattedVal () {\n            let result = this.val;\n            let sep = ',';\n\n            if (result / 1000 >= 1) {\n                let [integer, decimal] = (result + '').split('.');\n\n                result = integer.split('').reduceRight((prev, cur, i, arr) => {\n                    let resultStr = cur + prev,\n                        iFromLeft = arr.length - i;\n\n                    if (iFromLeft % 3 == 0 && iFromLeft != 0 && i != 0) {\n                        resultStr = sep + resultStr;\n                    }\n\n                    return resultStr;\n                }, '')\n\n                if (decimal) {\n                    result += '.' + decimal;\n\n                }\n\n            }\n\n            return result;\n        },\n        fieldWrapperClasses () {\n            let obj = {};\n\n            obj['pc-field--read-only'] = this.isReadOnly;\n            obj['pc-field--focused'] = this.isFocused;\n            obj['pc-field-' + this.fieldProp] = true;\n\n            return obj\n        },\n        fieldFormattedStyle () {\n            let result = {};\n            if (this.isFocused) {\n                result.display = 'none';\n            }\n\n            return result\n        },\n        fieldEditableStyle () {\n            let result = {};\n            if (!this.isFocused) {\n                result.opacity = 0;\n            }\n\n            return result\n        },\n        testType () {\n            return this.$store.state.attributes.testType\n        }\n    },\n    methods: {\n        getSanitizedPcValue () {\n            // People will use copy paste. We need some data sanitization\n\n            // remove markup\n            let oldValue = this.$refs['pc-value'].textContent + '',\n                newValue;\n\n            // remove commas\n            newValue = oldValue.replace(/,/g, '');\n\n            // try to extract numbers from it\n            newValue = parseFloat(newValue);\n\n            newValue = this.validateField(newValue);\n\n            return newValue\n\n        },\n        updateVal () {\n            if (this.enableEdit) {\n                let value = this.getSanitizedPcValue();\n\n                if (value != this.val) {\n                    this.val = value;\n                }\n            }\n        },\n        formatDisplay () {\n            if (this.enableEdit) {\n                this.$refs['pc-value'].textContent = this.formatNumberFields(this.getSanitizedPcValue());\n            } else {\n                this.val = this.formatNumberFields(this.val);\n            }\n        },\n        formatNumberFields (value) {\n            let result = parseFloat(value);\n\n            result = this.validateField(result);\n\n            return result || 0\n        },\n\n        blur () {\n            this.formatDisplay();\n            this.setFocusStyle(false);\n        },\n        setFocusStyle (bool) {\n            this.isFocused = bool;\n        },\n        setFocus () {\n            let el = this.$refs['pc-value'];\n            el.focus();\n        },\n        validateField (value) {\n            let validateConfigList = this.getValidationConfig(),\n                isValid = true,\n                result = value;\n\n            if (isNaN(result) || !isFinite(result)) {\n                result = validateConfigList.defaultVal;\n            }\n\n            if (validateConfigList.fns.length > 0) {\n                validateConfigList.fns.forEach((fn) => {\n                    if (!fn(result)) {\n                        isValid = false;\n                    }\n                })\n            }\n\n            if (!isValid) {\n                result = validateConfigList.defaultVal;\n            }\n\n            return result\n        },\n        getValidationConfig () {\n            let {fieldProp, testtype} = this,\n                validationTypeCategories,\n                result;\n\n            if (validationCache[testtype] && validationCache[testtype][fieldProp]) {\n                return validationCache[testtype][fieldProp]\n            }\n\n            validationTypeCategories = [validateFunctions['*'], validateFunctions[testtype]].filter(Boolean);\n\n            result = validationTypeCategories.reduce((prev, cur) => {\n                let {fn, defaultVal} = cur[fieldProp] || {};\n\n                if (typeof fn != 'undefined') {\n                    prev.fns.push(fn);\n                }\n                if (typeof defaultVal != 'undefined') {\n                    prev.defaultVal = defaultVal;\n                }\n                return prev\n            }, {fns: [], defaultVal: 0})\n\n            //cacheing\n            validationCache[testtype] = validationCache[testtype] || {};\n            validationCache[testtype][fieldProp] = result;\n\n            return result\n        },\n        placeCaretAtEnd (el) {\n            if (typeof window.getSelection != \"undefined\"\n                    && typeof document.createRange != \"undefined\") {\n                var range = document.createRange();\n                range.selectNodeContents(el);\n                range.collapse(false);\n                var sel = window.getSelection();\n                sel.removeAllRanges();\n                sel.addRange(range);\n            } else if (typeof document.body.createTextRange != \"undefined\") {\n                var textRange = document.body.createTextRange();\n                textRange.moveToElementText(el);\n                textRange.collapse(false);\n                textRange.select();\n            }\n        }\n\n    },\n    watch: {\n        val (newValue, oldValue) {\n            let newVal = parseFloat(this.formatNumberFields(newValue)),\n                oldVal = parseFloat(this.formatNumberFields(oldValue));\n\n            if (this.isReadOnly || !this.isFocused || (newVal == oldVal)) {\n                return;\n            }\n\n            // updating calculations\n            this.$store.dispatch('field:change', {\n                prop: this.fieldProp,\n                value: newVal || 0\n            })\n        },\n        fieldValue () {\n            // in case some input field on the same block changes the main math values\n            // we need to update the input fiel\n            let anotherFieldInBlockIsUpdating = !this.isFocused;\n            if (!this.isReadOnly && !anotherFieldInBlockIsUpdating) {\n                return\n            }\n\n            this.val = this.fieldValue;\n            if (this.enableEdit) {\n                this.$refs['pc-value'].textContent = this.val;\n            }\n        },\n        isFocused (newValue) {\n            this.$emit('update:focus', {\n                fieldProp: this.fieldFromBlock || this.fieldProp,\n                value: newValue\n            })\n        }\n    },\n    directives: {\n        initialvalue: {\n            inserted (el, directive, vnode) {\n                el.textContent = vnode.context.val\n            }\n        }\n    }\n}\n\n</script>\n\n<style>\n.pc-value-field-wrapper {\n    --base-padding: 5px;\n\n    display: block;\n    position: relative;\n    box-sizing: border-box;\n    width: 100%;\n    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1));\n    border-radius: 5px;\n    background: var(--white);\n    padding: var(--base-padding);\n\n    overflow: hidden;\n}\n\n.pc-field--focused {\n    box-shadow: inset 0 0 0 1px var(--dark-blue);\n}\n\n.pc-value--formatted {\n    position: absolute;\n    left: 50%;\n    top: 50%;\n    transform: translate(-50%, -50%);\n    pointer-events: none;\n    width: 100%;\n}\n\n.pc-value-display {\n    box-sizing: border-box;\n    font-size: 1em;\n    line-height: 1.8em;\n    align-self: center;\n    min-height: 1em;\n    display: inline-block;\n}\n\n.pc-value-display:focus {\n    outline: 0;\n}\n\n.pc-non-inf-treshold-input,\n.pc-power-input,\n.pc-false-positive-input,\n.pc-variants-input {\n    display: inline-block;\n    vertical-align: middle;\n    padding: 4px 8px;\n    text-align: center;\n    width: 4em;\n    border: 2px solid var(--gray);\n    border-radius: 8px;\n    font-size: inherit;\n}\n\n.pc-variants-input {\n    width: 6.5em;\n}\n\n.pc-top-fields-error {\n    color: var(--red);\n}\n\n/* prefixes and suffixes */\n\n.pc-value-formatting:before {\n    color: var(--gray);\n    content: attr(data-prefix);\n}\n\n.pc-value-formatting:after {\n    color: var(--gray);\n    content: attr(data-suffix);\n}\n\n/* block to calculate override rules*/\n\n.pc-block-to-calculate .pc-value-field-wrapper:not(.pc-value-display) {\n    background: var(--light-yellow);\n    outline: 2px solid var(--dark-yellow);\n}\n\n.pc-block-to-calculate .pc-value .pc-value-formatting:before {\n    content: \"=\" attr(data-prefix);\n    color: var(--black);\n}\n\n.pc-block-to-calculate .pc-value-formatting:after {\n    color: var(--black);\n}\n</style>\n"]}, media: undefined });

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

    var script$3 = {
        props: ['fieldFromBlock'],
        data () {
            return {
                svgBoxWidth: 26
            }
        },
        computed: {
            calculateProp () {
                return this.$store.state.attributes.calculateProp
            },
            svgFillColor () {
                return this.calculateProp == this.fieldFromBlock ? '#E2B634' : '#C1CFD8'
            },
            svgBgColor () {
                return this.calculateProp == this.fieldFromBlock ? '#FEF1CB' : '#F0F0F0'
            },
            svgBgLine () {
                let { svgFillColor, svgBgColor, svgBoxWidth } = this,
                    strokeWidth = 2,
                    stokeStyle = `linear-gradient(
                    0deg,
                    transparent,
                    transparent calc(50% - ${strokeWidth/2}px - 1px),
                    ${svgFillColor} calc(50% - ${strokeWidth/2}px),
                    ${svgFillColor} calc(50% + ${strokeWidth/2}px),
                    transparent calc(50% + ${strokeWidth/2}px + 1px),
                    transparent 100%
                )`,
                    strokeMask = `linear-gradient(
                    90deg,
                    transparent,
                    transparent calc(50% - ${svgBoxWidth/2}px - 1px),
                    ${svgBgColor} calc(50% - ${svgBoxWidth/2}px),
                    ${svgBgColor} calc(50% + ${svgBoxWidth/2}px),
                    transparent calc(50% + ${svgBoxWidth/2}px + 1px),
                    transparent 100%
                )`;


                return `background: ${strokeMask}, ${stokeStyle};`.replace(/\n/g, '');
            }
        }
    };

    /* script */
    const __vue_script__$3 = script$3;

    /* template */
    var __vue_render__$3 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "svg",
        {
          staticClass: "pc-svg-chain-icon",
          style: _vm.svgBgLine,
          attrs: {
            width: "100%",
            height: "59px",
            viewBox: "0 0 " + _vm.svgBoxWidth + " 59",
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            "aria-hidden": "true"
          }
        },
        [
          _c(
            "g",
            {
              attrs: {
                id: "Power-Calculator",
                transform: "translate(-811.000000, -485.000000)"
              }
            },
            [
              _c(
                "g",
                { attrs: { transform: "translate(676.000000, 327.000000)" } },
                [
                  _c(
                    "g",
                    {
                      attrs: {
                        id: "Chain",
                        transform: "translate(132.000000, 158.000000)"
                      }
                    },
                    [
                      _c("path", {
                        attrs: {
                          d:
                            "M12.1680332,24.5 L14.5,24.5 C16.709139,24.5 18.5,26.290861 18.5,28.5 L18.5,29.5 C18.5,31.709139 16.709139,33.5 14.5,33.5 L9.5,33.5 C7.290861,33.5 5.5,31.709139 5.5,29.5 L5.5,28.5 C6.20701437,28.5 6.87368104,28.5 7.5,28.5 L7.5,29.5 C7.5,30.6045695 8.3954305,31.5 9.5,31.5 L14.5,31.5 C15.6045695,31.5 16.5,30.6045695 16.5,29.5 L16.5,28.5 C16.5,27.3954305 15.6045695,26.5 14.5,26.5 L13.7237764,26.5 C13.463452,25.7924504 12.944871,25.1257837 12.1680332,24.5 Z",
                          id: "Rectangle-5",
                          fill: _vm.svgFillColor,
                          "fill-rule": "nonzero",
                          transform:
                            "translate(12.000000, 29.000000) scale(-1, -1) translate(-12.000000, -29.000000) "
                        }
                      }),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          d:
                            "M18.1680332,24.5 L20.5,24.5 C22.709139,24.5 24.5,26.290861 24.5,28.5 L24.5,29.5 C24.5,31.709139 22.709139,33.5 20.5,33.5 L15.5,33.5 C13.290861,33.5 11.5,31.709139 11.5,29.5 L11.5,28.5 C12.2070144,28.5 12.873681,28.5 13.5,28.5 L13.5,29.5 C13.5,30.6045695 14.3954305,31.5 15.5,31.5 L20.5,31.5 C21.6045695,31.5 22.5,30.6045695 22.5,29.5 L22.5,28.5 C22.5,27.3954305 21.6045695,26.5 20.5,26.5 L19.7237764,26.5 C19.463452,25.7924504 18.944871,25.1257837 18.1680332,24.5 Z",
                          id: "Rectangle-5",
                          fill: _vm.svgFillColor,
                          "fill-rule": "nonzero"
                        }
                      })
                    ]
                  )
                ]
              )
            ]
          )
        ]
      )
    };
    var __vue_staticRenderFns__$3 = [];
    __vue_render__$3._withStripped = true;

      /* style */
      const __vue_inject_styles__$3 = function (inject) {
        if (!inject) return
        inject("data-v-009c2378_0", { source: "\n.pc-svg-chain-icon {\n    position: absolute;\n    top: 138px;\n    pointer-events: none;\n    z-index: 0;\n}\n\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/pc-svg-chain.vue"],"names":[],"mappings":";AA6DA;IACA,kBAAA;IACA,UAAA;IACA,oBAAA;IACA,UAAA;AACA","file":"pc-svg-chain.vue","sourcesContent":["<template>\n    <svg width=\"100%\" height=\"59px\" :viewBox=\"`0 0 ${svgBoxWidth} 59`\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" class=\"pc-svg-chain-icon\" :style=\"svgBgLine\">\n        <g id=\"Power-Calculator\" transform=\"translate(-811.000000, -485.000000)\">\n            <g transform=\"translate(676.000000, 327.000000)\">\n                <g id=\"Chain\" transform=\"translate(132.000000, 158.000000)\">\n                    <path d=\"M12.1680332,24.5 L14.5,24.5 C16.709139,24.5 18.5,26.290861 18.5,28.5 L18.5,29.5 C18.5,31.709139 16.709139,33.5 14.5,33.5 L9.5,33.5 C7.290861,33.5 5.5,31.709139 5.5,29.5 L5.5,28.5 C6.20701437,28.5 6.87368104,28.5 7.5,28.5 L7.5,29.5 C7.5,30.6045695 8.3954305,31.5 9.5,31.5 L14.5,31.5 C15.6045695,31.5 16.5,30.6045695 16.5,29.5 L16.5,28.5 C16.5,27.3954305 15.6045695,26.5 14.5,26.5 L13.7237764,26.5 C13.463452,25.7924504 12.944871,25.1257837 12.1680332,24.5 Z\" id=\"Rectangle-5\" :fill=\"svgFillColor\" fill-rule=\"nonzero\" transform=\"translate(12.000000, 29.000000) scale(-1, -1) translate(-12.000000, -29.000000) \"></path>\n                    <path d=\"M18.1680332,24.5 L20.5,24.5 C22.709139,24.5 24.5,26.290861 24.5,28.5 L24.5,29.5 C24.5,31.709139 22.709139,33.5 20.5,33.5 L15.5,33.5 C13.290861,33.5 11.5,31.709139 11.5,29.5 L11.5,28.5 C12.2070144,28.5 12.873681,28.5 13.5,28.5 L13.5,29.5 C13.5,30.6045695 14.3954305,31.5 15.5,31.5 L20.5,31.5 C21.6045695,31.5 22.5,30.6045695 22.5,29.5 L22.5,28.5 C22.5,27.3954305 21.6045695,26.5 20.5,26.5 L19.7237764,26.5 C19.463452,25.7924504 18.944871,25.1257837 18.1680332,24.5 Z\" id=\"Rectangle-5\" :fill=\"svgFillColor\" fill-rule=\"nonzero\"></path>\n                </g>\n            </g>\n        </g>\n    </svg>\n</template>\n\n<script>\nexport default {\n    props: ['fieldFromBlock'],\n    data () {\n        return {\n            svgBoxWidth: 26\n        }\n    },\n    computed: {\n        calculateProp () {\n            return this.$store.state.attributes.calculateProp\n        },\n        svgFillColor () {\n            return this.calculateProp == this.fieldFromBlock ? '#E2B634' : '#C1CFD8'\n        },\n        svgBgColor () {\n            return this.calculateProp == this.fieldFromBlock ? '#FEF1CB' : '#F0F0F0'\n        },\n        svgBgLine () {\n            let { svgFillColor, svgBgColor, svgBoxWidth } = this,\n                strokeWidth = 2,\n                stokeStyle = `linear-gradient(\n                    0deg,\n                    transparent,\n                    transparent calc(50% - ${strokeWidth/2}px - 1px),\n                    ${svgFillColor} calc(50% - ${strokeWidth/2}px),\n                    ${svgFillColor} calc(50% + ${strokeWidth/2}px),\n                    transparent calc(50% + ${strokeWidth/2}px + 1px),\n                    transparent 100%\n                )`,\n                strokeMask = `linear-gradient(\n                    90deg,\n                    transparent,\n                    transparent calc(50% - ${svgBoxWidth/2}px - 1px),\n                    ${svgBgColor} calc(50% - ${svgBoxWidth/2}px),\n                    ${svgBgColor} calc(50% + ${svgBoxWidth/2}px),\n                    transparent calc(50% + ${svgBoxWidth/2}px + 1px),\n                    transparent 100%\n                )`;\n\n\n            return `background: ${strokeMask}, ${stokeStyle};`.replace(/\\n/g, '');\n        }\n    }\n}\n</script>\n<style>\n\n.pc-svg-chain-icon {\n    position: absolute;\n    top: 138px;\n    pointer-events: none;\n    z-index: 0;\n}\n\n</style>\n"]}, media: undefined });

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

    var script$4 = {
        props: ['fieldFromBlock'],
        data () {
            return {
                // isCalculated: this.calculateProp == this.fieldFromBlock,
            }
        },
        computed: {
            isCalculated: {
                get () {
                    return this.$store.state.attributes.calculateProp == this.fieldFromBlock
                },
                set () {
                    this.$store.dispatch('update:calculateprop', {value: this.fieldFromBlock});
                }
            },

            calculateProp () {
                return this.$store.state.attributes.calculateProp
            },
            testType () {
                return this.$store.state.attributes.testType
            }
        },
        components: {
            'pc-block-field': __vue_component__$2,
            'pc-svg-chain': __vue_component__$3,
        }
    };

    /* script */
    const __vue_script__$4 = script$4;

    /* template */
    var __vue_render__$4 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("div")
    };
    var __vue_staticRenderFns__$4 = [];
    __vue_render__$4._withStripped = true;

      /* style */
      const __vue_inject_styles__$4 = function (inject) {
        if (!inject) return
        inject("data-v-5f1d7dec_0", { source: "\n.pc-block {\n    position: relative;\n    padding-bottom: 25px;\n    border-bottom: 3px solid var(--pale-blue);\n}\n.pc-block-to-calculate {\n    border-bottom-color: var(--dark-yellow);\n}\n.pc-calc-radio {\n    position: absolute;\n    top: 0;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    background: var(--light-gray);\n    border-radius: 25% / 100%;\n    padding: 7px 15px;\n}\n.pc-calc-radio--active {\n    background: var(--white);\n}\n.pc-inputs {\n    display: block;\n    list-style-type: none;\n    margin: 0;\n    padding: 0;\n\n    --row-gap: 10px;\n    --padding: 25px;\n    --columns-gap: 70px;\n    --grid-column-width: calc(50% - (var(--columns-gap) / 2));\n\n    display: grid;\n    grid-template-columns: var(--grid-column-width) var(--grid-column-width);\n    grid-template-rows: auto;\n    grid-template-areas:\n        \"pc-input-left pc-input-right\"\n        \"pc-input-left-bottom pc-input-right-bottom\"\n    ;\n    align-items: start;\n    grid-gap: var(--row-gap) var(--columns-gap);\n    padding: 0 var(--padding);\n}\n.pc-input-item {\n    text-align: center;\n}\n.pc-input-title {\n    position: relative;\n    display: block;\n    margin-bottom: 25px;\n}\n.pc-input-sub-title {\n    position: absolute;\n    top: 100%;\n    left: 0;\n    right: 0;\n    text-align: center;\n    font-size: 9px;\n}\n.pc-input-left {\n    grid-area: pc-input-left;\n}\n.pc-input-right {\n    grid-area: pc-input-right;\n}\n.pc-input-left-bottom {\n    grid-area: pc-input-left-bottom;\n}\n.pc-input-right-bottom {\n    grid-area: pc-input-right-bottom;\n}\n.pc-input-details {\n    font-size: 10px;\n    color: var(--dark-gray);\n}\n.pc-field-not-editable {\n    position: relative;\n    padding: 5px;\n    display: block;\n}\n.pc-input-left .pc-field-not-editable,\n.pc-input-right .pc-field-not-editable {\n    background: var(--light-gray);\n    outline: 2px solid var(--light-blue);\n}\n\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/pc-block.vue"],"names":[],"mappings":";AA0CA;IACA,kBAAA;IACA,oBAAA;IACA,yCAAA;AACA;AAEA;IACA,uCAAA;AACA;AAEA;IACA,kBAAA;IACA,MAAA;IACA,SAAA;IACA,gCAAA;IACA,6BAAA;IACA,yBAAA;IACA,iBAAA;AACA;AAEA;IACA,wBAAA;AACA;AAEA;IACA,cAAA;IACA,qBAAA;IACA,SAAA;IACA,UAAA;;IAEA,eAAA;IACA,eAAA;IACA,mBAAA;IACA,yDAAA;;IAEA,aAAA;IACA,wEAAA;IACA,wBAAA;IACA;;;IAGA;IACA,kBAAA;IACA,2CAAA;IACA,yBAAA;AAEA;AAEA;IACA,kBAAA;AACA;AAEA;IACA,kBAAA;IACA,cAAA;IACA,mBAAA;AACA;AAEA;IACA,kBAAA;IACA,SAAA;IACA,OAAA;IACA,QAAA;IACA,kBAAA;IACA,cAAA;AACA;AAEA;IACA,wBAAA;AAEA;AAEA;IACA,yBAAA;AACA;AAEA;IACA,+BAAA;AACA;AAEA;IACA,gCAAA;AACA;AAEA;IACA,eAAA;IACA,uBAAA;AACA;AAEA;IACA,kBAAA;IACA,YAAA;IACA,cAAA;AACA;AAEA;;IAEA,6BAAA;IACA,oCAAA;AACA","file":"pc-block.vue","sourcesContent":["<template>\n    <div></div>\n</template>\n\n<script>\n\nimport pcBlockField from './pc-block-field.vue'\nimport pcSvgChain from './pc-svg-chain.vue'\n\nexport default {\n    props: ['fieldFromBlock'],\n    data () {\n        return {\n            // isCalculated: this.calculateProp == this.fieldFromBlock,\n        }\n    },\n    computed: {\n        isCalculated: {\n            get () {\n                return this.$store.state.attributes.calculateProp == this.fieldFromBlock\n            },\n            set () {\n                this.$store.dispatch('update:calculateprop', {value: this.fieldFromBlock})\n            }\n        },\n\n        calculateProp () {\n            return this.$store.state.attributes.calculateProp\n        },\n        testType () {\n            return this.$store.state.attributes.testType\n        }\n    },\n    components: {\n        'pc-block-field': pcBlockField,\n        'pc-svg-chain': pcSvgChain,\n    }\n}\n\n</script>\n\n<style>\n.pc-block {\n    position: relative;\n    padding-bottom: 25px;\n    border-bottom: 3px solid var(--pale-blue);\n}\n\n.pc-block-to-calculate {\n    border-bottom-color: var(--dark-yellow);\n}\n\n.pc-calc-radio {\n    position: absolute;\n    top: 0;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    background: var(--light-gray);\n    border-radius: 25% / 100%;\n    padding: 7px 15px;\n}\n\n.pc-calc-radio--active {\n    background: var(--white);\n}\n\n.pc-inputs {\n    display: block;\n    list-style-type: none;\n    margin: 0;\n    padding: 0;\n\n    --row-gap: 10px;\n    --padding: 25px;\n    --columns-gap: 70px;\n    --grid-column-width: calc(50% - (var(--columns-gap) / 2));\n\n    display: grid;\n    grid-template-columns: var(--grid-column-width) var(--grid-column-width);\n    grid-template-rows: auto;\n    grid-template-areas:\n        \"pc-input-left pc-input-right\"\n        \"pc-input-left-bottom pc-input-right-bottom\"\n    ;\n    align-items: start;\n    grid-gap: var(--row-gap) var(--columns-gap);\n    padding: 0 var(--padding);\n\n}\n\n.pc-input-item {\n    text-align: center;\n}\n\n.pc-input-title {\n    position: relative;\n    display: block;\n    margin-bottom: 25px;\n}\n\n.pc-input-sub-title {\n    position: absolute;\n    top: 100%;\n    left: 0;\n    right: 0;\n    text-align: center;\n    font-size: 9px;\n}\n\n.pc-input-left {\n    grid-area: pc-input-left;\n\n}\n\n.pc-input-right {\n    grid-area: pc-input-right;\n}\n\n.pc-input-left-bottom {\n    grid-area: pc-input-left-bottom;\n}\n\n.pc-input-right-bottom {\n    grid-area: pc-input-right-bottom;\n}\n\n.pc-input-details {\n    font-size: 10px;\n    color: var(--dark-gray);\n}\n\n.pc-field-not-editable {\n    position: relative;\n    padding: 5px;\n    display: block;\n}\n\n.pc-input-left .pc-field-not-editable,\n.pc-input-right .pc-field-not-editable {\n    background: var(--light-gray);\n    outline: 2px solid var(--light-blue);\n}\n\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$4 = undefined;
      /* module identifier */
      const __vue_module_identifier__$4 = undefined;
      /* functional template */
      const __vue_is_functional_template__$4 = false;
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
        createInjector,
        undefined,
        undefined
      );

    //

    var script$5 = {
        props: ['enableEdit', 'isBlockFocused', 'fieldFromBlock'],
        template: '#sample-comp',
        extends: __vue_component__$4,
        data () {
            return {
                focusedBlock: ''
            }
        },
        computed: {
            sample () {
                return this.$store.state.attributes.sample
            },
            visitorsPerDay () {
                return this.$store.state.attributes.visitorsPerDay
            },
            runtime () {
                return this.$store.state.attributes.runtime
            },
            lockedField () {
                return this.$store.state.attributes.lockedField
            },
            onlyTotalVisitors () {
                return this.$store.state.attributes.onlyTotalVisitors
            },
        },
        methods: {
            updateFocus ({fieldProp, value}) {

                if (this.focusedBlock == fieldProp && value === false) {
                    this.focusedBlock = '';
                } else if (value === true) {
                    this.focusedBlock = fieldProp;
                }

                this.$emit('update:focus', {
                    fieldProp: this.fieldFromBlock,
                    value: value
                });
            },
            switchLockedField () {
                this.$store.dispatch('switch:lockedfield');
            },
            getLockedStateClass (param) {
                return this.lockedField == param ? 'pc-value-field--locked' : 'pc-value-field--unlocked'
            }
        }
    };

    /* script */
    const __vue_script__$5 = script$5;

    /* template */
    var __vue_render__$5 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "div",
        {
          staticClass: "pc-block pc-block--sample",
          class: {
            "pc-block-focused": _vm.isBlockFocused == "sample",
            "pc-block-to-calculate": _vm.calculateProp == "sample"
          }
        },
        [
          _c("pc-svg-chain", {
            attrs: {
              calculateProp: _vm.calculateProp,
              fieldFromBlock: _vm.fieldFromBlock
            }
          }),
          _vm._v(" "),
          _c(
            "label",
            {
              staticClass: "pc-calc-radio pc-calc-radio--sample",
              class: { "pc-calc-radio--active": _vm.isCalculated },
              attrs: { slot: "text" },
              slot: "text"
            },
            [
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.isCalculated,
                    expression: "isCalculated"
                  }
                ],
                attrs: { type: "radio" },
                domProps: { value: true, checked: _vm._q(_vm.isCalculated, true) },
                on: {
                  change: function($event) {
                    _vm.isCalculated = true;
                  }
                }
              }),
              _vm._v(
                "\n            " +
                  _vm._s(_vm.isCalculated ? "Calculating" : "Calculate") +
                  "\n    "
              )
            ]
          ),
          _vm._v(" "),
          _c("div", { staticClass: "pc-header" }, [
            _vm._v("\n        Sample Size\n    ")
          ]),
          _vm._v(" "),
          _c(
            "ul",
            {
              staticClass: "pc-inputs",
              class: { "pc-inputs-no-grid": _vm.onlyTotalVisitors }
            },
            [
              _c("li", { staticClass: "pc-input-item pc-input-left" }, [
                _c(
                  "label",
                  [
                    _vm._m(0),
                    _vm._v(" "),
                    _c("pc-block-field", {
                      attrs: {
                        fieldProp: "sample",
                        fieldValue: _vm.sample,
                        isReadOnly: _vm.calculateProp == "sample",
                        enableEdit: _vm.enableEdit
                      },
                      on: { "update:focus": _vm.updateFocus }
                    })
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _c(
                "li",
                {
                  staticClass:
                    "pc-input-item pc-input-right pc-value-field--lockable",
                  class: [
                    _vm.getLockedStateClass("visitorsPerDay"),
                    { "pc-hidden": _vm.onlyTotalVisitors }
                  ]
                },
                [
                  _c(
                    "label",
                    [
                      _vm._m(1),
                      _vm._v(" "),
                      _c("pc-block-field", {
                        attrs: {
                          fieldProp: "visitorsPerDay",
                          fieldValue: _vm.visitorsPerDay,
                          isReadOnly: _vm.lockedField == "visitorsPerDay",
                          isBlockFocused: _vm.isBlockFocused,
                          enableEdit: _vm.enableEdit,
                          lockedField: _vm.lockedField
                        },
                        on: { "update:focus": _vm.updateFocus }
                      })
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "pc-swap-button",
                      attrs: { type: "button" },
                      on: { click: _vm.switchLockedField }
                    },
                    [
                      _c(
                        "svg",
                        {
                          attrs: {
                            width: "20px",
                            height: "20px",
                            viewBox: "0 0 20 20",
                            version: "1.1",
                            xmlns: "http://www.w3.org/2000/svg",
                            "xmlns:xlink": "http://www.w3.org/1999/xlink"
                          }
                        },
                        [
                          _c("desc", [
                            _vm._v(
                              "Lock " +
                                _vm._s(
                                  _vm.lockedField == "days"
                                    ? "number of days"
                                    : "visitors per day"
                                )
                            )
                          ]),
                          _vm._v(" "),
                          _c("defs", [
                            _c("circle", {
                              attrs: { id: "path-1", cx: "13", cy: "13", r: "10" }
                            }),
                            _vm._v(" "),
                            _c(
                              "filter",
                              {
                                attrs: {
                                  x: "-5.0%",
                                  y: "-5.0%",
                                  width: "110.0%",
                                  height: "110.0%",
                                  filterUnits: "objectBoundingBox",
                                  id: "filter-2"
                                }
                              },
                              [
                                _c("feGaussianBlur", {
                                  attrs: {
                                    stdDeviation: "0.5",
                                    in: "SourceAlpha",
                                    result: "shadowBlurInner1"
                                  }
                                }),
                                _vm._v(" "),
                                _c("feOffset", {
                                  attrs: {
                                    dx: "0",
                                    dy: "1",
                                    in: "shadowBlurInner1",
                                    result: "shadowOffsetInner1"
                                  }
                                }),
                                _vm._v(" "),
                                _c("feComposite", {
                                  attrs: {
                                    in: "shadowOffsetInner1",
                                    in2: "SourceAlpha",
                                    operator: "arithmetic",
                                    k2: "-1",
                                    k3: "1",
                                    result: "shadowInnerInner1"
                                  }
                                }),
                                _vm._v(" "),
                                _c("feColorMatrix", {
                                  attrs: {
                                    values:
                                      "0 0 0 0 0.489716199   0 0 0 0 0.489716199   0 0 0 0 0.489716199  0 0 0 0.5 0",
                                    type: "matrix",
                                    in: "shadowInnerInner1"
                                  }
                                })
                              ],
                              1
                            )
                          ]),
                          _vm._v(" "),
                          _c(
                            "g",
                            {
                              attrs: {
                                id: "Page-1",
                                stroke: "none",
                                "stroke-width": "1",
                                fill: "none",
                                "fill-rule": "evenodd"
                              }
                            },
                            [
                              _c(
                                "g",
                                {
                                  attrs: {
                                    id: "Power-Calculator",
                                    transform: "translate(-550.000000, -522.000000)"
                                  }
                                },
                                [
                                  _c(
                                    "g",
                                    {
                                      attrs: {
                                        id: "Switcher",
                                        transform:
                                          "translate(547.000000, 519.000000)"
                                      }
                                    },
                                    [
                                      _c("g", { attrs: { id: "Oval-3" } }, [
                                        _c("use", {
                                          attrs: {
                                            fill: "#EFEFEF",
                                            "fill-rule": "evenodd",
                                            "xlink:href": "#path-1"
                                          }
                                        }),
                                        _vm._v(" "),
                                        _c("use", {
                                          attrs: {
                                            fill: "black",
                                            "fill-opacity": "1",
                                            filter: "url(#filter-2)",
                                            "xlink:href": "#path-1"
                                          }
                                        })
                                      ]),
                                      _vm._v(" "),
                                      _c(
                                        "g",
                                        {
                                          attrs: {
                                            id: "Group",
                                            "stroke-width": "1",
                                            "fill-rule": "evenodd",
                                            transform:
                                              "translate(7.000000, 7.000000)",
                                            fill: "#155EAB"
                                          }
                                        },
                                        [
                                          _c("path", {
                                            attrs: {
                                              d:
                                                "M4.5,4.20404051 L4.5,9.9127641 L2.5,9.9127641 L2.5,4.20404051 L0.5,4.20404051 L3.5,0.70872359 L6.5,4.20404051 L4.5,4.20404051 Z",
                                              id: "Combined-Shape"
                                            }
                                          }),
                                          _vm._v(" "),
                                          _c("path", {
                                            attrs: {
                                              d:
                                                "M9.5,5.49531692 L9.5,11.2040405 L7.5,11.2040405 L7.5,5.49531692 L5.5,5.49531692 L8.5,2 L11.5,5.49531692 L9.5,5.49531692 Z",
                                              id: "Combined-Shape",
                                              transform:
                                                "translate(8.500000, 6.602020) scale(1, -1) translate(-8.500000, -6.602020) "
                                            }
                                          })
                                        ]
                                      )
                                    ]
                                  )
                                ]
                              )
                            ]
                          )
                        ]
                      )
                    ]
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "li",
                {
                  staticClass:
                    "pc-input-item pc-input-right-swap pc-value-field--lockable",
                  class: [
                    _vm.getLockedStateClass("days"),
                    { "pc-hidden": _vm.onlyTotalVisitors }
                  ]
                },
                [
                  _c(
                    "label",
                    [
                      _c("pc-block-field", {
                        attrs: {
                          fieldProp: "runtime",
                          prefix: "",
                          suffix: " days",
                          fieldValue: _vm.runtime,
                          isReadOnly: _vm.lockedField == "days",
                          isBlockFocused: _vm.isBlockFocused,
                          enableEdit: _vm.enableEdit,
                          lockedField: _vm.lockedField,
                          "aria-label": "Days"
                        },
                        on: { "update:focus": _vm.updateFocus }
                      })
                    ],
                    1
                  )
                ]
              )
            ]
          )
        ],
        1
      )
    };
    var __vue_staticRenderFns__$5 = [
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("span", { staticClass: "pc-input-title" }, [
          _vm._v("Total # "),
          _c("small", { staticClass: "pc-input-sub-title" }, [
            _vm._v("of new visitors")
          ])
        ])
      },
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("span", { staticClass: "pc-input-title" }, [
          _vm._v("Daily # "),
          _c("small", { staticClass: "pc-input-sub-title" }, [
            _vm._v("of new visitors")
          ])
        ])
      }
    ];
    __vue_render__$5._withStripped = true;

      /* style */
      const __vue_inject_styles__$5 = function (inject) {
        if (!inject) return
        inject("data-v-d4c748a8_0", { source: "\n.pc-swap-button {\n    -webkit-appearance: none;\n    background: none;\n    border: 0;\n    margin: 0;\n    padding: 0;\n    position: absolute;\n    top: calc(100% - 10px);\n    left: 5px;\n    z-index: 5;\n}\n.pc-value-field--unlocked .pc-value-field-wrapper {\n    z-index: 1;\n}\n.pc-block-to-calculate  .pc-value-field--locked .pc-value-formatting:before,\n.pc-block-to-calculate  .pc-value-field--locked .pc-value-formatting:after,\n.pc-value-field--locked .pc-value-formatting:before,\n.pc-value-field--locked .pc-value-formatting:after,\n.pc-value-field--locked .pc-value-field-wrapper {\n    color: var(--dark-gray);\n}\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/sample-comp.vue"],"names":[],"mappings":";AAwJA;IACA,wBAAA;IACA,gBAAA;IACA,SAAA;IACA,SAAA;IACA,UAAA;IACA,kBAAA;IACA,sBAAA;IACA,SAAA;IACA,UAAA;AACA;AAEA;IACA,UAAA;AACA;AAEA;;;;;IAKA,uBAAA;AACA","file":"sample-comp.vue","sourcesContent":["<template id=\"sample-comp\">\n    <div class=\"pc-block pc-block--sample\" :class=\"{'pc-block-focused': isBlockFocused == 'sample', 'pc-block-to-calculate': calculateProp == 'sample'}\">\n\n        <pc-svg-chain v-bind:calculateProp=\"calculateProp\" v-bind:fieldFromBlock=\"fieldFromBlock\"></pc-svg-chain>\n\n        <label slot=\"text\" class=\"pc-calc-radio pc-calc-radio--sample\" :class=\"{'pc-calc-radio--active': isCalculated}\">\n            <input type=\"radio\" v-model=\"isCalculated\" :value=\"true\" >\n                {{ isCalculated ? 'Calculating' : 'Calculate' }}\n        </label>\n\n        <div class=\"pc-header\">\n            Sample Size\n        </div>\n\n\n        <ul class=\"pc-inputs\" :class=\"{'pc-inputs-no-grid': onlyTotalVisitors}\">\n            <li class=\"pc-input-item pc-input-left\">\n                <label>\n                    <span class=\"pc-input-title\">Total # <small class=\"pc-input-sub-title\">of new visitors</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"sample\"\n\n                        v-bind:fieldValue=\"sample\"\n                        v-bind:isReadOnly=\"calculateProp == 'sample'\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n            </li>\n            <li class=\"pc-input-item pc-input-right pc-value-field--lockable\" :class=\"[getLockedStateClass('visitorsPerDay'), {'pc-hidden': onlyTotalVisitors}]\">\n                <label>\n                    <span class=\"pc-input-title\">Daily # <small class=\"pc-input-sub-title\">of new visitors</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"visitorsPerDay\"\n                        v-bind:fieldValue=\"visitorsPerDay\"\n                        v-bind:isReadOnly=\"lockedField == 'visitorsPerDay'\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-bind:lockedField=\"lockedField\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n\n                <button type=\"button\" class=\"pc-swap-button\" v-on:click=\"switchLockedField\">\n                    <svg width=\"20px\" height=\"20px\" viewBox=\"0 0 20 20\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n                        <desc>Lock {{ lockedField == 'days' ? 'number of days' : 'visitors per day' }}</desc>\n                        <defs>\n                            <circle id=\"path-1\" cx=\"13\" cy=\"13\" r=\"10\"></circle>\n                            <filter x=\"-5.0%\" y=\"-5.0%\" width=\"110.0%\" height=\"110.0%\" filterUnits=\"objectBoundingBox\" id=\"filter-2\">\n                                <feGaussianBlur stdDeviation=\"0.5\" in=\"SourceAlpha\" result=\"shadowBlurInner1\"></feGaussianBlur>\n                                <feOffset dx=\"0\" dy=\"1\" in=\"shadowBlurInner1\" result=\"shadowOffsetInner1\"></feOffset>\n                                <feComposite in=\"shadowOffsetInner1\" in2=\"SourceAlpha\" operator=\"arithmetic\" k2=\"-1\" k3=\"1\" result=\"shadowInnerInner1\"></feComposite>\n                                <feColorMatrix values=\"0 0 0 0 0.489716199   0 0 0 0 0.489716199   0 0 0 0 0.489716199  0 0 0 0.5 0\" type=\"matrix\" in=\"shadowInnerInner1\"></feColorMatrix>\n                            </filter>\n                        </defs>\n                        <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n                            <g id=\"Power-Calculator\" transform=\"translate(-550.000000, -522.000000)\">\n                                <g id=\"Switcher\" transform=\"translate(547.000000, 519.000000)\">\n                                    <g id=\"Oval-3\">\n                                        <use fill=\"#EFEFEF\" fill-rule=\"evenodd\" xlink:href=\"#path-1\"></use>\n                                        <use fill=\"black\" fill-opacity=\"1\" filter=\"url(#filter-2)\" xlink:href=\"#path-1\"></use>\n                                    </g>\n                                    <g id=\"Group\" stroke-width=\"1\" fill-rule=\"evenodd\" transform=\"translate(7.000000, 7.000000)\" fill=\"#155EAB\">\n                                        <path d=\"M4.5,4.20404051 L4.5,9.9127641 L2.5,9.9127641 L2.5,4.20404051 L0.5,4.20404051 L3.5,0.70872359 L6.5,4.20404051 L4.5,4.20404051 Z\" id=\"Combined-Shape\"></path>\n                                        <path d=\"M9.5,5.49531692 L9.5,11.2040405 L7.5,11.2040405 L7.5,5.49531692 L5.5,5.49531692 L8.5,2 L11.5,5.49531692 L9.5,5.49531692 Z\" id=\"Combined-Shape\" transform=\"translate(8.500000, 6.602020) scale(1, -1) translate(-8.500000, -6.602020) \"></path>\n                                    </g>\n                                </g>\n                            </g>\n                        </g>\n                    </svg>\n                </button>\n\n            </li>\n            <li class=\"pc-input-item pc-input-right-swap pc-value-field--lockable\" :class=\"[getLockedStateClass('days'), {'pc-hidden': onlyTotalVisitors}]\">\n                <label>\n                    <pc-block-field\n                        fieldProp=\"runtime\"\n                        prefix=\"\"\n                        suffix=\" days\"\n                        v-bind:fieldValue=\"runtime\"\n                        v-bind:isReadOnly=\"lockedField == 'days'\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-bind:lockedField=\"lockedField\"\n\n                        v-on:update:focus=\"updateFocus\"\n                        aria-label=\"Days\"></pc-block-field>\n                </label>\n            </li>\n        </ul>\n    </div>\n</template>\n\n<script>\nimport pcBlock from './pc-block.vue'\n\nexport default {\n    props: ['enableEdit', 'isBlockFocused', 'fieldFromBlock'],\n    template: '#sample-comp',\n    extends: pcBlock,\n    data () {\n        return {\n            focusedBlock: ''\n        }\n    },\n    computed: {\n        sample () {\n            return this.$store.state.attributes.sample\n        },\n        visitorsPerDay () {\n            return this.$store.state.attributes.visitorsPerDay\n        },\n        runtime () {\n            return this.$store.state.attributes.runtime\n        },\n        lockedField () {\n            return this.$store.state.attributes.lockedField\n        },\n        onlyTotalVisitors () {\n            return this.$store.state.attributes.onlyTotalVisitors\n        },\n    },\n    methods: {\n        updateFocus ({fieldProp, value}) {\n\n            if (this.focusedBlock == fieldProp && value === false) {\n                this.focusedBlock = ''\n            } else if (value === true) {\n                this.focusedBlock = fieldProp\n            }\n\n            this.$emit('update:focus', {\n                fieldProp: this.fieldFromBlock,\n                value: value\n            })\n        },\n        switchLockedField () {\n            this.$store.dispatch('switch:lockedfield');\n        },\n        getLockedStateClass (param) {\n            return this.lockedField == param ? 'pc-value-field--locked' : 'pc-value-field--unlocked'\n        }\n    }\n}\n\n</script>\n\n<style>\n.pc-swap-button {\n    -webkit-appearance: none;\n    background: none;\n    border: 0;\n    margin: 0;\n    padding: 0;\n    position: absolute;\n    top: calc(100% - 10px);\n    left: 5px;\n    z-index: 5;\n}\n\n.pc-value-field--unlocked .pc-value-field-wrapper {\n    z-index: 1;\n}\n\n.pc-block-to-calculate  .pc-value-field--locked .pc-value-formatting:before,\n.pc-block-to-calculate  .pc-value-field--locked .pc-value-formatting:after,\n.pc-value-field--locked .pc-value-formatting:before,\n.pc-value-field--locked .pc-value-formatting:after,\n.pc-value-field--locked .pc-value-field-wrapper {\n    color: var(--dark-gray);\n}\n</style>\n\n<style scoped>\n.pc-inputs {\n    grid-template-areas:\n        \"pc-input-left pc-input-right\"\n        \"pc-input-left-swap pc-input-right-swap\"\n    ;\n}\n\n.pc-input-right-swap,\n.pc-input-right {\n    position: relative;\n}\n\n.pc-input-right-swap {\n    grid-area: pc-input-right-swap;\n    margin-top: -10px;\n    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1)) drop-shadow(0 -4px 2px rgba(0,0,0,0.1));\n}\n\n.pc-input-right-swap .pc-value-field-wrapper {\n    filter: none;\n}\n\n.pc-value-formatting:after {\n    font-size: 14px;\n}\n\n.pc-block-to-calculate .pc-field-visitorsPerDay,\n.pc-block-to-calculate .pc-field-runtime {\n    background: var(--white);\n}\n\n.pc-value-field--lockable.pc-value-field--locked .pc-value-field-wrapper {\n    background: linear-gradient(0deg, var(--light-gray) 0%, var(--white) 100%);\n}\n\n.pc-inputs-no-grid {\n    display: block;\n}\n\n</style>\n"]}, media: undefined })
    ,inject("data-v-d4c748a8_1", { source: "\n.pc-inputs[data-v-d4c748a8] {\n    grid-template-areas:\n        \"pc-input-left pc-input-right\"\n        \"pc-input-left-swap pc-input-right-swap\"\n    ;\n}\n.pc-input-right-swap[data-v-d4c748a8],\n.pc-input-right[data-v-d4c748a8] {\n    position: relative;\n}\n.pc-input-right-swap[data-v-d4c748a8] {\n    grid-area: pc-input-right-swap;\n    margin-top: -10px;\n    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1)) drop-shadow(0 -4px 2px rgba(0,0,0,0.1));\n}\n.pc-input-right-swap .pc-value-field-wrapper[data-v-d4c748a8] {\n    filter: none;\n}\n.pc-value-formatting[data-v-d4c748a8]:after {\n    font-size: 14px;\n}\n.pc-block-to-calculate .pc-field-visitorsPerDay[data-v-d4c748a8],\n.pc-block-to-calculate .pc-field-runtime[data-v-d4c748a8] {\n    background: var(--white);\n}\n.pc-value-field--lockable.pc-value-field--locked .pc-value-field-wrapper[data-v-d4c748a8] {\n    background: linear-gradient(0deg, var(--light-gray) 0%, var(--white) 100%);\n}\n.pc-inputs-no-grid[data-v-d4c748a8] {\n    display: block;\n}\n\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/sample-comp.vue"],"names":[],"mappings":";AAkLA;IACA;;;IAGA;AACA;AAEA;;IAEA,kBAAA;AACA;AAEA;IACA,8BAAA;IACA,iBAAA;IACA,sFAAA;AACA;AAEA;IACA,YAAA;AACA;AAEA;IACA,eAAA;AACA;AAEA;;IAEA,wBAAA;AACA;AAEA;IACA,0EAAA;AACA;AAEA;IACA,cAAA;AACA","file":"sample-comp.vue","sourcesContent":["<template id=\"sample-comp\">\n    <div class=\"pc-block pc-block--sample\" :class=\"{'pc-block-focused': isBlockFocused == 'sample', 'pc-block-to-calculate': calculateProp == 'sample'}\">\n\n        <pc-svg-chain v-bind:calculateProp=\"calculateProp\" v-bind:fieldFromBlock=\"fieldFromBlock\"></pc-svg-chain>\n\n        <label slot=\"text\" class=\"pc-calc-radio pc-calc-radio--sample\" :class=\"{'pc-calc-radio--active': isCalculated}\">\n            <input type=\"radio\" v-model=\"isCalculated\" :value=\"true\" >\n                {{ isCalculated ? 'Calculating' : 'Calculate' }}\n        </label>\n\n        <div class=\"pc-header\">\n            Sample Size\n        </div>\n\n\n        <ul class=\"pc-inputs\" :class=\"{'pc-inputs-no-grid': onlyTotalVisitors}\">\n            <li class=\"pc-input-item pc-input-left\">\n                <label>\n                    <span class=\"pc-input-title\">Total # <small class=\"pc-input-sub-title\">of new visitors</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"sample\"\n\n                        v-bind:fieldValue=\"sample\"\n                        v-bind:isReadOnly=\"calculateProp == 'sample'\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n            </li>\n            <li class=\"pc-input-item pc-input-right pc-value-field--lockable\" :class=\"[getLockedStateClass('visitorsPerDay'), {'pc-hidden': onlyTotalVisitors}]\">\n                <label>\n                    <span class=\"pc-input-title\">Daily # <small class=\"pc-input-sub-title\">of new visitors</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"visitorsPerDay\"\n                        v-bind:fieldValue=\"visitorsPerDay\"\n                        v-bind:isReadOnly=\"lockedField == 'visitorsPerDay'\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-bind:lockedField=\"lockedField\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n\n                <button type=\"button\" class=\"pc-swap-button\" v-on:click=\"switchLockedField\">\n                    <svg width=\"20px\" height=\"20px\" viewBox=\"0 0 20 20\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n                        <desc>Lock {{ lockedField == 'days' ? 'number of days' : 'visitors per day' }}</desc>\n                        <defs>\n                            <circle id=\"path-1\" cx=\"13\" cy=\"13\" r=\"10\"></circle>\n                            <filter x=\"-5.0%\" y=\"-5.0%\" width=\"110.0%\" height=\"110.0%\" filterUnits=\"objectBoundingBox\" id=\"filter-2\">\n                                <feGaussianBlur stdDeviation=\"0.5\" in=\"SourceAlpha\" result=\"shadowBlurInner1\"></feGaussianBlur>\n                                <feOffset dx=\"0\" dy=\"1\" in=\"shadowBlurInner1\" result=\"shadowOffsetInner1\"></feOffset>\n                                <feComposite in=\"shadowOffsetInner1\" in2=\"SourceAlpha\" operator=\"arithmetic\" k2=\"-1\" k3=\"1\" result=\"shadowInnerInner1\"></feComposite>\n                                <feColorMatrix values=\"0 0 0 0 0.489716199   0 0 0 0 0.489716199   0 0 0 0 0.489716199  0 0 0 0.5 0\" type=\"matrix\" in=\"shadowInnerInner1\"></feColorMatrix>\n                            </filter>\n                        </defs>\n                        <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n                            <g id=\"Power-Calculator\" transform=\"translate(-550.000000, -522.000000)\">\n                                <g id=\"Switcher\" transform=\"translate(547.000000, 519.000000)\">\n                                    <g id=\"Oval-3\">\n                                        <use fill=\"#EFEFEF\" fill-rule=\"evenodd\" xlink:href=\"#path-1\"></use>\n                                        <use fill=\"black\" fill-opacity=\"1\" filter=\"url(#filter-2)\" xlink:href=\"#path-1\"></use>\n                                    </g>\n                                    <g id=\"Group\" stroke-width=\"1\" fill-rule=\"evenodd\" transform=\"translate(7.000000, 7.000000)\" fill=\"#155EAB\">\n                                        <path d=\"M4.5,4.20404051 L4.5,9.9127641 L2.5,9.9127641 L2.5,4.20404051 L0.5,4.20404051 L3.5,0.70872359 L6.5,4.20404051 L4.5,4.20404051 Z\" id=\"Combined-Shape\"></path>\n                                        <path d=\"M9.5,5.49531692 L9.5,11.2040405 L7.5,11.2040405 L7.5,5.49531692 L5.5,5.49531692 L8.5,2 L11.5,5.49531692 L9.5,5.49531692 Z\" id=\"Combined-Shape\" transform=\"translate(8.500000, 6.602020) scale(1, -1) translate(-8.500000, -6.602020) \"></path>\n                                    </g>\n                                </g>\n                            </g>\n                        </g>\n                    </svg>\n                </button>\n\n            </li>\n            <li class=\"pc-input-item pc-input-right-swap pc-value-field--lockable\" :class=\"[getLockedStateClass('days'), {'pc-hidden': onlyTotalVisitors}]\">\n                <label>\n                    <pc-block-field\n                        fieldProp=\"runtime\"\n                        prefix=\"\"\n                        suffix=\" days\"\n                        v-bind:fieldValue=\"runtime\"\n                        v-bind:isReadOnly=\"lockedField == 'days'\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-bind:lockedField=\"lockedField\"\n\n                        v-on:update:focus=\"updateFocus\"\n                        aria-label=\"Days\"></pc-block-field>\n                </label>\n            </li>\n        </ul>\n    </div>\n</template>\n\n<script>\nimport pcBlock from './pc-block.vue'\n\nexport default {\n    props: ['enableEdit', 'isBlockFocused', 'fieldFromBlock'],\n    template: '#sample-comp',\n    extends: pcBlock,\n    data () {\n        return {\n            focusedBlock: ''\n        }\n    },\n    computed: {\n        sample () {\n            return this.$store.state.attributes.sample\n        },\n        visitorsPerDay () {\n            return this.$store.state.attributes.visitorsPerDay\n        },\n        runtime () {\n            return this.$store.state.attributes.runtime\n        },\n        lockedField () {\n            return this.$store.state.attributes.lockedField\n        },\n        onlyTotalVisitors () {\n            return this.$store.state.attributes.onlyTotalVisitors\n        },\n    },\n    methods: {\n        updateFocus ({fieldProp, value}) {\n\n            if (this.focusedBlock == fieldProp && value === false) {\n                this.focusedBlock = ''\n            } else if (value === true) {\n                this.focusedBlock = fieldProp\n            }\n\n            this.$emit('update:focus', {\n                fieldProp: this.fieldFromBlock,\n                value: value\n            })\n        },\n        switchLockedField () {\n            this.$store.dispatch('switch:lockedfield');\n        },\n        getLockedStateClass (param) {\n            return this.lockedField == param ? 'pc-value-field--locked' : 'pc-value-field--unlocked'\n        }\n    }\n}\n\n</script>\n\n<style>\n.pc-swap-button {\n    -webkit-appearance: none;\n    background: none;\n    border: 0;\n    margin: 0;\n    padding: 0;\n    position: absolute;\n    top: calc(100% - 10px);\n    left: 5px;\n    z-index: 5;\n}\n\n.pc-value-field--unlocked .pc-value-field-wrapper {\n    z-index: 1;\n}\n\n.pc-block-to-calculate  .pc-value-field--locked .pc-value-formatting:before,\n.pc-block-to-calculate  .pc-value-field--locked .pc-value-formatting:after,\n.pc-value-field--locked .pc-value-formatting:before,\n.pc-value-field--locked .pc-value-formatting:after,\n.pc-value-field--locked .pc-value-field-wrapper {\n    color: var(--dark-gray);\n}\n</style>\n\n<style scoped>\n.pc-inputs {\n    grid-template-areas:\n        \"pc-input-left pc-input-right\"\n        \"pc-input-left-swap pc-input-right-swap\"\n    ;\n}\n\n.pc-input-right-swap,\n.pc-input-right {\n    position: relative;\n}\n\n.pc-input-right-swap {\n    grid-area: pc-input-right-swap;\n    margin-top: -10px;\n    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1)) drop-shadow(0 -4px 2px rgba(0,0,0,0.1));\n}\n\n.pc-input-right-swap .pc-value-field-wrapper {\n    filter: none;\n}\n\n.pc-value-formatting:after {\n    font-size: 14px;\n}\n\n.pc-block-to-calculate .pc-field-visitorsPerDay,\n.pc-block-to-calculate .pc-field-runtime {\n    background: var(--white);\n}\n\n.pc-value-field--lockable.pc-value-field--locked .pc-value-field-wrapper {\n    background: linear-gradient(0deg, var(--light-gray) 0%, var(--white) 100%);\n}\n\n.pc-inputs-no-grid {\n    display: block;\n}\n\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$5 = "data-v-d4c748a8";
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

    var script$6 = {
        extends: __vue_component__$4,
        template: '#impact-comp',
        props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused', 'isnoninferiority'],
        data () {
            return {
                focusedBlock: ''
            }
        },
        computed: {
            days () {
                return this.$store.state.attributes.runtime
            },
            base () {
                return this.$store.state.attributes.base
            },
            sample () {
                return this.$store.state.attributes.sample
            },
            impact () {
                return this.$store.state.attributes.impact
            },
            testType () {
                return this.$store.state.attributes.testType
            },
            isReadOnly () {
                return this.calculateProp == 'impact'
            },
            impactByMetricDisplay () {
                return this.$store.getters.impactByMetricDisplay
            },
            impactByMetricMinDisplay () {
                return this.$store.getters.impactByMetricMinDisplay
            },
            impactByMetricMaxDisplay () {
                return this.$store.getters.impactByMetricMaxDisplay
            },
            impactByVisitorsDisplay () {
                return this.$store.getters.impactByVisitorsDisplay
            },
            impactByVisitorsPerDayDisplay () {
                return this.$store.getters.impactByVisitorsPerDayDisplay
            }
        },
        watch: {
            isReadOnly () {
                return this.calculateProp == 'impact'
            }
        },
        methods: {
            updateFocus ({fieldProp, value}) {
                if (this.focusedBlock == fieldProp && value === false) {
                    this.focusedBlock = '';
                } else if (value === true) {
                    this.focusedBlock = fieldProp;
                }

                this.$emit('update:focus', {
                    fieldProp: this.fieldFromBlock,
                    value: value
                });
            },
            addPercentToString (str) {
                let result = str;
                if (this.testType == 'gTest') {
                    result += '%';
                }

                return result
            }
        }
    };

    /* script */
    const __vue_script__$6 = script$6;

    /* template */
    var __vue_render__$6 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "div",
        {
          staticClass: "pc-block pc-block--impact",
          class: {
            "pc-block-focused": _vm.isBlockFocused,
            "pc-block-to-calculate": _vm.calculateProp == "impact"
          }
        },
        [
          _c("pc-svg-chain", {
            attrs: {
              calculateProp: _vm.calculateProp,
              fieldFromBlock: _vm.fieldFromBlock
            }
          }),
          _vm._v(" "),
          _c(
            "label",
            {
              staticClass: "pc-calc-radio pc-calc-radio--impact",
              class: { "pc-calc-radio--active": _vm.isCalculated },
              attrs: { slot: "text" },
              slot: "text"
            },
            [
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.isCalculated,
                    expression: "isCalculated"
                  }
                ],
                attrs: { type: "radio" },
                domProps: { value: true, checked: _vm._q(_vm.isCalculated, true) },
                on: {
                  change: function($event) {
                    _vm.isCalculated = true;
                  }
                }
              }),
              _vm._v(
                "\n            " +
                  _vm._s(_vm.isCalculated ? "Calculating" : "Calculate") +
                  "\n    "
              )
            ]
          ),
          _vm._v(" "),
          _c("div", { staticClass: "pc-header" }, [
            _vm._v("\n        Impact\n    ")
          ]),
          _vm._v(" "),
          _c("ul", { staticClass: "pc-inputs" }, [
            _c("li", { staticClass: "pc-input-item pc-input-left" }, [
              _c(
                "label",
                [
                  _c("span", { staticClass: "pc-input-title" }, [
                    _vm._v("Relative")
                  ]),
                  _vm._v(" "),
                  _c("pc-block-field", {
                    staticClass: "pc-input-field",
                    attrs: {
                      prefix: _vm.isnoninferiority ? "" : "±",
                      suffix: "%",
                      fieldProp: "impact",
                      fieldValue: _vm.impact,
                      testType: _vm.testType,
                      isReadOnly: _vm.calculateProp == "impact",
                      isBlockFocused: _vm.isBlockFocused,
                      enableEdit: _vm.enableEdit
                    },
                    on: { "update:focus": _vm.updateFocus }
                  })
                ],
                1
              )
            ]),
            _vm._v(" "),
            _c("li", { staticClass: "pc-input-item pc-input-right" }, [
              _c(
                "label",
                [
                  _c("span", { staticClass: "pc-input-title" }, [
                    _vm._v("Absolute")
                  ]),
                  _vm._v(" "),
                  _c("pc-block-field", {
                    staticClass: "pc-input-field",
                    attrs: {
                      fieldProp: "impactByMetricValue",
                      suffix: _vm.testType == "gTest" ? "%" : "",
                      fieldValue: _vm.impactByMetricDisplay,
                      testType: _vm.testType,
                      isReadOnly: _vm.isReadOnly,
                      isBlockFocused: _vm.isBlockFocused,
                      enableEdit: _vm.enableEdit,
                      "aria-label": "visitors with goals"
                    },
                    on: { "update:focus": _vm.updateFocus }
                  }),
                  _vm._v(" "),
                  _c("span", { staticClass: "pc-input-details" }, [
                    _vm._v(
                      "\n                        going from " +
                        _vm._s(_vm.addPercentToString(_vm.base)) +
                        " to\n                        either " +
                        _vm._s(
                          _vm.addPercentToString(_vm.impactByMetricMinDisplay)
                        ) +
                        " or\n                        " +
                        _vm._s(
                          _vm.addPercentToString(_vm.impactByMetricMaxDisplay)
                        ) +
                        "\n                    "
                    )
                  ])
                ],
                1
              )
            ]),
            _vm._v(" "),
            _c("li", { staticClass: "pc-input-item pc-input-bottom-left" }, [
              _c(
                "label",
                [
                  _c("pc-block-field", {
                    staticClass: "pc-input-field",
                    attrs: {
                      fieldProp: "impactByVisitors",
                      fieldValue: _vm.impactByVisitorsDisplay,
                      testType: _vm.testType,
                      isReadOnly: _vm.isReadOnly,
                      isBlockFocused: _vm.isBlockFocused,
                      enableEdit: _vm.enableEdit && _vm.calculateProp != "sample"
                    },
                    on: { "update:focus": _vm.updateFocus }
                  }),
                  _vm._v(" "),
                  _c("span", { staticClass: "pc-input-details" }, [
                    _vm._v(
                      "\n                    " +
                        _vm._s(
                          _vm.testType == "gTest"
                            ? " Incremental units"
                            : " Incremental change in the metric"
                        ) +
                        "\n                "
                    )
                  ])
                ],
                1
              )
            ]),
            _vm._v(" "),
            _c("li", { staticClass: "pc-input-item pc-input-bottom-right" }, [
              _c(
                "label",
                [
                  _c("pc-block-field", {
                    attrs: {
                      fieldProp: "impactByVisitorsPerDay",
                      fieldValue: _vm.impactByVisitorsPerDayDisplay,
                      testType: _vm.testType,
                      isReadOnly: _vm.isReadOnly,
                      isBlockFocused: _vm.isBlockFocused,
                      enableEdit: _vm.enableEdit && _vm.calculateProp != "sample"
                    },
                    on: { "update:focus": _vm.updateFocus }
                  }),
                  _vm._v(" "),
                  _c("span", { staticClass: "pc-input-details" }, [
                    _vm._v(
                      "\n                    " +
                        _vm._s(
                          _vm.testType == "gTest"
                            ? " Incremental units per day"
                            : " Incremental change in the metric per day"
                        ) +
                        "\n                "
                    )
                  ])
                ],
                1
              )
            ])
          ])
        ],
        1
      )
    };
    var __vue_staticRenderFns__$6 = [];
    __vue_render__$6._withStripped = true;

      /* style */
      const __vue_inject_styles__$6 = function (inject) {
        if (!inject) return
        inject("data-v-4a008d42_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"impact-comp.vue"}, media: undefined });

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

    //

    var script$7 = {
        props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused'],
        extends: __vue_component__$4,
        template: '#base-comp',
        data () {
            return {
                focusedBlock: '',
            }
        },
        computed: {
            isReadOnly () {
                return this.calculateProp == 'base'
            },
            base () {
                return this.$store.state.attributes.base
            },
            sdRate () {
                return this.$store.state.attributes.sdRate
            },
            sample () {
                return this.$store.state.attributes.sample
            },
            testType () {
                return this.$store.state.attributes.testType
            },
            visitorsWithGoals () {
                return this.$store.getters.visitorsWithGoals
            }
        },
        methods: {
            enableInput () {
                this.$emit('edit:update', {prop: 'base'});
            },
            updateFocus ({fieldProp, value}) {
                if (this.focusedBlock == fieldProp && value === false) {
                    this.focusedBlock = '';
                } else if (value === true) {
                    this.focusedBlock = fieldProp;
                }

                this.$emit('update:focus', {
                    fieldProp: this.fieldFromBlock,
                    value: value
                });
            }

        }
    };

    /* script */
    const __vue_script__$7 = script$7;

    /* template */
    var __vue_render__$7 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "div",
        {
          staticClass: "pc-block pc-block--base",
          class: { "pc-block-focused": _vm.focusedblock == "base" }
        },
        [
          _c("pc-svg-chain", { attrs: { fieldFromBlock: _vm.fieldFromBlock } }),
          _vm._v(" "),
          _vm.testType == "gTest"
            ? _c("div", { staticClass: "pc-header" }, [
                _vm._v("\n        Base Rate\n    ")
              ])
            : _c("div", { staticClass: "pc-header" }, [
                _vm._v("\n        Base Average\n    ")
              ]),
          _vm._v(" "),
          _c("ul", { staticClass: "pc-inputs" }, [
            _c("li", { staticClass: "pc-input-item pc-input-left" }, [
              _c(
                "label",
                [
                  _c("span", { staticClass: "pc-input-title" }, [
                    _vm._v(
                      _vm._s(
                        _vm.testType == "gTest" ? "Base Rate" : "Base Average"
                      ) + " "
                    ),
                    _c("small", { staticClass: "pc-input-sub-title" }, [
                      _vm._v("conversion")
                    ])
                  ]),
                  _vm._v(" "),
                  _c("pc-block-field", {
                    attrs: {
                      fieldProp: "base",
                      suffix: _vm.testType == "gTest" ? "%" : "",
                      fieldValue: _vm.base,
                      isReadOnly: _vm.isReadOnly,
                      isBlockFocused: _vm.isBlockFocused,
                      enableEdit: _vm.enableEdit
                    },
                    on: { "update:focus": _vm.updateFocus }
                  })
                ],
                1
              )
            ]),
            _vm._v(" "),
            _c("li", { staticClass: "pc-input-item pc-input-right" }, [
              _c(
                "label",
                [
                  _vm._m(0),
                  _vm._v(" "),
                  _c("pc-block-field", {
                    attrs: {
                      fieldProp: "visitorsWithGoals",
                      fieldValue: _vm.visitorsWithGoals,
                      fieldFromBlock: _vm.fieldFromBlock,
                      isBlockFocused: _vm.isBlockFocused,
                      isReadOnly: _vm.isReadOnly,
                      enableEdit: _vm.enableEdit && this.calculateProp != "sample"
                    },
                    on: { "update:focus": _vm.updateFocus }
                  })
                ],
                1
              )
            ]),
            _vm._v(" "),
            _vm.testType == "tTest"
              ? _c("li", { staticClass: "pc-input-item pc-input-sd-rate" }, [
                  _c(
                    "label",
                    [
                      _c("pc-block-field", {
                        attrs: {
                          prefix: "±",
                          fieldProp: "sdRate",
                          fieldFromBlock: "base",
                          fieldValue: _vm.sdRate,
                          isReadOnly: _vm.isReadOnly,
                          isBlockFocused: _vm.isBlockFocused,
                          enableEdit: _vm.enableEdit
                        },
                        on: { "update:focus": _vm.updateFocus }
                      }),
                      _vm._v(" "),
                      _c("span", { staticClass: "pc-input-details" }, [
                        _vm._v("Base Standard deviation")
                      ])
                    ],
                    1
                  )
                ])
              : _vm._e()
          ])
        ],
        1
      )
    };
    var __vue_staticRenderFns__$7 = [
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("span", { staticClass: "pc-input-title" }, [
          _vm._v("Metric Totals"),
          _c("small", { staticClass: "pc-input-sub-title" }, [
            _vm._v("visitors reached goal")
          ])
        ])
      }
    ];
    __vue_render__$7._withStripped = true;

      /* style */
      const __vue_inject_styles__$7 = function (inject) {
        if (!inject) return
        inject("data-v-33128dbf_0", { source: "\n.pc-input-sd-rate {\n    margin-top: -10px;\n    z-index: 1;\n    position: relative;\n    text-align: center;\n}\n.pc-field-sdRate {\n    width: 90%;\n    display: inline-block;\n}\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/base-comp.vue"],"names":[],"mappings":";AAyHA;IACA,iBAAA;IACA,UAAA;IACA,kBAAA;IACA,kBAAA;AACA;AAEA;IACA,UAAA;IACA,qBAAA;AACA","file":"base-comp.vue","sourcesContent":["<template id=\"base-comp\">\n    <div class=\"pc-block pc-block--base\" :class=\"{'pc-block-focused': focusedblock == 'base'}\">\n\n        <pc-svg-chain v-bind:fieldFromBlock=\"fieldFromBlock\"></pc-svg-chain>\n\n        <div class=\"pc-header\" v-if=\"testType == 'gTest'\">\n            Base Rate\n        </div>\n        <div class=\"pc-header\" v-else>\n            Base Average\n        </div>\n\n        <ul class=\"pc-inputs\">\n            <li class=\"pc-input-item pc-input-left\">\n                <label>\n                    <span class=\"pc-input-title\">{{testType == 'gTest' ? 'Base Rate' : 'Base Average'}} <small class=\"pc-input-sub-title\">conversion</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"base\"\n                        :suffix=\"testType == 'gTest' ? '%' : ''\"\n\n                        v-bind:fieldValue=\"base\"\n                        v-bind:isReadOnly=\"isReadOnly\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n            </li>\n\n            <li class=\"pc-input-item pc-input-right\">\n                <label>\n                    <span class=\"pc-input-title\">Metric Totals<small class=\"pc-input-sub-title\">visitors reached goal</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"visitorsWithGoals\"\n                        v-bind:fieldValue=\"visitorsWithGoals\"\n                        v-bind:fieldFromBlock=\"fieldFromBlock\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:isReadOnly=\"isReadOnly\"\n                        v-bind:enableEdit=\"enableEdit && this.calculateProp != 'sample'\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n            </li>\n\n            <li class=\"pc-input-item pc-input-sd-rate\" v-if=\"testType == 'tTest'\">\n                <label>\n                    <pc-block-field\n                        prefix=\"±\"\n                        fieldProp=\"sdRate\"\n                        fieldFromBlock=\"base\"\n\n                        v-bind:fieldValue=\"sdRate\"\n                        v-bind:isReadOnly=\"isReadOnly\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                    <span class=\"pc-input-details\">Base Standard deviation</span>\n                </label>\n            </li>\n        </ul>\n    </div>\n</template>\n\n<script>\nimport pcBlock from './pc-block.vue'\n\nexport default {\n    props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused'],\n    extends: pcBlock,\n    template: '#base-comp',\n    data () {\n        return {\n            focusedBlock: '',\n        }\n    },\n    computed: {\n        isReadOnly () {\n            return this.calculateProp == 'base'\n        },\n        base () {\n            return this.$store.state.attributes.base\n        },\n        sdRate () {\n            return this.$store.state.attributes.sdRate\n        },\n        sample () {\n            return this.$store.state.attributes.sample\n        },\n        testType () {\n            return this.$store.state.attributes.testType\n        },\n        visitorsWithGoals () {\n            return this.$store.getters.visitorsWithGoals\n        }\n    },\n    methods: {\n        enableInput () {\n            this.$emit('edit:update', {prop: 'base'})\n        },\n        updateFocus ({fieldProp, value}) {\n            if (this.focusedBlock == fieldProp && value === false) {\n                this.focusedBlock = ''\n            } else if (value === true) {\n                this.focusedBlock = fieldProp\n            }\n\n            this.$emit('update:focus', {\n                fieldProp: this.fieldFromBlock,\n                value: value\n            })\n        }\n\n    }\n}\n</script>\n\n\n<style>\n.pc-input-sd-rate {\n    margin-top: -10px;\n    z-index: 1;\n    position: relative;\n    text-align: center;\n}\n\n.pc-field-sdRate {\n    width: 90%;\n    display: inline-block;\n}\n</style>\n\n<style scoped>\n    .pc-input-left {\n        position: relative;\n        z-index: 2;\n    }\n</style>\n"]}, media: undefined })
    ,inject("data-v-33128dbf_1", { source: "\n.pc-input-left[data-v-33128dbf] {\n    position: relative;\n    z-index: 2;\n}\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/base-comp.vue"],"names":[],"mappings":";AAuIA;IACA,kBAAA;IACA,UAAA;AACA","file":"base-comp.vue","sourcesContent":["<template id=\"base-comp\">\n    <div class=\"pc-block pc-block--base\" :class=\"{'pc-block-focused': focusedblock == 'base'}\">\n\n        <pc-svg-chain v-bind:fieldFromBlock=\"fieldFromBlock\"></pc-svg-chain>\n\n        <div class=\"pc-header\" v-if=\"testType == 'gTest'\">\n            Base Rate\n        </div>\n        <div class=\"pc-header\" v-else>\n            Base Average\n        </div>\n\n        <ul class=\"pc-inputs\">\n            <li class=\"pc-input-item pc-input-left\">\n                <label>\n                    <span class=\"pc-input-title\">{{testType == 'gTest' ? 'Base Rate' : 'Base Average'}} <small class=\"pc-input-sub-title\">conversion</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"base\"\n                        :suffix=\"testType == 'gTest' ? '%' : ''\"\n\n                        v-bind:fieldValue=\"base\"\n                        v-bind:isReadOnly=\"isReadOnly\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n            </li>\n\n            <li class=\"pc-input-item pc-input-right\">\n                <label>\n                    <span class=\"pc-input-title\">Metric Totals<small class=\"pc-input-sub-title\">visitors reached goal</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"visitorsWithGoals\"\n                        v-bind:fieldValue=\"visitorsWithGoals\"\n                        v-bind:fieldFromBlock=\"fieldFromBlock\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:isReadOnly=\"isReadOnly\"\n                        v-bind:enableEdit=\"enableEdit && this.calculateProp != 'sample'\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n            </li>\n\n            <li class=\"pc-input-item pc-input-sd-rate\" v-if=\"testType == 'tTest'\">\n                <label>\n                    <pc-block-field\n                        prefix=\"±\"\n                        fieldProp=\"sdRate\"\n                        fieldFromBlock=\"base\"\n\n                        v-bind:fieldValue=\"sdRate\"\n                        v-bind:isReadOnly=\"isReadOnly\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:enableEdit=\"enableEdit\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                    <span class=\"pc-input-details\">Base Standard deviation</span>\n                </label>\n            </li>\n        </ul>\n    </div>\n</template>\n\n<script>\nimport pcBlock from './pc-block.vue'\n\nexport default {\n    props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused'],\n    extends: pcBlock,\n    template: '#base-comp',\n    data () {\n        return {\n            focusedBlock: '',\n        }\n    },\n    computed: {\n        isReadOnly () {\n            return this.calculateProp == 'base'\n        },\n        base () {\n            return this.$store.state.attributes.base\n        },\n        sdRate () {\n            return this.$store.state.attributes.sdRate\n        },\n        sample () {\n            return this.$store.state.attributes.sample\n        },\n        testType () {\n            return this.$store.state.attributes.testType\n        },\n        visitorsWithGoals () {\n            return this.$store.getters.visitorsWithGoals\n        }\n    },\n    methods: {\n        enableInput () {\n            this.$emit('edit:update', {prop: 'base'})\n        },\n        updateFocus ({fieldProp, value}) {\n            if (this.focusedBlock == fieldProp && value === false) {\n                this.focusedBlock = ''\n            } else if (value === true) {\n                this.focusedBlock = fieldProp\n            }\n\n            this.$emit('update:focus', {\n                fieldProp: this.fieldFromBlock,\n                value: value\n            })\n        }\n\n    }\n}\n</script>\n\n\n<style>\n.pc-input-sd-rate {\n    margin-top: -10px;\n    z-index: 1;\n    position: relative;\n    text-align: center;\n}\n\n.pc-field-sdRate {\n    width: 90%;\n    display: inline-block;\n}\n</style>\n\n<style scoped>\n    .pc-input-left {\n        position: relative;\n        z-index: 2;\n    }\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$7 = "data-v-33128dbf";
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

    var script$8 = {
        template: '#pc-tooltip',
        data () {
            return {
                isTooltipShown: false
            }
        },
        methods: {
            showTooltip (bool) {
                this.isTooltipShown = bool;
            }
        }

    };

    /* script */
    const __vue_script__$8 = script$8;

    /* template */
    var __vue_render__$8 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("div", { staticClass: "pc-tooltip" }, [
        _c(
          "div",
          {
            on: {
              mouseover: function($event) {
                _vm.showTooltip(true);
              },
              mouseout: function($event) {
                _vm.showTooltip(false);
              }
            }
          },
          [_vm._t("text")],
          2
        ),
        _vm._v(" "),
        _c(
          "div",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.isTooltipShown,
                expression: "isTooltipShown"
              }
            ],
            staticClass: "tooltip-wrapper"
          },
          [_vm._t("tooltip")],
          2
        )
      ])
    };
    var __vue_staticRenderFns__$8 = [];
    __vue_render__$8._withStripped = true;

      /* style */
      const __vue_inject_styles__$8 = function (inject) {
        if (!inject) return
        inject("data-v-e872aba4_0", { source: "\n.pc-tooltip {\n    --tooltip-background-color: var(--black);\n    position: relative;\n}\n.tooltip-wrapper {\n    position: absolute;\n    left: 0;\n    top: calc(100% + 10px);\n    background: var(--tooltip-background-color);\n    color: var(--light-gray);\n    padding: 5px;\n    border-radius: 4px;\n    z-index: 10;\n    width: 400px;\n    white-space: normal;\n    pointer-events: none;\n}\n.tooltip-wrapper:after {\n    --size: 5px;\n\n    content: '';\n    position: absolute;\n    left: 50px;\n    bottom: calc(100% - var(--size));\n    transform: translate(-50%, 0) rotateZ(45deg);\n\n    border: var(--size) solid var(--tooltip-background-color);\n    border-right-color: transparent;\n    border-bottom-color: transparent;\n}\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/pc-tooltip.vue"],"names":[],"mappings":";AA8BA;IACA,wCAAA;IACA,kBAAA;AACA;AAEA;IACA,kBAAA;IACA,OAAA;IACA,sBAAA;IACA,2CAAA;IACA,wBAAA;IACA,YAAA;IACA,kBAAA;IACA,WAAA;IACA,YAAA;IACA,mBAAA;IACA,oBAAA;AACA;AAEA;IACA,WAAA;;IAEA,WAAA;IACA,kBAAA;IACA,UAAA;IACA,gCAAA;IACA,4CAAA;;IAEA,yDAAA;IACA,+BAAA;IACA,gCAAA;AACA","file":"pc-tooltip.vue","sourcesContent":["<template id=\"pc-tooltip\">\n    <div class=\"pc-tooltip\">\n        <div v-on:mouseover=\"showTooltip(true)\" v-on:mouseout=\"showTooltip(false)\">\n            <slot name=\"text\"></slot>\n        </div>\n\n        <div class=\"tooltip-wrapper\" v-show=\"isTooltipShown\">\n            <slot name=\"tooltip\"></slot>\n        </div>\n    </div>\n</template>\n\n<script>\nexport default {\n    template: '#pc-tooltip',\n    data () {\n        return {\n            isTooltipShown: false\n        }\n    },\n    methods: {\n        showTooltip (bool) {\n            this.isTooltipShown = bool;\n        }\n    }\n\n}\n</script>\n\n<style>\n.pc-tooltip {\n    --tooltip-background-color: var(--black);\n    position: relative;\n}\n\n.tooltip-wrapper {\n    position: absolute;\n    left: 0;\n    top: calc(100% + 10px);\n    background: var(--tooltip-background-color);\n    color: var(--light-gray);\n    padding: 5px;\n    border-radius: 4px;\n    z-index: 10;\n    width: 400px;\n    white-space: normal;\n    pointer-events: none;\n}\n\n.tooltip-wrapper:after {\n    --size: 5px;\n\n    content: '';\n    position: absolute;\n    left: 50px;\n    bottom: calc(100% - var(--size));\n    transform: translate(-50%, 0) rotateZ(45deg);\n\n    border: var(--size) solid var(--tooltip-background-color);\n    border-right-color: transparent;\n    border-bottom-color: transparent;\n}\n</style>\n"]}, media: undefined });

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

    var script$9 = {
        props: [ 'lockedField' ],
        data () {
            return {
            }
        },
        computed: {
            enabled: {
                get () {
                    return this.$store.state.nonInferiority.enabled
                },
                set (newValue) {
                    this.$store.dispatch('change:noninferiority', {
                        prop: 'enabled',
                        value: newValue
                    });
                }
            },
            isRelative () {
                return this.$store.state.nonInferiority.selected == 'relative'
            }
        }
    };

    /* script */
    const __vue_script__$9 = script$9;

    /* template */
    var __vue_render__$9 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("div", { staticClass: "pc-non-inferiority" }, [
        _c("label", { staticClass: "pc-non-inf-label" }, [
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.enabled,
                expression: "enabled"
              }
            ],
            attrs: { type: "checkbox" },
            domProps: {
              checked: Array.isArray(_vm.enabled)
                ? _vm._i(_vm.enabled, null) > -1
                : _vm.enabled
            },
            on: {
              change: function($event) {
                var $$a = _vm.enabled,
                  $$el = $event.target,
                  $$c = $$el.checked ? true : false;
                if (Array.isArray($$a)) {
                  var $$v = null,
                    $$i = _vm._i($$a, $$v);
                  if ($$el.checked) {
                    $$i < 0 && (_vm.enabled = $$a.concat([$$v]));
                  } else {
                    $$i > -1 &&
                      (_vm.enabled = $$a.slice(0, $$i).concat($$a.slice($$i + 1)));
                  }
                } else {
                  _vm.enabled = $$c;
                }
              }
            }
          }),
          _vm._v("\n        Use non inferiority test\n    ")
        ])
      ])
    };
    var __vue_staticRenderFns__$9 = [];
    __vue_render__$9._withStripped = true;

      /* style */
      const __vue_inject_styles__$9 = function (inject) {
        if (!inject) return
        inject("data-v-8b12c14c_0", { source: "\n.pc-non-inf-label {\n    white-space: nowrap;\n}\n.pc-non-inf-treshold {\n    display: flex;\n    align-items: center;\n}\n.pc-non-inf-treshold-input {\n    margin-left: 5px;\n}\n\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/non-inferiority.vue"],"names":[],"mappings":";AAsCA;IACA,mBAAA;AACA;AAEA;IACA,aAAA;IACA,mBAAA;AACA;AAEA;IACA,gBAAA;AACA","file":"non-inferiority.vue","sourcesContent":["<template>\n    <div class=\"pc-non-inferiority\">\n        <label class=\"pc-non-inf-label\">\n            <input type=\"checkbox\" v-model=\"enabled\">\n            Use non inferiority test\n        </label>\n    </div>\n</template>\n\n<script>\nexport default {\n    props: [ 'lockedField' ],\n    data () {\n        return {\n        }\n    },\n    computed: {\n        enabled: {\n            get () {\n                return this.$store.state.nonInferiority.enabled\n            },\n            set (newValue) {\n                this.$store.dispatch('change:noninferiority', {\n                    prop: 'enabled',\n                    value: newValue\n                })\n            }\n        },\n        isRelative () {\n            return this.$store.state.nonInferiority.selected == 'relative'\n        }\n    }\n}\n\n</script>\n\n<style>\n\n.pc-non-inf-label {\n    white-space: nowrap;\n}\n\n.pc-non-inf-treshold {\n    display: flex;\n    align-items: center;\n}\n\n.pc-non-inf-treshold-input {\n    margin-left: 5px;\n}\n\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$9 = undefined;
      /* module identifier */
      const __vue_module_identifier__$9 = undefined;
      /* functional template */
      const __vue_is_functional_template__$9 = false;
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$9 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
        __vue_inject_styles__$9,
        __vue_script__$9,
        __vue_scope_id__$9,
        __vue_is_functional_template__$9,
        __vue_module_identifier__$9,
        false,
        createInjector,
        undefined,
        undefined
      );

    //

    var script$a = {
        props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused'],
        extends: __vue_component__$4,
        template: '#base-comp',
        data () {
            return {
                focusedBlock: '',
                options: [
                    {
                        text: 'relative',
                        value: 'relative'
                    },
                    {
                        text: 'absolute',
                        value: 'absolutePerDay'
                    }
                ]
            }
        },
        computed: {
            isReadOnly () {
                return this.calculateProp == 'base'
            },
            enabled () {
                return this.$store.state.nonInferiority.enabled
            },
            threshold () {
                return this.$store.state.nonInferiority.threshold
            },
            thresholdRelative () {
                return this.$store.state.nonInferiority.thresholdRelative
            },
            thresholdAbsolute () {
                return this.$store.state.nonInferiority.thresholdAbsolute
            },
            isRelative () {
                return this.$store.state.nonInferiority.selected == 'relative'
            },
            selected: {
                get () {
                    return this.$store.state.nonInferiority.selected
                },
                set (newValue) {
                    this.$store.dispatch('change:noninferiority', {
                        prop: 'selected',
                        value: newValue
                    });
                }
            },
            expectedChange: {
                get () {
                    return this.$store.state.nonInferiority.expectedChange
                },
                set (newValue) {
                    this.$store.dispatch('field:change', {
                        prop: 'expectedChange',
                        value: newValue
                    });
                }
            },
        },
        methods: {
            enableInput () {
                this.$emit('edit:update', {prop: 'base'});
            },
            updateFocus ({fieldProp, value}) {
                if (this.focusedBlock == fieldProp && value === false) {
                    this.focusedBlock = '';
                } else if (value === true) {
                    this.focusedBlock = fieldProp;
                }

                this.$emit('update:focus', {
                    fieldProp: this.fieldFromBlock,
                    value: value
                });
            }

        }
    };

    /* script */
    const __vue_script__$a = script$a;

    /* template */
    var __vue_render__$a = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "div",
        {
          staticClass: "pc-block pc-block--noninferiority",
          class: { "pc-block-focused": _vm.focusedblock == "noninferiority" }
        },
        [
          _c("pc-svg-chain", { attrs: { fieldFromBlock: _vm.fieldFromBlock } }),
          _vm._v(" "),
          _c("div", { staticClass: "pc-header" }, [
            _vm._v("\n        Non Inferiority\n    ")
          ]),
          _vm._v(" "),
          _c("ul", { staticClass: "pc-inputs" }, [
            _c("li", { staticClass: "pc-input-item pc-input-left" }, [
              _c(
                "label",
                [
                  _vm._m(0),
                  _vm._v(" "),
                  _c("pc-block-field", {
                    attrs: {
                      fieldProp: "thresholdRelative",
                      suffix: "%",
                      fieldValue: _vm.thresholdRelative,
                      fieldFromBlock: _vm.fieldFromBlock,
                      isBlockFocused: _vm.isBlockFocused,
                      isReadOnly: _vm.isReadOnly,
                      enableEdit: true
                    },
                    on: { "update:focus": _vm.updateFocus }
                  })
                ],
                1
              )
            ]),
            _vm._v(" "),
            _c("li", { staticClass: "pc-input-item pc-input-right" }, [
              _c(
                "label",
                [
                  _vm._m(1),
                  _vm._v(" "),
                  _c("pc-block-field", {
                    attrs: {
                      fieldProp: "thresholdAbsolute",
                      suffix: "",
                      fieldValue: _vm.thresholdAbsolute,
                      fieldFromBlock: _vm.fieldFromBlock,
                      isBlockFocused: _vm.isBlockFocused,
                      isReadOnly: _vm.isReadOnly,
                      enableEdit: true
                    },
                    on: { "update:focus": _vm.updateFocus }
                  })
                ],
                1
              )
            ]),
            _vm._v(" "),
            _c("li", { staticClass: "pc-input-item pc-input-left-bottom" }, [
              _c("label", [
                _vm._m(2),
                _vm._v(" "),
                _c("div", { staticClass: "pc-non-inf-select-wrapper" }, [
                  _c(
                    "select",
                    {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.expectedChange,
                          expression: "expectedChange"
                        }
                      ],
                      staticClass: "pc-non-inf-select",
                      on: {
                        change: function($event) {
                          var $$selectedVal = Array.prototype.filter
                            .call($event.target.options, function(o) {
                              return o.selected
                            })
                            .map(function(o) {
                              var val = "_value" in o ? o._value : o.value;
                              return val
                            });
                          _vm.expectedChange = $event.target.multiple
                            ? $$selectedVal
                            : $$selectedVal[0];
                        }
                      }
                    },
                    [
                      _c("option", { attrs: { value: "nochange" } }, [
                        _vm._v(
                          "\n                            No Change\n                        "
                        )
                      ]),
                      _vm._v(" "),
                      _c("option", { attrs: { value: "degradation" } }, [
                        _vm._v(
                          "\n                            Degradation\n                        "
                        )
                      ]),
                      _vm._v(" "),
                      _c("option", { attrs: { value: "improvement" } }, [
                        _vm._v(
                          "\n                            Improvement\n                        "
                        )
                      ])
                    ]
                  )
                ])
              ])
            ])
          ])
        ],
        1
      )
    };
    var __vue_staticRenderFns__$a = [
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("span", { staticClass: "pc-input-title" }, [
          _vm._v("Relative "),
          _c("small", { staticClass: "pc-input-sub-title" }, [_vm._v("change")])
        ])
      },
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("span", { staticClass: "pc-input-title" }, [
          _vm._v("Absolute "),
          _c("small", { staticClass: "pc-input-sub-title" }, [
            _vm._v("impact per day")
          ])
        ])
      },
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("span", { staticClass: "pc-input-title no-sub-title" }, [
          _vm._v("\n                        Expected Change\n                    "),
          _c("small", { staticClass: "pc-input-sub-title" })
        ])
      }
    ];
    __vue_render__$a._withStripped = true;

      /* style */
      const __vue_inject_styles__$a = function (inject) {
        if (!inject) return
        inject("data-v-91096212_0", { source: "\n.pc-non-inf-select {\n    --base-padding: 5px;\n    font-size: inherit;\n    line-height: 28px;\n    border: none;\n    display: block;\n    position: relative;\n    box-sizing: border-box;\n    width: 100%;\n    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1));\n    border-radius: 5px;\n    background: var(--white);\n    padding: var(--base-padding);\n\n    overflow: hidden;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    appearance: none;\n}\n.pc-non-inf-select:focus {\n    outline: 0;\n    box-shadow: inset 0 0 0 1px var(--dark-blue);\n}\n.pc-non-inf-select-wrapper {\n    position: relative;\n}\n.pc-non-inf-select-wrapper:after {\n    --border-size: 7px;\n    content: '';\n    position: absolute;\n    right: 5px;\n    bottom: 0;\n    pointer-events: none;\n    border: var(--border-size) solid transparent;\n    border-top: var(--border-size) solid var(--gray);\n    transform: translateY(calc(-50% - var(--border-size)/2));\n}\n.no-sub-title {\n    margin: 15px 0 10px 0;\n}\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/components/non-inferiority-comp.vue"],"names":[],"mappings":";AA+JA;IACA,mBAAA;IACA,kBAAA;IACA,iBAAA;IACA,YAAA;IACA,cAAA;IACA,kBAAA;IACA,sBAAA;IACA,WAAA;IACA,8CAAA;IACA,kBAAA;IACA,wBAAA;IACA,4BAAA;;IAEA,gBAAA;IACA,wBAAA;IACA,qBAAA;IACA,gBAAA;AACA;AAEA;IACA,UAAA;IACA,4CAAA;AACA;AAEA;IACA,kBAAA;AACA;AAEA;IACA,kBAAA;IACA,WAAA;IACA,kBAAA;IACA,UAAA;IACA,SAAA;IACA,oBAAA;IACA,4CAAA;IACA,gDAAA;IACA,wDAAA;AACA;AAEA;IACA,qBAAA;AACA","file":"non-inferiority-comp.vue","sourcesContent":["<template id=\"noninferiority-comp\">\n    <div class=\"pc-block pc-block--noninferiority\" :class=\"{'pc-block-focused': focusedblock == 'noninferiority'}\">\n\n        <pc-svg-chain v-bind:fieldFromBlock=\"fieldFromBlock\"></pc-svg-chain>\n\n        <div class=\"pc-header\">\n            Non Inferiority\n        </div>\n\n        <ul class=\"pc-inputs\">\n            <li class=\"pc-input-item pc-input-left\">\n                <label>\n                    <span class=\"pc-input-title\">Relative <small class=\"pc-input-sub-title\">change</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"thresholdRelative\"\n                        suffix=\"%\"\n\n                        v-bind:fieldValue=\"thresholdRelative\"\n                        v-bind:fieldFromBlock=\"fieldFromBlock\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:isReadOnly=\"isReadOnly\"\n                        v-bind:enableEdit=\"true\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n            </li>\n\n            <li class=\"pc-input-item pc-input-right\">\n                <label>\n                    <span class=\"pc-input-title\">Absolute <small class=\"pc-input-sub-title\">impact per day</small></span>\n\n                    <pc-block-field\n                        fieldProp=\"thresholdAbsolute\"\n                        suffix=\"\"\n                        v-bind:fieldValue=\"thresholdAbsolute\"\n                        v-bind:fieldFromBlock=\"fieldFromBlock\"\n                        v-bind:isBlockFocused=\"isBlockFocused\"\n                        v-bind:isReadOnly=\"isReadOnly\"\n                        v-bind:enableEdit=\"true\"\n\n                        v-on:update:focus=\"updateFocus\"></pc-block-field>\n                </label>\n            </li>\n\n            <li class=\"pc-input-item pc-input-left-bottom\">\n                <label>\n                    <span class=\"pc-input-title no-sub-title\">\n                            Expected Change\n                        <small class=\"pc-input-sub-title\">\n\n                        </small>\n                    </span>\n\n                    <div class=\"pc-non-inf-select-wrapper\">\n                        <select v-model=\"expectedChange\" class=\"pc-non-inf-select\">\n                            <option value=\"nochange\">\n                                No Change\n                            </option>\n                            <option value=\"degradation\">\n                                Degradation\n                            </option>\n                            <option value=\"improvement\">\n                                Improvement\n                            </option>\n                        </select>\n                    </div>\n                </label>\n            </li>\n        </ul>\n    </div>\n</template>\n\n<script>\nimport pcBlock from './pc-block.vue'\n\nexport default {\n    props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused'],\n    extends: pcBlock,\n    template: '#base-comp',\n    data () {\n        return {\n            focusedBlock: '',\n            options: [\n                {\n                    text: 'relative',\n                    value: 'relative'\n                },\n                {\n                    text: 'absolute',\n                    value: 'absolutePerDay'\n                }\n            ]\n        }\n    },\n    computed: {\n        isReadOnly () {\n            return this.calculateProp == 'base'\n        },\n        enabled () {\n            return this.$store.state.nonInferiority.enabled\n        },\n        threshold () {\n            return this.$store.state.nonInferiority.threshold\n        },\n        thresholdRelative () {\n            return this.$store.state.nonInferiority.thresholdRelative\n        },\n        thresholdAbsolute () {\n            return this.$store.state.nonInferiority.thresholdAbsolute\n        },\n        isRelative () {\n            return this.$store.state.nonInferiority.selected == 'relative'\n        },\n        selected: {\n            get () {\n                return this.$store.state.nonInferiority.selected\n            },\n            set (newValue) {\n                this.$store.dispatch('change:noninferiority', {\n                    prop: 'selected',\n                    value: newValue\n                })\n            }\n        },\n        expectedChange: {\n            get () {\n                return this.$store.state.nonInferiority.expectedChange\n            },\n            set (newValue) {\n                this.$store.dispatch('field:change', {\n                    prop: 'expectedChange',\n                    value: newValue\n                })\n            }\n        },\n    },\n    methods: {\n        enableInput () {\n            this.$emit('edit:update', {prop: 'base'})\n        },\n        updateFocus ({fieldProp, value}) {\n            if (this.focusedBlock == fieldProp && value === false) {\n                this.focusedBlock = ''\n            } else if (value === true) {\n                this.focusedBlock = fieldProp\n            }\n\n            this.$emit('update:focus', {\n                fieldProp: this.fieldFromBlock,\n                value: value\n            })\n        }\n\n    }\n}\n</script>\n\n<style>\n.pc-non-inf-select {\n    --base-padding: 5px;\n    font-size: inherit;\n    line-height: 28px;\n    border: none;\n    display: block;\n    position: relative;\n    box-sizing: border-box;\n    width: 100%;\n    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1));\n    border-radius: 5px;\n    background: var(--white);\n    padding: var(--base-padding);\n\n    overflow: hidden;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    appearance: none;\n}\n\n.pc-non-inf-select:focus {\n    outline: 0;\n    box-shadow: inset 0 0 0 1px var(--dark-blue);\n}\n\n.pc-non-inf-select-wrapper {\n    position: relative;\n}\n\n.pc-non-inf-select-wrapper:after {\n    --border-size: 7px;\n    content: '';\n    position: absolute;\n    right: 5px;\n    bottom: 0;\n    pointer-events: none;\n    border: var(--border-size) solid transparent;\n    border-top: var(--border-size) solid var(--gray);\n    transform: translateY(calc(-50% - var(--border-size)/2));\n}\n\n.no-sub-title {\n    margin: 15px 0 10px 0;\n}\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$a = undefined;
      /* module identifier */
      const __vue_module_identifier__$a = undefined;
      /* functional template */
      const __vue_is_functional_template__$a = false;
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$a = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
        __vue_inject_styles__$a,
        __vue_script__$a,
        __vue_scope_id__$a,
        __vue_is_functional_template__$a,
        __vue_module_identifier__$a,
        false,
        createInjector,
        undefined,
        undefined
      );

    //

    var script$b = {
        mounted () {
            // start of application
            this.$store.dispatch('init:calculator');
        },
        props: ['parentmetricdata'],
        data () {
            // values if parent component sends them
            let importedData = this.parentmetricdata || {};

            let data = {
                focusedBlock: '',

                // false means the editable ones are the secondary mode (metric totals, days&daily trials and absolute impact)
                enabledMainInputs: {
                    base: true,
                    sample: true,
                    impact: true,
                    power: true,
                    'non-inferiority': true
                }
            };

            // mergeComponentData has no array support for now
            return this.mergeComponentData(data, JSON.parse(JSON.stringify(importedData)));
        },
        computed: {
            disableBaseSecondaryInput () {
                // only metric total is available and as it depends on sample this
                // creates a circular dependency
                // this also forces main input back
                return this.calculateProp == 'sample'
            },

            // in case parent component needs this information
            metricData () {
                let result = {
                        testType: this.testType,
                        calculateProp: this.calculateProp,
                        view: this.view,
                        lockedField: this.lockedField,
                        nonInferiority: this.nonInferiority,
                        comparisonMode: this.comparisonMode,
                    };
                return JSON.parse(JSON.stringify(result))
            },

            nonInferiorityEnabled () {
                return this.$store.state.nonInferiority.enabled
            },

            nonInferioritySelected () {
                return this.$store.state.nonInferiority.selected
            },

            falsePosRate () {
                return this.$store.state.attributes.falsePosRate
            },
            power () {
                return this.$store.state.attributes.power
            },
            variants () {
                return this.$store.state.attributes.variants
            },
            comparisonMode: {
                get () {
                    return this.$store.state.attributes.comparisonMode
                },
                set (newValue) {
                    this.$store.dispatch('field:change', {
                        prop: 'comparisonMode',
                        value: newValue
                    });
                }
            },
            testType: {
                get () {
                    return this.$store.state.attributes.testType
                },
                set (newValue) {
                    this.$store.dispatch('field:change', {
                        prop: 'testType',
                        value: newValue || 0
                    });
                }
            },
            trafficMode: {
                get () {
                    if (this.$store.state.attributes.onlyTotalVisitors) {
                        return 'total';
                    }

                    return 'daily';
                },
                set (newValue) {
                    this.$store.dispatch('field:change', {
                        prop: 'onlyTotalVisitors',
                        value: newValue == 'total'
                    });
                }
            }
        },
        methods: {
            updateFocus ({fieldProp, value}) {
                if (this.focusedBlock == fieldProp && value === false) {
                    this.focusedBlock = '';
                } else if (value === true) {
                    this.focusedBlock = fieldProp;
                }
            },
            mergeComponentData (base, toClone) {
                // merges default data with imported one from parent component
                let result = recursive(base, toClone);

                // no array support for now
                function recursive (baseRef, cloneRef) {
                    Object.keys(cloneRef).forEach((prop) => {
                        if (typeof cloneRef[prop] == 'object') {
                            baseRef[prop] = recursive(baseRef[prop], cloneRef[prop]);
                        } else {
                            baseRef[prop] = cloneRef[prop];
                        }
                    });

                    return baseRef;
                }
                return result;
            }
        },
        watch: {
            // in case parent component needs this information
            metricData () {
                this.$emit('update:metricdata', this.metricData);
            }
        },
        components: {
            'svg-graph': __vue_component__$1,
            'pc-block-field': __vue_component__$2,
            'pc-tooltip': __vue_component__$8,
            'sample-comp': __vue_component__$5,
            'impact-comp' : __vue_component__$6,
            'base-comp': __vue_component__$7,
            'non-inferiority': __vue_component__$9,
            'non-inferiority-comp': __vue_component__$a

        }
    };

    /* script */
    const __vue_script__$b = script$b;

    /* template */
    var __vue_render__$b = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("div", { staticClass: "power-calculator" }, [
        _c("form", { staticClass: "pc-form", attrs: { action: "." } }, [
          _c("div", { staticClass: "pc-main-header" }, [
            _c(
              "div",
              { staticClass: "pc-controls-left" },
              [
                _c(
                  "div",
                  { staticClass: "pc-test-type" },
                  [
                    _c(
                      "pc-tooltip",
                      { staticClass: "pc-test-type-tooltip-wrapper" },
                      [
                        _c(
                          "label",
                          {
                            staticClass: "pc-test-type-labels",
                            attrs: { slot: "text" },
                            slot: "text"
                          },
                          [
                            _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value: _vm.testType,
                                  expression: "testType"
                                }
                              ],
                              attrs: {
                                type: "radio",
                                name: "test-mode",
                                value: "gTest",
                                checked: ""
                              },
                              domProps: { checked: _vm._q(_vm.testType, "gTest") },
                              on: {
                                change: function($event) {
                                  _vm.testType = "gTest";
                                }
                              }
                            }),
                            _vm._v(
                              "\n                            Binomial Metric\n                        "
                            )
                          ]
                        ),
                        _vm._v(" "),
                        _c(
                          "span",
                          { attrs: { slot: "tooltip" }, slot: "tooltip" },
                          [
                            _vm._v(
                              "\n                            A binomial metric is one that can be only two values like 0 or 1, yes or no, converted or not converted\n                        "
                            )
                          ]
                        )
                      ]
                    ),
                    _vm._v(" "),
                    _c(
                      "pc-tooltip",
                      { staticClass: "pc-test-type-tooltip-wrapper" },
                      [
                        _c(
                          "label",
                          {
                            staticClass: "pc-test-type-labels",
                            attrs: { slot: "text" },
                            slot: "text"
                          },
                          [
                            _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value: _vm.testType,
                                  expression: "testType"
                                }
                              ],
                              attrs: {
                                type: "radio",
                                name: "test-mode",
                                value: "tTest"
                              },
                              domProps: { checked: _vm._q(_vm.testType, "tTest") },
                              on: {
                                change: function($event) {
                                  _vm.testType = "tTest";
                                }
                              }
                            }),
                            _vm._v(
                              "\n                            Continuous Metric\n                        "
                            )
                          ]
                        ),
                        _vm._v(" "),
                        _c(
                          "span",
                          { attrs: { slot: "tooltip" }, slot: "tooltip" },
                          [
                            _vm._v(
                              "\n                            A continuous metric is one that can be any number like time on site or the number of rooms sold\n                        "
                            )
                          ]
                        )
                      ]
                    )
                  ],
                  1
                ),
                _vm._v(" "),
                _c("div", { staticClass: "pc-traffic-mode" }, [
                  _c(
                    "label",
                    {
                      staticClass: "pc-traffic-mode-labels",
                      attrs: { slot: "text" },
                      slot: "text"
                    },
                    [
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.trafficMode,
                            expression: "trafficMode"
                          }
                        ],
                        attrs: {
                          type: "radio",
                          name: "traffic-mode",
                          value: "daily",
                          checked: "",
                          disabled: _vm.nonInferiorityEnabled
                        },
                        domProps: { checked: _vm._q(_vm.trafficMode, "daily") },
                        on: {
                          change: function($event) {
                            _vm.trafficMode = "daily";
                          }
                        }
                      }),
                      _vm._v(
                        "\n                        Daily traffic\n                    "
                      )
                    ]
                  ),
                  _vm._v(" "),
                  _c(
                    "label",
                    {
                      staticClass: "pc-traffic-mode-labels",
                      attrs: { slot: "text" },
                      slot: "text"
                    },
                    [
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.trafficMode,
                            expression: "trafficMode"
                          }
                        ],
                        attrs: {
                          type: "radio",
                          name: "traffic-mode",
                          value: "total",
                          disabled: _vm.nonInferiorityEnabled
                        },
                        domProps: { checked: _vm._q(_vm.trafficMode, "total") },
                        on: {
                          change: function($event) {
                            _vm.trafficMode = "total";
                          }
                        }
                      }),
                      _vm._v(
                        "\n                        Total traffic\n                    "
                      )
                    ]
                  )
                ]),
                _vm._v(" "),
                _c("non-inferiority"),
                _vm._v(" "),
                _c("div", { staticClass: "pc-comparison-mode" }, [
                  _c(
                    "label",
                    {
                      staticClass: "pc-comparison-mode-labels",
                      attrs: { slot: "text" },
                      slot: "text"
                    },
                    [
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.comparisonMode,
                            expression: "comparisonMode"
                          }
                        ],
                        attrs: {
                          type: "radio",
                          name: "comparison-mode",
                          value: "all",
                          checked: ""
                        },
                        domProps: { checked: _vm._q(_vm.comparisonMode, "all") },
                        on: {
                          change: function($event) {
                            _vm.comparisonMode = "all";
                          }
                        }
                      }),
                      _vm._v(
                        "\n                        Base vs All variants\n                    "
                      )
                    ]
                  ),
                  _vm._v(" "),
                  _c(
                    "label",
                    {
                      staticClass: "pc-traffic-mode-labels",
                      attrs: { slot: "text" },
                      slot: "text"
                    },
                    [
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.comparisonMode,
                            expression: "comparisonMode"
                          }
                        ],
                        attrs: {
                          type: "radio",
                          name: "comparison-mode",
                          value: "one"
                        },
                        domProps: { checked: _vm._q(_vm.comparisonMode, "one") },
                        on: {
                          change: function($event) {
                            _vm.comparisonMode = "one";
                          }
                        }
                      }),
                      _vm._v(
                        "\n                        Base vs One variant\n                    "
                      )
                    ]
                  )
                ])
              ],
              1
            ),
            _vm._v(" "),
            _vm._m(0),
            _vm._v(" "),
            _c("div", { staticClass: "pc-controls-right" }, [
              _c(
                "label",
                { staticClass: "pc-variants" },
                [
                  _c("pc-block-field", {
                    staticClass: "pc-variants-input",
                    attrs: {
                      fieldProp: "variants",
                      prefix: "base + ",
                      fieldValue: _vm.variants,
                      enableEdit: true
                    }
                  }),
                  _vm._v(
                    "\n                    variant" +
                      _vm._s(_vm.variants > 1 ? "s" : "") +
                      "\n                "
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "label",
                { staticClass: "pc-false-positive" },
                [
                  _c("pc-block-field", {
                    staticClass: "pc-false-positive-input",
                    class: { "pc-top-fields-error": _vm.falsePosRate > 10 },
                    attrs: {
                      suffix: "%",
                      fieldProp: "falsePosRate",
                      fieldValue: _vm.falsePosRate,
                      enableEdit: true
                    }
                  }),
                  _vm._v(
                    "\n                    false positive rate\n                "
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "label",
                { staticClass: "pc-power" },
                [
                  _c("pc-block-field", {
                    staticClass: "pc-power-input",
                    class: { "pc-top-fields-error": _vm.power < 80 },
                    attrs: {
                      suffix: "%",
                      fieldProp: "power",
                      fieldValue: _vm.power,
                      enableEdit: true
                    }
                  }),
                  _vm._v("\n                    power\n                ")
                ],
                1
              )
            ])
          ]),
          _vm._v(" "),
          _c(
            "div",
            {
              staticClass: "pc-blocks-wrapper",
              class: { "pc-blocks-wrapper-ttest": _vm.testType == "tTest" }
            },
            [
              _c("base-comp", {
                attrs: {
                  fieldFromBlock: "base",
                  isBlockFocused: _vm.focusedBlock == "base",
                  enableEdit: _vm.enabledMainInputs.base
                },
                on: { "update:focus": _vm.updateFocus }
              }),
              _vm._v(" "),
              _c("sample-comp", {
                attrs: {
                  fieldFromBlock: "sample",
                  enableEdit: _vm.enabledMainInputs.sample,
                  isBlockFocused: _vm.focusedBlock == "sample"
                },
                on: { "update:focus": _vm.updateFocus }
              }),
              _vm._v(" "),
              !_vm.nonInferiorityEnabled
                ? _c("impact-comp", {
                    attrs: {
                      fieldFromBlock: "impact",
                      enableEdit: _vm.enabledMainInputs.impact,
                      isBlockFocused: _vm.focusedBlock == "impact"
                    },
                    on: { "update:focus": _vm.updateFocus }
                  })
                : _vm._e(),
              _vm._v(" "),
              _vm.nonInferiorityEnabled
                ? _c("non-inferiority-comp", {
                    attrs: {
                      fieldFromBlock: "non-inferiority",
                      enableEdit: _vm.enabledMainInputs["non-inferiority"],
                      isBlockFocused: _vm.focusedBlock == "non-inferiority"
                    },
                    on: { "update:focus": _vm.updateFocus }
                  })
                : _vm._e(),
              _vm._v(" "),
              _c("svg-graph")
            ],
            1
          )
        ])
      ])
    };
    var __vue_staticRenderFns__$b = [
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("div", { staticClass: "pc-title" }, [
          _vm._v("Power Calculator "),
          _c("sup", { staticStyle: { color: "#F00", "font-size": "11px" } }, [
            _vm._v("BETA")
          ])
        ])
      }
    ];
    __vue_render__$b._withStripped = true;

      /* style */
      const __vue_inject_styles__$b = function (inject) {
        if (!inject) return
        inject("data-v-4eadd51b_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n/* application styles */\n\n/* colors */\n.power-calculator {\n\n    --white: #FFF;\n    --black: #000;\n\n    --gray: #B5B5B5;\n    --light-gray: #F0F0F0;\n    --dark-gray: #525252;\n\n    --light-blue: #C1CFD8;\n    --pale-blue: #7898AE;\n    --blue: #155EAB;\n    --dark-blue: #3d78df;\n\n    --light-yellow: #FEF1CB;\n    --dark-yellow: #E2B634;\n    --fade-black: rgba(0, 0, 0, 0.3);\n\n    --red: #F00;\n}\n\n/* layout */\n.pc-main-header {\n    display: grid;\n    grid-template-columns: 33.33% 33.33% 33.33%;\n    grid-template-rows: auto;\n    grid-template-areas:\n        \"controls-left title controls-right\";\n    align-items: center;\n\n    margin: 25px 10px;\n}\n.pc-controls-left {\n    grid-area: controls-left;\n    display: grid;\n    grid-template-columns: min-content min-content min-content;\n    grid-template-rows: 2;\n    grid-template-areas:\n        \"calc-options calc-options calc-options\"\n        \"test-type traffic comparison\";\n    align-items: center;\n}\n.pc-controls-right {\n    grid-area: controls-right;\n    display: grid;\n    grid-template-columns: auto min-content min-content;\n    grid-template-rows: auto;\n    grid-template-areas:\n        \"variants false-positive power\";\n    align-items: center;\n    justify-items: end;\n}\n.pc-title {\n    grid-area: title;\n    font-size: 30px;\n    text-align: center;\n}\n.pc-traffic-mode {\n    grid-area: traffic;\n}\n.pc-non-inf-label,\n.pc-test-type,\n.pc-false-positive,\n.pc-power,\n.pc-traffic-mode,\n.pc-variants,\n.pc-comparison-mode {\n    font-size: 0.8em;\n}\n.pc-test-type {\n    grid-area: test-type;\n}\n.pc-non-inferiority {\n    grid-area: calc-options;\n    margin-bottom: 8px;\n}\n.pc-comparison-mode {\n    grid-area: comparison;\n}\n.pc-test-type-labels,\n.pc-traffic-mode-labels,\n.pc-non-inf-label,\n.pc-comparison-mode-label {\n    white-space: nowrap;\n}\n.pc-non-inferiority ,\n.pc-test-type,\n.pc-traffic-mode,\n.pc-comparison-mode {\n    margin-left: 15px;\n}\n.pc-test-type-tooltip-wrapper {\n    display: inline-block;\n}\n.pc-variants {\n    grid-area: variants;\n    white-space: nowrap;\n    align-self: end;\n}\n.pc-false-positive {\n    grid-area: false-positive;\n    margin-left: 15px;\n    white-space: nowrap;\n    align-self: end;\n}\n.pc-power {\n    grid-area: power;\n    margin-left: 15px;\n    margin-right: 15px;\n    white-space: nowrap;\n    align-self: end;\n}\n.pc-blocks-wrapper {\n    grid-area: pc-blocks-wrapper;\n    display: grid;\n    grid-template-columns: 33% 33% 33%;\n    grid-template-rows: auto;\n    grid-template-areas:\n        \"block-base block-sample block-impact\"\n        \"block-graph block-graph block-graph\"\n    ;\n    grid-template-rows: auto;\n    grid-column-gap: 8px;\n    grid-row-gap: 8px;\n}\n.pc-block--base {\n    grid-area: block-base;\n}\n.pc-block--sample {\n    grid-area: block-sample;\n}\n.pc-block--impact {\n    grid-area: block-impact;\n}\n.pc-block--graph {\n    grid-area: block-graph;\n}\n\n\n/* blocks */\n.pc-block {\n    background: var(--light-gray);\n}\n.pc-header {\n    color: var(--white);\n    text-align: center;\n    font-size: 28px;\n    line-height: 80px;\n    height: 80px;\n    text-shadow: 0 1px 1px rgba(0,0,0,0.29);\n    background: var(--pale-blue);\n    margin-bottom: 25px;\n}\n.pc-calculate {\n    display: inline-block;\n    margin-bottom: 25px;\n    font-weight: bold;\n    font-size: 0.8em;\n}\n.pc-value {\n    display: block;\n    margin-bottom: 25px;\n}\n\n/* block to calculate override rules*/\n.pc-block-to-calculate {\n    background: var(--light-yellow);\n}\n.pc-block-to-calculate .pc-header {\n    background: var(--dark-yellow);\n}\n.pc-hidden {\n    display: none!important;\n}\n", map: {"version":3,"sources":["/Users/ssastoqueher/projects/booking/powercalculator/src/powercalculator.vue"],"names":[],"mappings":";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AA4SA,uBAAA;;AAEA,WAAA;AAEA;;IAEA,aAAA;IACA,aAAA;;IAEA,eAAA;IACA,qBAAA;IACA,oBAAA;;IAEA,qBAAA;IACA,oBAAA;IACA,eAAA;IACA,oBAAA;;IAEA,uBAAA;IACA,sBAAA;IACA,gCAAA;;IAEA,WAAA;AAEA;;AAEA,WAAA;AAEA;IACA,aAAA;IACA,2CAAA;IACA,wBAAA;IACA;4CACA;IACA,mBAAA;;IAEA,iBAAA;AACA;AAEA;IACA,wBAAA;IACA,aAAA;IACA,0DAAA;IACA,qBAAA;IACA;;sCAEA;IACA,mBAAA;AACA;AAEA;IACA,yBAAA;IACA,aAAA;IACA,mDAAA;IACA,wBAAA;IACA;uCACA;IACA,mBAAA;IACA,kBAAA;AACA;AAEA;IACA,gBAAA;IACA,eAAA;IACA,kBAAA;AACA;AAEA;IACA,kBAAA;AACA;AAEA;;;;;;;IAOA,gBAAA;AACA;AAEA;IACA,oBAAA;AACA;AAEA;IACA,uBAAA;IACA,kBAAA;AACA;AAEA;IACA,qBAAA;AACA;AAEA;;;;IAIA,mBAAA;AACA;AAEA;;;;IAIA,iBAAA;AACA;AAEA;IACA,qBAAA;AACA;AAEA;IACA,mBAAA;IACA,mBAAA;IACA,eAAA;AACA;AAEA;IACA,yBAAA;IACA,iBAAA;IACA,mBAAA;IACA,eAAA;AACA;AAEA;IACA,gBAAA;IACA,iBAAA;IACA,kBAAA;IACA,mBAAA;IACA,eAAA;AACA;AAEA;IACA,4BAAA;IACA,aAAA;IACA,kCAAA;IACA,wBAAA;IACA;;;IAGA;IACA,wBAAA;IACA,oBAAA;IACA,iBAAA;AACA;AAEA;IACA,qBAAA;AACA;AAEA;IACA,uBAAA;AACA;AAEA;IACA,uBAAA;AACA;AAEA;IACA,sBAAA;AACA;;;AAGA,WAAA;AAEA;IACA,6BAAA;AACA;AAEA;IACA,mBAAA;IACA,kBAAA;IACA,eAAA;IACA,iBAAA;IACA,YAAA;IACA,uCAAA;IACA,4BAAA;IACA,mBAAA;AACA;AAEA;IACA,qBAAA;IACA,mBAAA;IACA,iBAAA;IACA,gBAAA;AACA;AAEA;IACA,cAAA;IACA,mBAAA;AACA;;AAEA,qCAAA;AAEA;IACA,+BAAA;AACA;AAEA;IACA,8BAAA;AACA;AAEA;IACA,uBAAA;AACA","file":"powercalculator.vue","sourcesContent":["<template>\n    <div class=\"power-calculator\">\n        <form action=\".\" class=\"pc-form\">\n            <div class=\"pc-main-header\">\n\n                <div class=\"pc-controls-left\">\n\n                    <div class=\"pc-test-type\">\n\n                        <pc-tooltip class=\"pc-test-type-tooltip-wrapper\">\n                            <label class=\"pc-test-type-labels\" slot=\"text\">\n                                <input type=\"radio\" name=\"test-mode\" v-model=\"testType\" value=\"gTest\" checked>\n                                Binomial Metric\n                            </label>\n                            <span slot=\"tooltip\">\n                                A binomial metric is one that can be only two values like 0 or 1, yes or no, converted or not converted\n                            </span>\n                        </pc-tooltip>\n\n\n                        <pc-tooltip class=\"pc-test-type-tooltip-wrapper\">\n                            <label class=\"pc-test-type-labels\" slot=\"text\">\n                                <input type=\"radio\" name=\"test-mode\" v-model=\"testType\" value=\"tTest\">\n                                Continuous Metric\n                            </label>\n                            <span slot=\"tooltip\">\n                                A continuous metric is one that can be any number like time on site or the number of rooms sold\n                            </span>\n                        </pc-tooltip>\n\n                    </div>\n\n                    <div class=\"pc-traffic-mode\">\n                        <label class=\"pc-traffic-mode-labels\" slot=\"text\">\n                            <input type=\"radio\" name=\"traffic-mode\" v-model=\"trafficMode\" value=\"daily\" checked :disabled=\"nonInferiorityEnabled\">\n                            Daily traffic\n                        </label>\n                        <label class=\"pc-traffic-mode-labels\" slot=\"text\">\n                            <input type=\"radio\" name=\"traffic-mode\" v-model=\"trafficMode\" value=\"total\" :disabled=\"nonInferiorityEnabled\">\n                            Total traffic\n                        </label>\n                    </div>\n\n                    <non-inferiority></non-inferiority>\n\n                    <div class=\"pc-comparison-mode\">\n                        <label class=\"pc-comparison-mode-labels\" slot=\"text\">\n                            <input type=\"radio\" name=\"comparison-mode\" v-model=\"comparisonMode\" value=\"all\" checked>\n                            Base vs All variants\n                        </label>\n                        <label class=\"pc-traffic-mode-labels\" slot=\"text\">\n                            <input type=\"radio\" name=\"comparison-mode\" v-model=\"comparisonMode\" value=\"one\">\n                            Base vs One variant\n                        </label>\n                    </div>\n                </div>\n\n                <div class=\"pc-title\">Power Calculator <sup style=\"color: #F00; font-size: 11px;\">BETA</sup> </div>\n\n                <div class=\"pc-controls-right\">\n                    <label class=\"pc-variants\">\n                        <pc-block-field\n                            class=\"pc-variants-input\"\n                            fieldProp=\"variants\"\n                            prefix=\"base + \"\n                            v-bind:fieldValue=\"variants\"\n                            v-bind:enableEdit=\"true\"></pc-block-field>\n                        variant{{ variants > 1 ? 's' : '' }}\n                    </label>\n\n                    <label class=\"pc-false-positive\">\n                        <pc-block-field\n                            class=\"pc-false-positive-input\"\n                            :class=\"{ 'pc-top-fields-error': falsePosRate > 10 }\"\n                            suffix=\"%\"\n                            fieldProp=\"falsePosRate\"\n                            v-bind:fieldValue=\"falsePosRate\"\n                            v-bind:enableEdit=\"true\"></pc-block-field>\n                        false positive rate\n                    </label>\n\n                    <label class=\"pc-power\">\n                        <pc-block-field\n                            class=\"pc-power-input\"\n                            suffix=\"%\"\n                            :class=\"{ 'pc-top-fields-error': power < 80 }\"\n                            fieldProp=\"power\"\n                            v-bind:fieldValue=\"power\"\n                            v-bind:enableEdit=\"true\"></pc-block-field>\n                        power\n                    </label>\n                </div>\n            </div>\n\n\n            <div class=\"pc-blocks-wrapper\" :class=\"{'pc-blocks-wrapper-ttest': testType == 'tTest'}\">\n                <base-comp\n                    fieldFromBlock=\"base\"\n                    v-bind:isBlockFocused=\"focusedBlock == 'base'\"\n                    v-bind:enableEdit=\"enabledMainInputs.base\"\n\n                    v-on:update:focus=\"updateFocus\"\n                    >\n                </base-comp>\n\n                <sample-comp\n                    fieldFromBlock=\"sample\"\n\n                    v-bind:enableEdit=\"enabledMainInputs.sample\"\n                    v-bind:isBlockFocused=\"focusedBlock == 'sample'\"\n                    v-on:update:focus=\"updateFocus\">\n\n                </sample-comp>\n\n                <impact-comp\n                    v-if=\"!nonInferiorityEnabled\"\n                    fieldFromBlock=\"impact\"\n\n                    v-bind:enableEdit=\"enabledMainInputs.impact\"\n                    v-bind:isBlockFocused=\"focusedBlock == 'impact'\"\n                    v-on:update:focus=\"updateFocus\">\n                </impact-comp>\n\n                <non-inferiority-comp\n                    v-if=\"nonInferiorityEnabled\"\n                    fieldFromBlock=\"non-inferiority\"\n\n                    v-bind:enableEdit=\"enabledMainInputs['non-inferiority']\"\n                    v-bind:isBlockFocused=\"focusedBlock == 'non-inferiority'\"\n                    v-on:update:focus=\"updateFocus\">\n                </non-inferiority-comp>\n\n                <svg-graph></svg-graph>\n\n            </div>\n        </form>\n    </div>\n</template>\n\n<script>\nimport svgGraph from './components/svg-graph.vue'\nimport pcBlockField from './components/pc-block-field.vue'\nimport sampleComp from './components/sample-comp.vue'\nimport impactComp from './components/impact-comp.vue'\nimport baseComp from './components/base-comp.vue'\nimport pcTooltip from './components/pc-tooltip.vue'\nimport nonInferiority from './components/non-inferiority.vue'\nimport nonInferiorityComp from './components/non-inferiority-comp.vue'\n\nexport default {\n    mounted () {\n        // start of application\n        this.$store.dispatch('init:calculator')\n    },\n    props: ['parentmetricdata'],\n    data () {\n        // values if parent component sends them\n        let importedData = this.parentmetricdata || {};\n\n        let data = {\n            focusedBlock: '',\n\n            // false means the editable ones are the secondary mode (metric totals, days&daily trials and absolute impact)\n            enabledMainInputs: {\n                base: true,\n                sample: true,\n                impact: true,\n                power: true,\n                'non-inferiority': true\n            }\n        };\n\n        // mergeComponentData has no array support for now\n        return this.mergeComponentData(data, JSON.parse(JSON.stringify(importedData)));\n    },\n    computed: {\n        disableBaseSecondaryInput () {\n            // only metric total is available and as it depends on sample this\n            // creates a circular dependency\n            // this also forces main input back\n            return this.calculateProp == 'sample'\n        },\n\n        // in case parent component needs this information\n        metricData () {\n            let result = {\n                    testType: this.testType,\n                    calculateProp: this.calculateProp,\n                    view: this.view,\n                    lockedField: this.lockedField,\n                    nonInferiority: this.nonInferiority,\n                    comparisonMode: this.comparisonMode,\n                };\n            return JSON.parse(JSON.stringify(result))\n        },\n\n        nonInferiorityEnabled () {\n            return this.$store.state.nonInferiority.enabled\n        },\n\n        nonInferioritySelected () {\n            return this.$store.state.nonInferiority.selected\n        },\n\n        falsePosRate () {\n            return this.$store.state.attributes.falsePosRate\n        },\n        power () {\n            return this.$store.state.attributes.power\n        },\n        variants () {\n            return this.$store.state.attributes.variants\n        },\n        comparisonMode: {\n            get () {\n                return this.$store.state.attributes.comparisonMode\n            },\n            set (newValue) {\n                this.$store.dispatch('field:change', {\n                    prop: 'comparisonMode',\n                    value: newValue\n                })\n            }\n        },\n        testType: {\n            get () {\n                return this.$store.state.attributes.testType\n            },\n            set (newValue) {\n                this.$store.dispatch('field:change', {\n                    prop: 'testType',\n                    value: newValue || 0\n                })\n            }\n        },\n        trafficMode: {\n            get () {\n                if (this.$store.state.attributes.onlyTotalVisitors) {\n                    return 'total';\n                }\n\n                return 'daily';\n            },\n            set (newValue) {\n                this.$store.dispatch('field:change', {\n                    prop: 'onlyTotalVisitors',\n                    value: newValue == 'total'\n                })\n            }\n        }\n    },\n    methods: {\n        updateFocus ({fieldProp, value}) {\n            if (this.focusedBlock == fieldProp && value === false) {\n                this.focusedBlock = ''\n            } else if (value === true) {\n                this.focusedBlock = fieldProp\n            }\n        },\n        mergeComponentData (base, toClone) {\n            // merges default data with imported one from parent component\n            let result = recursive(base, toClone);\n\n            // no array support for now\n            function recursive (baseRef, cloneRef) {\n                Object.keys(cloneRef).forEach((prop) => {\n                    if (typeof cloneRef[prop] == 'object') {\n                        baseRef[prop] = recursive(baseRef[prop], cloneRef[prop]);\n                    } else {\n                        baseRef[prop] = cloneRef[prop];\n                    }\n                })\n\n                return baseRef;\n            };\n\n            return result;\n        }\n    },\n    watch: {\n        // in case parent component needs this information\n        metricData () {\n            this.$emit('update:metricdata', this.metricData)\n        }\n    },\n    components: {\n        'svg-graph': svgGraph,\n        'pc-block-field': pcBlockField,\n        'pc-tooltip': pcTooltip,\n        'sample-comp': sampleComp,\n        'impact-comp' : impactComp,\n        'base-comp': baseComp,\n        'non-inferiority': nonInferiority,\n        'non-inferiority-comp': nonInferiorityComp\n\n    }\n}\n</script>\n\n<style>\n/* application styles */\n\n/* colors */\n\n.power-calculator {\n\n    --white: #FFF;\n    --black: #000;\n\n    --gray: #B5B5B5;\n    --light-gray: #F0F0F0;\n    --dark-gray: #525252;\n\n    --light-blue: #C1CFD8;\n    --pale-blue: #7898AE;\n    --blue: #155EAB;\n    --dark-blue: #3d78df;\n\n    --light-yellow: #FEF1CB;\n    --dark-yellow: #E2B634;\n    --fade-black: rgba(0, 0, 0, 0.3);\n\n    --red: #F00;\n\n}\n\n/* layout */\n\n.pc-main-header {\n    display: grid;\n    grid-template-columns: 33.33% 33.33% 33.33%;\n    grid-template-rows: auto;\n    grid-template-areas:\n        \"controls-left title controls-right\";\n    align-items: center;\n\n    margin: 25px 10px;\n}\n\n.pc-controls-left {\n    grid-area: controls-left;\n    display: grid;\n    grid-template-columns: min-content min-content min-content;\n    grid-template-rows: 2;\n    grid-template-areas:\n        \"calc-options calc-options calc-options\"\n        \"test-type traffic comparison\";\n    align-items: center;\n}\n\n.pc-controls-right {\n    grid-area: controls-right;\n    display: grid;\n    grid-template-columns: auto min-content min-content;\n    grid-template-rows: auto;\n    grid-template-areas:\n        \"variants false-positive power\";\n    align-items: center;\n    justify-items: end;\n}\n\n.pc-title {\n    grid-area: title;\n    font-size: 30px;\n    text-align: center;\n}\n\n.pc-traffic-mode {\n    grid-area: traffic;\n}\n\n.pc-non-inf-label,\n.pc-test-type,\n.pc-false-positive,\n.pc-power,\n.pc-traffic-mode,\n.pc-variants,\n.pc-comparison-mode {\n    font-size: 0.8em;\n}\n\n.pc-test-type {\n    grid-area: test-type;\n}\n\n.pc-non-inferiority {\n    grid-area: calc-options;\n    margin-bottom: 8px;\n}\n\n.pc-comparison-mode {\n    grid-area: comparison;\n}\n\n.pc-test-type-labels,\n.pc-traffic-mode-labels,\n.pc-non-inf-label,\n.pc-comparison-mode-label {\n    white-space: nowrap;\n}\n\n.pc-non-inferiority ,\n.pc-test-type,\n.pc-traffic-mode,\n.pc-comparison-mode {\n    margin-left: 15px;\n}\n\n.pc-test-type-tooltip-wrapper {\n    display: inline-block;\n}\n\n.pc-variants {\n    grid-area: variants;\n    white-space: nowrap;\n    align-self: end;\n}\n\n.pc-false-positive {\n    grid-area: false-positive;\n    margin-left: 15px;\n    white-space: nowrap;\n    align-self: end;\n}\n\n.pc-power {\n    grid-area: power;\n    margin-left: 15px;\n    margin-right: 15px;\n    white-space: nowrap;\n    align-self: end;\n}\n\n.pc-blocks-wrapper {\n    grid-area: pc-blocks-wrapper;\n    display: grid;\n    grid-template-columns: 33% 33% 33%;\n    grid-template-rows: auto;\n    grid-template-areas:\n        \"block-base block-sample block-impact\"\n        \"block-graph block-graph block-graph\"\n    ;\n    grid-template-rows: auto;\n    grid-column-gap: 8px;\n    grid-row-gap: 8px;\n}\n\n.pc-block--base {\n    grid-area: block-base;\n}\n\n.pc-block--sample {\n    grid-area: block-sample;\n}\n\n.pc-block--impact {\n    grid-area: block-impact;\n}\n\n.pc-block--graph {\n    grid-area: block-graph;\n}\n\n\n/* blocks */\n\n.pc-block {\n    background: var(--light-gray);\n}\n\n.pc-header {\n    color: var(--white);\n    text-align: center;\n    font-size: 28px;\n    line-height: 80px;\n    height: 80px;\n    text-shadow: 0 1px 1px rgba(0,0,0,0.29);\n    background: var(--pale-blue);\n    margin-bottom: 25px;\n}\n\n.pc-calculate {\n    display: inline-block;\n    margin-bottom: 25px;\n    font-weight: bold;\n    font-size: 0.8em;\n}\n\n.pc-value {\n    display: block;\n    margin-bottom: 25px;\n}\n\n/* block to calculate override rules*/\n\n.pc-block-to-calculate {\n    background: var(--light-yellow);\n}\n\n.pc-block-to-calculate .pc-header {\n    background: var(--dark-yellow);\n}\n\n.pc-hidden {\n    display: none!important;\n}\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$b = undefined;
      /* module identifier */
      const __vue_module_identifier__$b = undefined;
      /* functional template */
      const __vue_is_functional_template__$b = false;
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$b = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b },
        __vue_inject_styles__$b,
        __vue_script__$b,
        __vue_scope_id__$b,
        __vue_is_functional_template__$b,
        __vue_module_identifier__$b,
        false,
        createInjector,
        undefined,
        undefined
      );

    var actions = {
        'field:change' (context, { prop, value }) {
            // add validations necessary here

            switch (prop) {

                // these 3 cases will call the same extra action
                case 'base':
                    context.commit('field:change', { prop, value });
                    if (context.state.nonInferiority.enabled === true) {
                        if (context.state.nonInferiority.selected == 'absolutePerDay') {
                            context.dispatch('change:noninferiorityimpact');
                        }
                        context.dispatch('convert:noninferioritythreshold', { prop, value });
                    }

                    context.dispatch('update:proptocalculate', context.getters.calculatedValues);
                break;

                case 'sample':
                case 'runtime':
                case 'visitorsPerDay':
                    context.dispatch('sample:sideeffect', {prop, value});
                    context.dispatch('update:proptocalculate', context.getters.calculatedValues);

                    if (context.state.nonInferiority.enabled === true && prop == 'visitorsPerDay') {
                        context.dispatch('convert:noninferioritythreshold', { prop, value });
                    }
                break;

                case 'thresholdRelative':
                case 'thresholdAbsolute':
                    context.dispatch('threshold:sideeffect', {prop, value});
                    context.dispatch('change:noninferiorityimpact');
                    context.dispatch('convert:noninferioritythreshold', { prop, value });
                break;

                case 'impactByMetricValue':
                    context.dispatch('convert:absoluteimpact', {prop, value});
                break;

                case 'expectedChange':
                    context.commit('field:change', { prop, value });
                    context.dispatch('change:noninferiorityimpact');
                break;

                case 'visitorsWithGoals':
                    context.dispatch('convert:visitorswithgoals', {prop, value});
                break;

                default:
                    context.commit('field:change', { prop, value });

                    if (context.state.nonInferiority.enabled === true) {
                        context.dispatch('convert:noninferioritythreshold', { prop, value });
                    }

                    // calculate new value for calculated prop
                    context.dispatch('update:proptocalculate', context.getters.calculatedValues);
                break;
            }
        },
        'change:noninferiority' (context, { prop, value }) {
            // add validations necessary here
            context.commit('change:noninferiority', { prop, value });
            context.dispatch('change:noninferiorityimpact');

            if (prop == 'enabled') {

                if (value === true) {
                    context.dispatch('field:change', {
                        prop: 'lockedField',
                        value: 'days'
                    });
                    context.dispatch('field:change', {
                        prop: 'onlyTotalVisitors',
                        value: false
                    });
                    context.dispatch('update:calculateprop', {value: 'sample'});
                }
            } else {
                // update values based on nonInferiority.selected
                context.dispatch('update:proptocalculate', context.getters.calculatedValues);
            }
        },
        'change:noninferiorityimpact' (context) {
            let impactValue = context.getters.nonInferiorityImpact;

            if (context.state.nonInferiority.enabled === true) {
                this.__impactBackup = context.state.attributes.impact;
                context.dispatch('convert:noninferioritythreshold', {
                    prop: 'impact',
                    value: impactValue
                });
            } else {
                impactValue = this.__impactBackup || 0;
            }

            context.dispatch('field:change', {
                prop: 'impact',
                value: impactValue
            });
        },
        'switch:lockedfield' (context) {
            let newLockedField = context.state.attributes.lockedField == 'days' ? 'visitorsPerDay' : 'days';

            if (context.state.nonInferiority.enabled === true) {
                newLockedField = 'days';
            }

            context.commit('switch:lockedfield', {
                value: newLockedField
            });
        },
        'sample:sideeffect' (context, { prop, value }) {
            const isSampleCalculated = context.state.attributes.calculateProp == 'sample';
            let lockedField = context.state.attributes.lockedField;

            let stateMachine = {
                calculated: {
                    sample: false,
                    runtime: lockedField == 'days',
                    visitorsPerDay: lockedField != 'days',
                },
                notCalculated: {
                    sample: true,
                    runtime: lockedField == 'days' && prop == 'sample',
                    visitorsPerDay: lockedField != 'days' && prop == 'sample',
                }
            };

            let input = stateMachine[isSampleCalculated ? 'calculated' : 'notCalculated'];

            let data = {
                sample: context.state.attributes.sample,
                visitorsPerDay: context.state.attributes.visitorsPerDay,
                runtime: context.state.attributes.runtime
            };

            // override of the prop changed by the action change:fields with the new value
            data[prop] = value;

            context.commit('sample:sideeffect', {
                prop: prop,
                value: data[prop]
            });

            // looks throught the stat machine list and updates all values based on data
            Object.keys(input).forEach((key) => {
                if (input[key] == true) {
                    if (key != prop) {
                        let result = 0;
                        if (key == 'runtime') {
                            result = Math.ceil(window.parseInt(data.sample) / data.visitorsPerDay);
                            result = isNaN(result) ? '-' : result;

                        } else if (key == 'visitorsPerDay') {
                            let isInvalid = false;
                            result = Math.floor(window.parseInt(data.sample) / data.runtime);
                            isInvalid = isNaN(result);

                            result = isNaN(result) || isInvalid ? '-' : result;

                        } else if (key == 'sample') {
                            let isInvalid = false;
                            result = Math.ceil(data.runtime * data.visitorsPerDay);
                            isInvalid = isNaN(result);

                            result = isInvalid ? '-' : result;
                        }

                        context.commit('sample:sideeffect', {
                            prop: key,
                            value: result
                        });
                    }
                }
            });
        },
        'threshold:sideeffect' (context, { prop, value }) {
            context.commit('field:change', { prop, value });
            if (context.state.attributes.calculateProp == 'sample') {
                context.dispatch('sample:sideeffect', context.getters.calculatedValues);
            }
            context.dispatch('update:proptocalculate', context.getters.calculatedValues);
        },
        'update:calculateprop' (context, { value }) {
            context.commit('update:calculateprop', { value });
        },
        'convert:absoluteimpact' (context, { prop, value }) {
            let impactObj = {
                    prop: 'impact',
                    value: context.getters.displayValue('impact', context.getters.calculateImpactFromAbsoluteImpact(value))
                };

            context.dispatch('field:change', impactObj);
        },
        'convert:visitorswithgoals' (context, { prop, value }) {
            let newValue = context.getters.baseFromVisitorsWithGoals(value);

            context.dispatch('field:change', {
                prop: 'base',
                value: newValue
            });
        },
        'convert:noninferioritythreshold' (context, { prop, value }) {
            let valueToCalculate,
                currentValue,
                propToUpdate,
                calculatedValue = 0;

            switch (prop) {
                case 'thresholdRelative':
                    valueToCalculate = 'absolute';
                    currentValue = value;
                break;

                case 'thresholdAbsolute':
                    valueToCalculate = 'relative';
                    currentValue = value;
                break;
                default:
                    if (context.state.nonInferiority.selected == 'absolutePerDay') {
                        valueToCalculate = 'relative';
                    } else {
                        valueToCalculate = 'absolute';
                    }
                    currentValue = context.state.nonInferiority.threshold;
                break;
            }

            if (valueToCalculate == 'absolute') {
                calculatedValue = context.getters.displayValue('nonInfThresholdAbsolute', context.getters.calculateAbsoluteFromRelative(currentValue));
                calculatedValue = Math.round(calculatedValue * 100) / 100;
                propToUpdate = 'thresholdAbsolute';
            } else if (valueToCalculate == 'relative') {
                calculatedValue = context.getters.displayValue('nonInfThresholdRelative', context.getters.calculateRelativeFromAbsolute(currentValue));
                propToUpdate = 'thresholdRelative';
            }

            context.commit('change:noninferiority', {
                prop: propToUpdate,
                value: calculatedValue
            });
        },
        'update:proptocalculate' (context) {
            let calculatedObj = context.getters.calculatedValues;
            context.commit('update:proptocalculate', calculatedObj);

            if (calculatedObj.prop == 'sample') {
                // apply side effects
                context.dispatch('sample:sideeffect', calculatedObj);
            }
        },
        'init:calculator' (context) {
            if (context.state.nonInferiority.enabled) {
                context.dispatch('change:noninferiorityimpact');
            }

            if (context.state.attributes.calculateProp != 'sample') {
                context.dispatch('field:change', {
                    prop: 'sample',
                    value: context.state.attributes.sample
                });
            }

            context.dispatch('update:proptocalculate');
        },
        'test:reset' (context, stateObj) {
            context.commit('test:reset', stateObj);
            context.dispatch('init:calculator');
        }
    };

    var mutations = {
            'update:proptocalculate' (state, {prop, value}) {
                state.attributes[prop] = value;
            }
    };

    var attributes = {
        state:{
            testType: 'gTest',
            calculateProp: 'sample', // power, impact, base, sample

            sample: 561364,
            base: 10,
            impact: 2,
            power: 80,
            falsePosRate: 10,
            sdRate: 10,
            variants: 1,

            runtime: 14, //days

            visitorsPerDay: Math.ceil(561364 / 14),
            lockedField: 'days',
            onlyTotalVisitors: false,
            comparisonMode: 'all'
        },

        mutations: {
            'field:change' (state, { prop, value }) {
                if (typeof state[prop] != 'undefined') {
                    state[prop] = value;
                }
            },
            'sample:sideeffect' (state, { prop, value }) {
                state[prop] = value;
            },
            'switch:lockedfield' (state, { value }) {
                state.lockedField = value;
            },
            'update:calculateprop' (state, { value }) {
                state.calculateProp = value;
            },
            'test:reset' (state, stateObj) {
                let props = Object.keys(state);
                props.forEach((prop) => {
                    if (prop in stateObj) {
                        state[prop] = stateObj[prop];
                    }
                });
            }
        },

        getters: {
            visitorsPerDay (state, getters) {
                return state.visitorsPerDay
            },
            lockedField (state, getters) {
                return state.lockedField
            },
            runtime (state, getters) {
                return state.runtime
            },
            visitorsWithGoals (state, getters) {
                let result = statFormulas.getVisitorsWithGoals({
                        total_sample_size: getters.extractValue('sample'),
                        base_rate: getters.extractValue('base')
                    });

                return getters.displayValue('metricTotals', result)
            },
            impactByMetric (state, getters) {
                return function impactByMetricInner (prop = 'value') {
                    let impactByMetricObj = statFormulas.getAbsoluteImpactInMetricHash({
                        base_rate: getters.extractValue('base', state.base),
                        effect_size: getters.extractValue('impact', state.impact)
                    });

                    return impactByMetricObj[prop];
                }
            },
            impactByVisitors (state, getters) {
                return statFormulas.getAbsoluteImpactInVisitors({
                    total_sample_size: getters.extractValue('sample', state.sample),
                    base_rate: getters.extractValue('base', state.base),
                    effect_size: getters.extractValue('impact', state.impact)
                })
            },
            impactByVisitorsPerDay (state, getters) {
                return Math.floor(getters.impactByVisitors / state.runtime);
            },
            impactByMetricDisplay (state, getters) {
                return getters.displayValue('impactByMetricValue', getters.impactByMetric());
            },
            impactByMetricMinDisplay (state, getters) {
                return getters.displayValue('impactByMetricValue', getters.impactByMetric('min'));
            },
            impactByMetricMaxDisplay (state, getters) {
                return getters.displayValue('impactByMetricValue', getters.impactByMetric('max'));
            },
            impactByVisitorsDisplay (state, getters) {
                return getters.displayValue('impactByVisitors', getters.impactByVisitors)
            },
            impactByVisitorsPerDayDisplay (state, getters) {
                return getters.displayValue('impactByVisitorsPerDay', getters.impactByVisitorsPerDay)
            },
            calculateImpactFromAbsoluteImpact (state, getters) {
                return function calculateImpactFromAbsoluteImpactInner (absolute_effect_size) {

                    let absoluteImpact = getters.extractValue('impactByMetricValue', absolute_effect_size);
                    return statFormulas.getRelativeImpactFromAbsolute({
                        absolute_effect_size: absoluteImpact,
                        base_rate: getters.extractValue('base', state.base)
                    });
                }
            },
            baseFromVisitorsWithGoals (state, getters) {
                return function baseFromVisitorsWithGoalsInner (value) {
                    return getters.displayValue(
                        'base',
                        statFormulas.getBaseRate({
                            total_sample_size: getters.extractValue('sample', state.sample),
                            visitors_with_goals: value
                        })
                    )
                }
            }

        }
    };

    var nonInferiority = {
        state:{
            threshold: 0,
            thresholdRelative: 0,
            thresholdAbsolute: 0,
            selected: 'relative', // relative, absolutePerDay
            enabled: false,
            expectedChange: 'nochange' // nochange, degradation, improvement
        },
        mutations: {
            'field:change' (state, { prop, value }) {
                switch (prop) {
                    case 'thresholdRelative':
                        state.threshold = value;
                        state.selected = 'relative';
                    break;
                    case 'thresholdAbsolute':
                        state.threshold = value;
                        state.selected = 'absolutePerDay';
                    break;
                    case 'threshold':
                        if (state.selected == 'absolutePerDay') {
                            state.thresholdAbsolute = value;
                        } else {
                            state.thresholdRelative = value;
                        }
                    break;
                    case 'selected':
                        if (value == 'absolutePerDay') {
                            state.thresholdAbsolute = state.threshold;
                        } else {
                            state.thresholdRelative = state.threshold;
                        }
                    break;
                }

                if (typeof state[prop] != 'undefined') {
                    state[prop] = value;
                }
            },
            'change:noninferiority' (state, {prop, value}) {
                state[prop] = value;
            },
            'test:reset' (state, stateObj) {
                let props = Object.keys(state);
                props.forEach((prop) => {
                    if (prop in stateObj) {
                        state[prop] = stateObj[prop];
                    }
                });
            }
        },
        getters: {
            nonInferiorityImpact (state, getters, rootState) {
                let { expectedChange, threshold, selected } = state,
                    newImpact = 0,
                    visitorsPerDay = rootState.attributes.visitorsPerDay,
                    base = getters.extractValue('base', rootState.attributes.base);

                if (selected == 'absolutePerDay') {
                    threshold = threshold/(base*visitorsPerDay)*100;
                }
                switch (expectedChange) {
                    case 'nochange':
                    default:
                        // zero
                    break;

                    case 'degradation':
                        newImpact = -threshold/2;
                    break;

                    case 'improvement':
                        newImpact = threshold;
                    break;
                }

                return newImpact
            },
            mu (state, getters) {
                return getters.customMu({
                    runtime: getters.runtime,
                    thresholdCorrectedValue: getters.thresholdCorrectedValue,
                    visitors_per_day: getters.visitorsPerDay,
                    base_rate: getters.extractValue('base'),
                });
            },
            customMu (state, getters) {
                return function customMuInner ({runtime, thresholdCorrectedValue, visitors_per_day, base_rate}) {
                    let mu = 0;

                    if (state.enabled) {
                        let thresholdType = state.selected,
                            data = {
                                runtime,
                                threshold: -( getters.extractValue('nonInfThreshold', thresholdCorrectedValue) ),
                                visitors_per_day,
                                base_rate
                            };
                        mu = {
                            absolutePerDay: statFormulas.getMuFromAbsolutePerDay,
                            relative: statFormulas.getMuFromRelativeDifference
                        }[thresholdType](data);
                    }

                    return mu
                }
            },
            opts (state, getters) {
                if (!state.enabled) {
                    return false
                }

                let opts = {
                    selected: state.selected,
                    lockedField: getters.lockedField,
                    thresholdCorrectedValue: getters.thresholdCorrectedValue,
                    runtime: getters.runtime,
                    visitorsPerDay: getters.visitorsPerDay,
                };

                return getters.customOpts(opts);
            },
            customOpts (state, getters) {
                return function customOptsInner ({ selected, lockedField, thresholdCorrectedValue, runtime, visitorsPerDay }) {
                    let type = selected,
                        opts;

                    opts = {
                        type,
                        calculating: lockedField,
                        threshold: -( getters.extractValue('nonInfThreshold', thresholdCorrectedValue) ),
                    };

                    if (type == 'absolutePerDay') {
                        if (lockedField == 'visitorsPerDay') {
                            opts = Object.assign(
                                opts,
                                {
                                    days: runtime
                                }
                            );
                        } else {
                            opts = Object.assign(
                                opts,
                                {
                                    visitors_per_day: getters.extractValue('sample', visitorsPerDay)
                                }
                            );
                        }
                    }

                    return opts
                }

            },
            alternative (state, getters) {
                if (!state.enabled) {
                    // in this case the test type would be 'comparative'
                    return false
                }

                return getters.customAlternative({type: 'noninferiority'});
            },
            customAlternative (state, getters) {
                return function customAlternativeInner ({type}) {
                    return statFormulas.getAlternative({type});
                }
            },
            thresholdCorrectedValue (state, getters) {
                let { threshold, selected } = state;

                return getters.customThresholdCorrectedValue({ threshold, selected });
            },
            customThresholdCorrectedValue (state) {
                return function customThresholdCorrectedValueInner ({ threshold, selected }) {
                    // when relative is selected the value we will convert it to
                    // percentage

                    let nonInfThreshold = threshold;
                    const isRelative = selected == 'relative';

                    let result = nonInfThreshold;
                    if (isRelative) {
                        result = result / 100;
                    }

                    return result;
                }
            },
            calculateRelativeFromAbsolute (state, getters, rootState) {
                return function caclulateRelativeFromAbsoluteInner(absoluteThreshold) {
                    let visitorsPerDay = rootState.attributes.visitorsPerDay,
                    base = getters.extractValue('base', rootState.attributes.base);

                    return absoluteThreshold/(base*visitorsPerDay);
                }
            },
            calculateAbsoluteFromRelative (state, getters, rootState) {
                return function calculateAbsoluteFromRelativeInner(relativeThreshold) {
                    let visitorsPerDay = rootState.attributes.visitorsPerDay,
                    base = getters.extractValue('base', rootState.attributes.base);

                    return (relativeThreshold*base*visitorsPerDay)/100;
                }
            }
        }
    };

    // getters to present data and format for calculations
    let validations = {
        sample: {type: 'int'},
        base: {
            gTest: {type: 'percentage'},
            tTest: {type: 'float'}
        },
        impact: {type: 'percentage'},
        runtime: {type: 'int'},
        variants: {type: 'int'},
        power: {type: 'percentage'},
        falsePosRate: {type: 'percentage'},
        impactByMetricValue: {
            gTest: {type: 'percentage'},
            tTest: {type: 'float'}
        },
        impactByVisitors: {type: 'int'},
        impactByVisitorsPerDay: {type: 'int'},
        metricTotals: {type: 'int'},
        sdRate: {type: 'float'},
        nonInfThreshold: {type: 'float'},
        nonInfThresholdRelative: {type: 'percentage'},
        nonInfThresholdAbsolute: {type: 'float'},
    };

    // add validation for component version of main data
    validations.totalSample = validations.sample;
    validations.relativeImpact = validations.impact;
    validations.baseRate = validations.base;



    var dataFormat = {
        displayValue (state) {
            return function displayValueInner (prop, value) {
                let result = value,
                    type = getType(prop, 'displayValue', state.attributes.testType);

                if (type == 'int') {
                    result = window.parseInt(result);
                }

                if (type == 'float') {
                    result = window.parseFloat(result);
                }

                if (type == 'percentage') {
                    result = (window.parseFloat(result) * 100).toFixed(2);
                    result = +result.toString();
                }

                return isNaN(result) || !isFinite(result) ? '-' : result;
            }
        },
        extractValue (state) {
            return function extractValueInner (prop, value) { // value is option and is used when we don't want to update the state
                let result = typeof value == 'undefined' ? state.attributes[prop] : value,
                    type = getType(prop, 'extractValue', state.attributes.testType);

                if (type == 'int') {
                    return window.parseInt(result);
                }

                if (type == 'float') {
                    return window.parseFloat(result);
                }

                if (type == 'percentage') {
                    return window.parseFloat(result) / 100;
                }
            }
        }
    };

    function getType (prop, methodName, testType) {
        let validationConfig = validations[prop],
            result,
            throwError = false;

        if (validationConfig) {
            if (validationConfig.type) {
                result = validationConfig.type;
            } else if (validationConfig[testType] && validationConfig[testType].type) {
                result = validationConfig[testType].type;
            } else {
                throwError = true;
            }
        } else {
            throwError = true;
        }

        if (throwError) {
            throw new Error(`Type not found for "${prop}" when trying to call "${methodName}".`)
        }

        return result || ''
    }

    var math = {
        calculatedValues (state, getters) {
            let prop = state.attributes.calculateProp,
                value = getters.formulaToSolve(getters.convertDisplayedValues);
            return {
                prop,
                value: getters.displayValue(prop, value)
            };
        },
        formulaToSolve (state, getters) {
            let calculateProp = state.attributes.calculateProp;

            return getters.formulaToSolveProp[calculateProp];
        },
        formulaToSolveProp (state, getters) {
            // used for the graph as we need to pass many different values to dynamic attributes
            let testType = state.attributes.testType;

            return statFormulas[testType];
        },
        convertDisplayedValues (state, getters) {
            let { mu, opts, alternative } = getters;

            return {
                mu,
                opts,
                alternative,
                variants: getters.extractValue('variants'),
                total_sample_size: getters.extractValue('sample'),
                base_rate: getters.extractValue('base'),
                effect_size: getters.extractValue('impact'),
                alpha: state.attributes.comparisonMode === 'all' ? statFormulas.getCorrectedAlpha(getters.extractValue('falsePosRate'), getters.extractValue('variants')) : getters.extractValue('falsePosRate'),
                beta: 1 - getters.extractValue('power'), // power of 80%, beta is actually 20%
                sd_rate: getters.extractValue('sdRate')
            }
        }
    };

    var store = {
        modules: {
            attributes,
            nonInferiority,
        },
        actions,
        mutations,
        getters: Object.assign({}, dataFormat, math)
    };

    var index = {
        powerCalculator: __vue_component__$b,
        store
    };

    return index;

})));
