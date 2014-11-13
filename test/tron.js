var assert = require('component/assert@0.4.0');
var Emitter = require('component/emitter');
var domify = require('component/domify');
var tick = require('timoxley/next-tick');
var component = require('../index');

describe('tron', function(){
  var el;

  function defaultRender(dom, state, props) {
    return dom();
  }

  beforeEach(function(){
    el = domify('<div id="example"></div>');
    document.body.appendChild(el);
  });

  afterEach(function(){
    var el = document.getElementById('example');
    if (el) document.body.removeChild(el);
  });

  it('should create a component', function(){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', null, ['Hello World']);
      }
    });
    Page.render(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should create a component with properties', function(){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', null, [props.one + ' ' + props.two]);
      }
    });
    Page.render(el, {
      one: 'Hello',
      two: 'World'
    });
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should fire the `mount` hook', function (done) {
    var Page = component({
      render: defaultRender,
      mount: function(el){
        assert(el.tagName === 'DIV');
        done();
      }
    });
    Page.render(el);
  })

  it('should fire the `beforeMount` hook before `mount`', function (done) {
    var Page = component({
      render: defaultRender,
      beforeMount: function(){
        done();
      },
      mount: function(){
        done(false);
      }
    });
    Page.render(el);
  })

  it('should fire the `unmount` hook', function (done) {
    var Page = component({
      render: defaultRender,
      unmount: function(){
        done();
      }
    });
    var mount = Page.render(el);
    mount.remove();
  })

  it('should fire the `beforeUnmount` hook before `unmount`', function (done) {
    var Page = component({
      render: defaultRender,
      beforeUnmount: function(){
        done();
      },
      unmount: function(){
        done(false);
      }
    });
    Page.render(el).remove();
  })

  it('should not unmount twice', function () {
    var Page = component({
      render: defaultRender
    });
    var mount = Page.render(el);
    mount.remove();
    mount.remove();
  })

  it('should update simple text nodes', function(){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', null, [props.one + ' ' + props.two]);
      }
    });
    var mount = Page.render(el, {
      one: 'Hello',
      two: 'World'
    });
    mount.set({
      two: 'Pluto'
    });
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
  });

  it('should update simple attributes', function(){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', { name: props.name });
      }
    });
    var mount = Page.render(el, { name: 'Tom' });
    assert.equal(el.innerHTML, '<span name="Tom"></span>');
    mount.set({ name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob"></span>');
  });

  it('should add simple attributes', function(){
    var Page = component({
      render: function(dom, state, props) {
        var attrs = {};
        if (props.name) attrs.name = props.name;
        return dom('span', attrs);
      }
    });
    var mount = Page.render(el);
    assert.equal(el.innerHTML, '<span></span>');
    mount.set({ name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob"></span>');
  });

  it('should remove simple attributes', function(){
    var Page = component({
      render: function(dom, state, props) {
        var attrs = {};
        if (props.name) attrs.name = props.name;
        return dom('span', attrs);
      }
    });
    var mount = Page.render(el, { name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob"></span>');
    mount.set({ name: null });
    assert.equal(el.innerHTML, '<span></span>');
  });

  it('should render sub-components', function(){

    var ComponentA = component({
      displayName: 'ComponentA',
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      displayName: 'ComponentB',
      render: function(n, state, props){
        return n(ComponentA, { text: 'foo', name: props.name });
      }
    });

    var mount = ComponentB.render(el, { name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob">foo</span>');
  });

  it('should fire mount events on sub-components', function(){
    var i = 0;

    function inc() { i++ }

    var ComponentA = component({
      mount: inc,
      beforeMount: inc,
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      mount: inc,
      beforeMount: inc,
      render: function(n, state, props){
        return n(ComponentA, { text: 'foo', name: props.name });
      }
    });

    var mount = ComponentB.render(el, { name: 'Bob' });
    assert(i === 4, i);
  });

  it('should fire unmount events on sub-components', function(){
    var i = 0;

    function inc() { i++ }

    var ComponentA = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA, { text: 'foo', name: props.name });
      }
    });

    var mount = ComponentB.render(el, { name: 'Bob' });
    mount.remove();
    assert(i === 4, i);
    assert(el.innerHTML === "");
  });

  it('should update sub-components', function(){

    var ComponentA = component({
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      render: function(n, state, props){
        return n(ComponentA, { text: 'foo', name: props.name });
      }
    });

    var mount = ComponentB.render(el, { name: 'Bob' });
    mount.set({ name: 'Tom' })
    assert.equal(el.innerHTML, '<span name="Tom">foo</span>');
  });

  it('should change tag names', function(){
    var i = 0;

    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });

    var mount = ComponentA.render(el, { type: 'span' });
    mount.set({ type: 'div' })
    assert.equal(el.innerHTML, '<div>test</div>');
  });

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

  it.skip('should change sub-component tag names', function(){
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
    mount.set({ type: 'div' })
    assert.equal(el.innerHTML, '<div>test</div>');
  });


});
