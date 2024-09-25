document.addEventListener('DOMContentLoaded', () => {
  //HTML has loaded
  console.log('Main.js and the DOM are loaded');
});

function Hello() {
  console.log('Hello from a local function');
}

function Goodbye() {
  let bb = document.querySelector('big-bang');
  bb.remove();
}

/* Proxies Version 1 */
let obj = { prop1: 'Hello', prop2: 'Goodbye' };
let handler = {
  get: function (obj, prop) {
    return prop in obj ? obj[prop] : undefined;
  },

  set: function (obj, prop, value) {
    if (!(prop in obj)) {
      throw new TypeError('No such property');
    }

    obj[prop] = value;
    return true;
  },
};

let proxy = new Proxy(obj, handler);

/* Proxies Version 2 with iffy */
let objIffy = (function (myObj) {
  const handler = {
    get: function (obj, prop) {
      return prop in obj ? obj[prop] : undefined;
    },

    set: function (obj, prop, value) {
      if (!(prop in obj)) {
        throw new TypeError('No such property');
      }

      obj[prop] = value;
      return true;
    },
  };

  return new Proxy(myObj, handler);
})({ prop1: 'Hello', prop2: 'Goodbye' });

/* Proxies with data from fetch api */
let objFetch = [
  { id: 1, name: 'hello' },
  { id: 2, name: 'good' },
  { id: 3, name: 'bye' },
];

objFetch = objFetch.map((person) => {
  return new Proxy(person, {
    get: function (obj, prop) {
      return prop in obj ? obj[prop] : undefined;
    },

    set: function (obj, prop, value) {
      if (!(prop in obj)) {
        throw new TypeError('No such property');
      }

      obj[prop] = value;
      return true;
    },
  });
});

/* Proxies with array */
const IndexedArray = new Proxy(Array, {
  construct: function (target, [originalArray]) {
    const index = {};
    originalArray.forEach(function (item) {
      index[item.id] = item;
    });

    const newArray = new target(...originalArray);

    return new Proxy(newArray, {
      get: function (target, name) {
        if (name === 'push') {
          return function (item) {
            index[item.id] = item;
            return target[name].call(target, item);
          };
        } else if (name === 'findById') {
          return function (searchId) {
            return index[searchId];
          };
        }

        return target[name];
      },
    });
  },
});

const bears = new IndexedArray([
  {
    id: 2,
    name: 'grizzly',
  },
  {
    id: 4,
    name: 'black',
  },
  {
    id: 3,
    name: 'polar',
  },
]);

bears.push({
  id: 55,
  name: 'brown',
});

const brown = bears.findById(55);
console.log(brown);
console.log(bears.findById(3));
