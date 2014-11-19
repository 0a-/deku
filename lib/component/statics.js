
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var Mount = require('../renderer/mount');

/**
 * Use plugin.
 *
 * @param {Function|Object} plugin passing an object will extend the prototype
 * @return {Component}
 * @api public
 */

exports.use = function(plugin){
  if ('function' === typeof plugin) {
    plugin(this);
  } else {
    assign(this.prototype, plugin);
  }
  return this;
};

/**
 * Mount this component to a node.
 *
 * @param {HTMLElement} container
 * @param {Object} props
 */

exports.render =
exports.appendTo = function(container, props){
  var mount = new Mount(this, props);
  mount.appendTo(container);
  return mount;
};

/**
 * Render this component to a string
 */

exports.renderToString = function(props){

};
