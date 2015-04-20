/** @jsx dom */

import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

/**
 * Custom components used for testing
 */

var Toggle = {
  render: function(props){
    if (!props.showChildren) {
      return (
        <div></div>
      )
    } else {
      return (
        <div>
          <span id="foo"></span>
        </div>
      )
    }
  }
}

var CustomTag = {
  render: function(props){
    return dom(props.type);
  }
}

var AdjacentTest = {
  render: function(props){
    if (props.i === 1) {
      return (
        <div id="root">
          <span id="foo"></span>
          <span id="bar"></span>
          <span id="baz"></span>
        </div>
      )
    } else {
      return (
        <div id="root">
          <span id="foo"></span>
        </div>
      )
    }
  }
}

var BasicComponent = {
  render: function(props){
    return <div>component</div>
  }
}

var ComponentToggle = {
  render: function(props){
    if (!props.showComponent) {
      return <span></span>
    } else {
      return <BasicComponent />
    }
  }
}

/**
 * When updating a component it should add new elements
 * that are created on the new pass. These elements should
 * be added to the DOM.
 */

it('should add/remove element nodes', function(){
  var app = deku()
  app.mount(<Toggle showChildren={false} />);

  mount(app, function(el){
    assert.equal(el.innerHTML, '<div></div>')
    app.mount(<Toggle showChildren={true} />);
    assert.equal(el.innerHTML, '<div><span id="foo"></span></div>')
    app.mount(<Toggle showChildren={false} />);
    assert.equal(el.innerHTML, '<div></div>')
  })
});

/**
 * When updating a component it should remove child elements
 * from the DOM that don't exist in the new rendering but leave the existing nodes.
 */

it('should only remove adjacent element nodes', function(){
  var app = deku()
  app.mount(<AdjacentTest i={1} />)

  mount(app, function(el){
    assert(el.querySelector('#foo'));
    assert(el.querySelector('#bar'));
    assert(el.querySelector('#baz'));
    app.mount(<AdjacentTest i={2} />)
    assert(el.querySelector('#foo'));
    assert.equal(el.querySelector('#bar'), null);
    assert.equal(el.querySelector('#baz'), null);
  })
})

/**
 * It should change the tag name of element
 */

it('should change tag names', function(){
  var app = deku()
  app.mount(<CustomTag type="span" />);

  mount(app, function(el){
    assert.equal(el.innerHTML, '<span></span>');
    app.mount(<CustomTag type="div" />);
    assert.equal(el.innerHTML, '<div></div>');
  })
});

/**
 * Because the root node has changed, when updating the mounted component
 * should have it's element updated so that it applies the diff patch to
 * the correct element.
 */

it('should change root node and still update correctly', function(){
  var ComponentA = {
    render: function(props, state){
      return dom(props.type, null, props.text);
    }
  }

  var Test = {
    render: function(props, state){
      return dom(ComponentA, { type: props.type, text: props.text });
    }
  }

  var app = deku()
  app.mount(<Test type="span" text="test" />)

  mount(app, function(el){
    assert.equal(el.innerHTML, '<span>test</span>')
    app.mount(<Test type="div" text="test" />)
    assert.equal(el.innerHTML, '<div>test</div>')
    app.mount(<Test type="div" text="foo" />)
    assert.equal(el.innerHTML, '<div>foo</div>')
  })
});

/**
 * When a node is removed from the tree, all components within that
 * node should be recursively removed and unmounted.
 */

it('should unmount components when removing an element node', function(){
  var i = 0;
  function inc() { i++ }

  var UnmountTest = {
    render: function(){
      return <div></div>
    },
    beforeUnmount: inc
  }

  var App = {
    render: function(props, state){
      if (props.showElements) {
        return (
          <div>
            <div>
              <UnmountTest />
            </div>
          </div>
        )
      }
      else {
        return (
          <div></div>
        )
      }
    }
  }

  var app = deku()
  app.mount(<App showElements={true} />)

  mount(app, function(el){
    app.mount(<App showElements={false} />)
    assert.equal(i, 1);
  })
});

/**
 * When a component has another component directly rendered
 * with it, it should be able to swap out the type of element
 * that is rendered.
 */

it('should change sub-component tag names', function(){
  var Test = {
    render: function(props, state){
      return <CustomTag type={props.type} />;
    }
  }

  var app = deku()
  app.mount(<Test type="span" />)

  mount(app, function(el){
    app.mount(<Test type="div" />)
    assert.equal(el.innerHTML, '<div></div>');
  })
})

/**
 * It should be able to render new components when re-rendering
 */

it('should replace elements with component nodes', function(){
  var Test = {
    render: function(props, state){
      if (props.showElement) {
        return <span>element</span>
      } else {
        return <BasicComponent />
      }
    }
  }

  var app = deku()
  app.mount(<Test showElement={true} />)

  mount(app, function(el){
    assert.equal(el.innerHTML, '<span>element</span>')
    app.mount(<Test showElement={false} />)
    assert.equal(el.innerHTML, '<div>component</div>')
  })
});

/**
 * If the component type changes at a node, the first component
 * should be removed and unmount and replaced with the new component
 */

it('should replace components', function(){
  var ComponentA = {
    render: function(props, state){
      return <div>A</div>
    }
  }
  var ComponentB = {
    render: function(props, state){
      return <div>B</div>
    }
  }
  var ComponentC = {
    render: function(props, state){
      if (props.type === 'A') {
        return <ComponentA />
      } else {
        return <ComponentB />
      }
    }
  }

  var app = deku()
  app.mount(<ComponentC type="A" />)

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div>A</div>')
    app.mount(<ComponentC type="B" />)
    assert.equal(el.innerHTML, '<div>B</div>')
  })
})

/**
 * It should remove components from the children hash when they
 * are moved from the tree.
 */

it('should remove references to child components when they are removed', function(){
  var app = deku()
  app.mount(<ComponentToggle showComponent={true} />);

  mount(app, function(el, renderer){
    assert(Object.keys(renderer.inspect().children).length === 3)
    app.mount(<ComponentToggle showComponent={false} />);
    assert(Object.keys(renderer.inspect().children).length === 2)
  })
});
