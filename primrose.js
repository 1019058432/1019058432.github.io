const singleLineOutput = Object.freeze(["CursorLeft", "CursorRight", "CursorSkipLeft", "CursorSkipRight", "CursorHome", "CursorEnd", "CursorFullHome", "CursorFullEnd", "SelectLeft", "SelectRight", "SelectSkipLeft", "SelectSkipRight", "SelectHome", "SelectEnd", "SelectFullHome", "SelectFullEnd", "SelectAll"])
  , multiLineOutput = Object.freeze(singleLineOutput.concat(["CursorDown", "CursorUp", "CursorPageDown", "CursorPageUp", "SelectDown", "SelectUp", "SelectPageDown", "SelectPageUp", "ScrollDown", "ScrollUp"]))
  , input = ["Backspace", "Delete", "DeleteWordLeft", "DeleteWordRight", "DeleteLine", "Undo", "Redo"]
  , singleLineInput = Object.freeze(singleLineOutput.concat(input))
  , multiLineInput = Object.freeze(multiLineOutput.concat(input).concat(["AppendNewline", "PrependNewline"]))
  , combiningMarks = /(<%= allExceptCombiningMarks %>)(<%= combiningMarks %>+)/g
  , surrogatePair = /(<%= highSurrogates %>)(<%= lowSurrogates %>)/g;
function reverse(e) {
    let t = "";
    for (let n = (e = e.replace(combiningMarks, (function(e, t, n) {
        return reverse(n) + t
    }
    )).replace(surrogatePair, "$2$1")).length - 1; n >= 0; --n)
        t += e[n];
    return t
}
class Cursor {
    static min(e, t) {
        return e.i <= t.i ? e : t
    }
    static max(e, t) {
        return e.i > t.i ? e : t
    }
    constructor(e, t, n) {
        this.i = e || 0,
        this.x = t || 0,
        this.y = n || 0,
        Object.seal(this)
    }
    clone() {
        return new Cursor(this.i,this.x,this.y)
    }
    toString() {
        return `[i:${this.i} x:${this.x} y:${this.y}]`
    }
    copy(e) {
        this.i = e.i,
        this.x = e.x,
        this.y = e.y
    }
    fullHome() {
        this.i = 0,
        this.x = 0,
        this.y = 0
    }
    fullEnd(e) {
        this.i = 0;
        let t = 0;
        for (let n = 0; n < e.length; ++n) {
            t = e[n].stringLength,
            this.i += t
        }
        this.y = e.length - 1,
        this.x = t
    }
    left(e, t=!1) {
        if (this.i > 0)
            if (--this.i,
            --this.x,
            this.x < 0) {
                --this.y;
                const t = e[this.y];
                this.x = t.stringLength - 1
            } else
                t || e[this.y].adjust(this, -1)
    }
    skipLeft(e) {
        if (this.x <= 1)
            this.left(e);
        else {
            const t = this.x - 1
              , n = reverse(e[this.y].substring(0, t)).match(/\w+/)
              , i = n ? n.index + n[0].length + 1 : this.x;
            this.i -= i,
            this.x -= i,
            e[this.y].adjust(this, -1)
        }
    }
    right(e, t=!1) {
        const n = e[this.y];
        (this.y < e.length - 1 || this.x < n.stringLength) && (++this.i,
        ++this.x,
        this.y < e.length - 1 && this.x === n.stringLength ? (this.x = 0,
        ++this.y) : t || e[this.y].adjust(this, 1))
    }
    skipRight(e) {
        const t = e[this.y];
        if (this.x < t.stringLength - 1) {
            const n = this.x + 1
              , i = t.substring(n).match(/\w+/)
              , r = i ? i.index + i[0].length + 1 : t.stringLength - this.x;
            this.i += r,
            this.x += r,
            this.x > 0 && this.x === t.stringLength && this.y < e.length - 1 && (--this.x,
            --this.i),
            e[this.y].adjust(this, 1)
        } else
            this.y < e.length - 1 && this.right(e)
    }
    home() {
        this.i -= this.x,
        this.x = 0
    }
    end(e) {
        let t = e[this.y].stringLength - this.x;
        this.y < e.length - 1 && --t,
        this.i += t,
        this.x += t
    }
    up(e, t=!1) {
        if (this.y > 0) {
            --this.y;
            const n = e[this.y]
              , i = Math.min(0, n.stringLength - this.x - 1);
            this.x += i,
            this.i -= n.stringLength - i,
            t || e[this.y].adjust(this, 1)
        }
    }
    down(e, t=!1) {
        if (this.y < e.length - 1) {
            const n = e[this.y];
            ++this.y,
            this.i += n.stringLength;
            const i = e[this.y];
            if (this.x >= i.stringLength) {
                let t = this.x - i.stringLength;
                this.y < e.length - 1 && ++t,
                this.i -= t,
                this.x -= t
            }
            t || e[this.y].adjust(this, 1)
        }
    }
    incX(e, t) {
        const n = Math.sign(t);
        if (t = Math.abs(t),
        -1 === n) {
            for (let n = 0; n < t; ++n)
                this.left(e, !0);
            e[this.y].adjust(this, -1)
        } else if (1 === n) {
            for (let n = 0; n < t; ++n)
                this.right(e, !0);
            e[this.y].adjust(this, 1)
        }
    }
    incY(e, t) {
        const n = Math.sign(t);
        if (t = Math.abs(t),
        -1 === n)
            for (let n = 0; n < t; ++n)
                this.up(e, !0);
        else if (1 === n)
            for (let n = 0; n < t; ++n)
                this.down(e, !0);
        e[this.y].adjust(this, 1)
    }
    setXY(e, t, n) {
        t = Math.floor(t),
        n = Math.floor(n),
        this.y = Math.max(0, Math.min(e.length - 1, n));
        const i = e[this.y];
        this.x = Math.max(0, Math.min(i.stringLength, t)),
        this.i = this.x;
        for (let t = 0; t < this.y; ++t)
            this.i += e[t].stringLength;
        this.x > 0 && this.x === i.stringLength && this.y < e.length - 1 && (--this.x,
        --this.i),
        e[this.y].adjust(this, 1)
    }
    setI(e, t) {
        const n = this.i - t
          , i = Math.sign(n);
        this.x = this.i = t,
        this.y = 0;
        let r = 0
          , o = e[this.y];
        for (; this.x > o.stringLength; ) {
            if (this.x -= o.stringLength,
            r += o.stringLength,
            this.y >= e.length - 1) {
                this.i = r,
                this.x = o.stringLength;
                break
            }
            ++this.y,
            o = e[this.y]
        }
        this.y < e.length - 1 && this.x === o.stringLength && (this.x = 0,
        ++this.y),
        e[this.y].adjust(this, i)
    }
}
function arrayRemoveAt(e, t) {
    if (!(e instanceof Array))
        throw new Error("Must provide an array as the first parameter.");
    return e.splice(t, 1)
}
function isFunction(e) {
    return "function" == typeof e || e instanceof Function
}
const EventBase = function() {
    try {
        return new window.EventTarget,
        class extends EventTarget {
            constructor() {
                super()
            }
        }
    } catch (e) {
        const t = new WeakMap;
        return class {
            constructor() {
                t.set(this, new Map)
            }
            addEventListener(e, n, i) {
                if (isFunction(n)) {
                    const r = t.get(this);
                    r.has(e) || r.set(e, []);
                    const o = r.get(e);
                    o.find(e=>e.callback === n) || o.push({
                        target: this,
                        callback: n,
                        options: i
                    })
                }
            }
            removeEventListener(e, n) {
                if (isFunction(n)) {
                    const i = t.get(this);
                    if (i.has(e)) {
                        const t = i.get(e)
                          , r = t.findIndex(e=>e.callback === n);
                        r >= 0 && arrayRemoveAt(t, r)
                    }
                }
            }
            dispatchEvent(e) {
                const n = t.get(this);
                if (n.has(e.type)) {
                    const t = n.get(e.type);
                    for (const n of t)
                        n.options && n.options.once && this.removeEventListener(e.type, n.callback),
                        n.callback.call(n.target, e);
                    return !e.defaultPrevented
                }
                return !0
            }
        }
    }
}()
  , isOpera = !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0
  , isFirefox = void 0 !== window.InstallTrigger
  , isiOS = /iP(hone|od|ad)/.test(navigator.userAgent || "")
  , isMacOS = /Macintosh/.test(navigator.userAgent || "")
  , isApple = isiOS || isMacOS
  , isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0;
function testUserAgent(e) {
    return /(android|bb\d+|meego).+|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(e) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substring(0, 4))
}
const isMobile = testUserAgent(navigator.userAgent || navigator.vendor || window.opera)
  , monospaceFamily = "'Droid Sans Mono', 'Consolas', 'Lucida Console', 'Courier New', 'Courier', monospace";
class Rule {
    constructor(e, t) {
        this.name = e,
        this.test = t,
        Object.freeze(this)
    }
    carveOutMatchedToken(e, t) {
        const n = e[t];
        if ("regular" === n.type) {
            const i = this.test.exec(n.value);
            if (i) {
                const r = i[i.length - 1]
                  , o = i.input.indexOf(r)
                  , s = o + r.length;
                if (0 === o) {
                    if (n.type = this.name,
                    s < n.length) {
                        const i = n.splitAt(s);
                        i.type = "regular",
                        e.splice(t + 1, 0, i)
                    }
                } else {
                    const i = n.splitAt(o);
                    if (r.length < i.length) {
                        const n = i.splitAt(r.length);
                        e.splice(t + 1, 0, n)
                    }
                    i.type = this.name,
                    e.splice(t + 1, 0, i)
                }
            }
        }
    }
}
class Token {
    constructor(e, t, n) {
        this.value = e,
        this.startStringIndex = n,
        this.type = t,
        Object.seal(this)
    }
    get length() {
        return this.value.length
    }
    get endStringIndex() {
        return this.startStringIndex + this.length
    }
    clone() {
        return new Token(this.value,this.type,this.startStringIndex)
    }
    splitAt(e) {
        var t = this.value.substring(e);
        return this.value = this.value.substring(0, e),
        new Token(t,this.type,this.startStringIndex + e)
    }
    toString() {
        return `[${this.type}: ${this.value}]`
    }
}
const Dark = Object.freeze({
    name: "Dark",
    cursorColor: "white",
    unfocused: "rgba(0, 0, 255, 0.25)",
    currentRowBackColor: "#202020",
    selectedBackColor: "#404040",
    lineNumbers: {
        foreColor: "white"
    },
    regular: {
        backColor: "rgba(0, 0, 0, 0.5)",
        foreColor: "#c0c0c0"
    },
    strings: {
        foreColor: "#aa9900",
        fontStyle: "italic"
    },
    regexes: {
        foreColor: "#aa0099",
        fontStyle: "italic"
    },
    numbers: {
        foreColor: "green"
    },
    comments: {
        foreColor: "yellow",
        fontStyle: "italic"
    },
    keywords: {
        foreColor: "cyan"
    },
    functions: {
        foreColor: "brown",
        fontWeight: "bold"
    },
    members: {
        foreColor: "green"
    },
    error: {
        foreColor: "red",
        fontStyle: "underline italic"
    }
})
  , Light = Object.freeze({
    name: "Light",
    cursorColor: "black",
    unfocused: "rgba(0, 0, 255, 0.25)",
    currentRowBackColor: "#f0f0f0",
    selectedBackColor: "#c0c0c0",
    lineNumbers: {
        foreColor: "black"
    },
    regular: {
        backColor: "white",
        foreColor: "black"
    },
    strings: {
        foreColor: "#aa9900",
        fontStyle: "italic"
    },
    regexes: {
        foreColor: "#aa0099",
        fontStyle: "italic"
    },
    numbers: {
        foreColor: "green"
    },
    comments: {
        foreColor: "grey",
        fontStyle: "italic"
    },
    keywords: {
        foreColor: "blue"
    },
    functions: {
        foreColor: "brown",
        fontWeight: "bold"
    },
    members: {
        foreColor: "green"
    },
    error: {
        foreColor: "red",
        fontStyle: "underline italic"
    }
})
  , themes = Object.freeze(new Map([["light", Light], ["dark", Dark]]));
