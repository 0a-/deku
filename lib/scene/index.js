
/**
 * Module dependencies
 */

var loop = require('./loop');
var Emitter = require('component/emitter');

/**
 * Expose `Scene`
 *
 * @type {Function}
 */

module.exports = Scene;

/**
 * A scene renders a component tree to an element
 * and manages the lifecycle and events each frame.
 *
 * @param {HTMLElement} container
 * @param {Entity} entity
 */

function Scene(renderer, entity) {
  this._pendingMessages = [];
  this.messages = new Emitter();
  this.tick = this.update.bind(this);
  this.renderer = renderer;
  this.dirty = true;
  this.entity = entity;
  entity.addToScene(this);
  this.update();
  this.resume();
}

Emitter(Scene.prototype);

/**
 * Push a message to the queue
 *
 * @api private
 *
 * @return {void}
 */
Scene.prototype.send = function(name, data){
  this._pendingMessages.push({ name: name, data: data });
};

/**
 * Listen for messages
 *
 * @param {String} name
 * @param {Function} fn
 *
 * @api public
 */

Scene.prototype.onMessage = function(name, fn){
  this.messages.on(name, fn);
};

/**
 * Flush all messages from the queue
 *
 * @api private
 */

Scene.prototype.flush = function(){
  var messages = this.messages;
  this._pendingMessages.forEach(function(message){
    messages.emit(message.name, message.data);
  });
};

/**
 * Schedule this component to be updated on the next frame.
 *
 * @param {Function} done
 * @return {void}
 */

Scene.prototype.update = function(){
  this.flush();
  if (!this.dirty) return;
  this.dirty = false;
  this.renderer.render(this.entity);
  this.emit('update');
};

/**
 * Set new props on the component and trigger a re-render.
 *
 * @param {Object} newProps
 * @param {Function} [done]
 */

Scene.prototype.setProps = function(newProps, done){
  if (done) this.once('update', done);
  this.entity.setProps(newProps);

  // Return a promise if the environment
  // supports the native version.
  var self = this;
  if (typeof Promise !== 'undefined') {
    return new Promise(function(resolve){
      self.once('update', function(){
        resolve();
      });
    });
  }
};

/**
 * Replace all the props on the current entity
 *
 * @param {Objct} newProps
 * @param {Function} done
 *
 * @return {Promise}
 */

Scene.prototype.replaceProps = function(newProps, done){
  if (done) this.once('update', done);
  this.entity.replaceProps(newProps);

  // Return a promise if the environment
  // supports the native version.
  var self = this;
  if (typeof Promise !== 'undefined') {
    return new Promise(function(resolve){
      self.once('update', function(){
        resolve();
      });
    });
  }
};

/**
 * Remove the scene from the DOM.
 */

Scene.prototype.remove = function(){
  this.pause();
  this.renderer.clear();
  this._pendingMessages = [];
};

/**
 * Resume updating the scene
 */

Scene.prototype.resume = function(){
  loop.on('tick', this.tick);
};

/**
 * Stop updating the scene
 */

Scene.prototype.pause = function(){
  loop.off('tick', this.tick);
};