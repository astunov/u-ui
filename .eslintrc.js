module.exports = {
    "extends": "google",
    "installedESLint": true,
    "env": {
        "browser": true,
        "jquery": true
    },
    "rules": {
      "spaced-comment": ["error", "always", { "markers": ["!", "="] }]
    }
};
