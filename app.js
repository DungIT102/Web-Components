/* Lesson 1 */
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = { zz: 'zzz' };
    this.props = [...this.attributes].reduce((obj, { name, value }) => {
      obj[name] = value;
      return obj;
    }, {});

    this.render(this.props, this.state);
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', () => {
      document.querySelector('hello-world').setState({ zz: 'yyy' });
    });
  }

  disconnectedCallback() {
    alert('I have been removed');
  }

  setState(newState) {
    this.state = newState;

    this.render(this.props, this.state);
  }

  render(props, state) {
    this.shadowRoot.innerHTML = `<style> h1 { color: ${props.color} } ::slotted(p) { color: green } </style> 
                                    <h1>${props.text}</h1>
                                    <p>${state.zz}</p>
                                    <slot></slot>
                                    <button>Click Me</button>`;
  }
}

customElements.define('hello-world', HelloWorld);

/* Next Lesson 2 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    label {
      color: green;
      display: block;
    }
  </style>
  
  <label >
    <input type="checkbox" />
    <slot></slot>
    <slot name="description"></slot>
  </label>
`;
class TodoItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.checkbox = this.shadowRoot.querySelector('input');
  }

  static get observedAttributes() {
    return ['checked'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'checked') this.updateChecked(newValue);
  }

  updateChecked(value) {
    this.checkbox.checked = value != null && value !== 'false';
  }
}

customElements.define('todo-item', TodoItem);

const item = document.querySelector('todo-item');
console.log(item);
let checked = true;

setInterval(() => {
  checked = !checked;
  item.setAttribute('checked', checked);
}, 500);

class ExpandableList extends HTMLUListElement {
  constructor() {
    super();

    this.style.position = 'relative';

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.style.position = 'absolute';
    this.toggleBtn.style.border = 'none';
    this.toggleBtn.style.background = 'transparent';
    this.toggleBtn.style.padding = '0';
    this.toggleBtn.style.top = '0';
    this.toggleBtn.style.left = '4px';
    this.toggleBtn.style.cursor = 'pointer';
    this.toggleBtn.innerText = '>';

    this.toggleBtn.addEventListener('click', () => {
      this.dataset.expanded = !this.isExpanded;
    });

    this.appendChild(this.toggleBtn);
  }

  get isExpanded() {
    return this.dataset.expanded != null && this.dataset.expanded !== 'false';
  }

  static get observedAttributes() {
    return ['data-expanded'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-expanded') {
      this.updateStyles();
    }
  }

  connectedCallback() {
    this.updateStyles();
  }

  updateStyles() {
    const transform = this.isExpanded ? 'rotate(90deg)' : 'rotate(0)';
    this.toggleBtn.style.transform = transform;
    [...this.children].forEach((child) => {
      if (child !== this.toggleBtn) {
        child.style.display = this.isExpanded ? '' : 'none';
      }
    });
  }
}

customElements.define('expandable-list', ExpandableList, { extends: 'ul' });

/* Next Lesson 3  */
const tempElement = document.createElement('template');
tempElement.innerHTML = `
  <style>
    :host{
        
      background-color: #333; /* default */
      color: white;
      display: block; /* critical */
    }
    ::slotted(h2){
      /* represents an h2 element that has been placed into a slot */
      font-weight: 300;
    }

    .root{
      position: relative;
      padding: 2rem;
    }

    .character{
      position: absolute;
      z-index: 10;
      top: -12rem;
      left: 0;
      font-size: 10rem;
      line-height:1;
      color: hsla(60, 50%, 80%, 0.32);
    }

    button{
      position: relative;
      z-index: 20;

      font-size: 1.2rem;
      border: none;
      background-color: #222;
      color: #eee;
      padding: 0.25rem 2rem;
      cursor: pointer;
      
    }

    button:active{
      background-color: #eee;
      color: #222;
    }
  </style>

  <div class="root">
    <h1>Big Bang Theory</h1>
    <slot name="title"></slot>
    <p>
      <button><slot name="done"></slot></button>
    </p>
  </div>
`;
class BigBang extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'closed' });

    let clone = tempElement.content.cloneNode(true);
    this.root.append(clone);

    /* handling slots */
    let btnSlot = this.root.querySelector('p button slot');
    let htmlSlot = btnSlot.assignedNodes()[0];

    console.log('htmlSlot', htmlSlot);

    if (htmlSlot) {
      btnSlot.addEventListener('slotchange', () => {
        console.log(htmlSlot);
      });

      /* handling events */
      btnSlot.parentElement.addEventListener('click', () => {
        console.log('this.action', this.action);
        let action = this.action && typeof window[this.action] === 'function' ? window[this.action] : this.defaultActionForBB;
        action();
      });
    } else {
      btnSlot.parentElement.remove();
    }
  }

  defaultActionForBB() {
    console.log('default action for big bang');
  }

  connectedCallback() {
    console.log('added to page');
  }

  disconnectedCallback() {
    console.log('removed from page');
  }

  /* Define the allowed attributes */
  static get observedAttributes() {
    return ['character', 'color', 'action'];
  }

  /* sync attributes with properties as you want */
  get character() {
    return this.getAttribute('character');
  }

  set character(value) {
    this.setAttribute('character', value);
  }

  get color() {
    return this.getAttribute('color');
  }

  set color(value) {
    this.setAttribute('color', value);
  }

  get action() {
    return this.getAttribute('action');
  }
  set action(value) {
    this.setAttribute('action', value);
  }

  /* Handle attribute changes */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name.toLowerCase() === 'character') {
      const div = this.root.querySelector('.root');
      let p = div.querySelector('h4') ? div.querySelector('h4') : document.createElement('h4');
      p.className = 'character';
      p.textContent = newValue;
      div.append(p);
    }

    if (name.toLowerCase() === 'color') {
      this.style.backgroundColor = newValue;
    }
  }
}

