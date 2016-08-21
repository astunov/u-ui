//= ../../bower_components/svg4everybody/dist/svg4everybody.min.js
//= ./components/input-aria.js
//= ../../bower_components/selectize/dist/js/standalone/selectize.min.js

$(document).ready(function() {
  svg4everybody({});

  $('select.js-select').selectize({
    readOnly: true
  });
});
