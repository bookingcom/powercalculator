# Power Calculator
This is a Vuejs component to help decide how long you should run your experiment.

# External Dependencies
Currently the graph works with D3 and C3. You will have to add those libraries to your project in case you want the graph.

# Getting Started
## Instalation
Then you can run `$ yarn install`.

When you want to build the component you will use `$ yarn build`.

When you want to develop, rollup has a watch flag, use `$ yarn watch`.

You can change rollup.config.js if the current setup doesn't suit your needs.

We are creating a js and css output files. You need to add both to your project.

## How to use:
After running rollup, you will have a vuejs component you can add to your vuejs application.

Simple example would be:
```js
let { powerCalculator, store } = require('powercalculator');

const storeInstance = new Vuex.Store(store)

new Vue(Object.assign({
    store: storeInstance,
    el: '.power-calculator',
}, powerCalculator));
```

Please note that the module will actually have 2 different properties:
 - component
 - store

In the example above we are just using the component to create a vue instance. It could be used with `Vue.component` as well.

You can create the instance of vuex with the store, merge it with yours.

### Updating store from start
While we do have an action for testing to easily manipulate the store ('test:reset'), I'd recommend manipulating the store object before creating the vuex instance or creating your own actions.

### Listening to store changes
I'd recommend using [Vuex Plugins](https://vuex.vuejs.org/en/plugins.html) for this.

## Some of the important actions of powercalculator store
| action | description |
| ------------- | ------------- |
| init:calculator | Called when the component is mounted. starts calculations and deal with needed logic |
| field:change | Most important action. Dispatched whenever an input field change. This is the root of all the logic behind most of the mutations will happen. |
| update:proptocalculate | Triggers the calculation of the highlighted block |

# Dev Server
You can run `$ yarn serve` to run a development server which points to
`localhost:5000`. It will load the `index.html` file which points to the files
in the `dist` folder. You will need to run `$ yarn watch` in a different process 
to develop.

# Tests
Due to the complexity of the tool we have a few different options of testing.

 - `yarn test`: Run all tests - test the mathematical functions, runs eslint and test the store updates
 - `yarn vue-check`: runs eslint and test the store updates (we are unlikely to change the mathematical functions as often as the rest)
 - `yarn store`: test the store updates
 - `yarn eslint`: runs eslint

# COPYRIGHT AND LICENSE

This is free software, licensed under:

The MIT (X11) License