function assignAttributes(e, ...t) {
    t.filter(e=>!(e instanceof Element || e instanceof String || "string" == typeof e)).forEach(t=>{
        for (let n in t) {
            const i = t[n];
            if ("style" === n)
                for (let t in i)
                    e[n][t] = i[t];
            else
                "textContent" === n || "innerText" === n ? e.appendChild(document.createTextNode(i)) : n.startsWith("on") && "function" == typeof i ? e.addEventListener(n.substring(2), i) : ("boolean" == typeof i || i instanceof Boolean) && "muted" !== n ? i ? e.setAttribute(n, "") : e.removeAttribute(n) : e[n] = i
        }
    }
    )
}
function clear(e) {
    for (; e.lastChild; )
        e.lastChild.remove()
}
function tag(e, ...t) {
    const n = document.createElement(e);
    assignAttributes(n, ...t);
    const i = t.filter(e=>e instanceof String || "string" == typeof e).reduce((e,t)=>e + "\n" + t, "").trim();
    return i.length > 0 && n.appendChild(document.createTextNode(i)),
    t.filter(e=>e instanceof Element).forEach(n.appendChild.bind(n)),
    n
}
function br() {
    return tag("br")
}
function canvas(...e) {
    return tag("canvas", ...e)
}
function div(...e) {
    return tag("div", ...e)
}
function span(...e) {
    return tag("span", ...e)
}
function text(e) {
    return document.createTextNode(e)
}
function isCanvas(e) {
    return e instanceof HTMLCanvasElement || !!(window.OffscreenCanvas && e instanceof OffscreenCanvas)
}
function offscreenCanvas(e) {
    const t = e && e.width || 512
      , n = e && e.height || t;
    return e instanceof Object && Object.assign(e, {
        width: t,
        height: n
    }),
    window.OffscreenCanvas ? new OffscreenCanvas(t,n) : canvas(e)
}
function setCanvasSize(e, t, n, i=1) {
    return t = Math.floor(t * i),
    n = Math.floor(n * i),
    (e.width != t || e.height != n) && (e.width = t,
    e.height = n,
    !0)
}
function setContextSize(e, t, n, i=1) {
    const r = e.imageSmoothingEnabled
      , o = e.textBaseline
      , s = e.textAlign
      , a = e.font
      , l = setCanvasSize(e.canvas, t, n, i);
    return l && (e.imageSmoothingEnabled = r,
    e.textBaseline = o,
    e.textAlign = s,
    e.font = a),
    l
}
function resizeContext(e, t=1) {
    return setContextSize(e, e.canvas.clientWidth, e.canvas.clientHeight, t)
}
function crudeParsing(e) {
    var t = null
      , n = null;
    for (let i = 0; i < e.length; ++i) {
        const r = e[i];
        n ? ("stringDelim" !== r.type || r.value !== n || 0 !== i && "\\" === e[i - 1].value[e[i - 1].value.length - 1] || (n = null),
        "newlines" !== r.type && (r.type = "strings")) : t ? (("startBlockComments" === t && "endBlockComments" === r.type || "startLineComments" === t && "newlines" === r.type) && (t = null),
        "newlines" !== r.type && (r.type = "comments")) : "stringDelim" === r.type ? (n = r.value,
        r.type = "strings") : "startBlockComments" !== r.type && "startLineComments" !== r.type || (t = r.type,
        r.type = "comments")
    }
    for (let t = e.length - 1; t > 0; --t) {
        const n = e[t - 1]
          , i = e[t];
        n.type === i.type && "newlines" !== n.type && (n.value += i.value,
        e.splice(t, 1))
    }
    for (let t = e.length - 1; t >= 0; --t)
        0 === e[t].length && e.splice(t, 1)
}
class Grammar {
    constructor(e, t) {
        t = t || [],
        this.name = e,
        this.grammar = t.map(e=>new Rule(e[0],e[1])),
        Object.freeze(this)
    }
    tokenize(e) {
        const t = [new Token(e,"regular",0)];
        for (let e of this.grammar)
            for (var n = 0; n < t.length; ++n)
                e.carveOutMatchedToken(t, n);
        return crudeParsing(t),
        t
    }
    toHTML(e, t, n, i) {
        void 0 === n && (n = Light);
        for (var r = this.tokenize(t), o = div(), s = 0; s < r.length; ++s) {
            var a = r[s];
            if ("newlines" === a.type)
                o.appendChild(br());
            else {
                var l = n[a.type] || {}
                  , h = span({
                    fontWeight: l.fontWeight || n.regular.fontWeight,
                    fontStyle: l.fontStyle || n.regular.fontStyle || "",
                    color: l.foreColor || n.regular.foreColor,
                    backgroundColor: l.backColor || n.regular.backColor,
                    fontFamily: monospaceFamily
                });
                h.appendChild(text(a.value)),
                o.appendChild(h)
            }
        }
        e.innerHTML = o.innerHTML,
        Object.assign(e.style, {
            backgroundColor: n.regular.backColor,
            fontSize: i + "px",
            lineHeight: i + "px"
        })
    }
}
class BasicGrammar extends Grammar {
    constructor() {
        super("BASIC", [["newlines", /(?:\r\n|\r|\n)/], ["lineNumbers", /^\d+\s+/], ["whitespace", /(?:\s+)/], ["startLineComments", /^REM\s/], ["stringDelim", /("|')/], ["numbers", /-?(?:(?:\b\d*)?\.)?\b\d+\b/], ["keywords", /\b(?:RESTORE|REPEAT|RETURN|LOAD|LABEL|DATA|READ|THEN|ELSE|FOR|DIM|LET|IF|TO|STEP|NEXT|WHILE|WEND|UNTIL|GOTO|GOSUB|ON|TAB|AT|END|STOP|PRINT|INPUT|RND|INT|CLS|CLK|LEN)\b/], ["keywords", /^DEF FN/], ["operators", /(?:\+|;|,|-|\*\*|\*|\/|>=|<=|=|<>|<|>|OR|AND|NOT|MOD|\(|\)|\[|\])/], ["members", /\w+\$?/]])
    }
    tokenize(e) {
        return super.tokenize(e.toUpperCase())
    }
    interpret(sourceCode, input, output, errorOut, next, clearScreen, loadFile, done) {
        var tokens = this.tokenize(sourceCode)
          , EQUAL_SIGN = new Token("=","operators")
          , counter = 0
          , isDone = !1
          , program = new Map
          , lineNumbers = []
          , currentLine = []
          , lines = [currentLine]
          , data = []
          , returnStack = []
          , forLoopCounters = new Map
          , dataCounter = 0;
        function toNum(e) {
            return new Token(e.toString(),"numbers")
        }
        function toStr(e) {
            return new Token('"' + e.replace("\n", "\\n").replace('"', '\\"') + '"',"strings")
        }
        Object.assign(window, {
            INT: function(e) {
                return 0 | e
            },
            RND: function() {
                return Math.random()
            },
            CLK: function() {
                return Date.now() / 36e5
            },
            LEN: function(e) {
                return e.length
            },
            LINE: function() {
                return lineNumbers[counter]
            },
            TAB: function(e) {
                for (var t = "", n = 0; n < e; ++n)
                    t += " ";
                return t
            },
            POW: function(e, t) {
                return Math.pow(e, t)
            }
        });
        for (var tokenMap = {
            OR: "||",
            AND: "&&",
            NOT: "!",
            MOD: "%",
            "<>": "!="
        }; tokens.length > 0; ) {
            var token = tokens.shift();
            "newlines" === token.type ? (currentLine = [],
            lines.push(currentLine)) : "regular" !== token.type && "comments" !== token.type && (token.value = tokenMap[token.value] || token.value,
            currentLine.push(token))
        }
        for (var i = 0; i < lines.length; ++i) {
            var line = lines[i];
            if (line.length > 0) {
                var lastLine = lineNumbers[lineNumbers.length - 1]
                  , lineNumber = line.shift();
                if ("lineNumbers" !== lineNumber.type && (line.unshift(lineNumber),
                void 0 === lastLine && (lastLine = -1),
                lineNumber = toNum(lastLine + 1)),
                lineNumber = parseFloat(lineNumber.value),
                lastLine && lineNumber <= lastLine)
                    throw new Error("expected line number greater than " + lastLine + ", but received " + lineNumber + ".");
                line.length > 0 && (lineNumbers.push(lineNumber),
                program.set(lineNumber, line))
            }
        }
        function process(e) {
            if (e && e.length > 0) {
                var t = e.shift();
                if (t) {
                    if (commands.hasOwnProperty(t.value))
                        return commands[t.value](e);
                    if (!isNaN(t.value))
                        return setProgramCounter([t]);
                    if (window[t.value] || e.length > 0 && "operators" === e[0].type && "=" === e[0].value)
                        return e.unshift(t),
                        translate(e);
                    error("Unknown command. >>> " + t.value)
                }
            }
            return pauseBeforeComplete()
        }
        function error(e) {
            errorOut("At line " + lineNumbers[counter] + ": " + e)
        }
        function getLine(e) {
            var t = lineNumbers[e]
              , n = program.get(t);
            return n && n.slice()
        }
        function evaluate(line) {
            for (var script = "", i = 0; i < line.length; ++i) {
                var t = line[i]
                  , nest = 0;
                if ("identifiers" === t.type && "function" != typeof window[t.value] && i < line.length - 1 && "(" === line[i + 1].value)
                    for (var j = i + 1; j < line.length; ++j) {
                        var t2 = line[j];
                        if ("(" === t2.value ? (0 === nest && (t2.value = "["),
                        ++nest) : ")" === t2.value ? (--nest,
                        0 === nest && (t2.value = "]")) : "," === t2.value && 1 === nest && (t2.value = "]["),
                        0 === nest)
                            break
                    }
                script += t.value
            }
            try {
                return eval(script)
            } catch (e) {
                console.error(e),
                console.debug(line.join(", ")),
                console.error(script),
                error(e.message + ": " + script)
            }
        }
        function declareVariable(e) {
            var t, n = [], i = [n], r = 0;
            for (t = 0; t < e.length; ++t) {
                var o = e[t];
                "(" === o.value ? ++r : ")" === o.value && --r,
                0 === r && "," === o.value ? (n = [],
                i.push(n)) : n.push(o)
            }
            for (t = 0; t < i.length; ++t) {
                var s = (n = i[t]).shift();
                if ("identifiers" === s.type) {
                    var a, l = null;
                    if (s = s.value,
                    "(" === n[0].value && ")" === n[n.length - 1].value) {
                        var h = [];
                        for (a = 1; a < n.length - 1; ++a)
                            "numbers" === n[a].type && h.push(0 | n[a].value);
                        if (0 === h.length)
                            l = [];
                        else {
                            var u = [l = new Array(h[0])];
                            for (a = 1; a < h.length; ++a)
                                for (var c = h[a], d = 0, g = u.length; d < g; ++d)
                                    for (var p = u.shift(), m = 0; m < p.length; ++m)
                                        p[m] = new Array(c),
                                        a < h.length - 1 && u.push(p[m])
                        }
                    }
                    return window[s] = l,
                    !0
                }
                error("Identifier expected: " + s.value)
            }
        }
        function print(e) {
            var t = "\n"
              , n = 0
              , i = evaluate(e = e.map((function(i, r) {
                return "operators" === (i = i.clone()).type && ("," === i.value ? 0 === n && (i.value = '+ ", " + ') : ";" === i.value ? (i.value = '+ " "',
                r < e.length - 1 ? i.value += " + " : t = "") : "(" === i.value ? ++n : ")" === i.value && --n),
                i
            }
            )));
            return void 0 === i && (i = ""),
            output(i + t),
            !0
        }
        function setProgramCounter(e) {
            var t = parseFloat(evaluate(e));
            for (counter = -1; counter < lineNumbers.length - 1 && lineNumbers[counter + 1] < t; )
                ++counter;
            return !0
        }
        function checkConditional(e) {
            var t, n = -1, i = -1;
            for (t = 0; t < e.length; ++t)
                "keywords" === e[t].type && "THEN" === e[t].value ? n = t : "keywords" === e[t].type && "ELSE" === e[t].value && (i = t);
            if (-1 === n)
                error("Expected THEN clause.");
            else {
                var r, o, s = e.slice(0, n);
                for (t = 0; t < s.length; ++t) {
                    var a = s[t];
                    "operators" === a.type && "=" === a.value && (a.value = "==")
                }
                if (-1 === i ? r = e.slice(n + 1) : (r = e.slice(n + 1, i),
                o = e.slice(i + 1)),
                evaluate(s))
                    return process(r);
                if (o)
                    return process(o)
            }
            return !0
        }
        function pauseBeforeComplete() {
            return output("PROGRAM COMPLETE - PRESS RETURN TO FINISH."),
            input((function() {
                isDone = !0,
                done && done()
            }
            )),
            !1
        }
        function labelLine(e) {
            return e.push(EQUAL_SIGN),
            e.push(toNum(lineNumbers[counter])),
            translate(e)
        }
        function waitForInput(e) {
            var t = e.pop();
            return e.length > 0 && print(e),
            input((function(e) {
                e = e.toUpperCase();
                var n = null;
                n = isNaN(e) ? toStr(e) : toNum(e),
                evaluate([t, EQUAL_SIGN, n]),
                next && next()
            }
            )),
            !1
        }
        function onStatement(e) {
            var t = []
              , n = null
              , i = [];
            try {
                for (; e.length > 0 && ("keywords" !== e[0].type || "GOTO" !== e[0].value); )
                    t.push(e.shift());
                if (e.length > 0) {
                    e.shift();
                    for (var r = 0; r < e.length; ++r) {
                        var o = e[r];
                        "operators" === o.type && "," === o.value || i.push(o)
                    }
                    if (0 <= (n = evaluate(t) - 1) && n < i.length)
                        return setProgramCounter([i[n]])
                }
            } catch (e) {
                console.error(e)
            }
            return !0
        }
        function gotoSubroutine(e) {
            return returnStack.push(toNum(lineNumbers[counter + 1])),
            setProgramCounter(e)
        }
        function setRepeat() {
            return returnStack.push(toNum(lineNumbers[counter])),
            !0
        }
        function conditionalReturn(e) {
            var t = !0
              , n = returnStack.pop();
            return n && e && (t = setProgramCounter([n])),
            t
        }
        function untilLoop(e) {
            return conditionalReturn(!evaluate(e))
        }
        function findNext(e) {
            for (i = counter + 1; i < lineNumbers.length; ++i) {
                if (getLine(i)[0].value === e)
                    return i
            }
            return lineNumbers.length
        }
        function whileLoop(e) {
            return evaluate(e) ? returnStack.push(toNum(lineNumbers[counter])) : counter = findNext("WEND"),
            !0
        }
        var FOR_LOOP_DELIMS = ["=", "TO", "STEP"];
        function forLoop(e) {
            var t = lineNumbers[counter]
              , n = []
              , i = []
              , r = []
              , o = []
              , s = [n, i, r, o]
              , a = 0
              , l = 0;
            for (l = 0; l < e.length; ++l) {
                var h = e[l];
                h.value === FOR_LOOP_DELIMS[a] ? (0 === a && n.push(h),
                ++a) : s[a].push(h)
            }
            var u = 1;
            o.length > 0 && (u = evaluate(o)),
            void 0 === !forLoopCounters.has(t) && forLoopCounters.set(t, evaluate(i));
            var c = evaluate(r);
            if (forLoopCounters.get(t) <= c) {
                var d = forLoopCounters.get(t);
                n.push(toNum(d)),
                process(n),
                d += u,
                forLoopCounters.set(t, d),
                returnStack.push(toNum(lineNumbers[counter]))
            } else
                forLoopCounters.delete(t),
                counter = findNext("NEXT");
            return !0
        }
        function stackReturn() {
            return conditionalReturn(!0)
        }
        function loadCodeFile(e) {
            return loadFile(evaluate(e)).then(next),
            !1
        }
        function noop() {
            return !0
        }
        function loadData(e) {
            for (; e.length > 0; ) {
                var t = e.shift();
                "operators" !== t.type && data.push(t.value)
            }
            return !0
        }
        function readData(e) {
            0 === data.length && process(getLine(findNext("DATA")));
            var t = data[dataCounter];
            return ++dataCounter,
            e.push(EQUAL_SIGN),
            e.push(toNum(t)),
            translate(e)
        }
        function restoreData() {
            return dataCounter = 0,
            !0
        }
        function defineFunction(line) {
            for (var name = line.shift().value, signature = "", body = "", fillSig = !0, i = 0; i < line.length; ++i) {
                var t = line[i];
                "operators" === t.type && "=" === t.value ? fillSig = !1 : fillSig ? signature += t.value : body += t.value
            }
            name = "FN" + name;
            var script = "(function " + name + signature + "{ return " + body + "; })";
            return window[name] = eval(script),
            !0
        }
        function translate(e) {
            return evaluate(e),
            !0
        }
        var commands = {
            DIM: declareVariable,
            LET: translate,
            PRINT: print,
            GOTO: setProgramCounter,
            IF: checkConditional,
            INPUT: waitForInput,
            END: pauseBeforeComplete,
            STOP: pauseBeforeComplete,
            REM: noop,
            "'": noop,
            CLS: clearScreen,
            ON: onStatement,
            GOSUB: gotoSubroutine,
            RETURN: stackReturn,
            LOAD: loadCodeFile,
            DATA: loadData,
            READ: readData,
            RESTORE: restoreData,
            REPEAT: setRepeat,
            UNTIL: untilLoop,
            "DEF FN": defineFunction,
            WHILE: whileLoop,
            WEND: stackReturn,
            FOR: forLoop,
            NEXT: stackReturn,
            LABEL: labelLine
        };
        return function() {
            if (!isDone)
                for (var e = !0; e; ) {
                    e = process(getLine(counter)),
                    ++counter
                }
        }
    }
}
const Basic = new BasicGrammar
  , HTML = new Grammar("HTML",[["newlines", /(?:\r\n|\r|\n)/], ["whitespace", /(?:\s+)/], ["startBlockComments", /(?:<|&lt;)!--/], ["endBlockComments", /--(?:>|&gt;)/], ["stringDelim", /("|')/], ["numbers", /-?(?:(?:\b\d*)?\.)?\b\d+\b/], ["keywords", /(?:<|&lt;)\/?(html|base|head|link|meta|style|title|address|article|aside|footer|header|h1|h2|h3|h4|h5|h6|hgroup|nav|section|dd|div|dl|dt|figcaption|figure|hr|li|main|ol|p|pre|ul|a|abbr|b|bdi|bdo|br|cite|code|data|dfn|em|i|kbd|mark|q|rp|rt|rtc|ruby|s|samp|small|span|strong|sub|sup|time|u|var|wbr|area|audio|img|map|track|video|embed|object|param|source|canvas|noscript|script|del|ins|caption|col|colgroup|table|tbody|td|tfoot|th|thead|tr|button|datalist|fieldset|form|input|label|legend|meter|optgroup|option|output|progress|select|textarea|details|dialog|menu|menuitem|summary|content|element|shadow|template|acronym|applet|basefont|big|blink|center|command|content|dir|font|frame|frameset|isindex|keygen|listing|marquee|multicol|nextid|noembed|plaintext|spacer|strike|tt|xmp)\b/], ["members", /(\w+)=/]])
  , JavaScript = new Grammar("JavaScript",[["newlines", /(?:\r\n|\r|\n)/], ["whitespace", /(?:\s+)/], ["startBlockComments", /\/\*/], ["endBlockComments", /\*\//], ["regexes", /(?:^|,|;|\(|\[|\{)(?:\s*)(\/(?:\\\/|[^\n\/])+\/)/], ["stringDelim", /("|'|`)/], ["startLineComments", /\/\/.*$/m], ["numbers", /-?(?:(?:\b\d*)?\.)?\b\d+\b/], ["keywords", /\b(?:break|case|catch|class|const|continue|debugger|default|delete|do|else|export|finally|for|function|if|import|in|instanceof|let|new|return|super|switch|this|throw|try|typeof|var|void|while|with)\b/], ["functions", /(\w+)(?:\s*\()/], ["members", /(\w+)\./], ["members", /((\w+\.)+)(\w+)/]])
  , PlainText = new Grammar("PlainText",[["newlines", /(?:\r\n|\r|\n)/], ["whitespace", /(?:\s+)/]])
  , grammars = Object.freeze(new Map([["basic", Basic], ["bas", Basic], ["html", HTML], ["javascript", JavaScript], ["js", JavaScript], ["plaintext", PlainText], ["txt", PlainText]]))
  , keyGroups = Object.freeze(new Map([["special", ["Unidentified"]], ["modifier", ["Alt", "AltGraph", "CapsLock", "Control", "Fn", "FnLock", "Hyper", "Meta", "NumLock", "ScrollLock", "Shift", "Super", "Symbol", "SymbolLock"]], ["whitespace", ["Enter", "Tab"]], ["navigation", ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home", "PageDown", "PageUp"]], ["editing", ["Backspace", "Clear", "Copy", "CrSel", "Cut", "Delete", "EraseEof", "ExSel", "Insert", "Paste", "Redo", "Undo"]], ["ui", ["Accept", "Again", "Attn", "Cancel", "ContextMenu", "Escape", "Execute", "Find", "Finish", "Help", "Pause", "Play", "Props", "Select", "ZoomIn", "ZoomOut"]], ["device", ["BrightnessDown", "BrightnessUp", "Eject", "LogOff", "Power", "PowerOff", "PrintScreen", "Hibernate", "Standby", "WakeUp"]], ["ime", ["AllCandidates", "Alphanumeric", "CodeInput", "Compose", "Convert", "Dead", "FinalMode", "GroupFirst", "GroupNext", "GroupPrevious", "ModeChange", "NextCandidate", "NonConvert", "PreviousCandidate", "Process", "SingleCandidate"]], ["korean", ["HangulMode", "HanjaMode", "JunjaMode"]], ["japanese", ["Eisu", "Hankaku", "Hiragana", "HiraganaKatakana", "KanaMode", "KanjiMode", "Katakana", "Romaji", "Zenkaku", "ZenkakuHanaku"]], ["function", ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "F19", "F20", "Soft1", "Soft2", "Soft3", "Soft4"]], ["phone", ["AppSwitch", "Call", "Camera", "CameraFocus", "EndCall", "GoBack", "GoHome", "HeadsetHook", "LastNumberRedial", "Notification", "MannerMode", "VoiceDial"]], ["multimedia", ["ChannelDown", "ChannelUp", "MediaFastForward", "MediaPause", "MediaPlay", "MediaPlayPause", "MediaRecord", "MediaRewind", "MediaStop", "MediaTrackNext", "MediaTrackPrevious"]], ["audio", ["AudioBalanceLeft", "AudioBalanceRight", "AudioBassDown", "AudioBassBoostDown", "AudioBassBoostToggle", "AudioBassBoostUp", "AudioBassUp", "AudioFaderFront", "AudioFaderRear", "AudioSurroundModeNext", "AudioTrebleDown", "AudioTrebleUp", "AudioVolumeDown", "AudioVolumeMute", "AudioVolumeUp", "MicrophoneToggle", "MicrophoneVolumeDown", "MicrophoneVolumeMute", "MicrophoneVolumeUp"]], ["tv", ["TV", "TV3DMode", "TVAntennaCable", "TVAudioDescription", "TVAudioDescriptionMixDown", "TVAudioDescriptionMixUp", "TVContentsMenu", "TVDataService", "TVInput", "TVInputComponent1", "TVInputComponent2", "TVInputComposite1", "TVInputComposite2", "TVInputHDMI1", "TVInputHDMI2", "TVInputHDMI3", "TVInputHDMI4", "TVInputVGA1", "TVMediaContext", "TVNetwork", "TVNumberEntry", "TVPower", "TVRadioService", "TVSatellite", "TVSatelliteBS", "TVSatelliteCS", "TVSatelliteToggle", "TVTerrestrialAnalog", "TVTerrestrialDigital", "TVTimer"]], ["mediaController", ["AVRInput", "AVRPower", "ColorF0Red", "ColorF1Green", "ColorF2Yellow", "ColorF3Blue", "ColorF4Grey", "ColorF5Brown", "ClosedCaptionToggle", "Dimmer", "DisplaySwap", "DVR", "Exit", "FavoriteClear0", "FavoriteClear1", "FavoriteClear2", "FavoriteClear3", "FavoriteRecall0", "FavoriteRecall1", "FavoriteRecall2", "FavoriteRecall3", "FavoriteStore0", "FavoriteStore1", "FavoriteStore2", "FavoriteStore3", "Guide", "GuideNextDay", "GuidePreviousDay", "Info", "InstantReplay", "Link", "ListProgram", "LiveContent", "Lock", "MediaApps", "MediaAudioTrack", "MediaLast", "MediaSkipBackward", "MediaSkipForward", "MediaStepBackward", "MediaStepForward", "MediaTopMenu", "NavigateIn", "NavigateNext", "NavigateOut", "NavigatePrevious", "NextFavoriteChannel", "NextUserProfile", "OnDemand", "Pairing", "PinPDown", "PinPMove", "PinPToggle", "PinPUp", "PlaySpeedDown", "PlaySpeedReset", "PlaySpeedUp", "RandomToggle", "RcLowBattery", "RecordSpeedNext", "RfBypass", "ScanChannelsToggle", "ScreenModeNext", "Settings", "SplitScreenToggle", "STBInput", "STBPower", "Subtitle", "Teletext", "VideoModeNext", "Wink", "ZoomToggle"]], ["speechRecognition", ["SpeechCorrectionList", "SpeechInputToggle"]], ["document", ["Close", "New", "Open", "Print", "Save", "SpellCheck", "MailForward", "MailReply", "MailSend"]], ["applicationSelector", ["LaunchCalculator", "LaunchCalendar", "LaunchContacts", "LaunchMail", "LaunchMediaPlayer", "LaunchMusicPlayer", "LaunchMyComputer", "LaunchPhone", "LaunchScreenSaver", "LaunchSpreadsheet", "LaunchWebBrowser", "LaunchWebCam", "LaunchWordProcessor", "LaunchApplication1", "LaunchApplication2", "LaunchApplication3", "LaunchApplication4", "LaunchApplication5", "LaunchApplication6", "LaunchApplication7", "LaunchApplication8", "LaunchApplication9"]], ["browserControl", ["BrowserBack", "BrowserFavorites", "BrowserForward", "BrowserHome", "BrowserRefresh", "BrowserSearch", "BrowserStop"]], ["numericKeypad", ["Clear"]]]))
  , keyTypes = new Map;
for (let e of keyGroups)
    for (let t of e[1])
        keyTypes.set(t, e[0]);
Object.freeze(keyTypes);
let isFnDown = !1;
function normalizeKeyValue(e) {
    return "OS" !== e.key || "OSLeft" !== e.code && "OSRight" !== e.code ? "Scroll" === e.key ? "ScrollLock" : "Win" === e.key ? "Meta" : "Spacebar" === e.key ? " " : "\n" === e.key ? "Enter" : "Down" === e.key ? "ArrowDown" : "Left" === e.key ? "ArrowLeft" : "Right" === e.key ? "ArrowRight" : "Up" === e.key ? "ArrowUp" : "Del" === e.key ? "Delete" : "Delete" === e.key && isApple && isFnDown ? "Backspace" : "Crsel" === e.key ? "CrSel" : "Exsel" === e.key ? "ExSel" : "Esc" === e.key ? "Escape" : "Apps" === e.key ? "ContextMenu" : "Multi" === e.key ? "Compose" : "Nonconvert" === e.key ? "NonConvert" : "RomanCharacters" === e.key ? "Eisu" : "HalfWidth" === e.key ? "Hankaku" : "FullWidth" === e.key ? "Zenkaku" : "Exit" === e.key || "MozHomeScreen" === e.key ? "GoHome" : "MediaNextTrack" === e.key ? "MediaTrackNext" : "MediaPreviousTrack" === e.key ? "MediaTrackPrevious" : "FastFwd" === e.key ? "MedaiFastFwd" : "VolumeDown" === e.key ? "AudioVolumeDown" : "VolumeMute" === e.key ? "AudioVolumeMute" : "VolumeUp" === e.key ? "AudioVolumeUp" : "Live" === e.key ? "TV" : "Zoom" === e.key ? "ZoomToggle" : "SelectMedia" === e.key || "MediaSelect" === e.key ? "LaunchMediaPlayer" : "Add" === e.key ? "+" : "Divide" === e.key ? "/" : "Decimal" === e.key ? "." : "Key11" === e.key ? "11" : "Key12" === e.key ? "12" : "Multiply" === e.key ? "*" : "Subtract" === e.key ? "-" : "Separator" === e.key ? "," : e.key : "Meta"
}
isApple && (window.addEventListener("keydown", e=>{
    "Fn" === e.key && (isFnDown = !0)
}
),
window.addEventListener("keyup", e=>{
    "Fn" === e.key && (isFnDown = !1)
}
));
const gesture = Object.seal({
    type: "",
    text: "",
    command: ""
});
class OperatingSystem {
    constructor(e, t, n, i, r, o, s, a, l, h) {
        this.name = e;
        const u = r;
        0 === r.length && (r = "Normal");
        const c = Object.freeze(new Map([["Normal_ArrowDown", "CursorDown"], ["Normal_ArrowLeft", "CursorLeft"], ["Normal_ArrowRight", "CursorRight"], ["Normal_ArrowUp", "CursorUp"], ["Normal_PageDown", "CursorPageDown"], ["Normal_PageUp", "CursorPageUp"], [n + "_ArrowLeft", "CursorSkipLeft"], [n + "_ArrowRight", "CursorSkipRight"], [`${r}_${o}`, "CursorHome"], [`${r}_${s}`, "CursorEnd"], [`${a}_${l}`, "CursorFullHome"], [`${a}_${h}`, "CursorFullEnd"], ["Shift_ArrowDown", "SelectDown"], ["Shift_ArrowLeft", "SelectLeft"], ["Shift_ArrowRight", "SelectRight"], ["Shift_ArrowUp", "SelectUp"], ["Shift_PageDown", "SelectPageDown"], ["Shift_PageUp", "SelectPageUp"], [n + "Shift_ArrowLeft", "SelectSkipLeft"], [n + "Shift_ArrowRight", "SelectSkipRight"], [`${u}Shift_${o}`, "SelectHome"], [`${u}Shift_${s}`, "SelectEnd"], [`${a}Shift_${l}`, "SelectFullHome"], [`${a}Shift_${h}`, "SelectFullEnd"], [t + "_a", "SelectAll"], [t + "_ArrowDown", "ScrollDown"], [t + "_ArrowUp", "ScrollUp"], ["Normal_Backspace", "DeleteLetterLeft"], ["Normal_Delete", "DeleteLetterRight"], [n + "_Backspace", "DeleteWordLeft"], [n + "_Delete", "DeleteWordRight"], ["Shift_Delete", "DeleteLine"], ["Normal_Enter", "AppendNewline"], [n + "_Enter", "PrependNewline"], ["Normal_Tab", "InsertTab"], ["Shift_Tab", "RemoveTab"], [t + "_z", "Undo"], [i, "Redo"]]));
        this.makeCommand = e=>(gesture.text = normalizeKeyValue(e),
        gesture.type = keyTypes.has(gesture.text) ? keyTypes.get(gesture.text) : "printable",
        gesture.command = "",
        (e.ctrlKey || e.altKey || e.metaKey) && ("printable" !== gesture.type && "whitespace" !== gesture.type || (gesture.type = "special"),
        e.ctrlKey && (gesture.command += "Control"),
        e.altKey && (gesture.command += "Alt"),
        e.metaKey && (gesture.command += "Meta")),
        e.shiftKey && (gesture.command += "Shift"),
        "" === gesture.command && (gesture.command += "Normal"),
        gesture.command += "_" + gesture.text,
        c.has(gesture.command) && (gesture.command = c.get(gesture.command)),
        "PrependNewline" === gesture.command && (gesture.type = "whitespace"),
        gesture),
        Object.freeze(this)
    }
}
const Windows = new OperatingSystem("Windows","Control","Control","Control_y","","Home","End","Control","Home","End")
  , MacOS = new OperatingSystem("macOS","Meta","Alt","MetaShift_z","Meta","ArrowLeft","ArrowRight","Meta","ArrowUp","ArrowDown");
class Point {
    constructor(e, t) {
        this.set(e || 0, t || 0),
        Object.seal(this)
    }
    set(e, t) {
        this.x = e,
        this.y = t
    }
    copy(e) {
        e && (this.x = e.x,
        this.y = e.y)
    }
    toCell(e, t, n) {
        this.x = Math.round(this.x / e.width) + t.x - n.x,
        this.y = Math.floor(this.y / e.height - .25) + t.y
    }
    inBounds(e) {
        return e.left <= this.x && this.x < e.right && e.top <= this.y && this.y < e.bottom
    }
    clone() {
        return new Point(this.x,this.y)
    }
    toString() {
        return `(x:${this.x}, y:${this.y})`
    }
}
class Size {
    constructor(e, t) {
        this.width = e || 0,
        this.height = t || 0,
        Object.seal(this)
    }
    set(e, t) {
        this.width = e,
        this.height = t
    }
    copy(e) {
        e && (this.width = e.width,
        this.height = e.height)
    }
    clone() {
        return new Size(this.width,this.height)
    }
    toString() {
        return `<w:${this.width}, h:${this.height}>`
    }
}
class Rectangle {
    constructor(e, t, n, i) {
        this.point = new Point(e,t),
        this.size = new Size(n,i),
        Object.freeze(this)
    }
    get x() {
        return this.point.x
    }
    set x(e) {
        this.point.x = e
    }
    get left() {
        return this.point.x
    }
    set left(e) {
        this.point.x = e
    }
    get width() {
        return this.size.width
    }
    set width(e) {
        this.size.width = e
    }
    get right() {
        return this.point.x + this.size.width
    }
    set right(e) {
        this.point.x = e - this.size.width
    }
    get y() {
        return this.point.y
    }
    set y(e) {
        this.point.y = e
    }
    get top() {
        return this.point.y
    }
    set top(e) {
        this.point.y = e
    }
    get height() {
        return this.size.height
    }
    set height(e) {
        this.size.height = e
    }
    get bottom() {
        return this.point.y + this.size.height
    }
    set bottom(e) {
        this.point.y = e - this.size.height
    }
    get area() {
        return this.width * this.height
    }
    set(e, t, n, i) {
        this.point.set(e, t),
        this.size.set(n, i)
    }
    copy(e) {
        e && (this.point.copy(e.point),
        this.size.copy(e.size))
    }
    clone() {
        return new Rectangle(this.point.x,this.point.y,this.size.width,this.size.height)
    }
    overlap(e) {
        const t = Math.max(this.left, e.left)
          , n = Math.max(this.top, e.top)
          , i = Math.min(this.right, e.right)
          , r = Math.min(this.bottom, e.bottom);
        if (i > t && r > n)
            return new Rectangle(t,n,i - t,r - n)
    }
    toString() {
        return `[${this.point.toString()} x ${this.size.toString()}]`
    }
}
class Row {
    constructor(e, t, n, i, r) {
        this.text = e,
        this.startStringIndex = n,
        this.tokens = t,
        this.startTokenIndex = i,
        this.lineNumber = r;
        const o = Object.freeze([...e])
          , s = new Array(e.length)
          , a = new Array(e.length);
        let l = 0;
        for (let e of o) {
            s[l] = 0,
            a[l] = 0;
            for (let t = 1; t < e.length; ++t)
                s[l + t] = -t,
                a[l + t] = e.length - t;
            l += e.length
        }
        this.adjust = (t,n)=>{
            const i = -1 === n ? s : a;
            if (t.x < i.length) {
                const e = i[t.x];
                t.x += e,
                t.i += e
            } else
                1 === n && "\n" === e[e.length - 1] && this.adjust(t, -1)
        }
        ,
        this.toString = ()=>e,
        this.substring = (t,n)=>e.substring(t, n),
        Object.seal(this)
    }
    get stringLength() {
        return this.text.length
    }
    get endStringIndex() {
        return this.startStringIndex + this.stringLength
    }
    get numTokens() {
        return this.tokens.length
    }
    get endTokenIndex() {
        return this.startTokenIndex + this.numTokens
    }
}
Row.emptyRow = (e,t,n)=>new Row("",[],e,t,n);
class TimedEvent extends EventBase {
    constructor(e, t=!1) {
        super();
        const n = new Event("tick");
        let i = null;
        this.cancel = ()=>{
            const e = this.isRunning;
            return e && (t ? clearInterval(i) : clearTimeout(i),
            i = null),
            e
        }
        ;
        const r = ()=>{
            t || this.cancel(),
            this.dispatchEvent(n)
        }
        ;
        this.start = ()=>{
            this.cancel(),
            i = t ? setTimeout(r, e) : setInterval(r, e)
        }
        ,
        Object.defineProperties(this, {
            isRunning: {
                get: ()=>null !== i
            }
        }),
        Object.freeze(this)
    }
}
let elementCounter = 0
  , focusedControl = null
  , hoveredControl = null
  , publicControls = [];
const wheelScrollSpeed = 4
  , vScrollWidth = 2
  , scrollScale = isFirefox ? 3 : 100
  , optionDefaults = Object.freeze({
    readOnly: !1,
    multiLine: !0,
    wordWrap: !0,
    scrollBars: !0,
    lineNumbers: !0,
    padding: 0,
    fontSize: 16,
    language: "JavaScript",
    scaleFactor: devicePixelRatio
})
  , controls = []
  , elements = new WeakMap
  , ready = ("complete" === document.readyState ? Promise.resolve("already") : new Promise(e=>{
    document.addEventListener("readystatechange", t=>{
        "complete" === document.readyState && e("had to wait for it")
    }
    , !1)
}
)).then(()=>{
    for (let e of document.getElementsByTagName("primrose"))
        new Primrose({
            element: e
        })
}
);
class Primrose extends EventBase {
    constructor(e) {
        super();
        const t = (e,t,n)=>i=>{
            n && console.log("Primrose #" + ye, e, i),
            t && t(i)
        }
        ;
        if (void 0 === (e = e || {}).element && (e.element = null),
        null !== e.element && !(e.element instanceof HTMLElement))
            throw new Error("element must be null, an instance of HTMLElement, an instance of HTMLCanvaseElement, or an instance of OffscreenCanvas");
        e = Object.assign({}, optionDefaults, e);
        let n = ()=>{}
        ;
        const i = (e,t,n,i,r,o)=>{
            e.fillStyle = t,
            e.fillRect(n * ze.width, i * ze.height, r * ze.width + 1, o * ze.height + 1)
        }
          , r = ()=>{
            var e, t, n, r, o, s;
            st.clearRect(0, 0, q.width, q.height),
            st.save(),
            st.scale(te, te),
            st.translate(K, K),
            we && (i(st, Y.selectedBackColor || Dark.selectedBackColor, 0, 0, je.x, this.width - 2 * K),
            e = st,
            t = Y.regular.foreColor || Dark.regular.foreColor,
            n = 0,
            r = 0,
            o = je.x,
            s = this.height - 2 * K,
            e.strokeStyle = t,
            e.strokeRect(n * ze.width, r * ze.height, o * ze.width + 1, s * ze.height + 1));
            let a = 2;
            st.save();
            {
                st.translate((de - .5) * ze.width, -Ie.y * ze.height);
                let e = -1;
                const t = 0 | Ie.y
                  , n = t + je.height;
                He.setXY(Fe, 0, t),
                Ve.copy(He);
                for (let i = t; i <= n && i < Fe.length; ++i) {
                    const t = Fe[i];
                    a = Math.max(a, t.stringLength),
                    we && t.lineNumber > e && (e = t.lineNumber,
                    st.font = "bold " + et.font,
                    st.fillStyle = Y.regular.foreColor,
                    st.fillText(t.lineNumber, 0, i * ze.height))
                }
            }
            if (st.restore(),
            fe) {
                if (st.fillStyle = Y.selectedBackColor || Dark.selectedBackColor,
                !se && a > je.width) {
                    const e = je.width * ze.width - K
                      , t = Ie.x * e / a + je.x * ze.width
                      , n = e * (je.width / a)
                      , i = this.height - ze.height - K
                      , r = Math.max(ze.width, n);
                    st.fillRect(t, i, r, ze.height),
                    st.strokeRect(t, i, r, ze.height)
                }
                if (Fe.length > je.height) {
                    const e = je.height * ze.height
                      , t = Ie.y * e / Fe.length
                      , n = e * (je.height / Fe.length)
                      , i = this.width - vScrollWidth * ze.width - 2 * K
                      , r = vScrollWidth * ze.width
                      , o = Math.max(ze.height, n);
                    st.fillRect(i, t, r, o),
                    st.strokeRect(i, t, r, o)
                }
            }
            st.restore(),
            Q || (st.fillStyle = Y.unfocused || Dark.unfocused,
            st.fillRect(0, 0, q.width, q.height))
        }
          , o = ()=>{
            if (Y) {
                const e = Re !== G
                  , t = Q !== Te
                  , n = et.font !== Ae
                  , o = K !== Ee
                  , s = Y.name !== Le
                  , a = je.toString() !== ke
                  , l = ze.width !== Se
                  , h = ze.height !== be
                  , u = We.i !== xe || _e.i !== Me
                  , c = Ie.x !== De || Ie.y !== Ne
                  , d = J || a || e || l || h || o || c || s
                  , g = d || n
                  , p = d || t;
                (d || u) && (()=>{
                    const e = Cursor.min(We, _e)
                      , t = Cursor.max(We, _e);
                    rt.clearRect(0, 0, q.width, q.height),
                    Y.regular.backColor && (rt.fillStyle = Y.regular.backColor,
                    rt.fillRect(0, 0, q.width, q.height)),
                    rt.save(),
                    rt.scale(te, te),
                    rt.translate((je.x - Ie.x) * ze.width + K, -Ie.y * ze.height + K),
                    Q && i(rt, Y.currentRowBackColor || Dark.currentRowBackColor, 0, e.y, je.width, t.y - e.y + 1);
                    const n = 0 | Ie.y
                      , r = n + je.height
                      , o = 0 | Ie.x
                      , s = o + je.width;
                    He.setXY(Fe, 0, n),
                    Ve.copy(He);
                    for (let a = n; a <= r && a < Fe.length; ++a) {
                        const n = Fe[a].tokens;
                        for (let r = 0; r < n.length; ++r) {
                            const a = n[r];
                            if (Ve.x += a.length,
                            Ve.i += a.length,
                            o <= Ve.x && He.x <= s) {
                                if (e.i <= Ve.i && He.i < t.i) {
                                    const n = Cursor.max(e, He)
                                      , r = Cursor.min(t, Ve).i - n.i;
                                    i(rt, Y.selectedBackColor || Dark.selectedBackColor, n.x, n.y, r, 1)
                                }
                            }
                            He.copy(Ve)
                        }
                        He.x = 0,
                        ++He.y,
                        Ve.copy(He)
                    }
                    if (Q) {
                        const n = Y.cursorColor || Dark.cursorColor
                          , r = 1 / ze.width;
                        i(rt, n, e.x, e.y, r, 1),
                        i(rt, n, t.x, t.y, r, 1)
                    }
                    rt.restore()
                }
                )(),
                g && (()=>{
                    nt.clearRect(0, 0, q.width, q.height),
                    nt.save(),
                    nt.scale(te, te),
                    nt.translate((je.x - Ie.x) * ze.width + K, K);
                    const e = 0 | Ie.y
                      , t = e + je.height
                      , n = 0 | Ie.x
                      , i = n + je.width;
                    He.setXY(Fe, 0, e),
                    Ve.copy(He);
                    for (let r = e; r <= t && r < Fe.length; ++r) {
                        const e = Fe[r].tokens
                          , t = (r - Ie.y) * ze.height;
                        for (let r = 0; r < e.length; ++r) {
                            const o = e[r];
                            if (Ve.x += o.length,
                            Ve.i += o.length,
                            n <= Ve.x && He.x <= i) {
                                const e = Y[o.type] || {}
                                  , n = `${e.fontWeight || Y.regular.fontWeight || Dark.regular.fontWeight || ""} ${e.fontStyle || Y.regular.fontStyle || Dark.regular.fontStyle || ""} ${et.font}`;
                                nt.font = n.trim(),
                                nt.fillStyle = e.foreColor || Y.regular.foreColor,
                                nt.fillText(o.value, He.x * ze.width, t)
                            }
                            He.copy(Ve)
                        }
                        He.x = 0,
                        ++He.y,
                        Ve.copy(He)
                    }
                    nt.restore()
                }
                )(),
                p && r(),
                et.clearRect(0, 0, q.width, q.height),
                et.save(),
                et.translate(B, z),
                et.drawImage(it, 0, 0),
                et.drawImage(tt, 0, 0),
                et.drawImage(ot, 0, 0),
                et.restore(),
                ke = je.toString(),
                Re = G,
                Se = ze.width,
                be = ze.height,
                Ee = K,
                xe = We.i,
                Me = _e.i,
                Te = Q,
                Ae = et.font,
                Le = Y.name,
                De = Ie.x,
                Ne = Ie.y,
                J = !1,
                this.dispatchEvent(qe)
            }
        }
          , s = ()=>{
            const e = ve;
            ve = re && he ? multiLineOutput : re && !he ? singleLineOutput : !re && he ? multiLineInput : singleLineInput,
            ve !== e && u()
        }
          , a = ()=>{
            fe ? se ? Ue.set(vScrollWidth, 0) : Ue.set(vScrollWidth, 1) : Ue.set(0, 0)
        }
          , l = (e,t)=>{
            (e = (e = e || "").replace(/\r\n/g, "\n")) !== G && (G = e,
            t && f(),
            u(),
            this.dispatchEvent(Xe))
        }
          , h = e=>{
            if (e = (e = e || "").replace(/\r\n/g, "\n"),
            We.i !== _e.i || e.length > 0) {
                const t = Cursor.min(We, _e)
                  , n = Cursor.max(We, _e)
                  , i = Fe[t.y]
                  , r = Fe[n.y]
                  , o = G.substring(0, i.startStringIndex)
                  , s = G.substring(r.endStringIndex)
                  , a = t.i - i.startStringIndex
                  , l = i.substring(0, a)
                  , h = n.i - r.startStringIndex
                  , u = l + e + r.substring(h);
                G = o + u + s,
                f(),
                c(t.y, n.y, u),
                We.setI(Fe, t.i + e.length),
                _e.copy(We),
                m(We),
                this.dispatchEvent(Xe)
            }
        }
          , u = ()=>{
            c(0, Fe.length - 1, G)
        }
          , c = (e,t,i)=>{
            for (; e > 0 && Fe[e].lineNumber === Fe[e - 1].lineNumber; )
                --e,
                i = Fe[e].text + i;
            for (; t < Fe.length - 1 && Fe[t].lineNumber === Fe[t + 1].lineNumber; )
                ++t,
                i += Fe[t].text;
            const r = me.tokenize(i)
              , o = Fe[e]
              , s = o.startTokenIndex
              , a = o.lineNumber
              , l = o.startStringIndex
              , h = Fe[t].endTokenIndex - s
              , u = Pe.splice(s, h, ...r);
            if (de = 0,
            we) {
                for (let e of u)
                    "newlines" === e.type && --ce;
                for (let e of r)
                    "newlines" === e.type && ++ce;
                de = Math.max(1, Math.ceil(Math.log(ce) / Math.LN10)) + 1
            }
            const c = Math.floor(de + K / ze.width)
              , d = Math.floor(K / ze.height)
              , g = Math.floor((this.width - 2 * K) / ze.width) - c - Ue.width
              , p = Math.floor((this.height - 2 * K) / ze.height) - d - Ue.height;
            je.set(c, d, g, p);
            const m = r.map(e=>e.clone())
              , f = t - e + 1
              , w = [];
            let y = ""
              , v = []
              , C = l
              , b = s
              , S = a;
            for (let e = 0; e < m.length; ++e) {
                const t = m[e]
                  , n = je.width - y.length
                  , i = se && "newlines" !== t.type && t.length > n
                  , r = "newlines" === t.type || i;
                if (i) {
                    const i = t.length > je.width ? n : 0;
                    m.splice(e + 1, 0, t.splitAt(i))
                }
                v.push(t),
                y += t.value,
                (r || e === m.length - 1) && (w.push(new Row(y,v,C,b,S)),
                C += y.length,
                b += v.length,
                v = [],
                y = "",
                "newlines" === t.type && ++S)
            }
            Fe.splice(e, f, ...w);
            for (let t = e + w.length; t < Fe.length; ++t) {
                const e = Fe[t];
                e.lineNumber = S,
                e.startStringIndex = C,
                e.startTokenIndex += b,
                C += e.stringLength,
                b += e.numTokens,
                "newlines" === e.tokens[e.tokens.length - 1].type && ++S
            }
            if (0 === Fe.length)
                Fe.push(Row.emptyRow(0, 0, 0));
            else {
                const e = Fe[Fe.length - 1];
                e.text.endsWith("\n") && Fe.push(Row.emptyRow(e.endStringIndex, e.endTokenIndex, e.lineNumber + 1))
            }
            Ce = Math.max(0, Fe.length - je.height),
            n()
        }
          , d = ()=>{
            J = !0,
            setContextSize(nt, q.width, q.height),
            setContextSize(rt, q.width, q.height),
            setContextSize(st, q.width, q.height),
            u()
        }
          , g = (e,t,n)=>{
            const i = e - t
              , r = e - n + 5;
            let o = 0;
            return (i < 0 || r >= 0) && (o = Math.abs(i) < Math.abs(r) ? i : r),
            o
        }
          , p = ()=>{
            const e = Ie.y < 0 || 0 === Ce
              , t = Ie.y > Ce;
            return e ? Ie.y = 0 : t && (Ie.y = Ce),
            n(),
            e || t
        }
          , m = e=>{
            const t = g(e.x, Ie.x, Ie.x + je.width)
              , n = g(e.y, Ie.y, Ie.y + je.height);
            this.scrollBy(t, n)
        }
          , f = ()=>{
            ae < Oe.length - 1 && Oe.splice(ae + 1),
            Oe.push({
                value: G,
                frontCursor: We.i,
                backCursor: _e.i
            }),
            ae = Oe.length - 1
        }
          , w = e=>{
            const t = ae + e;
            if (0 <= t && t < Oe.length) {
                const e = Oe[ae];
                ae = t;
                const n = Oe[ae];
                l(n.value, !1),
                We.setI(Fe, e.frontCursor),
                _e.setI(Fe, e.backCursor)
            }
        }
        ;
        this.blur = ()=>{
            Q && (Q = !1,
            this.dispatchEvent(Ke),
            n())
        }
        ,
        this.focus = ()=>{
            Q || (Q = !0,
            this.dispatchEvent(Ye),
            n())
        }
        ,
        this.resize = ()=>{
            this.isInDocument ? resizeContext(et, te) && d() : console.warn("Can't automatically resize a canvas that is not in the DOM tree")
        }
        ,
        this.setSize = (e,t)=>{
            setContextSize(et, e, t, te) && d()
        }
        ,
        this.scrollTo = (e,t)=>(se || (Ie.x = e),
        Ie.y = t,
        p()),
        this.scrollBy = (e,t)=>this.scrollTo(Ie.x + e, Ie.y + t);
        const y = Object.freeze(new Map([["CursorUp", ()=>{
            const e = Cursor.min(We, _e)
              , t = Cursor.max(We, _e);
            e.up(Fe),
            t.copy(e),
            m(We)
        }
        ], ["CursorDown", ()=>{
            const e = Cursor.min(We, _e)
              , t = Cursor.max(We, _e);
            t.down(Fe),
            e.copy(t),
            m(We)
        }
        ], ["CursorLeft", ()=>{
            const e = Cursor.min(We, _e)
              , t = Cursor.max(We, _e);
            e.i === t.i && e.left(Fe),
            t.copy(e),
            m(We)
        }
        ], ["CursorRight", ()=>{
            const e = Cursor.min(We, _e)
              , t = Cursor.max(We, _e);
            e.i === t.i && t.right(Fe),
            e.copy(t),
            m(We)
        }
        ], ["CursorPageUp", ()=>{
            const e = Cursor.min(We, _e)
              , t = Cursor.max(We, _e);
            e.incY(Fe, -je.height),
            t.copy(e),
            m(We)
        }
        ], ["CursorPageDown", ()=>{
            const e = Cursor.min(We, _e)
              , t = Cursor.max(We, _e);
            t.incY(Fe, je.height),
            e.copy(t),
            m(We)
        }
        ], ["CursorSkipLeft", ()=>{
            const e = Cursor.min(We, _e)
              , t = Cursor.max(We, _e);
            e.i === t.i && e.skipLeft(Fe),
            t.copy(e),
            m(We)
        }
        ], ["CursorSkipRight", ()=>{
            const e = Cursor.min(We, _e)
              , t = Cursor.max(We, _e);
            e.i === t.i && t.skipRight(Fe),
            e.copy(t),
            m(We)
        }
        ], ["CursorHome", ()=>{
            We.home(),
            _e.copy(We),
            m(We)
        }
        ], ["CursorEnd", ()=>{
            We.end(Fe),
            _e.copy(We),
            m(We)
        }
        ], ["CursorFullHome", ()=>{
            We.fullHome(Fe),
            _e.copy(We),
            m(We)
        }
        ], ["CursorFullEnd", ()=>{
            We.fullEnd(Fe),
            _e.copy(We),
            m(We)
        }
        ], ["SelectDown", ()=>{
            _e.down(Fe),
            m(We)
        }
        ], ["SelectLeft", ()=>{
            _e.left(Fe),
            m(_e)
        }
        ], ["SelectRight", ()=>{
            _e.right(Fe),
            m(_e)
        }
        ], ["SelectUp", ()=>{
            _e.up(Fe),
            m(_e)
        }
        ], ["SelectPageDown", ()=>{
            _e.incY(Fe, je.height),
            m(_e)
        }
        ], ["SelectPageUp", ()=>{
            _e.incY(Fe, -je.height),
            m(_e)
        }
        ], ["SelectSkipLeft", ()=>{
            _e.skipLeft(Fe),
            m(_e)
        }
        ], ["SelectSkipRight", ()=>{
            _e.skipRight(Fe),
            m(_e)
        }
        ], ["SelectHome", ()=>{
            _e.home(),
            m(_e)
        }
        ], ["SelectEnd", ()=>{
            _e.end(Fe),
            m(_e)
        }
        ], ["SelectFullHome", ()=>{
            _e.fullHome(Fe),
            m(_e)
        }
        ], ["SelectFullEnd", ()=>{
            _e.fullEnd(Fe),
            m(_e)
        }
        ], ["SelectAll", ()=>{
            We.fullHome(),
            _e.fullEnd(Fe),
            n()
        }
        ], ["ScrollDown", ()=>{
            Ie.y < Fe.length - je.height && this.scrollBy(0, 1)
        }
        ], ["ScrollUp", ()=>{
            Ie.y > 0 && this.scrollBy(0, -1)
        }
        ], ["DeleteLetterLeft", ()=>{
            We.i === _e.i && _e.left(Fe),
            h("")
        }
        ], ["DeleteLetterRight", ()=>{
            We.i === _e.i && _e.right(Fe),
            h("")
        }
        ], ["DeleteWordLeft", ()=>{
            We.i === _e.i && We.skipLeft(Fe),
            h("")
        }
        ], ["DeleteWordRight", ()=>{
            We.i === _e.i && _e.skipRight(Fe),
            h("")
        }
        ], ["DeleteLine", ()=>{
            We.i === _e.i && (We.home(),
            _e.end(Fe),
            _e.right(Fe)),
            h("")
        }
        ], ["Undo", ()=>{
            w(-1)
        }
        ], ["Redo", ()=>{
            w(1)
        }
        ], ["InsertTab", ()=>{
            ue = !0,
            h(ie)
        }
        ], ["RemoveTab", ()=>{
            const e = Fe[We.y]
              , t = Math.min(We.x, X);
            for (let t = 0; t < We.x; ++t)
                if (" " !== e.text[t])
                    return;
            _e.copy(We),
            _e.incX(Fe, -t),
            h("")
        }
        ]]));
        this.readKeyDownEvent = t("keydown", e=>{
            const t = Je.makeCommand(e);
            y.has(t.command) && (e.preventDefault(),
            y.get(t.command)(e))
        }
        );
        const v = Object.freeze(new Map([["AppendNewline", ()=>{
            if (he) {
                let e = "";
                const t = Fe[We.y].tokens;
                t.length > 0 && "whitespace" === t[0].type && (e = t[0].value),
                h("\n" + e)
            } else
                this.dispatchEvent(Xe)
        }
        ], ["PrependNewline", ()=>{
            if (he) {
                let e = "";
                const t = Fe[We.y].tokens;
                t.length > 0 && "whitespace" === t[0].type && (e = t[0].value),
                We.home(),
                _e.copy(We),
                h(e + "\n")
            } else
                this.dispatchEvent(Xe)
        }
        ], ["Undo", ()=>{
            w(-1)
        }
        ]]));
        this.readKeyPressEvent = t("keypress", e=>{
            const t = Je.makeCommand(e);
            this.readOnly || (e.preventDefault(),
            v.has(t.command) ? v.get(t.command)() : "printable" !== t.type && "whitespace" !== t.type || h(t.text),
            p(),
            n())
        }
        ),
        this.readKeyUpEvent = t("keyup");
        const C = e=>!(!Q || We.i === _e.i) && (e.clipboardData.setData("text/plain", this.selectedText),
        e.returnValue = !1,
        !0);
        this.readCopyEvent = t("copy", e=>{
            C(e)
        }
        ),
        this.readCutEvent = t("cut", e=>{
            C(e) && !this.readOnly && h("")
        }
        ),
        this.readPasteEvent = t("paste", e=>{
            if (Q && !this.readOnly) {
                e.returnValue = !1;
                const t = (e.clipboardData || window.clipboardData).getData(window.clipboardData ? "Text" : "text/plain");
                t && h(t)
            }
        }
        );
        const b = ()=>{
            Z = !0,
            this.dispatchEvent(Ge)
        }
          , S = ()=>{
            Z = !1,
            this.dispatchEvent($e)
        }
          , x = ()=>{
            this.focus(),
            ne = !0
        }
          , k = ()=>{
            oe = !0,
            L(We)
        }
          , M = ()=>{
            oe ? L(_e) : ne && D()
        }
          , L = e=>{
            Be.toCell(ze, Ie, je);
            const t = Be.x - Ie.x
              , i = Be.y - Ie.y
              , r = i >= je.height
              , o = t < 0
              , s = Be.x >= je.width;
            if (le || r || o || s) {
                if (le || s && !r) {
                    le = !0;
                    const e = Fe.length - je.height;
                    if (i >= 0 && e >= 0) {
                        const t = i * e / je.height;
                        this.scrollTo(Ie.x, t)
                    }
                } else if (r && !o) {
                    let e = 0;
                    for (let t = 0; t < Fe.length; ++t)
                        e = Math.max(e, Fe[t].stringLength);
                    const n = e - je.width;
                    if (t >= 0 && n >= 0) {
                        const e = t * n / je.width;
                        this.scrollTo(e, Ie.y)
                    }
                }
            } else
                e.setXY(Fe, Be.x, Be.y),
                _e.copy(e);
            n()
        }
        ;
        let E = null
          , T = null;
        const D = ()=>{
            if (null !== E && null !== T) {
                let e = (E - Be.x) / ze.width
                  , t = (T - Be.y) / ze.height;
                this.scrollBy(e, t)
            }
            E = Be.x,
            T = Be.y
        }
          , N = e=>t=>{
            e(t),
            x(),
            k()
        }
          , A = ()=>{
            ne = !1,
            oe = !1,
            le = !1
        }
          , R = e=>t=>{
            e(t),
            M()
        }
          , O = e=>t=>{
            e(t),
            j = Be.x,
            V = Be.y,
            x(),
            U.start()
        }
          , P = ()=>{
            U.cancel() && !oe && k(),
            A(),
            E = null,
            T = null
        }
          , F = e=>t=>{
            if (e(t),
            U.isRunning) {
                const e = Be.x - j
                  , t = Be.y - V;
                e * e + t * t > 25 && U.cancel()
            }
            U.isRunning || M()
        }
          , I = e=>{
            Be.set(e.offsetX, e.offsetY)
        }
        ;
        this.readMouseOverEvent = t("mouseover", b),
        this.readMouseOutEvent = t("mouseout", S),
        this.readMouseDownEvent = t("mousedown", N(I)),
        this.readMouseUpEvent = t("mouseup", A),
        this.readMouseMoveEvent = t("mousemove", R(I)),
        this.readWheelEvent = t("wheel", e=>{
            if (Z || Q) {
                if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)
                    e.ctrlKey || e.altKey || e.metaKey || (e.preventDefault(),
                    this.fontSize += -e.deltaY / scrollScale);
                else {
                    const t = Math.floor(e.deltaY * wheelScrollSpeed / scrollScale);
                    this.scrollBy(0, t) && !Q || e.preventDefault()
                }
                n()
            }
        }
        );
        let B = 0
          , z = 0;
        const U = new TimedEvent(1e3);
        U.addEventListener("tick", ()=>{
            k(),
            _e.copy(We),
            We.skipLeft(Fe),
            _e.skipRight(Fe),
            n(),
            navigator.vibrate(20)
        }
        );
        let j = 0
          , V = 0;
        const H = e=>{
            for (let t of e)
                return t;
            return null
        }
          , _ = e=>t=>{
            t.preventDefault(),
            e(H(t.touches) || H(t.changedTouches))
        }
          , W = e=>{
            const t = q.getBoundingClientRect();
            Be.set(e.clientX - t.left, e.clientY - t.top)
        }
        ;
        this.readTouchStartEvent = t("touchstart", _(O(W))),
        this.readTouchMoveEvent = t("touchmove", _(F(W))),
        this.readTouchEndEvent = t("touchend", _(P));
        const $ = e=>{
            Be.set(e.uv.x * this.width, (1 - e.uv.y) * this.height)
        }
        ;
        this.mouse = Object.freeze({
            readOverEventUV: t("mouseuvover", b),
            readOutEventUV: t("mouseuvout", S),
            readDownEventUV: t("mouseuvdown", N($)),
            readUpEventUV: t("mouseuvup", A),
            readMoveEventUV: t("mouseuvmove", R($))
        }),
        this.touch = Object.freeze({
            readOverEventUV: t("touchuvover", b),
            readOutEventUV: t("touchuvout", S),
            readDownEventUV: t("touchuvdown", O($)),
            readMoveEventUV: t("touchuvmove", F($)),
            readUpEventUV: t("touchuvup", P)
        }),
        Object.defineProperties(this, {
            element: {
                get: ()=>pe
            },
            isInDocument: {
                get: ()=>!ge && document.body.contains(q)
            },
            canvas: {
                get: ()=>q
            },
            hovered: {
                get: ()=>Z
            },
            focused: {
                get: ()=>Q,
                set: e=>{
                    e !== Q && (e ? this.focus() : this.blur())
                }
            },
            readOnly: {
                get: ()=>re,
                set: e=>{
                    (e = !!e) !== re && (re = e,
                    s())
                }
            },
            multiLine: {
                get: ()=>he,
                set: e=>{
                    (e = !!e) !== he && (!e && se && (this.wordWrap = !1),
                    he = e,
                    s(),
                    a())
                }
            },
            wordWrap: {
                get: ()=>se,
                set: e=>{
                    (e = !!e) === se || !he && e || (se = e,
                    a(),
                    n())
                }
            },
            value: {
                get: ()=>G,
                set: e=>l(e, !0)
            },
            text: {
                get: ()=>G,
                set: e=>l(e, !0)
            },
            selectedText: {
                get: ()=>{
                    const e = Cursor.min(We, _e)
                      , t = Cursor.max(We, _e);
                    return G.substring(e.i, t.i)
                }
                ,
                set: e=>{
                    h(e)
                }
            },
            selectionStart: {
                get: ()=>We.i,
                set: e=>{
                    (e |= 0) !== We.i && (We.setI(Fe, e),
                    n())
                }
            },
            selectionEnd: {
                get: ()=>_e.i,
                set: e=>{
                    (e |= 0) !== _e.i && (_e.setI(Fe, e),
                    n())
                }
            },
            selectionDirection: {
                get: ()=>We.i <= _e.i ? "forward" : "backward"
            },
            tabWidth: {
                get: ()=>X,
                set: e=>{
                    X = e || 2,
                    ie = "";
                    for (let e = 0; e < X; ++e)
                        ie += " "
                }
            },
            theme: {
                get: ()=>Y,
                set: e=>{
                    e !== Y && (Y = e,
                    n())
                }
            },
            language: {
                get: ()=>me,
                set: e=>{
                    e !== me && (me = e,
                    u())
                }
            },
            padding: {
                get: ()=>K,
                set: e=>{
                    (e |= 0) !== K && (K = e,
                    n())
                }
            },
            showLineNumbers: {
                get: ()=>we,
                set: e=>{
                    (e = e || !1) !== we && (we = e,
                    a())
                }
            },
            showScrollBars: {
                get: ()=>fe,
                set: e=>{
                    (e = e || !1) !== fe && (fe = e,
                    a())
                }
            },
            fontSize: {
                get: ()=>ee,
                set: e=>{
                    (e = Math.max(1, e || 0)) !== ee && (ee = e,
                    et.font = `${ee}px ${monospaceFamily}`,
                    ze.height = ee,
                    ze.width = et.measureText("MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM").width / 100,
                    u())
                }
            },
            scaleFactor: {
                get: ()=>te,
                set: e=>{
                    if ((e = Math.max(.25, Math.min(4, e || 0))) !== te) {
                        const t = this.width
                          , n = this.height;
                        te = e,
                        this.setSize(t, n)
                    }
                }
            },
            width: {
                get: ()=>q.width / te,
                set: e=>this.setSize(e, this.height)
            },
            height: {
                get: ()=>q.height / te,
                set: e=>this.setSize(this.width, e)
            }
        });
        let G = ""
          , K = 0
          , Y = Dark
          , X = 2
          , q = null
          , J = !1
          , Z = !1
          , Q = !1
          , ee = null
          , te = 2
          , ne = !1
          , ie = "  "
          , re = !1
          , oe = !1
          , se = !1
          , ae = -1
          , le = !1
          , he = !1
          , ue = !1
          , ce = 1
          , de = 0
          , ge = !1
          , pe = null
          , me = JavaScript
          , fe = !1
          , we = !1
          , ye = ++elementCounter
          , ve = singleLineOutput
          , Ce = 0
          , be = null
          , Se = null
          , xe = null
          , ke = null
          , Me = null
          , Le = null
          , Ee = null
          , Te = null
          , De = null
          , Ne = null
          , Ae = null
          , Re = null;
        const Oe = []
          , Pe = []
          , Fe = [Row.emptyRow(0, 0, 0)]
          , Ie = new Point
          , Be = new Point
          , ze = new Size
          , Ue = new Size
          , je = new Rectangle
          , Ve = new Cursor
          , He = new Cursor
          , _e = new Cursor
          , We = new Cursor
          , $e = new Event("out")
          , Ge = new Event("over")
          , Ke = new Event("blur")
          , Ye = new Event("focus")
          , Xe = new Event("change")
          , qe = new Event("update")
          , Je = isApple ? MacOS : Windows;
        let Ze = ""
          , Qe = -1;
        if (null !== e.element) {
            const t = e.element
              , n = t.width
              , i = t.height;
            Qe = t.tabIndex;
            const r = (t.dataset.options || "").trim().split(",")
              , o = {};
            for (let e of r)
                if (e = e.trim(),
                e.length > 0) {
                    const t = e.split("=");
                    if (t.length > 1) {
                        const e = t[0].trim()
                          , n = t[1].trim()
                          , i = n.toLocaleLowerCase();
                        o[e] = "true" === i || "false" === i ? "true" === i : n
                    }
                }
            Ze = t.textContent,
            e = Object.assign(e, {
                width: n,
                height: i
            }, o)
        }
        if (null === e.element ? (q = offscreenCanvas(e),
        ge = !(q instanceof HTMLCanvasElement)) : isCanvas(e.element) ? (pe = q = e.element,
        clear(q)) : (pe = e.element,
        clear(pe),
        q = canvas({
            style: {
                width: "100%",
                height: "100%"
            }
        }),
        pe.appendChild(q),
        pe.removeAttribute("tabindex"),
        assignAttributes(pe, {
            style: {
                display: "block",
                padding: "none",
                border: "2px inset #c0c0c0",
                overflow: "unset"
            }
        })),
        null !== q.parentElement && -1 === Qe) {
            const e = document.querySelectorAll("[tabindex]");
            for (let t of e)
                Qe = Math.max(Qe, t.tabIndex);
            ++Qe
        }
        q instanceof HTMLCanvasElement && this.isInDocument && (q.tabIndex = Qe,
        q.style.touchAction = "none",
        q.addEventListener("focus", ()=>this.focus()),
        q.addEventListener("blur", ()=>this.blur()),
        q.addEventListener("mouseover", this.readMouseOverEvent),
        q.addEventListener("mouseout", this.readMouseOutEvent),
        q.addEventListener("mousedown", this.readMouseDownEvent),
        q.addEventListener("mouseup", this.readMouseUpEvent),
        q.addEventListener("mousemove", this.readMouseMoveEvent),
        q.addEventListener("touchstart", this.readTouchStartEvent),
        q.addEventListener("touchend", this.readTouchEndEvent),
        q.addEventListener("touchmove", this.readTouchMoveEvent));
        const et = q.getContext("2d")
          , tt = offscreenCanvas()
          , nt = tt.getContext("2d")
          , it = offscreenCanvas()
          , rt = it.getContext("2d")
          , ot = offscreenCanvas()
          , st = ot.getContext("2d");
        et.imageSmoothingEnabled = nt.imageSmoothingEnabled = rt.imageSmoothingEnabled = st.imageSmoothingEnabled = !0,
        et.textBaseline = nt.textBaseline = rt.textBaseline = st.textBaseline = "top",
        st.textAlign = "right",
        nt.textAlign = "left",
        this.addEventListener("blur", ()=>{
            ue && (ue = !1,
            this.focus())
        }
        ),
        e.language = e.language.toLocaleLowerCase(),
        grammars.has(e.language) ? e.language = grammars.get(e.language) : e.language = null,
        Object.freeze(e),
        Object.seal(this),
        this.readOnly = e.readOnly,
        this.multiLine = e.multiLine,
        this.wordWrap = e.wordWrap,
        this.showScrollBars = e.scrollBars,
        this.showLineNumbers = e.lineNumbers,
        this.padding = e.padding,
        this.fontSize = e.fontSize,
        this.language = e.language,
        this.scaleFactor = e.scaleFactor,
        this.value = Ze,
        n = ()=>{
            requestAnimationFrame(o)
        }
        ,
        o(),
        Primrose.add(pe, this)
    }
}
Primrose.add = (e,t)=>{
    null !== e && elements.set(e, t),
    -1 === controls.indexOf(t) && (controls.push(t),
    publicControls = Object.freeze(controls.slice()),
    t.addEventListener("blur", ()=>{
        focusedControl = null
    }
    ),
    t.addEventListener("focus", ()=>{
        null === focusedControl || focusedControl.isInDocument && t.isInDocument || focusedControl.blur(),
        focusedControl = t
    }
    ),
    t.addEventListener("over", ()=>{
        hoveredControl = t
    }
    ),
    t.addEventListener("out", ()=>{
        hoveredControl = null
    }
    ))
}
,
Primrose.has = e=>elements.has(e),
Primrose.get = e=>elements.has(e) ? elements.get(e) : null,
Object.defineProperties(Primrose, {
    hoveredControl: {
        get: ()=>hoveredControl
    },
    focusedControl: {
        get: ()=>focusedControl
    },
    editors: {
        get: ()=>publicControls
    },
    ready: {
        get: ()=>ready
    }
}),
Object.freeze(Primrose),
requestAnimationFrame((function e() {
    requestAnimationFrame(e);
    for (let e = controls.length - 1; e >= 0; --e) {
        const t = controls[e];
        t.isInDocument && (elements.has(t.element) ? t.resize() : (controls.splice(e, 1),
        publicControls = Object.freeze(controls.slice())))
    }
}
));
const withCurrentControl = e=>{
    const t = e.toLocaleLowerCase()
      , n = `read${e}Event`;
    window.addEventListener(t, e=>{
        null !== focusedControl && focusedControl[n](e)
    }
    , {
        passive: !1
    })
}
;
withCurrentControl("KeyDown"),
withCurrentControl("KeyPress"),
withCurrentControl("KeyUp"),
withCurrentControl("Copy"),
withCurrentControl("Cut"),
withCurrentControl("Paste"),
window.addEventListener("wheel", e=>{
    const t = focusedControl || hoveredControl;
    null !== t && t.readWheelEvent(e)
}
, {
    passive: !1
});
export {Basic, Dark, Grammar, HTML, JavaScript, Light, PlainText, Primrose, grammars, themes};
