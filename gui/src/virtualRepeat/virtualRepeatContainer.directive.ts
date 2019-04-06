import { IDomUtil } from './domUtil.service';
declare var angular;
/*@ngInject*/
export function virtualRepeatContainer(domUtil: IDomUtil) {
    return {
        template: function (elm: JQuery) {
            elm = elm.children();
            let toReturn = [];
            for (let ii = 0, cur = elm[ii]; ii < elm.length; cur = elm[++ii]) {
                if (!cur.getAttribute('virtual-repeat')) {
                    toReturn.push(cur.outerHTML);
                } else {
                    toReturn.push('<div class="all-width container-mock"><div class="item-container">' +
                        cur.outerHTML +
                        '</div></div>');
                }
            }
            return toReturn.join('');
        },
        link: {
            pre: function (scope: any, elm: JQuery, attrs: any, ctrl: any) {
                ctrl.$element = elm.addClass('virtual-repeater-container');
                ctrl.$translatorElement = angular.element(elm[0].querySelector('.item-container'));
                ctrl.$sizerElement = ctrl.$translatorElement.parent();
            }
        },
        controller: angular.noop
    };

    function getContentHeight(elm: JQuery) {
        const children = angular.element(elm.children()[1]).children();
        return domUtil.outterHeight(children);

    }
}
