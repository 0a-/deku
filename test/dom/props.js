import raf from 'component-raf'
import assert from 'assert'
import {component,dom,World} from '../../'
import {TwoWords,mount,div,Span} from '../helpers'

var Test = component(TwoWords);

it('should merge props on the world', function(){
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Test, { one: 'Hello', two: 'World' });

  world.update({ two: 'Pluto' })
  assert.equal(el.innerHTML, '<span>Hello Pluto</span>')
});

it('should update on the next frame', function(done){
  var world = World();
  var el = div();
  world.mount(el, Test, { one: 'Hello', two: 'World' });

  world.update({ one: 'Hello', two: 'Pluto' });
  assert.equal(el.innerHTML, '<span>Hello World</span>');
  requestAnimationFrame(function(){
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
    done();
  });
});

it('should not update props if the world is removed', function (done) {
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, component(Span), { text: 'foo' });

  renderer.update = function(){
    done(false)
  }

  world.update({ text: 'bar' });
  world.remove();
  raf(function(){
    done()
  });
});

it('should not update twice when setting props', function(){
  var i = 0;
  var IncrementAfterUpdate = component({
    afterUpdate: function(){
      i++;
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, IncrementAfterUpdate, { text: 'one' });

  world.update({ text: 'two' });
  world.update({ text: 'three' });
  assert.equal(i, 1);
});

it('should update child even when the props haven\'t changed', function () {
  var calls = 0;

  var Child = component({
    render: function(props, state){
      calls++;
      return dom('span', null, [props.text]);
    }
  });

  var Parent = component({
    render: function(props, state){
      return dom('div', { name: props.character }, [
        dom(Child, { text: 'foo' })
      ]);
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Parent, { character: 'Link' });
  world.update({ character: 'Zelda' });
  assert.equal(calls, 2);
});

it.skip('should call propsChanged when props are changed', function (done) {
  var Test = component({
    propsChanged: function(nextProps){
      assert(nextProps.foo);
      done();
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Test, { foo: false });
  world.update({ foo: true });
});

it('should call propsChanged on child components', function (done) {
  var Child = component({
    propsChanged: function(nextProps){
      assert(nextProps.count === 1);
      done();
    }
  });
  var Parent = component({
    render: function(props){
      return dom(Child, { count: props.count });
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Parent, { count: 0 });

  world.update({ count: 1 });
});

it.skip('should not call propsChanged on child components when they props don\'t change', function () {
  // TODO
});