customElements.define('big-bang', BigBang);

document.addEventListener('DOMContentLoaded', () => {
  const bigBang = document.querySelector('big-bang');

  bigBang.addEventListener('click', changeCharacter);
});

function changeCharacter(e) {
  const temp = e.target;
  temp.character = temp.character === 'Leonardo' ? 'Raphael' : 'Leonardo';

  temp.color = temp.color === 'cornflowerblue' ? 'lightcoral' : 'cornflowerblue';
}

/* Next Lesson 4 */
const htmlCss = document.createElement('template');
//css for the component
htmlCss.innerHTML = `
<style>
:host {
  font-size: 20px;
}
:host > div{
  background-color: var(--primary, #222);
}
#title::slotted(*) {
  color: var(--onPrimary, #fff);
  font-size: 2rem;
  font-weight: 100;
  padding: 1rem;
  margin: 0;
}
details {
  background-color: var(--secondary, #eee);
  color: var(--onSecondary, #333);
  padding: 1rem;
}
details > summary{
  cursor: pointer;
  margin-block-end: 1rem;
}
</style>
<div>
  <slot id="title" name="title">Sample Default Title</slot>
  <details>
  <summary>A Little Bit of Ipsum.</summary>
  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iure aliquam eius possimus, consectetur maxime voluptas sequi delectus dolorem cupiditate dolore voluptatem vero ullam sed iusto accusantium, nesciunt dolores inventore assumenda.
</details>
</div>
`;

class SampleComponent extends HTMLElement {
  #openCount;

  constructor() {
    super();
    this.#openCount = 0;
    const shadowRoot = this.attachShadow({ mode: 'closed' });
    const clone = htmlCss.content.cloneNode(true);
    shadowRoot.append(clone);

    this.element = shadowRoot.querySelector('div > details');
    this.element.addEventListener('toggle', this.#handleToggle.bind(this));
  }

  #handleToggle(e) {
    let elHtml = e.target;
    e.stopPropagation();
    if (elHtml.open) {
      this.#openCount++;
      let ce = new CustomEvent('opened', { detail: { count: this.#openCount } });
      this.dispatchEvent(ce);
    } else {
    }
  }
}

customElements.define('sample-component', SampleComponent);

(() => {
  /* When the DOM finishes loading run this...no click listeners here. */
  let sampleComponent = document.querySelector('sample-component');
  sampleComponent.addEventListener('opened', handleOpens);
})();

function handleOpens(e) {
  console.log(e.type);
  console.log(e.detail.count);
}

/* progress bar */
class ProgressBar extends HTMLElement {
  #css = `
    :host {
            display: block;
            width: 250px;
            height: 40px;
            background: #eeeeee;
            border-radius: 4px;
            overflow: hidden;
        }

        .fill {
            width: 0%;
            height: 100%;
            background: var(--fill-color, #222222);
            transition: width 0.25s;
        }
  `;
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    const fill = document.createElement('div');

    style.innerHTML = this.#css;
    fill.classList.add('fill');

    this.shadowRoot.append(style, fill);
  }

  static get observedAttributes() {
    return ['percent'];
  }

  get percent() {
    const valuePercent = this.getAttribute('percent');
    if (isNaN(valuePercent) || valuePercent < 0) {
      return 0;
    } else if (valuePercent > 100) {
      return 100;
    }

    return Number(valuePercent);
  }

  /* set percent(value) sometimes don't need */
  set percent(value) {
    this.setAttribute('percent', value);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'percent') {
      this.shadowRoot.querySelector('.fill').style.width = `${this.percent}%`;
    }
  }
}

customElements.define('progress-bar', ProgressBar);

/* My Counter */
class MyCounter extends HTMLElement {
  constructor() {
    super();
    this.count = this.countAttribute || 0;

    this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() {
    return ['count'];
  }

  get countAttribute() {
    return Number(this.getAttribute('count'));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'count') {
      this.count = Number(newValue);
    }
  }

  plus() {
    this.count++;
    this.render();
  }

  minus() {
    this.count--;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
    <button class="minus">-</button>
      ${this.count}
    <button class="plus">+</button>
    `;

    this.shadowRoot.querySelector('.plus').addEventListener('click', this.plus.bind(this));
    this.shadowRoot.querySelector('.minus').addEventListener('click', this.minus.bind(this));
  }
}

customElements.define('my-counter', MyCounter);

/* my-reactive-counter */
class MyReactiveCounter extends HTMLElement {
  constructor() {
    super();

    // Create a Proxy for reactivity
    this.state = new Proxy(
      { count: 0 },
      {
        set: (target, property, value) => {
          target[property] = value;
          this.render();

          return true;
        },

        get: (target, property) => {
          return property in target ? target[property] : null;
        },
      }
    );

    this.attachShadow({ mode: 'open' });
    this.render();
  }

  plus() {
    this.state.count++;
  }

  minus() {
    this.state.count--;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          font-size: 16px;
          padding: 5px 10px;
          margin: 0 5px;
          cursor: pointer;
        }
      </style>
      <button class="minus" aria-label="Decrease count">-</button>
      <span>${this.state.count}</span>
      <button class="plus" aria-label="Increase count">+</button>
    `;

    this.shadowRoot.querySelector('.plus').addEventListener('click', this.plus.bind(this));
    this.shadowRoot.querySelector('.minus').addEventListener('click', this.minus.bind(this));
  }
}

customElements.define('my-reactive-counter', MyReactiveCounter);
