import * as angular from 'angular';
import { virtualRepeatDirective } from './virtualRepeat.directive';
import { DomUtilService } from './domUtil.service';
import { singleScopeUpdated } from './singleScopeUpdater.service';
import { queue } from './queue';
import { ScrollEventServiceHandler } from './scrollEventHandler.service';
import { virtualRepeatContainer } from './virtualRepeatContainer.directive';
angular.module('app')
    .directive('virtualRepeatContainer', virtualRepeatContainer)
    .controller('virtualRepeatContainer', () => { })
    .directive('virtualRepeat', virtualRepeatDirective as any)
    .service('singleScopeUpdated', singleScopeUpdated)
    .factory('Queue', queue)
    .service('scrollEventHandlerService', ScrollEventServiceHandler)
    .run(['$templateCache', function (tCache: ng.ITemplateCacheService) {
        // override original ui select2 theme so it can handle virtual repeat
        tCache.put('select2/choices.tpl.html', require('./select2.choices.tpl.html'));
        tCache.put('bootstrap/choices.tpl.html', require('./customChoices.template.html'));
    }])
    .service('domUtil', DomUtilService);

