
/**
 * Expose `TextComponent`.
 */

module.exports = TextComponent;

/**
 * Initialize a new `TextComponent`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {Node} node
 * @api public
 */

function TextComponent(node) {
  this.owner = node;
  // TODO: this is kinda weird, need to figure out a better way.
  // This component can probably become more like VirtualNode
  this.data = String(node.attributes);
}

/**
 * Type checking.
 */

TextComponent.nodeType = 'text';

/**
 * Create.
 *
 * @param {String} root Mounted component root.
 * @param {String} path Path from root to this element.
 * @api public
 */

TextComponent.prototype.create = function(root, path){
  this.path = path;
  this.root = root;
};

/**
 * Return the text string.
 *
 * @return {String}
 * @api public
 */

TextComponent.prototype.toString = function(){
  return this.data;
};
