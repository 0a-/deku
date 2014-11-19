
/**
 * Module dependencies.
 */

var ComponentNode = require('./component');
var ElementNode = require('./element');
var TextNode = require('./text');

/**
 * Expose `node`.
 */

module.exports = node;

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

function node(type, props, children) {
  children = children || [];
  props = props || {};

  if (!Array.isArray(children)) children = [ children ];

  children = children.map(normalize);

  // pull the key out from the data.
  var key = props.key;
  delete props.key;

  // if you pass in a function, it's a `Component` constructor.
  if ('function' == typeof type) {
    return new ComponentNode(type, props, key);
  }

  // otherwise it's an element.
  return new ElementNode(type, props, key, children);
}

/**
 * Parse nodes into real `Node` objects.
 *
 * @param {Mixed} node
 * @return {Node}
 * @api private
 */

function normalize(node, index) {
  if (typeof node === 'string' || typeof node === 'number') {
    return new TextNode(String(node));
  }
  return node;
}
