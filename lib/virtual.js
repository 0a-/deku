
/**
 * Module dependencies.
 */

var type = require('component-type');
var slice = require('sliced');
var uid = require('get-uid');

/**
 * This function lets us create virtual nodes using a simple
 * syntax. It is compatible with JSX transforms so you can use
 * JSX to write nodes that will compile to this function.
 *
 * let node = virtual('div', { id: 'foo' }, [
 *   virtual('a', { href: 'http://google.com' }, 'Google')
 * ])
 *
 * You can leave out the attributes or the children if either
 * of them aren't needed and it will figure out what you're
 * trying to do.
 */

module.exports = virtual;

/**
 * Create virtual DOM trees.
 *
 * This creates the nicer API for the user.
 * It translates that friendly API into an actual tree of nodes.
 *
 * @param {String|Function} type
 * @param {Object} props
 * @param {Array} children
 * @return {Node}
 * @api public
 */

function virtual(type, props, children) {

  // Default to div with no args
  if (!type) {
    type = 'div';
  }

  // Skipped adding attributes and we're passing
  // in children instead.
  if (arguments.length === 2 && (typeof props === 'string' || Array.isArray(props))) {
    children = props;
    props = {};
  }

  // Account for JSX putting the children as multiple arguments.
  // This is essentially just the ES6 rest param
  if (arguments.length > 2 && Array.isArray(arguments[2]) === false) {
    children = slice(arguments, 2);
  }

  children = children || [];
  props = props || {};

  // passing in a single child, you can skip
  // using the array
  if (!Array.isArray(children)) {
    children = [ children ];
  }

  children = children
    .filter(notEmpty)
    .reduce(flatten, [])
    .map(textNodes)
    .map(addIndex);

  // pull the key out from the data.
  var key = props.key;
  delete props.key;

  // if you pass in a function, it's a `Component` constructor.
  // otherwise it's an element.
  var node;
  if ('string' == typeof type) {
    node = new ElementNode(type, props, key, children);
  } else {
    node = new ComponentNode(type, props, key, children);
  }

  // set the unique ID
  node.id = uid();
  node.index = 0;

  return node;
}

/**
 * Remove null/undefined values from the array
 *
 * @param {*} value
 *
 * @return {Boolean}
 */

function notEmpty(value) {
  return value !== null && value !== undefined;
}

/**
 * Flatten nested array
 *
 * @param {Array} arr
 * @param {*} value
 *
 * @return {Array}
 */

function flatten(result, node) {
  if (Array.isArray(node)) {
    result = result.concat(node);
  } else {
    result.push(node);
  }
  return result;
}

/**
 * Parse nodes into real `Node` objects.
 *
 * @param {Mixed} node
 * @param {Integer} index
 * @return {Node}
 * @api private
 */

function textNodes(node, index) {
  if (typeof node === 'string' || typeof node === 'number') {
    return new TextNode(String(node));
  } else {
    return node;
  }
}

/**
 * Add an index
 *
 * @param {Node} node
 * @param {Number} index
 *
 * @return {Node}
 */

function addIndex(node, index) {
  node.index = index;
  return node;
}

/**
 * Initialize a new `ComponentNode`.
 *
 * @param {Component} component
 * @param {Object} props
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual nodes
 * @api public
 */

function ComponentNode(component, props, key, children) {
  this.key = key;
  this.props = props;
  this.type = 'component';
  this.component = component;
  this.props.children = children || [];
}

/**
 * Initialize a new `ElementNode`.
 *
 * @param {String} tagName
 * @param {Object} attributes
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual dom nodes.
 * @api public
 */

function ElementNode(tagName, attributes, key, children) {
  this.type = 'element';
  this.attributes = parseAttributes(attributes);
  this.tagName = parseTag(tagName, attributes);
  this.children = children || [];
  this.key = key;
}

/**
 * Initialize a new `TextNode`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {String} text
 * @api public
 */

function TextNode(text) {
  this.type = 'text';
  this.data = String(text);
}

/**
 * Parse attributes for some special cases.
 *
 * TODO: This could be more functional and allow hooks
 * into the processing of the attributes at a component-level
 *
 * @param {Object} attributes
 *
 * @return {Object}
 */

function parseAttributes(attributes) {

  // style: { 'text-align': 'left' }
  if (attributes.style) {
    attributes.style = parseStyle(attributes.style);
  }

  // data: { foo: 'bar' }
  if (attributes.data) {
    attributes = parseData(attributes);
  }

  // class: { foo: true, bar: false, baz: true }
  // class: ['foo', 'bar', 'baz']
  if (attributes.class) {
    attributes.class = parseClass(attributes.class);
  }

  // Remove attributes with false values
  for (var name in attributes) {
    if (attributes[name] === false) {
      delete attributes[name];
    }
  }

  return attributes;
}

/**
 * Parse a block of styles into a string.
 *
 * TODO: this could do a lot more with vendor prefixing,
 * number values etc. Maybe there's a way to allow users
 * to hook into this?
 *
 * @param {Object} styles
 *
 * @return {String}
 */

function parseStyle(styles) {
  if (type(styles) !== 'object') {
    return styles;
  }
  var str = '';
  for (var name in styles) {
    var value = styles[name];
    str += name + ':' + value + ';';
  }
  return str;
}

/**
 * Parse the dataset
 *
 * @param {Object} attributes
 *
 * @return {Object}
 */

function parseData(attributes) {
  if (type(attributes.data) !== 'object') {
    return attributes;
  }

  for (var name in attributes.data) {
    attributes['data-' + name] = attributes.data[name];
  }

  delete attributes.data;
  return attributes;
}

/**
 * Parse the class attribute so it's able to be
 * set in a more user-friendly way
 *
 * @param {String|Object|Array} value
 *
 * @return {String}
 */

function parseClass(value) {

  // { foo: true, bar: false, baz: true }
  if (type(value) === 'object') {
    var matched = [];
    for (var key in value) {
      if (value[key]) matched.push(key);
    }
    value = matched;
  }

  // ['foo', 'bar', 'baz']
  if (type(value) === 'array') {
    if (value.length === 0) {
      return;
    }
    value = value.join(' ');
  }

  return value;
}

/**
 * Parse the tag to allow using classes and ids
 * within the tagname like in CSS.
 *
 * @param {String} name
 * @param {Object} attributes
 *
 * @return {String}
 */

function parseTag(name, attributes) {
  if (!name) return 'div';

  var parts = name.split(/([\.#]?[a-zA-Z0-9_:-]+)/);
  var tagName = 'div';

  parts
    .filter(Boolean)
    .forEach(function(part, i){
      var type = part.charAt(0);
      if (type === '.') {
        attributes.class = ((attributes.class || '') + ' ' + part.substring(1, part.length)).trim();
      } else if (type === '#') {
        attributes.id = part.substring(1, part.length);
      } else {
        tagName = part;
      }
    });

  return tagName;
}
