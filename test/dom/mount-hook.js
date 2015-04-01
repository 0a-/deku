import {mount,div} from '../helpers'
import {component,render,scene,dom} from '../../'
import assert from 'assert'

it('should fire the `afterMount` hook', function(done){
  var Page = component({
    afterMount: function(){
      done();
    }
  });
  mount(scene(Page))
})

it('should fire the `beforeMount` hook before `mount`', function(){
  var pass;
  var Page = component({
    beforeMount: function(){
      pass = false;
    },
    afterMount: function(){
      pass = true;
    }
  });
  mount(scene(Page))
  assert(pass);
})

it('should not unmount twice', function(){
  var Page = component()
  var app = scene(Page)
  var el = div()
  var mount = render(app, el)
  mount.remove()
  mount.remove()
  document.body.removeChild(el)
})

it('should fire mount events on sub-components', function(){
  var i = 0;

  function inc() { i++ }

  var ComponentA = component({
    afterMount: inc,
    beforeMount: inc,
    render: function(props, state){
      return dom('span', { name: props.name }, [props.text]);
    }
  });

  var ComponentB = component({
    afterMount: inc,
    beforeMount: inc,
    render: function(props, state){
      return dom(ComponentA, { text: 'foo', name: props.name });
    }
  });

  var app = scene(ComponentB)
  app.setProps({ name: 'Bob' })

  mount(app, function(){
    assert.equal(i, 4);
  })
});

it('should fire unmount events on sub-components from the bottom up', function(){
  var arr = [];

  var ComponentA = component({
    beforeUnmount: function(){
      arr.push('A')
    },
    render: function(props, state){
      return dom('span', { name: props.name }, [props.text]);
    }
  });

  var ComponentB = component({
    beforeUnmount: function(){
      arr.push('B')
    },
    render: function(props, state){
      return dom(ComponentA, { text: 'foo', name: props.name });
    }
  });

  var app = scene(ComponentB)
  app.setProps({ name: 'Bob' })

  mount(app)
  assert.equal(arr.length, 2)
  assert.equal(arr[0], 'A')
  assert.equal(arr[1], 'B')
});

it('should fire mount events on sub-components created later', function(){
  var calls = 0;
  function inc() { calls++ }

  var ComponentA = component({
    afterMount: inc,
    beforeMount: inc
  });

  var ComponentB = component({
    render: function(props, state){
      if (!props.showComponent) {
        return dom();
      } else {
        return dom(ComponentA);
      }
    }
  });

  var app = scene(ComponentB)
  app.setProps({ showComponent: false })

  mount(app, function(el, renderer){
    app.setProps({ showComponent: true })
    renderer.render()
    assert.equal(calls, 2)
  })
});

it('should fire unmount events on sub-components created later', function(){
  var calls = 0;
  function inc() { calls++ }

  var ComponentA = component({
    beforeUnmount: inc
  });

  var ComponentB = component({
    render: function(props, state){
      if (!props.showComponent) {
        return dom();
      } else {
        return dom(ComponentA);
      }
    }
  });

  var app = scene(ComponentB)
  app.setProps({ showComponent: true })

  mount(app, function(el, renderer){
    app.setProps({ showComponent: false })
    renderer.render()
    assert.equal(calls, 1)
  })

})

