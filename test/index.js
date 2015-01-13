
// Make life easier.

window.assert = require('component/assert@0.4.0');
window.component = require('/');

// Create a container.

beforeEach(function () {
  window.el = document.createElement('div');
  document.body.appendChild(window.el);
});

afterEach(function () {
  window.el.innerHTML = "";
});

describe('Virtual DOM', function () {
  require('./virtual/index');
  require('./virtual/tree');
});

describe('Component', function () {
  require('./component/helpers');
  require('./component');
  require('./component/props');
  require('./component/state');
  require('./component/mount-hook');
  require('./component/render-hook');
  require('./component/update-hook');
  require('./component/events');
  require('./component/stringify');
  require('./component/update-elements');
  require('./component/update-text');
  require('./component/update-attributes');
});