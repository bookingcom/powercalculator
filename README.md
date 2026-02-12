# Power Calculator
This is a Vue.js component to help decide how long you should run your experiment.

> **Notice**
> This project is archived and no further development will be done here.

# Getting Started
## Installation
Run `$ yarn install` to install dependencies.

### Building
- `$ yarn build:dev` - Development build
- `$ yarn build:production` - Production build (includes dependencies)
- `$ yarn build:watch` - Watch mode for development

You can change `rollup.config.js` if the current setup doesn't suit your needs.

We are creating a js and css output files. You need to add both to your project.

## How to use
After running rollup, you will have a Vue.js component you can add to your Vue.js application.

Simple example:
```js
let { powerCalculator, store } = require('powercalculator');

const storeInstance = new Vuex.Store({
    modules: store,
})

new Vue(Object.assign({
    store: storeInstance,
    el: '.power-calculator',
}, powerCalculator));
```

The module exports two properties:
 - `powerCalculator` - the Vue component
 - `store` - a Vuex module map (containing the `calculator` module)

In the example above we are using the component to create a Vue instance. It could be used with `Vue.component` as well.

You can create the instance of Vuex with the store modules, or merge them with your own.

### Listening to store changes
I'd recommend using [Vuex Plugins](https://vuex.vuejs.org/en/plugins.html) for this.

# Dev Server
You can run `$ yarn serve` to run a development server which points to
`localhost:5000`. It will load the `index.html` file which points to the files
in the `dist` folder. You will need to run `$ yarn build:watch` in a different
process to develop.

# Tests
Due to the complexity of the tool we have a few different options of testing.

 - `yarn test` - Run all tests (unit tests, math verification, and linting)
 - `yarn test:unit` - Run unit tests (store updates, component logic)
 - `yarn test:verifyMath` - Run mathematical verification tests against reference datasets
 - `yarn lint` - Run ESLint
 - `yarn format` - Format source files with Prettier

# COPYRIGHT AND LICENSE

This is free software, licensed under:

The MIT (X11) License
