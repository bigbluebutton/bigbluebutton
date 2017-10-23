module.exports = {
    "extends": "airbnb",
    "plugins": [
      "react",
      "jsx-a11y",
      "import",
      "bbb",
    ],
    "env": {
      "es6": true,
      "node": true,
      "browser": true,
      "meteor": true,
    },
    "rules": {
      "no-underscore-dangle": 0,
      "import/extensions":  [2, "never"],
      "import/no-absolute-path": 0,
      "import/no-unresolved": 0,
      "import/no-extraneous-dependencies": 1,
      "react/prop-types": 1,
      "no-else-return": 2,
      "bbb/no-service-import-component": 2,
    },
};
