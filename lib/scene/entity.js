
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var Interactions = require('../scene/interactions');
var Emitter = require('component/emitter');
var dom = require('../node');
var diff = require('../renderer/diff');
var Tree = require('../renderer/tree');

/**
 * Expose `Entity`.
 */

module.exports = Entity;

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 *
 * @param {Function} Component
 * @param {Object} props
 */

function Entity(Component, props) {
  this.instance = new Component();
  this.props = props || {};
  this.state = this.instance.initialState();
  this.children = {};
  this.interactions = new Interactions(this);
  this.previous = null;
  this.current = this.render();
  this.dirty = false;

  // when component state changes.
  this.instance.on('change', this.invalidate.bind(this));

  // Create the element
  this.el = this.toElement(this.current.root);
  this.interactions.init();

  // TODO we could potentially pass in a pre-rendered element and
  // use that instead of creating a new one.

  // TODO: This should know the current lifecycle state of the c
  // component so that we can do things like preventing updates
  // while unmounting
}

/**
 * Mixin event emitter.
 */

Emitter(Entity.prototype);

/**
 * Mixin diff.
 */

assign(Entity.prototype, diff);

/**
 * Add this mount to the DOM.
 *
 * @param {Element} container
 */

Entity.prototype.appendTo = function(container){
  this._beforeMount();
  container.appendChild(this.el);
  this._afterMount();
};

/**
 * Get an updated version of the virtual tree.
 *
 * TODO: Throw an error if the render method doesn't return a node.
 *
 * @return {Node}
 */

Entity.prototype.render = function(){
  var node = this.instance.render(dom, this.state, this.props);
  if (!node) {
    throw new Error('Component#render must return a Node using the dom object');
  }
  return new Tree(node);
};

/**
 * Schedule this component to be updated on the next frame.
 *
 * @param {Function} done
 * @return {void}
 */

Entity.prototype.invalidate = function(){
  this.dirty = true;
};

/**
 * Does this component need to be re-rendered or any
 * component deeper in the tree.
 *
 * @return {Boolean}
 */

Entity.prototype.isDirty = function(){
  if (this.dirty === true) return true;
  for (var key in this.children) {
    if (this.children[key].isDirty()) return true;
  }
  return false;
};

/**
 * Force update the component.
 *
 * This invalidates the component and renders it immediately.
 */

Entity.prototype.forceUpdate = function(){
  this.update(true);
};

/**
 * Update the props on the component. Optionally force
 * the update regardless of whether or not the shouldUpdate
 * test passes in the component.
 *
 * @param {Boolean} force
 * @return {Node}
 */

Entity.prototype.update = function(force){
  var self = this;
  var nextProps = this._pendingProps;
  var nextState = this.instance._pendingState;
  var shouldUpdate = this.instance.shouldUpdate(this.state, this.props, nextState, nextProps);

  function next() {
    for (var key in self.children) {
      self.children[key].update(force);
    }
  }

  // check the component.
  if (!force && !shouldUpdate) return next();

  // pre-update.
  this.instance.beforeUpdate(this.state, this.props, nextState, nextProps);

  // merge in the changes.
  var previousState = this.state;
  var previousProps = this.props;
  this.state = assign({}, this.state, this.instance._pendingState);
  this.props = this._pendingProps || this.props;

  // reset.
  this.instance._pendingState = false;
  this._pendingProps = false;

  // render the current state.
  this.previous = this.current;
  this.current = this.render();

  // update the element to match.
  this.diff();

  // unset previous so we don't keep it in memory.
  this.previous = null;

  // post-update.
  this.instance.afterUpdate(this.state, this.props, previousState, previousProps);

  // recursive
  next();
};

/**
 * Remove the component from the DOM.
 */

Entity.prototype.remove = function(){
  var el = this.el;
  if (!el) return;
  // TODO: add support for animation transitions (async behavior).
  this.instance.beforeUnmount(this.el, this.state, this.props);
  if (el.parentNode) el.parentNode.removeChild(el);
  this.each(function(child){
    child.remove();
  });
  this.instance.afterUnmount(this.el, this.state, this.props);
  this.children = {};
  this.el = null;
};

/**
 * Set the next props.
 *
 * These will get merged in on the next render.
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.setProps = function(nextProps){
  this._pendingProps = nextProps;
  this.invalidate();
};

/**
 * Call a method on each sub-component
 *
 * @param {Function} fn
 */

Entity.prototype.each = function(fn){
  for (var path in this.children) {
    fn(this.children[path]);
  }
};

/**
 * Convert this node and all it's children into
 * real DOM elements and return it.
 *
 * Passing in a node allows us to render just a small
 * part of the tree instead of the whole thing, like when
 * a new branch is added during a diff.
 *
 * @param {Node} node
 * @return {Element}
 */

Entity.prototype.toElement = function(node){
  var path = this.current.getPath(node);

  // we can only render nodes that exist within the tree.
  if (!path) throw new Error('Node does not exist in the current tree');

  if (node.type === 'text') {
    return document.createTextNode(node.data);
  }

  if (node.type === 'element') {
    var el = document.createElement(node.tagName);
    // precompute path.
    el.__path__ = path
    var children = node.children;
    // add attributes.
    this.applyAttributes(el, node.attributes);

    // add children.
    for (var i = 0, n = children.length; i < n; i++) {
      el.appendChild(this.toElement(children[i]));
    }
    return el;
  }

  // otherwise, it's a component node.
  var child = new Entity(node.component, node.props);
  this.children[path] = child;

  // return el for components that have a root node that's another component.
  return child.el;
};

/**
 * Trigger `afterMount` event on this component and all sub-components.
 */

Entity.prototype._afterMount = function(){
  this.instance.afterMount(this.el, this.state, this.props);
  this.each(function(mount){
    mount._afterMount();
  });
};

/**
 * Trigger `beforeMount` event on this component and all sub-components.
 */

Entity.prototype._beforeMount = function(){
  this.instance.beforeMount(this.el, this.state, this.props);
  this.each(function(mount){
    mount._beforeMount();
  });
};

/**
 * Apply dom attributes, styles, and event listeners to an element.
 *
 * TODO: Abstract away into it's own module, and perhaps simplify.
 *
 * @param {HTMLElement} el
 * @param {Object} attributes
 */

Entity.prototype.applyAttributes = function(el, attributes){
  for (var key in attributes) {
    this.setAttribute(el, key, attributes[key]);
  }
};

/**
 * Set attributes in a generic way.
 *
 * TODO: more generic.
 *
 * @param {HTMLElement} el
 * @param {String} key
 * @param {Mixed} val
 */

Entity.prototype.setAttribute = function(el, key, val){
  if (Interactions.isEvent(key)) {
    return this.interactions.bind(el, key, val);
  }
  el.setAttribute(key, val);
}

/**
 * Remove attributes in a generic way.
 *
 * TODO: more generic.
 *
 * @param {HTMLElement} el
 * @param {String} key
 */

Entity.prototype.removeAttribute = function(el, key){
  if (Interactions.isEvent(key)) {
    return this.interactions.unbind(el, key);
  }
  el.removeAttribute(key);
}
