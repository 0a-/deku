
/**
 * Module dependencies.
 */

var frame = require('anthonyshort/raf-queue');
var Patch = require('./patch');
var diff = require('./diff');

/**
 * Dirty component queue.
 */

var dirty = [];
var cache = {};
var i = 0;

/**
 * Add a component to the render queue.
 *
 * @param {Component} component
 * @param {Object} state State it will update to.
 */

exports.add = function(component){
  // TODO: how to only add one component per frame?
  dirty.push(transaction(component));
  frame.once(exports.render);
};

/**
 * Render the dirty queue.
 *
 * This should typically happen on the next frame.
 *
 * @api public
 */

exports.render = function(){
  // TODO: dirty.sort(byDepth);
  for (var i = 0, n = dirty.length; i < n; i++) {
    var component = dirty[i];
    var patch = new Patch;
    diff.component(component, patch);
    var el = cache[component.root];
    patch.apply(el);
  }
  dirty.length = 0;
};

/**
 * TODO: way to add/remove root elements from cache.
 *
 * @return {String}
 */

exports.cache = function(el){
  var id = (++i).toString(36);
  cache[id] = el;
  return id;
};

/**
 * Add this component state change to the current transaction.
 *
 * TODO: just a placeholder atm.
 *
 * @param {Component} component
 * @param {Object} state
 * @return {Object} transaction
 */

function transaction(component, state) {
  return component;
}

/**
 * Sort so parents are at the top and children are at the bottom.
 */

function byDepth(a, b) {

}
