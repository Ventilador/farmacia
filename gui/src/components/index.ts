
import * as angular from 'angular';
// import './performant-ui-select';
// import './performant-ui-select/dist/select.min.css';
import 'angular-sanitize';
// import 'angular-ui-grid';


import 'angular-ui-bootstrap';

import { config } from './decorators';
config(angular.module('app', [
  'ng',
  'ngMaterial',
  'ui.bootstrap',
  'ng',
  'ngSanitize',
  'md.data.table'
]).directive('mdInit', function () {
  return {
    restrict: 'A',
    require: '?mdAutocomplete',
    link: function (scope, elm, attrs, ctrl) {
      if (ctrl) {
        scope.$eval(attrs.mdInit, {
          $mdAutocompleteCtrl: ctrl
        });
      } else {
        scope.$eval(attrs.mdInit, {
          $mdAutocompleteCtrl: {
            focus: function () {
              elm.focus();
            },
            scope: scope.$evalAsync.bind(scope)
          }
        });
      }
    }
  };
}));
Promise.all([
  import('./page'),
  import('./header'),
  import('./table')
])
  .then(() => {
    const div = $(document.createElement('div'));
    div.html(`<div page class="flex-grow page-container"></div>`);
    div.addClass('flex all-height main-container');
    $(document.body).append(div);
    angular.bootstrap(document.body, [
      'app'
    ]);
  })