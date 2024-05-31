/**
 * autoNumeric.js
 * @author: Bob Knothe
 * @author: Sokolov Yura
 * @version: 1.9.46 - 2016-09-11 GMT 10:00 PM / 22:00
 *
 * Created by Robert J. Knothe on 2010-10-25. Please report any bugs to https://github.com/BobKnothe/autoNumeric
 * Contributor by Sokolov Yura on 2010-11-07
 *
 * Copyright (c) 2011 Robert J. Knothe http://www.decorplanit.com/plugin/
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
!(function(a) {
    'function' == typeof define && define.amd
        ? define(['jquery'], a)
        : 'object' == typeof module && module.exports
        ? (module.exports = a(require('jquery')))
        : a(window.jQuery);
})(function(a) {
    'use strict';
    function b(a) {
        var b = {};
        if (void 0 === a.selectionStart) {
            a.focus();
            var c = document.selection.createRange();
            (b.length = c.text.length),
                c.moveStart('character', -a.value.length),
                (b.end = c.text.length),
                (b.start = b.end - b.length);
        } else (b.start = a.selectionStart), (b.end = a.selectionEnd), (b.length = b.end - b.start);
        return b;
    }
    function c(a, b, c) {
        if (void 0 === a.selectionStart) {
            a.focus();
            var d = a.createTextRange();
            d.collapse(!0), d.moveEnd('character', c), d.moveStart('character', b), d.select();
        } else (a.selectionStart = b), (a.selectionEnd = c);
    }
    function d(b, c) {
        a.each(c, function(a, d) {
            'function' == typeof d
                ? (c[a] = d(b, c, a))
                : 'function' == typeof b.autoNumeric[d] && (c[a] = b.autoNumeric[d](b, c, a));
        });
    }
    function e(a, b) {
        'string' == typeof a[b] && (a[b] *= 1);
    }
    function f(a, b) {
        d(a, b),
            (b.tagList = [
                'b',
                'caption',
                'cite',
                'code',
                'dd',
                'del',
                'div',
                'dfn',
                'dt',
                'em',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'ins',
                'kdb',
                'label',
                'li',
                'output',
                'p',
                'q',
                's',
                'sample',
                'span',
                'strong',
                'td',
                'th',
                'u',
                'var',
            ]);
        var c = b.vMax.toString().split('.'),
            f = b.vMin || 0 === b.vMin ? b.vMin.toString().split('.') : [];
        if (
            (e(b, 'vMax'),
            e(b, 'vMin'),
            e(b, 'mDec'),
            (b.mDec = 'CHF' === b.mRound ? '2' : b.mDec),
            (b.allowLeading = !0),
            (b.aNeg = b.vMin < 0 ? '-' : ''),
            (c[0] = c[0].replace('-', '')),
            (f[0] = f[0].replace('-', '')),
            (b.mInt = Math.max(c[0].length, f[0].length, 1)),
            null === b.mDec)
        ) {
            var g = 0,
                h = 0;
            c[1] && (g = c[1].length), f[1] && (h = f[1].length), (b.mDec = Math.max(g, h));
        }
        null === b.altDec &&
            b.mDec > 0 &&
            ('.' === b.aDec && ',' !== b.aSep
                ? (b.altDec = ',')
                : ',' === b.aDec && '.' !== b.aSep && (b.altDec = '.'));
        var i = b.aNeg ? '([-\\' + b.aNeg + ']?)' : '(-?)';
        (b.aNegRegAutoStrip = i),
            (b.skipFirstAutoStrip = new RegExp(
                i + '[^-' + (b.aNeg ? '\\' + b.aNeg : '') + '\\' + b.aDec + '\\d].*?(\\d|\\' + b.aDec + '\\d)'
            )),
            (b.skipLastAutoStrip = new RegExp('(\\d\\' + b.aDec + '?)[^\\' + b.aDec + '\\d]\\D*$'));
        var j = '-' + b.aNum + '\\' + b.aDec;
        return (
            (b.allowedAutoStrip = new RegExp('[^' + j + ']', 'gi')),
            (b.numRegAutoStrip = new RegExp(
                i + '(?:\\' + b.aDec + '?(\\d+\\' + b.aDec + '\\d+)|(\\d*(?:\\' + b.aDec + '\\d*)?))'
            )),
            b
        );
    }
    function g(a, b, c) {
        if (b.aSign) for (; a.indexOf(b.aSign) > -1; ) a = a.replace(b.aSign, '');
        (a = a.replace(b.skipFirstAutoStrip, '$1$2')),
            (a = a.replace(b.skipLastAutoStrip, '$1')),
            (a = a.replace(b.allowedAutoStrip, '')),
            b.altDec && (a = a.replace(b.altDec, b.aDec));
        var d = a.match(b.numRegAutoStrip);
        if (
            ((a = d ? [d[1], d[2], d[3]].join('') : ''), ('allow' === b.lZero || 'keep' === b.lZero) && 'strip' !== c)
        ) {
            var e = [],
                f = '';
            (e = a.split(b.aDec)),
                e[0].indexOf('-') !== -1 && ((f = '-'), (e[0] = e[0].replace('-', ''))),
                e[0].length > b.mInt && '0' === e[0].charAt(0) && (e[0] = e[0].slice(1)),
                (a = f + e.join(b.aDec));
        }
        if ((c && 'deny' === b.lZero) || (c && 'allow' === b.lZero && b.allowLeading === !1)) {
            var g = '^' + b.aNegRegAutoStrip + '0*(\\d' + ('leading' === c ? ')' : '|$)');
            (g = new RegExp(g)), (a = a.replace(g, '$1$2'));
        }
        return a;
    }
    function h(a, b) {
        if ('p' === b.pSign) {
            var c = b.nBracket.split(',');
            b.hasFocus || b.removeBrackets
                ? ((b.hasFocus && a.charAt(0) === c[0]) || (b.removeBrackets && a.charAt(0) === c[0])) &&
                  ((a = a.replace(c[0], b.aNeg)), (a = a.replace(c[1], '')))
                : ((a = a.replace(b.aNeg, '')), (a = c[0] + a + c[1]));
        }
        return a;
    }
    function i(a, b) {
        if (a) {
            var c = +a;
            if (c < 1e-6 && c > -1)
                (a = +a),
                    a < 1e-6 && a > 0 && ((a = (a + 10).toString()), (a = a.substring(1))),
                    a < 0 && a > -1 && ((a = (a - 10).toString()), (a = '-' + a.substring(2))),
                    (a = a.toString());
            else {
                var d = a.split('.');
                void 0 !== d[1] && (0 === +d[1] ? (a = d[0]) : ((d[1] = d[1].replace(/0*$/, '')), (a = d.join('.'))));
            }
        }
        return 'keep' === b.lZero ? a : a.replace(/^0*(\d)/, '$1');
    }
    function j(a, b, c) {
        return (
            b && '.' !== b && (a = a.replace(b, '.')),
            c && '-' !== c && (a = a.replace(c, '-')),
            a.match(/\d/) || (a += '0'),
            a
        );
    }
    function k(a, b, c) {
        return c && '-' !== c && (a = a.replace('-', c)), b && '.' !== b && (a = a.replace('.', b)), a;
    }
    function l(a, b, c) {
        return '' === a || a === b.aNeg
            ? 'zero' === b.wEmpty
                ? a + '0'
                : 'sign' === b.wEmpty || c
                ? a + b.aSign
                : a
            : null;
    }
    function m(a, b) {
        a = g(a, b);
        var c = a.replace(',', '.'),
            d = l(a, b, !0);
        if (null !== d) return d;
        var e = '';
        e = 2 === b.dGroup ? /(\d)((\d)(\d{2}?)+)$/ : 4 === b.dGroup ? /(\d)((\d{4}?)+)$/ : /(\d)((\d{3}?)+)$/;
        var f = a.split(b.aDec);
        b.altDec && 1 === f.length && (f = a.split(b.altDec));
        var i = f[0];
        if (b.aSep) for (; e.test(i); ) i = i.replace(e, '$1' + b.aSep + '$2');
        if (
            (0 !== b.mDec && f.length > 1
                ? (f[1].length > b.mDec && (f[1] = f[1].substring(0, b.mDec)), (a = i + b.aDec + f[1]))
                : (a = i),
            b.aSign)
        ) {
            var j = a.indexOf(b.aNeg) !== -1;
            (a = a.replace(b.aNeg, '')), (a = 'p' === b.pSign ? b.aSign + a : a + b.aSign), j && (a = b.aNeg + a);
        }
        return c < 0 && null !== b.nBracket && (a = h(a, b)), a;
    }
    function n(a, b) {
        (a = '' === a ? '0' : a.toString()),
            e(b, 'mDec'),
            'CHF' === b.mRound && (a = (Math.round(20 * a) / 20).toString());
        var c = '',
            d = 0,
            f = '',
            g = 'boolean' == typeof b.aPad || null === b.aPad ? (b.aPad ? b.mDec : 0) : +b.aPad,
            h = function(a) {
                var b =
                    0 === g
                        ? /(\.(?:\d*[1-9])?)0*$/
                        : 1 === g
                        ? /(\.\d(?:\d*[1-9])?)0*$/
                        : new RegExp('(\\.\\d{' + g + '}(?:\\d*[1-9])?)0*$');
                return (a = a.replace(b, '$1')), 0 === g && (a = a.replace(/\.$/, '')), a;
            };
        '-' === a.charAt(0) && ((f = '-'), (a = a.replace('-', ''))),
            a.match(/^\d/) || (a = '0' + a),
            '-' === f && 0 === +a && (f = ''),
            ((+a > 0 && 'keep' !== b.lZero) || (a.length > 0 && 'allow' === b.lZero)) &&
                (a = a.replace(/^0*(\d)/, '$1'));
        var i = a.lastIndexOf('.'),
            j = i === -1 ? a.length - 1 : i,
            k = a.length - 1 - j;
        if (k <= b.mDec) {
            if (((c = a), k < g)) {
                i === -1 && (c += b.aDec);
                for (var l = '000000'; k < g; ) (l = l.substring(0, g - k)), (c += l), (k += l.length);
            } else k > g ? (c = h(c)) : 0 === k && 0 === g && (c = c.replace(/\.$/, ''));
            if ('CHF' !== b.mRound) return 0 === +c ? c : f + c;
            'CHF' === b.mRound && ((i = c.lastIndexOf('.')), (a = c));
        }
        var m = i + b.mDec,
            n = +a.charAt(m + 1),
            o = a.substring(0, m + 1).split(''),
            p = '.' === a.charAt(m) ? a.charAt(m - 1) % 2 : a.charAt(m) % 2,
            q = !0;
        if (
            (1 !== p && (p = 0 === p && a.substring(m + 2, a.length) > 0 ? 1 : 0),
            (n > 4 && 'S' === b.mRound) ||
                (n > 4 && 'A' === b.mRound && '' === f) ||
                (n > 5 && 'A' === b.mRound && '-' === f) ||
                (n > 5 && 's' === b.mRound) ||
                (n > 5 && 'a' === b.mRound && '' === f) ||
                (n > 4 && 'a' === b.mRound && '-' === f) ||
                (n > 5 && 'B' === b.mRound) ||
                (5 === n && 'B' === b.mRound && 1 === p) ||
                (n > 0 && 'C' === b.mRound && '' === f) ||
                (n > 0 && 'F' === b.mRound && '-' === f) ||
                (n > 0 && 'U' === b.mRound) ||
                'CHF' === b.mRound)
        )
            for (d = o.length - 1; d >= 0; d -= 1)
                if ('.' !== o[d]) {
                    if ('CHF' === b.mRound && o[d] <= 2 && q) {
                        (o[d] = 0), (q = !1);
                        break;
                    }
                    if ('CHF' === b.mRound && o[d] <= 7 && q) {
                        (o[d] = 5), (q = !1);
                        break;
                    }
                    if (('CHF' === b.mRound && q ? ((o[d] = 10), (q = !1)) : (o[d] = +o[d] + 1), o[d] < 10)) break;
                    d > 0 && (o[d] = '0');
                }
        return (o = o.slice(0, m + 1)), (c = h(o.join(''))), 0 === +c ? c : f + c;
    }
    function o(a, b, c) {
        var d = b.aDec,
            e = b.mDec;
        if (((a = 'paste' === c ? n(a, b) : a), d && e)) {
            var f = a.split(d);
            f[1] && f[1].length > e && (e > 0 ? ((f[1] = f[1].substring(0, e)), (a = f.join(d))) : (a = f[0]));
        }
        return a;
    }
    function p(a, b) {
        (a = g(a, b)), (a = o(a, b)), (a = j(a, b.aDec, b.aNeg));
        var c = +a;
        return c >= b.vMin && c <= b.vMax;
    }
    function q(b, c) {
        (this.settings = c),
            (this.that = b),
            (this.$that = a(b)),
            (this.formatted = !1),
            (this.settingsClone = f(this.$that, this.settings)),
            (this.value = b.value);
    }
    function r(b) {
        return (
            'string' == typeof b &&
                ((b = b.replace(/\[/g, '\\[').replace(/\]/g, '\\]')), (b = '#' + b.replace(/(:|\.)/g, '\\$1'))),
            a(b)
        );
    }
    function s(a, b, c) {
        var d = a.data('autoNumeric');
        d || ((d = {}), a.data('autoNumeric', d));
        var e = d.holder;
        return ((void 0 === e && b) || c) && ((e = new q(a.get(0), b)), (d.holder = e)), e;
    }
    q.prototype = {
        init: function(a) {
            (this.value = this.that.value),
                (this.settingsClone = f(this.$that, this.settings)),
                (this.ctrlKey = a.ctrlKey),
                (this.cmdKey = a.metaKey),
                (this.shiftKey = a.shiftKey),
                (this.selection = b(this.that)),
                ('keydown' !== a.type && 'keyup' !== a.type) || (this.kdCode = a.keyCode),
                (this.which = a.which),
                (this.processed = !1),
                (this.formatted = !1);
        },
        setSelection: function(a, b, d) {
            (a = Math.max(a, 0)),
                (b = Math.min(b, this.that.value.length)),
                (this.selection = { start: a, end: b, length: b - a }),
                (void 0 === d || d) && c(this.that, a, b);
        },
        setPosition: function(a, b) {
            this.setSelection(a, a, b);
        },
        getBeforeAfter: function() {
            var a = this.value,
                b = a.substring(0, this.selection.start),
                c = a.substring(this.selection.end, a.length);
            return [b, c];
        },
        getBeforeAfterStriped: function() {
            var a = this.getBeforeAfter();
            return (a[0] = g(a[0], this.settingsClone)), (a[1] = g(a[1], this.settingsClone)), a;
        },
        normalizeParts: function(a, b) {
            var c = this.settingsClone;
            b = g(b, c);
            var d = !!b.match(/^\d/) || 'leading';
            (a = g(a, c, d)),
                ('' !== a && a !== c.aNeg) || 'deny' !== c.lZero || (b > '' && (b = b.replace(/^0*(\d)/, '$1')));
            var e = a + b;
            if (c.aDec) {
                var f = e.match(new RegExp('^' + c.aNegRegAutoStrip + '\\' + c.aDec));
                f && ((a = a.replace(f[1], f[1] + '0')), (e = a + b));
            }
            return 'zero' !== c.wEmpty || (e !== c.aNeg && '' !== e) || (a += '0'), [a, b];
        },
        setValueParts: function(a, b, c) {
            var d = this.settingsClone,
                e = this.normalizeParts(a, b),
                f = e.join(''),
                g = e[0].length;
            return (
                !!p(f, d) &&
                ((f = o(f, d, c)), g > f.length && (g = f.length), (this.value = f), this.setPosition(g, !1), !0)
            );
        },
        signPosition: function() {
            var a = this.settingsClone,
                b = a.aSign,
                c = this.that;
            if (b) {
                var d = b.length;
                if ('p' === a.pSign) {
                    var e = a.aNeg && c.value && c.value.charAt(0) === a.aNeg;
                    return e ? [1, d + 1] : [0, d];
                }
                var f = c.value.length;
                return [f - d, f];
            }
            return [1e3, -1];
        },
        expandSelectionOnSign: function(a) {
            var b = this.signPosition(),
                c = this.selection;
            c.start < b[1] &&
                c.end > b[0] &&
                ((c.start < b[0] || c.end > b[1]) &&
                this.value.substring(Math.max(c.start, b[0]), Math.min(c.end, b[1])).match(/^\s*$/)
                    ? c.start < b[0]
                        ? this.setSelection(c.start, b[0], a)
                        : this.setSelection(b[1], c.end, a)
                    : this.setSelection(Math.min(c.start, b[0]), Math.max(c.end, b[1]), a));
        },
        checkPaste: function() {
            if (void 0 !== this.valuePartsBeforePaste) {
                var a = this.getBeforeAfter(),
                    b = this.valuePartsBeforePaste;
                delete this.valuePartsBeforePaste,
                    (a[0] = a[0].substr(0, b[0].length) + g(a[0].substr(b[0].length), this.settingsClone)),
                    this.setValueParts(a[0], a[1], 'paste') ||
                        ((this.value = b.join('')), this.setPosition(b[0].length, !1));
            }
        },
        skipAllways: function(a) {
            var b = this.kdCode,
                c = this.which,
                d = this.ctrlKey,
                e = this.cmdKey,
                f = this.shiftKey;
            if (((d || e) && 'keyup' === a.type && void 0 !== this.valuePartsBeforePaste) || (f && 45 === b))
                return this.checkPaste(), !1;
            if (
                (b >= 112 && b <= 123) ||
                (b >= 91 && b <= 93) ||
                (b >= 9 && b <= 31) ||
                (b < 8 && (0 === c || c === b)) ||
                144 === b ||
                145 === b ||
                45 === b ||
                224 === b
            )
                return !0;
            if ((d || e) && 65 === b) return !0;
            if ((d || e) && (67 === b || 86 === b || 88 === b))
                return (
                    'keydown' === a.type && this.expandSelectionOnSign(),
                    (86 !== b && 45 !== b) ||
                        ('keydown' === a.type || 'keypress' === a.type
                            ? void 0 === this.valuePartsBeforePaste &&
                              (this.valuePartsBeforePaste = this.getBeforeAfter())
                            : this.checkPaste()),
                    'keydown' === a.type || 'keypress' === a.type || 67 === b
                );
            if (d || e) return !0;
            if (37 === b || 39 === b) {
                var g = this.settingsClone.aSep,
                    h = this.selection.start,
                    i = this.that.value;
                return (
                    'keydown' === a.type &&
                        g &&
                        !this.shiftKey &&
                        (37 === b && i.charAt(h - 2) === g
                            ? this.setPosition(h - 1)
                            : 39 === b && i.charAt(h + 1) === g && this.setPosition(h + 1)),
                    !0
                );
            }
            return b >= 34 && b <= 40;
        },
        processAllways: function() {
            var a;
            return (
                (8 === this.kdCode || 46 === this.kdCode) &&
                (this.selection.length
                    ? (this.expandSelectionOnSign(!1),
                      (a = this.getBeforeAfterStriped()),
                      this.setValueParts(a[0], a[1]))
                    : ((a = this.getBeforeAfterStriped()),
                      8 === this.kdCode
                          ? (a[0] = a[0].substring(0, a[0].length - 1))
                          : (a[1] = a[1].substring(1, a[1].length)),
                      this.setValueParts(a[0], a[1])),
                !0)
            );
        },
        processKeypress: function() {
            var a = this.settingsClone,
                b = String.fromCharCode(this.which),
                c = this.getBeforeAfterStriped(),
                d = c[0],
                e = c[1];
            return b === a.aDec || (a.altDec && b === a.altDec) || (('.' === b || ',' === b) && 110 === this.kdCode)
                ? !a.mDec ||
                      !a.aDec ||
                      !!(a.aNeg && e.indexOf(a.aNeg) > -1) ||
                          d.indexOf(a.aDec) > -1 ||
                              e.indexOf(a.aDec) > 0 ||
                                  (0 === e.indexOf(a.aDec) && (e = e.substr(1)), this.setValueParts(d + a.aDec, e), !0)
                : '-' === b || '+' === b
                ? !a.aNeg ||
                  ('' === d && e.indexOf(a.aNeg) > -1 && ((d = a.aNeg), (e = e.substring(1, e.length))),
                  (d = d.charAt(0) === a.aNeg ? d.substring(1, d.length) : '-' === b ? a.aNeg + d : d),
                  this.setValueParts(d, e),
                  !0)
                : !(b >= '0' && b <= '9') ||
                  (a.aNeg && '' === d && e.indexOf(a.aNeg) > -1 && ((d = a.aNeg), (e = e.substring(1, e.length))),
                  a.vMax <= 0 && a.vMin < a.vMax && this.value.indexOf(a.aNeg) === -1 && '0' !== b && (d = a.aNeg + d),
                  this.setValueParts(d + b, e),
                  !0);
        },
        formatQuick: function() {
            var a = this.settingsClone,
                b = this.getBeforeAfterStriped(),
                c = this.value;
            if (
                ('' === a.aSep || ('' !== a.aSep && c.indexOf(a.aSep) === -1)) &&
                ('' === a.aSign || ('' !== a.aSign && c.indexOf(a.aSign) === -1))
            ) {
                var d = [],
                    e = '';
                (d = c.split(a.aDec)),
                    d[0].indexOf('-') > -1 &&
                        ((e = '-'), (d[0] = d[0].replace('-', '')), (b[0] = b[0].replace('-', ''))),
                    d[0].length > a.mInt && '0' === b[0].charAt(0) && (b[0] = b[0].slice(1)),
                    (b[0] = e + b[0]);
            }
            var f = m(this.value, this.settingsClone),
                g = f.length;
            if (f) {
                var h = b[0].split(''),
                    i = 0;
                for (i; i < h.length; i += 1) h[i].match('\\d') || (h[i] = '\\' + h[i]);
                var j = new RegExp('^.*?' + h.join('.*?')),
                    k = f.match(j);
                k
                    ? ((g = k[0].length),
                      ((0 === g && f.charAt(0) !== a.aNeg) || (1 === g && f.charAt(0) === a.aNeg)) &&
                          a.aSign &&
                          'p' === a.pSign &&
                          (g = this.settingsClone.aSign.length + ('-' === f.charAt(0) ? 1 : 0)))
                    : a.aSign && 's' === a.pSign && (g -= a.aSign.length);
            }
            this.that.value !== f && ((this.that.value = f), this.setPosition(g)), (this.formatted = !0);
        },
    };
    var t = {
        init: function(b) {
            return this.each(function() {
                var d = a(this),
                    e = d.data('autoNumeric'),
                    f = d.data(),
                    i = d.is('input[type=text], input[type=hidden], input[type=tel], input:not([type])');
                if ('object' == typeof e) return this;
                (e = a.extend({}, a.fn.autoNumeric.defaults, f, b, {
                    aNum: '0123456789',
                    hasFocus: !1,
                    removeBrackets: !1,
                    runOnce: !1,
                    tagList: [
                        'b',
                        'caption',
                        'cite',
                        'code',
                        'dd',
                        'del',
                        'div',
                        'dfn',
                        'dt',
                        'em',
                        'h1',
                        'h2',
                        'h3',
                        'h4',
                        'h5',
                        'h6',
                        'ins',
                        'kdb',
                        'label',
                        'li',
                        'output',
                        'p',
                        'q',
                        's',
                        'sample',
                        'span',
                        'strong',
                        'td',
                        'th',
                        'u',
                        'var',
                    ],
                })),
                    e.aDec === e.aSep &&
                        a.error(
                            "autoNumeric will not function properly when the decimal character aDec: '" +
                                e.aDec +
                                "' and thousand separator aSep: '" +
                                e.aSep +
                                "' are the same character"
                        ),
                    d.data('autoNumeric', e);
                var o = s(d, e);
                if (
                    (i ||
                        'input' !== d.prop('tagName').toLowerCase() ||
                        a.error('The input type "' + d.prop('type') + '" is not supported by autoNumeric()'),
                    a.inArray(d.prop('tagName').toLowerCase(), e.tagList) === -1 &&
                        'input' !== d.prop('tagName').toLowerCase() &&
                        a.error('The <' + d.prop('tagName').toLowerCase() + '> is not supported by autoNumeric()'),
                    e.runOnce === !1 && e.aForm)
                ) {
                    if (i) {
                        var q = !0;
                        '' === d[0].value && 'empty' === e.wEmpty && ((d[0].value = ''), (q = !1)),
                            '' === d[0].value && 'sign' === e.wEmpty && ((d[0].value = e.aSign), (q = !1)),
                            q &&
                                '' !== d.val() &&
                                ((null === e.anDefault && d[0].value === d.prop('defaultValue')) ||
                                    (null !== e.anDefault && e.anDefault.toString() === d.val())) &&
                                d.autoNumeric('set', d.val());
                    }
                    a.inArray(d.prop('tagName').toLowerCase(), e.tagList) !== -1 &&
                        '' !== d.text() &&
                        d.autoNumeric('set', d.text());
                }
                (e.runOnce = !0),
                    d.is('input[type=text], input[type=hidden], input[type=tel], input:not([type])') &&
                        (d.on('keydown.autoNumeric', function(b) {
                            return (
                                (o = s(d)),
                                o.settings.aDec === o.settings.aSep &&
                                    a.error(
                                        "autoNumeric will not function properly when the decimal character aDec: '" +
                                            o.settings.aDec +
                                            "' and thousand separator aSep: '" +
                                            o.settings.aSep +
                                            "' are the same character"
                                    ),
                                o.that.readOnly
                                    ? ((o.processed = !0), !0)
                                    : (o.init(b),
                                      o.skipAllways(b)
                                          ? ((o.processed = !0), !0)
                                          : o.processAllways()
                                          ? ((o.processed = !0), o.formatQuick(), b.preventDefault(), !1)
                                          : ((o.formatted = !1), !0))
                            );
                        }),
                        d.on('keypress.autoNumeric', function(a) {
                            o = s(d);
                            var b = o.processed;
                            return (
                                o.init(a),
                                !!o.skipAllways(a) ||
                                    (b
                                        ? (a.preventDefault(), !1)
                                        : o.processAllways() || o.processKeypress()
                                        ? (o.formatQuick(), a.preventDefault(), !1)
                                        : void (o.formatted = !1))
                            );
                        }),
                        d.on('keyup.autoNumeric', function(a) {
                            (o = s(d)), o.init(a);
                            var b = o.skipAllways(a),
                                e = o.kdCode;
                            return (
                                (o.kdCode = 0),
                                delete o.valuePartsBeforePaste,
                                d[0].value === o.settings.aSign
                                    ? 's' === o.settings.pSign
                                        ? c(this, 0, 0)
                                        : c(this, o.settings.aSign.length, o.settings.aSign.length)
                                    : 9 === e && c(this, 0, d.val().length),
                                !!b || '' === this.value || void (o.formatted || o.formatQuick())
                            );
                        }),
                        d.on('focusin.autoNumeric', function() {
                            o = s(d);
                            var a = o.settingsClone;
                            if (((a.hasFocus = !0), null !== a.nBracket)) {
                                var b = d.val();
                                d.val(h(b, a));
                            }
                            o.inVal = d.val();
                            var c = l(o.inVal, a, !0);
                            null !== c && '' !== c && d.val(c);
                        }),
                        d.on('focusout.autoNumeric', function() {
                            o = s(d);
                            var a = o.settingsClone,
                                b = d.val(),
                                c = b,
                                e = '';
                            (a.hasFocus = !1),
                                'allow' === a.lZero && ((a.allowLeading = !1), (e = 'leading')),
                                '' !== b &&
                                    ((b = g(b, a, e)),
                                    null === l(b, a) && p(b, a, d[0])
                                        ? ((b = j(b, a.aDec, a.aNeg)), (b = n(b, a)), (b = k(b, a.aDec, a.aNeg)))
                                        : (b = ''));
                            var f = l(b, a, !1);
                            null === f && (f = m(b, a)),
                                (f === o.inVal && f === c) || (d.val(f), d.change(), delete o.inVal);
                        }));
            });
        },
        destroy: function() {
            return a(this).each(function() {
                var b = a(this);
                b.removeData('autoNumeric'), b.off('.autoNumeric');
            });
        },
        update: function(b) {
            return a(this).each(function() {
                var c = r(a(this)),
                    d = c.data('autoNumeric');
                'object' != typeof d &&
                    a.error("You must initialize autoNumeric('init', {options}) prior to calling the 'update' method");
                var e = c.autoNumeric('get');
                if (
                    ((d = a.extend(d, b)),
                    s(c, d, !0),
                    d.aDec === d.aSep &&
                        a.error(
                            "autoNumeric will not function properly when the decimal character aDec: '" +
                                d.aDec +
                                "' and thousand separator aSep: '" +
                                d.aSep +
                                "' are the same character"
                        ),
                    c.data('autoNumeric', d),
                    '' !== c.val() || '' !== c.text())
                )
                    return c.autoNumeric('set', e);
            });
        },
        set: function(b) {
            if (null !== b && !isNaN(b))
                return a(this).each(function() {
                    var c = r(a(this)),
                        d = c.data('autoNumeric'),
                        e = b.toString(),
                        f = b.toString(),
                        g = c.is('input[type=text], input[type=hidden], input[type=tel], input:not([type])');
                    return (
                        'object' != typeof d &&
                            a.error(
                                "You must initialize autoNumeric('init', {options}) prior to calling the 'set' method"
                            ),
                        (f !== c.attr('value') && f !== c.text()) || d.runOnce !== !1 || (e = e.replace(',', '.')),
                        a.isNumeric(+e) ||
                            a.error(
                                'The value (' + e + ") being 'set' is not numeric and has caused a error to be thrown"
                            ),
                        (e = i(e, d)),
                        (d.setEvent = !0),
                        e.toString(),
                        '' !== e && (e = n(e, d)),
                        (e = k(e, d.aDec, d.aNeg)),
                        p(e, d) || (e = n('', d)),
                        (e = m(e, d)),
                        g ? c.val(e) : a.inArray(c.prop('tagName').toLowerCase(), d.tagList) !== -1 && c.text(e)
                    );
                });
        },
        get: function() {
            var b = r(a(this)),
                c = b.data('autoNumeric');
            'object' != typeof c &&
                a.error("You must initialize autoNumeric('init', {options}) prior to calling the 'get' method");
            var d = '';
            return (
                b.is('input[type=text], input[type=hidden], input[type=tel], input:not([type])')
                    ? (d = b.eq(0).val())
                    : a.inArray(b.prop('tagName').toLowerCase(), c.tagList) !== -1
                    ? (d = b.eq(0).text())
                    : a.error('The <' + b.prop('tagName').toLowerCase() + '> is not supported by autoNumeric()'),
                ('' === d && 'empty' === c.wEmpty) || (d === c.aSign && ('sign' === c.wEmpty || 'empty' === c.wEmpty))
                    ? ''
                    : ('' !== d &&
                          null !== c.nBracket &&
                          ((c.removeBrackets = !0), (d = h(d, c)), (c.removeBrackets = !1)),
                      (c.runOnce || c.aForm === !1) && (d = g(d, c)),
                      (d = j(d, c.aDec, c.aNeg)),
                      0 === +d && 'keep' !== c.lZero && (d = '0'),
                      'keep' === c.lZero ? d : (d = i(d, c)))
            );
        },
        getString: function() {
            var b = !1,
                c = r(a(this)),
                d = c.serialize(),
                e = d.split('&'),
                f = a('form').index(c),
                g = a('form:eq(' + f + ')'),
                h = [],
                i = [],
                j = /^(?:submit|button|image|reset|file)$/i,
                k = /^(?:input|select|textarea|keygen)/i,
                l = /^(?:checkbox|radio)$/i,
                m = /^(?:button|checkbox|color|date|datetime|datetime-local|email|file|image|month|number|password|radio|range|reset|search|submit|time|url|week)/i,
                n = 0;
            return (
                a.each(g[0], function(a, b) {
                    '' === b.name ||
                    !k.test(b.localName) ||
                    j.test(b.type) ||
                    b.disabled ||
                    (!b.checked && l.test(b.type))
                        ? i.push(-1)
                        : (i.push(n), (n += 1));
                }),
                (n = 0),
                a.each(g[0], function(a, b) {
                    'input' !== b.localName ||
                    ('' !== b.type && 'text' !== b.type && 'hidden' !== b.type && 'tel' !== b.type)
                        ? (h.push(-1), 'input' === b.localName && m.test(b.type) && (n += 1))
                        : (h.push(n), (n += 1));
                }),
                a.each(e, function(c, d) {
                    d = e[c].split('=');
                    var g = a.inArray(c, i);
                    if (g > -1 && h[g] > -1) {
                        var j = a('form:eq(' + f + ') input:eq(' + h[g] + ')'),
                            k = j.data('autoNumeric');
                        'object' == typeof k &&
                            null !== d[1] &&
                            ((d[1] = a('form:eq(' + f + ') input:eq(' + h[g] + ')')
                                .autoNumeric('get')
                                .toString()),
                            (e[c] = d.join('=')),
                            (b = !0));
                    }
                }),
                b ||
                    a.error(
                        "You must initialize autoNumeric('init', {options}) prior to calling the 'getString' method"
                    ),
                e.join('&')
            );
        },
        getArray: function() {
            var b = !1,
                c = r(a(this)),
                d = c.serializeArray(),
                e = a('form').index(c),
                f = a('form:eq(' + e + ')'),
                g = [],
                h = [],
                i = /^(?:submit|button|image|reset|file)$/i,
                j = /^(?:input|select|textarea|keygen)/i,
                k = /^(?:checkbox|radio)$/i,
                l = /^(?:button|checkbox|color|date|datetime|datetime-local|email|file|image|month|number|password|radio|range|reset|search|submit|time|url|week)/i,
                m = 0;
            return (
                a.each(f[0], function(a, b) {
                    '' === b.name ||
                    !j.test(b.localName) ||
                    i.test(b.type) ||
                    b.disabled ||
                    (!b.checked && k.test(b.type))
                        ? h.push(-1)
                        : (h.push(m), (m += 1));
                }),
                (m = 0),
                a.each(f[0], function(a, b) {
                    'input' !== b.localName ||
                    ('' !== b.type && 'text' !== b.type && 'hidden' !== b.type && 'tel' !== b.type)
                        ? (g.push(-1), 'input' === b.localName && l.test(b.type) && (m += 1))
                        : (g.push(m), (m += 1));
                }),
                a.each(d, function(c, d) {
                    var f = a.inArray(c, h);
                    if (f > -1 && g[f] > -1) {
                        var i = a('form:eq(' + e + ') input:eq(' + g[f] + ')'),
                            j = i.data('autoNumeric');
                        'object' == typeof j &&
                            ((d.value = a('form:eq(' + e + ') input:eq(' + g[f] + ')')
                                .autoNumeric('get')
                                .toString()),
                            (b = !0));
                    }
                }),
                b || a.error('None of the successful form inputs are initialized by autoNumeric.'),
                d
            );
        },
        getSettings: function() {
            var b = r(a(this));
            return b.eq(0).data('autoNumeric');
        },
    };
    (a.fn.autoNumeric = function(b) {
        return t[b]
            ? t[b].apply(this, Array.prototype.slice.call(arguments, 1))
            : 'object' != typeof b && b
            ? void a.error('Method "' + b + '" is not supported by autoNumeric()')
            : t.init.apply(this, arguments);
    }),
        (a.fn.autoNumeric.defaults = {
            aSep: ',',
            dGroup: '3',
            aDec: '.',
            altDec: null,
            aSign: '',
            pSign: 'p',
            vMax: '9999999999999.99',
            vMin: '-9999999999999.99',
            mDec: null,
            mRound: 'S',
            aPad: !0,
            nBracket: null,
            wEmpty: 'empty',
            lZero: 'allow',
            sNumber: !0,
            aForm: !0,
            anDefault: null,
        });
});
