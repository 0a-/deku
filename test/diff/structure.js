var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('structure', function(){

  /**
   * When updating a component it should add new elements
   * that are created on the new pass. These elements should
   * be added to the DOM.
   */

  it('should add new elements', function(){
    var i = 1;
    var Page = component({
      render: function(dom){
        if (i === 1) return dom('div');
        if (i === 2) return dom('div', null, [dom('span', { id: 'foo' })]);
      }
    });
    var view = Page.render(el);
    assert(document.querySelector('#foo') == null);
    i = 2;
    view.render();
    assert(document.querySelector('#foo'));
  });

  /**
   * When updating a component it should remove elements
   * from the DOM that don't exist in the new rendering.
   */

  it('should remove nodes', function(){
    var i = 1;
    var Page = component({
      render: function(dom){
        if (i === 1) return dom('div', null, [dom('span', { id: 'foo' })]);
        if (i === 2) return dom('div');
      }
    });
    var view = Page.render(el);
    assert(document.querySelector('#foo'));
    i = 2;
    view.render();
    assert(document.querySelector('#foo') == null);
  });

  /**
   * It should change the tag name of element and keep
   * the same content.
   */

  it('should change tag names', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });
    var mount = ComponentA.render(el, { type: 'span' });
    assert.equal(el.innerHTML, '<span>test</span>');
    mount.set({ type: 'div' })
    assert.equal(el.innerHTML, '<div>test</div>');
  });

  /**
   * When changing the tagName of an element it destroy all of the sub-components
   */

  it.skip('should remove nested components when switching tag names', function(){
    var i = 0;
    function inc() { i++ }
    var ComponentA = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', null, ['test']);
      }
    });
    var ComponentB = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA);
      }
    });
    var ComponentC = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        if (props.n === 0) {
          return n('div', null, [
            n('div', null, [
              n(ComponentB),
              n(ComponentA)
            ])
          ]);
        }
        else {
          n('span', null, [
            n(ComponentB),
            n(ComponentA)
          ])
        }
      }
    });
    var mount = ComponentC.render(el, { n: 0 });
    mount.set({ n: 1 })
    assert.equal(i, 6);
  });

  it('should remove nested components when removing a branch', function(){
    var i = 0;
    function inc() { i++ }
    var ComponentA = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', null, ['test']);
      }
    });
    var ComponentB = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA);
      }
    });
    var ComponentC = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        if (props.n === 0) {
          return n('div', null, [
            n('div', null, [
              n(ComponentB),
              n(ComponentA)
            ])
          ]);
        }
        else {
          return n('div');
        }
      }
    });
    var mount = ComponentC.render(el, { n: 0 });
    mount.set({ n: 1 })
    assert.equal(i, 6);
  });

  it('should change sub-component tag names', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });
    var ComponentB = component({
      render: function(n){
        return n(ComponentA);
      }
    });
    var mount = ComponentB.render(el, { type: 'span' });
    mount.set({ type: 'div' });
    assert.equal(el.innerHTML, '<div>test</div>');
  });

});
