(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * This file automatically generated from `build.js`.
 * Do not manually edit.
 */

module.exports = [
  "address",
  "article",
  "aside",
  "audio",
  "blockquote",
  "canvas",
  "dd",
  "div",
  "dl",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "main",
  "nav",
  "noscript",
  "ol",
  "output",
  "p",
  "pre",
  "section",
  "table",
  "tfoot",
  "ul",
  "video"
];

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
'use strict';

var voidElements = require('void-elements');
Object.keys(voidElements).forEach(function (name) {
  voidElements[name.toUpperCase()] = 1;
});

var blockElements = {};
require('block-elements').forEach(function (name) {
  blockElements[name.toUpperCase()] = 1;
});

/**
 * isBlockElem(node) determines if the given node is a block element.
 *
 * @param {Node} node
 * @return {Boolean}
 */
function isBlockElem(node) {
  return !!(node && blockElements[node.nodeName]);
}

/**
 * isVoid(node) determines if the given node is a void element.
 *
 * @param {Node} node
 * @return {Boolean}
 */
function isVoid(node) {
  return !!(node && voidElements[node.nodeName]);
}

/**
 * whitespace(elem [, isBlock]) removes extraneous whitespace from an
 * the given element. The function isBlock may optionally be passed in
 * to determine whether or not an element is a block element; if none
 * is provided, defaults to using the list of block elements provided
 * by the `block-elements` module.
 *
 * @param {Node} elem
 * @param {Function} blockTest
 */
function collapseWhitespace(elem, isBlock) {
  if (!elem.firstChild || elem.nodeName === 'PRE') return;

  if (typeof isBlock !== 'function') {
    isBlock = isBlockElem;
  }

  var prevText = null;
  var prevVoid = false;

  var prev = null;
  var node = next(prev, elem);

  while (node !== elem) {
    if (node.nodeType === 3) {
      // Node.TEXT_NODE
      var text = node.data.replace(/[ \r\n\t]+/g, ' ');

      if ((!prevText || / $/.test(prevText.data)) && !prevVoid && text[0] === ' ') {
        text = text.substr(1);
      }

      // `text` might be empty at this point.
      if (!text) {
        node = remove(node);
        continue;
      }

      node.data = text;
      prevText = node;
    } else if (node.nodeType === 1) {
      // Node.ELEMENT_NODE
      if (isBlock(node) || node.nodeName === 'BR') {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, '');
        }

        prevText = null;
        prevVoid = false;
      } else if (isVoid(node)) {
        // Avoid trimming space around non-block, non-BR void elements.
        prevText = null;
        prevVoid = true;
      }
    } else {
      node = remove(node);
      continue;
    }

    var nextNode = next(prev, node);
    prev = node;
    node = nextNode;
  }

  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, '');
    if (!prevText.data) {
      remove(prevText);
    }
  }
}

/**
 * remove(node) removes the given node from the DOM and returns the
 * next node in the sequence.
 *
 * @param {Node} node
 * @return {Node} node
 */
function remove(node) {
  var next = node.nextSibling || node.parentNode;

  node.parentNode.removeChild(node);

  return next;
}

/**
 * next(prev, current) returns the next node in the sequence, given the
 * current and previous nodes.
 *
 * @param {Node} prev
 * @param {Node} current
 * @return {Node}
 */
function next(prev, current) {
  if (prev && prev.parentNode === current || current.nodeName === 'PRE') {
    return current.nextSibling || current.parentNode;
  }

  return current.firstChild || current.nextSibling || current.parentNode;
}

module.exports = collapseWhitespace;

},{"block-elements":1,"void-elements":26}],4:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],5:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities 
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
(function (process,global){
// Copyright (c) Microsoft, All rights reserved. See License.txt in the project root for license information.

;(function (undefined) {

  var objectTypes = {
    'function': true,
    'object': true
  };

  function checkGlobal(value) {
    return (value && value.Object === Object) ? value : null;
  }

  var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType) ? exports : null;
  var freeModule = (objectTypes[typeof module] && module && !module.nodeType) ? module : null;
  var freeGlobal = checkGlobal(freeExports && freeModule && typeof global === 'object' && global);
  var freeSelf = checkGlobal(objectTypes[typeof self] && self);
  var freeWindow = checkGlobal(objectTypes[typeof window] && window);
  var moduleExports = (freeModule && freeModule.exports === freeExports) ? freeExports : null;
  var thisGlobal = checkGlobal(objectTypes[typeof this] && this);
  var root = freeGlobal || ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) || freeSelf || thisGlobal || Function('return this')();

  var Rx = {
    internals: {},
    config: {
      Promise: root.Promise
    },
    helpers: { }
  };

  // Defaults
  var noop = Rx.helpers.noop = function () { },
    identity = Rx.helpers.identity = function (x) { return x; },
    defaultNow = Rx.helpers.defaultNow = Date.now,
    defaultComparer = Rx.helpers.defaultComparer = function (x, y) { return isEqual(x, y); },
    defaultSubComparer = Rx.helpers.defaultSubComparer = function (x, y) { return x > y ? 1 : (x < y ? -1 : 0); },
    defaultKeySerializer = Rx.helpers.defaultKeySerializer = function (x) { return x.toString(); },
    defaultError = Rx.helpers.defaultError = function (err) { throw err; },
    isPromise = Rx.helpers.isPromise = function (p) { return !!p && typeof p.subscribe !== 'function' && typeof p.then === 'function'; },
    isFunction = Rx.helpers.isFunction = (function () {

      var isFn = function (value) {
        return typeof value == 'function' || false;
      };

      // fallback for older versions of Chrome and Safari
      if (isFn(/x/)) {
        isFn = function(value) {
          return typeof value == 'function' && toString.call(value) == '[object Function]';
        };
      }

      return isFn;
    }());

  function cloneArray(arr) { for(var a = [], i = 0, len = arr.length; i < len; i++) { a.push(arr[i]); } return a;}

  var errorObj = {e: {}};
  
  function tryCatcherGen(tryCatchTarget) {
    return function tryCatcher() {
      try {
        return tryCatchTarget.apply(this, arguments);
      } catch (e) {
        errorObj.e = e;
        return errorObj;
      }
    };
  }

  var tryCatch = Rx.internals.tryCatch = function tryCatch(fn) {
    if (!isFunction(fn)) { throw new TypeError('fn must be a function'); }
    return tryCatcherGen(fn);
  };

  function thrower(e) {
    throw e;
  }

  Rx.config.longStackSupport = false;
  var hasStacks = false, stacks = tryCatch(function () { throw new Error(); })();
  hasStacks = !!stacks.e && !!stacks.e.stack;

  // All code after this point will be filtered from stack traces reported by RxJS
  var rStartingLine = captureLine(), rFileName;

  var STACK_JUMP_SEPARATOR = 'From previous event:';

  function makeStackTraceLong(error, observable) {
    // If possible, transform the error stack trace by removing Node and RxJS
    // cruft, then concatenating with the stack trace of `observable`.
    if (hasStacks &&
        observable.stack &&
        typeof error === 'object' &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
      var stacks = [];
      for (var o = observable; !!o; o = o.source) {
        if (o.stack) {
          stacks.unshift(o.stack);
        }
      }
      stacks.unshift(error.stack);

      var concatedStacks = stacks.join('\n' + STACK_JUMP_SEPARATOR + '\n');
      error.stack = filterStackString(concatedStacks);
    }
  }

  function filterStackString(stackString) {
    var lines = stackString.split('\n'), desiredLines = [];
    for (var i = 0, len = lines.length; i < len; i++) {
      var line = lines[i];

      if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
        desiredLines.push(line);
      }
    }
    return desiredLines.join('\n');
  }

  function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
    if (!fileNameAndLineNumber) {
      return false;
    }
    var fileName = fileNameAndLineNumber[0], lineNumber = fileNameAndLineNumber[1];

    return fileName === rFileName &&
      lineNumber >= rStartingLine &&
      lineNumber <= rEndingLine;
  }

  function isNodeFrame(stackLine) {
    return stackLine.indexOf('(module.js:') !== -1 ||
      stackLine.indexOf('(node.js:') !== -1;
  }

  function captureLine() {
    if (!hasStacks) { return; }

    try {
      throw new Error();
    } catch (e) {
      var lines = e.stack.split('\n');
      var firstLine = lines[0].indexOf('@') > 0 ? lines[1] : lines[2];
      var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
      if (!fileNameAndLineNumber) { return; }

      rFileName = fileNameAndLineNumber[0];
      return fileNameAndLineNumber[1];
    }
  }

  function getFileNameAndLineNumber(stackLine) {
    // Named functions: 'at functionName (filename:lineNumber:columnNumber)'
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) { return [attempt1[1], Number(attempt1[2])]; }

    // Anonymous functions: 'at filename:lineNumber:columnNumber'
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) { return [attempt2[1], Number(attempt2[2])]; }

    // Firefox style: 'function@filename:lineNumber or @filename:lineNumber'
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) { return [attempt3[1], Number(attempt3[2])]; }
  }

  var EmptyError = Rx.EmptyError = function() {
    this.message = 'Sequence contains no elements.';
    Error.call(this);
  };
  EmptyError.prototype = Object.create(Error.prototype);
  EmptyError.prototype.name = 'EmptyError';

  var ObjectDisposedError = Rx.ObjectDisposedError = function() {
    this.message = 'Object has been disposed';
    Error.call(this);
  };
  ObjectDisposedError.prototype = Object.create(Error.prototype);
  ObjectDisposedError.prototype.name = 'ObjectDisposedError';

  var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function () {
    this.message = 'Argument out of range';
    Error.call(this);
  };
  ArgumentOutOfRangeError.prototype = Object.create(Error.prototype);
  ArgumentOutOfRangeError.prototype.name = 'ArgumentOutOfRangeError';

  var NotSupportedError = Rx.NotSupportedError = function (message) {
    this.message = message || 'This operation is not supported';
    Error.call(this);
  };
  NotSupportedError.prototype = Object.create(Error.prototype);
  NotSupportedError.prototype.name = 'NotSupportedError';

  var NotImplementedError = Rx.NotImplementedError = function (message) {
    this.message = message || 'This operation is not implemented';
    Error.call(this);
  };
  NotImplementedError.prototype = Object.create(Error.prototype);
  NotImplementedError.prototype.name = 'NotImplementedError';

  var notImplemented = Rx.helpers.notImplemented = function () {
    throw new NotImplementedError();
  };

  var notSupported = Rx.helpers.notSupported = function () {
    throw new NotSupportedError();
  };

  // Shim in iterator support
  var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) ||
    '_es6shim_iterator_';
  // Bug for mozilla version
  if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
  }

  var doneEnumerator = Rx.doneEnumerator = { done: true, value: undefined };

  var isIterable = Rx.helpers.isIterable = function (o) {
    return o && o[$iterator$] !== undefined;
  };

  var isArrayLike = Rx.helpers.isArrayLike = function (o) {
    return o && o.length !== undefined;
  };

  Rx.helpers.iterator = $iterator$;

  var bindCallback = Rx.internals.bindCallback = function (func, thisArg, argCount) {
    if (typeof thisArg === 'undefined') { return func; }
    switch(argCount) {
      case 0:
        return function() {
          return func.call(thisArg)
        };
      case 1:
        return function(arg) {
          return func.call(thisArg, arg);
        };
      case 2:
        return function(value, index) {
          return func.call(thisArg, value, index);
        };
      case 3:
        return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
    }

    return function() {
      return func.apply(thisArg, arguments);
    };
  };

  /** Used to determine if values are of the language type Object */
  var dontEnums = ['toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'],
  dontEnumsLength = dontEnums.length;

var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dateTag] = typedArrayTags[errorTag] =
typedArrayTags[funcTag] = typedArrayTags[mapTag] =
typedArrayTags[numberTag] = typedArrayTags[objectTag] =
typedArrayTags[regexpTag] = typedArrayTags[setTag] =
typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

var objectProto = Object.prototype,
    hasOwnProperty = objectProto.hasOwnProperty,
    objToString = objectProto.toString,
    MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

var keys = Object.keys || (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());

function equalObjects(object, other, equalFunc, isLoose, stackA, stackB) {
  var objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength !== othLength && !isLoose) {
    return false;
  }
  var index = objLength, key;
  while (index--) {
    key = objProps[index];
    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  var skipCtor = isLoose;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key],
        result;

    if (!(result === undefined ? equalFunc(objValue, othValue, isLoose, stackA, stackB) : result)) {
      return false;
    }
    skipCtor || (skipCtor = key === 'constructor');
  }
  if (!skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    if (objCtor !== othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor === 'function' && objCtor instanceof objCtor &&
          typeof othCtor === 'function' && othCtor instanceof othCtor)) {
      return false;
    }
  }
  return true;
}

function equalByTag(object, other, tag) {
  switch (tag) {
    case boolTag:
    case dateTag:
      return +object === +other;

    case errorTag:
      return object.name === other.name && object.message === other.message;

    case numberTag:
      return (object !== +object) ?
        other !== +other :
        object === +other;

    case regexpTag:
    case stringTag:
      return object === (other + '');
  }
  return false;
}

var isObject = Rx.internals.isObject = function(value) {
  var type = typeof value;
  return !!value && (type === 'object' || type === 'function');
};

function isObjectLike(value) {
  return !!value && typeof value === 'object';
}

function isLength(value) {
  return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
}

var isHostObject = (function() {
  try {
    Object({ 'toString': 0 } + '');
  } catch(e) {
    return function() { return false; };
  }
  return function(value) {
    return typeof value.toString !== 'function' && typeof (value + '') === 'string';
  };
}());

function isTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
}

var isArray = Array.isArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) === arrayTag;
};

function arraySome (array, predicate) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

function equalArrays(array, other, equalFunc, isLoose, stackA, stackB) {
  var index = -1,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength !== othLength && !(isLoose && othLength > arrLength)) {
    return false;
  }
  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index],
        result;

    if (result !== undefined) {
      if (result) {
        continue;
      }
      return false;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (isLoose) {
      if (!arraySome(other, function(othValue) {
            return arrValue === othValue || equalFunc(arrValue, othValue, isLoose, stackA, stackB);
          })) {
        return false;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, isLoose, stackA, stackB))) {
      return false;
    }
  }
  return true;
}

function baseIsEqualDeep(object, other, equalFunc, isLoose, stackA, stackB) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = objToString.call(object);
    if (objTag === argsTag) {
      objTag = objectTag;
    } else if (objTag !== objectTag) {
      objIsArr = isTypedArray(object);
    }
  }
  if (!othIsArr) {
    othTag = objToString.call(other);
    if (othTag === argsTag) {
      othTag = objectTag;
    }
  }
  var objIsObj = objTag === objectTag && !isHostObject(object),
      othIsObj = othTag === objectTag && !isHostObject(other),
      isSameTag = objTag === othTag;

  if (isSameTag && !(objIsArr || objIsObj)) {
    return equalByTag(object, other, objTag);
  }
  if (!isLoose) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, isLoose, stackA, stackB);
    }
  }
  if (!isSameTag) {
    return false;
  }
  // Assume cyclic values are equal.
  // For more information on detecting circular references see https://es5.github.io/#JO.
  stackA || (stackA = []);
  stackB || (stackB = []);

  var length = stackA.length;
  while (length--) {
    if (stackA[length] === object) {
      return stackB[length] === other;
    }
  }
  // Add `object` and `other` to the stack of traversed objects.
  stackA.push(object);
  stackB.push(other);

  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, isLoose, stackA, stackB);

  stackA.pop();
  stackB.pop();

  return result;
}

function baseIsEqual(value, other, isLoose, stackA, stackB) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, isLoose, stackA, stackB);
}

var isEqual = Rx.internals.isEqual = function (value, other) {
  return baseIsEqual(value, other);
};

  var hasProp = {}.hasOwnProperty,
      slice = Array.prototype.slice;

  var inherits = Rx.internals.inherits = function (child, parent) {
    function __() { this.constructor = child; }
    __.prototype = parent.prototype;
    child.prototype = new __();
  };

  var addProperties = Rx.internals.addProperties = function (obj) {
    for(var sources = [], i = 1, len = arguments.length; i < len; i++) { sources.push(arguments[i]); }
    for (var idx = 0, ln = sources.length; idx < ln; idx++) {
      var source = sources[idx];
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  };

  // Rx Utils
  var addRef = Rx.internals.addRef = function (xs, r) {
    return new AnonymousObservable(function (observer) {
      return new BinaryDisposable(r.getDisposable(), xs.subscribe(observer));
    });
  };

  function arrayInitialize(count, factory) {
    var a = new Array(count);
    for (var i = 0; i < count; i++) {
      a[i] = factory();
    }
    return a;
  }

  function IndexedItem(id, value) {
    this.id = id;
    this.value = value;
  }

  IndexedItem.prototype.compareTo = function (other) {
    var c = this.value.compareTo(other.value);
    c === 0 && (c = this.id - other.id);
    return c;
  };

  var PriorityQueue = Rx.internals.PriorityQueue = function (capacity) {
    this.items = new Array(capacity);
    this.length = 0;
  };

  var priorityProto = PriorityQueue.prototype;
  priorityProto.isHigherPriority = function (left, right) {
    return this.items[left].compareTo(this.items[right]) < 0;
  };

  priorityProto.percolate = function (index) {
    if (index >= this.length || index < 0) { return; }
    var parent = index - 1 >> 1;
    if (parent < 0 || parent === index) { return; }
    if (this.isHigherPriority(index, parent)) {
      var temp = this.items[index];
      this.items[index] = this.items[parent];
      this.items[parent] = temp;
      this.percolate(parent);
    }
  };

  priorityProto.heapify = function (index) {
    +index || (index = 0);
    if (index >= this.length || index < 0) { return; }
    var left = 2 * index + 1,
        right = 2 * index + 2,
        first = index;
    if (left < this.length && this.isHigherPriority(left, first)) {
      first = left;
    }
    if (right < this.length && this.isHigherPriority(right, first)) {
      first = right;
    }
    if (first !== index) {
      var temp = this.items[index];
      this.items[index] = this.items[first];
      this.items[first] = temp;
      this.heapify(first);
    }
  };

  priorityProto.peek = function () { return this.items[0].value; };

  priorityProto.removeAt = function (index) {
    this.items[index] = this.items[--this.length];
    this.items[this.length] = undefined;
    this.heapify();
  };

  priorityProto.dequeue = function () {
    var result = this.peek();
    this.removeAt(0);
    return result;
  };

  priorityProto.enqueue = function (item) {
    var index = this.length++;
    this.items[index] = new IndexedItem(PriorityQueue.count++, item);
    this.percolate(index);
  };

  priorityProto.remove = function (item) {
    for (var i = 0; i < this.length; i++) {
      if (this.items[i].value === item) {
        this.removeAt(i);
        return true;
      }
    }
    return false;
  };
  PriorityQueue.count = 0;

  /**
   * Represents a group of disposable resources that are disposed together.
   * @constructor
   */
  var CompositeDisposable = Rx.CompositeDisposable = function () {
    var args = [], i, len;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
    } else {
      len = arguments.length;
      args = new Array(len);
      for(i = 0; i < len; i++) { args[i] = arguments[i]; }
    }
    this.disposables = args;
    this.isDisposed = false;
    this.length = args.length;
  };

  var CompositeDisposablePrototype = CompositeDisposable.prototype;

  /**
   * Adds a disposable to the CompositeDisposable or disposes the disposable if the CompositeDisposable is disposed.
   * @param {Mixed} item Disposable to add.
   */
  CompositeDisposablePrototype.add = function (item) {
    if (this.isDisposed) {
      item.dispose();
    } else {
      this.disposables.push(item);
      this.length++;
    }
  };

  /**
   * Removes and disposes the first occurrence of a disposable from the CompositeDisposable.
   * @param {Mixed} item Disposable to remove.
   * @returns {Boolean} true if found; false otherwise.
   */
  CompositeDisposablePrototype.remove = function (item) {
    var shouldDispose = false;
    if (!this.isDisposed) {
      var idx = this.disposables.indexOf(item);
      if (idx !== -1) {
        shouldDispose = true;
        this.disposables.splice(idx, 1);
        this.length--;
        item.dispose();
      }
    }
    return shouldDispose;
  };

  /**
   *  Disposes all disposables in the group and removes them from the group.
   */
  CompositeDisposablePrototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var len = this.disposables.length, currentDisposables = new Array(len);
      for(var i = 0; i < len; i++) { currentDisposables[i] = this.disposables[i]; }
      this.disposables = [];
      this.length = 0;

      for (i = 0; i < len; i++) {
        currentDisposables[i].dispose();
      }
    }
  };

  /**
   * Provides a set of static methods for creating Disposables.
   * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
   */
  var Disposable = Rx.Disposable = function (action) {
    this.isDisposed = false;
    this.action = action || noop;
  };

  /** Performs the task of cleaning up resources. */
  Disposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.action();
      this.isDisposed = true;
    }
  };

  /**
   * Creates a disposable object that invokes the specified action when disposed.
   * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
   * @return {Disposable} The disposable object that runs the given action upon disposal.
   */
  var disposableCreate = Disposable.create = function (action) { return new Disposable(action); };

  /**
   * Gets the disposable that does nothing when disposed.
   */
  var disposableEmpty = Disposable.empty = { dispose: noop };

  /**
   * Validates whether the given object is a disposable
   * @param {Object} Object to test whether it has a dispose method
   * @returns {Boolean} true if a disposable object, else false.
   */
  var isDisposable = Disposable.isDisposable = function (d) {
    return d && isFunction(d.dispose);
  };

  var checkDisposed = Disposable.checkDisposed = function (disposable) {
    if (disposable.isDisposed) { throw new ObjectDisposedError(); }
  };

  var disposableFixup = Disposable._fixup = function (result) {
    return isDisposable(result) ? result : disposableEmpty;
  };

  // Single assignment
  var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = function () {
    this.isDisposed = false;
    this.current = null;
  };
  SingleAssignmentDisposable.prototype.getDisposable = function () {
    return this.current;
  };
  SingleAssignmentDisposable.prototype.setDisposable = function (value) {
    if (this.current) { throw new Error('Disposable has already been assigned'); }
    var shouldDispose = this.isDisposed;
    !shouldDispose && (this.current = value);
    shouldDispose && value && value.dispose();
  };
  SingleAssignmentDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var old = this.current;
      this.current = null;
      old && old.dispose();
    }
  };

  // Multiple assignment disposable
  var SerialDisposable = Rx.SerialDisposable = function () {
    this.isDisposed = false;
    this.current = null;
  };
  SerialDisposable.prototype.getDisposable = function () {
    return this.current;
  };
  SerialDisposable.prototype.setDisposable = function (value) {
    var shouldDispose = this.isDisposed;
    if (!shouldDispose) {
      var old = this.current;
      this.current = value;
    }
    old && old.dispose();
    shouldDispose && value && value.dispose();
  };
  SerialDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var old = this.current;
      this.current = null;
    }
    old && old.dispose();
  };

  var BinaryDisposable = Rx.BinaryDisposable = function (first, second) {
    this._first = first;
    this._second = second;
    this.isDisposed = false;
  };

  BinaryDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var old1 = this._first;
      this._first = null;
      old1 && old1.dispose();
      var old2 = this._second;
      this._second = null;
      old2 && old2.dispose();
    }
  };

  var NAryDisposable = Rx.NAryDisposable = function (disposables) {
    this._disposables = disposables;
    this.isDisposed = false;
  };

  NAryDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      for (var i = 0, len = this._disposables.length; i < len; i++) {
        this._disposables[i].dispose();
      }
      this._disposables.length = 0;
    }
  };

  /**
   * Represents a disposable resource that only disposes its underlying disposable resource when all dependent disposable objects have been disposed.
   */
  var RefCountDisposable = Rx.RefCountDisposable = (function () {

    function InnerDisposable(disposable) {
      this.disposable = disposable;
      this.disposable.count++;
      this.isInnerDisposed = false;
    }

    InnerDisposable.prototype.dispose = function () {
      if (!this.disposable.isDisposed && !this.isInnerDisposed) {
        this.isInnerDisposed = true;
        this.disposable.count--;
        if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
          this.disposable.isDisposed = true;
          this.disposable.underlyingDisposable.dispose();
        }
      }
    };

    /**
     * Initializes a new instance of the RefCountDisposable with the specified disposable.
     * @constructor
     * @param {Disposable} disposable Underlying disposable.
      */
    function RefCountDisposable(disposable) {
      this.underlyingDisposable = disposable;
      this.isDisposed = false;
      this.isPrimaryDisposed = false;
      this.count = 0;
    }

    /**
     * Disposes the underlying disposable only when all dependent disposables have been disposed
     */
    RefCountDisposable.prototype.dispose = function () {
      if (!this.isDisposed && !this.isPrimaryDisposed) {
        this.isPrimaryDisposed = true;
        if (this.count === 0) {
          this.isDisposed = true;
          this.underlyingDisposable.dispose();
        }
      }
    };

    /**
     * Returns a dependent disposable that when disposed decreases the refcount on the underlying disposable.
     * @returns {Disposable} A dependent disposable contributing to the reference count that manages the underlying disposable's lifetime.
     */
    RefCountDisposable.prototype.getDisposable = function () {
      return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
    };

    return RefCountDisposable;
  })();

  function ScheduledDisposable(scheduler, disposable) {
    this.scheduler = scheduler;
    this.disposable = disposable;
    this.isDisposed = false;
  }

  function scheduleItem(s, self) {
    if (!self.isDisposed) {
      self.isDisposed = true;
      self.disposable.dispose();
    }
  }

  ScheduledDisposable.prototype.dispose = function () {
    this.scheduler.schedule(this, scheduleItem);
  };

  var ScheduledItem = Rx.internals.ScheduledItem = function (scheduler, state, action, dueTime, comparer) {
    this.scheduler = scheduler;
    this.state = state;
    this.action = action;
    this.dueTime = dueTime;
    this.comparer = comparer || defaultSubComparer;
    this.disposable = new SingleAssignmentDisposable();
  };

  ScheduledItem.prototype.invoke = function () {
    this.disposable.setDisposable(this.invokeCore());
  };

  ScheduledItem.prototype.compareTo = function (other) {
    return this.comparer(this.dueTime, other.dueTime);
  };

  ScheduledItem.prototype.isCancelled = function () {
    return this.disposable.isDisposed;
  };

  ScheduledItem.prototype.invokeCore = function () {
    return disposableFixup(this.action(this.scheduler, this.state));
  };

  /** Provides a set of static properties to access commonly used schedulers. */
  var Scheduler = Rx.Scheduler = (function () {

    function Scheduler() { }

    /** Determines whether the given object is a scheduler */
    Scheduler.isScheduler = function (s) {
      return s instanceof Scheduler;
    };

    var schedulerProto = Scheduler.prototype;

    /**
   * Schedules an action to be executed.
   * @param state State passed to the action to be executed.
   * @param {Function} action Action to be executed.
   * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
   */
    schedulerProto.schedule = function (state, action) {
      throw new NotImplementedError();
    };

  /**
   * Schedules an action to be executed after dueTime.
   * @param state State passed to the action to be executed.
   * @param {Function} action Action to be executed.
   * @param {Number} dueTime Relative time after which to execute the action.
   * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
   */
    schedulerProto.scheduleFuture = function (state, dueTime, action) {
      var dt = dueTime;
      dt instanceof Date && (dt = dt - this.now());
      dt = Scheduler.normalize(dt);

      if (dt === 0) { return this.schedule(state, action); }

      return this._scheduleFuture(state, dt, action);
    };

    schedulerProto._scheduleFuture = function (state, dueTime, action) {
      throw new NotImplementedError();
    };

    /** Gets the current time according to the local machine's system clock. */
    Scheduler.now = defaultNow;

    /** Gets the current time according to the local machine's system clock. */
    Scheduler.prototype.now = defaultNow;

    /**
     * Normalizes the specified TimeSpan value to a positive value.
     * @param {Number} timeSpan The time span value to normalize.
     * @returns {Number} The specified TimeSpan value if it is zero or positive; otherwise, 0
     */
    Scheduler.normalize = function (timeSpan) {
      timeSpan < 0 && (timeSpan = 0);
      return timeSpan;
    };

    return Scheduler;
  }());

  var normalizeTime = Scheduler.normalize, isScheduler = Scheduler.isScheduler;

  (function (schedulerProto) {

    function invokeRecImmediate(scheduler, pair) {
      var state = pair[0], action = pair[1], group = new CompositeDisposable();
      action(state, innerAction);
      return group;

      function innerAction(state2) {
        var isAdded = false, isDone = false;

        var d = scheduler.schedule(state2, scheduleWork);
        if (!isDone) {
          group.add(d);
          isAdded = true;
        }

        function scheduleWork(_, state3) {
          if (isAdded) {
            group.remove(d);
          } else {
            isDone = true;
          }
          action(state3, innerAction);
          return disposableEmpty;
        }
      }
    }

    function invokeRecDate(scheduler, pair) {
      var state = pair[0], action = pair[1], group = new CompositeDisposable();
      action(state, innerAction);
      return group;

      function innerAction(state2, dueTime1) {
        var isAdded = false, isDone = false;

        var d = scheduler.scheduleFuture(state2, dueTime1, scheduleWork);
        if (!isDone) {
          group.add(d);
          isAdded = true;
        }

        function scheduleWork(_, state3) {
          if (isAdded) {
            group.remove(d);
          } else {
            isDone = true;
          }
          action(state3, innerAction);
          return disposableEmpty;
        }
      }
    }

    /**
     * Schedules an action to be executed recursively.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in recursive invocation state.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursive = function (state, action) {
      return this.schedule([state, action], invokeRecImmediate);
    };

    /**
     * Schedules an action to be executed recursively after a specified relative or absolute due time.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
     * @param {Number | Date} dueTime Relative or absolute time after which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveFuture = function (state, dueTime, action) {
      return this.scheduleFuture([state, action], dueTime, invokeRecDate);
    };

  }(Scheduler.prototype));

  (function (schedulerProto) {

    /**
     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
     * @param {Mixed} state Initial state passed to the action upon the first iteration.
     * @param {Number} period Period for running the work periodically.
     * @param {Function} action Action to be executed, potentially updating the state.
     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
     */
    schedulerProto.schedulePeriodic = function(state, period, action) {
      if (typeof root.setInterval === 'undefined') { throw new NotSupportedError(); }
      period = normalizeTime(period);
      var s = state, id = root.setInterval(function () { s = action(s); }, period);
      return disposableCreate(function () { root.clearInterval(id); });
    };

  }(Scheduler.prototype));

  (function (schedulerProto) {
    /**
     * Returns a scheduler that wraps the original scheduler, adding exception handling for scheduled actions.
     * @param {Function} handler Handler that's run if an exception is caught. The exception will be rethrown if the handler returns false.
     * @returns {Scheduler} Wrapper around the original scheduler, enforcing exception handling.
     */
    schedulerProto.catchError = schedulerProto['catch'] = function (handler) {
      return new CatchScheduler(this, handler);
    };
  }(Scheduler.prototype));

  var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function () {
    function createTick(self) {
      return function tick(command, recurse) {
        recurse(0, self._period);
        var state = tryCatch(self._action)(self._state);
        if (state === errorObj) {
          self._cancel.dispose();
          thrower(state.e);
        }
        self._state = state;
      };
    }

    function SchedulePeriodicRecursive(scheduler, state, period, action) {
      this._scheduler = scheduler;
      this._state = state;
      this._period = period;
      this._action = action;
    }

    SchedulePeriodicRecursive.prototype.start = function () {
      var d = new SingleAssignmentDisposable();
      this._cancel = d;
      d.setDisposable(this._scheduler.scheduleRecursiveFuture(0, this._period, createTick(this)));

      return d;
    };

    return SchedulePeriodicRecursive;
  }());

  /** Gets a scheduler that schedules work immediately on the current thread. */
   var ImmediateScheduler = (function (__super__) {
    inherits(ImmediateScheduler, __super__);
    function ImmediateScheduler() {
      __super__.call(this);
    }

    ImmediateScheduler.prototype.schedule = function (state, action) {
      return disposableFixup(action(this, state));
    };

    return ImmediateScheduler;
  }(Scheduler));

  var immediateScheduler = Scheduler.immediate = new ImmediateScheduler();

  /**
   * Gets a scheduler that schedules work as soon as possible on the current thread.
   */
  var CurrentThreadScheduler = (function (__super__) {
    var queue;

    function runTrampoline () {
      while (queue.length > 0) {
        var item = queue.dequeue();
        !item.isCancelled() && item.invoke();
      }
    }

    inherits(CurrentThreadScheduler, __super__);
    function CurrentThreadScheduler() {
      __super__.call(this);
    }

    CurrentThreadScheduler.prototype.schedule = function (state, action) {
      var si = new ScheduledItem(this, state, action, this.now());

      if (!queue) {
        queue = new PriorityQueue(4);
        queue.enqueue(si);

        var result = tryCatch(runTrampoline)();
        queue = null;
        if (result === errorObj) { thrower(result.e); }
      } else {
        queue.enqueue(si);
      }
      return si.disposable;
    };

    CurrentThreadScheduler.prototype.scheduleRequired = function () { return !queue; };

    return CurrentThreadScheduler;
  }(Scheduler));

  var currentThreadScheduler = Scheduler.currentThread = new CurrentThreadScheduler();

  var scheduleMethod, clearMethod;

  var localTimer = (function () {
    var localSetTimeout, localClearTimeout = noop;
    if (!!root.setTimeout) {
      localSetTimeout = root.setTimeout;
      localClearTimeout = root.clearTimeout;
    } else if (!!root.WScript) {
      localSetTimeout = function (fn, time) {
        root.WScript.Sleep(time);
        fn();
      };
    } else {
      throw new NotSupportedError();
    }

    return {
      setTimeout: localSetTimeout,
      clearTimeout: localClearTimeout
    };
  }());
  var localSetTimeout = localTimer.setTimeout,
    localClearTimeout = localTimer.clearTimeout;

  (function () {

    var nextHandle = 1, tasksByHandle = {}, currentlyRunning = false;

    clearMethod = function (handle) {
      delete tasksByHandle[handle];
    };

    function runTask(handle) {
      if (currentlyRunning) {
        localSetTimeout(function () { runTask(handle); }, 0);
      } else {
        var task = tasksByHandle[handle];
        if (task) {
          currentlyRunning = true;
          var result = tryCatch(task)();
          clearMethod(handle);
          currentlyRunning = false;
          if (result === errorObj) { thrower(result.e); }
        }
      }
    }

    var reNative = new RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    var setImmediate = typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' &&
      !reNative.test(setImmediate) && setImmediate;

    function postMessageSupported () {
      // Ensure not in a worker
      if (!root.postMessage || root.importScripts) { return false; }
      var isAsync = false, oldHandler = root.onmessage;
      // Test for async
      root.onmessage = function () { isAsync = true; };
      root.postMessage('', '*');
      root.onmessage = oldHandler;

      return isAsync;
    }

    // Use in order, setImmediate, nextTick, postMessage, MessageChannel, script readystatechanged, setTimeout
    if (isFunction(setImmediate)) {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        setImmediate(function () { runTask(id); });

        return id;
      };
    } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        process.nextTick(function () { runTask(id); });

        return id;
      };
    } else if (postMessageSupported()) {
      var MSG_PREFIX = 'ms.rx.schedule' + Math.random();

      var onGlobalPostMessage = function (event) {
        // Only if we're a match to avoid any other global events
        if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
          runTask(event.data.substring(MSG_PREFIX.length));
        }
      };

      root.addEventListener('message', onGlobalPostMessage, false);

      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        root.postMessage(MSG_PREFIX + id, '*');
        return id;
      };
    } else if (!!root.MessageChannel) {
      var channel = new root.MessageChannel();

      channel.port1.onmessage = function (e) { runTask(e.data); };

      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        channel.port2.postMessage(id);
        return id;
      };
    } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {

      scheduleMethod = function (action) {
        var scriptElement = root.document.createElement('script');
        var id = nextHandle++;
        tasksByHandle[id] = action;

        scriptElement.onreadystatechange = function () {
          runTask(id);
          scriptElement.onreadystatechange = null;
          scriptElement.parentNode.removeChild(scriptElement);
          scriptElement = null;
        };
        root.document.documentElement.appendChild(scriptElement);
        return id;
      };

    } else {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        localSetTimeout(function () {
          runTask(id);
        }, 0);

        return id;
      };
    }
  }());

  /**
   * Gets a scheduler that schedules work via a timed callback based upon platform.
   */
   var DefaultScheduler = (function (__super__) {
     inherits(DefaultScheduler, __super__);
     function DefaultScheduler() {
       __super__.call(this);
     }

     function scheduleAction(disposable, action, scheduler, state) {
       return function schedule() {
         disposable.setDisposable(Disposable._fixup(action(scheduler, state)));
       };
     }

     function ClearDisposable(id) {
       this._id = id;
       this.isDisposed = false;
     }

     ClearDisposable.prototype.dispose = function () {
       if (!this.isDisposed) {
         this.isDisposed = true;
         clearMethod(this._id);
       }
     };

     function LocalClearDisposable(id) {
       this._id = id;
       this.isDisposed = false;
     }

     LocalClearDisposable.prototype.dispose = function () {
       if (!this.isDisposed) {
         this.isDisposed = true;
         localClearTimeout(this._id);
       }
     };

    DefaultScheduler.prototype.schedule = function (state, action) {
      var disposable = new SingleAssignmentDisposable(),
          id = scheduleMethod(scheduleAction(disposable, action, this, state));
      return new BinaryDisposable(disposable, new ClearDisposable(id));
    };

    DefaultScheduler.prototype._scheduleFuture = function (state, dueTime, action) {
      if (dueTime === 0) { return this.schedule(state, action); }
      var disposable = new SingleAssignmentDisposable(),
          id = localSetTimeout(scheduleAction(disposable, action, this, state), dueTime);
      return new BinaryDisposable(disposable, new LocalClearDisposable(id));
    };

    function scheduleLongRunning(state, action, disposable) {
      return function () { action(state, disposable); };
    }

    DefaultScheduler.prototype.scheduleLongRunning = function (state, action) {
      var disposable = disposableCreate(noop);
      scheduleMethod(scheduleLongRunning(state, action, disposable));
      return disposable;
    };

    return DefaultScheduler;
  }(Scheduler));

  var defaultScheduler = Scheduler['default'] = Scheduler.async = new DefaultScheduler();

  var CatchScheduler = (function (__super__) {
    inherits(CatchScheduler, __super__);

    function CatchScheduler(scheduler, handler) {
      this._scheduler = scheduler;
      this._handler = handler;
      this._recursiveOriginal = null;
      this._recursiveWrapper = null;
      __super__.call(this);
    }

    CatchScheduler.prototype.schedule = function (state, action) {
      return this._scheduler.schedule(state, this._wrap(action));
    };

    CatchScheduler.prototype._scheduleFuture = function (state, dueTime, action) {
      return this._scheduler.schedule(state, dueTime, this._wrap(action));
    };

    CatchScheduler.prototype.now = function () { return this._scheduler.now(); };

    CatchScheduler.prototype._clone = function (scheduler) {
        return new CatchScheduler(scheduler, this._handler);
    };

    CatchScheduler.prototype._wrap = function (action) {
      var parent = this;
      return function (self, state) {
        var res = tryCatch(action)(parent._getRecursiveWrapper(self), state);
        if (res === errorObj) {
          if (!parent._handler(res.e)) { thrower(res.e); }
          return disposableEmpty;
        }
        return disposableFixup(res);
      };
    };

    CatchScheduler.prototype._getRecursiveWrapper = function (scheduler) {
      if (this._recursiveOriginal !== scheduler) {
        this._recursiveOriginal = scheduler;
        var wrapper = this._clone(scheduler);
        wrapper._recursiveOriginal = scheduler;
        wrapper._recursiveWrapper = wrapper;
        this._recursiveWrapper = wrapper;
      }
      return this._recursiveWrapper;
    };

    CatchScheduler.prototype.schedulePeriodic = function (state, period, action) {
      var self = this, failed = false, d = new SingleAssignmentDisposable();

      d.setDisposable(this._scheduler.schedulePeriodic(state, period, function (state1) {
        if (failed) { return null; }
        var res = tryCatch(action)(state1);
        if (res === errorObj) {
          failed = true;
          if (!self._handler(res.e)) { thrower(res.e); }
          d.dispose();
          return null;
        }
        return res;
      }));

      return d;
    };

    return CatchScheduler;
  }(Scheduler));

  /**
   *  Represents a notification to an observer.
   */
  var Notification = Rx.Notification = (function () {
    function Notification() {

    }

    Notification.prototype._accept = function (onNext, onError, onCompleted) {
      throw new NotImplementedError();
    };

    Notification.prototype._acceptObserver = function (onNext, onError, onCompleted) {
      throw new NotImplementedError();
    };

    /**
     * Invokes the delegate corresponding to the notification or the observer's method corresponding to the notification and returns the produced result.
     * @param {Function | Observer} observerOrOnNext Function to invoke for an OnNext notification or Observer to invoke the notification on..
     * @param {Function} onError Function to invoke for an OnError notification.
     * @param {Function} onCompleted Function to invoke for an OnCompleted notification.
     * @returns {Any} Result produced by the observation.
     */
    Notification.prototype.accept = function (observerOrOnNext, onError, onCompleted) {
      return observerOrOnNext && typeof observerOrOnNext === 'object' ?
        this._acceptObserver(observerOrOnNext) :
        this._accept(observerOrOnNext, onError, onCompleted);
    };

    /**
     * Returns an observable sequence with a single notification.
     *
     * @memberOf Notifications
     * @param {Scheduler} [scheduler] Scheduler to send out the notification calls on.
     * @returns {Observable} The observable sequence that surfaces the behavior of the notification upon subscription.
     */
    Notification.prototype.toObservable = function (scheduler) {
      var self = this;
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function (o) {
        return scheduler.schedule(self, function (_, notification) {
          notification._acceptObserver(o);
          notification.kind === 'N' && o.onCompleted();
        });
      });
    };

    return Notification;
  })();

  var OnNextNotification = (function (__super__) {
    inherits(OnNextNotification, __super__);
    function OnNextNotification(value) {
      this.value = value;
      this.kind = 'N';
    }

    OnNextNotification.prototype._accept = function (onNext) {
      return onNext(this.value);
    };

    OnNextNotification.prototype._acceptObserver = function (o) {
      return o.onNext(this.value);
    };

    OnNextNotification.prototype.toString = function () {
      return 'OnNext(' + this.value + ')';
    };

    return OnNextNotification;
  }(Notification));

  var OnErrorNotification = (function (__super__) {
    inherits(OnErrorNotification, __super__);
    function OnErrorNotification(error) {
      this.error = error;
      this.kind = 'E';
    }

    OnErrorNotification.prototype._accept = function (onNext, onError) {
      return onError(this.error);
    };

    OnErrorNotification.prototype._acceptObserver = function (o) {
      return o.onError(this.error);
    };

    OnErrorNotification.prototype.toString = function () {
      return 'OnError(' + this.error + ')';
    };

    return OnErrorNotification;
  }(Notification));

  var OnCompletedNotification = (function (__super__) {
    inherits(OnCompletedNotification, __super__);
    function OnCompletedNotification() {
      this.kind = 'C';
    }

    OnCompletedNotification.prototype._accept = function (onNext, onError, onCompleted) {
      return onCompleted();
    };

    OnCompletedNotification.prototype._acceptObserver = function (o) {
      return o.onCompleted();
    };

    OnCompletedNotification.prototype.toString = function () {
      return 'OnCompleted()';
    };

    return OnCompletedNotification;
  }(Notification));

  /**
   * Creates an object that represents an OnNext notification to an observer.
   * @param {Any} value The value contained in the notification.
   * @returns {Notification} The OnNext notification containing the value.
   */
  var notificationCreateOnNext = Notification.createOnNext = function (value) {
    return new OnNextNotification(value);
  };

  /**
   * Creates an object that represents an OnError notification to an observer.
   * @param {Any} error The exception contained in the notification.
   * @returns {Notification} The OnError notification containing the exception.
   */
  var notificationCreateOnError = Notification.createOnError = function (error) {
    return new OnErrorNotification(error);
  };

  /**
   * Creates an object that represents an OnCompleted notification to an observer.
   * @returns {Notification} The OnCompleted notification.
   */
  var notificationCreateOnCompleted = Notification.createOnCompleted = function () {
    return new OnCompletedNotification();
  };

  /**
   * Supports push-style iteration over an observable sequence.
   */
  var Observer = Rx.Observer = function () { };

  /**
   *  Creates a notification callback from an observer.
   * @returns The action that forwards its input notification to the underlying observer.
   */
  Observer.prototype.toNotifier = function () {
    var observer = this;
    return function (n) { return n.accept(observer); };
  };

  /**
   *  Hides the identity of an observer.
   * @returns An observer that hides the identity of the specified observer.
   */
  Observer.prototype.asObserver = function () {
    var self = this;
    return new AnonymousObserver(
      function (x) { self.onNext(x); },
      function (err) { self.onError(err); },
      function () { self.onCompleted(); });
  };

  /**
   *  Checks access to the observer for grammar violations. This includes checking for multiple OnError or OnCompleted calls, as well as reentrancy in any of the observer methods.
   *  If a violation is detected, an Error is thrown from the offending observer method call.
   * @returns An observer that checks callbacks invocations against the observer grammar and, if the checks pass, forwards those to the specified observer.
   */
  Observer.prototype.checked = function () { return new CheckedObserver(this); };

  /**
   *  Creates an observer from the specified OnNext, along with optional OnError, and OnCompleted actions.
   * @param {Function} [onNext] Observer's OnNext action implementation.
   * @param {Function} [onError] Observer's OnError action implementation.
   * @param {Function} [onCompleted] Observer's OnCompleted action implementation.
   * @returns {Observer} The observer object implemented using the given actions.
   */
  var observerCreate = Observer.create = function (onNext, onError, onCompleted) {
    onNext || (onNext = noop);
    onError || (onError = defaultError);
    onCompleted || (onCompleted = noop);
    return new AnonymousObserver(onNext, onError, onCompleted);
  };

  /**
   *  Creates an observer from a notification callback.
   * @param {Function} handler Action that handles a notification.
   * @returns The observer object that invokes the specified handler using a notification corresponding to each message it receives.
   */
  Observer.fromNotifier = function (handler, thisArg) {
    var cb = bindCallback(handler, thisArg, 1);
    return new AnonymousObserver(function (x) {
      return cb(notificationCreateOnNext(x));
    }, function (e) {
      return cb(notificationCreateOnError(e));
    }, function () {
      return cb(notificationCreateOnCompleted());
    });
  };

  /**
   * Schedules the invocation of observer methods on the given scheduler.
   * @param {Scheduler} scheduler Scheduler to schedule observer messages on.
   * @returns {Observer} Observer whose messages are scheduled on the given scheduler.
   */
  Observer.prototype.notifyOn = function (scheduler) {
    return new ObserveOnObserver(scheduler, this);
  };

  Observer.prototype.makeSafe = function(disposable) {
    return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
  };

  /**
   * Abstract base class for implementations of the Observer class.
   * This base class enforces the grammar of observers where OnError and OnCompleted are terminal messages.
   */
  var AbstractObserver = Rx.internals.AbstractObserver = (function (__super__) {
    inherits(AbstractObserver, __super__);

    /**
     * Creates a new observer in a non-stopped state.
     */
    function AbstractObserver() {
      this.isStopped = false;
    }

    // Must be implemented by other observers
    AbstractObserver.prototype.next = notImplemented;
    AbstractObserver.prototype.error = notImplemented;
    AbstractObserver.prototype.completed = notImplemented;

    /**
     * Notifies the observer of a new element in the sequence.
     * @param {Any} value Next element in the sequence.
     */
    AbstractObserver.prototype.onNext = function (value) {
      !this.isStopped && this.next(value);
    };

    /**
     * Notifies the observer that an exception has occurred.
     * @param {Any} error The error that has occurred.
     */
    AbstractObserver.prototype.onError = function (error) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.error(error);
      }
    };

    /**
     * Notifies the observer of the end of the sequence.
     */
    AbstractObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.completed();
      }
    };

    /**
     * Disposes the observer, causing it to transition to the stopped state.
     */
    AbstractObserver.prototype.dispose = function () { this.isStopped = true; };

    AbstractObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.error(e);
        return true;
      }

      return false;
    };

    return AbstractObserver;
  }(Observer));

  /**
   * Class to create an Observer instance from delegate-based implementations of the on* methods.
   */
  var AnonymousObserver = Rx.AnonymousObserver = (function (__super__) {
    inherits(AnonymousObserver, __super__);

    /**
     * Creates an observer from the specified OnNext, OnError, and OnCompleted actions.
     * @param {Any} onNext Observer's OnNext action implementation.
     * @param {Any} onError Observer's OnError action implementation.
     * @param {Any} onCompleted Observer's OnCompleted action implementation.
     */
    function AnonymousObserver(onNext, onError, onCompleted) {
      __super__.call(this);
      this._onNext = onNext;
      this._onError = onError;
      this._onCompleted = onCompleted;
    }

    /**
     * Calls the onNext action.
     * @param {Any} value Next element in the sequence.
     */
    AnonymousObserver.prototype.next = function (value) {
      this._onNext(value);
    };

    /**
     * Calls the onError action.
     * @param {Any} error The error that has occurred.
     */
    AnonymousObserver.prototype.error = function (error) {
      this._onError(error);
    };

    /**
     *  Calls the onCompleted action.
     */
    AnonymousObserver.prototype.completed = function () {
      this._onCompleted();
    };

    return AnonymousObserver;
  }(AbstractObserver));

  var CheckedObserver = (function (__super__) {
    inherits(CheckedObserver, __super__);

    function CheckedObserver(observer) {
      __super__.call(this);
      this._observer = observer;
      this._state = 0; // 0 - idle, 1 - busy, 2 - done
    }

    var CheckedObserverPrototype = CheckedObserver.prototype;

    CheckedObserverPrototype.onNext = function (value) {
      this.checkAccess();
      var res = tryCatch(this._observer.onNext).call(this._observer, value);
      this._state = 0;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.onError = function (err) {
      this.checkAccess();
      var res = tryCatch(this._observer.onError).call(this._observer, err);
      this._state = 2;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.onCompleted = function () {
      this.checkAccess();
      var res = tryCatch(this._observer.onCompleted).call(this._observer);
      this._state = 2;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.checkAccess = function () {
      if (this._state === 1) { throw new Error('Re-entrancy detected'); }
      if (this._state === 2) { throw new Error('Observer completed'); }
      if (this._state === 0) { this._state = 1; }
    };

    return CheckedObserver;
  }(Observer));

  var ScheduledObserver = Rx.internals.ScheduledObserver = (function (__super__) {
    inherits(ScheduledObserver, __super__);

    function ScheduledObserver(scheduler, observer) {
      __super__.call(this);
      this.scheduler = scheduler;
      this.observer = observer;
      this.isAcquired = false;
      this.hasFaulted = false;
      this.queue = [];
      this.disposable = new SerialDisposable();
    }

    function enqueueNext(observer, x) { return function () { observer.onNext(x); }; }
    function enqueueError(observer, e) { return function () { observer.onError(e); }; }
    function enqueueCompleted(observer) { return function () { observer.onCompleted(); }; }

    ScheduledObserver.prototype.next = function (x) {
      this.queue.push(enqueueNext(this.observer, x));
    };

    ScheduledObserver.prototype.error = function (e) {
      this.queue.push(enqueueError(this.observer, e));
    };

    ScheduledObserver.prototype.completed = function () {
      this.queue.push(enqueueCompleted(this.observer));
    };


    function scheduleMethod(state, recurse) {
      var work;
      if (state.queue.length > 0) {
        work = state.queue.shift();
      } else {
        state.isAcquired = false;
        return;
      }
      var res = tryCatch(work)();
      if (res === errorObj) {
        state.queue = [];
        state.hasFaulted = true;
        return thrower(res.e);
      }
      recurse(state);
    }

    ScheduledObserver.prototype.ensureActive = function () {
      var isOwner = false;
      if (!this.hasFaulted && this.queue.length > 0) {
        isOwner = !this.isAcquired;
        this.isAcquired = true;
      }
      isOwner &&
        this.disposable.setDisposable(this.scheduler.scheduleRecursive(this, scheduleMethod));
    };

    ScheduledObserver.prototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this.disposable.dispose();
    };

    return ScheduledObserver;
  }(AbstractObserver));

  var ObserveOnObserver = (function (__super__) {
    inherits(ObserveOnObserver, __super__);

    function ObserveOnObserver(scheduler, observer, cancel) {
      __super__.call(this, scheduler, observer);
      this._cancel = cancel;
    }

    ObserveOnObserver.prototype.next = function (value) {
      __super__.prototype.next.call(this, value);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.error = function (e) {
      __super__.prototype.error.call(this, e);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.completed = function () {
      __super__.prototype.completed.call(this);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this._cancel && this._cancel.dispose();
      this._cancel = null;
    };

    return ObserveOnObserver;
  })(ScheduledObserver);

  var observableProto;

  /**
   * Represents a push-style collection.
   */
  var Observable = Rx.Observable = (function () {

    function makeSubscribe(self, subscribe) {
      return function (o) {
        var oldOnError = o.onError;
        o.onError = function (e) {
          makeStackTraceLong(e, self);
          oldOnError.call(o, e);
        };

        return subscribe.call(self, o);
      };
    }

    function Observable() {
      if (Rx.config.longStackSupport && hasStacks) {
        var oldSubscribe = this._subscribe;
        var e = tryCatch(thrower)(new Error()).e;
        this.stack = e.stack.substring(e.stack.indexOf('\n') + 1);
        this._subscribe = makeSubscribe(this, oldSubscribe);
      }
    }

    observableProto = Observable.prototype;

    /**
    * Determines whether the given object is an Observable
    * @param {Any} An object to determine whether it is an Observable
    * @returns {Boolean} true if an Observable, else false.
    */
    Observable.isObservable = function (o) {
      return o && isFunction(o.subscribe);
    };

    /**
     *  Subscribes an o to the observable sequence.
     *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
     *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
     *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
     *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribe = observableProto.forEach = function (oOrOnNext, onError, onCompleted) {
      return this._subscribe(typeof oOrOnNext === 'object' ?
        oOrOnNext :
        observerCreate(oOrOnNext, onError, onCompleted));
    };

    /**
     * Subscribes to the next value in the sequence with an optional "this" argument.
     * @param {Function} onNext The function to invoke on each element in the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnNext = function (onNext, thisArg) {
      return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) { onNext.call(thisArg, x); } : onNext));
    };

    /**
     * Subscribes to an exceptional condition in the sequence with an optional "this" argument.
     * @param {Function} onError The function to invoke upon exceptional termination of the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnError = function (onError, thisArg) {
      return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) { onError.call(thisArg, e); } : onError));
    };

    /**
     * Subscribes to the next value in the sequence with an optional "this" argument.
     * @param {Function} onCompleted The function to invoke upon graceful termination of the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnCompleted = function (onCompleted, thisArg) {
      return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() { onCompleted.call(thisArg); } : onCompleted));
    };

    return Observable;
  })();

  var ObservableBase = Rx.ObservableBase = (function (__super__) {
    inherits(ObservableBase, __super__);

    function fixSubscriber(subscriber) {
      return subscriber && isFunction(subscriber.dispose) ? subscriber :
        isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
    }

    function setDisposable(s, state) {
      var ado = state[0], self = state[1];
      var sub = tryCatch(self.subscribeCore).call(self, ado);
      if (sub === errorObj && !ado.fail(errorObj.e)) { thrower(errorObj.e); }
      ado.setDisposable(fixSubscriber(sub));
    }

    function ObservableBase() {
      __super__.call(this);
    }

    ObservableBase.prototype._subscribe = function (o) {
      var ado = new AutoDetachObserver(o), state = [ado, this];

      if (currentThreadScheduler.scheduleRequired()) {
        currentThreadScheduler.schedule(state, setDisposable);
      } else {
        setDisposable(null, state);
      }
      return ado;
    };

    ObservableBase.prototype.subscribeCore = notImplemented;

    return ObservableBase;
  }(Observable));

var FlatMapObservable = Rx.FlatMapObservable = (function(__super__) {

    inherits(FlatMapObservable, __super__);

    function FlatMapObservable(source, selector, resultSelector, thisArg) {
      this.resultSelector = isFunction(resultSelector) ? resultSelector : null;
      this.selector = bindCallback(isFunction(selector) ? selector : function() { return selector; }, thisArg, 3);
      this.source = source;
      __super__.call(this);
    }

    FlatMapObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new InnerObserver(o, this.selector, this.resultSelector, this));
    };

    inherits(InnerObserver, AbstractObserver);
    function InnerObserver(observer, selector, resultSelector, source) {
      this.i = 0;
      this.selector = selector;
      this.resultSelector = resultSelector;
      this.source = source;
      this.o = observer;
      AbstractObserver.call(this);
    }

    InnerObserver.prototype._wrapResult = function(result, x, i) {
      return this.resultSelector ?
        result.map(function(y, i2) { return this.resultSelector(x, y, i, i2); }, this) :
        result;
    };

    InnerObserver.prototype.next = function(x) {
      var i = this.i++;
      var result = tryCatch(this.selector)(x, i, this.source);
      if (result === errorObj) { return this.o.onError(result.e); }

      isPromise(result) && (result = observableFromPromise(result));
      (isArrayLike(result) || isIterable(result)) && (result = Observable.from(result));
      this.o.onNext(this._wrapResult(result, x, i));
    };

    InnerObserver.prototype.error = function(e) { this.o.onError(e); };

    InnerObserver.prototype.completed = function() { this.o.onCompleted(); };

    return FlatMapObservable;

}(ObservableBase));

  var Enumerable = Rx.internals.Enumerable = function () { };

  function IsDisposedDisposable(state) {
    this._s = state;
    this.isDisposed = false;
  }

  IsDisposedDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      this._s.isDisposed = true;
    }
  };

  var ConcatEnumerableObservable = (function(__super__) {
    inherits(ConcatEnumerableObservable, __super__);
    function ConcatEnumerableObservable(sources) {
      this.sources = sources;
      __super__.call(this);
    }

    function scheduleMethod(state, recurse) {
      if (state.isDisposed) { return; }
      var currentItem = tryCatch(state.e.next).call(state.e);
      if (currentItem === errorObj) { return state.o.onError(currentItem.e); }
      if (currentItem.done) { return state.o.onCompleted(); }

      // Check if promise
      var currentValue = currentItem.value;
      isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

      var d = new SingleAssignmentDisposable();
      state.subscription.setDisposable(d);
      d.setDisposable(currentValue.subscribe(new InnerObserver(state, recurse)));
    }

    ConcatEnumerableObservable.prototype.subscribeCore = function (o) {
      var subscription = new SerialDisposable();
      var state = {
        isDisposed: false,
        o: o,
        subscription: subscription,
        e: this.sources[$iterator$]()
      };

      var cancelable = currentThreadScheduler.scheduleRecursive(state, scheduleMethod);
      return new NAryDisposable([subscription, cancelable, new IsDisposedDisposable(state)]);
    };

    function InnerObserver(state, recurse) {
      this._state = state;
      this._recurse = recurse;
      AbstractObserver.call(this);
    }

    inherits(InnerObserver, AbstractObserver);

    InnerObserver.prototype.next = function (x) { this._state.o.onNext(x); };
    InnerObserver.prototype.error = function (e) { this._state.o.onError(e); };
    InnerObserver.prototype.completed = function () { this._recurse(this._state); };

    return ConcatEnumerableObservable;
  }(ObservableBase));

  Enumerable.prototype.concat = function () {
    return new ConcatEnumerableObservable(this);
  };

  var CatchErrorObservable = (function(__super__) {
    function CatchErrorObservable(sources) {
      this.sources = sources;
      __super__.call(this);
    }

    inherits(CatchErrorObservable, __super__);

    function scheduleMethod(state, recurse) {
      if (state.isDisposed) { return; }
      var currentItem = tryCatch(state.e.next).call(state.e);
      if (currentItem === errorObj) { return state.o.onError(currentItem.e); }
      if (currentItem.done) { return state.lastError !== null ? state.o.onError(state.lastError) : state.o.onCompleted(); }

      var currentValue = currentItem.value;
      isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

      var d = new SingleAssignmentDisposable();
      state.subscription.setDisposable(d);
      d.setDisposable(currentValue.subscribe(new InnerObserver(state, recurse)));
    }

    CatchErrorObservable.prototype.subscribeCore = function (o) {
      var subscription = new SerialDisposable();
      var state = {
        isDisposed: false,
        e: this.sources[$iterator$](),
        subscription: subscription,
        lastError: null,
        o: o
      };

      var cancelable = currentThreadScheduler.scheduleRecursive(state, scheduleMethod);
      return new NAryDisposable([subscription, cancelable, new IsDisposedDisposable(state)]);
    };

    function InnerObserver(state, recurse) {
      this._state = state;
      this._recurse = recurse;
      AbstractObserver.call(this);
    }

    inherits(InnerObserver, AbstractObserver);

    InnerObserver.prototype.next = function (x) { this._state.o.onNext(x); };
    InnerObserver.prototype.error = function (e) { this._state.lastError = e; this._recurse(this._state); };
    InnerObserver.prototype.completed = function () { this._state.o.onCompleted(); };

    return CatchErrorObservable;
  }(ObservableBase));

  Enumerable.prototype.catchError = function () {
    return new CatchErrorObservable(this);
  };

  var RepeatEnumerable = (function (__super__) {
    inherits(RepeatEnumerable, __super__);
    function RepeatEnumerable(v, c) {
      this.v = v;
      this.c = c == null ? -1 : c;
    }

    RepeatEnumerable.prototype[$iterator$] = function () {
      return new RepeatEnumerator(this);
    };

    function RepeatEnumerator(p) {
      this.v = p.v;
      this.l = p.c;
    }

    RepeatEnumerator.prototype.next = function () {
      if (this.l === 0) { return doneEnumerator; }
      if (this.l > 0) { this.l--; }
      return { done: false, value: this.v };
    };

    return RepeatEnumerable;
  }(Enumerable));

  var enumerableRepeat = Enumerable.repeat = function (value, repeatCount) {
    return new RepeatEnumerable(value, repeatCount);
  };

  var OfEnumerable = (function(__super__) {
    inherits(OfEnumerable, __super__);
    function OfEnumerable(s, fn, thisArg) {
      this.s = s;
      this.fn = fn ? bindCallback(fn, thisArg, 3) : null;
    }
    OfEnumerable.prototype[$iterator$] = function () {
      return new OfEnumerator(this);
    };

    function OfEnumerator(p) {
      this.i = -1;
      this.s = p.s;
      this.l = this.s.length;
      this.fn = p.fn;
    }

    OfEnumerator.prototype.next = function () {
     return ++this.i < this.l ?
       { done: false, value: !this.fn ? this.s[this.i] : this.fn(this.s[this.i], this.i, this.s) } :
       doneEnumerator;
    };

    return OfEnumerable;
  }(Enumerable));

  var enumerableOf = Enumerable.of = function (source, selector, thisArg) {
    return new OfEnumerable(source, selector, thisArg);
  };

var ObserveOnObservable = (function (__super__) {
  inherits(ObserveOnObservable, __super__);
  function ObserveOnObservable(source, s) {
    this.source = source;
    this._s = s;
    __super__.call(this);
  }

  ObserveOnObservable.prototype.subscribeCore = function (o) {
    return this.source.subscribe(new ObserveOnObserver(this._s, o));
  };

  return ObserveOnObservable;
}(ObservableBase));

   /**
   *  Wraps the source sequence in order to run its observer callbacks on the specified scheduler.
   *
   *  This only invokes observer callbacks on a scheduler. In case the subscription and/or unsubscription actions have side-effects
   *  that require to be run on a scheduler, use subscribeOn.
   *
   *  @param {Scheduler} scheduler Scheduler to notify observers on.
   *  @returns {Observable} The source sequence whose observations happen on the specified scheduler.
   */
  observableProto.observeOn = function (scheduler) {
    return new ObserveOnObservable(this, scheduler);
  };

  var SubscribeOnObservable = (function (__super__) {
    inherits(SubscribeOnObservable, __super__);
    function SubscribeOnObservable(source, s) {
      this.source = source;
      this._s = s;
      __super__.call(this);
    }

    function scheduleMethod(scheduler, state) {
      var source = state[0], d = state[1], o = state[2];
      d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(o)));
    }

    SubscribeOnObservable.prototype.subscribeCore = function (o) {
      var m = new SingleAssignmentDisposable(), d = new SerialDisposable();
      d.setDisposable(m);
      m.setDisposable(this._s.schedule([this.source, d, o], scheduleMethod));
      return d;
    };

    return SubscribeOnObservable;
  }(ObservableBase));

   /**
   *  Wraps the source sequence in order to run its subscription and unsubscription logic on the specified scheduler. This operation is not commonly used;
   *  see the remarks section for more information on the distinction between subscribeOn and observeOn.

   *  This only performs the side-effects of subscription and unsubscription on the specified scheduler. In order to invoke observer
   *  callbacks on a scheduler, use observeOn.

   *  @param {Scheduler} scheduler Scheduler to perform subscription and unsubscription actions on.
   *  @returns {Observable} The source sequence whose subscriptions and unsubscriptions happen on the specified scheduler.
   */
  observableProto.subscribeOn = function (scheduler) {
    return new SubscribeOnObservable(this, scheduler);
  };

  var FromPromiseObservable = (function(__super__) {
    inherits(FromPromiseObservable, __super__);
    function FromPromiseObservable(p, s) {
      this._p = p;
      this._s = s;
      __super__.call(this);
    }

    function scheduleNext(s, state) {
      var o = state[0], data = state[1];
      o.onNext(data);
      o.onCompleted();
    }

    function scheduleError(s, state) {
      var o = state[0], err = state[1];
      o.onError(err);
    }

    FromPromiseObservable.prototype.subscribeCore = function(o) {
      var sad = new SingleAssignmentDisposable(), self = this, p = this._p;

      if (isFunction(p)) {
        p = tryCatch(p)();
        if (p === errorObj) {
          o.onError(p.e);
          return sad;
        }
      }

      p
        .then(function (data) {
          sad.setDisposable(self._s.schedule([o, data], scheduleNext));
        }, function (err) {
          sad.setDisposable(self._s.schedule([o, err], scheduleError));
        });

      return sad;
    };

    return FromPromiseObservable;
  }(ObservableBase));

  /**
  * Converts a Promise to an Observable sequence
  * @param {Promise} An ES6 Compliant promise.
  * @returns {Observable} An Observable sequence which wraps the existing promise success and failure.
  */
  var observableFromPromise = Observable.fromPromise = function (promise, scheduler) {
    scheduler || (scheduler = defaultScheduler);
    return new FromPromiseObservable(promise, scheduler);
  };

  /*
   * Converts an existing observable sequence to an ES6 Compatible Promise
   * @example
   * var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
   *
   * // With config
   * Rx.config.Promise = RSVP.Promise;
   * var promise = Rx.Observable.return(42).toPromise();
   * @param {Function} [promiseCtor] The constructor of the promise. If not provided, it looks for it in Rx.config.Promise.
   * @returns {Promise} An ES6 compatible promise with the last value from the observable sequence.
   */
  observableProto.toPromise = function (promiseCtor) {
    promiseCtor || (promiseCtor = Rx.config.Promise);
    if (!promiseCtor) { throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise'); }
    var source = this;
    return new promiseCtor(function (resolve, reject) {
      // No cancellation can be done
      var value;
      source.subscribe(function (v) {
        value = v;
      }, reject, function () {
        resolve(value);
      });
    });
  };

  var ToArrayObservable = (function(__super__) {
    inherits(ToArrayObservable, __super__);
    function ToArrayObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    ToArrayObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new InnerObserver(o));
    };

    inherits(InnerObserver, AbstractObserver);
    function InnerObserver(o) {
      this.o = o;
      this.a = [];
      AbstractObserver.call(this);
    }
    
    InnerObserver.prototype.next = function (x) { this.a.push(x); };
    InnerObserver.prototype.error = function (e) { this.o.onError(e);  };
    InnerObserver.prototype.completed = function () { this.o.onNext(this.a); this.o.onCompleted(); };

    return ToArrayObservable;
  }(ObservableBase));

  /**
  * Creates an array from an observable sequence.
  * @returns {Observable} An observable sequence containing a single element with a list containing all the elements of the source sequence.
  */
  observableProto.toArray = function () {
    return new ToArrayObservable(this);
  };

  /**
   *  Creates an observable sequence from a specified subscribe method implementation.
   * @example
   *  var res = Rx.Observable.create(function (observer) { return function () { } );
   *  var res = Rx.Observable.create(function (observer) { return Rx.Disposable.empty; } );
   *  var res = Rx.Observable.create(function (observer) { } );
   * @param {Function} subscribe Implementation of the resulting observable sequence's subscribe method, returning a function that will be wrapped in a Disposable.
   * @returns {Observable} The observable sequence with the specified implementation for the Subscribe method.
   */
  Observable.create = function (subscribe, parent) {
    return new AnonymousObservable(subscribe, parent);
  };

  var Defer = (function(__super__) {
    inherits(Defer, __super__);
    function Defer(factory) {
      this._f = factory;
      __super__.call(this);
    }

    Defer.prototype.subscribeCore = function (o) {
      var result = tryCatch(this._f)();
      if (result === errorObj) { return observableThrow(result.e).subscribe(o);}
      isPromise(result) && (result = observableFromPromise(result));
      return result.subscribe(o);
    };

    return Defer;
  }(ObservableBase));

  /**
   *  Returns an observable sequence that invokes the specified factory function whenever a new observer subscribes.
   *
   * @example
   *  var res = Rx.Observable.defer(function () { return Rx.Observable.fromArray([1,2,3]); });
   * @param {Function} observableFactory Observable factory function to invoke for each observer that subscribes to the resulting sequence or Promise.
   * @returns {Observable} An observable sequence whose observers trigger an invocation of the given observable factory function.
   */
  var observableDefer = Observable.defer = function (observableFactory) {
    return new Defer(observableFactory);
  };

  var EmptyObservable = (function(__super__) {
    inherits(EmptyObservable, __super__);
    function EmptyObservable(scheduler) {
      this.scheduler = scheduler;
      __super__.call(this);
    }

    EmptyObservable.prototype.subscribeCore = function (observer) {
      var sink = new EmptySink(observer, this.scheduler);
      return sink.run();
    };

    function EmptySink(observer, scheduler) {
      this.observer = observer;
      this.scheduler = scheduler;
    }

    function scheduleItem(s, state) {
      state.onCompleted();
      return disposableEmpty;
    }

    EmptySink.prototype.run = function () {
      var state = this.observer;
      return this.scheduler === immediateScheduler ?
        scheduleItem(null, state) :
        this.scheduler.schedule(state, scheduleItem);
    };

    return EmptyObservable;
  }(ObservableBase));

  var EMPTY_OBSERVABLE = new EmptyObservable(immediateScheduler);

  /**
   *  Returns an empty observable sequence, using the specified scheduler to send out the single OnCompleted message.
   *
   * @example
   *  var res = Rx.Observable.empty();
   *  var res = Rx.Observable.empty(Rx.Scheduler.timeout);
   * @param {Scheduler} [scheduler] Scheduler to send the termination call on.
   * @returns {Observable} An observable sequence with no elements.
   */
  var observableEmpty = Observable.empty = function (scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return scheduler === immediateScheduler ? EMPTY_OBSERVABLE : new EmptyObservable(scheduler);
  };

  var FromObservable = (function(__super__) {
    inherits(FromObservable, __super__);
    function FromObservable(iterable, fn, scheduler) {
      this._iterable = iterable;
      this._fn = fn;
      this._scheduler = scheduler;
      __super__.call(this);
    }

    function createScheduleMethod(o, it, fn) {
      return function loopRecursive(i, recurse) {
        var next = tryCatch(it.next).call(it);
        if (next === errorObj) { return o.onError(next.e); }
        if (next.done) { return o.onCompleted(); }

        var result = next.value;

        if (isFunction(fn)) {
          result = tryCatch(fn)(result, i);
          if (result === errorObj) { return o.onError(result.e); }
        }

        o.onNext(result);
        recurse(i + 1);
      };
    }

    FromObservable.prototype.subscribeCore = function (o) {
      var list = Object(this._iterable),
          it = getIterable(list);

      return this._scheduler.scheduleRecursive(0, createScheduleMethod(o, it, this._fn));
    };

    return FromObservable;
  }(ObservableBase));

  var maxSafeInteger = Math.pow(2, 53) - 1;

  function StringIterable(s) {
    this._s = s;
  }

  StringIterable.prototype[$iterator$] = function () {
    return new StringIterator(this._s);
  };

  function StringIterator(s) {
    this._s = s;
    this._l = s.length;
    this._i = 0;
  }

  StringIterator.prototype[$iterator$] = function () {
    return this;
  };

  StringIterator.prototype.next = function () {
    return this._i < this._l ? { done: false, value: this._s.charAt(this._i++) } : doneEnumerator;
  };

  function ArrayIterable(a) {
    this._a = a;
  }

  ArrayIterable.prototype[$iterator$] = function () {
    return new ArrayIterator(this._a);
  };

  function ArrayIterator(a) {
    this._a = a;
    this._l = toLength(a);
    this._i = 0;
  }

  ArrayIterator.prototype[$iterator$] = function () {
    return this;
  };

  ArrayIterator.prototype.next = function () {
    return this._i < this._l ? { done: false, value: this._a[this._i++] } : doneEnumerator;
  };

  function numberIsFinite(value) {
    return typeof value === 'number' && root.isFinite(value);
  }

  function isNan(n) {
    return n !== n;
  }

  function getIterable(o) {
    var i = o[$iterator$], it;
    if (!i && typeof o === 'string') {
      it = new StringIterable(o);
      return it[$iterator$]();
    }
    if (!i && o.length !== undefined) {
      it = new ArrayIterable(o);
      return it[$iterator$]();
    }
    if (!i) { throw new TypeError('Object is not iterable'); }
    return o[$iterator$]();
  }

  function sign(value) {
    var number = +value;
    if (number === 0) { return number; }
    if (isNaN(number)) { return number; }
    return number < 0 ? -1 : 1;
  }

  function toLength(o) {
    var len = +o.length;
    if (isNaN(len)) { return 0; }
    if (len === 0 || !numberIsFinite(len)) { return len; }
    len = sign(len) * Math.floor(Math.abs(len));
    if (len <= 0) { return 0; }
    if (len > maxSafeInteger) { return maxSafeInteger; }
    return len;
  }

  /**
  * This method creates a new Observable sequence from an array-like or iterable object.
  * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
  * @param {Function} [mapFn] Map function to call on every element of the array.
  * @param {Any} [thisArg] The context to use calling the mapFn if provided.
  * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
  */
  var observableFrom = Observable.from = function (iterable, mapFn, thisArg, scheduler) {
    if (iterable == null) {
      throw new Error('iterable cannot be null.')
    }
    if (mapFn && !isFunction(mapFn)) {
      throw new Error('mapFn when provided must be a function');
    }
    if (mapFn) {
      var mapper = bindCallback(mapFn, thisArg, 2);
    }
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromObservable(iterable, mapper, scheduler);
  }

  var FromArrayObservable = (function(__super__) {
    inherits(FromArrayObservable, __super__);
    function FromArrayObservable(args, scheduler) {
      this._args = args;
      this._scheduler = scheduler;
      __super__.call(this);
    }

    function scheduleMethod(o, args) {
      var len = args.length;
      return function loopRecursive (i, recurse) {
        if (i < len) {
          o.onNext(args[i]);
          recurse(i + 1);
        } else {
          o.onCompleted();
        }
      };
    }

    FromArrayObservable.prototype.subscribeCore = function (o) {
      return this._scheduler.scheduleRecursive(0, scheduleMethod(o, this._args));
    };

    return FromArrayObservable;
  }(ObservableBase));

  /**
  *  Converts an array to an observable sequence, using an optional scheduler to enumerate the array.
  * @deprecated use Observable.from or Observable.of
  * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
  * @returns {Observable} The observable sequence whose elements are pulled from the given enumerable sequence.
  */
  var observableFromArray = Observable.fromArray = function (array, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromArrayObservable(array, scheduler)
  };

  var GenerateObservable = (function (__super__) {
    inherits(GenerateObservable, __super__);
    function GenerateObservable(state, cndFn, itrFn, resFn, s) {
      this._initialState = state;
      this._cndFn = cndFn;
      this._itrFn = itrFn;
      this._resFn = resFn;
      this._s = s;
      __super__.call(this);
    }

    function scheduleRecursive(state, recurse) {
      if (state.first) {
        state.first = false;
      } else {
        state.newState = tryCatch(state.self._itrFn)(state.newState);
        if (state.newState === errorObj) { return state.o.onError(state.newState.e); }
      }
      var hasResult = tryCatch(state.self._cndFn)(state.newState);
      if (hasResult === errorObj) { return state.o.onError(hasResult.e); }
      if (hasResult) {
        var result = tryCatch(state.self._resFn)(state.newState);
        if (result === errorObj) { return state.o.onError(result.e); }
        state.o.onNext(result);
        recurse(state);
      } else {
        state.o.onCompleted();
      }
    }

    GenerateObservable.prototype.subscribeCore = function (o) {
      var state = {
        o: o,
        self: this,
        first: true,
        newState: this._initialState
      };
      return this._s.scheduleRecursive(state, scheduleRecursive);
    };

    return GenerateObservable;
  }(ObservableBase));

  /**
   *  Generates an observable sequence by running a state-driven loop producing the sequence's elements, using the specified scheduler to send out observer messages.
   *
   * @example
   *  var res = Rx.Observable.generate(0, function (x) { return x < 10; }, function (x) { return x + 1; }, function (x) { return x; });
   *  var res = Rx.Observable.generate(0, function (x) { return x < 10; }, function (x) { return x + 1; }, function (x) { return x; }, Rx.Scheduler.timeout);
   * @param {Mixed} initialState Initial state.
   * @param {Function} condition Condition to terminate generation (upon returning false).
   * @param {Function} iterate Iteration step function.
   * @param {Function} resultSelector Selector function for results produced in the sequence.
   * @param {Scheduler} [scheduler] Scheduler on which to run the generator loop. If not provided, defaults to Scheduler.currentThread.
   * @returns {Observable} The generated sequence.
   */
  Observable.generate = function (initialState, condition, iterate, resultSelector, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new GenerateObservable(initialState, condition, iterate, resultSelector, scheduler);
  };

  function observableOf (scheduler, array) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromArrayObservable(array, scheduler);
  }

  /**
  *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
  * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
  */
  Observable.of = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return new FromArrayObservable(args, currentThreadScheduler);
  };

  /**
  *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
  * @param {Scheduler} scheduler A scheduler to use for scheduling the arguments.
  * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
  */
  Observable.ofWithScheduler = function (scheduler) {
    var len = arguments.length, args = new Array(len - 1);
    for(var i = 1; i < len; i++) { args[i - 1] = arguments[i]; }
    return new FromArrayObservable(args, scheduler);
  };

  /**
   * Creates an Observable sequence from changes to an array using Array.observe.
   * @param {Array} array An array to observe changes.
   * @returns {Observable} An observable sequence containing changes to an array from Array.observe.
   */
  Observable.ofArrayChanges = function(array) {
    if (!Array.isArray(array)) { throw new TypeError('Array.observe only accepts arrays.'); }
    if (typeof Array.observe !== 'function' && typeof Array.unobserve !== 'function') { throw new TypeError('Array.observe is not supported on your platform') }
    return new AnonymousObservable(function(observer) {
      function observerFn(changes) {
        for(var i = 0, len = changes.length; i < len; i++) {
          observer.onNext(changes[i]);
        }
      }
      
      Array.observe(array, observerFn);

      return function () {
        Array.unobserve(array, observerFn);
      };
    });
  };

  /**
   * Creates an Observable sequence from changes to an object using Object.observe.
   * @param {Object} obj An object to observe changes.
   * @returns {Observable} An observable sequence containing changes to an object from Object.observe.
   */
  Observable.ofObjectChanges = function(obj) {
    if (obj == null) { throw new TypeError('object must not be null or undefined.'); }
    if (typeof Object.observe !== 'function' && typeof Object.unobserve !== 'function') { throw new TypeError('Object.observe is not supported on your platform') }
    return new AnonymousObservable(function(observer) {
      function observerFn(changes) {
        for(var i = 0, len = changes.length; i < len; i++) {
          observer.onNext(changes[i]);
        }
      }

      Object.observe(obj, observerFn);

      return function () {
        Object.unobserve(obj, observerFn);
      };
    });
  };

  var NeverObservable = (function(__super__) {
    inherits(NeverObservable, __super__);
    function NeverObservable() {
      __super__.call(this);
    }

    NeverObservable.prototype.subscribeCore = function (observer) {
      return disposableEmpty;
    };

    return NeverObservable;
  }(ObservableBase));

  var NEVER_OBSERVABLE = new NeverObservable();

  /**
   * Returns a non-terminating observable sequence, which can be used to denote an infinite duration (e.g. when using reactive joins).
   * @returns {Observable} An observable sequence whose observers will never get called.
   */
  var observableNever = Observable.never = function () {
    return NEVER_OBSERVABLE;
  };

  var PairsObservable = (function(__super__) {
    inherits(PairsObservable, __super__);
    function PairsObservable(o, scheduler) {
      this._o = o;
      this._keys = Object.keys(o);
      this._scheduler = scheduler;
      __super__.call(this);
    }

    function scheduleMethod(o, obj, keys) {
      return function loopRecursive(i, recurse) {
        if (i < keys.length) {
          var key = keys[i];
          o.onNext([key, obj[key]]);
          recurse(i + 1);
        } else {
          o.onCompleted();
        }
      };
    }

    PairsObservable.prototype.subscribeCore = function (o) {
      return this._scheduler.scheduleRecursive(0, scheduleMethod(o, this._o, this._keys));
    };

    return PairsObservable;
  }(ObservableBase));

  /**
   * Convert an object into an observable sequence of [key, value] pairs.
   * @param {Object} obj The object to inspect.
   * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
   * @returns {Observable} An observable sequence of [key, value] pairs from the object.
   */
  Observable.pairs = function (obj, scheduler) {
    scheduler || (scheduler = currentThreadScheduler);
    return new PairsObservable(obj, scheduler);
  };

    var RangeObservable = (function(__super__) {
    inherits(RangeObservable, __super__);
    function RangeObservable(start, count, scheduler) {
      this.start = start;
      this.rangeCount = count;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    function loopRecursive(start, count, o) {
      return function loop (i, recurse) {
        if (i < count) {
          o.onNext(start + i);
          recurse(i + 1);
        } else {
          o.onCompleted();
        }
      };
    }

    RangeObservable.prototype.subscribeCore = function (o) {
      return this.scheduler.scheduleRecursive(
        0,
        loopRecursive(this.start, this.rangeCount, o)
      );
    };

    return RangeObservable;
  }(ObservableBase));

  /**
  *  Generates an observable sequence of integral numbers within a specified range, using the specified scheduler to send out observer messages.
  * @param {Number} start The value of the first integer in the sequence.
  * @param {Number} count The number of sequential integers to generate.
  * @param {Scheduler} [scheduler] Scheduler to run the generator loop on. If not specified, defaults to Scheduler.currentThread.
  * @returns {Observable} An observable sequence that contains a range of sequential integral numbers.
  */
  Observable.range = function (start, count, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new RangeObservable(start, count, scheduler);
  };

  var RepeatObservable = (function(__super__) {
    inherits(RepeatObservable, __super__);
    function RepeatObservable(value, repeatCount, scheduler) {
      this.value = value;
      this.repeatCount = repeatCount == null ? -1 : repeatCount;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    RepeatObservable.prototype.subscribeCore = function (observer) {
      var sink = new RepeatSink(observer, this);
      return sink.run();
    };

    return RepeatObservable;
  }(ObservableBase));

  function RepeatSink(observer, parent) {
    this.observer = observer;
    this.parent = parent;
  }

  RepeatSink.prototype.run = function () {
    var observer = this.observer, value = this.parent.value;
    function loopRecursive(i, recurse) {
      if (i === -1 || i > 0) {
        observer.onNext(value);
        i > 0 && i--;
      }
      if (i === 0) { return observer.onCompleted(); }
      recurse(i);
    }

    return this.parent.scheduler.scheduleRecursive(this.parent.repeatCount, loopRecursive);
  };

  /**
   *  Generates an observable sequence that repeats the given element the specified number of times, using the specified scheduler to send out observer messages.
   * @param {Mixed} value Element to repeat.
   * @param {Number} repeatCount [Optiona] Number of times to repeat the element. If not specified, repeats indefinitely.
   * @param {Scheduler} scheduler Scheduler to run the producer loop on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} An observable sequence that repeats the given element the specified number of times.
   */
  Observable.repeat = function (value, repeatCount, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new RepeatObservable(value, repeatCount, scheduler);
  };

  var JustObservable = (function(__super__) {
    inherits(JustObservable, __super__);
    function JustObservable(value, scheduler) {
      this._value = value;
      this._scheduler = scheduler;
      __super__.call(this);
    }

    JustObservable.prototype.subscribeCore = function (o) {
      var state = [this._value, o];
      return this._scheduler === immediateScheduler ?
        scheduleItem(null, state) :
        this._scheduler.schedule(state, scheduleItem);
    };

    function scheduleItem(s, state) {
      var value = state[0], observer = state[1];
      observer.onNext(value);
      observer.onCompleted();
      return disposableEmpty;
    }

    return JustObservable;
  }(ObservableBase));

  /**
   *  Returns an observable sequence that contains a single element, using the specified scheduler to send out observer messages.
   *  There is an alias called 'just' or browsers <IE9.
   * @param {Mixed} value Single element in the resulting observable sequence.
   * @param {Scheduler} scheduler Scheduler to send the single element on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} An observable sequence containing the single specified element.
   */
  var observableReturn = Observable['return'] = Observable.just = function (value, scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return new JustObservable(value, scheduler);
  };

  var ThrowObservable = (function(__super__) {
    inherits(ThrowObservable, __super__);
    function ThrowObservable(error, scheduler) {
      this._error = error;
      this._scheduler = scheduler;
      __super__.call(this);
    }

    ThrowObservable.prototype.subscribeCore = function (o) {
      var state = [this._error, o];
      return this._scheduler === immediateScheduler ?
        scheduleItem(null, state) :
        this._scheduler.schedule(state, scheduleItem);
    };

    function scheduleItem(s, state) {
      var e = state[0], o = state[1];
      o.onError(e);
      return disposableEmpty;
    }

    return ThrowObservable;
  }(ObservableBase));

  /**
   *  Returns an observable sequence that terminates with an exception, using the specified scheduler to send out the single onError message.
   *  There is an alias to this method called 'throwError' for browsers <IE9.
   * @param {Mixed} error An object used for the sequence's termination.
   * @param {Scheduler} scheduler Scheduler to send the exceptional termination call on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} The observable sequence that terminates exceptionally with the specified exception object.
   */
  var observableThrow = Observable['throw'] = function (error, scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return new ThrowObservable(error, scheduler);
  };

  var UsingObservable = (function (__super__) {
    inherits(UsingObservable, __super__);
    function UsingObservable(resFn, obsFn) {
      this._resFn = resFn;
      this._obsFn = obsFn;
      __super__.call(this);
    }

    UsingObservable.prototype.subscribeCore = function (o) {
      var disposable = disposableEmpty;
      var resource = tryCatch(this._resFn)();
      if (resource === errorObj) {
        return new BinaryDisposable(observableThrow(resource.e).subscribe(o), disposable);
      }
      resource && (disposable = resource);
      var source = tryCatch(this._obsFn)(resource);
      if (source === errorObj) {
        return new BinaryDisposable(observableThrow(source.e).subscribe(o), disposable);
      }
      return new BinaryDisposable(source.subscribe(o), disposable);
    };

    return UsingObservable;
  }(ObservableBase));

  /**
   * Constructs an observable sequence that depends on a resource object, whose lifetime is tied to the resulting observable sequence's lifetime.
   * @param {Function} resourceFactory Factory function to obtain a resource object.
   * @param {Function} observableFactory Factory function to obtain an observable sequence that depends on the obtained resource.
   * @returns {Observable} An observable sequence whose lifetime controls the lifetime of the dependent resource object.
   */
  Observable.using = function (resourceFactory, observableFactory) {
    return new UsingObservable(resourceFactory, observableFactory);
  };

  /**
   * Propagates the observable sequence or Promise that reacts first.
   * @param {Observable} rightSource Second observable sequence or Promise.
   * @returns {Observable} {Observable} An observable sequence that surfaces either of the given sequences, whichever reacted first.
   */
  observableProto.amb = function (rightSource) {
    var leftSource = this;
    return new AnonymousObservable(function (observer) {
      var choice,
        leftChoice = 'L', rightChoice = 'R',
        leftSubscription = new SingleAssignmentDisposable(),
        rightSubscription = new SingleAssignmentDisposable();

      isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));

      function choiceL() {
        if (!choice) {
          choice = leftChoice;
          rightSubscription.dispose();
        }
      }

      function choiceR() {
        if (!choice) {
          choice = rightChoice;
          leftSubscription.dispose();
        }
      }

      var leftSubscribe = observerCreate(
        function (left) {
          choiceL();
          choice === leftChoice && observer.onNext(left);
        },
        function (e) {
          choiceL();
          choice === leftChoice && observer.onError(e);
        },
        function () {
          choiceL();
          choice === leftChoice && observer.onCompleted();
        }
      );
      var rightSubscribe = observerCreate(
        function (right) {
          choiceR();
          choice === rightChoice && observer.onNext(right);
        },
        function (e) {
          choiceR();
          choice === rightChoice && observer.onError(e);
        },
        function () {
          choiceR();
          choice === rightChoice && observer.onCompleted();
        }
      );

      leftSubscription.setDisposable(leftSource.subscribe(leftSubscribe));
      rightSubscription.setDisposable(rightSource.subscribe(rightSubscribe));

      return new BinaryDisposable(leftSubscription, rightSubscription);
    });
  };

  function amb(p, c) { return p.amb(c); }

  /**
   * Propagates the observable sequence or Promise that reacts first.
   * @returns {Observable} An observable sequence that surfaces any of the given sequences, whichever reacted first.
   */
  Observable.amb = function () {
    var acc = observableNever(), items;
    if (Array.isArray(arguments[0])) {
      items = arguments[0];
    } else {
      var len = arguments.length;
      items = new Array(items);
      for(var i = 0; i < len; i++) { items[i] = arguments[i]; }
    }
    for (var i = 0, len = items.length; i < len; i++) {
      acc = amb(acc, items[i]);
    }
    return acc;
  };

  var CatchObservable = (function (__super__) {
    inherits(CatchObservable, __super__);
    function CatchObservable(source, fn) {
      this.source = source;
      this._fn = fn;
      __super__.call(this);
    }

    CatchObservable.prototype.subscribeCore = function (o) {
      var d1 = new SingleAssignmentDisposable(), subscription = new SerialDisposable();
      subscription.setDisposable(d1);
      d1.setDisposable(this.source.subscribe(new CatchObserver(o, subscription, this._fn)));
      return subscription;
    };

    return CatchObservable;
  }(ObservableBase));

  var CatchObserver = (function(__super__) {
    inherits(CatchObserver, __super__);
    function CatchObserver(o, s, fn) {
      this._o = o;
      this._s = s;
      this._fn = fn;
      __super__.call(this);
    }

    CatchObserver.prototype.next = function (x) { this._o.onNext(x); };
    CatchObserver.prototype.completed = function () { return this._o.onCompleted(); };
    CatchObserver.prototype.error = function (e) {
      var result = tryCatch(this._fn)(e);
      if (result === errorObj) { return this._o.onError(result.e); }
      isPromise(result) && (result = observableFromPromise(result));

      var d = new SingleAssignmentDisposable();
      this._s.setDisposable(d);
      d.setDisposable(result.subscribe(this._o));
    };

    return CatchObserver;
  }(AbstractObserver));

  /**
   * Continues an observable sequence that is terminated by an exception with the next observable sequence.
   * @param {Mixed} handlerOrSecond Exception handler function that returns an observable sequence given the error that occurred in the first sequence, or a second observable sequence used to produce results when an error occurred in the first sequence.
   * @returns {Observable} An observable sequence containing the first sequence's elements, followed by the elements of the handler sequence in case an exception occurred.
   */
  observableProto['catch'] = function (handlerOrSecond) {
    return isFunction(handlerOrSecond) ? new CatchObservable(this, handlerOrSecond) : observableCatch([this, handlerOrSecond]);
  };

  /**
   * Continues an observable sequence that is terminated by an exception with the next observable sequence.
   * @param {Array | Arguments} args Arguments or an array to use as the next sequence if an error occurs.
   * @returns {Observable} An observable sequence containing elements from consecutive source sequences until a source sequence terminates successfully.
   */
  var observableCatch = Observable['catch'] = function () {
    var items;
    if (Array.isArray(arguments[0])) {
      items = arguments[0];
    } else {
      var len = arguments.length;
      items = new Array(len);
      for(var i = 0; i < len; i++) { items[i] = arguments[i]; }
    }
    return enumerableOf(items).catchError();
  };

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
   * This can be in the form of an argument list of observables or an array.
   *
   * @example
   * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
   * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  observableProto.combineLatest = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    if (Array.isArray(args[0])) {
      args[0].unshift(this);
    } else {
      args.unshift(this);
    }
    return combineLatest.apply(this, args);
  };

  function falseFactory() { return false; }
  function argumentsToArray() {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return args;
  }

  var CombineLatestObservable = (function(__super__) {
    inherits(CombineLatestObservable, __super__);
    function CombineLatestObservable(params, cb) {
      this._params = params;
      this._cb = cb;
      __super__.call(this);
    }

    CombineLatestObservable.prototype.subscribeCore = function(observer) {
      var len = this._params.length,
          subscriptions = new Array(len);

      var state = {
        hasValue: arrayInitialize(len, falseFactory),
        hasValueAll: false,
        isDone: arrayInitialize(len, falseFactory),
        values: new Array(len)
      };

      for (var i = 0; i < len; i++) {
        var source = this._params[i], sad = new SingleAssignmentDisposable();
        subscriptions[i] = sad;
        isPromise(source) && (source = observableFromPromise(source));
        sad.setDisposable(source.subscribe(new CombineLatestObserver(observer, i, this._cb, state)));
      }

      return new NAryDisposable(subscriptions);
    };

    return CombineLatestObservable;
  }(ObservableBase));

  var CombineLatestObserver = (function (__super__) {
    inherits(CombineLatestObserver, __super__);
    function CombineLatestObserver(o, i, cb, state) {
      this._o = o;
      this._i = i;
      this._cb = cb;
      this._state = state;
      __super__.call(this);
    }

    function notTheSame(i) {
      return function (x, j) {
        return j !== i;
      };
    }

    CombineLatestObserver.prototype.next = function (x) {
      this._state.values[this._i] = x;
      this._state.hasValue[this._i] = true;
      if (this._state.hasValueAll || (this._state.hasValueAll = this._state.hasValue.every(identity))) {
        var res = tryCatch(this._cb).apply(null, this._state.values);
        if (res === errorObj) { return this._o.onError(res.e); }
        this._o.onNext(res);
      } else if (this._state.isDone.filter(notTheSame(this._i)).every(identity)) {
        this._o.onCompleted();
      }
    };

    CombineLatestObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    CombineLatestObserver.prototype.completed = function () {
      this._state.isDone[this._i] = true;
      this._state.isDone.every(identity) && this._o.onCompleted();
    };

    return CombineLatestObserver;
  }(AbstractObserver));

  /**
  * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
  *
  * @example
  * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
  * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
  * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
  */
  var combineLatest = Observable.combineLatest = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
    Array.isArray(args[0]) && (args = args[0]);
    return new CombineLatestObservable(args, resultSelector);
  };

  /**
   * Concatenates all the observable sequences.  This takes in either an array or variable arguments to concatenate.
   * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
   */
  observableProto.concat = function () {
    for(var args = [], i = 0, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
    args.unshift(this);
    return observableConcat.apply(null, args);
  };

  var ConcatObserver = (function(__super__) {
    inherits(ConcatObserver, __super__);
    function ConcatObserver(s, fn) {
      this._s = s;
      this._fn = fn;
      __super__.call(this);
    }

    ConcatObserver.prototype.next = function (x) { this._s.o.onNext(x); };
    ConcatObserver.prototype.error = function (e) { this._s.o.onError(e); };
    ConcatObserver.prototype.completed = function () { this._s.i++; this._fn(this._s); };

    return ConcatObserver;
  }(AbstractObserver));

  var ConcatObservable = (function(__super__) {
    inherits(ConcatObservable, __super__);
    function ConcatObservable(sources) {
      this._sources = sources;
      __super__.call(this);
    }

    function scheduleRecursive (state, recurse) {
      if (state.disposable.isDisposed) { return; }
      if (state.i === state.sources.length) { return state.o.onCompleted(); }

      // Check if promise
      var currentValue = state.sources[state.i];
      isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

      var d = new SingleAssignmentDisposable();
      state.subscription.setDisposable(d);
      d.setDisposable(currentValue.subscribe(new ConcatObserver(state, recurse)));
    }

    ConcatObservable.prototype.subscribeCore = function(o) {
      var subscription = new SerialDisposable();
      var disposable = disposableCreate(noop);
      var state = {
        o: o,
        i: 0,
        subscription: subscription,
        disposable: disposable,
        sources: this._sources
      };

      var cancelable = immediateScheduler.scheduleRecursive(state, scheduleRecursive);
      return new NAryDisposable([subscription, disposable, cancelable]);
    };

    return ConcatObservable;
  }(ObservableBase));

  /**
   * Concatenates all the observable sequences.
   * @param {Array | Arguments} args Arguments or an array to concat to the observable sequence.
   * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
   */
  var observableConcat = Observable.concat = function () {
    var args;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
    } else {
      args = new Array(arguments.length);
      for(var i = 0, len = arguments.length; i < len; i++) { args[i] = arguments[i]; }
    }
    return new ConcatObservable(args);
  };

  /**
   * Concatenates an observable sequence of observable sequences.
   * @returns {Observable} An observable sequence that contains the elements of each observed inner sequence, in sequential order.
   */
  observableProto.concatAll = function () {
    return this.merge(1);
  };

  var MergeObservable = (function (__super__) {
    inherits(MergeObservable, __super__);

    function MergeObservable(source, maxConcurrent) {
      this.source = source;
      this.maxConcurrent = maxConcurrent;
      __super__.call(this);
    }

    MergeObservable.prototype.subscribeCore = function(observer) {
      var g = new CompositeDisposable();
      g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
      return g;
    };

    return MergeObservable;

  }(ObservableBase));

  var MergeObserver = (function (__super__) {
    function MergeObserver(o, max, g) {
      this.o = o;
      this.max = max;
      this.g = g;
      this.done = false;
      this.q = [];
      this.activeCount = 0;
      __super__.call(this);
    }

    inherits(MergeObserver, __super__);

    MergeObserver.prototype.handleSubscribe = function (xs) {
      var sad = new SingleAssignmentDisposable();
      this.g.add(sad);
      isPromise(xs) && (xs = observableFromPromise(xs));
      sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
    };

    MergeObserver.prototype.next = function (innerSource) {
      if(this.activeCount < this.max) {
        this.activeCount++;
        this.handleSubscribe(innerSource);
      } else {
        this.q.push(innerSource);
      }
    };
    MergeObserver.prototype.error = function (e) { this.o.onError(e); };
    MergeObserver.prototype.completed = function () { this.done = true; this.activeCount === 0 && this.o.onCompleted(); };

    function InnerObserver(parent, sad) {
      this.parent = parent;
      this.sad = sad;
      __super__.call(this);
    }

    inherits(InnerObserver, __super__);

    InnerObserver.prototype.next = function (x) { this.parent.o.onNext(x); };
    InnerObserver.prototype.error = function (e) { this.parent.o.onError(e); };
    InnerObserver.prototype.completed = function () {
      this.parent.g.remove(this.sad);
      if (this.parent.q.length > 0) {
        this.parent.handleSubscribe(this.parent.q.shift());
      } else {
        this.parent.activeCount--;
        this.parent.done && this.parent.activeCount === 0 && this.parent.o.onCompleted();
      }
    };

    return MergeObserver;
  }(AbstractObserver));

  /**
  * Merges an observable sequence of observable sequences into an observable sequence, limiting the number of concurrent subscriptions to inner sequences.
  * Or merges two observable sequences into a single observable sequence.
  * @param {Mixed} [maxConcurrentOrOther] Maximum number of inner observable sequences being subscribed to concurrently or the second observable sequence.
  * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
  */
  observableProto.merge = function (maxConcurrentOrOther) {
    return typeof maxConcurrentOrOther !== 'number' ?
      observableMerge(this, maxConcurrentOrOther) :
      new MergeObservable(this, maxConcurrentOrOther);
  };

  /**
   * Merges all the observable sequences into a single observable sequence.
   * The scheduler is optional and if not specified, the immediate scheduler is used.
   * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
   */
  var observableMerge = Observable.merge = function () {
    var scheduler, sources = [], i, len = arguments.length;
    if (!arguments[0]) {
      scheduler = immediateScheduler;
      for(i = 1; i < len; i++) { sources.push(arguments[i]); }
    } else if (isScheduler(arguments[0])) {
      scheduler = arguments[0];
      for(i = 1; i < len; i++) { sources.push(arguments[i]); }
    } else {
      scheduler = immediateScheduler;
      for(i = 0; i < len; i++) { sources.push(arguments[i]); }
    }
    if (Array.isArray(sources[0])) {
      sources = sources[0];
    }
    return observableOf(scheduler, sources).mergeAll();
  };

  var MergeAllObservable = (function (__super__) {
    inherits(MergeAllObservable, __super__);

    function MergeAllObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    MergeAllObservable.prototype.subscribeCore = function (o) {
      var g = new CompositeDisposable(), m = new SingleAssignmentDisposable();
      g.add(m);
      m.setDisposable(this.source.subscribe(new MergeAllObserver(o, g)));
      return g;
    };

    return MergeAllObservable;
  }(ObservableBase));

  var MergeAllObserver = (function (__super__) {
    function MergeAllObserver(o, g) {
      this.o = o;
      this.g = g;
      this.done = false;
      __super__.call(this);
    }

    inherits(MergeAllObserver, __super__);

    MergeAllObserver.prototype.next = function(innerSource) {
      var sad = new SingleAssignmentDisposable();
      this.g.add(sad);
      isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
      sad.setDisposable(innerSource.subscribe(new InnerObserver(this, sad)));
    };

    MergeAllObserver.prototype.error = function (e) {
      this.o.onError(e);
    };

    MergeAllObserver.prototype.completed = function () {
      this.done = true;
      this.g.length === 1 && this.o.onCompleted();
    };

    function InnerObserver(parent, sad) {
      this.parent = parent;
      this.sad = sad;
      __super__.call(this);
    }

    inherits(InnerObserver, __super__);

    InnerObserver.prototype.next = function (x) {
      this.parent.o.onNext(x);
    };
    InnerObserver.prototype.error = function (e) {
      this.parent.o.onError(e);
    };
    InnerObserver.prototype.completed = function () {
      this.parent.g.remove(this.sad);
      this.parent.done && this.parent.g.length === 1 && this.parent.o.onCompleted();
    };

    return MergeAllObserver;
  }(AbstractObserver));

  /**
  * Merges an observable sequence of observable sequences into an observable sequence.
  * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
  */
  observableProto.mergeAll = function () {
    return new MergeAllObservable(this);
  };

  var CompositeError = Rx.CompositeError = function(errors) {
    this.innerErrors = errors;
    this.message = 'This contains multiple errors. Check the innerErrors';
    Error.call(this);
  };
  CompositeError.prototype = Object.create(Error.prototype);
  CompositeError.prototype.name = 'CompositeError';

  var MergeDelayErrorObservable = (function(__super__) {
    inherits(MergeDelayErrorObservable, __super__);
    function MergeDelayErrorObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    MergeDelayErrorObservable.prototype.subscribeCore = function (o) {
      var group = new CompositeDisposable(),
        m = new SingleAssignmentDisposable(),
        state = { isStopped: false, errors: [], o: o };

      group.add(m);
      m.setDisposable(this.source.subscribe(new MergeDelayErrorObserver(group, state)));

      return group;
    };

    return MergeDelayErrorObservable;
  }(ObservableBase));

  var MergeDelayErrorObserver = (function(__super__) {
    inherits(MergeDelayErrorObserver, __super__);
    function MergeDelayErrorObserver(group, state) {
      this._group = group;
      this._state = state;
      __super__.call(this);
    }

    function setCompletion(o, errors) {
      if (errors.length === 0) {
        o.onCompleted();
      } else if (errors.length === 1) {
        o.onError(errors[0]);
      } else {
        o.onError(new CompositeError(errors));
      }
    }

    MergeDelayErrorObserver.prototype.next = function (x) {
      var inner = new SingleAssignmentDisposable();
      this._group.add(inner);

      // Check for promises support
      isPromise(x) && (x = observableFromPromise(x));
      inner.setDisposable(x.subscribe(new InnerObserver(inner, this._group, this._state)));
    };

    MergeDelayErrorObserver.prototype.error = function (e) {
      this._state.errors.push(e);
      this._state.isStopped = true;
      this._group.length === 1 && setCompletion(this._state.o, this._state.errors);
    };

    MergeDelayErrorObserver.prototype.completed = function () {
      this._state.isStopped = true;
      this._group.length === 1 && setCompletion(this._state.o, this._state.errors);
    };

    inherits(InnerObserver, __super__);
    function InnerObserver(inner, group, state) {
      this._inner = inner;
      this._group = group;
      this._state = state;
      __super__.call(this);
    }

    InnerObserver.prototype.next = function (x) { this._state.o.onNext(x); };
    InnerObserver.prototype.error = function (e) {
      this._state.errors.push(e);
      this._group.remove(this._inner);
      this._state.isStopped && this._group.length === 1 && setCompletion(this._state.o, this._state.errors);
    };
    InnerObserver.prototype.completed = function () {
      this._group.remove(this._inner);
      this._state.isStopped && this._group.length === 1 && setCompletion(this._state.o, this._state.errors);
    };

    return MergeDelayErrorObserver;
  }(AbstractObserver));

  /**
  * Flattens an Observable that emits Observables into one Observable, in a way that allows an Observer to
  * receive all successfully emitted items from all of the source Observables without being interrupted by
  * an error notification from one of them.
  *
  * This behaves like Observable.prototype.mergeAll except that if any of the merged Observables notify of an
  * error via the Observer's onError, mergeDelayError will refrain from propagating that
  * error notification until all of the merged Observables have finished emitting items.
  * @param {Array | Arguments} args Arguments or an array to merge.
  * @returns {Observable} an Observable that emits all of the items emitted by the Observables emitted by the Observable
  */
  Observable.mergeDelayError = function() {
    var args;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
    } else {
      var len = arguments.length;
      args = new Array(len);
      for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    }
    var source = observableOf(null, args);
    return new MergeDelayErrorObservable(source);
  };

  /**
   * Continues an observable sequence that is terminated normally or by an exception with the next observable sequence.
   * @param {Observable} second Second observable sequence used to produce results after the first sequence terminates.
   * @returns {Observable} An observable sequence that concatenates the first and second sequence, even if the first sequence terminates exceptionally.
   */
  observableProto.onErrorResumeNext = function (second) {
    if (!second) { throw new Error('Second observable is required'); }
    return onErrorResumeNext([this, second]);
  };

  var OnErrorResumeNextObservable = (function(__super__) {
    inherits(OnErrorResumeNextObservable, __super__);
    function OnErrorResumeNextObservable(sources) {
      this.sources = sources;
      __super__.call(this);
    }

    function scheduleMethod(state, recurse) {
      if (state.pos < state.sources.length) {
        var current = state.sources[state.pos++];
        isPromise(current) && (current = observableFromPromise(current));
        var d = new SingleAssignmentDisposable();
        state.subscription.setDisposable(d);
        d.setDisposable(current.subscribe(new OnErrorResumeNextObserver(state, recurse)));
      } else {
        state.o.onCompleted();
      }
    }

    OnErrorResumeNextObservable.prototype.subscribeCore = function (o) {
      var subscription = new SerialDisposable(),
          state = {pos: 0, subscription: subscription, o: o, sources: this.sources },
          cancellable = immediateScheduler.scheduleRecursive(state, scheduleMethod);

      return new BinaryDisposable(subscription, cancellable);
    };

    return OnErrorResumeNextObservable;
  }(ObservableBase));

  var OnErrorResumeNextObserver = (function(__super__) {
    inherits(OnErrorResumeNextObserver, __super__);
    function OnErrorResumeNextObserver(state, recurse) {
      this._state = state;
      this._recurse = recurse;
      __super__.call(this);
    }

    OnErrorResumeNextObserver.prototype.next = function (x) { this._state.o.onNext(x); };
    OnErrorResumeNextObserver.prototype.error = function () { this._recurse(this._state); };
    OnErrorResumeNextObserver.prototype.completed = function () { this._recurse(this._state); };

    return OnErrorResumeNextObserver;
  }(AbstractObserver));

  /**
   * Continues an observable sequence that is terminated normally or by an exception with the next observable sequence.
   * @returns {Observable} An observable sequence that concatenates the source sequences, even if a sequence terminates exceptionally.
   */
  var onErrorResumeNext = Observable.onErrorResumeNext = function () {
    var sources = [];
    if (Array.isArray(arguments[0])) {
      sources = arguments[0];
    } else {
      var len = arguments.length;
      sources = new Array(len);
      for(var i = 0; i < len; i++) { sources[i] = arguments[i]; }
    }
    return new OnErrorResumeNextObservable(sources);
  };

  var SkipUntilObservable = (function(__super__) {
    inherits(SkipUntilObservable, __super__);

    function SkipUntilObservable(source, other) {
      this._s = source;
      this._o = isPromise(other) ? observableFromPromise(other) : other;
      this._open = false;
      __super__.call(this);
    }

    SkipUntilObservable.prototype.subscribeCore = function(o) {
      var leftSubscription = new SingleAssignmentDisposable();
      leftSubscription.setDisposable(this._s.subscribe(new SkipUntilSourceObserver(o, this)));

      isPromise(this._o) && (this._o = observableFromPromise(this._o));

      var rightSubscription = new SingleAssignmentDisposable();
      rightSubscription.setDisposable(this._o.subscribe(new SkipUntilOtherObserver(o, this, rightSubscription)));

      return new BinaryDisposable(leftSubscription, rightSubscription);
    };

    return SkipUntilObservable;
  }(ObservableBase));

  var SkipUntilSourceObserver = (function(__super__) {
    inherits(SkipUntilSourceObserver, __super__);
    function SkipUntilSourceObserver(o, p) {
      this._o = o;
      this._p = p;
      __super__.call(this);
    }

    SkipUntilSourceObserver.prototype.next = function (x) {
      this._p._open && this._o.onNext(x);
    };

    SkipUntilSourceObserver.prototype.error = function (err) {
      this._o.onError(err);
    };

    SkipUntilSourceObserver.prototype.onCompleted = function () {
      this._p._open && this._o.onCompleted();
    };

    return SkipUntilSourceObserver;
  }(AbstractObserver));

  var SkipUntilOtherObserver = (function(__super__) {
    inherits(SkipUntilOtherObserver, __super__);
    function SkipUntilOtherObserver(o, p, r) {
      this._o = o;
      this._p = p;
      this._r = r;
      __super__.call(this);
    }

    SkipUntilOtherObserver.prototype.next = function () {
      this._p._open = true;
      this._r.dispose();
    };

    SkipUntilOtherObserver.prototype.error = function (err) {
      this._o.onError(err);
    };

    SkipUntilOtherObserver.prototype.onCompleted = function () {
      this._r.dispose();
    };

    return SkipUntilOtherObserver;
  }(AbstractObserver));

  /**
   * Returns the values from the source observable sequence only after the other observable sequence produces a value.
   * @param {Observable | Promise} other The observable sequence or Promise that triggers propagation of elements of the source sequence.
   * @returns {Observable} An observable sequence containing the elements of the source sequence starting from the point the other sequence triggered propagation.
   */
  observableProto.skipUntil = function (other) {
    return new SkipUntilObservable(this, other);
  };

  var SwitchObservable = (function(__super__) {
    inherits(SwitchObservable, __super__);
    function SwitchObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    SwitchObservable.prototype.subscribeCore = function (o) {
      var inner = new SerialDisposable(), s = this.source.subscribe(new SwitchObserver(o, inner));
      return new BinaryDisposable(s, inner);
    };

    inherits(SwitchObserver, AbstractObserver);
    function SwitchObserver(o, inner) {
      this.o = o;
      this.inner = inner;
      this.stopped = false;
      this.latest = 0;
      this.hasLatest = false;
      AbstractObserver.call(this);
    }

    SwitchObserver.prototype.next = function (innerSource) {
      var d = new SingleAssignmentDisposable(), id = ++this.latest;
      this.hasLatest = true;
      this.inner.setDisposable(d);
      isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
      d.setDisposable(innerSource.subscribe(new InnerObserver(this, id)));
    };

    SwitchObserver.prototype.error = function (e) {
      this.o.onError(e);
    };

    SwitchObserver.prototype.completed = function () {
      this.stopped = true;
      !this.hasLatest && this.o.onCompleted();
    };

    inherits(InnerObserver, AbstractObserver);
    function InnerObserver(parent, id) {
      this.parent = parent;
      this.id = id;
      AbstractObserver.call(this);
    }
    InnerObserver.prototype.next = function (x) {
      this.parent.latest === this.id && this.parent.o.onNext(x);
    };

    InnerObserver.prototype.error = function (e) {
      this.parent.latest === this.id && this.parent.o.onError(e);
    };

    InnerObserver.prototype.completed = function () {
      if (this.parent.latest === this.id) {
        this.parent.hasLatest = false;
        this.parent.stopped && this.parent.o.onCompleted();
      }
    };

    return SwitchObservable;
  }(ObservableBase));

  /**
  * Transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
  * @returns {Observable} The observable sequence that at any point in time produces the elements of the most recent inner observable sequence that has been received.
  */
  observableProto['switch'] = observableProto.switchLatest = function () {
    return new SwitchObservable(this);
  };

  var TakeUntilObservable = (function(__super__) {
    inherits(TakeUntilObservable, __super__);

    function TakeUntilObservable(source, other) {
      this.source = source;
      this.other = isPromise(other) ? observableFromPromise(other) : other;
      __super__.call(this);
    }

    TakeUntilObservable.prototype.subscribeCore = function(o) {
      return new BinaryDisposable(
        this.source.subscribe(o),
        this.other.subscribe(new TakeUntilObserver(o))
      );
    };

    return TakeUntilObservable;
  }(ObservableBase));

  var TakeUntilObserver = (function(__super__) {
    inherits(TakeUntilObserver, __super__);
    function TakeUntilObserver(o) {
      this._o = o;
      __super__.call(this);
    }

    TakeUntilObserver.prototype.next = function () {
      this._o.onCompleted();
    };

    TakeUntilObserver.prototype.error = function (err) {
      this._o.onError(err);
    };

    TakeUntilObserver.prototype.onCompleted = noop;

    return TakeUntilObserver;
  }(AbstractObserver));

  /**
   * Returns the values from the source observable sequence until the other observable sequence produces a value.
   * @param {Observable | Promise} other Observable sequence or Promise that terminates propagation of elements of the source sequence.
   * @returns {Observable} An observable sequence containing the elements of the source sequence up to the point the other sequence interrupted further propagation.
   */
  observableProto.takeUntil = function (other) {
    return new TakeUntilObservable(this, other);
  };

  function falseFactory() { return false; }
  function argumentsToArray() {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return args;
  }

  var WithLatestFromObservable = (function(__super__) {
    inherits(WithLatestFromObservable, __super__);
    function WithLatestFromObservable(source, sources, resultSelector) {
      this._s = source;
      this._ss = sources;
      this._cb = resultSelector;
      __super__.call(this);
    }

    WithLatestFromObservable.prototype.subscribeCore = function (o) {
      var len = this._ss.length;
      var state = {
        hasValue: arrayInitialize(len, falseFactory),
        hasValueAll: false,
        values: new Array(len)
      };

      var n = this._ss.length, subscriptions = new Array(n + 1);
      for (var i = 0; i < n; i++) {
        var other = this._ss[i], sad = new SingleAssignmentDisposable();
        isPromise(other) && (other = observableFromPromise(other));
        sad.setDisposable(other.subscribe(new WithLatestFromOtherObserver(o, i, state)));
        subscriptions[i] = sad;
      }

      var outerSad = new SingleAssignmentDisposable();
      outerSad.setDisposable(this._s.subscribe(new WithLatestFromSourceObserver(o, this._cb, state)));
      subscriptions[n] = outerSad;

      return new NAryDisposable(subscriptions);
    };

    return WithLatestFromObservable;
  }(ObservableBase));

  var WithLatestFromOtherObserver = (function (__super__) {
    inherits(WithLatestFromOtherObserver, __super__);
    function WithLatestFromOtherObserver(o, i, state) {
      this._o = o;
      this._i = i;
      this._state = state;
      __super__.call(this);
    }

    WithLatestFromOtherObserver.prototype.next = function (x) {
      this._state.values[this._i] = x;
      this._state.hasValue[this._i] = true;
      this._state.hasValueAll = this._state.hasValue.every(identity);
    };

    WithLatestFromOtherObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    WithLatestFromOtherObserver.prototype.completed = noop;

    return WithLatestFromOtherObserver;
  }(AbstractObserver));

  var WithLatestFromSourceObserver = (function (__super__) {
    inherits(WithLatestFromSourceObserver, __super__);
    function WithLatestFromSourceObserver(o, cb, state) {
      this._o = o;
      this._cb = cb;
      this._state = state;
      __super__.call(this);
    }

    WithLatestFromSourceObserver.prototype.next = function (x) {
      var allValues = [x].concat(this._state.values);
      if (!this._state.hasValueAll) { return; }
      var res = tryCatch(this._cb).apply(null, allValues);
      if (res === errorObj) { return this._o.onError(res.e); }
      this._o.onNext(res);
    };

    WithLatestFromSourceObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    WithLatestFromSourceObserver.prototype.completed = function () {
      this._o.onCompleted();
    };

    return WithLatestFromSourceObserver;
  }(AbstractObserver));

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  observableProto.withLatestFrom = function () {
    if (arguments.length === 0) { throw new Error('invalid arguments'); }

    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
    Array.isArray(args[0]) && (args = args[0]);

    return new WithLatestFromObservable(this, args, resultSelector);
  };

  function falseFactory() { return false; }
  function emptyArrayFactory() { return []; }

  var ZipObservable = (function(__super__) {
    inherits(ZipObservable, __super__);
    function ZipObservable(sources, resultSelector) {
      this._s = sources;
      this._cb = resultSelector;
      __super__.call(this);
    }

    ZipObservable.prototype.subscribeCore = function(observer) {
      var n = this._s.length,
          subscriptions = new Array(n),
          done = arrayInitialize(n, falseFactory),
          q = arrayInitialize(n, emptyArrayFactory);

      for (var i = 0; i < n; i++) {
        var source = this._s[i], sad = new SingleAssignmentDisposable();
        subscriptions[i] = sad;
        isPromise(source) && (source = observableFromPromise(source));
        sad.setDisposable(source.subscribe(new ZipObserver(observer, i, this, q, done)));
      }

      return new NAryDisposable(subscriptions);
    };

    return ZipObservable;
  }(ObservableBase));

  var ZipObserver = (function (__super__) {
    inherits(ZipObserver, __super__);
    function ZipObserver(o, i, p, q, d) {
      this._o = o;
      this._i = i;
      this._p = p;
      this._q = q;
      this._d = d;
      __super__.call(this);
    }

    function notEmpty(x) { return x.length > 0; }
    function shiftEach(x) { return x.shift(); }
    function notTheSame(i) {
      return function (x, j) {
        return j !== i;
      };
    }

    ZipObserver.prototype.next = function (x) {
      this._q[this._i].push(x);
      if (this._q.every(notEmpty)) {
        var queuedValues = this._q.map(shiftEach);
        var res = tryCatch(this._p._cb).apply(null, queuedValues);
        if (res === errorObj) { return this._o.onError(res.e); }
        this._o.onNext(res);
      } else if (this._d.filter(notTheSame(this._i)).every(identity)) {
        this._o.onCompleted();
      }
    };

    ZipObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    ZipObserver.prototype.completed = function () {
      this._d[this._i] = true;
      this._d.every(identity) && this._o.onCompleted();
    };

    return ZipObserver;
  }(AbstractObserver));

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
   * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
   * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
   */
  observableProto.zip = function () {
    if (arguments.length === 0) { throw new Error('invalid arguments'); }

    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
    Array.isArray(args[0]) && (args = args[0]);

    var parent = this;
    args.unshift(parent);

    return new ZipObservable(args, resultSelector);
  };

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
   * @param arguments Observable sources.
   * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  Observable.zip = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    if (Array.isArray(args[0])) {
      args = isFunction(args[1]) ? args[0].concat(args[1]) : args[0];
    }
    var first = args.shift();
    return first.zip.apply(first, args);
  };

function falseFactory() { return false; }
function emptyArrayFactory() { return []; }
function argumentsToArray() {
  var len = arguments.length, args = new Array(len);
  for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
  return args;
}

var ZipIterableObservable = (function(__super__) {
  inherits(ZipIterableObservable, __super__);
  function ZipIterableObservable(sources, cb) {
    this.sources = sources;
    this._cb = cb;
    __super__.call(this);
  }

  ZipIterableObservable.prototype.subscribeCore = function (o) {
    var sources = this.sources, len = sources.length, subscriptions = new Array(len);

    var state = {
      q: arrayInitialize(len, emptyArrayFactory),
      done: arrayInitialize(len, falseFactory),
      cb: this._cb,
      o: o
    };

    for (var i = 0; i < len; i++) {
      (function (i) {
        var source = sources[i], sad = new SingleAssignmentDisposable();
        (isArrayLike(source) || isIterable(source)) && (source = observableFrom(source));

        subscriptions[i] = sad;
        sad.setDisposable(source.subscribe(new ZipIterableObserver(state, i)));
      }(i));
    }

    return new NAryDisposable(subscriptions);
  };

  return ZipIterableObservable;
}(ObservableBase));

var ZipIterableObserver = (function (__super__) {
  inherits(ZipIterableObserver, __super__);
  function ZipIterableObserver(s, i) {
    this._s = s;
    this._i = i;
    __super__.call(this);
  }

  function notEmpty(x) { return x.length > 0; }
  function shiftEach(x) { return x.shift(); }
  function notTheSame(i) {
    return function (x, j) {
      return j !== i;
    };
  }

  ZipIterableObserver.prototype.next = function (x) {
    this._s.q[this._i].push(x);
    if (this._s.q.every(notEmpty)) {
      var queuedValues = this._s.q.map(shiftEach),
          res = tryCatch(this._s.cb).apply(null, queuedValues);
      if (res === errorObj) { return this._s.o.onError(res.e); }
      this._s.o.onNext(res);
    } else if (this._s.done.filter(notTheSame(this._i)).every(identity)) {
      this._s.o.onCompleted();
    }
  };

  ZipIterableObserver.prototype.error = function (e) { this._s.o.onError(e); };

  ZipIterableObserver.prototype.completed = function () {
    this._s.done[this._i] = true;
    this._s.done.every(identity) && this._s.o.onCompleted();
  };

  return ZipIterableObserver;
}(AbstractObserver));

/**
 * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
 * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
 * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
 */
observableProto.zipIterable = function () {
  if (arguments.length === 0) { throw new Error('invalid arguments'); }

  var len = arguments.length, args = new Array(len);
  for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
  var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;

  var parent = this;
  args.unshift(parent);
  return new ZipIterableObservable(args, resultSelector);
};

  function asObservable(source) {
    return function subscribe(o) { return source.subscribe(o); };
  }

  /**
   *  Hides the identity of an observable sequence.
   * @returns {Observable} An observable sequence that hides the identity of the source sequence.
   */
  observableProto.asObservable = function () {
    return new AnonymousObservable(asObservable(this), this);
  };

  function toArray(x) { return x.toArray(); }
  function notEmpty(x) { return x.length > 0; }

  /**
   *  Projects each element of an observable sequence into zero or more buffers which are produced based on element count information.
   * @param {Number} count Length of each buffer.
   * @param {Number} [skip] Number of elements to skip between creation of consecutive buffers. If not provided, defaults to the count.
   * @returns {Observable} An observable sequence of buffers.
   */
  observableProto.bufferWithCount = observableProto.bufferCount = function (count, skip) {
    typeof skip !== 'number' && (skip = count);
    return this.windowWithCount(count, skip)
      .flatMap(toArray)
      .filter(notEmpty);
  };

  var DematerializeObservable = (function (__super__) {
    inherits(DematerializeObservable, __super__);
    function DematerializeObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    DematerializeObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new DematerializeObserver(o));
    };

    return DematerializeObservable;
  }(ObservableBase));

  var DematerializeObserver = (function (__super__) {
    inherits(DematerializeObserver, __super__);

    function DematerializeObserver(o) {
      this._o = o;
      __super__.call(this);
    }

    DematerializeObserver.prototype.next = function (x) { x.accept(this._o); };
    DematerializeObserver.prototype.error = function (e) { this._o.onError(e); };
    DematerializeObserver.prototype.completed = function () { this._o.onCompleted(); };

    return DematerializeObserver;
  }(AbstractObserver));

  /**
   * Dematerializes the explicit notification values of an observable sequence as implicit notifications.
   * @returns {Observable} An observable sequence exhibiting the behavior corresponding to the source sequence's notification values.
   */
  observableProto.dematerialize = function () {
    return new DematerializeObservable(this);
  };

  var DistinctUntilChangedObservable = (function(__super__) {
    inherits(DistinctUntilChangedObservable, __super__);
    function DistinctUntilChangedObservable(source, keyFn, comparer) {
      this.source = source;
      this.keyFn = keyFn;
      this.comparer = comparer;
      __super__.call(this);
    }

    DistinctUntilChangedObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new DistinctUntilChangedObserver(o, this.keyFn, this.comparer));
    };

    return DistinctUntilChangedObservable;
  }(ObservableBase));

  var DistinctUntilChangedObserver = (function(__super__) {
    inherits(DistinctUntilChangedObserver, __super__);
    function DistinctUntilChangedObserver(o, keyFn, comparer) {
      this.o = o;
      this.keyFn = keyFn;
      this.comparer = comparer;
      this.hasCurrentKey = false;
      this.currentKey = null;
      __super__.call(this);
    }

    DistinctUntilChangedObserver.prototype.next = function (x) {
      var key = x, comparerEquals;
      if (isFunction(this.keyFn)) {
        key = tryCatch(this.keyFn)(x);
        if (key === errorObj) { return this.o.onError(key.e); }
      }
      if (this.hasCurrentKey) {
        comparerEquals = tryCatch(this.comparer)(this.currentKey, key);
        if (comparerEquals === errorObj) { return this.o.onError(comparerEquals.e); }
      }
      if (!this.hasCurrentKey || !comparerEquals) {
        this.hasCurrentKey = true;
        this.currentKey = key;
        this.o.onNext(x);
      }
    };
    DistinctUntilChangedObserver.prototype.error = function(e) {
      this.o.onError(e);
    };
    DistinctUntilChangedObserver.prototype.completed = function () {
      this.o.onCompleted();
    };

    return DistinctUntilChangedObserver;
  }(AbstractObserver));

  /**
  *  Returns an observable sequence that contains only distinct contiguous elements according to the keyFn and the comparer.
  * @param {Function} [keyFn] A function to compute the comparison key for each element. If not provided, it projects the value.
  * @param {Function} [comparer] Equality comparer for computed key values. If not provided, defaults to an equality comparer function.
  * @returns {Observable} An observable sequence only containing the distinct contiguous elements, based on a computed key value, from the source sequence.
  */
  observableProto.distinctUntilChanged = function (keyFn, comparer) {
    comparer || (comparer = defaultComparer);
    return new DistinctUntilChangedObservable(this, keyFn, comparer);
  };

  var TapObservable = (function(__super__) {
    inherits(TapObservable,__super__);
    function TapObservable(source, observerOrOnNext, onError, onCompleted) {
      this.source = source;
      this._oN = observerOrOnNext;
      this._oE = onError;
      this._oC = onCompleted;
      __super__.call(this);
    }

    TapObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new InnerObserver(o, this));
    };

    inherits(InnerObserver, AbstractObserver);
    function InnerObserver(o, p) {
      this.o = o;
      this.t = !p._oN || isFunction(p._oN) ?
        observerCreate(p._oN || noop, p._oE || noop, p._oC || noop) :
        p._oN;
      this.isStopped = false;
      AbstractObserver.call(this);
    }
    InnerObserver.prototype.next = function(x) {
      var res = tryCatch(this.t.onNext).call(this.t, x);
      if (res === errorObj) { this.o.onError(res.e); }
      this.o.onNext(x);
    };
    InnerObserver.prototype.error = function(err) {
      var res = tryCatch(this.t.onError).call(this.t, err);
      if (res === errorObj) { return this.o.onError(res.e); }
      this.o.onError(err);
    };
    InnerObserver.prototype.completed = function() {
      var res = tryCatch(this.t.onCompleted).call(this.t);
      if (res === errorObj) { return this.o.onError(res.e); }
      this.o.onCompleted();
    };

    return TapObservable;
  }(ObservableBase));

  /**
  *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an o.
  * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
  * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto['do'] = observableProto.tap = observableProto.doAction = function (observerOrOnNext, onError, onCompleted) {
    return new TapObservable(this, observerOrOnNext, onError, onCompleted);
  };

  /**
  *  Invokes an action for each element in the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onNext Action to invoke for each element in the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnNext = observableProto.tapOnNext = function (onNext, thisArg) {
    return this.tap(typeof thisArg !== 'undefined' ? function (x) { onNext.call(thisArg, x); } : onNext);
  };

  /**
  *  Invokes an action upon exceptional termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onError Action to invoke upon exceptional termination of the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnError = observableProto.tapOnError = function (onError, thisArg) {
    return this.tap(noop, typeof thisArg !== 'undefined' ? function (e) { onError.call(thisArg, e); } : onError);
  };

  /**
  *  Invokes an action upon graceful termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onCompleted Action to invoke upon graceful termination of the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnCompleted = observableProto.tapOnCompleted = function (onCompleted, thisArg) {
    return this.tap(noop, null, typeof thisArg !== 'undefined' ? function () { onCompleted.call(thisArg); } : onCompleted);
  };

  var FinallyObservable = (function (__super__) {
    inherits(FinallyObservable, __super__);
    function FinallyObservable(source, fn, thisArg) {
      this.source = source;
      this._fn = bindCallback(fn, thisArg, 0);
      __super__.call(this);
    }

    FinallyObservable.prototype.subscribeCore = function (o) {
      var d = tryCatch(this.source.subscribe).call(this.source, o);
      if (d === errorObj) {
        this._fn();
        thrower(d.e);
      }

      return new FinallyDisposable(d, this._fn);
    };

    function FinallyDisposable(s, fn) {
      this.isDisposed = false;
      this._s = s;
      this._fn = fn;
    }
    FinallyDisposable.prototype.dispose = function () {
      if (!this.isDisposed) {
        var res = tryCatch(this._s.dispose).call(this._s);
        this._fn();
        res === errorObj && thrower(res.e);
      }
    };

    return FinallyObservable;

  }(ObservableBase));

  /**
   *  Invokes a specified action after the source observable sequence terminates gracefully or exceptionally.
   * @param {Function} finallyAction Action to invoke after the source observable sequence terminates.
   * @returns {Observable} Source sequence with the action-invoking termination behavior applied.
   */
  observableProto['finally'] = function (action, thisArg) {
    return new FinallyObservable(this, action, thisArg);
  };

  var IgnoreElementsObservable = (function(__super__) {
    inherits(IgnoreElementsObservable, __super__);

    function IgnoreElementsObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    IgnoreElementsObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o));
    };

    function InnerObserver(o) {
      this.o = o;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = noop;
    InnerObserver.prototype.onError = function (err) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }

      return false;
    };

    return IgnoreElementsObservable;
  }(ObservableBase));

  /**
   *  Ignores all elements in an observable sequence leaving only the termination messages.
   * @returns {Observable} An empty observable sequence that signals termination, successful or exceptional, of the source sequence.
   */
  observableProto.ignoreElements = function () {
    return new IgnoreElementsObservable(this);
  };

  var MaterializeObservable = (function (__super__) {
    inherits(MaterializeObservable, __super__);
    function MaterializeObservable(source, fn) {
      this.source = source;
      __super__.call(this);
    }

    MaterializeObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new MaterializeObserver(o));
    };

    return MaterializeObservable;
  }(ObservableBase));

  var MaterializeObserver = (function (__super__) {
    inherits(MaterializeObserver, __super__);

    function MaterializeObserver(o) {
      this._o = o;
      __super__.call(this);
    }

    MaterializeObserver.prototype.next = function (x) { this._o.onNext(notificationCreateOnNext(x)) };
    MaterializeObserver.prototype.error = function (e) { this._o.onNext(notificationCreateOnError(e)); this._o.onCompleted(); };
    MaterializeObserver.prototype.completed = function () { this._o.onNext(notificationCreateOnCompleted()); this._o.onCompleted(); };

    return MaterializeObserver;
  }(AbstractObserver));

  /**
   *  Materializes the implicit notifications of an observable sequence as explicit notification values.
   * @returns {Observable} An observable sequence containing the materialized notification values from the source sequence.
   */
  observableProto.materialize = function () {
    return new MaterializeObservable(this);
  };

  /**
   *  Repeats the observable sequence a specified number of times. If the repeat count is not specified, the sequence repeats indefinitely.
   * @param {Number} [repeatCount]  Number of times to repeat the sequence. If not provided, repeats the sequence indefinitely.
   * @returns {Observable} The observable sequence producing the elements of the given sequence repeatedly.
   */
  observableProto.repeat = function (repeatCount) {
    return enumerableRepeat(this, repeatCount).concat();
  };

  /**
   *  Repeats the source observable sequence the specified number of times or until it successfully terminates. If the retry count is not specified, it retries indefinitely.
   *  Note if you encounter an error and want it to retry once, then you must use .retry(2);
   *
   * @example
   *  var res = retried = retry.repeat();
   *  var res = retried = retry.repeat(2);
   * @param {Number} [retryCount]  Number of times to retry the sequence. If not provided, retry the sequence indefinitely.
   * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
   */
  observableProto.retry = function (retryCount) {
    return enumerableRepeat(this, retryCount).catchError();
  };

  function repeat(value) {
    return {
      '@@iterator': function () {
        return {
          next: function () {
            return { done: false, value: value };
          }
        };
      }
    };
  }

  var RetryWhenObservable = (function(__super__) {
    function createDisposable(state) {
      return {
        isDisposed: false,
        dispose: function () {
          if (!this.isDisposed) {
            this.isDisposed = true;
            state.isDisposed = true;
          }
        }
      };
    }

    function RetryWhenObservable(source, notifier) {
      this.source = source;
      this._notifier = notifier;
      __super__.call(this);
    }

    inherits(RetryWhenObservable, __super__);

    RetryWhenObservable.prototype.subscribeCore = function (o) {
      var exceptions = new Subject(),
        notifier = new Subject(),
        handled = this._notifier(exceptions),
        notificationDisposable = handled.subscribe(notifier);

      var e = this.source['@@iterator']();

      var state = { isDisposed: false },
        lastError,
        subscription = new SerialDisposable();
      var cancelable = currentThreadScheduler.scheduleRecursive(null, function (_, recurse) {
        if (state.isDisposed) { return; }
        var currentItem = e.next();

        if (currentItem.done) {
          if (lastError) {
            o.onError(lastError);
          } else {
            o.onCompleted();
          }
          return;
        }

        // Check if promise
        var currentValue = currentItem.value;
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var outer = new SingleAssignmentDisposable();
        var inner = new SingleAssignmentDisposable();
        subscription.setDisposable(new BinaryDisposable(inner, outer));
        outer.setDisposable(currentValue.subscribe(
          function(x) { o.onNext(x); },
          function (exn) {
            inner.setDisposable(notifier.subscribe(recurse, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));

            exceptions.onNext(exn);
            outer.dispose();
          },
          function() { o.onCompleted(); }));
      });

      return new NAryDisposable([notificationDisposable, subscription, cancelable, createDisposable(state)]);
    };

    return RetryWhenObservable;
  }(ObservableBase));

  observableProto.retryWhen = function (notifier) {
    return new RetryWhenObservable(repeat(this), notifier);
  };

  function repeat(value) {
    return {
      '@@iterator': function () {
        return {
          next: function () {
            return { done: false, value: value };
          }
        };
      }
    };
  }

  var RepeatWhenObservable = (function(__super__) {
    function createDisposable(state) {
      return {
        isDisposed: false,
        dispose: function () {
          if (!this.isDisposed) {
            this.isDisposed = true;
            state.isDisposed = true;
          }
        }
      };
    }

    function RepeatWhenObservable(source, notifier) {
      this.source = source;
      this._notifier = notifier;
      __super__.call(this);
    }

    inherits(RepeatWhenObservable, __super__);

    RepeatWhenObservable.prototype.subscribeCore = function (o) {
      var completions = new Subject(),
        notifier = new Subject(),
        handled = this._notifier(completions),
        notificationDisposable = handled.subscribe(notifier);

      var e = this.source['@@iterator']();

      var state = { isDisposed: false },
        lastError,
        subscription = new SerialDisposable();
      var cancelable = currentThreadScheduler.scheduleRecursive(null, function (_, recurse) {
        if (state.isDisposed) { return; }
        var currentItem = e.next();

        if (currentItem.done) {
          if (lastError) {
            o.onError(lastError);
          } else {
            o.onCompleted();
          }
          return;
        }

        // Check if promise
        var currentValue = currentItem.value;
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var outer = new SingleAssignmentDisposable();
        var inner = new SingleAssignmentDisposable();
        subscription.setDisposable(new BinaryDisposable(inner, outer));
        outer.setDisposable(currentValue.subscribe(
          function(x) { o.onNext(x); },
          function (exn) { o.onError(exn); },
          function() {
            inner.setDisposable(notifier.subscribe(recurse, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));

            completions.onNext(null);
            outer.dispose();
          }));
      });

      return new NAryDisposable([notificationDisposable, subscription, cancelable, createDisposable(state)]);
    };

    return RepeatWhenObservable;
  }(ObservableBase));

  observableProto.repeatWhen = function (notifier) {
    return new RepeatWhenObservable(repeat(this), notifier);
  };

  var ScanObservable = (function(__super__) {
    inherits(ScanObservable, __super__);
    function ScanObservable(source, accumulator, hasSeed, seed) {
      this.source = source;
      this.accumulator = accumulator;
      this.hasSeed = hasSeed;
      this.seed = seed;
      __super__.call(this);
    }

    ScanObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new ScanObserver(o,this));
    };

    return ScanObservable;
  }(ObservableBase));

  var ScanObserver = (function (__super__) {
    inherits(ScanObserver, __super__);
    function ScanObserver(o, parent) {
      this._o = o;
      this._p = parent;
      this._fn = parent.accumulator;
      this._hs = parent.hasSeed;
      this._s = parent.seed;
      this._ha = false;
      this._a = null;
      this._hv = false;
      this._i = 0;
      __super__.call(this);
    }

    ScanObserver.prototype.next = function (x) {
      !this._hv && (this._hv = true);
      if (this._ha) {
        this._a = tryCatch(this._fn)(this._a, x, this._i, this._p);
      } else {
        this._a = this._hs ? tryCatch(this._fn)(this._s, x, this._i, this._p) : x;
        this._ha = true;
      }
      if (this._a === errorObj) { return this._o.onError(this._a.e); }
      this._o.onNext(this._a);
      this._i++;
    };

    ScanObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    ScanObserver.prototype.completed = function () {
      !this._hv && this._hs && this._o.onNext(this._s);
      this._o.onCompleted();
    };

    return ScanObserver;
  }(AbstractObserver));

  /**
  *  Applies an accumulator function over an observable sequence and returns each intermediate result. The optional seed value is used as the initial accumulator value.
  *  For aggregation behavior with no intermediate results, see Observable.aggregate.
  * @param {Mixed} [seed] The initial accumulator value.
  * @param {Function} accumulator An accumulator function to be invoked on each element.
  * @returns {Observable} An observable sequence containing the accumulated values.
  */
  observableProto.scan = function () {
    var hasSeed = false, seed, accumulator = arguments[0];
    if (arguments.length === 2) {
      hasSeed = true;
      seed = arguments[1];
    }
    return new ScanObservable(this, accumulator, hasSeed, seed);
  };

  var SkipLastObservable = (function (__super__) {
    inherits(SkipLastObservable, __super__);
    function SkipLastObservable(source, c) {
      this.source = source;
      this._c = c;
      __super__.call(this);
    }

    SkipLastObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new SkipLastObserver(o, this._c));
    };

    return SkipLastObservable;
  }(ObservableBase));

  var SkipLastObserver = (function (__super__) {
    inherits(SkipLastObserver, __super__);
    function SkipLastObserver(o, c) {
      this._o = o;
      this._c = c;
      this._q = [];
      __super__.call(this);
    }

    SkipLastObserver.prototype.next = function (x) {
      this._q.push(x);
      this._q.length > this._c && this._o.onNext(this._q.shift());
    };

    SkipLastObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    SkipLastObserver.prototype.completed = function () {
      this._o.onCompleted();
    };

    return SkipLastObserver;
  }(AbstractObserver));

  /**
   *  Bypasses a specified number of elements at the end of an observable sequence.
   * @description
   *  This operator accumulates a queue with a length enough to store the first `count` elements. As more elements are
   *  received, elements are taken from the front of the queue and produced on the result sequence. This causes elements to be delayed.
   * @param count Number of elements to bypass at the end of the source sequence.
   * @returns {Observable} An observable sequence containing the source sequence elements except for the bypassed ones at the end.
   */
  observableProto.skipLast = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    return new SkipLastObservable(this, count);
  };

  /**
   *  Prepends a sequence of values to an observable sequence with an optional scheduler and an argument list of values to prepend.
   *  @example
   *  var res = source.startWith(1, 2, 3);
   *  var res = source.startWith(Rx.Scheduler.timeout, 1, 2, 3);
   * @param {Arguments} args The specified values to prepend to the observable sequence
   * @returns {Observable} The source sequence prepended with the specified values.
   */
  observableProto.startWith = function () {
    var values, scheduler, start = 0;
    if (!!arguments.length && isScheduler(arguments[0])) {
      scheduler = arguments[0];
      start = 1;
    } else {
      scheduler = immediateScheduler;
    }
    for(var args = [], i = start, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
    return observableConcat.apply(null, [observableFromArray(args, scheduler), this]);
  };

  var TakeLastObserver = (function (__super__) {
    inherits(TakeLastObserver, __super__);
    function TakeLastObserver(o, c) {
      this._o = o;
      this._c = c;
      this._q = [];
      __super__.call(this);
    }

    TakeLastObserver.prototype.next = function (x) {
      this._q.push(x);
      this._q.length > this._c && this._q.shift();
    };

    TakeLastObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    TakeLastObserver.prototype.completed = function () {
      while (this._q.length > 0) { this._o.onNext(this._q.shift()); }
      this._o.onCompleted();
    };

    return TakeLastObserver;
  }(AbstractObserver));

  /**
   *  Returns a specified number of contiguous elements from the end of an observable sequence.
   * @description
   *  This operator accumulates a buffer with a length enough to store elements count elements. Upon completion of
   *  the source sequence, this buffer is drained on the result sequence. This causes the elements to be delayed.
   * @param {Number} count Number of elements to take from the end of the source sequence.
   * @returns {Observable} An observable sequence containing the specified number of elements from the end of the source sequence.
   */
  observableProto.takeLast = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    var source = this;
    return new AnonymousObservable(function (o) {
      return source.subscribe(new TakeLastObserver(o, count));
    }, source);
  };

  var TakeLastBufferObserver = (function (__super__) {
    inherits(TakeLastBufferObserver, __super__);
    function TakeLastBufferObserver(o, c) {
      this._o = o;
      this._c = c;
      this._q = [];
      __super__.call(this);
    }

    TakeLastBufferObserver.prototype.next = function (x) {
      this._q.push(x);
      this._q.length > this._c && this._q.shift();
    };

    TakeLastBufferObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    TakeLastBufferObserver.prototype.completed = function () {
      this._o.onNext(this._q);
      this._o.onCompleted();
    };

    return TakeLastBufferObserver;
  }(AbstractObserver));

  /**
   *  Returns an array with the specified number of contiguous elements from the end of an observable sequence.
   *
   * @description
   *  This operator accumulates a buffer with a length enough to store count elements. Upon completion of the
   *  source sequence, this buffer is produced on the result sequence.
   * @param {Number} count Number of elements to take from the end of the source sequence.
   * @returns {Observable} An observable sequence containing a single array with the specified number of elements from the end of the source sequence.
   */
  observableProto.takeLastBuffer = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    var source = this;
    return new AnonymousObservable(function (o) {
      return source.subscribe(new TakeLastBufferObserver(o, count));
    }, source);
  };

  /**
   *  Projects each element of an observable sequence into zero or more windows which are produced based on element count information.
   * @param {Number} count Length of each window.
   * @param {Number} [skip] Number of elements to skip between creation of consecutive windows. If not specified, defaults to the count.
   * @returns {Observable} An observable sequence of windows.
   */
  observableProto.windowWithCount = observableProto.windowCount = function (count, skip) {
    var source = this;
    +count || (count = 0);
    Math.abs(count) === Infinity && (count = 0);
    if (count <= 0) { throw new ArgumentOutOfRangeError(); }
    skip == null && (skip = count);
    +skip || (skip = 0);
    Math.abs(skip) === Infinity && (skip = 0);

    if (skip <= 0) { throw new ArgumentOutOfRangeError(); }
    return new AnonymousObservable(function (observer) {
      var m = new SingleAssignmentDisposable(),
        refCountDisposable = new RefCountDisposable(m),
        n = 0,
        q = [];

      function createWindow () {
        var s = new Subject();
        q.push(s);
        observer.onNext(addRef(s, refCountDisposable));
      }

      createWindow();

      m.setDisposable(source.subscribe(
        function (x) {
          for (var i = 0, len = q.length; i < len; i++) { q[i].onNext(x); }
          var c = n - count + 1;
          c >= 0 && c % skip === 0 && q.shift().onCompleted();
          ++n % skip === 0 && createWindow();
        },
        function (e) {
          while (q.length > 0) { q.shift().onError(e); }
          observer.onError(e);
        },
        function () {
          while (q.length > 0) { q.shift().onCompleted(); }
          observer.onCompleted();
        }
      ));
      return refCountDisposable;
    }, source);
  };

  function concatMap(source, selector, thisArg) {
    var selectorFunc = bindCallback(selector, thisArg, 3);
    return source.map(function (x, i) {
      var result = selectorFunc(x, i, source);
      isPromise(result) && (result = observableFromPromise(result));
      (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
      return result;
    }).concatAll();
  }

  /**
   *  One of the Following:
   *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
   *
   * @example
   *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
   *  Or:
   *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
   *
   *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
   *  Or:
   *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
   *
   *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
   * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
   * source sequence onto which could be either an observable or Promise.
   * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
   */
  observableProto.selectConcat = observableProto.concatMap = function (selector, resultSelector, thisArg) {
    if (isFunction(selector) && isFunction(resultSelector)) {
      return this.concatMap(function (x, i) {
        var selectorResult = selector(x, i);
        isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
        (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));

        return selectorResult.map(function (y, i2) {
          return resultSelector(x, y, i, i2);
        });
      });
    }
    return isFunction(selector) ?
      concatMap(this, selector, thisArg) :
      concatMap(this, function () { return selector; });
  };

  /**
   * Projects each notification of an observable sequence to an observable sequence and concats the resulting observable sequences into one observable sequence.
   * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
   * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
   * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
   * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
   */
  observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
    var source = this,
        onNextFunc = bindCallback(onNext, thisArg, 2),
        onErrorFunc = bindCallback(onError, thisArg, 1),
        onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
    return new AnonymousObservable(function (observer) {
      var index = 0;
      return source.subscribe(
        function (x) {
          var result;
          try {
            result = onNextFunc(x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        },
        function (err) {
          var result;
          try {
            result = onErrorFunc(err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        },
        function () {
          var result;
          try {
            result = onCompletedFunc();
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
    }, this).concatAll();
  };

  var DefaultIfEmptyObserver = (function (__super__) {
    inherits(DefaultIfEmptyObserver, __super__);
    function DefaultIfEmptyObserver(o, d) {
      this._o = o;
      this._d = d;
      this._f = false;
      __super__.call(this);
    }

    DefaultIfEmptyObserver.prototype.next = function (x) {
      this._f = true;
      this._o.onNext(x);
    };

    DefaultIfEmptyObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    DefaultIfEmptyObserver.prototype.completed = function () {
      !this._f && this._o.onNext(this._d);
      this._o.onCompleted();
    };

    return DefaultIfEmptyObserver;
  }(AbstractObserver));

  /**
   *  Returns the elements of the specified sequence or the specified value in a singleton sequence if the sequence is empty.
   *
   *  var res = obs = xs.defaultIfEmpty();
   *  2 - obs = xs.defaultIfEmpty(false);
   *
   * @memberOf Observable#
   * @param defaultValue The value to return if the sequence is empty. If not provided, this defaults to null.
   * @returns {Observable} An observable sequence that contains the specified default value if the source is empty; otherwise, the elements of the source itself.
   */
    observableProto.defaultIfEmpty = function (defaultValue) {
      var source = this;
      defaultValue === undefined && (defaultValue = null);
      return new AnonymousObservable(function (o) {
        return source.subscribe(new DefaultIfEmptyObserver(o, defaultValue));
      }, source);
    };

  // Swap out for Array.findIndex
  function arrayIndexOfComparer(array, item, comparer) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (comparer(array[i], item)) { return i; }
    }
    return -1;
  }

  function HashSet(comparer) {
    this.comparer = comparer;
    this.set = [];
  }
  HashSet.prototype.push = function(value) {
    var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
    retValue && this.set.push(value);
    return retValue;
  };

  var DistinctObservable = (function (__super__) {
    inherits(DistinctObservable, __super__);
    function DistinctObservable(source, keyFn, cmpFn) {
      this.source = source;
      this._keyFn = keyFn;
      this._cmpFn = cmpFn;
      __super__.call(this);
    }

    DistinctObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new DistinctObserver(o, this._keyFn, this._cmpFn));
    };

    return DistinctObservable;
  }(ObservableBase));

  var DistinctObserver = (function (__super__) {
    inherits(DistinctObserver, __super__);
    function DistinctObserver(o, keyFn, cmpFn) {
      this._o = o;
      this._keyFn = keyFn;
      this._h = new HashSet(cmpFn);
      __super__.call(this);
    }

    DistinctObserver.prototype.next = function (x) {
      var key = x;
      if (isFunction(this._keyFn)) {
        key = tryCatch(this._keyFn)(x);
        if (key === errorObj) { return this._o.onError(key.e); }
      }
      this._h.push(key) && this._o.onNext(x);
    };

    DistinctObserver.prototype.error = function (e) { this._o.onError(e); };
    DistinctObserver.prototype.completed = function () { this._o.onCompleted(); };

    return DistinctObserver;
  }(AbstractObserver));

  /**
   *  Returns an observable sequence that contains only distinct elements according to the keySelector and the comparer.
   *  Usage of this operator should be considered carefully due to the maintenance of an internal lookup structure which can grow large.
   *
   * @example
   *  var res = obs = xs.distinct();
   *  2 - obs = xs.distinct(function (x) { return x.id; });
   *  2 - obs = xs.distinct(function (x) { return x.id; }, function (a,b) { return a === b; });
   * @param {Function} [keySelector]  A function to compute the comparison key for each element.
   * @param {Function} [comparer]  Used to compare items in the collection.
   * @returns {Observable} An observable sequence only containing the distinct elements, based on a computed key value, from the source sequence.
   */
  observableProto.distinct = function (keySelector, comparer) {
    comparer || (comparer = defaultComparer);
    return new DistinctObservable(this, keySelector, comparer);
  };

  /**
   *  Groups the elements of an observable sequence according to a specified key selector function and comparer and selects the resulting elements by using a specified function.
   *
   * @example
   *  var res = observable.groupBy(function (x) { return x.id; });
   *  2 - observable.groupBy(function (x) { return x.id; }), function (x) { return x.name; });
   *  3 - observable.groupBy(function (x) { return x.id; }), function (x) { return x.name; }, function (x) { return x.toString(); });
   * @param {Function} keySelector A function to extract the key for each element.
   * @param {Function} [elementSelector]  A function to map each source element to an element in an observable group.
   * @returns {Observable} A sequence of observable groups, each of which corresponds to a unique key value, containing all elements that share that same key value.
   */
  observableProto.groupBy = function (keySelector, elementSelector) {
    return this.groupByUntil(keySelector, elementSelector, observableNever);
  };

    /**
     *  Groups the elements of an observable sequence according to a specified key selector function.
     *  A duration selector function is used to control the lifetime of groups. When a group expires, it receives an OnCompleted notification. When a new element with the same
     *  key value as a reclaimed group occurs, the group will be reborn with a new lifetime request.
     *
     * @example
     *  var res = observable.groupByUntil(function (x) { return x.id; }, null,  function () { return Rx.Observable.never(); });
     *  2 - observable.groupBy(function (x) { return x.id; }), function (x) { return x.name; },  function () { return Rx.Observable.never(); });
     *  3 - observable.groupBy(function (x) { return x.id; }), function (x) { return x.name; },  function () { return Rx.Observable.never(); }, function (x) { return x.toString(); });
     * @param {Function} keySelector A function to extract the key for each element.
     * @param {Function} durationSelector A function to signal the expiration of a group.
     * @returns {Observable}
     *  A sequence of observable groups, each of which corresponds to a unique key value, containing all elements that share that same key value.
     *  If a group's lifetime expires, a new group with the same key value can be created once an element with such a key value is encoutered.
     *
     */
    observableProto.groupByUntil = function (keySelector, elementSelector, durationSelector) {
      var source = this;
      return new AnonymousObservable(function (o) {
        var map = new Map(),
          groupDisposable = new CompositeDisposable(),
          refCountDisposable = new RefCountDisposable(groupDisposable),
          handleError = function (e) { return function (item) { item.onError(e); }; };

        groupDisposable.add(
          source.subscribe(function (x) {
            var key = tryCatch(keySelector)(x);
            if (key === errorObj) {
              map.forEach(handleError(key.e));
              return o.onError(key.e);
            }

            var fireNewMapEntry = false, writer = map.get(key);
            if (writer === undefined) {
              writer = new Subject();
              map.set(key, writer);
              fireNewMapEntry = true;
            }

            if (fireNewMapEntry) {
              var group = new GroupedObservable(key, writer, refCountDisposable),
                durationGroup = new GroupedObservable(key, writer);
              var duration = tryCatch(durationSelector)(durationGroup);
              if (duration === errorObj) {
                map.forEach(handleError(duration.e));
                return o.onError(duration.e);
              }

              o.onNext(group);

              var md = new SingleAssignmentDisposable();
              groupDisposable.add(md);

              md.setDisposable(duration.take(1).subscribe(
                noop,
                function (e) {
                  map.forEach(handleError(e));
                  o.onError(e);
                },
                function () {
                  if (map['delete'](key)) { writer.onCompleted(); }
                  groupDisposable.remove(md);
                }));
            }

            var element = x;
            if (isFunction(elementSelector)) {
              element = tryCatch(elementSelector)(x);
              if (element === errorObj) {
                map.forEach(handleError(element.e));
                return o.onError(element.e);
              }
            }

            writer.onNext(element);
        }, function (e) {
          map.forEach(handleError(e));
          o.onError(e);
        }, function () {
          map.forEach(function (item) { item.onCompleted(); });
          o.onCompleted();
        }));

      return refCountDisposable;
    }, source);
  };

  var MapObservable = (function (__super__) {
    inherits(MapObservable, __super__);

    function MapObservable(source, selector, thisArg) {
      this.source = source;
      this.selector = bindCallback(selector, thisArg, 3);
      __super__.call(this);
    }

    function innerMap(selector, self) {
      return function (x, i, o) { return selector.call(this, self.selector(x, i, o), i, o); };
    }

    MapObservable.prototype.internalMap = function (selector, thisArg) {
      return new MapObservable(this.source, innerMap(selector, this), thisArg);
    };

    MapObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o, this.selector, this));
    };

    inherits(InnerObserver, AbstractObserver);
    function InnerObserver(o, selector, source) {
      this.o = o;
      this.selector = selector;
      this.source = source;
      this.i = 0;
      AbstractObserver.call(this);
    }

    InnerObserver.prototype.next = function(x) {
      var result = tryCatch(this.selector)(x, this.i++, this.source);
      if (result === errorObj) { return this.o.onError(result.e); }
      this.o.onNext(result);
    };

    InnerObserver.prototype.error = function (e) {
      this.o.onError(e);
    };

    InnerObserver.prototype.completed = function () {
      this.o.onCompleted();
    };

    return MapObservable;

  }(ObservableBase));

  /**
  * Projects each element of an observable sequence into a new form by incorporating the element's index.
  * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source.
  */
  observableProto.map = observableProto.select = function (selector, thisArg) {
    var selectorFn = typeof selector === 'function' ? selector : function () { return selector; };
    return this instanceof MapObservable ?
      this.internalMap(selectorFn, thisArg) :
      new MapObservable(this, selectorFn, thisArg);
  };

  function plucker(args, len) {
    return function mapper(x) {
      var currentProp = x;
      for (var i = 0; i < len; i++) {
        var p = currentProp[args[i]];
        if (typeof p !== 'undefined') {
          currentProp = p;
        } else {
          return undefined;
        }
      }
      return currentProp;
    };
  }

  /**
   * Retrieves the value of a specified nested property from all elements in
   * the Observable sequence.
   * @param {Arguments} arguments The nested properties to pluck.
   * @returns {Observable} Returns a new Observable sequence of property values.
   */
  observableProto.pluck = function () {
    var len = arguments.length, args = new Array(len);
    if (len === 0) { throw new Error('List of properties cannot be empty.'); }
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return this.map(plucker(args, len));
  };

observableProto.flatMap = observableProto.selectMany = observableProto.mergeMap = function(selector, resultSelector, thisArg) {
    return new FlatMapObservable(this, selector, resultSelector, thisArg).mergeAll();
};

  /**
   * Projects each notification of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
   * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
   * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
   * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
   * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
   */
  observableProto.flatMapObserver = observableProto.selectManyObserver = function (onNext, onError, onCompleted, thisArg) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var index = 0;

      return source.subscribe(
        function (x) {
          var result;
          try {
            result = onNext.call(thisArg, x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        },
        function (err) {
          var result;
          try {
            result = onError.call(thisArg, err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        },
        function () {
          var result;
          try {
            result = onCompleted.call(thisArg);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
    }, source).mergeAll();
  };

observableProto.flatMapLatest = observableProto.switchMap = function(selector, resultSelector, thisArg) {
    return new FlatMapObservable(this, selector, resultSelector, thisArg).switchLatest();
};

  var SkipObservable = (function(__super__) {
    inherits(SkipObservable, __super__);
    function SkipObservable(source, count) {
      this.source = source;
      this._count = count;
      __super__.call(this);
    }

    SkipObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new SkipObserver(o, this._count));
    };

    function SkipObserver(o, c) {
      this._o = o;
      this._r = c;
      AbstractObserver.call(this);
    }

    inherits(SkipObserver, AbstractObserver);

    SkipObserver.prototype.next = function (x) {
      if (this._r <= 0) {
        this._o.onNext(x);
      } else {
        this._r--;
      }
    };
    SkipObserver.prototype.error = function(e) { this._o.onError(e); };
    SkipObserver.prototype.completed = function() { this._o.onCompleted(); };

    return SkipObservable;
  }(ObservableBase));

  /**
   * Bypasses a specified number of elements in an observable sequence and then returns the remaining elements.
   * @param {Number} count The number of elements to skip before returning the remaining elements.
   * @returns {Observable} An observable sequence that contains the elements that occur after the specified index in the input sequence.
   */
  observableProto.skip = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    return new SkipObservable(this, count);
  };

  var SkipWhileObservable = (function (__super__) {
    inherits(SkipWhileObservable, __super__);
    function SkipWhileObservable(source, fn) {
      this.source = source;
      this._fn = fn;
      __super__.call(this);
    }

    SkipWhileObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new SkipWhileObserver(o, this));
    };

    return SkipWhileObservable;
  }(ObservableBase));

  var SkipWhileObserver = (function (__super__) {
    inherits(SkipWhileObserver, __super__);

    function SkipWhileObserver(o, p) {
      this._o = o;
      this._p = p;
      this._i = 0;
      this._r = false;
      __super__.call(this);
    }

    SkipWhileObserver.prototype.next = function (x) {
      if (!this._r) {
        var res = tryCatch(this._p._fn)(x, this._i++, this._p);
        if (res === errorObj) { return this._o.onError(res.e); }
        this._r = !res;
      }
      this._r && this._o.onNext(x);
    };
    SkipWhileObserver.prototype.error = function (e) { this._o.onError(e); };
    SkipWhileObserver.prototype.completed = function () { this._o.onCompleted(); };

    return SkipWhileObserver;
  }(AbstractObserver));

  /**
   *  Bypasses elements in an observable sequence as long as a specified condition is true and then returns the remaining elements.
   *  The element's index is used in the logic of the predicate function.
   *
   *  var res = source.skipWhile(function (value) { return value < 10; });
   *  var res = source.skipWhile(function (value, index) { return value < 10 || index < 10; });
   * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence that contains the elements from the input sequence starting at the first element in the linear series that does not pass the test specified by predicate.
   */
  observableProto.skipWhile = function (predicate, thisArg) {
    var fn = bindCallback(predicate, thisArg, 3);
    return new SkipWhileObservable(this, fn);
  };

  var TakeObservable = (function(__super__) {
    inherits(TakeObservable, __super__);
    function TakeObservable(source, count) {
      this.source = source;
      this._count = count;
      __super__.call(this);
    }

    TakeObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new TakeObserver(o, this._count));
    };

    function TakeObserver(o, c) {
      this._o = o;
      this._c = c;
      this._r = c;
      AbstractObserver.call(this);
    }

    inherits(TakeObserver, AbstractObserver);

    TakeObserver.prototype.next = function (x) {
      if (this._r-- > 0) {
        this._o.onNext(x);
        this._r <= 0 && this._o.onCompleted();
      }
    };

    TakeObserver.prototype.error = function (e) { this._o.onError(e); };
    TakeObserver.prototype.completed = function () { this._o.onCompleted(); };

    return TakeObservable;
  }(ObservableBase));

  /**
   *  Returns a specified number of contiguous elements from the start of an observable sequence, using the specified scheduler for the edge case of take(0).
   * @param {Number} count The number of elements to return.
   * @param {Scheduler} [scheduler] Scheduler used to produce an OnCompleted message in case <paramref name="count count</paramref> is set to 0.
   * @returns {Observable} An observable sequence that contains the specified number of elements from the start of the input sequence.
   */
  observableProto.take = function (count, scheduler) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    if (count === 0) { return observableEmpty(scheduler); }
    return new TakeObservable(this, count);
  };

  var TakeWhileObservable = (function (__super__) {
    inherits(TakeWhileObservable, __super__);
    function TakeWhileObservable(source, fn) {
      this.source = source;
      this._fn = fn;
      __super__.call(this);
    }

    TakeWhileObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new TakeWhileObserver(o, this));
    };

    return TakeWhileObservable;
  }(ObservableBase));

  var TakeWhileObserver = (function (__super__) {
    inherits(TakeWhileObserver, __super__);

    function TakeWhileObserver(o, p) {
      this._o = o;
      this._p = p;
      this._i = 0;
      this._r = true;
      __super__.call(this);
    }

    TakeWhileObserver.prototype.next = function (x) {
      if (this._r) {
        this._r = tryCatch(this._p._fn)(x, this._i++, this._p);
        if (this._r === errorObj) { return this._o.onError(this._r.e); }
      }
      if (this._r) {
        this._o.onNext(x);
      } else {
        this._o.onCompleted();
      }
    };
    TakeWhileObserver.prototype.error = function (e) { this._o.onError(e); };
    TakeWhileObserver.prototype.completed = function () { this._o.onCompleted(); };

    return TakeWhileObserver;
  }(AbstractObserver));

  /**
   *  Returns elements from an observable sequence as long as a specified condition is true.
   *  The element's index is used in the logic of the predicate function.
   * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence that contains the elements from the input sequence that occur before the element at which the test no longer passes.
   */
  observableProto.takeWhile = function (predicate, thisArg) {
    var fn = bindCallback(predicate, thisArg, 3);
    return new TakeWhileObservable(this, fn);
  };

  var FilterObservable = (function (__super__) {
    inherits(FilterObservable, __super__);

    function FilterObservable(source, predicate, thisArg) {
      this.source = source;
      this.predicate = bindCallback(predicate, thisArg, 3);
      __super__.call(this);
    }

    FilterObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o, this.predicate, this));
    };

    function innerPredicate(predicate, self) {
      return function(x, i, o) { return self.predicate(x, i, o) && predicate.call(this, x, i, o); }
    }

    FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
      return new FilterObservable(this.source, innerPredicate(predicate, this), thisArg);
    };

    inherits(InnerObserver, AbstractObserver);
    function InnerObserver(o, predicate, source) {
      this.o = o;
      this.predicate = predicate;
      this.source = source;
      this.i = 0;
      AbstractObserver.call(this);
    }

    InnerObserver.prototype.next = function(x) {
      var shouldYield = tryCatch(this.predicate)(x, this.i++, this.source);
      if (shouldYield === errorObj) {
        return this.o.onError(shouldYield.e);
      }
      shouldYield && this.o.onNext(x);
    };

    InnerObserver.prototype.error = function (e) {
      this.o.onError(e);
    };

    InnerObserver.prototype.completed = function () {
      this.o.onCompleted();
    };

    return FilterObservable;

  }(ObservableBase));

  /**
  *  Filters the elements of an observable sequence based on a predicate by incorporating the element's index.
  * @param {Function} predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} An observable sequence that contains elements from the input sequence that satisfy the condition.
  */
  observableProto.filter = observableProto.where = function (predicate, thisArg) {
    return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) :
      new FilterObservable(this, predicate, thisArg);
  };

  var ExtremaByObservable = (function (__super__) {
    inherits(ExtremaByObservable, __super__);
    function ExtremaByObservable(source, k, c) {
      this.source = source;
      this._k = k;
      this._c = c;
      __super__.call(this);
    }

    ExtremaByObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new ExtremaByObserver(o, this._k, this._c));
    };

    return ExtremaByObservable;
  }(ObservableBase));

  var ExtremaByObserver = (function (__super__) {
    inherits(ExtremaByObserver, __super__);
    function ExtremaByObserver(o, k, c) {
      this._o = o;
      this._k = k;
      this._c = c;
      this._v = null;
      this._hv = false;
      this._l = [];
      __super__.call(this);
    }

    ExtremaByObserver.prototype.next = function (x) {
      var key = tryCatch(this._k)(x);
      if (key === errorObj) { return this._o.onError(key.e); }
      var comparison = 0;
      if (!this._hv) {
        this._hv = true;
        this._v = key;
      } else {
        comparison = tryCatch(this._c)(key, this._v);
        if (comparison === errorObj) { return this._o.onError(comparison.e); }
      }
      if (comparison > 0) {
        this._v = key;
        this._l = [];
      }
      if (comparison >= 0) { this._l.push(x); }
    };

    ExtremaByObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    ExtremaByObserver.prototype.completed = function () {
      this._o.onNext(this._l);
      this._o.onCompleted();
    };

    return ExtremaByObserver;
  }(AbstractObserver));

  function firstOnly(x) {
    if (x.length === 0) { throw new EmptyError(); }
    return x[0];
  }

  var ReduceObservable = (function(__super__) {
    inherits(ReduceObservable, __super__);
    function ReduceObservable(source, accumulator, hasSeed, seed) {
      this.source = source;
      this.accumulator = accumulator;
      this.hasSeed = hasSeed;
      this.seed = seed;
      __super__.call(this);
    }

    ReduceObservable.prototype.subscribeCore = function(observer) {
      return this.source.subscribe(new ReduceObserver(observer,this));
    };

    return ReduceObservable;
  }(ObservableBase));

  var ReduceObserver = (function (__super__) {
    inherits(ReduceObserver, __super__);
    function ReduceObserver(o, parent) {
      this._o = o;
      this._p = parent;
      this._fn = parent.accumulator;
      this._hs = parent.hasSeed;
      this._s = parent.seed;
      this._ha = false;
      this._a = null;
      this._hv = false;
      this._i = 0;
      __super__.call(this);
    }

    ReduceObserver.prototype.next = function (x) {
      !this._hv && (this._hv = true);
      if (this._ha) {
        this._a = tryCatch(this._fn)(this._a, x, this._i, this._p);
      } else {
        this._a = this._hs ? tryCatch(this._fn)(this._s, x, this._i, this._p) : x;
        this._ha = true;
      }
      if (this._a === errorObj) { return this._o.onError(this._a.e); }
      this._i++;
    };

    ReduceObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    ReduceObserver.prototype.completed = function () {
      this._hv && this._o.onNext(this._a);
      !this._hv && this._hs && this._o.onNext(this._s);
      !this._hv && !this._hs && this._o.onError(new EmptyError());
      this._o.onCompleted();
    };

    return ReduceObserver;
  }(AbstractObserver));

  /**
  * Applies an accumulator function over an observable sequence, returning the result of the aggregation as a single element in the result sequence. The specified seed value is used as the initial accumulator value.
  * For aggregation behavior with incremental intermediate results, see Observable.scan.
  * @param {Function} accumulator An accumulator function to be invoked on each element.
  * @param {Any} [seed] The initial accumulator value.
  * @returns {Observable} An observable sequence containing a single element with the final accumulator value.
  */
  observableProto.reduce = function () {
    var hasSeed = false, seed, accumulator = arguments[0];
    if (arguments.length === 2) {
      hasSeed = true;
      seed = arguments[1];
    }
    return new ReduceObservable(this, accumulator, hasSeed, seed);
  };

  var SomeObservable = (function (__super__) {
    inherits(SomeObservable, __super__);
    function SomeObservable(source, fn) {
      this.source = source;
      this._fn = fn;
      __super__.call(this);
    }

    SomeObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new SomeObserver(o, this._fn, this.source));
    };

    return SomeObservable;
  }(ObservableBase));

  var SomeObserver = (function (__super__) {
    inherits(SomeObserver, __super__);

    function SomeObserver(o, fn, s) {
      this._o = o;
      this._fn = fn;
      this._s = s;
      this._i = 0;
      __super__.call(this);
    }

    SomeObserver.prototype.next = function (x) {
      var result = tryCatch(this._fn)(x, this._i++, this._s);
      if (result === errorObj) { return this._o.onError(result.e); }
      if (Boolean(result)) {
        this._o.onNext(true);
        this._o.onCompleted();
      }
    };
    SomeObserver.prototype.error = function (e) { this._o.onError(e); };
    SomeObserver.prototype.completed = function () {
      this._o.onNext(false);
      this._o.onCompleted();
    };

    return SomeObserver;
  }(AbstractObserver));

  /**
   * Determines whether any element of an observable sequence satisfies a condition if present, else if any items are in the sequence.
   * @param {Function} [predicate] A function to test each element for a condition.
   * @returns {Observable} An observable sequence containing a single element determining whether any elements in the source sequence pass the test in the specified predicate if given, else if any items are in the sequence.
   */
  observableProto.some = function (predicate, thisArg) {
    var fn = bindCallback(predicate, thisArg, 3);
    return new SomeObservable(this, fn);
  };

  var IsEmptyObservable = (function (__super__) {
    inherits(IsEmptyObservable, __super__);
    function IsEmptyObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    IsEmptyObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new IsEmptyObserver(o));
    };

    return IsEmptyObservable;
  }(ObservableBase));

  var IsEmptyObserver = (function(__super__) {
    inherits(IsEmptyObserver, __super__);
    function IsEmptyObserver(o) {
      this._o = o;
      __super__.call(this);
    }

    IsEmptyObserver.prototype.next = function () {
      this._o.onNext(false);
      this._o.onCompleted();
    };
    IsEmptyObserver.prototype.error = function (e) { this._o.onError(e); };
    IsEmptyObserver.prototype.completed = function () {
      this._o.onNext(true);
      this._o.onCompleted();
    };

    return IsEmptyObserver;
  }(AbstractObserver));

  /**
   * Determines whether an observable sequence is empty.
   * @returns {Observable} An observable sequence containing a single element determining whether the source sequence is empty.
   */
  observableProto.isEmpty = function () {
    return new IsEmptyObservable(this);
  };

  var EveryObservable = (function (__super__) {
    inherits(EveryObservable, __super__);
    function EveryObservable(source, fn) {
      this.source = source;
      this._fn = fn;
      __super__.call(this);
    }

    EveryObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new EveryObserver(o, this._fn, this.source));
    };

    return EveryObservable;
  }(ObservableBase));

  var EveryObserver = (function (__super__) {
    inherits(EveryObserver, __super__);

    function EveryObserver(o, fn, s) {
      this._o = o;
      this._fn = fn;
      this._s = s;
      this._i = 0;
      __super__.call(this);
    }

    EveryObserver.prototype.next = function (x) {
      var result = tryCatch(this._fn)(x, this._i++, this._s);
      if (result === errorObj) { return this._o.onError(result.e); }
      if (!Boolean(result)) {
        this._o.onNext(false);
        this._o.onCompleted();
      }
    };
    EveryObserver.prototype.error = function (e) { this._o.onError(e); };
    EveryObserver.prototype.completed = function () {
      this._o.onNext(true);
      this._o.onCompleted();
    };

    return EveryObserver;
  }(AbstractObserver));

  /**
   * Determines whether all elements of an observable sequence satisfy a condition.
   * @param {Function} [predicate] A function to test each element for a condition.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence containing a single element determining whether all elements in the source sequence pass the test in the specified predicate.
   */
  observableProto.every = function (predicate, thisArg) {
    var fn = bindCallback(predicate, thisArg, 3);
    return new EveryObservable(this, fn);
  };

  var IncludesObservable = (function (__super__) {
    inherits(IncludesObservable, __super__);
    function IncludesObservable(source, elem, idx) {
      var n = +idx || 0;
      Math.abs(n) === Infinity && (n = 0);

      this.source = source;
      this._elem = elem;
      this._n = n;
      __super__.call(this);
    }

    IncludesObservable.prototype.subscribeCore = function (o) {
      if (this._n < 0) {
        o.onNext(false);
        o.onCompleted();
        return disposableEmpty;
      }

      return this.source.subscribe(new IncludesObserver(o, this._elem, this._n));
    };

    return IncludesObservable;
  }(ObservableBase));

  var IncludesObserver = (function (__super__) {
    inherits(IncludesObserver, __super__);
    function IncludesObserver(o, elem, n) {
      this._o = o;
      this._elem = elem;
      this._n = n;
      this._i = 0;
      __super__.call(this);
    }

    function comparer(a, b) {
      return (a === 0 && b === 0) || (a === b || (isNaN(a) && isNaN(b)));
    }

    IncludesObserver.prototype.next = function (x) {
      if (this._i++ >= this._n && comparer(x, this._elem)) {
        this._o.onNext(true);
        this._o.onCompleted();
      }
    };
    IncludesObserver.prototype.error = function (e) { this._o.onError(e); };
    IncludesObserver.prototype.completed = function () { this._o.onNext(false); this._o.onCompleted(); };

    return IncludesObserver;
  }(AbstractObserver));

  /**
   * Determines whether an observable sequence includes a specified element with an optional equality comparer.
   * @param searchElement The value to locate in the source sequence.
   * @param {Number} [fromIndex] An equality comparer to compare elements.
   * @returns {Observable} An observable sequence containing a single element determining whether the source sequence includes an element that has the specified value from the given index.
   */
  observableProto.includes = function (searchElement, fromIndex) {
    return new IncludesObservable(this, searchElement, fromIndex);
  };

  var CountObservable = (function (__super__) {
    inherits(CountObservable, __super__);
    function CountObservable(source, fn) {
      this.source = source;
      this._fn = fn;
      __super__.call(this);
    }

    CountObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new CountObserver(o, this._fn, this.source));
    };

    return CountObservable;
  }(ObservableBase));

  var CountObserver = (function (__super__) {
    inherits(CountObserver, __super__);

    function CountObserver(o, fn, s) {
      this._o = o;
      this._fn = fn;
      this._s = s;
      this._i = 0;
      this._c = 0;
      __super__.call(this);
    }

    CountObserver.prototype.next = function (x) {
      if (this._fn) {
        var result = tryCatch(this._fn)(x, this._i++, this._s);
        if (result === errorObj) { return this._o.onError(result.e); }
        Boolean(result) && (this._c++);
      } else {
        this._c++;
      }
    };
    CountObserver.prototype.error = function (e) { this._o.onError(e); };
    CountObserver.prototype.completed = function () {
      this._o.onNext(this._c);
      this._o.onCompleted();
    };

    return CountObserver;
  }(AbstractObserver));

  /**
   * Returns an observable sequence containing a value that represents how many elements in the specified observable sequence satisfy a condition if provided, else the count of items.
   * @example
   * res = source.count();
   * res = source.count(function (x) { return x > 3; });
   * @param {Function} [predicate]A function to test each element for a condition.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence containing a single element with a number that represents how many elements in the input sequence satisfy the condition in the predicate function if provided, else the count of items in the sequence.
   */
  observableProto.count = function (predicate, thisArg) {
    var fn = bindCallback(predicate, thisArg, 3);
    return new CountObservable(this, fn);
  };

  var IndexOfObservable = (function (__super__) {
    inherits(IndexOfObservable, __super__);
    function IndexOfObservable(source, e, n) {
      this.source = source;
      this._e = e;
      this._n = n;
      __super__.call(this);
    }

    IndexOfObservable.prototype.subscribeCore = function (o) {
      if (this._n < 0) {
        o.onNext(-1);
        o.onCompleted();
        return disposableEmpty;
      }

      return this.source.subscribe(new IndexOfObserver(o, this._e, this._n));
    };

    return IndexOfObservable;
  }(ObservableBase));

  var IndexOfObserver = (function (__super__) {
    inherits(IndexOfObserver, __super__);
    function IndexOfObserver(o, e, n) {
      this._o = o;
      this._e = e;
      this._n = n;
      this._i = 0;
      __super__.call(this);
    }

    IndexOfObserver.prototype.next = function (x) {
      if (this._i >= this._n && x === this._e) {
        this._o.onNext(this._i);
        this._o.onCompleted();
      }
      this._i++;
    };
    IndexOfObserver.prototype.error = function (e) { this._o.onError(e); };
    IndexOfObserver.prototype.completed = function () { this._o.onNext(-1); this._o.onCompleted(); };

    return IndexOfObserver;
  }(AbstractObserver));

  /**
   * Returns the first index at which a given element can be found in the observable sequence, or -1 if it is not present.
   * @param {Any} searchElement Element to locate in the array.
   * @param {Number} [fromIndex] The index to start the search.  If not specified, defaults to 0.
   * @returns {Observable} And observable sequence containing the first index at which a given element can be found in the observable sequence, or -1 if it is not present.
   */
  observableProto.indexOf = function(searchElement, fromIndex) {
    var n = +fromIndex || 0;
    Math.abs(n) === Infinity && (n = 0);
    return new IndexOfObservable(this, searchElement, n);
  };

  var SumObservable = (function (__super__) {
    inherits(SumObservable, __super__);
    function SumObservable(source, fn) {
      this.source = source;
      this._fn = fn;
      __super__.call(this);
    }

    SumObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new SumObserver(o, this._fn, this.source));
    };

    return SumObservable;
  }(ObservableBase));

  var SumObserver = (function (__super__) {
    inherits(SumObserver, __super__);

    function SumObserver(o, fn, s) {
      this._o = o;
      this._fn = fn;
      this._s = s;
      this._i = 0;
      this._c = 0;
      __super__.call(this);
    }

    SumObserver.prototype.next = function (x) {
      if (this._fn) {
        var result = tryCatch(this._fn)(x, this._i++, this._s);
        if (result === errorObj) { return this._o.onError(result.e); }
        this._c += result;
      } else {
        this._c += x;
      }
    };
    SumObserver.prototype.error = function (e) { this._o.onError(e); };
    SumObserver.prototype.completed = function () {
      this._o.onNext(this._c);
      this._o.onCompleted();
    };

    return SumObserver;
  }(AbstractObserver));

  /**
   * Computes the sum of a sequence of values that are obtained by invoking an optional transform function on each element of the input sequence, else if not specified computes the sum on each item in the sequence.
   * @param {Function} [selector] A transform function to apply to each element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence containing a single element with the sum of the values in the source sequence.
   */
  observableProto.sum = function (keySelector, thisArg) {
    var fn = bindCallback(keySelector, thisArg, 3);
    return new SumObservable(this, fn);
  };

  /**
   * Returns the elements in an observable sequence with the minimum key value according to the specified comparer.
   * @example
   * var res = source.minBy(function (x) { return x.value; });
   * var res = source.minBy(function (x) { return x.value; }, function (x, y) { return x - y; });
   * @param {Function} keySelector Key selector function.
   * @param {Function} [comparer] Comparer used to compare key values.
   * @returns {Observable} An observable sequence containing a list of zero or more elements that have a minimum key value.
   */
  observableProto.minBy = function (keySelector, comparer) {
    comparer || (comparer = defaultSubComparer);
    return new ExtremaByObservable(this, keySelector, function (x, y) { return comparer(x, y) * -1; });
  };

  /**
   * Returns the minimum element in an observable sequence according to the optional comparer else a default greater than less than check.
   * @example
   * var res = source.min();
   * var res = source.min(function (x, y) { return x.value - y.value; });
   * @param {Function} [comparer] Comparer used to compare elements.
   * @returns {Observable} An observable sequence containing a single element with the minimum element in the source sequence.
   */
  observableProto.min = function (comparer) {
    return this.minBy(identity, comparer).map(firstOnly);
  };

  /**
   * Returns the elements in an observable sequence with the maximum  key value according to the specified comparer.
   * @example
   * var res = source.maxBy(function (x) { return x.value; });
   * var res = source.maxBy(function (x) { return x.value; }, function (x, y) { return x - y;; });
   * @param {Function} keySelector Key selector function.
   * @param {Function} [comparer]  Comparer used to compare key values.
   * @returns {Observable} An observable sequence containing a list of zero or more elements that have a maximum key value.
   */
  observableProto.maxBy = function (keySelector, comparer) {
    comparer || (comparer = defaultSubComparer);
    return new ExtremaByObservable(this, keySelector, comparer);
  };

  /**
   * Returns the maximum value in an observable sequence according to the specified comparer.
   * @example
   * var res = source.max();
   * var res = source.max(function (x, y) { return x.value - y.value; });
   * @param {Function} [comparer] Comparer used to compare elements.
   * @returns {Observable} An observable sequence containing a single element with the maximum element in the source sequence.
   */
  observableProto.max = function (comparer) {
    return this.maxBy(identity, comparer).map(firstOnly);
  };

  var AverageObservable = (function (__super__) {
    inherits(AverageObservable, __super__);
    function AverageObservable(source, fn) {
      this.source = source;
      this._fn = fn;
      __super__.call(this);
    }

    AverageObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new AverageObserver(o, this._fn, this.source));
    };

    return AverageObservable;
  }(ObservableBase));

  var AverageObserver = (function(__super__) {
    inherits(AverageObserver, __super__);
    function AverageObserver(o, fn, s) {
      this._o = o;
      this._fn = fn;
      this._s = s;
      this._c = 0;
      this._t = 0;
      __super__.call(this);
    }

    AverageObserver.prototype.next = function (x) {
      if(this._fn) {
        var r = tryCatch(this._fn)(x, this._c++, this._s);
        if (r === errorObj) { return this._o.onError(r.e); }
        this._t += r;
      } else {
        this._c++;
        this._t += x;
      }
    };
    AverageObserver.prototype.error = function (e) { this._o.onError(e); };
    AverageObserver.prototype.completed = function () {
      if (this._c === 0) { return this._o.onError(new EmptyError()); }
      this._o.onNext(this._t / this._c);
      this._o.onCompleted();
    };

    return AverageObserver;
  }(AbstractObserver));

  /**
   * Computes the average of an observable sequence of values that are in the sequence or obtained by invoking a transform function on each element of the input sequence if present.
   * @param {Function} [selector] A transform function to apply to each element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence containing a single element with the average of the sequence of values.
   */
  observableProto.average = function (keySelector, thisArg) {
    var source = this, fn;
    if (isFunction(keySelector)) {
      fn = bindCallback(keySelector, thisArg, 3);
    }
    return new AverageObservable(source, fn);
  };

  /**
   *  Determines whether two sequences are equal by comparing the elements pairwise using a specified equality comparer.
   *
   * @example
   * var res = res = source.sequenceEqual([1,2,3]);
   * var res = res = source.sequenceEqual([{ value: 42 }], function (x, y) { return x.value === y.value; });
   * 3 - res = source.sequenceEqual(Rx.Observable.returnValue(42));
   * 4 - res = source.sequenceEqual(Rx.Observable.returnValue({ value: 42 }), function (x, y) { return x.value === y.value; });
   * @param {Observable} second Second observable sequence or array to compare.
   * @param {Function} [comparer] Comparer used to compare elements of both sequences.
   * @returns {Observable} An observable sequence that contains a single element which indicates whether both sequences are of equal length and their corresponding elements are equal according to the specified equality comparer.
   */
  observableProto.sequenceEqual = function (second, comparer) {
    var first = this;
    comparer || (comparer = defaultComparer);
    return new AnonymousObservable(function (o) {
      var donel = false, doner = false, ql = [], qr = [];
      var subscription1 = first.subscribe(function (x) {
        if (qr.length > 0) {
          var v = qr.shift();
          var equal = tryCatch(comparer)(v, x);
          if (equal === errorObj) { return o.onError(equal.e); }
          if (!equal) {
            o.onNext(false);
            o.onCompleted();
          }
        } else if (doner) {
          o.onNext(false);
          o.onCompleted();
        } else {
          ql.push(x);
        }
      }, function(e) { o.onError(e); }, function () {
        donel = true;
        if (ql.length === 0) {
          if (qr.length > 0) {
            o.onNext(false);
            o.onCompleted();
          } else if (doner) {
            o.onNext(true);
            o.onCompleted();
          }
        }
      });

      (isArrayLike(second) || isIterable(second)) && (second = observableFrom(second));
      isPromise(second) && (second = observableFromPromise(second));
      var subscription2 = second.subscribe(function (x) {
        if (ql.length > 0) {
          var v = ql.shift();
          var equal = tryCatch(comparer)(v, x);
          if (equal === errorObj) { return o.onError(equal.e); }
          if (!equal) {
            o.onNext(false);
            o.onCompleted();
          }
        } else if (donel) {
          o.onNext(false);
          o.onCompleted();
        } else {
          qr.push(x);
        }
      }, function(e) { o.onError(e); }, function () {
        doner = true;
        if (qr.length === 0) {
          if (ql.length > 0) {
            o.onNext(false);
            o.onCompleted();
          } else if (donel) {
            o.onNext(true);
            o.onCompleted();
          }
        }
      });
      return new BinaryDisposable(subscription1, subscription2);
    }, first);
  };

  var ElementAtObservable = (function (__super__) {
    inherits(ElementAtObservable, __super__);
    function ElementAtObservable(source, i, d) {
      this.source = source;
      this._i = i;
      this._d = d;
      __super__.call(this);
    }

    ElementAtObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new ElementAtObserver(o, this._i, this._d));
    };

    return ElementAtObservable;
  }(ObservableBase));

  var ElementAtObserver = (function (__super__) {
    inherits(ElementAtObserver, __super__);

    function ElementAtObserver(o, i, d) {
      this._o = o;
      this._i = i;
      this._d = d;
      __super__.call(this);
    }

    ElementAtObserver.prototype.next = function (x) {
      if (this._i-- === 0) {
        this._o.onNext(x);
        this._o.onCompleted();
      }
    };
    ElementAtObserver.prototype.error = function (e) { this._o.onError(e); };
    ElementAtObserver.prototype.completed = function () {
      if (this._d === undefined) {
        this._o.onError(new ArgumentOutOfRangeError());
      } else {
        this._o.onNext(this._d);
        this._o.onCompleted();
      }
    };

    return ElementAtObserver;
  }(AbstractObserver));

  /**
   * Returns the element at a specified index in a sequence or default value if not found.
   * @param {Number} index The zero-based index of the element to retrieve.
   * @param {Any} [defaultValue] The default value to use if elementAt does not find a value.
   * @returns {Observable} An observable sequence that produces the element at the specified position in the source sequence.
   */
  observableProto.elementAt =  function (index, defaultValue) {
    if (index < 0) { throw new ArgumentOutOfRangeError(); }
    return new ElementAtObservable(this, index, defaultValue);
  };

  var SingleObserver = (function(__super__) {
    inherits(SingleObserver, __super__);
    function SingleObserver(o, obj, s) {
      this._o = o;
      this._obj = obj;
      this._s = s;
      this._i = 0;
      this._hv = false;
      this._v = null;
      __super__.call(this);
    }

    SingleObserver.prototype.next = function (x) {
      var shouldYield = false;
      if (this._obj.predicate) {
        var res = tryCatch(this._obj.predicate)(x, this._i++, this._s);
        if (res === errorObj) { return this._o.onError(res.e); }
        Boolean(res) && (shouldYield = true);
      } else if (!this._obj.predicate) {
        shouldYield = true;
      }
      if (shouldYield) {
        if (this._hv) {
          return this._o.onError(new Error('Sequence contains more than one matching element'));
        }
        this._hv = true;
        this._v = x;
      }
    };
    SingleObserver.prototype.error = function (e) { this._o.onError(e); };
    SingleObserver.prototype.completed = function () {
      if (this._hv) {
        this._o.onNext(this._v);
        this._o.onCompleted();
      }
      else if (this._obj.defaultValue === undefined) {
        this._o.onError(new EmptyError());
      } else {
        this._o.onNext(this._obj.defaultValue);
        this._o.onCompleted();
      }
    };

    return SingleObserver;
  }(AbstractObserver));


    /**
     * Returns the only element of an observable sequence that satisfies the condition in the optional predicate, and reports an exception if there is not exactly one element in the observable sequence.
     * @returns {Observable} Sequence containing the single element in the observable sequence that satisfies the condition in the predicate.
     */
    observableProto.single = function (predicate, thisArg) {
      var obj = {}, source = this;
      if (typeof arguments[0] === 'object') {
        obj = arguments[0];
      } else {
        obj = {
          predicate: arguments[0],
          thisArg: arguments[1],
          defaultValue: arguments[2]
        };
      }
      if (isFunction (obj.predicate)) {
        var fn = obj.predicate;
        obj.predicate = bindCallback(fn, obj.thisArg, 3);
      }
      return new AnonymousObservable(function (o) {
        return source.subscribe(new SingleObserver(o, obj, source));
      }, source);
    };

  var FirstObservable = (function (__super__) {
    inherits(FirstObservable, __super__);
    function FirstObservable(source, obj) {
      this.source = source;
      this._obj = obj;
      __super__.call(this);
    }

    FirstObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new FirstObserver(o, this._obj, this.source));
    };

    return FirstObservable;
  }(ObservableBase));

  var FirstObserver = (function(__super__) {
    inherits(FirstObserver, __super__);
    function FirstObserver(o, obj, s) {
      this._o = o;
      this._obj = obj;
      this._s = s;
      this._i = 0;
      __super__.call(this);
    }

    FirstObserver.prototype.next = function (x) {
      if (this._obj.predicate) {
        var res = tryCatch(this._obj.predicate)(x, this._i++, this._s);
        if (res === errorObj) { return this._o.onError(res.e); }
        if (Boolean(res)) {
          this._o.onNext(x);
          this._o.onCompleted();
        }
      } else if (!this._obj.predicate) {
        this._o.onNext(x);
        this._o.onCompleted();
      }
    };
    FirstObserver.prototype.error = function (e) { this._o.onError(e); };
    FirstObserver.prototype.completed = function () {
      if (this._obj.defaultValue === undefined) {
        this._o.onError(new EmptyError());
      } else {
        this._o.onNext(this._obj.defaultValue);
        this._o.onCompleted();
      }
    };

    return FirstObserver;
  }(AbstractObserver));

  /**
   * Returns the first element of an observable sequence that satisfies the condition in the predicate if present else the first item in the sequence.
   * @returns {Observable} Sequence containing the first element in the observable sequence that satisfies the condition in the predicate if provided, else the first item in the sequence.
   */
  observableProto.first = function () {
    var obj = {}, source = this;
    if (typeof arguments[0] === 'object') {
      obj = arguments[0];
    } else {
      obj = {
        predicate: arguments[0],
        thisArg: arguments[1],
        defaultValue: arguments[2]
      };
    }
    if (isFunction (obj.predicate)) {
      var fn = obj.predicate;
      obj.predicate = bindCallback(fn, obj.thisArg, 3);
    }
    return new FirstObservable(this, obj);
  };

  var LastObservable = (function (__super__) {
    inherits(LastObservable, __super__);
    function LastObservable(source, obj) {
      this.source = source;
      this._obj = obj;
      __super__.call(this);
    }

    LastObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new LastObserver(o, this._obj, this.source));
    };

    return LastObservable;
  }(ObservableBase));

  var LastObserver = (function(__super__) {
    inherits(LastObserver, __super__);
    function LastObserver(o, obj, s) {
      this._o = o;
      this._obj = obj;
      this._s = s;
      this._i = 0;
      this._hv = false;
      this._v = null;
      __super__.call(this);
    }

    LastObserver.prototype.next = function (x) {
      var shouldYield = false;
      if (this._obj.predicate) {
        var res = tryCatch(this._obj.predicate)(x, this._i++, this._s);
        if (res === errorObj) { return this._o.onError(res.e); }
        Boolean(res) && (shouldYield = true);
      } else if (!this._obj.predicate) {
        shouldYield = true;
      }
      if (shouldYield) {
        this._hv = true;
        this._v = x;
      }
    };
    LastObserver.prototype.error = function (e) { this._o.onError(e); };
    LastObserver.prototype.completed = function () {
      if (this._hv) {
        this._o.onNext(this._v);
        this._o.onCompleted();
      }
      else if (this._obj.defaultValue === undefined) {
        this._o.onError(new EmptyError());
      } else {
        this._o.onNext(this._obj.defaultValue);
        this._o.onCompleted();
      }
    };

    return LastObserver;
  }(AbstractObserver));

  /**
   * Returns the last element of an observable sequence that satisfies the condition in the predicate if specified, else the last element.
   * @returns {Observable} Sequence containing the last element in the observable sequence that satisfies the condition in the predicate.
   */
  observableProto.last = function () {
    var obj = {}, source = this;
    if (typeof arguments[0] === 'object') {
      obj = arguments[0];
    } else {
      obj = {
        predicate: arguments[0],
        thisArg: arguments[1],
        defaultValue: arguments[2]
      };
    }
    if (isFunction (obj.predicate)) {
      var fn = obj.predicate;
      obj.predicate = bindCallback(fn, obj.thisArg, 3);
    }
    return new LastObservable(this, obj);
  };

  var FindValueObserver = (function(__super__) {
    inherits(FindValueObserver, __super__);
    function FindValueObserver(observer, source, callback, yieldIndex) {
      this._o = observer;
      this._s = source;
      this._cb = callback;
      this._y = yieldIndex;
      this._i = 0;
      __super__.call(this);
    }

    FindValueObserver.prototype.next = function (x) {
      var shouldRun = tryCatch(this._cb)(x, this._i, this._s);
      if (shouldRun === errorObj) { return this._o.onError(shouldRun.e); }
      if (shouldRun) {
        this._o.onNext(this._y ? this._i : x);
        this._o.onCompleted();
      } else {
        this._i++;
      }
    };

    FindValueObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    FindValueObserver.prototype.completed = function () {
      this._y && this._o.onNext(-1);
      this._o.onCompleted();
    };

    return FindValueObserver;
  }(AbstractObserver));

  function findValue (source, predicate, thisArg, yieldIndex) {
    var callback = bindCallback(predicate, thisArg, 3);
    return new AnonymousObservable(function (o) {
      return source.subscribe(new FindValueObserver(o, source, callback, yieldIndex));
    }, source);
  }

  /**
   * Searches for an element that matches the conditions defined by the specified predicate, and returns the first occurrence within the entire Observable sequence.
   * @param {Function} predicate The predicate that defines the conditions of the element to search for.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} An Observable sequence with the first element that matches the conditions defined by the specified predicate, if found; otherwise, undefined.
   */
  observableProto.find = function (predicate, thisArg) {
    return findValue(this, predicate, thisArg, false);
  };

  /**
   * Searches for an element that matches the conditions defined by the specified predicate, and returns
   * an Observable sequence with the zero-based index of the first occurrence within the entire Observable sequence.
   * @param {Function} predicate The predicate that defines the conditions of the element to search for.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} An Observable sequence with the zero-based index of the first occurrence of an element that matches the conditions defined by match, if found; otherwise, –1.
  */
  observableProto.findIndex = function (predicate, thisArg) {
    return findValue(this, predicate, thisArg, true);
  };

  var ToSetObservable = (function (__super__) {
    inherits(ToSetObservable, __super__);
    function ToSetObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    ToSetObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new ToSetObserver(o));
    };

    return ToSetObservable;
  }(ObservableBase));

  var ToSetObserver = (function (__super__) {
    inherits(ToSetObserver, __super__);
    function ToSetObserver(o) {
      this._o = o;
      this._s = new root.Set();
      __super__.call(this);
    }

    ToSetObserver.prototype.next = function (x) {
      this._s.add(x);
    };

    ToSetObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    ToSetObserver.prototype.completed = function () {
      this._o.onNext(this._s);
      this._o.onCompleted();
    };

    return ToSetObserver;
  }(AbstractObserver));

  /**
   * Converts the observable sequence to a Set if it exists.
   * @returns {Observable} An observable sequence with a single value of a Set containing the values from the observable sequence.
   */
  observableProto.toSet = function () {
    if (typeof root.Set === 'undefined') { throw new TypeError(); }
    return new ToSetObservable(this);
  };

  var ToMapObservable = (function (__super__) {
    inherits(ToMapObservable, __super__);
    function ToMapObservable(source, k, e) {
      this.source = source;
      this._k = k;
      this._e = e;
      __super__.call(this);
    }

    ToMapObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new ToMapObserver(o, this._k, this._e));
    };

    return ToMapObservable;
  }(ObservableBase));

  var ToMapObserver = (function (__super__) {
    inherits(ToMapObserver, __super__);
    function ToMapObserver(o, k, e) {
      this._o = o;
      this._k = k;
      this._e = e;
      this._m = new root.Map();
      __super__.call(this);
    }

    ToMapObserver.prototype.next = function (x) {
      var key = tryCatch(this._k)(x);
      if (key === errorObj) { return this._o.onError(key.e); }
      var elem = x;
      if (this._e) {
        elem = tryCatch(this._e)(x);
        if (elem === errorObj) { return this._o.onError(elem.e); }
      }

      this._m.set(key, elem);
    };

    ToMapObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    ToMapObserver.prototype.completed = function () {
      this._o.onNext(this._m);
      this._o.onCompleted();
    };

    return ToMapObserver;
  }(AbstractObserver));

  /**
  * Converts the observable sequence to a Map if it exists.
  * @param {Function} keySelector A function which produces the key for the Map.
  * @param {Function} [elementSelector] An optional function which produces the element for the Map. If not present, defaults to the value from the observable sequence.
  * @returns {Observable} An observable sequence with a single value of a Map containing the values from the observable sequence.
  */
  observableProto.toMap = function (keySelector, elementSelector) {
    if (typeof root.Map === 'undefined') { throw new TypeError(); }
    return new ToMapObservable(this, keySelector, elementSelector);
  };

  var SliceObservable = (function (__super__) {
    inherits(SliceObservable, __super__);
    function SliceObservable(source, b, e) {
      this.source = source;
      this._b = b;
      this._e = e;
      __super__.call(this);
    }

    SliceObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new SliceObserver(o, this._b, this._e));
    };

    return SliceObservable;
  }(ObservableBase));

  var SliceObserver = (function (__super__) {
    inherits(SliceObserver, __super__);

    function SliceObserver(o, b, e) {
      this._o = o;
      this._b = b;
      this._e = e;
      this._i = 0;
      __super__.call(this);
    }

    SliceObserver.prototype.next = function (x) {
      if (this._i >= this._b) {
        if (this._e === this._i) {
          this._o.onCompleted();
        } else {
          this._o.onNext(x);
        }
      }
      this._i++;
    };
    SliceObserver.prototype.error = function (e) { this._o.onError(e); };
    SliceObserver.prototype.completed = function () { this._o.onCompleted(); };

    return SliceObserver;
  }(AbstractObserver));

  /*
  * The slice() method returns a shallow copy of a portion of an Observable into a new Observable object.
  * Unlike the array version, this does not support negative numbers for being or end.
  * @param {Number} [begin] Zero-based index at which to begin extraction. If omitted, this will default to zero.
  * @param {Number} [end] Zero-based index at which to end extraction. slice extracts up to but not including end.
  * If omitted, this will emit the rest of the Observable object.
  * @returns {Observable} A shallow copy of a portion of an Observable into a new Observable object.
  */
  observableProto.slice = function (begin, end) {
    var start = begin || 0;
    if (start < 0) { throw new Rx.ArgumentOutOfRangeError(); }
    if (typeof end === 'number' && end < start) {
      throw new Rx.ArgumentOutOfRangeError();
    }
    return new SliceObservable(this, start, end);
  };

  var LastIndexOfObservable = (function (__super__) {
    inherits(LastIndexOfObservable, __super__);
    function LastIndexOfObservable(source, e, n) {
      this.source = source;
      this._e = e;
      this._n = n;
      __super__.call(this);
    }

    LastIndexOfObservable.prototype.subscribeCore = function (o) {
      if (this._n < 0) {
        o.onNext(-1);
        o.onCompleted();
        return disposableEmpty;
      }

      return this.source.subscribe(new LastIndexOfObserver(o, this._e, this._n));
    };

    return LastIndexOfObservable;
  }(ObservableBase));

  var LastIndexOfObserver = (function (__super__) {
    inherits(LastIndexOfObserver, __super__);
    function LastIndexOfObserver(o, e, n) {
      this._o = o;
      this._e = e;
      this._n = n;
      this._v = 0;
      this._hv = false;
      this._i = 0;
      __super__.call(this);
    }

    LastIndexOfObserver.prototype.next = function (x) {
      if (this._i >= this._n && x === this._e) {
        this._hv = true;
        this._v = this._i;
      }
      this._i++;
    };
    LastIndexOfObserver.prototype.error = function (e) { this._o.onError(e); };
    LastIndexOfObserver.prototype.completed = function () {
      if (this._hv) {
        this._o.onNext(this._v);
      } else {
        this._o.onNext(-1);
      }
      this._o.onCompleted();
    };

    return LastIndexOfObserver;
  }(AbstractObserver));

  /**
   * Returns the last index at which a given element can be found in the observable sequence, or -1 if it is not present.
   * @param {Any} searchElement Element to locate in the array.
   * @param {Number} [fromIndex] The index to start the search.  If not specified, defaults to 0.
   * @returns {Observable} And observable sequence containing the last index at which a given element can be found in the observable sequence, or -1 if it is not present.
   */
  observableProto.lastIndexOf = function(searchElement, fromIndex) {
    var n = +fromIndex || 0;
    Math.abs(n) === Infinity && (n = 0);
    return new LastIndexOfObservable(this, searchElement, n);
  };

  Observable.wrap = function (fn) {
    function createObservable() {
      return Observable.spawn.call(this, fn.apply(this, arguments));
    }

    createObservable.__generatorFunction__ = fn;
    return createObservable;
  };

  var spawn = Observable.spawn = function () {
    var gen = arguments[0], self = this, args = [];
    for (var i = 1, len = arguments.length; i < len; i++) { args.push(arguments[i]); }

    return new AnonymousObservable(function (o) {
      var g = new CompositeDisposable();

      if (isFunction(gen)) { gen = gen.apply(self, args); }
      if (!gen || !isFunction(gen.next)) {
        o.onNext(gen);
        return o.onCompleted();
      }

      function processGenerator(res) {
        var ret = tryCatch(gen.next).call(gen, res);
        if (ret === errorObj) { return o.onError(ret.e); }
        next(ret);
      }

      processGenerator();

      function onError(err) {
        var ret = tryCatch(gen.next).call(gen, err);
        if (ret === errorObj) { return o.onError(ret.e); }
        next(ret);
      }

      function next(ret) {
        if (ret.done) {
          o.onNext(ret.value);
          o.onCompleted();
          return;
        }
        var obs = toObservable.call(self, ret.value);
        var value = null;
        var hasValue = false;
        if (Observable.isObservable(obs)) {
          g.add(obs.subscribe(function(val) {
            hasValue = true;
            value = val;
          }, onError, function() {
            hasValue && processGenerator(value);
          }));
        } else {
          onError(new TypeError('type not supported'));
        }
      }

      return g;
    });
  };

  function toObservable(obj) {
    if (!obj) { return obj; }
    if (Observable.isObservable(obj)) { return obj; }
    if (isPromise(obj)) { return Observable.fromPromise(obj); }
    if (isGeneratorFunction(obj) || isGenerator(obj)) { return spawn.call(this, obj); }
    if (isFunction(obj)) { return thunkToObservable.call(this, obj); }
    if (isArrayLike(obj) || isIterable(obj)) { return arrayToObservable.call(this, obj); }
    if (isObject(obj)) {return objectToObservable.call(this, obj);}
    return obj;
  }

  function arrayToObservable (obj) {
    return Observable.from(obj).concatMap(function(o) {
      if(Observable.isObservable(o) || isObject(o)) {
        return toObservable.call(null, o);
      } else {
        return Rx.Observable.just(o);
      }
    }).toArray();
  }

  function objectToObservable (obj) {
    var results = new obj.constructor(), keys = Object.keys(obj), observables = [];
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i];
      var observable = toObservable.call(this, obj[key]);

      if(observable && Observable.isObservable(observable)) {
        defer(observable, key);
      } else {
        results[key] = obj[key];
      }
    }

    return Observable.forkJoin.apply(Observable, observables).map(function() {
      return results;
    });


    function defer (observable, key) {
      results[key] = undefined;
      observables.push(observable.map(function (next) {
        results[key] = next;
      }));
    }
  }

  function thunkToObservable(fn) {
    var self = this;
    return new AnonymousObservable(function (o) {
      fn.call(self, function () {
        var err = arguments[0], res = arguments[1];
        if (err) { return o.onError(err); }
        if (arguments.length > 2) {
          var args = [];
          for (var i = 1, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
          res = args;
        }
        o.onNext(res);
        o.onCompleted();
      });
    });
  }

  function isGenerator(obj) {
    return isFunction (obj.next) && isFunction (obj['throw']);
  }

  function isGeneratorFunction(obj) {
    var ctor = obj.constructor;
    if (!ctor) { return false; }
    if (ctor.name === 'GeneratorFunction' || ctor.displayName === 'GeneratorFunction') { return true; }
    return isGenerator(ctor.prototype);
  }

  function isObject(val) {
    return Object == val.constructor;
  }

  /**
   * Invokes the specified function asynchronously on the specified scheduler, surfacing the result through an observable sequence.
   *
   * @example
   * var res = Rx.Observable.start(function () { console.log('hello'); });
   * var res = Rx.Observable.start(function () { console.log('hello'); }, Rx.Scheduler.timeout);
   * var res = Rx.Observable.start(function () { this.log('hello'); }, Rx.Scheduler.timeout, console);
   *
   * @param {Function} func Function to run asynchronously.
   * @param {Scheduler} [scheduler]  Scheduler to run the function on. If not specified, defaults to Scheduler.timeout.
   * @param [context]  The context for the func parameter to be executed.  If not specified, defaults to undefined.
   * @returns {Observable} An observable sequence exposing the function's result value, or an exception.
   *
   * Remarks
   * * The function is called immediately, not during the subscription of the resulting sequence.
   * * Multiple subscriptions to the resulting sequence can observe the function's result.
   */
  Observable.start = function (func, context, scheduler) {
    return observableToAsync(func, context, scheduler)();
  };

  /**
   * Converts the function into an asynchronous function. Each invocation of the resulting asynchronous function causes an invocation of the original synchronous function on the specified scheduler.
   * @param {Function} function Function to convert to an asynchronous function.
   * @param {Scheduler} [scheduler] Scheduler to run the function on. If not specified, defaults to Scheduler.timeout.
   * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
   * @returns {Function} Asynchronous function.
   */
  var observableToAsync = Observable.toAsync = function (func, context, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return function () {
      var args = arguments,
        subject = new AsyncSubject();

      scheduler.schedule(null, function () {
        var result;
        try {
          result = func.apply(context, args);
        } catch (e) {
          subject.onError(e);
          return;
        }
        subject.onNext(result);
        subject.onCompleted();
      });
      return subject.asObservable();
    };
  };

function createCbObservable(fn, ctx, selector, args) {
  var o = new AsyncSubject();

  args.push(createCbHandler(o, ctx, selector));
  fn.apply(ctx, args);

  return o.asObservable();
}

function createCbHandler(o, ctx, selector) {
  return function handler () {
    var len = arguments.length, results = new Array(len);
    for(var i = 0; i < len; i++) { results[i] = arguments[i]; }

    if (isFunction(selector)) {
      results = tryCatch(selector).apply(ctx, results);
      if (results === errorObj) { return o.onError(results.e); }
      o.onNext(results);
    } else {
      if (results.length <= 1) {
        o.onNext(results[0]);
      } else {
        o.onNext(results);
      }
    }

    o.onCompleted();
  };
}

/**
 * Converts a callback function to an observable sequence.
 *
 * @param {Function} fn Function with a callback as the last parameter to convert to an Observable sequence.
 * @param {Mixed} [ctx] The context for the func parameter to be executed.  If not specified, defaults to undefined.
 * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
 * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
 */
Observable.fromCallback = function (fn, ctx, selector) {
  return function () {
    typeof ctx === 'undefined' && (ctx = this); 

    var len = arguments.length, args = new Array(len)
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return createCbObservable(fn, ctx, selector, args);
  };
};

function createNodeObservable(fn, ctx, selector, args) {
  var o = new AsyncSubject();

  args.push(createNodeHandler(o, ctx, selector));
  fn.apply(ctx, args);

  return o.asObservable();
}

function createNodeHandler(o, ctx, selector) {
  return function handler () {
    var err = arguments[0];
    if (err) { return o.onError(err); }

    var len = arguments.length, results = [];
    for(var i = 1; i < len; i++) { results[i - 1] = arguments[i]; }

    if (isFunction(selector)) {
      var results = tryCatch(selector).apply(ctx, results);
      if (results === errorObj) { return o.onError(results.e); }
      o.onNext(results);
    } else {
      if (results.length <= 1) {
        o.onNext(results[0]);
      } else {
        o.onNext(results);
      }
    }

    o.onCompleted();
  };
}

/**
 * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
 * @param {Function} fn The function to call
 * @param {Mixed} [ctx] The context for the func parameter to be executed.  If not specified, defaults to undefined.
 * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
 * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
 */
Observable.fromNodeCallback = function (fn, ctx, selector) {
  return function () {
    typeof ctx === 'undefined' && (ctx = this); 
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return createNodeObservable(fn, ctx, selector, args);
  };
};

  function isNodeList(el) {
    if (root.StaticNodeList) {
      // IE8 Specific
      // instanceof is slower than Object#toString, but Object#toString will not work as intended in IE8
      return el instanceof root.StaticNodeList || el instanceof root.NodeList;
    } else {
      return Object.prototype.toString.call(el) === '[object NodeList]';
    }
  }

  function ListenDisposable(e, n, fn) {
    this._e = e;
    this._n = n;
    this._fn = fn;
    this._e.addEventListener(this._n, this._fn, false);
    this.isDisposed = false;
  }
  ListenDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this._e.removeEventListener(this._n, this._fn, false);
      this.isDisposed = true;
    }
  };

  function createEventListener (el, eventName, handler) {
    var disposables = new CompositeDisposable();

    // Asume NodeList or HTMLCollection
    var elemToString = Object.prototype.toString.call(el);
    if (isNodeList(el) || elemToString === '[object HTMLCollection]') {
      for (var i = 0, len = el.length; i < len; i++) {
        disposables.add(createEventListener(el.item(i), eventName, handler));
      }
    } else if (el) {
      disposables.add(new ListenDisposable(el, eventName, handler));
    }

    return disposables;
  }

  /**
   * Configuration option to determine whether to use native events only
   */
  Rx.config.useNativeEvents = false;

  var EventObservable = (function(__super__) {
    inherits(EventObservable, __super__);
    function EventObservable(el, name, fn) {
      this._el = el;
      this._n = name;
      this._fn = fn;
      __super__.call(this);
    }

    function createHandler(o, fn) {
      return function handler () {
        var results = arguments[0];
        if (isFunction(fn)) {
          results = tryCatch(fn).apply(null, arguments);
          if (results === errorObj) { return o.onError(results.e); }
        }
        o.onNext(results);
      };
    }

    EventObservable.prototype.subscribeCore = function (o) {
      return createEventListener(
        this._el,
        this._n,
        createHandler(o, this._fn));
    };

    return EventObservable;
  }(ObservableBase));

  /**
   * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
   * @param {Object} element The DOMElement or NodeList to attach a listener.
   * @param {String} eventName The event name to attach the observable sequence.
   * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
   * @returns {Observable} An observable sequence of events from the specified element and the specified event.
   */
  Observable.fromEvent = function (element, eventName, selector) {
    // Node.js specific
    if (element.addListener) {
      return fromEventPattern(
        function (h) { element.addListener(eventName, h); },
        function (h) { element.removeListener(eventName, h); },
        selector);
    }

    // Use only if non-native events are allowed
    if (!Rx.config.useNativeEvents) {
      // Handles jq, Angular.js, Zepto, Marionette, Ember.js
      if (typeof element.on === 'function' && typeof element.off === 'function') {
        return fromEventPattern(
          function (h) { element.on(eventName, h); },
          function (h) { element.off(eventName, h); },
          selector);
      }
    }

    return new EventObservable(element, eventName, selector).publish().refCount();
  };

  var EventPatternObservable = (function(__super__) {
    inherits(EventPatternObservable, __super__);
    function EventPatternObservable(add, del, fn) {
      this._add = add;
      this._del = del;
      this._fn = fn;
      __super__.call(this);
    }

    function createHandler(o, fn) {
      return function handler () {
        var results = arguments[0];
        if (isFunction(fn)) {
          results = tryCatch(fn).apply(null, arguments);
          if (results === errorObj) { return o.onError(results.e); }
        }
        o.onNext(results);
      };
    }

    EventPatternObservable.prototype.subscribeCore = function (o) {
      var fn = createHandler(o, this._fn);
      var returnValue = this._add(fn);
      return new EventPatternDisposable(this._del, fn, returnValue);
    };

    function EventPatternDisposable(del, fn, ret) {
      this._del = del;
      this._fn = fn;
      this._ret = ret;
      this.isDisposed = false;
    }

    EventPatternDisposable.prototype.dispose = function () {
      if(!this.isDisposed) {
        isFunction(this._del) && this._del(this._fn, this._ret);
        this.isDisposed = true;
      }
    };

    return EventPatternObservable;
  }(ObservableBase));

  /**
   * Creates an observable sequence from an event emitter via an addHandler/removeHandler pair.
   * @param {Function} addHandler The function to add a handler to the emitter.
   * @param {Function} [removeHandler] The optional function to remove a handler from an emitter.
   * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
   * @returns {Observable} An observable sequence which wraps an event from an event emitter
   */
  var fromEventPattern = Observable.fromEventPattern = function (addHandler, removeHandler, selector) {
    return new EventPatternObservable(addHandler, removeHandler, selector).publish().refCount();
  };

  /**
   * Invokes the asynchronous function, surfacing the result through an observable sequence.
   * @param {Function} functionAsync Asynchronous function which returns a Promise to run.
   * @returns {Observable} An observable sequence exposing the function's result value, or an exception.
   */
  Observable.startAsync = function (functionAsync) {
    var promise = tryCatch(functionAsync)();
    if (promise === errorObj) { return observableThrow(promise.e); }
    return observableFromPromise(promise);
  };

  var PausableObservable = (function (__super__) {
    inherits(PausableObservable, __super__);
    function PausableObservable(source, pauser) {
      this.source = source;
      this.controller = new Subject();
      this.paused = true;

      if (pauser && pauser.subscribe) {
        this.pauser = this.controller.merge(pauser);
      } else {
        this.pauser = this.controller;
      }

      __super__.call(this);
    }

    PausableObservable.prototype._subscribe = function (o) {
      var conn = this.source.publish(),
        subscription = conn.subscribe(o),
        connection = disposableEmpty;

      var pausable = this.pauser.startWith(!this.paused).distinctUntilChanged().subscribe(function (b) {
        if (b) {
          connection = conn.connect();
        } else {
          connection.dispose();
          connection = disposableEmpty;
        }
      });

      return new NAryDisposable([subscription, connection, pausable]);
    };

    PausableObservable.prototype.pause = function () {
      this.paused = true;
      this.controller.onNext(false);
    };

    PausableObservable.prototype.resume = function () {
      this.paused = false;
      this.controller.onNext(true);
    };

    return PausableObservable;

  }(Observable));

  /**
   * Pauses the underlying observable sequence based upon the observable sequence which yields true/false.
   * @example
   * var pauser = new Rx.Subject();
   * var source = Rx.Observable.interval(100).pausable(pauser);
   * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
   * @returns {Observable} The observable sequence which is paused based upon the pauser.
   */
  observableProto.pausable = function (pauser) {
    return new PausableObservable(this, pauser);
  };

  function combineLatestSource(source, subject, resultSelector) {
    return new AnonymousObservable(function (o) {
      var hasValue = [false, false],
        hasValueAll = false,
        isDone = false,
        values = new Array(2),
        err;

      function next(x, i) {
        values[i] = x;
        hasValue[i] = true;
        if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
          if (err) { return o.onError(err); }
          var res = tryCatch(resultSelector).apply(null, values);
          if (res === errorObj) { return o.onError(res.e); }
          o.onNext(res);
        }
        isDone && values[1] && o.onCompleted();
      }

      return new BinaryDisposable(
        source.subscribe(
          function (x) {
            next(x, 0);
          },
          function (e) {
            if (values[1]) {
              o.onError(e);
            } else {
              err = e;
            }
          },
          function () {
            isDone = true;
            values[1] && o.onCompleted();
          }),
        subject.subscribe(
          function (x) {
            next(x, 1);
          },
          function (e) { o.onError(e); },
          function () {
            isDone = true;
            next(true, 1);
          })
        );
    }, source);
  }

  var PausableBufferedObservable = (function (__super__) {
    inherits(PausableBufferedObservable, __super__);
    function PausableBufferedObservable(source, pauser) {
      this.source = source;
      this.controller = new Subject();
      this.paused = true;

      if (pauser && pauser.subscribe) {
        this.pauser = this.controller.merge(pauser);
      } else {
        this.pauser = this.controller;
      }

      __super__.call(this);
    }

    PausableBufferedObservable.prototype._subscribe = function (o) {
      var q = [], previousShouldFire;

      function drainQueue() { while (q.length > 0) { o.onNext(q.shift()); } }

      var subscription =
        combineLatestSource(
          this.source,
          this.pauser.startWith(!this.paused).distinctUntilChanged(),
          function (data, shouldFire) {
            return { data: data, shouldFire: shouldFire };
          })
          .subscribe(
            function (results) {
              if (previousShouldFire !== undefined && results.shouldFire !== previousShouldFire) {
                previousShouldFire = results.shouldFire;
                // change in shouldFire
                if (results.shouldFire) { drainQueue(); }
              } else {
                previousShouldFire = results.shouldFire;
                // new data
                if (results.shouldFire) {
                  o.onNext(results.data);
                } else {
                  q.push(results.data);
                }
              }
            },
            function (err) {
              drainQueue();
              o.onError(err);
            },
            function () {
              drainQueue();
              o.onCompleted();
            }
          );
      return subscription;      
    };

    PausableBufferedObservable.prototype.pause = function () {
      this.paused = true;
      this.controller.onNext(false);
    };

    PausableBufferedObservable.prototype.resume = function () {
      this.paused = false;
      this.controller.onNext(true);
    };

    return PausableBufferedObservable;

  }(Observable));

  /**
   * Pauses the underlying observable sequence based upon the observable sequence which yields true/false,
   * and yields the values that were buffered while paused.
   * @example
   * var pauser = new Rx.Subject();
   * var source = Rx.Observable.interval(100).pausableBuffered(pauser);
   * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
   * @returns {Observable} The observable sequence which is paused based upon the pauser.
   */
  observableProto.pausableBuffered = function (pauser) {
    return new PausableBufferedObservable(this, pauser);
  };

  var ControlledObservable = (function (__super__) {
    inherits(ControlledObservable, __super__);
    function ControlledObservable (source, enableQueue, scheduler) {
      __super__.call(this);
      this.subject = new ControlledSubject(enableQueue, scheduler);
      this.source = source.multicast(this.subject).refCount();
    }

    ControlledObservable.prototype._subscribe = function (o) {
      return this.source.subscribe(o);
    };

    ControlledObservable.prototype.request = function (numberOfItems) {
      return this.subject.request(numberOfItems == null ? -1 : numberOfItems);
    };

    return ControlledObservable;

  }(Observable));

  var ControlledSubject = (function (__super__) {
    inherits(ControlledSubject, __super__);
    function ControlledSubject(enableQueue, scheduler) {
      enableQueue == null && (enableQueue = true);

      __super__.call(this);
      this.subject = new Subject();
      this.enableQueue = enableQueue;
      this.queue = enableQueue ? [] : null;
      this.requestedCount = 0;
      this.requestedDisposable = null;
      this.error = null;
      this.hasFailed = false;
      this.hasCompleted = false;
      this.scheduler = scheduler || currentThreadScheduler;
    }

    addProperties(ControlledSubject.prototype, Observer, {
      _subscribe: function (o) {
        return this.subject.subscribe(o);
      },
      onCompleted: function () {
        this.hasCompleted = true;
        if (!this.enableQueue || this.queue.length === 0) {
          this.subject.onCompleted();
          this.disposeCurrentRequest();
        } else {
          this.queue.push(Notification.createOnCompleted());
        }
      },
      onError: function (error) {
        this.hasFailed = true;
        this.error = error;
        if (!this.enableQueue || this.queue.length === 0) {
          this.subject.onError(error);
          this.disposeCurrentRequest();
        } else {
          this.queue.push(Notification.createOnError(error));
        }
      },
      onNext: function (value) {
        if (this.requestedCount <= 0) {
          this.enableQueue && this.queue.push(Notification.createOnNext(value));
        } else {
          (this.requestedCount-- === 0) && this.disposeCurrentRequest();
          this.subject.onNext(value);
        }
      },
      _processRequest: function (numberOfItems) {
        if (this.enableQueue) {
          while (this.queue.length > 0 && (numberOfItems > 0 || this.queue[0].kind !== 'N')) {
            var first = this.queue.shift();
            first.accept(this.subject);
            if (first.kind === 'N') {
              numberOfItems--;
            } else {
              this.disposeCurrentRequest();
              this.queue = [];
            }
          }
        }

        return numberOfItems;
      },
      request: function (number) {
        this.disposeCurrentRequest();
        var self = this;

        this.requestedDisposable = this.scheduler.schedule(number,
        function(s, i) {
          var remaining = self._processRequest(i);
          var stopped = self.hasCompleted || self.hasFailed;
          if (!stopped && remaining > 0) {
            self.requestedCount = remaining;

            return disposableCreate(function () {
              self.requestedCount = 0;
            });
              // Scheduled item is still in progress. Return a new
              // disposable to allow the request to be interrupted
              // via dispose.
          }
        });

        return this.requestedDisposable;
      },
      disposeCurrentRequest: function () {
        if (this.requestedDisposable) {
          this.requestedDisposable.dispose();
          this.requestedDisposable = null;
        }
      }
    });

    return ControlledSubject;
  }(Observable));

  /**
   * Attaches a controller to the observable sequence with the ability to queue.
   * @example
   * var source = Rx.Observable.interval(100).controlled();
   * source.request(3); // Reads 3 values
   * @param {bool} enableQueue truthy value to determine if values should be queued pending the next request
   * @param {Scheduler} scheduler determines how the requests will be scheduled
   * @returns {Observable} The observable sequence which only propagates values on request.
   */
  observableProto.controlled = function (enableQueue, scheduler) {

    if (enableQueue && isScheduler(enableQueue)) {
      scheduler = enableQueue;
      enableQueue = true;
    }

    if (enableQueue == null) {  enableQueue = true; }
    return new ControlledObservable(this, enableQueue, scheduler);
  };

  var StopAndWaitObservable = (function (__super__) {
    inherits(StopAndWaitObservable, __super__);
    function StopAndWaitObservable (source) {
      __super__.call(this);
      this.source = source;
    }

    function scheduleMethod(s, self) {
      return self.source.request(1);
    }

    StopAndWaitObservable.prototype._subscribe = function (o) {
      this.subscription = this.source.subscribe(new StopAndWaitObserver(o, this, this.subscription));
      return new BinaryDisposable(
        this.subscription,
        defaultScheduler.schedule(this, scheduleMethod)
      );
    };

    var StopAndWaitObserver = (function (__sub__) {
      inherits(StopAndWaitObserver, __sub__);
      function StopAndWaitObserver (observer, observable, cancel) {
        __sub__.call(this);
        this.observer = observer;
        this.observable = observable;
        this.cancel = cancel;
        this.scheduleDisposable = null;
      }

      StopAndWaitObserver.prototype.completed = function () {
        this.observer.onCompleted();
        this.dispose();
      };

      StopAndWaitObserver.prototype.error = function (error) {
        this.observer.onError(error);
        this.dispose();
      };

      function innerScheduleMethod(s, self) {
        return self.observable.source.request(1);
      }

      StopAndWaitObserver.prototype.next = function (value) {
        this.observer.onNext(value);
        this.scheduleDisposable = defaultScheduler.schedule(this, innerScheduleMethod);
      };

      StopAndWaitObserver.dispose = function () {
        this.observer = null;
        if (this.cancel) {
          this.cancel.dispose();
          this.cancel = null;
        }
        if (this.scheduleDisposable) {
          this.scheduleDisposable.dispose();
          this.scheduleDisposable = null;
        }
        __sub__.prototype.dispose.call(this);
      };

      return StopAndWaitObserver;
    }(AbstractObserver));

    return StopAndWaitObservable;
  }(Observable));


  /**
   * Attaches a stop and wait observable to the current observable.
   * @returns {Observable} A stop and wait observable.
   */
  ControlledObservable.prototype.stopAndWait = function () {
    return new StopAndWaitObservable(this);
  };

  var WindowedObservable = (function (__super__) {
    inherits(WindowedObservable, __super__);
    function WindowedObservable(source, windowSize) {
      __super__.call(this);
      this.source = source;
      this.windowSize = windowSize;
    }

    function scheduleMethod(s, self) {
      return self.source.request(self.windowSize);
    }

    WindowedObservable.prototype._subscribe = function (o) {
      this.subscription = this.source.subscribe(new WindowedObserver(o, this, this.subscription));
      return new BinaryDisposable(
        this.subscription,
        defaultScheduler.schedule(this, scheduleMethod)
      );
    };

    var WindowedObserver = (function (__sub__) {
      inherits(WindowedObserver, __sub__);
      function WindowedObserver(observer, observable, cancel) {
        this.observer = observer;
        this.observable = observable;
        this.cancel = cancel;
        this.received = 0;
        this.scheduleDisposable = null;
        __sub__.call(this);
      }

      WindowedObserver.prototype.completed = function () {
        this.observer.onCompleted();
        this.dispose();
      };

      WindowedObserver.prototype.error = function (error) {
        this.observer.onError(error);
        this.dispose();
      };

      function innerScheduleMethod(s, self) {
        return self.observable.source.request(self.observable.windowSize);
      }

      WindowedObserver.prototype.next = function (value) {
        this.observer.onNext(value);
        this.received = ++this.received % this.observable.windowSize;
        this.received === 0 && (this.scheduleDisposable = defaultScheduler.schedule(this, innerScheduleMethod));
      };

      WindowedObserver.prototype.dispose = function () {
        this.observer = null;
        if (this.cancel) {
          this.cancel.dispose();
          this.cancel = null;
        }
        if (this.scheduleDisposable) {
          this.scheduleDisposable.dispose();
          this.scheduleDisposable = null;
        }
        __sub__.prototype.dispose.call(this);
      };

      return WindowedObserver;
    }(AbstractObserver));

    return WindowedObservable;
  }(Observable));

  /**
   * Creates a sliding windowed observable based upon the window size.
   * @param {Number} windowSize The number of items in the window
   * @returns {Observable} A windowed observable based upon the window size.
   */
  ControlledObservable.prototype.windowed = function (windowSize) {
    return new WindowedObservable(this, windowSize);
  };

  /**
   * Pipes the existing Observable sequence into a Node.js Stream.
   * @param {Stream} dest The destination Node.js stream.
   * @returns {Stream} The destination stream.
   */
  observableProto.pipe = function (dest) {
    var source = this.pausableBuffered();

    function onDrain() {
      source.resume();
    }

    dest.addListener('drain', onDrain);

    source.subscribe(
      function (x) {
        !dest.write(x) && source.pause();
      },
      function (err) {
        dest.emit('error', err);
      },
      function () {
        // Hack check because STDIO is not closable
        !dest._isStdio && dest.end();
        dest.removeListener('drain', onDrain);
      });

    source.resume();

    return dest;
  };

  var MulticastObservable = (function (__super__) {
    inherits(MulticastObservable, __super__);
    function MulticastObservable(source, fn1, fn2) {
      this.source = source;
      this._fn1 = fn1;
      this._fn2 = fn2;
      __super__.call(this);
    }

    MulticastObservable.prototype.subscribeCore = function (o) {
      var connectable = this.source.multicast(this._fn1());
      return new BinaryDisposable(this._fn2(connectable).subscribe(o), connectable.connect());
    };

    return MulticastObservable;
  }(ObservableBase));

  /**
   * Multicasts the source sequence notifications through an instantiated subject into all uses of the sequence within a selector function. Each
   * subscription to the resulting sequence causes a separate multicast invocation, exposing the sequence resulting from the selector function's
   * invocation. For specializations with fixed subject types, see Publish, PublishLast, and Replay.
   *
   * @example
   * 1 - res = source.multicast(observable);
   * 2 - res = source.multicast(function () { return new Subject(); }, function (x) { return x; });
   *
   * @param {Function|Subject} subjectOrSubjectSelector
   * Factory function to create an intermediate subject through which the source sequence's elements will be multicast to the selector function.
   * Or:
   * Subject to push source elements into.
   *
   * @param {Function} [selector] Optional selector function which can use the multicasted source sequence subject to the policies enforced by the created subject. Specified only if <paramref name="subjectOrSubjectSelector" is a factory function.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.multicast = function (subjectOrSubjectSelector, selector) {
    return isFunction(subjectOrSubjectSelector) ?
      new MulticastObservable(this, subjectOrSubjectSelector, selector) :
      new ConnectableObservable(this, subjectOrSubjectSelector);
  };

  /**
   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence.
   * This operator is a specialization of Multicast using a regular Subject.
   *
   * @example
   * var resres = source.publish();
   * var res = source.publish(function (x) { return x; });
   *
   * @param {Function} [selector] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.publish = function (selector) {
    return selector && isFunction(selector) ?
      this.multicast(function () { return new Subject(); }, selector) :
      this.multicast(new Subject());
  };

  /**
   * Returns an observable sequence that shares a single subscription to the underlying sequence.
   * This operator is a specialization of publish which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
   */
  observableProto.share = function () {
    return this.publish().refCount();
  };

  /**
   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence containing only the last notification.
   * This operator is a specialization of Multicast using a AsyncSubject.
   *
   * @example
   * var res = source.publishLast();
   * var res = source.publishLast(function (x) { return x; });
   *
   * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will only receive the last notification of the source.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.publishLast = function (selector) {
    return selector && isFunction(selector) ?
      this.multicast(function () { return new AsyncSubject(); }, selector) :
      this.multicast(new AsyncSubject());
  };

  /**
   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence and starts with initialValue.
   * This operator is a specialization of Multicast using a BehaviorSubject.
   *
   * @example
   * var res = source.publishValue(42);
   * var res = source.publishValue(function (x) { return x.select(function (y) { return y * y; }) }, 42);
   *
   * @param {Function} [selector] Optional selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive immediately receive the initial value, followed by all notifications of the source from the time of the subscription on.
   * @param {Mixed} initialValue Initial value received by observers upon subscription.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.publishValue = function (initialValueOrSelector, initialValue) {
    return arguments.length === 2 ?
      this.multicast(function () {
        return new BehaviorSubject(initialValue);
      }, initialValueOrSelector) :
      this.multicast(new BehaviorSubject(initialValueOrSelector));
  };

  /**
   * Returns an observable sequence that shares a single subscription to the underlying sequence and starts with an initialValue.
   * This operator is a specialization of publishValue which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
   * @param {Mixed} initialValue Initial value received by observers upon subscription.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
   */
  observableProto.shareValue = function (initialValue) {
    return this.publishValue(initialValue).refCount();
  };

  /**
   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
   * This operator is a specialization of Multicast using a ReplaySubject.
   *
   * @example
   * var res = source.replay(null, 3);
   * var res = source.replay(null, 3, 500);
   * var res = source.replay(null, 3, 500, scheduler);
   * var res = source.replay(function (x) { return x.take(6).repeat(); }, 3, 500, scheduler);
   *
   * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all the notifications of the source subject to the specified replay buffer trimming policy.
   * @param bufferSize [Optional] Maximum element count of the replay buffer.
   * @param windowSize [Optional] Maximum time length of the replay buffer.
   * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.replay = function (selector, bufferSize, windowSize, scheduler) {
    return selector && isFunction(selector) ?
      this.multicast(function () { return new ReplaySubject(bufferSize, windowSize, scheduler); }, selector) :
      this.multicast(new ReplaySubject(bufferSize, windowSize, scheduler));
  };

  /**
   * Returns an observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
   * This operator is a specialization of replay which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
   *
   * @example
   * var res = source.shareReplay(3);
   * var res = source.shareReplay(3, 500);
   * var res = source.shareReplay(3, 500, scheduler);
   *

   * @param bufferSize [Optional] Maximum element count of the replay buffer.
   * @param window [Optional] Maximum time length of the replay buffer.
   * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
   */
  observableProto.shareReplay = function (bufferSize, windowSize, scheduler) {
    return this.replay(null, bufferSize, windowSize, scheduler).refCount();
  };

  var InnerSubscription = function (s, o) {
    this._s = s;
    this._o = o;
  };

  InnerSubscription.prototype.dispose = function () {
    if (!this._s.isDisposed && this._o !== null) {
      var idx = this._s.observers.indexOf(this._o);
      this._s.observers.splice(idx, 1);
      this._o = null;
    }
  };

  var RefCountObservable = (function (__super__) {
    inherits(RefCountObservable, __super__);
    function RefCountObservable(source) {
      this.source = source;
      this._count = 0;
      this._connectableSubscription = null;
      __super__.call(this);
    }

    RefCountObservable.prototype.subscribeCore = function (o) {
      var subscription = this.source.subscribe(o);
      ++this._count === 1 && (this._connectableSubscription = this.source.connect());
      return new RefCountDisposable(this, subscription);
    };

    function RefCountDisposable(p, s) {
      this._p = p;
      this._s = s;
      this.isDisposed = false;
    }

    RefCountDisposable.prototype.dispose = function () {
      if (!this.isDisposed) {
        this.isDisposed = true;
        this._s.dispose();
        --this._p._count === 0 && this._p._connectableSubscription.dispose();
      }
    };

    return RefCountObservable;
  }(ObservableBase));

  var ConnectableObservable = Rx.ConnectableObservable = (function (__super__) {
    inherits(ConnectableObservable, __super__);
    function ConnectableObservable(source, subject) {
      this.source = source;
      this._connection = null;
      this._source = source.asObservable();
      this._subject = subject;
      __super__.call(this);
    }

    function ConnectDisposable(parent, subscription) {
      this._p = parent;
      this._s = subscription;
    }

    ConnectDisposable.prototype.dispose = function () {
      if (this._s) {
        this._s.dispose();
        this._s = null;
        this._p._connection = null;
      }
    };

    ConnectableObservable.prototype.connect = function () {
      if (!this._connection) {
        if (this._subject.isStopped) {
          return disposableEmpty;
        }
        var subscription = this._source.subscribe(this._subject);
        this._connection = new ConnectDisposable(this, subscription);
      }
      return this._connection;
    };

    ConnectableObservable.prototype._subscribe = function (o) {
      return this._subject.subscribe(o);
    };

    ConnectableObservable.prototype.refCount = function () {
      return new RefCountObservable(this);
    };

    return ConnectableObservable;
  }(Observable));

  /**
   * Returns an observable sequence that shares a single subscription to the underlying sequence. This observable sequence
   * can be resubscribed to, even if all prior subscriptions have ended. (unlike `.publish().refCount()`)
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source.
   */
  observableProto.singleInstance = function() {
    var source = this, hasObservable = false, observable;

    function getObservable() {
      if (!hasObservable) {
        hasObservable = true;
        observable = source['finally'](function() { hasObservable = false; }).publish().refCount();
      }
      return observable;
    }

    return new AnonymousObservable(function(o) {
      return getObservable().subscribe(o);
    });
  };

  /**
   *  Correlates the elements of two sequences based on overlapping durations.
   *
   *  @param {Observable} right The right observable sequence to join elements for.
   *  @param {Function} leftDurationSelector A function to select the duration (expressed as an observable sequence) of each element of the left observable sequence, used to determine overlap.
   *  @param {Function} rightDurationSelector A function to select the duration (expressed as an observable sequence) of each element of the right observable sequence, used to determine overlap.
   *  @param {Function} resultSelector A function invoked to compute a result element for any two overlapping elements of the left and right observable sequences. The parameters passed to the function correspond with the elements from the left and right source sequences for which overlap occurs.
   *  @returns {Observable} An observable sequence that contains result elements computed from source elements that have an overlapping duration.
   */
  observableProto.join = function (right, leftDurationSelector, rightDurationSelector, resultSelector) {
    var left = this;
    return new AnonymousObservable(function (o) {
      var group = new CompositeDisposable();
      var leftDone = false, rightDone = false;
      var leftId = 0, rightId = 0;
      var leftMap = new Map(), rightMap = new Map();
      var handleError = function (e) { o.onError(e); };

      group.add(left.subscribe(
        function (value) {
          var id = leftId++, md = new SingleAssignmentDisposable();

          leftMap.set(id, value);
          group.add(md);

          var duration = tryCatch(leftDurationSelector)(value);
          if (duration === errorObj) { return o.onError(duration.e); }

          md.setDisposable(duration.take(1).subscribe(
            noop,
            handleError,
            function () {
              leftMap['delete'](id) && leftMap.size === 0 && leftDone && o.onCompleted();
              group.remove(md);
            }));

          rightMap.forEach(function (v) {
            var result = tryCatch(resultSelector)(value, v);
            if (result === errorObj) { return o.onError(result.e); }
            o.onNext(result);
          });
        },
        handleError,
        function () {
          leftDone = true;
          (rightDone || leftMap.size === 0) && o.onCompleted();
        })
      );

      group.add(right.subscribe(
        function (value) {
          var id = rightId++, md = new SingleAssignmentDisposable();

          rightMap.set(id, value);
          group.add(md);

          var duration = tryCatch(rightDurationSelector)(value);
          if (duration === errorObj) { return o.onError(duration.e); }

          md.setDisposable(duration.take(1).subscribe(
            noop,
            handleError,
            function () {
              rightMap['delete'](id) && rightMap.size === 0 && rightDone && o.onCompleted();
              group.remove(md);
            }));

          leftMap.forEach(function (v) {
            var result = tryCatch(resultSelector)(v, value);
            if (result === errorObj) { return o.onError(result.e); }
            o.onNext(result);
          });
        },
        handleError,
        function () {
          rightDone = true;
          (leftDone || rightMap.size === 0) && o.onCompleted();
        })
      );
      return group;
    }, left);
  };

  /**
   *  Correlates the elements of two sequences based on overlapping durations, and groups the results.
   *
   *  @param {Observable} right The right observable sequence to join elements for.
   *  @param {Function} leftDurationSelector A function to select the duration (expressed as an observable sequence) of each element of the left observable sequence, used to determine overlap.
   *  @param {Function} rightDurationSelector A function to select the duration (expressed as an observable sequence) of each element of the right observable sequence, used to determine overlap.
   *  @param {Function} resultSelector A function invoked to compute a result element for any element of the left sequence with overlapping elements from the right observable sequence. The first parameter passed to the function is an element of the left sequence. The second parameter passed to the function is an observable sequence with elements from the right sequence that overlap with the left sequence's element.
   *  @returns {Observable} An observable sequence that contains result elements computed from source elements that have an overlapping duration.
   */
  observableProto.groupJoin = function (right, leftDurationSelector, rightDurationSelector, resultSelector) {
    var left = this;
    return new AnonymousObservable(function (o) {
      var group = new CompositeDisposable();
      var r = new RefCountDisposable(group);
      var leftMap = new Map(), rightMap = new Map();
      var leftId = 0, rightId = 0;
      var handleError = function (e) { return function (v) { v.onError(e); }; };

      function handleError(e) { };

      group.add(left.subscribe(
        function (value) {
          var s = new Subject();
          var id = leftId++;
          leftMap.set(id, s);

          var result = tryCatch(resultSelector)(value, addRef(s, r));
          if (result === errorObj) {
            leftMap.forEach(handleError(result.e));
            return o.onError(result.e);
          }
          o.onNext(result);

          rightMap.forEach(function (v) { s.onNext(v); });

          var md = new SingleAssignmentDisposable();
          group.add(md);

          var duration = tryCatch(leftDurationSelector)(value);
          if (duration === errorObj) {
            leftMap.forEach(handleError(duration.e));
            return o.onError(duration.e);
          }

          md.setDisposable(duration.take(1).subscribe(
            noop,
            function (e) {
              leftMap.forEach(handleError(e));
              o.onError(e);
            },
            function () {
              leftMap['delete'](id) && s.onCompleted();
              group.remove(md);
            }));
        },
        function (e) {
          leftMap.forEach(handleError(e));
          o.onError(e);
        },
        function () { o.onCompleted(); })
      );

      group.add(right.subscribe(
        function (value) {
          var id = rightId++;
          rightMap.set(id, value);

          var md = new SingleAssignmentDisposable();
          group.add(md);

          var duration = tryCatch(rightDurationSelector)(value);
          if (duration === errorObj) {
            leftMap.forEach(handleError(duration.e));
            return o.onError(duration.e);
          }

          md.setDisposable(duration.take(1).subscribe(
            noop,
            function (e) {
              leftMap.forEach(handleError(e));
              o.onError(e);
            },
            function () {
              rightMap['delete'](id);
              group.remove(md);
            }));

          leftMap.forEach(function (v) { v.onNext(value); });
        },
        function (e) {
          leftMap.forEach(handleError(e));
          o.onError(e);
        })
      );

      return r;
    }, left);
  };

  function toArray(x) { return x.toArray(); }

  /**
   *  Projects each element of an observable sequence into zero or more buffers.
   *  @param {Mixed} bufferOpeningsOrClosingSelector Observable sequence whose elements denote the creation of new windows, or, a function invoked to define the boundaries of the produced windows (a new window is started when the previous one is closed, resulting in non-overlapping windows).
   *  @param {Function} [bufferClosingSelector] A function invoked to define the closing of each produced window. If a closing selector function is specified for the first parameter, this parameter is ignored.
   *  @returns {Observable} An observable sequence of windows.
   */
  observableProto.buffer = function () {
    return this.window.apply(this, arguments)
      .flatMap(toArray);
  };

  /**
   *  Projects each element of an observable sequence into zero or more windows.
   *
   *  @param {Mixed} windowOpeningsOrClosingSelector Observable sequence whose elements denote the creation of new windows, or, a function invoked to define the boundaries of the produced windows (a new window is started when the previous one is closed, resulting in non-overlapping windows).
   *  @param {Function} [windowClosingSelector] A function invoked to define the closing of each produced window. If a closing selector function is specified for the first parameter, this parameter is ignored.
   *  @returns {Observable} An observable sequence of windows.
   */
  observableProto.window = function (windowOpeningsOrClosingSelector, windowClosingSelector) {
    if (arguments.length === 1 && typeof arguments[0] !== 'function') {
      return observableWindowWithBoundaries.call(this, windowOpeningsOrClosingSelector);
    }
    return typeof windowOpeningsOrClosingSelector === 'function' ?
      observableWindowWithClosingSelector.call(this, windowOpeningsOrClosingSelector) :
      observableWindowWithOpenings.call(this, windowOpeningsOrClosingSelector, windowClosingSelector);
  };

  function observableWindowWithOpenings(windowOpenings, windowClosingSelector) {
    return windowOpenings.groupJoin(this, windowClosingSelector, observableEmpty, function (_, win) {
      return win;
    });
  }

  function observableWindowWithBoundaries(windowBoundaries) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var win = new Subject(),
        d = new CompositeDisposable(),
        r = new RefCountDisposable(d);

      observer.onNext(addRef(win, r));

      d.add(source.subscribe(function (x) {
        win.onNext(x);
      }, function (err) {
        win.onError(err);
        observer.onError(err);
      }, function () {
        win.onCompleted();
        observer.onCompleted();
      }));

      isPromise(windowBoundaries) && (windowBoundaries = observableFromPromise(windowBoundaries));

      d.add(windowBoundaries.subscribe(function (w) {
        win.onCompleted();
        win = new Subject();
        observer.onNext(addRef(win, r));
      }, function (err) {
        win.onError(err);
        observer.onError(err);
      }, function () {
        win.onCompleted();
        observer.onCompleted();
      }));

      return r;
    }, source);
  }

  function observableWindowWithClosingSelector(windowClosingSelector) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var m = new SerialDisposable(),
        d = new CompositeDisposable(m),
        r = new RefCountDisposable(d),
        win = new Subject();
      observer.onNext(addRef(win, r));
      d.add(source.subscribe(function (x) {
          win.onNext(x);
      }, function (err) {
          win.onError(err);
          observer.onError(err);
      }, function () {
          win.onCompleted();
          observer.onCompleted();
      }));

      function createWindowClose () {
        var windowClose;
        try {
          windowClose = windowClosingSelector();
        } catch (e) {
          observer.onError(e);
          return;
        }

        isPromise(windowClose) && (windowClose = observableFromPromise(windowClose));

        var m1 = new SingleAssignmentDisposable();
        m.setDisposable(m1);
        m1.setDisposable(windowClose.take(1).subscribe(noop, function (err) {
          win.onError(err);
          observer.onError(err);
        }, function () {
          win.onCompleted();
          win = new Subject();
          observer.onNext(addRef(win, r));
          createWindowClose();
        }));
      }

      createWindowClose();
      return r;
    }, source);
  }

  var PairwiseObservable = (function (__super__) {
    inherits(PairwiseObservable, __super__);
    function PairwiseObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    PairwiseObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new PairwiseObserver(o));
    };

    return PairwiseObservable;
  }(ObservableBase));

  var PairwiseObserver = (function(__super__) {
    inherits(PairwiseObserver, __super__);
    function PairwiseObserver(o) {
      this._o = o;
      this._p = null;
      this._hp = false;
      __super__.call(this);
    }

    PairwiseObserver.prototype.next = function (x) {
      if (this._hp) {
        this._o.onNext([this._p, x]);
      } else {
        this._hp = true;
      }
      this._p = x;
    };
    PairwiseObserver.prototype.error = function (err) { this._o.onError(err); };
    PairwiseObserver.prototype.completed = function () { this._o.onCompleted(); };

    return PairwiseObserver;
  }(AbstractObserver));

  /**
   * Returns a new observable that triggers on the second and subsequent triggerings of the input observable.
   * The Nth triggering of the input observable passes the arguments from the N-1th and Nth triggering as a pair.
   * The argument passed to the N-1th triggering is held in hidden internal state until the Nth triggering occurs.
   * @returns {Observable} An observable that triggers on successive pairs of observations from the input observable as an array.
   */
  observableProto.pairwise = function () {
    return new PairwiseObservable(this);
  };

  /**
   * Returns two observables which partition the observations of the source by the given function.
   * The first will trigger observations for those values for which the predicate returns true.
   * The second will trigger observations for those values where the predicate returns false.
   * The predicate is executed once for each subscribed observer.
   * Both also propagate all error observations arising from the source and each completes
   * when the source completes.
   * @param {Function} predicate
   *    The function to determine which output Observable will trigger a particular observation.
   * @returns {Array}
   *    An array of observables. The first triggers when the predicate returns true,
   *    and the second triggers when the predicate returns false.
  */
  observableProto.partition = function(predicate, thisArg) {
    var fn = bindCallback(predicate, thisArg, 3);
    return [
      this.filter(predicate, thisArg),
      this.filter(function (x, i, o) { return !fn(x, i, o); })
    ];
  };

  var WhileEnumerable = (function(__super__) {
    inherits(WhileEnumerable, __super__);
    function WhileEnumerable(c, s) {
      this.c = c;
      this.s = s;
    }
    WhileEnumerable.prototype[$iterator$] = function () {
      var self = this;
      return {
        next: function () {
          return self.c() ?
           { done: false, value: self.s } :
           { done: true, value: void 0 };
        }
      };
    };
    return WhileEnumerable;
  }(Enumerable));
  
  function enumerableWhile(condition, source) {
    return new WhileEnumerable(condition, source);
  }  

   /**
   *  Returns an observable sequence that is the result of invoking the selector on the source sequence, without sharing subscriptions.
   *  This operator allows for a fluent style of writing queries that use the same sequence multiple times.
   *
   * @param {Function} selector Selector function which can use the source sequence as many times as needed, without sharing subscriptions to the source sequence.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.letBind = observableProto['let'] = function (func) {
    return func(this);
  };

   /**
   *  Determines whether an observable collection contains values. 
   *
   * @example
   *  1 - res = Rx.Observable.if(condition, obs1);
   *  2 - res = Rx.Observable.if(condition, obs1, obs2);
   *  3 - res = Rx.Observable.if(condition, obs1, scheduler);
   * @param {Function} condition The condition which determines if the thenSource or elseSource will be run.
   * @param {Observable} thenSource The observable sequence or Promise that will be run if the condition function returns true.
   * @param {Observable} [elseSource] The observable sequence or Promise that will be run if the condition function returns false. If this is not provided, it defaults to Rx.Observabe.Empty with the specified scheduler.
   * @returns {Observable} An observable sequence which is either the thenSource or elseSource.
   */
  Observable['if'] = function (condition, thenSource, elseSourceOrScheduler) {
    return observableDefer(function () {
      elseSourceOrScheduler || (elseSourceOrScheduler = observableEmpty());

      isPromise(thenSource) && (thenSource = observableFromPromise(thenSource));
      isPromise(elseSourceOrScheduler) && (elseSourceOrScheduler = observableFromPromise(elseSourceOrScheduler));

      // Assume a scheduler for empty only
      typeof elseSourceOrScheduler.now === 'function' && (elseSourceOrScheduler = observableEmpty(elseSourceOrScheduler));
      return condition() ? thenSource : elseSourceOrScheduler;
    });
  };

   /**
   *  Concatenates the observable sequences obtained by running the specified result selector for each element in source.
   * There is an alias for this method called 'forIn' for browsers <IE9
   * @param {Array} sources An array of values to turn into an observable sequence.
   * @param {Function} resultSelector A function to apply to each item in the sources array to turn it into an observable sequence.
   * @returns {Observable} An observable sequence from the concatenated observable sequences.
   */
  Observable['for'] = Observable.forIn = function (sources, resultSelector, thisArg) {
    return enumerableOf(sources, resultSelector, thisArg).concat();
  };

   /**
   *  Repeats source as long as condition holds emulating a while loop.
   * There is an alias for this method called 'whileDo' for browsers <IE9
   *
   * @param {Function} condition The condition which determines if the source will be repeated.
   * @param {Observable} source The observable sequence that will be run if the condition function returns true.
   * @returns {Observable} An observable sequence which is repeated as long as the condition holds.
   */
  var observableWhileDo = Observable['while'] = Observable.whileDo = function (condition, source) {
    isPromise(source) && (source = observableFromPromise(source));
    return enumerableWhile(condition, source).concat();
  };

   /**
   *  Repeats source as long as condition holds emulating a do while loop.
   *
   * @param {Function} condition The condition which determines if the source will be repeated.
   * @param {Observable} source The observable sequence that will be run if the condition function returns true.
   * @returns {Observable} An observable sequence which is repeated as long as the condition holds.
   */
  observableProto.doWhile = function (condition) {
    return observableConcat([this, observableWhileDo(condition, this)]);
  };

   /**
   *  Uses selector to determine which source in sources to use.
   * @param {Function} selector The function which extracts the value for to test in a case statement.
   * @param {Array} sources A object which has keys which correspond to the case statement labels.
   * @param {Observable} [elseSource] The observable sequence or Promise that will be run if the sources are not matched. If this is not provided, it defaults to Rx.Observabe.empty with the specified scheduler.
   *
   * @returns {Observable} An observable sequence which is determined by a case statement.
   */
  Observable['case'] = function (selector, sources, defaultSourceOrScheduler) {
    return observableDefer(function () {
      isPromise(defaultSourceOrScheduler) && (defaultSourceOrScheduler = observableFromPromise(defaultSourceOrScheduler));
      defaultSourceOrScheduler || (defaultSourceOrScheduler = observableEmpty());

      isScheduler(defaultSourceOrScheduler) && (defaultSourceOrScheduler = observableEmpty(defaultSourceOrScheduler));

      var result = sources[selector()];
      isPromise(result) && (result = observableFromPromise(result));

      return result || defaultSourceOrScheduler;
    });
  };

  var ExpandObservable = (function(__super__) {
    inherits(ExpandObservable, __super__);
    function ExpandObservable(source, fn, scheduler) {
      this.source = source;
      this._fn = fn;
      this._scheduler = scheduler;
      __super__.call(this);
    }

    function scheduleRecursive(args, recurse) {
      var state = args[0], self = args[1];
      var work;
      if (state.q.length > 0) {
        work = state.q.shift();
      } else {
        state.isAcquired = false;
        return;
      }
      var m1 = new SingleAssignmentDisposable();
      state.d.add(m1);
      m1.setDisposable(work.subscribe(new ExpandObserver(state, self, m1)));
      recurse([state, self]);
    }

    ExpandObservable.prototype._ensureActive = function (state) {
      var isOwner = false;
      if (state.q.length > 0) {
        isOwner = !state.isAcquired;
        state.isAcquired = true;
      }
      isOwner && state.m.setDisposable(this._scheduler.scheduleRecursive([state, this], scheduleRecursive));
    };

    ExpandObservable.prototype.subscribeCore = function (o) {
      var m = new SerialDisposable(),
        d = new CompositeDisposable(m),
        state = {
          q: [],
          m: m,
          d: d,
          activeCount: 0,
          isAcquired: false,
          o: o
        };

      state.q.push(this.source);
      state.activeCount++;
      this._ensureActive(state);
      return d;
    };

    return ExpandObservable;
  }(ObservableBase));

  var ExpandObserver = (function(__super__) {
    inherits(ExpandObserver, __super__);
    function ExpandObserver(state, parent, m1) {
      this._s = state;
      this._p = parent;
      this._m1 = m1;
      __super__.call(this);
    }

    ExpandObserver.prototype.next = function (x) {
      this._s.o.onNext(x);
      var result = tryCatch(this._p._fn)(x);
      if (result === errorObj) { return this._s.o.onError(result.e); }
      this._s.q.push(result);
      this._s.activeCount++;
      this._p._ensureActive(this._s);
    };

    ExpandObserver.prototype.error = function (e) {
      this._s.o.onError(e);
    };

    ExpandObserver.prototype.completed = function () {
      this._s.d.remove(this._m1);
      this._s.activeCount--;
      this._s.activeCount === 0 && this._s.o.onCompleted();
    };

    return ExpandObserver;
  }(AbstractObserver));

   /**
   *  Expands an observable sequence by recursively invoking selector.
   *
   * @param {Function} selector Selector function to invoke for each produced element, resulting in another sequence to which the selector will be invoked recursively again.
   * @param {Scheduler} [scheduler] Scheduler on which to perform the expansion. If not provided, this defaults to the current thread scheduler.
   * @returns {Observable} An observable sequence containing all the elements produced by the recursive expansion.
   */
  observableProto.expand = function (selector, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new ExpandObservable(this, selector, scheduler);
  };

  function argumentsToArray() {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return args;
  }

  var ForkJoinObservable = (function (__super__) {
    inherits(ForkJoinObservable, __super__);
    function ForkJoinObservable(sources, cb) {
      this._sources = sources;
      this._cb = cb;
      __super__.call(this);
    }

    ForkJoinObservable.prototype.subscribeCore = function (o) {
      if (this._sources.length === 0) {
        o.onCompleted();
        return disposableEmpty;
      }

      var count = this._sources.length;
      var state = {
        finished: false,
        hasResults: new Array(count),
        hasCompleted: new Array(count),
        results: new Array(count)
      };

      var subscriptions = new CompositeDisposable();
      for (var i = 0, len = this._sources.length; i < len; i++) {
        var source = this._sources[i];
        isPromise(source) && (source = observableFromPromise(source));
        subscriptions.add(source.subscribe(new ForkJoinObserver(o, state, i, this._cb, subscriptions)));
      }

      return subscriptions;
    };

    return ForkJoinObservable;
  }(ObservableBase));

  var ForkJoinObserver = (function(__super__) {
    inherits(ForkJoinObserver, __super__);
    function ForkJoinObserver(o, s, i, cb, subs) {
      this._o = o;
      this._s = s;
      this._i = i;
      this._cb = cb;
      this._subs = subs;
      __super__.call(this);
    }

    ForkJoinObserver.prototype.next = function (x) {
      if (!this._s.finished) {
        this._s.hasResults[this._i] = true;
        this._s.results[this._i] = x;
      }
    };

    ForkJoinObserver.prototype.error = function (e) {
      this._s.finished = true;
      this._o.onError(e);
      this._subs.dispose();
    };

    ForkJoinObserver.prototype.completed = function () {
      if (!this._s.finished) {
        if (!this._s.hasResults[this._i]) {
          return this._o.onCompleted();
        }
        this._s.hasCompleted[this._i] = true;
        for (var i = 0; i < this._s.results.length; i++) {
          if (!this._s.hasCompleted[i]) { return; }
        }
        this._s.finished = true;

        var res = tryCatch(this._cb).apply(null, this._s.results);
        if (res === errorObj) { return this._o.onError(res.e); }

        this._o.onNext(res);
        this._o.onCompleted();
      }
    };

    return ForkJoinObserver;
  }(AbstractObserver));

   /**
   *  Runs all observable sequences in parallel and collect their last elements.
   *
   * @example
   *  1 - res = Rx.Observable.forkJoin([obs1, obs2]);
   *  1 - res = Rx.Observable.forkJoin(obs1, obs2, ...);
   * @returns {Observable} An observable sequence with an array collecting the last elements of all the input sequences.
   */
  Observable.forkJoin = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
    Array.isArray(args[0]) && (args = args[0]);
    return new ForkJoinObservable(args, resultSelector);
  };

   /**
   *  Runs two observable sequences in parallel and combines their last elemenets.
   * @param {Observable} second Second observable sequence.
   * @param {Function} resultSelector Result selector function to invoke with the last elements of both sequences.
   * @returns {Observable} An observable sequence with the result of calling the selector function with the last elements of both input sequences.
   */
  observableProto.forkJoin = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    if (Array.isArray(args[0])) {
      args[0].unshift(this);
    } else {
      args.unshift(this);
    }
    return Observable.forkJoin.apply(null, args);
  };

  /**
   * Comonadic bind operator.
   * @param {Function} selector A transform function to apply to each element.
   * @param {Object} scheduler Scheduler used to execute the operation. If not specified, defaults to the ImmediateScheduler.
   * @returns {Observable} An observable sequence which results from the comonadic bind operation.
   */
  observableProto.manySelect = observableProto.extend = function (selector, scheduler) {
    isScheduler(scheduler) || (scheduler = Rx.Scheduler.immediate);
    var source = this;
    return observableDefer(function () {
      var chain;

      return source
        .map(function (x) {
          var curr = new ChainObservable(x);

          chain && chain.onNext(x);
          chain = curr;

          return curr;
        })
        .tap(
          noop,
          function (e) { chain && chain.onError(e); },
          function () { chain && chain.onCompleted(); }
        )
        .observeOn(scheduler)
        .map(selector);
    }, source);
  };

  var ChainObservable = (function (__super__) {
    inherits(ChainObservable, __super__);
    function ChainObservable(head) {
      __super__.call(this);
      this.head = head;
      this.tail = new AsyncSubject();
    }

    addProperties(ChainObservable.prototype, Observer, {
      _subscribe: function (o) {
        var g = new CompositeDisposable();
        g.add(currentThreadScheduler.schedule(this, function (_, self) {
          o.onNext(self.head);
          g.add(self.tail.mergeAll().subscribe(o));
        }));

        return g;
      },
      onCompleted: function () {
        this.onNext(Observable.empty());
      },
      onError: function (e) {
        this.onNext(Observable['throw'](e));
      },
      onNext: function (v) {
        this.tail.onNext(v);
        this.tail.onCompleted();
      }
    });

    return ChainObservable;

  }(Observable));

  var Map = root.Map || (function () {
    function Map() {
      this.size = 0;
      this._values = [];
      this._keys = [];
    }

    Map.prototype['delete'] = function (key) {
      var i = this._keys.indexOf(key);
      if (i === -1) { return false; }
      this._values.splice(i, 1);
      this._keys.splice(i, 1);
      this.size--;
      return true;
    };

    Map.prototype.get = function (key) {
      var i = this._keys.indexOf(key);
      return i === -1 ? undefined : this._values[i];
    };

    Map.prototype.set = function (key, value) {
      var i = this._keys.indexOf(key);
      if (i === -1) {
        this._keys.push(key);
        this._values.push(value);
        this.size++;
      } else {
        this._values[i] = value;
      }
      return this;
    };

    Map.prototype.forEach = function (cb, thisArg) {
      for (var i = 0; i < this.size; i++) {
        cb.call(thisArg, this._values[i], this._keys[i]);
      }
    };

    return Map;
  }());

  /**
   * @constructor
   * Represents a join pattern over observable sequences.
   */
  function Pattern(patterns) {
    this.patterns = patterns;
  }

  /**
   *  Creates a pattern that matches the current plan matches and when the specified observable sequences has an available value.
   *  @param other Observable sequence to match in addition to the current pattern.
   *  @return {Pattern} Pattern object that matches when all observable sequences in the pattern have an available value.
   */
  Pattern.prototype.and = function (other) {
    return new Pattern(this.patterns.concat(other));
  };

  /**
   *  Matches when all observable sequences in the pattern (specified using a chain of and operators) have an available value and projects the values.
   *  @param {Function} selector Selector that will be invoked with available values from the source sequences, in the same order of the sequences in the pattern.
   *  @return {Plan} Plan that produces the projected values, to be fed (with other plans) to the when operator.
   */
  Pattern.prototype.thenDo = function (selector) {
    return new Plan(this, selector);
  };

  function Plan(expression, selector) {
    this.expression = expression;
    this.selector = selector;
  }

  function handleOnError(o) { return function (e) { o.onError(e); }; }
  function handleOnNext(self, observer) {
    return function onNext () {
      var result = tryCatch(self.selector).apply(self, arguments);
      if (result === errorObj) { return observer.onError(result.e); }
      observer.onNext(result);
    };
  }

  Plan.prototype.activate = function (externalSubscriptions, observer, deactivate) {
    var joinObservers = [], errHandler = handleOnError(observer);
    for (var i = 0, len = this.expression.patterns.length; i < len; i++) {
      joinObservers.push(planCreateObserver(externalSubscriptions, this.expression.patterns[i], errHandler));
    }
    var activePlan = new ActivePlan(joinObservers, handleOnNext(this, observer), function () {
      for (var j = 0, jlen = joinObservers.length; j < jlen; j++) {
        joinObservers[j].removeActivePlan(activePlan);
      }
      deactivate(activePlan);
    });
    for (i = 0, len = joinObservers.length; i < len; i++) {
      joinObservers[i].addActivePlan(activePlan);
    }
    return activePlan;
  };

  function planCreateObserver(externalSubscriptions, observable, onError) {
    var entry = externalSubscriptions.get(observable);
    if (!entry) {
      var observer = new JoinObserver(observable, onError);
      externalSubscriptions.set(observable, observer);
      return observer;
    }
    return entry;
  }

  function ActivePlan(joinObserverArray, onNext, onCompleted) {
    this.joinObserverArray = joinObserverArray;
    this.onNext = onNext;
    this.onCompleted = onCompleted;
    this.joinObservers = new Map();
    for (var i = 0, len = this.joinObserverArray.length; i < len; i++) {
      var joinObserver = this.joinObserverArray[i];
      this.joinObservers.set(joinObserver, joinObserver);
    }
  }

  ActivePlan.prototype.dequeue = function () {
    this.joinObservers.forEach(function (v) { v.queue.shift(); });
  };

  ActivePlan.prototype.match = function () {
    var i, len, hasValues = true;
    for (i = 0, len = this.joinObserverArray.length; i < len; i++) {
      if (this.joinObserverArray[i].queue.length === 0) {
        hasValues = false;
        break;
      }
    }
    if (hasValues) {
      var firstValues = [],
          isCompleted = false;
      for (i = 0, len = this.joinObserverArray.length; i < len; i++) {
        firstValues.push(this.joinObserverArray[i].queue[0]);
        this.joinObserverArray[i].queue[0].kind === 'C' && (isCompleted = true);
      }
      if (isCompleted) {
        this.onCompleted();
      } else {
        this.dequeue();
        var values = [];
        for (i = 0, len = firstValues.length; i < firstValues.length; i++) {
          values.push(firstValues[i].value);
        }
        this.onNext.apply(this, values);
      }
    }
  };

  var JoinObserver = (function (__super__) {
    inherits(JoinObserver, __super__);

    function JoinObserver(source, onError) {
      __super__.call(this);
      this.source = source;
      this.onError = onError;
      this.queue = [];
      this.activePlans = [];
      this.subscription = new SingleAssignmentDisposable();
      this.isDisposed = false;
    }

    var JoinObserverPrototype = JoinObserver.prototype;

    JoinObserverPrototype.next = function (notification) {
      if (!this.isDisposed) {
        if (notification.kind === 'E') {
          return this.onError(notification.error);
        }
        this.queue.push(notification);
        var activePlans = this.activePlans.slice(0);
        for (var i = 0, len = activePlans.length; i < len; i++) {
          activePlans[i].match();
        }
      }
    };

    JoinObserverPrototype.error = noop;
    JoinObserverPrototype.completed = noop;

    JoinObserverPrototype.addActivePlan = function (activePlan) {
      this.activePlans.push(activePlan);
    };

    JoinObserverPrototype.subscribe = function () {
      this.subscription.setDisposable(this.source.materialize().subscribe(this));
    };

    JoinObserverPrototype.removeActivePlan = function (activePlan) {
      this.activePlans.splice(this.activePlans.indexOf(activePlan), 1);
      this.activePlans.length === 0 && this.dispose();
    };

    JoinObserverPrototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      if (!this.isDisposed) {
        this.isDisposed = true;
        this.subscription.dispose();
      }
    };

    return JoinObserver;
  } (AbstractObserver));

  /**
   *  Creates a pattern that matches when both observable sequences have an available value.
   *
   *  @param right Observable sequence to match with the current sequence.
   *  @return {Pattern} Pattern object that matches when both observable sequences have an available value.
   */
  observableProto.and = function (right) {
    return new Pattern([this, right]);
  };

  /**
   *  Matches when the observable sequence has an available value and projects the value.
   *
   *  @param {Function} selector Selector that will be invoked for values in the source sequence.
   *  @returns {Plan} Plan that produces the projected values, to be fed (with other plans) to the when operator.
   */
  observableProto.thenDo = function (selector) {
    return new Pattern([this]).thenDo(selector);
  };

  /**
   *  Joins together the results from several patterns.
   *
   *  @param plans A series of plans (specified as an Array of as a series of arguments) created by use of the Then operator on patterns.
   *  @returns {Observable} Observable sequence with the results form matching several patterns.
   */
  Observable.when = function () {
    var len = arguments.length, plans;
    if (Array.isArray(arguments[0])) {
      plans = arguments[0];
    } else {
      plans = new Array(len);
      for(var i = 0; i < len; i++) { plans[i] = arguments[i]; }
    }
    return new AnonymousObservable(function (o) {
      var activePlans = [],
          externalSubscriptions = new Map();
      var outObserver = observerCreate(
        function (x) { o.onNext(x); },
        function (err) {
          externalSubscriptions.forEach(function (v) { v.onError(err); });
          o.onError(err);
        },
        function (x) { o.onCompleted(); }
      );
      try {
        for (var i = 0, len = plans.length; i < len; i++) {
          activePlans.push(plans[i].activate(externalSubscriptions, outObserver, function (activePlan) {
            var idx = activePlans.indexOf(activePlan);
            activePlans.splice(idx, 1);
            activePlans.length === 0 && o.onCompleted();
          }));
        }
      } catch (e) {
        return observableThrow(e).subscribe(o);
      }
      var group = new CompositeDisposable();
      externalSubscriptions.forEach(function (joinObserver) {
        joinObserver.subscribe();
        group.add(joinObserver);
      });

      return group;
    });
  };

  var TimerObservable = (function(__super__) {
    inherits(TimerObservable, __super__);
    function TimerObservable(dt, s) {
      this._dt = dt;
      this._s = s;
      __super__.call(this);
    }

    TimerObservable.prototype.subscribeCore = function (o) {
      return this._s.scheduleFuture(o, this._dt, scheduleMethod);
    };

    function scheduleMethod(s, o) {
      o.onNext(0);
      o.onCompleted();
    }

    return TimerObservable;
  }(ObservableBase));

  function _observableTimer(dueTime, scheduler) {
    return new TimerObservable(dueTime, scheduler);
  }

  function observableTimerDateAndPeriod(dueTime, period, scheduler) {
    return new AnonymousObservable(function (observer) {
      var d = dueTime, p = normalizeTime(period);
      return scheduler.scheduleRecursiveFuture(0, d, function (count, self) {
        if (p > 0) {
          var now = scheduler.now();
          d = new Date(d.getTime() + p);
          d.getTime() <= now && (d = new Date(now + p));
        }
        observer.onNext(count);
        self(count + 1, new Date(d));
      });
    });
  }

  function observableTimerTimeSpanAndPeriod(dueTime, period, scheduler) {
    return dueTime === period ?
      new AnonymousObservable(function (observer) {
        return scheduler.schedulePeriodic(0, period, function (count) {
          observer.onNext(count);
          return count + 1;
        });
      }) :
      observableDefer(function () {
        return observableTimerDateAndPeriod(new Date(scheduler.now() + dueTime), period, scheduler);
      });
  }

  /**
   *  Returns an observable sequence that produces a value after each period.
   *
   * @example
   *  1 - res = Rx.Observable.interval(1000);
   *  2 - res = Rx.Observable.interval(1000, Rx.Scheduler.timeout);
   *
   * @param {Number} period Period for producing the values in the resulting sequence (specified as an integer denoting milliseconds).
   * @param {Scheduler} [scheduler] Scheduler to run the timer on. If not specified, Rx.Scheduler.timeout is used.
   * @returns {Observable} An observable sequence that produces a value after each period.
   */
  var observableinterval = Observable.interval = function (period, scheduler) {
    return observableTimerTimeSpanAndPeriod(period, period, isScheduler(scheduler) ? scheduler : defaultScheduler);
  };

  /**
   *  Returns an observable sequence that produces a value after dueTime has elapsed and then after each period.
   * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) at which to produce the first value.
   * @param {Mixed} [periodOrScheduler]  Period to produce subsequent values (specified as an integer denoting milliseconds), or the scheduler to run the timer on. If not specified, the resulting timer is not recurring.
   * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, the timeout scheduler is used.
   * @returns {Observable} An observable sequence that produces a value after due time has elapsed and then each period.
   */
  var observableTimer = Observable.timer = function (dueTime, periodOrScheduler, scheduler) {
    var period;
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    if (periodOrScheduler != null && typeof periodOrScheduler === 'number') {
      period = periodOrScheduler;
    } else if (isScheduler(periodOrScheduler)) {
      scheduler = periodOrScheduler;
    }
    if ((dueTime instanceof Date || typeof dueTime === 'number') && period === undefined) {
      return _observableTimer(dueTime, scheduler);
    }
    if (dueTime instanceof Date && period !== undefined) {
      return observableTimerDateAndPeriod(dueTime, periodOrScheduler, scheduler);
    }
    return observableTimerTimeSpanAndPeriod(dueTime, period, scheduler);
  };

  function observableDelayRelative(source, dueTime, scheduler) {
    return new AnonymousObservable(function (o) {
      var active = false,
        cancelable = new SerialDisposable(),
        exception = null,
        q = [],
        running = false,
        subscription;
      subscription = source.materialize().timestamp(scheduler).subscribe(function (notification) {
        var d, shouldRun;
        if (notification.value.kind === 'E') {
          q = [];
          q.push(notification);
          exception = notification.value.error;
          shouldRun = !running;
        } else {
          q.push({ value: notification.value, timestamp: notification.timestamp + dueTime });
          shouldRun = !active;
          active = true;
        }
        if (shouldRun) {
          if (exception !== null) {
            o.onError(exception);
          } else {
            d = new SingleAssignmentDisposable();
            cancelable.setDisposable(d);
            d.setDisposable(scheduler.scheduleRecursiveFuture(null, dueTime, function (_, self) {
              var e, recurseDueTime, result, shouldRecurse;
              if (exception !== null) {
                return;
              }
              running = true;
              do {
                result = null;
                if (q.length > 0 && q[0].timestamp - scheduler.now() <= 0) {
                  result = q.shift().value;
                }
                if (result !== null) {
                  result.accept(o);
                }
              } while (result !== null);
              shouldRecurse = false;
              recurseDueTime = 0;
              if (q.length > 0) {
                shouldRecurse = true;
                recurseDueTime = Math.max(0, q[0].timestamp - scheduler.now());
              } else {
                active = false;
              }
              e = exception;
              running = false;
              if (e !== null) {
                o.onError(e);
              } else if (shouldRecurse) {
                self(null, recurseDueTime);
              }
            }));
          }
        }
      });
      return new BinaryDisposable(subscription, cancelable);
    }, source);
  }

  function observableDelayAbsolute(source, dueTime, scheduler) {
    return observableDefer(function () {
      return observableDelayRelative(source, dueTime - scheduler.now(), scheduler);
    });
  }

  function delayWithSelector(source, subscriptionDelay, delayDurationSelector) {
    var subDelay, selector;
    if (isFunction(subscriptionDelay)) {
      selector = subscriptionDelay;
    } else {
      subDelay = subscriptionDelay;
      selector = delayDurationSelector;
    }
    return new AnonymousObservable(function (o) {
      var delays = new CompositeDisposable(), atEnd = false, subscription = new SerialDisposable();

      function start() {
        subscription.setDisposable(source.subscribe(
          function (x) {
            var delay = tryCatch(selector)(x);
            if (delay === errorObj) { return o.onError(delay.e); }
            var d = new SingleAssignmentDisposable();
            delays.add(d);
            d.setDisposable(delay.subscribe(
              function () {
                o.onNext(x);
                delays.remove(d);
                done();
              },
              function (e) { o.onError(e); },
              function () {
                o.onNext(x);
                delays.remove(d);
                done();
              }
            ));
          },
          function (e) { o.onError(e); },
          function () {
            atEnd = true;
            subscription.dispose();
            done();
          }
        ));
      }

      function done () {
        atEnd && delays.length === 0 && o.onCompleted();
      }

      if (!subDelay) {
        start();
      } else {
        subscription.setDisposable(subDelay.subscribe(start, function (e) { o.onError(e); }, start));
      }

      return new BinaryDisposable(subscription, delays);
    }, source);
  }

  /**
   *  Time shifts the observable sequence by dueTime.
   *  The relative time intervals between the values are preserved.
   *
   * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) by which to shift the observable sequence.
   * @param {Scheduler} [scheduler] Scheduler to run the delay timers on. If not specified, the timeout scheduler is used.
   * @returns {Observable} Time-shifted sequence.
   */
  observableProto.delay = function () {
    var firstArg = arguments[0];
    if (typeof firstArg === 'number' || firstArg instanceof Date) {
      var dueTime = firstArg, scheduler = arguments[1];
      isScheduler(scheduler) || (scheduler = defaultScheduler);
      return dueTime instanceof Date ?
        observableDelayAbsolute(this, dueTime, scheduler) :
        observableDelayRelative(this, dueTime, scheduler);
    } else if (Observable.isObservable(firstArg) || isFunction(firstArg)) {
      return delayWithSelector(this, firstArg, arguments[1]);
    } else {
      throw new Error('Invalid arguments');
    }
  };

  var DebounceObservable = (function (__super__) {
    inherits(DebounceObservable, __super__);
    function DebounceObservable(source, dt, s) {
      isScheduler(s) || (s = defaultScheduler);
      this.source = source;
      this._dt = dt;
      this._s = s;
      __super__.call(this);
    }

    DebounceObservable.prototype.subscribeCore = function (o) {
      var cancelable = new SerialDisposable();
      return new BinaryDisposable(
        this.source.subscribe(new DebounceObserver(o, this._dt, this._s, cancelable)),
        cancelable);
    };

    return DebounceObservable;
  }(ObservableBase));

  var DebounceObserver = (function (__super__) {
    inherits(DebounceObserver, __super__);
    function DebounceObserver(observer, dueTime, scheduler, cancelable) {
      this._o = observer;
      this._d = dueTime;
      this._scheduler = scheduler;
      this._c = cancelable;
      this._v = null;
      this._hv = false;
      this._id = 0;
      __super__.call(this);
    }

    function scheduleFuture(s, state) {
      state.self._hv && state.self._id === state.currentId && state.self._o.onNext(state.x);
      state.self._hv = false;
    }

    DebounceObserver.prototype.next = function (x) {
      this._hv = true;
      this._v = x;
      var currentId = ++this._id, d = new SingleAssignmentDisposable();
      this._c.setDisposable(d);
      d.setDisposable(this._scheduler.scheduleFuture(this, this._d, function (_, self) {
        self._hv && self._id === currentId && self._o.onNext(x);
        self._hv = false;
      }));
    };

    DebounceObserver.prototype.error = function (e) {
      this._c.dispose();
      this._o.onError(e);
      this._hv = false;
      this._id++;
    };

    DebounceObserver.prototype.completed = function () {
      this._c.dispose();
      this._hv && this._o.onNext(this._v);
      this._o.onCompleted();
      this._hv = false;
      this._id++;
    };

    return DebounceObserver;
  }(AbstractObserver));

  function debounceWithSelector(source, durationSelector) {
    return new AnonymousObservable(function (o) {
      var value, hasValue = false, cancelable = new SerialDisposable(), id = 0;
      var subscription = source.subscribe(
        function (x) {
          var throttle = tryCatch(durationSelector)(x);
          if (throttle === errorObj) { return o.onError(throttle.e); }

          isPromise(throttle) && (throttle = observableFromPromise(throttle));

          hasValue = true;
          value = x;
          id++;
          var currentid = id, d = new SingleAssignmentDisposable();
          cancelable.setDisposable(d);
          d.setDisposable(throttle.subscribe(
            function () {
              hasValue && id === currentid && o.onNext(value);
              hasValue = false;
              d.dispose();
            },
            function (e) { o.onError(e); },
            function () {
              hasValue && id === currentid && o.onNext(value);
              hasValue = false;
              d.dispose();
            }
          ));
        },
        function (e) {
          cancelable.dispose();
          o.onError(e);
          hasValue = false;
          id++;
        },
        function () {
          cancelable.dispose();
          hasValue && o.onNext(value);
          o.onCompleted();
          hasValue = false;
          id++;
        }
      );
      return new BinaryDisposable(subscription, cancelable);
    }, source);
  }

  observableProto.debounce = function () {
    if (isFunction (arguments[0])) {
      return debounceWithSelector(this, arguments[0]);
    } else if (typeof arguments[0] === 'number') {
      return new DebounceObservable(this, arguments[0], arguments[1]);
    } else {
      throw new Error('Invalid arguments');
    }
  };

  /**
   *  Projects each element of an observable sequence into zero or more windows which are produced based on timing information.
   * @param {Number} timeSpan Length of each window (specified as an integer denoting milliseconds).
   * @param {Mixed} [timeShiftOrScheduler]  Interval between creation of consecutive windows (specified as an integer denoting milliseconds), or an optional scheduler parameter. If not specified, the time shift corresponds to the timeSpan parameter, resulting in non-overlapping adjacent windows.
   * @param {Scheduler} [scheduler]  Scheduler to run windowing timers on. If not specified, the timeout scheduler is used.
   * @returns {Observable} An observable sequence of windows.
   */
  observableProto.windowWithTime = observableProto.windowTime = function (timeSpan, timeShiftOrScheduler, scheduler) {
    var source = this, timeShift;
    timeShiftOrScheduler == null && (timeShift = timeSpan);
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    if (typeof timeShiftOrScheduler === 'number') {
      timeShift = timeShiftOrScheduler;
    } else if (isScheduler(timeShiftOrScheduler)) {
      timeShift = timeSpan;
      scheduler = timeShiftOrScheduler;
    }
    return new AnonymousObservable(function (observer) {
      var groupDisposable,
        nextShift = timeShift,
        nextSpan = timeSpan,
        q = [],
        refCountDisposable,
        timerD = new SerialDisposable(),
        totalTime = 0;
        groupDisposable = new CompositeDisposable(timerD),
        refCountDisposable = new RefCountDisposable(groupDisposable);

       function createTimer () {
        var m = new SingleAssignmentDisposable(),
          isSpan = false,
          isShift = false;
        timerD.setDisposable(m);
        if (nextSpan === nextShift) {
          isSpan = true;
          isShift = true;
        } else if (nextSpan < nextShift) {
            isSpan = true;
        } else {
          isShift = true;
        }
        var newTotalTime = isSpan ? nextSpan : nextShift,
          ts = newTotalTime - totalTime;
        totalTime = newTotalTime;
        if (isSpan) {
          nextSpan += timeShift;
        }
        if (isShift) {
          nextShift += timeShift;
        }
        m.setDisposable(scheduler.scheduleFuture(null, ts, function () {
          if (isShift) {
            var s = new Subject();
            q.push(s);
            observer.onNext(addRef(s, refCountDisposable));
          }
          isSpan && q.shift().onCompleted();
          createTimer();
        }));
      };
      q.push(new Subject());
      observer.onNext(addRef(q[0], refCountDisposable));
      createTimer();
      groupDisposable.add(source.subscribe(
        function (x) {
          for (var i = 0, len = q.length; i < len; i++) { q[i].onNext(x); }
        },
        function (e) {
          for (var i = 0, len = q.length; i < len; i++) { q[i].onError(e); }
          observer.onError(e);
        },
        function () {
          for (var i = 0, len = q.length; i < len; i++) { q[i].onCompleted(); }
          observer.onCompleted();
        }
      ));
      return refCountDisposable;
    }, source);
  };

  /**
   *  Projects each element of an observable sequence into a window that is completed when either it's full or a given amount of time has elapsed.
   * @param {Number} timeSpan Maximum time length of a window.
   * @param {Number} count Maximum element count of a window.
   * @param {Scheduler} [scheduler]  Scheduler to run windowing timers on. If not specified, the timeout scheduler is used.
   * @returns {Observable} An observable sequence of windows.
   */
  observableProto.windowWithTimeOrCount = observableProto.windowTimeOrCount = function (timeSpan, count, scheduler) {
    var source = this;
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new AnonymousObservable(function (observer) {
      var timerD = new SerialDisposable(),
          groupDisposable = new CompositeDisposable(timerD),
          refCountDisposable = new RefCountDisposable(groupDisposable),
          n = 0,
          windowId = 0,
          s = new Subject();

      function createTimer(id) {
        var m = new SingleAssignmentDisposable();
        timerD.setDisposable(m);
        m.setDisposable(scheduler.scheduleFuture(null, timeSpan, function () {
          if (id !== windowId) { return; }
          n = 0;
          var newId = ++windowId;
          s.onCompleted();
          s = new Subject();
          observer.onNext(addRef(s, refCountDisposable));
          createTimer(newId);
        }));
      }

      observer.onNext(addRef(s, refCountDisposable));
      createTimer(0);

      groupDisposable.add(source.subscribe(
        function (x) {
          var newId = 0, newWindow = false;
          s.onNext(x);
          if (++n === count) {
            newWindow = true;
            n = 0;
            newId = ++windowId;
            s.onCompleted();
            s = new Subject();
            observer.onNext(addRef(s, refCountDisposable));
          }
          newWindow && createTimer(newId);
        },
        function (e) {
          s.onError(e);
          observer.onError(e);
        }, function () {
          s.onCompleted();
          observer.onCompleted();
        }
      ));
      return refCountDisposable;
    }, source);
  };

  function toArray(x) { return x.toArray(); }

  /**
   *  Projects each element of an observable sequence into zero or more buffers which are produced based on timing information.
   * @param {Number} timeSpan Length of each buffer (specified as an integer denoting milliseconds).
   * @param {Mixed} [timeShiftOrScheduler]  Interval between creation of consecutive buffers (specified as an integer denoting milliseconds), or an optional scheduler parameter. If not specified, the time shift corresponds to the timeSpan parameter, resulting in non-overlapping adjacent buffers.
   * @param {Scheduler} [scheduler]  Scheduler to run buffer timers on. If not specified, the timeout scheduler is used.
   * @returns {Observable} An observable sequence of buffers.
   */
  observableProto.bufferWithTime = observableProto.bufferTime = function (timeSpan, timeShiftOrScheduler, scheduler) {
    return this.windowWithTime(timeSpan, timeShiftOrScheduler, scheduler).flatMap(toArray);
  };

  function toArray(x) { return x.toArray(); }

  /**
   *  Projects each element of an observable sequence into a buffer that is completed when either it's full or a given amount of time has elapsed.
   * @param {Number} timeSpan Maximum time length of a buffer.
   * @param {Number} count Maximum element count of a buffer.
   * @param {Scheduler} [scheduler]  Scheduler to run bufferin timers on. If not specified, the timeout scheduler is used.
   * @returns {Observable} An observable sequence of buffers.
   */
  observableProto.bufferWithTimeOrCount = observableProto.bufferTimeOrCount = function (timeSpan, count, scheduler) {
    return this.windowWithTimeOrCount(timeSpan, count, scheduler).flatMap(toArray);
  };

  var TimeIntervalObservable = (function (__super__) {
    inherits(TimeIntervalObservable, __super__);
    function TimeIntervalObservable(source, s) {
      this.source = source;
      this._s = s;
      __super__.call(this);
    }

    TimeIntervalObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new TimeIntervalObserver(o, this._s));
    };

    return TimeIntervalObservable;
  }(ObservableBase));

  var TimeIntervalObserver = (function (__super__) {
    inherits(TimeIntervalObserver, __super__);

    function TimeIntervalObserver(o, s) {
      this._o = o;
      this._s = s;
      this._l = s.now();
      __super__.call(this);
    }

    TimeIntervalObserver.prototype.next = function (x) {
      var now = this._s.now(), span = now - this._l;
      this._l = now;
      this._o.onNext({ value: x, interval: span });
    };
    TimeIntervalObserver.prototype.error = function (e) { this._o.onError(e); };
    TimeIntervalObserver.prototype.completed = function () { this._o.onCompleted(); };

    return TimeIntervalObserver;
  }(AbstractObserver));

  /**
   *  Records the time interval between consecutive values in an observable sequence.
   *
   * @example
   *  1 - res = source.timeInterval();
   *  2 - res = source.timeInterval(Rx.Scheduler.timeout);
   *
   * @param [scheduler]  Scheduler used to compute time intervals. If not specified, the timeout scheduler is used.
   * @returns {Observable} An observable sequence with time interval information on values.
   */
  observableProto.timeInterval = function (scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new TimeIntervalObservable(this, scheduler);
  };

  var TimestampObservable = (function (__super__) {
    inherits(TimestampObservable, __super__);
    function TimestampObservable(source, s) {
      this.source = source;
      this._s = s;
      __super__.call(this);
    }

    TimestampObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new TimestampObserver(o, this._s));
    };

    return TimestampObservable;
  }(ObservableBase));

  var TimestampObserver = (function (__super__) {
    inherits(TimestampObserver, __super__);
    function TimestampObserver(o, s) {
      this._o = o;
      this._s = s;
      __super__.call(this);
    }

    TimestampObserver.prototype.next = function (x) {
      this._o.onNext({ value: x, timestamp: this._s.now() });
    };

    TimestampObserver.prototype.error = function (e) {
      this._o.onError(e);
    };

    TimestampObserver.prototype.completed = function () {
      this._o.onCompleted();
    };

    return TimestampObserver;
  }(AbstractObserver));

  /**
   *  Records the timestamp for each value in an observable sequence.
   *
   * @example
   *  1 - res = source.timestamp(); // produces { value: x, timestamp: ts }
   *  2 - res = source.timestamp(Rx.Scheduler.default);
   *
   * @param {Scheduler} [scheduler]  Scheduler used to compute timestamps. If not specified, the default scheduler is used.
   * @returns {Observable} An observable sequence with timestamp information on values.
   */
  observableProto.timestamp = function (scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new TimestampObservable(this, scheduler);
  };

  var SampleObservable = (function(__super__) {
    inherits(SampleObservable, __super__);
    function SampleObservable(source, sampler) {
      this.source = source;
      this._sampler = sampler;
      __super__.call(this);
    }

    SampleObservable.prototype.subscribeCore = function (o) {
      var state = {
        o: o,
        atEnd: false,
        value: null,
        hasValue: false,
        sourceSubscription: new SingleAssignmentDisposable()
      };

      state.sourceSubscription.setDisposable(this.source.subscribe(new SampleSourceObserver(state)));
      return new BinaryDisposable(
        state.sourceSubscription,
        this._sampler.subscribe(new SamplerObserver(state))
      );
    };

    return SampleObservable;
  }(ObservableBase));

  var SamplerObserver = (function(__super__) {
    inherits(SamplerObserver, __super__);
    function SamplerObserver(s) {
      this._s = s;
      __super__.call(this);
    }

    SamplerObserver.prototype._handleMessage = function () {
      if (this._s.hasValue) {
        this._s.hasValue = false;
        this._s.o.onNext(this._s.value);
      }
      this._s.atEnd && this._s.o.onCompleted();
    };

    SamplerObserver.prototype.next = function () { this._handleMessage(); };
    SamplerObserver.prototype.error = function (e) { this._s.onError(e); };
    SamplerObserver.prototype.completed = function () { this._handleMessage(); };

    return SamplerObserver;
  }(AbstractObserver));

  var SampleSourceObserver = (function(__super__) {
    inherits(SampleSourceObserver, __super__);
    function SampleSourceObserver(s) {
      this._s = s;
      __super__.call(this);
    }

    SampleSourceObserver.prototype.next = function (x) {
      this._s.hasValue = true;
      this._s.value = x;
    };
    SampleSourceObserver.prototype.error = function (e) { this._s.o.onError(e); };
    SampleSourceObserver.prototype.completed = function () {
      this._s.atEnd = true;
      this._s.sourceSubscription.dispose();
    };

    return SampleSourceObserver;
  }(AbstractObserver));

  /**
   *  Samples the observable sequence at each interval.
   *
   * @example
   *  1 - res = source.sample(sampleObservable); // Sampler tick sequence
   *  2 - res = source.sample(5000); // 5 seconds
   *  2 - res = source.sample(5000, Rx.Scheduler.timeout); // 5 seconds
   *
   * @param {Mixed} intervalOrSampler Interval at which to sample (specified as an integer denoting milliseconds) or Sampler Observable.
   * @param {Scheduler} [scheduler]  Scheduler to run the sampling timer on. If not specified, the timeout scheduler is used.
   * @returns {Observable} Sampled observable sequence.
   */
  observableProto.sample = function (intervalOrSampler, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return typeof intervalOrSampler === 'number' ?
      new SampleObservable(this, observableinterval(intervalOrSampler, scheduler)) :
      new SampleObservable(this, intervalOrSampler);
  };

  var TimeoutError = Rx.TimeoutError = function(message) {
    this.message = message || 'Timeout has occurred';
    this.name = 'TimeoutError';
    Error.call(this);
  };
  TimeoutError.prototype = Object.create(Error.prototype);

  function timeoutWithSelector(source, firstTimeout, timeoutDurationSelector, other) {
    if (isFunction(firstTimeout)) {
      other = timeoutDurationSelector;
      timeoutDurationSelector = firstTimeout;
      firstTimeout = observableNever();
    }
    Observable.isObservable(other) || (other = observableThrow(new TimeoutError()));
    return new AnonymousObservable(function (o) {
      var subscription = new SerialDisposable(),
        timer = new SerialDisposable(),
        original = new SingleAssignmentDisposable();

      subscription.setDisposable(original);

      var id = 0, switched = false;

      function setTimer(timeout) {
        var myId = id, d = new SingleAssignmentDisposable();

        function timerWins() {
          switched = (myId === id);
          return switched;
        }

        timer.setDisposable(d);
        d.setDisposable(timeout.subscribe(function () {
          timerWins() && subscription.setDisposable(other.subscribe(o));
          d.dispose();
        }, function (e) {
          timerWins() && o.onError(e);
        }, function () {
          timerWins() && subscription.setDisposable(other.subscribe(o));
        }));
      };

      setTimer(firstTimeout);

      function oWins() {
        var res = !switched;
        if (res) { id++; }
        return res;
      }

      original.setDisposable(source.subscribe(function (x) {
        if (oWins()) {
          o.onNext(x);
          var timeout = tryCatch(timeoutDurationSelector)(x);
          if (timeout === errorObj) { return o.onError(timeout.e); }
          setTimer(isPromise(timeout) ? observableFromPromise(timeout) : timeout);
        }
      }, function (e) {
        oWins() && o.onError(e);
      }, function () {
        oWins() && o.onCompleted();
      }));
      return new BinaryDisposable(subscription, timer);
    }, source);
  }

  function timeout(source, dueTime, other, scheduler) {
    if (isScheduler(other)) {
      scheduler = other;
      other = observableThrow(new TimeoutError());
    }
    if (other instanceof Error) { other = observableThrow(other); }
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    Observable.isObservable(other) || (other = observableThrow(new TimeoutError()));
    return new AnonymousObservable(function (o) {
      var id = 0,
        original = new SingleAssignmentDisposable(),
        subscription = new SerialDisposable(),
        switched = false,
        timer = new SerialDisposable();

      subscription.setDisposable(original);

      function createTimer() {
        var myId = id;
        timer.setDisposable(scheduler.scheduleFuture(null, dueTime, function () {
          switched = id === myId;
          if (switched) {
            isPromise(other) && (other = observableFromPromise(other));
            subscription.setDisposable(other.subscribe(o));
          }
        }));
      }

      createTimer();

      original.setDisposable(source.subscribe(function (x) {
        if (!switched) {
          id++;
          o.onNext(x);
          createTimer();
        }
      }, function (e) {
        if (!switched) {
          id++;
          o.onError(e);
        }
      }, function () {
        if (!switched) {
          id++;
          o.onCompleted();
        }
      }));
      return new BinaryDisposable(subscription, timer);
    }, source);
  }

  observableProto.timeout = function () {
    var firstArg = arguments[0];
    if (firstArg instanceof Date || typeof firstArg === 'number') {
      return timeout(this, firstArg, arguments[1], arguments[2]);
    } else if (Observable.isObservable(firstArg) || isFunction(firstArg)) {
      return timeoutWithSelector(this, firstArg, arguments[1], arguments[2]);
    } else {
      throw new Error('Invalid arguments');
    }
  };

  var GenerateAbsoluteObservable = (function (__super__) {
    inherits(GenerateAbsoluteObservable, __super__);
    function GenerateAbsoluteObservable(state, cndFn, itrFn, resFn, timeFn, s) {
      this._state = state;
      this._cndFn = cndFn;
      this._itrFn = itrFn;
      this._resFn = resFn;
      this._timeFn = timeFn;
      this._s = s;
      __super__.call(this);
    }

    function scheduleRecursive(state, recurse) {
      state.hasResult && state.o.onNext(state.result);

      if (state.first) {
        state.first = false;
      } else {
        state.newState = tryCatch(state.self._itrFn)(state.newState);
        if (state.newState === errorObj) { return state.o.onError(state.newState.e); }
      }
      state.hasResult = tryCatch(state.self._cndFn)(state.newState);
      if (state.hasResult === errorObj) { return state.o.onError(state.hasResult.e); }
      if (state.hasResult) {
        state.result = tryCatch(state.self._resFn)(state.newState);
        if (state.result === errorObj) { return state.o.onError(state.result.e); }
        var time = tryCatch(state.self._timeFn)(state.newState);
        if (time === errorObj) { return state.o.onError(time.e); }
        recurse(state, time);
      } else {
        state.o.onCompleted();
      }
    }

    GenerateAbsoluteObservable.prototype.subscribeCore = function (o) {
      var state = {
        o: o,
        self: this,
        newState: this._state,
        first: true,
        hasResult: false
      };
      return this._s.scheduleRecursiveFuture(state, new Date(this._s.now()), scheduleRecursive);
    };

    return GenerateAbsoluteObservable;
  }(ObservableBase));

  /**
   *  GenerateAbsolutes an observable sequence by iterating a state from an initial state until the condition fails.
   *
   * @example
   *  res = source.generateWithAbsoluteTime(0,
   *      function (x) { return return true; },
   *      function (x) { return x + 1; },
   *      function (x) { return x; },
   *      function (x) { return new Date(); }
   *  });
   *
   * @param {Mixed} initialState Initial state.
   * @param {Function} condition Condition to terminate generation (upon returning false).
   * @param {Function} iterate Iteration step function.
   * @param {Function} resultSelector Selector function for results produced in the sequence.
   * @param {Function} timeSelector Time selector function to control the speed of values being produced each iteration, returning Date values.
   * @param {Scheduler} [scheduler]  Scheduler on which to run the generator loop. If not specified, the timeout scheduler is used.
   * @returns {Observable} The generated sequence.
   */
  Observable.generateWithAbsoluteTime = function (initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new GenerateAbsoluteObservable(initialState, condition, iterate, resultSelector, timeSelector, scheduler);
  };

  var GenerateRelativeObservable = (function (__super__) {
    inherits(GenerateRelativeObservable, __super__);
    function GenerateRelativeObservable(state, cndFn, itrFn, resFn, timeFn, s) {
      this._state = state;
      this._cndFn = cndFn;
      this._itrFn = itrFn;
      this._resFn = resFn;
      this._timeFn = timeFn;
      this._s = s;
      __super__.call(this);
    }

    function scheduleRecursive(state, recurse) {
      state.hasResult && state.o.onNext(state.result);

      if (state.first) {
        state.first = false;
      } else {
        state.newState = tryCatch(state.self._itrFn)(state.newState);
        if (state.newState === errorObj) { return state.o.onError(state.newState.e); }
      }

      state.hasResult = tryCatch(state.self._cndFn)(state.newState);
      if (state.hasResult === errorObj) { return state.o.onError(state.hasResult.e); }
      if (state.hasResult) {
        state.result = tryCatch(state.self._resFn)(state.newState);
        if (state.result === errorObj) { return state.o.onError(state.result.e); }
        var time = tryCatch(state.self._timeFn)(state.newState);
        if (time === errorObj) { return state.o.onError(time.e); }
        recurse(state, time);
      } else {
        state.o.onCompleted();
      }
    }

    GenerateRelativeObservable.prototype.subscribeCore = function (o) {
      var state = {
        o: o,
        self: this,
        newState: this._state,
        first: true,
        hasResult: false
      };
      return this._s.scheduleRecursiveFuture(state, 0, scheduleRecursive);
    };

    return GenerateRelativeObservable;
  }(ObservableBase));

  /**
   *  Generates an observable sequence by iterating a state from an initial state until the condition fails.
   *
   * @example
   *  res = source.generateWithRelativeTime(0,
   *      function (x) { return return true; },
   *      function (x) { return x + 1; },
   *      function (x) { return x; },
   *      function (x) { return 500; }
   *  );
   *
   * @param {Mixed} initialState Initial state.
   * @param {Function} condition Condition to terminate generation (upon returning false).
   * @param {Function} iterate Iteration step function.
   * @param {Function} resultSelector Selector function for results produced in the sequence.
   * @param {Function} timeSelector Time selector function to control the speed of values being produced each iteration, returning integer values denoting milliseconds.
   * @param {Scheduler} [scheduler]  Scheduler on which to run the generator loop. If not specified, the timeout scheduler is used.
   * @returns {Observable} The generated sequence.
   */
  Observable.generateWithRelativeTime = function (initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new GenerateRelativeObservable(initialState, condition, iterate, resultSelector, timeSelector, scheduler);
  };

  var DelaySubscription = (function(__super__) {
    inherits(DelaySubscription, __super__);
    function DelaySubscription(source, dt, s) {
      this.source = source;
      this._dt = dt;
      this._s = s;
      __super__.call(this);
    }

    DelaySubscription.prototype.subscribeCore = function (o) {
      var d = new SerialDisposable();

      d.setDisposable(this._s.scheduleFuture([this.source, o, d], this._dt, scheduleMethod));

      return d;
    };

    function scheduleMethod(s, state) {
      var source = state[0], o = state[1], d = state[2];
      d.setDisposable(source.subscribe(o));
    }

    return DelaySubscription;
  }(ObservableBase));

  /**
   *  Time shifts the observable sequence by delaying the subscription with the specified relative time duration, using the specified scheduler to run timers.
   *
   * @example
   *  1 - res = source.delaySubscription(5000); // 5s
   *  2 - res = source.delaySubscription(5000, Rx.Scheduler.default); // 5 seconds
   *
   * @param {Number} dueTime Relative or absolute time shift of the subscription.
   * @param {Scheduler} [scheduler]  Scheduler to run the subscription delay timer on. If not specified, the timeout scheduler is used.
   * @returns {Observable} Time-shifted sequence.
   */
  observableProto.delaySubscription = function (dueTime, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new DelaySubscription(this, dueTime, scheduler);
  };

  var SkipLastWithTimeObservable = (function (__super__) {
    inherits(SkipLastWithTimeObservable, __super__);
    function SkipLastWithTimeObservable(source, d, s) {
      this.source = source;
      this._d = d;
      this._s = s;
      __super__.call(this);
    }

    SkipLastWithTimeObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new SkipLastWithTimeObserver(o, this));
    };

    return SkipLastWithTimeObservable;
  }(ObservableBase));

  var SkipLastWithTimeObserver = (function (__super__) {
    inherits(SkipLastWithTimeObserver, __super__);

    function SkipLastWithTimeObserver(o, p) {
      this._o = o;
      this._s = p._s;
      this._d = p._d;
      this._q = [];
      __super__.call(this);
    }

    SkipLastWithTimeObserver.prototype.next = function (x) {
      var now = this._s.now();
      this._q.push({ interval: now, value: x });
      while (this._q.length > 0 && now - this._q[0].interval >= this._d) {
        this._o.onNext(this._q.shift().value);
      }
    };
    SkipLastWithTimeObserver.prototype.error = function (e) { this._o.onError(e); };
    SkipLastWithTimeObserver.prototype.completed = function () {
      var now = this._s.now();
      while (this._q.length > 0 && now - this._q[0].interval >= this._d) {
        this._o.onNext(this._q.shift().value);
      }
      this._o.onCompleted();
    };

    return SkipLastWithTimeObserver;
  }(AbstractObserver));

  /**
   *  Skips elements for the specified duration from the end of the observable source sequence, using the specified scheduler to run timers.
   * @description
   *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
   *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
   *  result sequence. This causes elements to be delayed with duration.
   * @param {Number} duration Duration for skipping elements from the end of the sequence.
   * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout
   * @returns {Observable} An observable sequence with the elements skipped during the specified duration from the end of the source sequence.
   */
  observableProto.skipLastWithTime = function (duration, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new SkipLastWithTimeObservable(this, duration, scheduler);
  };

  var TakeLastWithTimeObservable = (function (__super__) {
    inherits(TakeLastWithTimeObservable, __super__);
    function TakeLastWithTimeObservable(source, d, s) {
      this.source = source;
      this._d = d;
      this._s = s;
      __super__.call(this);
    }

    TakeLastWithTimeObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new TakeLastWithTimeObserver(o, this._d, this._s));
    };

    return TakeLastWithTimeObservable;
  }(ObservableBase));

  var TakeLastWithTimeObserver = (function (__super__) {
    inherits(TakeLastWithTimeObserver, __super__);

    function TakeLastWithTimeObserver(o, d, s) {
      this._o = o;
      this._d = d;
      this._s = s;
      this._q = [];
      __super__.call(this);
    }

    TakeLastWithTimeObserver.prototype.next = function (x) {
      var now = this._s.now();
      this._q.push({ interval: now, value: x });
      while (this._q.length > 0 && now - this._q[0].interval >= this._d) {
        this._q.shift();
      }
    };
    TakeLastWithTimeObserver.prototype.error = function (e) { this._o.onError(e); };
    TakeLastWithTimeObserver.prototype.completed = function () {
      var now = this._s.now();
      while (this._q.length > 0) {
        var next = this._q.shift();
        if (now - next.interval <= this._d) { this._o.onNext(next.value); }
      }
      this._o.onCompleted();
    };

    return TakeLastWithTimeObserver;
  }(AbstractObserver));

  /**
   *  Returns elements within the specified duration from the end of the observable source sequence, using the specified schedulers to run timers and to drain the collected elements.
   * @description
   *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
   *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
   *  result sequence. This causes elements to be delayed with duration.
   * @param {Number} duration Duration for taking elements from the end of the sequence.
   * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
   * @returns {Observable} An observable sequence with the elements taken during the specified duration from the end of the source sequence.
   */
  observableProto.takeLastWithTime = function (duration, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new TakeLastWithTimeObservable(this, duration, scheduler);
  };

  /**
   *  Returns an array with the elements within the specified duration from the end of the observable source sequence, using the specified scheduler to run timers.
   * @description
   *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
   *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
   *  result sequence. This causes elements to be delayed with duration.
   * @param {Number} duration Duration for taking elements from the end of the sequence.
   * @param {Scheduler} scheduler Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
   * @returns {Observable} An observable sequence containing a single array with the elements taken during the specified duration from the end of the source sequence.
   */
  observableProto.takeLastBufferWithTime = function (duration, scheduler) {
    var source = this;
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new AnonymousObservable(function (o) {
      var q = [];
      return source.subscribe(function (x) {
        var now = scheduler.now();
        q.push({ interval: now, value: x });
        while (q.length > 0 && now - q[0].interval >= duration) {
          q.shift();
        }
      }, function (e) { o.onError(e); }, function () {
        var now = scheduler.now(), res = [];
        while (q.length > 0) {
          var next = q.shift();
          now - next.interval <= duration && res.push(next.value);
        }
        o.onNext(res);
        o.onCompleted();
      });
    }, source);
  };

  var TakeWithTimeObservable = (function (__super__) {
    inherits(TakeWithTimeObservable, __super__);
    function TakeWithTimeObservable(source, d, s) {
      this.source = source;
      this._d = d;
      this._s = s;
      __super__.call(this);
    }

    function scheduleMethod(s, o) {
      o.onCompleted();
    }

    TakeWithTimeObservable.prototype.subscribeCore = function (o) {
      return new BinaryDisposable(
        this._s.scheduleFuture(o, this._d, scheduleMethod),
        this.source.subscribe(o)
      );
    };

    return TakeWithTimeObservable;
  }(ObservableBase));

  /**
   *  Takes elements for the specified duration from the start of the observable source sequence, using the specified scheduler to run timers.
   *
   * @example
   *  1 - res = source.takeWithTime(5000,  [optional scheduler]);
   * @description
   *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
   *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
   *  result sequence. This causes elements to be delayed with duration.
   * @param {Number} duration Duration for taking elements from the start of the sequence.
   * @param {Scheduler} scheduler Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
   * @returns {Observable} An observable sequence with the elements taken during the specified duration from the start of the source sequence.
   */
  observableProto.takeWithTime = function (duration, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new TakeWithTimeObservable(this, duration, scheduler);
  };

  var SkipWithTimeObservable = (function (__super__) {
    inherits(SkipWithTimeObservable, __super__);
    function SkipWithTimeObservable(source, d, s) {
      this.source = source;
      this._d = d;
      this._s = s;
      this._open = false;
      __super__.call(this);
    }

    function scheduleMethod(s, self) {
      self._open = true;
    }

    SkipWithTimeObservable.prototype.subscribeCore = function (o) {
      return new BinaryDisposable(
        this._s.scheduleFuture(this, this._d, scheduleMethod),
        this.source.subscribe(new SkipWithTimeObserver(o, this))
      );
    };

    return SkipWithTimeObservable;
  }(ObservableBase));

  var SkipWithTimeObserver = (function (__super__) {
    inherits(SkipWithTimeObserver, __super__);

    function SkipWithTimeObserver(o, p) {
      this._o = o;
      this._p = p;
      __super__.call(this);
    }

    SkipWithTimeObserver.prototype.next = function (x) { this._p._open && this._o.onNext(x); };
    SkipWithTimeObserver.prototype.error = function (e) { this._o.onError(e); };
    SkipWithTimeObserver.prototype.completed = function () { this._o.onCompleted(); };

    return SkipWithTimeObserver;
  }(AbstractObserver));

  /**
   *  Skips elements for the specified duration from the start of the observable source sequence, using the specified scheduler to run timers.
   * @description
   *  Specifying a zero value for duration doesn't guarantee no elements will be dropped from the start of the source sequence.
   *  This is a side-effect of the asynchrony introduced by the scheduler, where the action that causes callbacks from the source sequence to be forwarded
   *  may not execute immediately, despite the zero due time.
   *
   *  Errors produced by the source sequence are always forwarded to the result sequence, even if the error occurs before the duration.
   * @param {Number} duration Duration for skipping elements from the start of the sequence.
   * @param {Scheduler} scheduler Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
   * @returns {Observable} An observable sequence with the elements skipped during the specified duration from the start of the source sequence.
   */
  observableProto.skipWithTime = function (duration, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new SkipWithTimeObservable(this, duration, scheduler);
  };

  var SkipUntilWithTimeObservable = (function (__super__) {
    inherits(SkipUntilWithTimeObservable, __super__);
    function SkipUntilWithTimeObservable(source, startTime, scheduler) {
      this.source = source;
      this._st = startTime;
      this._s = scheduler;
      __super__.call(this);
    }

    function scheduleMethod(s, state) {
      state._open = true;
    }

    SkipUntilWithTimeObservable.prototype.subscribeCore = function (o) {
      this._open = false;
      return new BinaryDisposable(
        this._s.scheduleFuture(this, this._st, scheduleMethod),
        this.source.subscribe(new SkipUntilWithTimeObserver(o, this))
      );
    };

    return SkipUntilWithTimeObservable;
  }(ObservableBase));

  var SkipUntilWithTimeObserver = (function (__super__) {
    inherits(SkipUntilWithTimeObserver, __super__);

    function SkipUntilWithTimeObserver(o, p) {
      this._o = o;
      this._p = p;
      __super__.call(this);
    }

    SkipUntilWithTimeObserver.prototype.next = function (x) { this._p._open && this._o.onNext(x); };
    SkipUntilWithTimeObserver.prototype.error = function (e) { this._o.onError(e); };
    SkipUntilWithTimeObserver.prototype.completed = function () { this._o.onCompleted(); };

    return SkipUntilWithTimeObserver;
  }(AbstractObserver));


  /**
   *  Skips elements from the observable source sequence until the specified start time, using the specified scheduler to run timers.
   *  Errors produced by the source sequence are always forwarded to the result sequence, even if the error occurs before the start time.
   *
   * @examples
   *  1 - res = source.skipUntilWithTime(new Date(), [scheduler]);
   *  2 - res = source.skipUntilWithTime(5000, [scheduler]);
   * @param {Date|Number} startTime Time to start taking elements from the source sequence. If this value is less than or equal to Date(), no elements will be skipped.
   * @param {Scheduler} [scheduler] Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
   * @returns {Observable} An observable sequence with the elements skipped until the specified start time.
   */
  observableProto.skipUntilWithTime = function (startTime, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    return new SkipUntilWithTimeObservable(this, startTime, scheduler);
  };

  /**
   *  Takes elements for the specified duration until the specified end time, using the specified scheduler to run timers.
   * @param {Number | Date} endTime Time to stop taking elements from the source sequence. If this value is less than or equal to new Date(), the result stream will complete immediately.
   * @param {Scheduler} [scheduler] Scheduler to run the timer on.
   * @returns {Observable} An observable sequence with the elements taken until the specified end time.
   */
  observableProto.takeUntilWithTime = function (endTime, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    var source = this;
    return new AnonymousObservable(function (o) {
      return new BinaryDisposable(
        scheduler.scheduleFuture(o, endTime, function (_, o) { o.onCompleted(); }),
        source.subscribe(o));
    }, source);
  };

  /**
   * Returns an Observable that emits only the first item emitted by the source Observable during sequential time windows of a specified duration.
   * @param {Number} windowDuration time to wait before emitting another item after emitting the last item
   * @param {Scheduler} [scheduler] the Scheduler to use internally to manage the timers that handle timeout for each item. If not provided, defaults to Scheduler.timeout.
   * @returns {Observable} An Observable that performs the throttle operation.
   */
  observableProto.throttle = function (windowDuration, scheduler) {
    isScheduler(scheduler) || (scheduler = defaultScheduler);
    var duration = +windowDuration || 0;
    if (duration <= 0) { throw new RangeError('windowDuration cannot be less or equal zero.'); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var lastOnNext = 0;
      return source.subscribe(
        function (x) {
          var now = scheduler.now();
          if (lastOnNext === 0 || now - lastOnNext >= duration) {
            lastOnNext = now;
            o.onNext(x);
          }
        },function (e) { o.onError(e); }, function () { o.onCompleted(); }
      );
    }, source);
  };

  var TransduceObserver = (function (__super__) {
    inherits(TransduceObserver, __super__);
    function TransduceObserver(o, xform) {
      this._o = o;
      this._xform = xform;
      __super__.call(this);
    }

    TransduceObserver.prototype.next = function (x) {
      var res = tryCatch(this._xform['@@transducer/step']).call(this._xform, this._o, x);
      if (res === errorObj) { this._o.onError(res.e); }
    };

    TransduceObserver.prototype.error = function (e) { this._o.onError(e); };

    TransduceObserver.prototype.completed = function () {
      this._xform['@@transducer/result'](this._o);
    };

    return TransduceObserver;
  }(AbstractObserver));

  function transformForObserver(o) {
    return {
      '@@transducer/init': function() {
        return o;
      },
      '@@transducer/step': function(obs, input) {
        return obs.onNext(input);
      },
      '@@transducer/result': function(obs) {
        return obs.onCompleted();
      }
    };
  }

  /**
   * Executes a transducer to transform the observable sequence
   * @param {Transducer} transducer A transducer to execute
   * @returns {Observable} An Observable sequence containing the results from the transducer.
   */
  observableProto.transduce = function(transducer) {
    var source = this;
    return new AnonymousObservable(function(o) {
      var xform = transducer(transformForObserver(o));
      return source.subscribe(new TransduceObserver(o, xform));
    }, source);
  };

  var SwitchFirstObservable = (function (__super__) {
    inherits(SwitchFirstObservable, __super__);
    function SwitchFirstObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    SwitchFirstObservable.prototype.subscribeCore = function (o) {
      var m = new SingleAssignmentDisposable(),
        g = new CompositeDisposable(),
        state = {
          hasCurrent: false,
          isStopped: false,
          o: o,
          g: g
        };

      g.add(m);
      m.setDisposable(this.source.subscribe(new SwitchFirstObserver(state)));
      return g;
    };

    return SwitchFirstObservable;
  }(ObservableBase));

  var SwitchFirstObserver = (function(__super__) {
    inherits(SwitchFirstObserver, __super__);
    function SwitchFirstObserver(state) {
      this._s = state;
      __super__.call(this);
    }

    SwitchFirstObserver.prototype.next = function (x) {
      if (!this._s.hasCurrent) {
        this._s.hasCurrent = true;
        isPromise(x) && (x = observableFromPromise(x));
        var inner = new SingleAssignmentDisposable();
        this._s.g.add(inner);
        inner.setDisposable(x.subscribe(new InnerObserver(this._s, inner)));
      }
    };

    SwitchFirstObserver.prototype.error = function (e) {
      this._s.o.onError(e);
    };

    SwitchFirstObserver.prototype.completed = function () {
      this._s.isStopped = true;
      !this._s.hasCurrent && this._s.g.length === 1 && this._s.o.onCompleted();
    };

    inherits(InnerObserver, __super__);
    function InnerObserver(state, inner) {
      this._s = state;
      this._i = inner;
      __super__.call(this);
    }

    InnerObserver.prototype.next = function (x) { this._s.o.onNext(x); };
    InnerObserver.prototype.error = function (e) { this._s.o.onError(e); };
    InnerObserver.prototype.completed = function () {
      this._s.g.remove(this._i);
      this._s.hasCurrent = false;
      this._s.isStopped && this._s.g.length === 1 && this._s.o.onCompleted();
    };

    return SwitchFirstObserver;
  }(AbstractObserver));

  /**
   * Performs a exclusive waiting for the first to finish before subscribing to another observable.
   * Observables that come in between subscriptions will be dropped on the floor.
   * @returns {Observable} A exclusive observable with only the results that happen when subscribed.
   */
  observableProto.switchFirst = function () {
    return new SwitchFirstObservable(this);
  };

observableProto.flatMapFirst = observableProto.exhaustMap = function(selector, resultSelector, thisArg) {
    return new FlatMapObservable(this, selector, resultSelector, thisArg).switchFirst();
};

observableProto.flatMapWithMaxConcurrent = observableProto.flatMapMaxConcurrent = function(limit, selector, resultSelector, thisArg) {
    return new FlatMapObservable(this, selector, resultSelector, thisArg).merge(limit);
};

  /** Provides a set of extension methods for virtual time scheduling. */
  var VirtualTimeScheduler = Rx.VirtualTimeScheduler = (function (__super__) {
    inherits(VirtualTimeScheduler, __super__);

    /**
     * Creates a new virtual time scheduler with the specified initial clock value and absolute time comparer.
     *
     * @constructor
     * @param {Number} initialClock Initial value for the clock.
     * @param {Function} comparer Comparer to determine causality of events based on absolute time.
     */
    function VirtualTimeScheduler(initialClock, comparer) {
      this.clock = initialClock;
      this.comparer = comparer;
      this.isEnabled = false;
      this.queue = new PriorityQueue(1024);
      __super__.call(this);
    }

    var VirtualTimeSchedulerPrototype = VirtualTimeScheduler.prototype;

    VirtualTimeSchedulerPrototype.now = function () {
      return this.toAbsoluteTime(this.clock);
    };

    VirtualTimeSchedulerPrototype.schedule = function (state, action) {
      return this.scheduleAbsolute(state, this.clock, action);
    };

    VirtualTimeSchedulerPrototype.scheduleFuture = function (state, dueTime, action) {
      var dt = dueTime instanceof Date ?
        this.toRelativeTime(dueTime - this.now()) :
        this.toRelativeTime(dueTime);

      return this.scheduleRelative(state, dt, action);
    };

    /**
     * Adds a relative time value to an absolute time value.
     * @param {Number} absolute Absolute virtual time value.
     * @param {Number} relative Relative virtual time value to add.
     * @return {Number} Resulting absolute virtual time sum value.
     */
    VirtualTimeSchedulerPrototype.add = notImplemented;

    /**
     * Converts an absolute time to a number
     * @param {Any} The absolute time.
     * @returns {Number} The absolute time in ms
     */
    VirtualTimeSchedulerPrototype.toAbsoluteTime = notImplemented;

    /**
     * Converts the TimeSpan value to a relative virtual time value.
     * @param {Number} timeSpan TimeSpan value to convert.
     * @return {Number} Corresponding relative virtual time value.
     */
    VirtualTimeSchedulerPrototype.toRelativeTime = notImplemented;

    /**
     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be emulated using recursive scheduling.
     * @param {Mixed} state Initial state passed to the action upon the first iteration.
     * @param {Number} period Period for running the work periodically.
     * @param {Function} action Action to be executed, potentially updating the state.
     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
     */
    VirtualTimeSchedulerPrototype.schedulePeriodic = function (state, period, action) {
      var s = new SchedulePeriodicRecursive(this, state, period, action);
      return s.start();
    };

    /**
     * Schedules an action to be executed after dueTime.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Number} dueTime Relative time after which to execute the action.
     * @param {Function} action Action to be executed.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    VirtualTimeSchedulerPrototype.scheduleRelative = function (state, dueTime, action) {
      var runAt = this.add(this.clock, dueTime);
      return this.scheduleAbsolute(state, runAt, action);
    };

    /**
     * Starts the virtual time scheduler.
     */
    VirtualTimeSchedulerPrototype.start = function () {
      if (!this.isEnabled) {
        this.isEnabled = true;
        do {
          var next = this.getNext();
          if (next !== null) {
            this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
            next.invoke();
          } else {
            this.isEnabled = false;
          }
        } while (this.isEnabled);
      }
    };

    /**
     * Stops the virtual time scheduler.
     */
    VirtualTimeSchedulerPrototype.stop = function () {
      this.isEnabled = false;
    };

    /**
     * Advances the scheduler's clock to the specified time, running all work till that point.
     * @param {Number} time Absolute time to advance the scheduler's clock to.
     */
    VirtualTimeSchedulerPrototype.advanceTo = function (time) {
      var dueToClock = this.comparer(this.clock, time);
      if (this.comparer(this.clock, time) > 0) { throw new ArgumentOutOfRangeError(); }
      if (dueToClock === 0) { return; }
      if (!this.isEnabled) {
        this.isEnabled = true;
        do {
          var next = this.getNext();
          if (next !== null && this.comparer(next.dueTime, time) <= 0) {
            this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
            next.invoke();
          } else {
            this.isEnabled = false;
          }
        } while (this.isEnabled);
        this.clock = time;
      }
    };

    /**
     * Advances the scheduler's clock by the specified relative time, running all work scheduled for that timespan.
     * @param {Number} time Relative time to advance the scheduler's clock by.
     */
    VirtualTimeSchedulerPrototype.advanceBy = function (time) {
      var dt = this.add(this.clock, time),
          dueToClock = this.comparer(this.clock, dt);
      if (dueToClock > 0) { throw new ArgumentOutOfRangeError(); }
      if (dueToClock === 0) {  return; }

      this.advanceTo(dt);
    };

    /**
     * Advances the scheduler's clock by the specified relative time.
     * @param {Number} time Relative time to advance the scheduler's clock by.
     */
    VirtualTimeSchedulerPrototype.sleep = function (time) {
      var dt = this.add(this.clock, time);
      if (this.comparer(this.clock, dt) >= 0) { throw new ArgumentOutOfRangeError(); }

      this.clock = dt;
    };

    /**
     * Gets the next scheduled item to be executed.
     * @returns {ScheduledItem} The next scheduled item.
     */
    VirtualTimeSchedulerPrototype.getNext = function () {
      while (this.queue.length > 0) {
        var next = this.queue.peek();
        if (next.isCancelled()) {
          this.queue.dequeue();
        } else {
          return next;
        }
      }
      return null;
    };

    /**
     * Schedules an action to be executed at dueTime.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Number} dueTime Absolute time at which to execute the action.
     * @param {Function} action Action to be executed.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    VirtualTimeSchedulerPrototype.scheduleAbsolute = function (state, dueTime, action) {
      var self = this;

      function run(scheduler, state1) {
        self.queue.remove(si);
        return action(scheduler, state1);
      }

      var si = new ScheduledItem(this, state, run, dueTime, this.comparer);
      this.queue.enqueue(si);

      return si.disposable;
    };

    return VirtualTimeScheduler;
  }(Scheduler));

  /** Provides a virtual time scheduler that uses Date for absolute time and number for relative time. */
  Rx.HistoricalScheduler = (function (__super__) {
    inherits(HistoricalScheduler, __super__);

    /**
     * Creates a new historical scheduler with the specified initial clock value.
     * @constructor
     * @param {Number} initialClock Initial value for the clock.
     * @param {Function} comparer Comparer to determine causality of events based on absolute time.
     */
    function HistoricalScheduler(initialClock, comparer) {
      var clock = initialClock == null ? 0 : initialClock;
      var cmp = comparer || defaultSubComparer;
      __super__.call(this, clock, cmp);
    }

    var HistoricalSchedulerProto = HistoricalScheduler.prototype;

    /**
     * Adds a relative time value to an absolute time value.
     * @param {Number} absolute Absolute virtual time value.
     * @param {Number} relative Relative virtual time value to add.
     * @return {Number} Resulting absolute virtual time sum value.
     */
    HistoricalSchedulerProto.add = function (absolute, relative) {
      return absolute + relative;
    };

    HistoricalSchedulerProto.toAbsoluteTime = function (absolute) {
      return new Date(absolute).getTime();
    };

    /**
     * Converts the TimeSpan value to a relative virtual time value.
     * @memberOf HistoricalScheduler
     * @param {Number} timeSpan TimeSpan value to convert.
     * @return {Number} Corresponding relative virtual time value.
     */
    HistoricalSchedulerProto.toRelativeTime = function (timeSpan) {
      return timeSpan;
    };

    return HistoricalScheduler;
  }(Rx.VirtualTimeScheduler));

function OnNextPredicate(predicate) {
    this.predicate = predicate;
}

OnNextPredicate.prototype.equals = function (other) {
  if (other === this) { return true; }
  if (other == null) { return false; }
  if (other.kind !== 'N') { return false; }
  return this.predicate(other.value);
};

function OnErrorPredicate(predicate) {
  this.predicate = predicate;
}

OnErrorPredicate.prototype.equals = function (other) {
  if (other === this) { return true; }
  if (other == null) { return false; }
  if (other.kind !== 'E') { return false; }
  return this.predicate(other.error);
};

var ReactiveTest = Rx.ReactiveTest = {
  /** Default virtual time used for creation of observable sequences in unit tests. */
  created: 100,
  /** Default virtual time used to subscribe to observable sequences in unit tests. */
  subscribed: 200,
  /** Default virtual time used to dispose subscriptions in unit tests. */
  disposed: 1000,

  /**
   * Factory method for an OnNext notification record at a given time with a given value or a predicate function.
   *
   * 1 - ReactiveTest.onNext(200, 42);
   * 2 - ReactiveTest.onNext(200, function (x) { return x.length == 2; });
   *
   * @param ticks Recorded virtual time the OnNext notification occurs.
   * @param value Recorded value stored in the OnNext notification or a predicate.
   * @return Recorded OnNext notification.
   */
  onNext: function (ticks, value) {
    return typeof value === 'function' ?
      new Recorded(ticks, new OnNextPredicate(value)) :
      new Recorded(ticks, Notification.createOnNext(value));
  },
  /**
   * Factory method for an OnError notification record at a given time with a given error.
   *
   * 1 - ReactiveTest.onNext(200, new Error('error'));
   * 2 - ReactiveTest.onNext(200, function (e) { return e.message === 'error'; });
   *
   * @param ticks Recorded virtual time the OnError notification occurs.
   * @param exception Recorded exception stored in the OnError notification.
   * @return Recorded OnError notification.
   */
  onError: function (ticks, error) {
    return typeof error === 'function' ?
      new Recorded(ticks, new OnErrorPredicate(error)) :
      new Recorded(ticks, Notification.createOnError(error));
  },
  /**
   * Factory method for an OnCompleted notification record at a given time.
   *
   * @param ticks Recorded virtual time the OnCompleted notification occurs.
   * @return Recorded OnCompleted notification.
   */
  onCompleted: function (ticks) {
    return new Recorded(ticks, Notification.createOnCompleted());
  },
  /**
   * Factory method for a subscription record based on a given subscription and disposal time.
   *
   * @param start Virtual time indicating when the subscription was created.
   * @param end Virtual time indicating when the subscription was disposed.
   * @return Subscription object.
   */
  subscribe: function (start, end) {
    return new Subscription(start, end);
  }
};

  /**
   * Creates a new object recording the production of the specified value at the given virtual time.
   *
   * @constructor
   * @param {Number} time Virtual time the value was produced on.
   * @param {Mixed} value Value that was produced.
   * @param {Function} comparer An optional comparer.
   */
  var Recorded = Rx.Recorded = function (time, value, comparer) {
    this.time = time;
    this.value = value;
    this.comparer = comparer || defaultComparer;
  };

  /**
   * Checks whether the given recorded object is equal to the current instance.
   *
   * @param {Recorded} other Recorded object to check for equality.
   * @returns {Boolean} true if both objects are equal; false otherwise.
   */
  Recorded.prototype.equals = function (other) {
    return this.time === other.time && this.comparer(this.value, other.value);
  };

  /**
   * Returns a string representation of the current Recorded value.
   *
   * @returns {String} String representation of the current Recorded value.
   */
  Recorded.prototype.toString = function () {
    return this.value.toString() + '@' + this.time;
  };

  /**
   * Creates a new subscription object with the given virtual subscription and unsubscription time.
   *
   * @constructor
   * @param {Number} subscribe Virtual time at which the subscription occurred.
   * @param {Number} unsubscribe Virtual time at which the unsubscription occurred.
   */
  var Subscription = Rx.Subscription = function (start, end) {
    this.subscribe = start;
    this.unsubscribe = end || Number.MAX_VALUE;
  };

  /**
   * Checks whether the given subscription is equal to the current instance.
   * @param other Subscription object to check for equality.
   * @returns {Boolean} true if both objects are equal; false otherwise.
   */
  Subscription.prototype.equals = function (other) {
    return this.subscribe === other.subscribe && this.unsubscribe === other.unsubscribe;
  };

  /**
   * Returns a string representation of the current Subscription value.
   * @returns {String} String representation of the current Subscription value.
   */
  Subscription.prototype.toString = function () {
    return '(' + this.subscribe + ', ' + (this.unsubscribe === Number.MAX_VALUE ? 'Infinite' : this.unsubscribe) + ')';
  };

  var MockDisposable = Rx.MockDisposable = function (scheduler) {
    this.scheduler = scheduler;
    this.disposes = [];
    this.disposes.push(this.scheduler.clock);
  };

  MockDisposable.prototype.dispose = function () {
    this.disposes.push(this.scheduler.clock);
  };

  var MockObserver = (function (__super__) {
    inherits(MockObserver, __super__);

    function MockObserver(scheduler) {
      __super__.call(this);
      this.scheduler = scheduler;
      this.messages = [];
    }

    var MockObserverPrototype = MockObserver.prototype;

    MockObserverPrototype.onNext = function (value) {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnNext(value)));
    };

    MockObserverPrototype.onError = function (e) {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnError(e)));
    };

    MockObserverPrototype.onCompleted = function () {
      this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnCompleted()));
    };

    return MockObserver;
  })(Observer);

  function MockPromise(scheduler, messages) {
    var self = this;
    this.scheduler = scheduler;
    this.messages = messages;
    this.subscriptions = [];
    this.observers = [];
    for (var i = 0, len = this.messages.length; i < len; i++) {
      var message = this.messages[i],
          notification = message.value;
      (function (innerNotification) {
        scheduler.scheduleAbsolute(null, message.time, function () {
          var obs = self.observers.slice(0);

          for (var j = 0, jLen = obs.length; j < jLen; j++) {
            innerNotification.accept(obs[j]);
          }
          return disposableEmpty;
        });
      })(notification);
    }
  }

  MockPromise.prototype.then = function (onResolved, onRejected) {
    var self = this;

    this.subscriptions.push(new Subscription(this.scheduler.clock));
    var index = this.subscriptions.length - 1;

    var newPromise;

    var observer = Rx.Observer.create(
      function (x) {
        var retValue = onResolved(x);
        if (retValue && typeof retValue.then === 'function') {
          newPromise = retValue;
        } else {
          var ticks = self.scheduler.clock;
          newPromise = new MockPromise(self.scheduler, [Rx.ReactiveTest.onNext(ticks, undefined), Rx.ReactiveTest.onCompleted(ticks)]);
        }
        var idx = self.observers.indexOf(observer);
        self.observers.splice(idx, 1);
        self.subscriptions[index] = new Subscription(self.subscriptions[index].subscribe, self.scheduler.clock);
      },
      function (err) {
        onRejected(err);
        var idx = self.observers.indexOf(observer);
        self.observers.splice(idx, 1);
        self.subscriptions[index] = new Subscription(self.subscriptions[index].subscribe, self.scheduler.clock);
      }
    );
    this.observers.push(observer);

    return newPromise || new MockPromise(this.scheduler, this.messages);
  };

  var HotObservable = (function (__super__) {
    inherits(HotObservable, __super__);

    function HotObservable(scheduler, messages) {
      __super__.call(this);
      var message, notification, observable = this;
      this.scheduler = scheduler;
      this.messages = messages;
      this.subscriptions = [];
      this.observers = [];
      for (var i = 0, len = this.messages.length; i < len; i++) {
        message = this.messages[i];
        notification = message.value;
        (function (innerNotification) {
          scheduler.scheduleAbsolute(null, message.time, function () {
            var obs = observable.observers.slice(0);

            for (var j = 0, jLen = obs.length; j < jLen; j++) {
              innerNotification.accept(obs[j]);
            }
            return disposableEmpty;
          });
        })(notification);
      }
    }

    HotObservable.prototype._subscribe = function (o) {
      var observable = this;
      this.observers.push(o);
      this.subscriptions.push(new Subscription(this.scheduler.clock));
      var index = this.subscriptions.length - 1;
      return disposableCreate(function () {
        var idx = observable.observers.indexOf(o);
        observable.observers.splice(idx, 1);
        observable.subscriptions[index] = new Subscription(observable.subscriptions[index].subscribe, observable.scheduler.clock);
      });
    };

    return HotObservable;
  })(Observable);

  var ColdObservable = (function (__super__) {
    inherits(ColdObservable, __super__);

    function ColdObservable(scheduler, messages) {
      __super__.call(this);
      this.scheduler = scheduler;
      this.messages = messages;
      this.subscriptions = [];
    }

    ColdObservable.prototype._subscribe = function (o) {
      var message, notification, observable = this;
      this.subscriptions.push(new Subscription(this.scheduler.clock));
      var index = this.subscriptions.length - 1;
      var d = new CompositeDisposable();
      for (var i = 0, len = this.messages.length; i < len; i++) {
        message = this.messages[i];
        notification = message.value;
        (function (innerNotification) {
          d.add(observable.scheduler.scheduleRelative(null, message.time, function () {
            innerNotification.accept(o);
            return disposableEmpty;
          }));
        })(notification);
      }
      return disposableCreate(function () {
        observable.subscriptions[index] = new Subscription(observable.subscriptions[index].subscribe, observable.scheduler.clock);
        d.dispose();
      });
    };

    return ColdObservable;
  })(Observable);

  /** Virtual time scheduler used for testing applications and libraries built using Reactive Extensions. */
  Rx.TestScheduler = (function (__super__) {
    inherits(TestScheduler, __super__);

    function baseComparer(x, y) {
      return x > y ? 1 : (x < y ? -1 : 0);
    }

    function TestScheduler() {
      __super__.call(this, 0, baseComparer);
    }

    /**
     * Schedules an action to be executed at the specified virtual time.
     *
     * @param state State passed to the action to be executed.
     * @param dueTime Absolute virtual time at which to execute the action.
     * @param action Action to be executed.
     * @return Disposable object used to cancel the scheduled action (best effort).
     */
    TestScheduler.prototype.scheduleAbsolute = function (state, dueTime, action) {
      dueTime <= this.clock && (dueTime = this.clock + 1);
      return __super__.prototype.scheduleAbsolute.call(this, state, dueTime, action);
    };
    /**
     * Adds a relative virtual time to an absolute virtual time value.
     *
     * @param absolute Absolute virtual time value.
     * @param relative Relative virtual time value to add.
     * @return Resulting absolute virtual time sum value.
     */
    TestScheduler.prototype.add = function (absolute, relative) {
      return absolute + relative;
    };
    /**
     * Converts the absolute virtual time value to a DateTimeOffset value.
     *
     * @param absolute Absolute virtual time value to convert.
     * @return Corresponding DateTimeOffset value.
     */
    TestScheduler.prototype.toAbsoluteTime = function (absolute) {
      return new Date(absolute).getTime();
    };
    /**
     * Converts the TimeSpan value to a relative virtual time value.
     *
     * @param timeSpan TimeSpan value to convert.
     * @return Corresponding relative virtual time value.
     */
    TestScheduler.prototype.toRelativeTime = function (timeSpan) {
      return timeSpan;
    };
    /**
     * Starts the test scheduler and uses the specified virtual times to invoke the factory function, subscribe to the resulting sequence, and dispose the subscription.
     *
     * @param create Factory method to create an observable sequence.
     * @param created Virtual time at which to invoke the factory to create an observable sequence.
     * @param subscribed Virtual time at which to subscribe to the created observable sequence.
     * @param disposed Virtual time at which to dispose the subscription.
     * @return Observer with timestamped recordings of notification messages that were received during the virtual time window when the subscription to the source sequence was active.
     */
    TestScheduler.prototype.startScheduler = function (createFn, settings) {
      settings || (settings = {});
      settings.created == null && (settings.created = ReactiveTest.created);
      settings.subscribed == null && (settings.subscribed = ReactiveTest.subscribed);
      settings.disposed == null && (settings.disposed = ReactiveTest.disposed);

      var observer = this.createObserver(), source, subscription;

      this.scheduleAbsolute(null, settings.created, function () {
        source = createFn();
        return disposableEmpty;
      });

      this.scheduleAbsolute(null, settings.subscribed, function () {
        subscription = source.subscribe(observer);
        return disposableEmpty;
      });

      this.scheduleAbsolute(null, settings.disposed, function () {
        subscription.dispose();
        return disposableEmpty;
      });

      this.start();

      return observer;
    };

    /**
     * Creates a hot observable using the specified timestamped notification messages either as an array or arguments.
     * @param messages Notifications to surface through the created sequence at their specified absolute virtual times.
     * @return Hot observable sequence that can be used to assert the timing of subscriptions and notifications.
     */
    TestScheduler.prototype.createHotObservable = function () {
      var len = arguments.length, args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
      }
      return new HotObservable(this, args);
    };

    /**
     * Creates a cold observable using the specified timestamped notification messages either as an array or arguments.
     * @param messages Notifications to surface through the created sequence at their specified virtual time offsets from the sequence subscription time.
     * @return Cold observable sequence that can be used to assert the timing of subscriptions and notifications.
     */
    TestScheduler.prototype.createColdObservable = function () {
      var len = arguments.length, args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
      }
      return new ColdObservable(this, args);
    };

    /**
     * Creates a resolved promise with the given value and ticks
     * @param {Number} ticks The absolute time of the resolution.
     * @param {Any} value The value to yield at the given tick.
     * @returns {MockPromise} A mock Promise which fulfills with the given value.
     */
    TestScheduler.prototype.createResolvedPromise = function (ticks, value) {
      return new MockPromise(this, [Rx.ReactiveTest.onNext(ticks, value), Rx.ReactiveTest.onCompleted(ticks)]);
    };

    /**
     * Creates a rejected promise with the given reason and ticks
     * @param {Number} ticks The absolute time of the resolution.
     * @param {Any} reason The reason for rejection to yield at the given tick.
     * @returns {MockPromise} A mock Promise which rejects with the given reason.
     */
    TestScheduler.prototype.createRejectedPromise = function (ticks, reason) {
      return new MockPromise(this, [Rx.ReactiveTest.onError(ticks, reason)]);
    };

    /**
     * Creates an observer that records received notification messages and timestamps those.
     * @return Observer that can be used to assert the timing of received notifications.
     */
    TestScheduler.prototype.createObserver = function () {
      return new MockObserver(this);
    };

    return TestScheduler;
  })(VirtualTimeScheduler);

  var AnonymousObservable = Rx.AnonymousObservable = (function (__super__) {
    inherits(AnonymousObservable, __super__);

    // Fix subscriber to check for undefined or function returned to decorate as Disposable
    function fixSubscriber(subscriber) {
      return subscriber && isFunction(subscriber.dispose) ? subscriber :
        isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
    }

    function setDisposable(s, state) {
      var ado = state[0], self = state[1];
      var sub = tryCatch(self.__subscribe).call(self, ado);
      if (sub === errorObj && !ado.fail(errorObj.e)) { thrower(errorObj.e); }
      ado.setDisposable(fixSubscriber(sub));
    }

    function AnonymousObservable(subscribe, parent) {
      this.source = parent;
      this.__subscribe = subscribe;
      __super__.call(this);
    }

    AnonymousObservable.prototype._subscribe = function (o) {
      var ado = new AutoDetachObserver(o), state = [ado, this];

      if (currentThreadScheduler.scheduleRequired()) {
        currentThreadScheduler.schedule(state, setDisposable);
      } else {
        setDisposable(null, state);
      }
      return ado;
    };

    return AnonymousObservable;

  }(Observable));

  var AutoDetachObserver = (function (__super__) {
    inherits(AutoDetachObserver, __super__);

    function AutoDetachObserver(observer) {
      __super__.call(this);
      this.observer = observer;
      this.m = new SingleAssignmentDisposable();
    }

    var AutoDetachObserverPrototype = AutoDetachObserver.prototype;

    AutoDetachObserverPrototype.next = function (value) {
      var result = tryCatch(this.observer.onNext).call(this.observer, value);
      if (result === errorObj) {
        this.dispose();
        thrower(result.e);
      }
    };

    AutoDetachObserverPrototype.error = function (err) {
      var result = tryCatch(this.observer.onError).call(this.observer, err);
      this.dispose();
      result === errorObj && thrower(result.e);
    };

    AutoDetachObserverPrototype.completed = function () {
      var result = tryCatch(this.observer.onCompleted).call(this.observer);
      this.dispose();
      result === errorObj && thrower(result.e);
    };

    AutoDetachObserverPrototype.setDisposable = function (value) { this.m.setDisposable(value); };
    AutoDetachObserverPrototype.getDisposable = function () { return this.m.getDisposable(); };

    AutoDetachObserverPrototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this.m.dispose();
    };

    return AutoDetachObserver;
  }(AbstractObserver));

  var UnderlyingObservable = (function (__super__) {
    inherits(UnderlyingObservable, __super__);
    function UnderlyingObservable(m, u) {
      this._m = m;
      this._u = u;
      __super__.call(this);
    }

    UnderlyingObservable.prototype.subscribeCore = function (o) {
      return new BinaryDisposable(this._m.getDisposable(), this._u.subscribe(o));
    };

    return UnderlyingObservable;
  }(ObservableBase));

  var GroupedObservable = (function (__super__) {
    inherits(GroupedObservable, __super__);
    function GroupedObservable(key, underlyingObservable, mergedDisposable) {
      __super__.call(this);
      this.key = key;
      this.underlyingObservable = !mergedDisposable ?
        underlyingObservable :
        new UnderlyingObservable(mergedDisposable, underlyingObservable);
    }

    GroupedObservable.prototype._subscribe = function (o) {
      return this.underlyingObservable.subscribe(o);
    };

    return GroupedObservable;
  }(Observable));

  /**
   *  Represents an object that is both an observable sequence as well as an observer.
   *  Each notification is broadcasted to all subscribed observers.
   */
  var Subject = Rx.Subject = (function (__super__) {
    inherits(Subject, __super__);
    function Subject() {
      __super__.call(this);
      this.isDisposed = false;
      this.isStopped = false;
      this.observers = [];
      this.hasError = false;
    }

    addProperties(Subject.prototype, Observer.prototype, {
      _subscribe: function (o) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(o);
          return new InnerSubscription(this, o);
        }
        if (this.hasError) {
          o.onError(this.error);
          return disposableEmpty;
        }
        o.onCompleted();
        return disposableEmpty;
      },
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () { checkDisposed(this); return this.observers.length > 0; },
      /**
       * Notifies all subscribed observers about the end of the sequence.
       */
      onCompleted: function () {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onCompleted();
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the exception.
       * @param {Mixed} error The exception to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          this.error = error;
          this.hasError = true;
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onError(error);
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
       * @param {Mixed} value The value to send to all observers.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (!this.isStopped) {
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onNext(value);
          }
        }
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
      }
    });

    /**
     * Creates a subject from the specified observer and observable.
     * @param {Observer} observer The observer used to send messages to the subject.
     * @param {Observable} observable The observable used to subscribe to messages sent from the subject.
     * @returns {Subject} Subject implemented using the given observer and observable.
     */
    Subject.create = function (observer, observable) {
      return new AnonymousSubject(observer, observable);
    };

    return Subject;
  }(Observable));

  /**
   *  Represents the result of an asynchronous operation.
   *  The last value before the OnCompleted notification, or the error received through OnError, is sent to all subscribed observers.
   */
  var AsyncSubject = Rx.AsyncSubject = (function (__super__) {
    inherits(AsyncSubject, __super__);

    /**
     * Creates a subject that can only receive one value and that value is cached for all future observations.
     * @constructor
     */
    function AsyncSubject() {
      __super__.call(this);
      this.isDisposed = false;
      this.isStopped = false;
      this.hasValue = false;
      this.observers = [];
      this.hasError = false;
    }

    addProperties(AsyncSubject.prototype, Observer.prototype, {
      _subscribe: function (o) {
        checkDisposed(this);

        if (!this.isStopped) {
          this.observers.push(o);
          return new InnerSubscription(this, o);
        }

        if (this.hasError) {
          o.onError(this.error);
        } else if (this.hasValue) {
          o.onNext(this.value);
          o.onCompleted();
        } else {
          o.onCompleted();
        }

        return disposableEmpty;
      },
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () { checkDisposed(this); return this.observers.length > 0; },
      /**
       * Notifies all subscribed observers about the end of the sequence, also causing the last received value to be sent out (if any).
       */
      onCompleted: function () {
        var i, len;
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          var os = cloneArray(this.observers), len = os.length;

          if (this.hasValue) {
            for (i = 0; i < len; i++) {
              var o = os[i];
              o.onNext(this.value);
              o.onCompleted();
            }
          } else {
            for (i = 0; i < len; i++) {
              os[i].onCompleted();
            }
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the error.
       * @param {Mixed} error The Error to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          this.hasError = true;
          this.error = error;

          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onError(error);
          }

          this.observers.length = 0;
        }
      },
      /**
       * Sends a value to the subject. The last value received before successful termination will be sent to all subscribed and future observers.
       * @param {Mixed} value The value to store in the subject.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.value = value;
        this.hasValue = true;
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
        this.error = null;
        this.value = null;
      }
    });

    return AsyncSubject;
  }(Observable));

  /**
   *  Represents a value that changes over time.
   *  Observers can subscribe to the subject to receive the last (or initial) value and all subsequent notifications.
   */
  var BehaviorSubject = Rx.BehaviorSubject = (function (__super__) {
    inherits(BehaviorSubject, __super__);
    function BehaviorSubject(value) {
      __super__.call(this);
      this.value = value;
      this.observers = [];
      this.isDisposed = false;
      this.isStopped = false;
      this.hasError = false;
    }

    addProperties(BehaviorSubject.prototype, Observer.prototype, {
      _subscribe: function (o) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(o);
          o.onNext(this.value);
          return new InnerSubscription(this, o);
        }
        if (this.hasError) {
          o.onError(this.error);
        } else {
          o.onCompleted();
        }
        return disposableEmpty;
      },
      /**
       * Gets the current value or throws an exception.
       * Value is frozen after onCompleted is called.
       * After onError is called always throws the specified exception.
       * An exception is always thrown after dispose is called.
       * @returns {Mixed} The initial value passed to the constructor until onNext is called; after which, the last value passed to onNext.
       */
      getValue: function () {
        checkDisposed(this);
        if (this.hasError) { thrower(this.error); }
        return this.value;
      },
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () { checkDisposed(this); return this.observers.length > 0; },
      /**
       * Notifies all subscribed observers about the end of the sequence.
       */
      onCompleted: function () {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.isStopped = true;
        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          os[i].onCompleted();
        }

        this.observers.length = 0;
      },
      /**
       * Notifies all subscribed observers about the exception.
       * @param {Mixed} error The exception to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.isStopped = true;
        this.hasError = true;
        this.error = error;

        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          os[i].onError(error);
        }

        this.observers.length = 0;
      },
      /**
       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
       * @param {Mixed} value The value to send to all observers.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.value = value;
        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          os[i].onNext(value);
        }
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
        this.value = null;
        this.error = null;
      }
    });

    return BehaviorSubject;
  }(Observable));

  /**
   * Represents an object that is both an observable sequence as well as an observer.
   * Each notification is broadcasted to all subscribed and future observers, subject to buffer trimming policies.
   */
  var ReplaySubject = Rx.ReplaySubject = (function (__super__) {

    var maxSafeInteger = Math.pow(2, 53) - 1;

    function createRemovableDisposable(subject, observer) {
      return disposableCreate(function () {
        observer.dispose();
        !subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1);
      });
    }

    inherits(ReplaySubject, __super__);

    /**
     *  Initializes a new instance of the ReplaySubject class with the specified buffer size, window size and scheduler.
     *  @param {Number} [bufferSize] Maximum element count of the replay buffer.
     *  @param {Number} [windowSize] Maximum time length of the replay buffer.
     *  @param {Scheduler} [scheduler] Scheduler the observers are invoked on.
     */
    function ReplaySubject(bufferSize, windowSize, scheduler) {
      this.bufferSize = bufferSize == null ? maxSafeInteger : bufferSize;
      this.windowSize = windowSize == null ? maxSafeInteger : windowSize;
      this.scheduler = scheduler || currentThreadScheduler;
      this.q = [];
      this.observers = [];
      this.isStopped = false;
      this.isDisposed = false;
      this.hasError = false;
      this.error = null;
      __super__.call(this);
    }

    addProperties(ReplaySubject.prototype, Observer.prototype, {
      _subscribe: function (o) {
        checkDisposed(this);
        var so = new ScheduledObserver(this.scheduler, o), subscription = createRemovableDisposable(this, so);

        this._trim(this.scheduler.now());
        this.observers.push(so);

        for (var i = 0, len = this.q.length; i < len; i++) {
          so.onNext(this.q[i].value);
        }

        if (this.hasError) {
          so.onError(this.error);
        } else if (this.isStopped) {
          so.onCompleted();
        }

        so.ensureActive();
        return subscription;
      },
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () { checkDisposed(this); return this.observers.length > 0; },
      _trim: function (now) {
        while (this.q.length > this.bufferSize) {
          this.q.shift();
        }
        while (this.q.length > 0 && (now - this.q[0].interval) > this.windowSize) {
          this.q.shift();
        }
      },
      /**
       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
       * @param {Mixed} value The value to send to all observers.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        var now = this.scheduler.now();
        this.q.push({ interval: now, value: value });
        this._trim(now);

        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onNext(value);
          observer.ensureActive();
        }
      },
      /**
       * Notifies all subscribed observers about the exception.
       * @param {Mixed} error The exception to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.isStopped = true;
        this.error = error;
        this.hasError = true;
        var now = this.scheduler.now();
        this._trim(now);
        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onError(error);
          observer.ensureActive();
        }
        this.observers.length = 0;
      },
      /**
       * Notifies all subscribed observers about the end of the sequence.
       */
      onCompleted: function () {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.isStopped = true;
        var now = this.scheduler.now();
        this._trim(now);
        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onCompleted();
          observer.ensureActive();
        }
        this.observers.length = 0;
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
      }
    });

    return ReplaySubject;
  }(Observable));

  var AnonymousSubject = Rx.AnonymousSubject = (function (__super__) {
    inherits(AnonymousSubject, __super__);
    function AnonymousSubject(observer, observable) {
      this.observer = observer;
      this.observable = observable;
      __super__.call(this);
    }

    addProperties(AnonymousSubject.prototype, Observer.prototype, {
      _subscribe: function (o) {
        return this.observable.subscribe(o);
      },
      onCompleted: function () {
        this.observer.onCompleted();
      },
      onError: function (error) {
        this.observer.onError(error);
      },
      onNext: function (value) {
        this.observer.onNext(value);
      }
    });

    return AnonymousSubject;
  }(Observable));

  /**
  * Used to pause and resume streams.
  */
  Rx.Pauser = (function (__super__) {
    inherits(Pauser, __super__);
    function Pauser() {
      __super__.call(this);
    }

    /**
     * Pauses the underlying sequence.
     */
    Pauser.prototype.pause = function () { this.onNext(false); };

    /**
    * Resumes the underlying sequence.
    */
    Pauser.prototype.resume = function () { this.onNext(true); };

    return Pauser;
  }(Subject));

  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    root.Rx = Rx;

    define(function() {
      return Rx;
    });
  } else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = Rx).Rx = Rx;
    } else {
      freeExports.Rx = Rx;
    }
  } else {
    // in a browser or Rhino
    root.Rx = Rx;
  }

  // All code before this point will be filtered from stack traces.
  var rEndingLine = captureLine();

}.call(this));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":6}],8:[function(require,module,exports){
var VNode = require('./vnode');
var is = require('./is');

function addNS(data, children, sel) {
  data.ns = 'http://www.w3.org/2000/svg';

  if (sel !== 'foreignObject' && children !== undefined) {
    for (var i = 0; i < children.length; ++i) {
      addNS(children[i].data, children[i].children, children[i].sel);
    }
  }
}

module.exports = function h(sel, b, c) {
  var data = {}, children, text, i;
  if (c !== undefined) {
    data = b;
    if (is.array(c)) { children = c; }
    else if (is.primitive(c)) { text = c; }
  } else if (b !== undefined) {
    if (is.array(b)) { children = b; }
    else if (is.primitive(b)) { text = b; }
    else { data = b; }
  }
  if (is.array(children)) {
    for (i = 0; i < children.length; ++i) {
      if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
    }
  }
  if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g') {
    addNS(data, children, sel);
  }
  return VNode(sel, data, children, text, undefined);
};

},{"./is":10,"./vnode":17}],9:[function(require,module,exports){
function createElement(tagName){
  return document.createElement(tagName);
}

function createElementNS(namespaceURI, qualifiedName){
  return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text){
  return document.createTextNode(text);
}


function insertBefore(parentNode, newNode, referenceNode){
  parentNode.insertBefore(newNode, referenceNode);
}


function removeChild(node, child){
  node.removeChild(child);
}

function appendChild(node, child){
  node.appendChild(child);
}

function parentNode(node){
  return node.parentElement;
}

function nextSibling(node){
  return node.nextSibling;
}

function tagName(node){
  return node.tagName;
}

function setTextContent(node, text){
  node.textContent = text;
}

module.exports = {
  createElement: createElement,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  appendChild: appendChild,
  removeChild: removeChild,
  insertBefore: insertBefore,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent
};

},{}],10:[function(require,module,exports){
module.exports = {
  array: Array.isArray,
  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
};

},{}],11:[function(require,module,exports){
var NamespaceURIs = {
  "xlink": "http://www.w3.org/1999/xlink"
};

var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
                "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
                "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
                "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
                "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
                "truespeed", "typemustmatch", "visible"];

var booleanAttrsDict = Object.create(null);
for(var i=0, len = booleanAttrs.length; i < len; i++) {
  booleanAttrsDict[booleanAttrs[i]] = true;
}

function updateAttrs(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs, namespaceSplit;

  if (!oldAttrs && !attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  // update modified attributes, add new attributes
  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      if(!cur && booleanAttrsDict[key])
        elm.removeAttribute(key);
      else {
        namespaceSplit = key.split(":");
        if(namespaceSplit.length > 1 && NamespaceURIs.hasOwnProperty(namespaceSplit[0]))
          elm.setAttributeNS(NamespaceURIs[namespaceSplit[0]], key, cur);
        else
          elm.setAttribute(key, cur);
      }
    }
  }
  //remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

module.exports = {create: updateAttrs, update: updateAttrs};

},{}],12:[function(require,module,exports){
function updateClass(oldVnode, vnode) {
  var cur, name, elm = vnode.elm,
      oldClass = oldVnode.data.class,
      klass = vnode.data.class;

  if (!oldClass && !klass) return;
  oldClass = oldClass || {};
  klass = klass || {};

  for (name in oldClass) {
    if (!klass[name]) {
      elm.classList.remove(name);
    }
  }
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? 'add' : 'remove'](name);
    }
  }
}

module.exports = {create: updateClass, update: updateClass};

},{}],13:[function(require,module,exports){
function invokeHandler(handler, vnode, event) {
  if (typeof handler === "function") {
    // call function handler
    handler.call(vnode, event, vnode);
  } else if (typeof handler === "object") {
    // call handler with arguments
    if (typeof handler[0] === "function") {
      // special case for single argument for performance
      if (handler.length === 2) {
        handler[0].call(vnode, handler[1], event, vnode);
      } else {
        var args = handler.slice(1);
        args.push(event);
        args.push(vnode);
        handler[0].apply(vnode, args);
      }
    } else {
      // call multiple handlers
      for (var i = 0; i < handler.length; i++) {
        invokeHandler(handler[i]);
      }
    }
  }
}

function handleEvent(event, vnode) {
  var name = event.type,
      on = vnode.data.on;

  // call event handler(s) if exists
  if (on && on[name]) {
    invokeHandler(on[name], vnode, event);
  }
}

function createListener() {
  return function handler(event) {
    handleEvent(event, handler.vnode);
  }
}

function updateEventListeners(oldVnode, vnode) {
  var oldOn = oldVnode.data.on,
      oldListener = oldVnode.listener,
      oldElm = oldVnode.elm,
      on = vnode && vnode.data.on,
      elm = vnode && vnode.elm,
      name;

  // optimization for reused immutable handlers
  if (oldOn === on) {
    return;
  }

  // remove existing listeners which no longer used
  if (oldOn && oldListener) {
    // if element changed or deleted we remove all existing listeners unconditionally
    if (!on) {
      for (name in oldOn) {
        // remove listener if element was changed or existing listeners removed
        oldElm.removeEventListener(name, oldListener, false);
      }
    } else {
      for (name in oldOn) {
        // remove listener if existing listener removed
        if (!on[name]) {
          oldElm.removeEventListener(name, oldListener, false);
        }
      }
    }
  }

  // add new listeners which has not already attached
  if (on) {
    // reuse existing listener or create new
    var listener = vnode.listener = oldVnode.listener || createListener();
    // update vnode for listener
    listener.vnode = vnode;

    // if element changed or added we add all needed listeners unconditionally
    if (!oldOn) {
      for (name in on) {
        // add listener if element was changed or new listeners added
        elm.addEventListener(name, listener, false);
      }
    } else {
      for (name in on) {
        // add listener if new listener added
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false);
        }
      }
    }
  }
}

module.exports = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners
};

},{}],14:[function(require,module,exports){
function updateProps(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldProps = oldVnode.data.props, props = vnode.data.props;

  if (!oldProps && !props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in oldProps) {
    if (!props[key]) {
      delete elm[key];
    }
  }
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
      elm[key] = cur;
    }
  }
}

module.exports = {create: updateProps, update: updateProps};

},{}],15:[function(require,module,exports){
var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
var nextFrame = function(fn) { raf(function() { raf(fn); }); };

function setNextFrame(obj, prop, val) {
  nextFrame(function() { obj[prop] = val; });
}

function updateStyle(oldVnode, vnode) {
  var cur, name, elm = vnode.elm,
      oldStyle = oldVnode.data.style,
      style = vnode.data.style;

  if (!oldStyle && !style) return;
  oldStyle = oldStyle || {};
  style = style || {};
  var oldHasDel = 'delayed' in oldStyle;

  for (name in oldStyle) {
    if (!style[name]) {
      elm.style[name] = '';
    }
  }
  for (name in style) {
    cur = style[name];
    if (name === 'delayed') {
      for (name in style.delayed) {
        cur = style.delayed[name];
        if (!oldHasDel || cur !== oldStyle.delayed[name]) {
          setNextFrame(elm.style, name, cur);
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      elm.style[name] = cur;
    }
  }
}

function applyDestroyStyle(vnode) {
  var style, name, elm = vnode.elm, s = vnode.data.style;
  if (!s || !(style = s.destroy)) return;
  for (name in style) {
    elm.style[name] = style[name];
  }
}

function applyRemoveStyle(vnode, rm) {
  var s = vnode.data.style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  var name, elm = vnode.elm, idx, i = 0, maxDur = 0,
      compStyle, style = s.remove, amount = 0, applied = [];
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  compStyle = getComputedStyle(elm);
  var props = compStyle['transition-property'].split(', ');
  for (; i < props.length; ++i) {
    if(applied.indexOf(props[i]) !== -1) amount++;
  }
  elm.addEventListener('transitionend', function(ev) {
    if (ev.target === elm) --amount;
    if (amount === 0) rm();
  });
}

module.exports = {create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle};

},{}],16:[function(require,module,exports){
// jshint newcap: false
/* global require, module, document, Node */
'use strict';

var VNode = require('./vnode');
var is = require('./is');
var domApi = require('./htmldomapi');

function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }

var emptyNode = VNode('', {}, [], undefined, undefined);

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, map = {}, key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}

var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function init(modules, api) {
  var i, j, cbs = {};

  if (isUndef(api)) api = domApi;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
    }
  }

  function emptyNodeAt(elm) {
    var id = elm.id ? '#' + elm.id : '';
    var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
    return VNode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    return function() {
      if (--listeners === 0) {
        var parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    };
  }

  function createElm(vnode, insertedVnodeQueue) {
    var i, data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode);
        data = vnode.data;
      }
    }
    var elm, children = vnode.children, sel = vnode.sel;
    if (isDef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                                                          : api.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
        }
      } else if (is.primitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      elm = vnode.elm = api.createTextNode(vnode.text);
    }
    return vnode.elm;
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      api.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
    }
  }

  function invokeDestroyHook(vnode) {
    var i, j, data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var i, listeners, rm, ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else { // Text node
          api.removeChild(parentElm, ch.elm);
        }
      }
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    var oldStartIdx = 0, newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, before;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) { // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
          oldCh[idxInOld] = undefined;
          api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx+1]) ? null : newCh[newEndIdx+1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
    var i, hook;
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    var elm = vnode.elm = oldVnode.elm, oldCh = oldVnode.children, ch = vnode.children;
    if (oldVnode === vnode) return;
    if (!sameVnode(oldVnode, vnode)) {
      var parentElm = api.parentNode(oldVnode.elm);
      elm = createElm(vnode, insertedVnodeQueue);
      api.insertBefore(parentElm, elm, oldVnode.elm);
      removeVnodes(parentElm, [oldVnode], 0, 0);
      return;
    }
    if (isDef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      i = vnode.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      api.setTextContent(elm, vnode.text);
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  return function(oldVnode, vnode) {
    var i, elm, parent;
    var insertedVnodeQueue = [];
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();

    if (isUndef(oldVnode.sel)) {
      oldVnode = emptyNodeAt(oldVnode);
    }

    if (sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    } else {
      elm = oldVnode.elm;
      parent = api.parentNode(elm);

      createElm(vnode, insertedVnodeQueue);

      if (parent !== null) {
        api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
    return vnode;
  };
}

module.exports = {init: init};

},{"./htmldomapi":9,"./is":10,"./vnode":17}],17:[function(require,module,exports){
module.exports = function(sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
};

},{}],18:[function(require,module,exports){
/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  console.warn("Using browser-only version of superagent in non-browser environment");
  root = this;
}

var Emitter = require('emitter');
var requestBase = require('./request-base');
var isObject = require('./is-object');

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `request`.
 */

var request = module.exports = require('./request').bind(null, Request);

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  throw Error("Browser-only verison of superagent could not find XHR");
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pushEncodedKeyValuePair(pairs, key, obj[key]);
  }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (val != null) {
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (isObject(val)) {
      for(var subkey in val) {
        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
      }
    } else {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(val));
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');
    if (pos == -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] =
        decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */),
        key = parts.shift(),
        val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this._setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this._setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this._parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype._setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function(str){
  var parse = request.parse[this.type];
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype._setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      // issue #876: return the http status code if the response parsing fails
      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
      return self.callback(err);
    }

    self.emit('response', res);

    var new_err;
    try {
      if (res.status < 200 || res.status >= 300) {
        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
        new_err.original = err;
        new_err.response = res;
        new_err.status = res.status;
      }
    } catch(e) {
      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
    }

    // #1000 don't catch errors from the callback to avoid double calling it
    if (new_err) {
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}

/**
 * Mixin `Emitter` and `requestBase`.
 */

Emitter(Request.prototype);
for (var key in requestBase) {
  Request.prototype[key] = requestBase[key];
}

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set responseType to `val`. Presently valid responseTypes are 'blob' and
 * 'arraybuffer'.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (!options) {
    options = {
      type: 'basic'
    }
  }

  switch (options.type) {
    case 'basic':
      var str = btoa(user + ':' + pass);
      this.set('Authorization', 'Basic ' + str);
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
  }
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  this._getFormData().append(field, file, filename || file.name);
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype._timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Compose querystring to append to req.url
 *
 * @api private
 */

Request.prototype._appendQueryString = function(){
  var query = this._query.join('&');
  if (query) {
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self._timeoutError();
      if (self._aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = direction;
    self.emit('progress', e);
  }
  if (this.hasListeners('progress')) {
    try {
      xhr.onprogress = handleProgress.bind(null, 'download');
      if (xhr.upload) {
        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
      }
    } catch(e) {
      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  this._appendQueryString();

  // initiate request
  if (this.username && this.password) {
    xhr.open(this.method, this.url, true, this.username, this.password);
  } else {
    xhr.open(this.method, this.url, true);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};


/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function(url, data, fn){
  var req = request('OPTIONS', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-object":19,"./request":21,"./request-base":20,"emitter":4}],19:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null !== obj && 'object' === typeof obj;
}

module.exports = isObject;

},{}],20:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

exports.clearTimeout = function _clearTimeout(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

exports.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

exports.serialize = function serialize(fn){
  this._serializer = fn;
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

exports.timeout = function timeout(ms){
  this._timeout = ms;
  return this;
};

/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} reject
 * @return {Request}
 */

exports.then = function then(resolve, reject) {
  if (!this._fullfilledPromise) {
    var self = this;
    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
      self.end(function(err, res){
        if (err) innerReject(err); else innerResolve(res);
      });
    });
  }
  return this._fullfilledPromise.then(resolve, reject);
}

exports.catch = function(cb) {
  return this.then(undefined, cb);
};

/**
 * Allow for extension
 */

exports.use = function use(fn) {
  fn(this);
  return this;
}


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

exports.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

exports.getHeader = exports.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

exports.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
exports.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
exports.field = function(name, val) {

  // name should be either a string or an object.
  if (null === name ||  undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (isObject(name)) {
    for (var key in name) {
      this.field(key, name[key]);
    }
    return this;
  }

  // val should be defined now
  if (null === val || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }
  this._getFormData().append(name, val);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */
exports.abort = function(){
  if (this._aborted) {
    return this;
  }
  this._aborted = true;
  this.xhr && this.xhr.abort(); // browser
  this.req && this.req.abort(); // node
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

exports.withCredentials = function(){
  // This is browser-only functionality. Node side is no-op.
  this._withCredentials = true;
  return this;
};

/**
 * Set the max redirects to `n`. Does noting in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

exports.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

exports.toJSON = function(){
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

exports._isHost = function _isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

exports.send = function(data){
  var obj = isObject(data);
  var type = this._header['content-type'];

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || this._isHost(data)) return this;

  // default to json
  if (!type) this.type('json');
  return this;
};

},{"./is-object":19}],21:[function(require,module,exports){
// The node and browser modules expose versions of this with the
// appropriate constructor function bound as first argument
/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(RequestConstructor, method, url) {
  // callback
  if ('function' == typeof url) {
    return new RequestConstructor('GET', method).end(url);
  }

  // url first
  if (2 == arguments.length) {
    return new RequestConstructor('GET', method);
  }

  return new RequestConstructor(method, url);
}

module.exports = request;

},{}],22:[function(require,module,exports){
/*
 * to-markdown - an HTML to Markdown converter
 *
 * Copyright 2011+, Dom Christie
 * Licenced under the MIT licence
 *
 */

'use strict'

var toMarkdown
var converters
var mdConverters = require('./lib/md-converters')
var gfmConverters = require('./lib/gfm-converters')
var HtmlParser = require('./lib/html-parser')
var collapse = require('collapse-whitespace')

/*
 * Utilities
 */

var blocks = ['address', 'article', 'aside', 'audio', 'blockquote', 'body',
  'canvas', 'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
  'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
]

function isBlock (node) {
  return blocks.indexOf(node.nodeName.toLowerCase()) !== -1
}

var voids = [
  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]

function isVoid (node) {
  return voids.indexOf(node.nodeName.toLowerCase()) !== -1
}

function htmlToDom (string) {
  var tree = new HtmlParser().parseFromString(string, 'text/html')
  collapse(tree.documentElement, isBlock)
  return tree
}

/*
 * Flattens DOM tree into single array
 */

function bfsOrder (node) {
  var inqueue = [node]
  var outqueue = []
  var elem
  var children
  var i

  while (inqueue.length > 0) {
    elem = inqueue.shift()
    outqueue.push(elem)
    children = elem.childNodes
    for (i = 0; i < children.length; i++) {
      if (children[i].nodeType === 1) inqueue.push(children[i])
    }
  }
  outqueue.shift()
  return outqueue
}

/*
 * Contructs a Markdown string of replacement text for a given node
 */

function getContent (node) {
  var text = ''
  for (var i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].nodeType === 1) {
      text += node.childNodes[i]._replacement
    } else if (node.childNodes[i].nodeType === 3) {
      text += node.childNodes[i].data
    } else continue
  }
  return text
}

/*
 * Returns the HTML string of an element with its contents converted
 */

function outer (node, content) {
  return node.cloneNode(false).outerHTML.replace('><', '>' + content + '<')
}

function canConvert (node, filter) {
  if (typeof filter === 'string') {
    return filter === node.nodeName.toLowerCase()
  }
  if (Array.isArray(filter)) {
    return filter.indexOf(node.nodeName.toLowerCase()) !== -1
  } else if (typeof filter === 'function') {
    return filter.call(toMarkdown, node)
  } else {
    throw new TypeError('`filter` needs to be a string, array, or function')
  }
}

function isFlankedByWhitespace (side, node) {
  var sibling
  var regExp
  var isFlanked

  if (side === 'left') {
    sibling = node.previousSibling
    regExp = / $/
  } else {
    sibling = node.nextSibling
    regExp = /^ /
  }

  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue)
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent)
    }
  }
  return isFlanked
}

function flankingWhitespace (node, content) {
  var leading = ''
  var trailing = ''

  if (!isBlock(node)) {
    var hasLeading = /^[ \r\n\t]/.test(content)
    var hasTrailing = /[ \r\n\t]$/.test(content)

    if (hasLeading && !isFlankedByWhitespace('left', node)) {
      leading = ' '
    }
    if (hasTrailing && !isFlankedByWhitespace('right', node)) {
      trailing = ' '
    }
  }

  return { leading: leading, trailing: trailing }
}

/*
 * Finds a Markdown converter, gets the replacement, and sets it on
 * `_replacement`
 */

function process (node) {
  var replacement
  var content = getContent(node)

  // Remove blank nodes
  if (!isVoid(node) && !/A|TH|TD/.test(node.nodeName) && /^\s*$/i.test(content)) {
    node._replacement = ''
    return
  }

  for (var i = 0; i < converters.length; i++) {
    var converter = converters[i]

    if (canConvert(node, converter.filter)) {
      if (typeof converter.replacement !== 'function') {
        throw new TypeError(
          '`replacement` needs to be a function that returns a string'
        )
      }

      var whitespace = flankingWhitespace(node, content)

      if (whitespace.leading || whitespace.trailing) {
        content = content.trim()
      }
      replacement = whitespace.leading +
        converter.replacement.call(toMarkdown, content, node) +
        whitespace.trailing
      break
    }
  }

  node._replacement = replacement
}

toMarkdown = function (input, options) {
  options = options || {}

  if (typeof input !== 'string') {
    throw new TypeError(input + ' is not a string')
  }

  if (input === '') {
    return ''
  }

  // Escape potential ol triggers
  input = input.replace(/(\d+)\. /g, '$1\\. ')

  var clone = htmlToDom(input).body
  var nodes = bfsOrder(clone)
  var output

  converters = mdConverters.slice(0)
  if (options.gfm) {
    converters = gfmConverters.concat(converters)
  }

  if (options.converters) {
    converters = options.converters.concat(converters)
  }

  // Process through nodes in reverse (so deepest child elements are first).
  for (var i = nodes.length - 1; i >= 0; i--) {
    process(nodes[i])
  }
  output = getContent(clone)

  return output.replace(/^[\t\r\n]+|[\t\r\n\s]+$/g, '')
    .replace(/\n\s+\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
}

toMarkdown.isBlock = isBlock
toMarkdown.isVoid = isVoid
toMarkdown.outer = outer

module.exports = toMarkdown

},{"./lib/gfm-converters":23,"./lib/html-parser":24,"./lib/md-converters":25,"collapse-whitespace":3}],23:[function(require,module,exports){
'use strict'

function cell (content, node) {
  var index = Array.prototype.indexOf.call(node.parentNode.childNodes, node)
  var prefix = ' '
  if (index === 0) prefix = '| '
  return prefix + content + ' |'
}

var highlightRegEx = /highlight highlight-(\S+)/

module.exports = [
  {
    filter: 'br',
    replacement: function () {
      return '\n'
    }
  },
  {
    filter: ['del', 's', 'strike'],
    replacement: function (content) {
      return '~~' + content + '~~'
    }
  },

  {
    filter: function (node) {
      return node.type === 'checkbox' && node.parentNode.nodeName === 'LI'
    },
    replacement: function (content, node) {
      return (node.checked ? '[x]' : '[ ]') + ' '
    }
  },

  {
    filter: ['th', 'td'],
    replacement: function (content, node) {
      return cell(content, node)
    }
  },

  {
    filter: 'tr',
    replacement: function (content, node) {
      var borderCells = ''
      var alignMap = { left: ':--', right: '--:', center: ':-:' }

      if (node.parentNode.nodeName === 'THEAD') {
        for (var i = 0; i < node.childNodes.length; i++) {
          var align = node.childNodes[i].attributes.align
          var border = '---'

          if (align) border = alignMap[align.value] || border

          borderCells += cell(border, node.childNodes[i])
        }
      }
      return '\n' + content + (borderCells ? '\n' + borderCells : '')
    }
  },

  {
    filter: 'table',
    replacement: function (content) {
      return '\n\n' + content + '\n\n'
    }
  },

  {
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function (content) {
      return content
    }
  },

  // Fenced code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    },
    replacement: function (content, node) {
      return '\n\n```\n' + node.firstChild.textContent + '\n```\n\n'
    }
  },

  // Syntax-highlighted code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' &&
      node.parentNode.nodeName === 'DIV' &&
      highlightRegEx.test(node.parentNode.className)
    },
    replacement: function (content, node) {
      var language = node.parentNode.className.match(highlightRegEx)[1]
      return '\n\n```' + language + '\n' + node.textContent + '\n```\n\n'
    }
  },

  {
    filter: function (node) {
      return node.nodeName === 'DIV' &&
      highlightRegEx.test(node.className)
    },
    replacement: function (content) {
      return '\n\n' + content + '\n\n'
    }
  }
]

},{}],24:[function(require,module,exports){
/*
 * Set up window for Node.js
 */

var _window = (typeof window !== 'undefined' ? window : this)

/*
 * Parsing HTML strings
 */

function canParseHtmlNatively () {
  var Parser = _window.DOMParser
  var canParse = false

  // Adapted from https://gist.github.com/1129031
  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if (new Parser().parseFromString('', 'text/html')) {
      canParse = true
    }
  } catch (e) {}

  return canParse
}

function createHtmlParser () {
  var Parser = function () {}

  // For Node.js environments
  if (typeof document === 'undefined') {
    var jsdom = require('jsdom')
    Parser.prototype.parseFromString = function (string) {
      return jsdom.jsdom(string, {
        features: {
          FetchExternalResources: [],
          ProcessExternalResources: false
        }
      })
    }
  } else {
    if (!shouldUseActiveX()) {
      Parser.prototype.parseFromString = function (string) {
        var doc = document.implementation.createHTMLDocument('')
        doc.open()
        doc.write(string)
        doc.close()
        return doc
      }
    } else {
      Parser.prototype.parseFromString = function (string) {
        var doc = new window.ActiveXObject('htmlfile')
        doc.designMode = 'on' // disable on-page scripts
        doc.open()
        doc.write(string)
        doc.close()
        return doc
      }
    }
  }
  return Parser
}

function shouldUseActiveX () {
  var useActiveX = false

  try {
    document.implementation.createHTMLDocument('').open()
  } catch (e) {
    if (window.ActiveXObject) useActiveX = true
  }

  return useActiveX
}

module.exports = canParseHtmlNatively() ? _window.DOMParser : createHtmlParser()

},{"jsdom":2}],25:[function(require,module,exports){
'use strict'

module.exports = [
  {
    filter: 'p',
    replacement: function (content) {
      return '\n\n' + content + '\n\n'
    }
  },

  {
    filter: 'br',
    replacement: function () {
      return '  \n'
    }
  },

  {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: function (content, node) {
      var hLevel = node.nodeName.charAt(1)
      var hPrefix = ''
      for (var i = 0; i < hLevel; i++) {
        hPrefix += '#'
      }
      return '\n\n' + hPrefix + ' ' + content + '\n\n'
    }
  },

  {
    filter: 'hr',
    replacement: function () {
      return '\n\n* * *\n\n'
    }
  },

  {
    filter: ['em', 'i'],
    replacement: function (content) {
      return '_' + content + '_'
    }
  },

  {
    filter: ['strong', 'b'],
    replacement: function (content) {
      return '**' + content + '**'
    }
  },

  // Inline code
  {
    filter: function (node) {
      var hasSiblings = node.previousSibling || node.nextSibling
      var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings

      return node.nodeName === 'CODE' && !isCodeBlock
    },
    replacement: function (content) {
      return '`' + content + '`'
    }
  },

  {
    filter: function (node) {
      return node.nodeName === 'A' && node.getAttribute('href')
    },
    replacement: function (content, node) {
      var titlePart = node.title ? ' "' + node.title + '"' : ''
      return '[' + content + '](' + node.getAttribute('href') + titlePart + ')'
    }
  },

  {
    filter: 'img',
    replacement: function (content, node) {
      var alt = node.alt || ''
      var src = node.getAttribute('src') || ''
      var title = node.title || ''
      var titlePart = title ? ' "' + title + '"' : ''
      return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
    }
  },

  // Code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' && node.firstChild.nodeName === 'CODE'
    },
    replacement: function (content, node) {
      return '\n\n    ' + node.firstChild.textContent.replace(/\n/g, '\n    ') + '\n\n'
    }
  },

  {
    filter: 'blockquote',
    replacement: function (content) {
      content = content.trim()
      content = content.replace(/\n{3,}/g, '\n\n')
      content = content.replace(/^/gm, '> ')
      return '\n\n' + content + '\n\n'
    }
  },

  {
    filter: 'li',
    replacement: function (content, node) {
      content = content.replace(/^\s+/, '').replace(/\n/gm, '\n    ')
      var prefix = '*   '
      var parent = node.parentNode
      var index = Array.prototype.indexOf.call(parent.children, node) + 1

      prefix = /ol/i.test(parent.nodeName) ? index + '.  ' : '*   '
      return prefix + content
    }
  },

  {
    filter: ['ul', 'ol'],
    replacement: function (content, node) {
      var strings = []
      for (var i = 0; i < node.childNodes.length; i++) {
        strings.push(node.childNodes[i]._replacement)
      }

      if (/li/i.test(node.parentNode.nodeName)) {
        return '\n' + strings.join('\n')
      }
      return '\n\n' + strings.join('\n') + '\n\n'
    }
  },

  {
    filter: function (node) {
      return this.isBlock(node)
    },
    replacement: function (content, node) {
      return '\n\n' + this.outer(node, content) + '\n\n'
    }
  },

  // Anything else!
  {
    filter: function () {
      return true
    },
    replacement: function (content, node) {
      return this.outer(node, content)
    }
  }
]

},{}],26:[function(require,module,exports){
/**
 * This file automatically generated from `pre-publish.js`.
 * Do not manually edit.
 */

module.exports = {
  "area": true,
  "base": true,
  "br": true,
  "col": true,
  "embed": true,
  "hr": true,
  "img": true,
  "input": true,
  "keygen": true,
  "link": true,
  "menuitem": true,
  "meta": true,
  "param": true,
  "source": true,
  "track": true,
  "wbr": true
};

},{}],27:[function(require,module,exports){
'use strict';

const Rx = require('rx');
const $ = Rx.Observable;
const {Subject} = Rx;

const md = require('../util/md');

const request = require('../util/request');

const stream = new Subject();
const wizySubject = new Subject();

const init = () => stream.onNext(state => state);

const wizyInput = ({html, sel}) => wizySubject.onNext({html, sel});

const wizy$ = wizySubject.debounce(1000).map(({html, sel}) =>
	state => Object.assign({}, state, {content: Object.assign(
		{}, state.content, {body: md.fromHTML(html), sel}
	)})
);

const fromMD = body => stream.onNext(
	state => Object.assign({}, state, {content: Object.assign(
		{}, state.content, {body}
	)})
);

const toggleSidePanel = () => stream.onNext(
	state => Object.assign({}, state, {sidePanelOpened: !state.sidePanelOpened})
);

const toggleWizzy = wizyIsActive => stream.onNext(
	state => Object.assign({}, state, {wizyIsActive})
);

const initial = {
	content: {
		title: 'New Article',
		body: '# Hello World!\n\n- I mean it',
		sel: {start: 0, end: 0}
	},
	wizyIsActive: true,
	sidePanelOpened: false
};

module.exports = {
	init,
	wizyInput,
	fromMD,
	toggleSidePanel,
	toggleWizzy,
	initial,
	stream: $.merge(stream, wizy$)
};

},{"../util/md":30,"../util/request":31,"rx":7}],28:[function(require,module,exports){
'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// util
const vdom = require('./util/vdom');

// app
let actions = require('./actions');
const ui = require('./ui');

// services
// const router = require('./services/router');
// actions = router.attach(actions);

// reduce actions to state
const state$ = actions.stream
	.scan((state, reducer) => reducer(state), actions.initial)
	.map(state => (console.log('sc', state), state));

// map state to ui
const ui$ = state$.map(state => ui({state, actions}));
// router.hook(state$);

// patch stream to dom
vdom.patchStream(ui$, '#ui');

window.actions = actions;

},{"./actions":27,"./ui":29,"./util/vdom":33,"rx":7}],29:[function(require,module,exports){
'use strict';

const {
	section, h1, h2, h3, hr, header, i, ul, li, a, div, textarea,
	table, thead, tbody, tr, td, th, form, input, button, label
} = require('../util/vdom');

const md = require('../util/md');
const sel = require('../util/sel');

module.exports = ({state, actions}) => section('#ui', [
	section('.side-panel', {
		class: {opened: state.sidePanelOpened}
	}, [
		h3('File List'),
		ul('.file-list', [
			li([a('README.md')]),
			li([a('index.md')]),
			li([a('about.md')]),
			li([a('news.md')])
		])
	]),
	header([
		a('.fa.fa-bars', {
			on: {click: () => actions.toggleSidePanel()}
		}),
		h1('JSPress'),
		// article title
		h2('.article-title[contenteditable="true"]', state.content.title),
		section('.article-menu', [
			a('.fa.fa-save'),
			a('.fa.fa-cog'),
			a('.fa.fa-plus')
		])
	]),
	section('.editor', [
		// wysiwig
		div('.editor-area[contenteditable="true"]', {
			class: {active: state.wizyIsActive},
			props: {innerHTML: md.toHTML(state.content.body)},
			on: {
				input: ev => actions.wizyInput({
					html: ev.target.innerHTML,
					sel: sel.get(ev.target)
				})
			},
			hook: {postpatch: vnode => sel.set(vnode.elm, state.content.sel)}
		}),
		// markdown
		textarea('.editor-area', {
			class: {active: !state.wizyIsActive},
			props: {value: state.content.body},
			on: {input: ev => actions.fromMD(ev.target.value)}
		}),
		div('.editor-toolbar', [
			button({class: {active: state.wizyIsActive}, on: {click: () => actions.toggleWizzy(true)}}, 'WYSIWYG'),
			button({class: {active: !state.wizyIsActive}, on: {click: () => actions.toggleWizzy(false)}}, 'Markdown')
		])
	])
]);

},{"../util/md":30,"../util/sel":32,"../util/vdom":33}],30:[function(require,module,exports){
'use strict';

const toMarkdown = require('to-markdown');
const marked = require('marked');

const options = {
	toMarkdown: {
		converters: [
			{
				filter: 'li',
				replacement: (content, node) => {
					content = content.replace(/^\s+/, '').replace(/\n/gm, '\n ');
					let prefix = '- ';
					const parent = node.parentNode;
					const index = Array.prototype.indexOf.call(parent.children, node) + 1;

					prefix = /ol/i.test(parent.nodeName) ? index + '. ' : '- ';
					return prefix + content;
				}
			},
			{
				filter: 'div',
				replacement: (content, node) => `\n\n${content}`
			}
		]
	},
	marked: {
		gfm: true,
		breaks: true
	}
};

const toHTML = md => marked(md, options.marked);

const fromHTML = html => toMarkdown(html, options.toMarkdown);

module.exports = {
	options,
	toHTML,
	fromHTML
};

},{"marked":5,"to-markdown":22}],31:[function(require,module,exports){
'use strict';

const Rx = require('rx');
const $ = Rx.Observable;
const superagent = require('superagent');

superagent.Request.prototype.observe = function() {
	return $.fromNodeCallback(this.end, this)();
};

module.exports = superagent;

},{"rx":7,"superagent":18}],32:[function(require,module,exports){
'use strict';

const get = el => {
	var range = window.getSelection().getRangeAt(0);
	var preSelectionRange = range.cloneRange();
	preSelectionRange.selectNodeContents(el);
	preSelectionRange.setEnd(range.startContainer, range.startOffset);
	var start = preSelectionRange.toString().length;

	return {
		start: start,
		end: start + range.toString().length
	};
};

const set = (el, sel) => {
	console.log(el, sel);
	var charIndex = 0;
	var range = document.createRange();
	range.setStart(el, 0);
	range.collapse(true);
	var nodeStack = [el];
	var node;
	var foundStart = false;
	var stop = false;

	while (!stop && (node = nodeStack.pop())) {
		if (node.nodeType === 3) {
			var nextCharIndex = charIndex + node.length;
			if (!foundStart && sel.start >= charIndex && sel.start <= nextCharIndex) {
				range.setStart(node, sel.start - charIndex);
				foundStart = true;
			}
			if (foundStart && sel.end >= charIndex && sel.end <= nextCharIndex) {
				range.setEnd(node, sel.end - charIndex);
				stop = true;
			}
			charIndex = nextCharIndex;
		} else {
			var i = node.childNodes.length;
			while (i--) {
				nodeStack.push(node.childNodes[i]);
			}
		}
	}

	var tSel = window.getSelection();
	tSel.removeAllRanges();
	tSel.addRange(range);
};

module.exports = {
	get,
	set
};

},{}],33:[function(require,module,exports){
'use strict';

const snabbdom = require('snabbdom');
const h = require('snabbdom/h');

const patch = snabbdom.init([ // Init patch function with choosen modules
	require('snabbdom/modules/class'), // makes it easy to toggle classes
	require('snabbdom/modules/props'), // for setting properties on DOM elements
	require('snabbdom/modules/attributes'), // for setting properties on DOM elements
	require('snabbdom/modules/style'), // handles styling on elements with support for animations
	require('snabbdom/modules/eventlisteners') // attaches event listeners
]);

const patchStream = (stream, dom) => {
	dom = (typeof dom === 'string') ? document.querySelector(dom) : dom;
	stream.scan(
		(vnode, newVnode) => patch(vnode, newVnode),
		dom
	).subscribe();
};

const addKeyValue = (o, k, v) => {
	o[k] = v;
	return o;
};

const processAttrs = args => {
	let newArgs = args.slice();

	let selector = newArgs[0] && typeof newArgs[0] === 'string' && newArgs[0] || '';
	if (selector !== '') newArgs = newArgs.slice(1);

	const attrRegExp = /\[[a-z\-0-9]+="[^"]+"\]/ig;

	let attrs = selector && selector.match(attrRegExp);
	selector = selector.replace(attrRegExp, '');

	attrs = attrs && attrs.map && attrs
			.map(c => c.replace(/[\[\]"]/g, '').split('='))
			.reduce((o, attr) => addKeyValue(o, attr[0], attr[1]), {}) || {};

	if (attrs && Object.keys(attrs).length > 0) {
		if (!newArgs[0] || newArgs[0]
			&& typeof newArgs[0] === 'object' && !(newArgs[0] instanceof Array)) {
			attrs = Object.assign({}, newArgs[0] && newArgs[0].attrs || {}, attrs);
			newArgs[0] = Object.assign({}, newArgs[0] || {}, {attrs});
		} else {
			newArgs = [{attrs}].concat(
				newArgs
			);
		}
	}

	if (selector !== '')
		newArgs = [selector].concat(newArgs);

	// console.log(args, newArgs);
	return newArgs;
};

const hyperHelpers = [
	'h1', 'h2', 'h3', 'h4', 'section', 'header', 'article',
	'div', 'p', 'span', 'pre', 'code', 'a', 'dd', 'dt', 'hr', 'br', 'b', 'i',
	'table', 'thead', 'tbody', 'th', 'tr', 'td', 'ul', 'ol', 'li', 'textarea',
	'form', 'fieldset', 'legend', 'input', 'label', 'button', 'select', 'option',
	'canvas', 'video'
].reduce(
	(o, tag) => {
		o[tag] = function() {
			return [Array.prototype.slice.call(arguments)]
				.map(processAttrs)
				.map(
					args => (
						args[0] && typeof args[0] === 'string'
						&& args[0].match(/^(\.|#)[a-zA-Z\-_0-9]+/ig))
						? [].concat(tag + args[0], args.slice(1))
						: [tag].concat(args))
				.map(args => h.apply(this, args))
				.pop();
		};
		return o;
	}, {}
);

module.exports = Object.assign(
	{
		h,
		patch,
		patchStream
	},
	hyperHelpers
);

},{"snabbdom":16,"snabbdom/h":8,"snabbdom/modules/attributes":11,"snabbdom/modules/class":12,"snabbdom/modules/eventlisteners":13,"snabbdom/modules/props":14,"snabbdom/modules/style":15}]},{},[28]);
