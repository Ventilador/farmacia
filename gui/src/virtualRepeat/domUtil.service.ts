import { NON_DIRECTIVE_TAGS } from './domUtil.tags';
declare var angular;
export const DomUtilService = (function () {
    const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    interface ClientRectEditable {
        height: number;
        width: number;
        top: number;
        left: number;
        bottom: number;
        right: number;
    }
    const isJQ = Function.prototype.call.bind(Object.prototype.isPrototypeOf, angular.element.prototype);
    return ['$document', '$window', '$animate', domUtil];
    function domUtil($document: ng.IDocumentService, $window: ng.IWindowService, $animate: any) {
        const domBody = document.body;
        this.getStyle = getStyle;
        function getStyle(element: any, property: string) {
            const _element = getDomElement(element);
            const result = _element && $window.getComputedStyle(_element, null)[toCamelCase(property)];
            return result || '';
        }


        this.isVisible = function isVisible($elem: HTMLElement): boolean {
            $elem = getDomElement($elem);
            const originalRectangle: ClientRectEditable = $elem.getBoundingClientRect();
            let currentRec: ClientRect;
            let current = $elem.parentElement;
            let visibleHeigth = originalRectangle.height;
            do {
                if (current.scrollTop) {
                    currentRec = current.getBoundingClientRect();
                    let diff = currentRec.top - originalRectangle.top;
                    if (diff < 0) {
                        diff = originalRectangle.bottom - currentRec.bottom;
                    }
                    if (diff > 0) {
                        visibleHeigth -= diff;
                    }
                }
            } while ((current = current.parentElement) && domBody !== current && visibleHeigth > 0);
            return visibleHeigth > 0;
        };

        this.getParentByAttribute = function (elm: any, attr: string) {
            while ((elm = elm.parent()).length) {
                if (elm.attr('virtual-repeater-container') !== undefined) {
                    return elm[0];
                }
            }
        };

        this.hide = function hide($elem: any, classToUse?: string) {
            toJQ($elem).addClass(classToUse || 'ng-hide');
        };

        this.show = function show($elem: any, classToUse?: string) {
            toJQ($elem).removeClass(classToUse || 'ng-hide');
        };

        this.positionElem = function positionElem(host: HTMLElement, target: HTMLElement, place?: string) {
            place = place || 'right';
            host = getDomElement(host);
            target = getDomElement(target);
            const hostRect = host.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            target.style.top = (hostRect.top + ((hostRect.height - targetRect.height) / 2)) + 'px';
            switch (place) {
                case 'right':
                    target.style.left = Math.floor(hostRect.right + 3) + 'px';
                    break;
                default:
                    break;
            }

        };

        this.isInDom = function isInDom(element: any) {
            return this.isContainedBy(domBody, element);
        };

        this.insertAfter = function insertAfter(newItem: JQuery, reference: JQuery): void {
            let index = 0;
            let toInsertIndex: number;
            while (index < reference.length) {
                toInsertIndex = newItem.length;
                while (toInsertIndex--) {
                    insertAfterElem(newItem[toInsertIndex], reference[index]);
                }
                index++;
            }
        };
        this.insertBefore = function insertBefore(newItem: JQuery, reference: JQuery): void {
            let index = reference.length;
            let toInsertIndex: number;
            while (index--) {
                toInsertIndex = newItem.length;
                while (toInsertIndex--) {
                    insertBeforeElem(newItem[toInsertIndex], reference[index]);
                }
            }
        };
        this.createComment = function createComment(value: string, parent?: JQuery, after?: JQuery): JQuery {
            const comment = angular.element(document.createComment(value));
            if (after) {
                this.insertAfter(comment, after);
            } else if (parent) {
                parent.append(comment);
            }
            return comment;
        };
        this.getHeightBeforeElement = function getHeightBeforeElement(elem: any): number {
            return getAcumulatedHeight(elem, 'previousSibling');
        };
        this.getHeightAfterElement = function getHeightAfterElement(elem: any): number {
            return getAcumulatedHeight(elem, 'nextSibling');
        };
        this.clientHeight = function clientHeight(elem: JQuery): number {
            let index = elem.length;
            let toReturn = 0;
            while (index--) {
                toReturn = elem[index].clientHeight || 0;
            }
            return toReturn;
        };
        this.getRecursiveMaxHeight = function getRecursiveMaxHeight(element: JQuery): number {
            let currentMaxHeight;
            let percent: number = 1;
            do {
                currentMaxHeight = this.getStyle(element, 'maxHeight');
                if (currentMaxHeight.indexOf('px') !== -1) {
                    currentMaxHeight = +currentMaxHeight.slice(0, -2);
                    break;
                } else {
                    if (currentMaxHeight.indexOf('%') !== -1) {
                        percent = percent * (+currentMaxHeight.slice(0, -1) / 100);
                    }
                }
            } while ((element = element.parent()).length);
            return currentMaxHeight * percent;
        };

        this.isContainedBy = function isContainedBy(elem1: any, elem2: any, attr?: string): boolean {
            elem1 = getDomElement(elem1);
            elem2 = getDomElement(elem2);
            let currentNode: any = elem2;

            if (attr) {
                if (elem1.attributes && elem1.attributes.getNamedItem(attr)) {
                    while (currentNode = currentNode.parentNode) {
                        if (currentNode.attributes && currentNode.attributes.getNamedItem(attr)) {
                            return currentNode === elem1;
                        }
                    }
                } else {
                    return false;
                }
            }

            return elem1 !== document && elem1.contains(elem2);
        };

        this.outterHeight = function outterHeight(element: JQuery): number {
            let index = element.length;
            let toReturn = 0;
            while (index--) {
                if (element[index].offsetHeight) {
                    toReturn += element[index].offsetHeight;
                } else if (element[index].style[`pixelHeight`]) {
                    toReturn += element[index].style[`pixelHeight`];
                } else if (element[index].clientHeight) {
                    toReturn += element[index].clientHeight;
                }
            }
            return toReturn;
        };

        this.tryGetParentDirective = function tryGetParentDirective(elem: JQuery, fallback?: string): string {
            let lowerCasedNodeName: string;
            while ((elem = elem.parent()).length && elem[0] !== domBody) {
                if (elem.length === 1 && !NON_DIRECTIVE_TAGS[lowerCasedNodeName = elem[0].nodeName.toLowerCase()]) {
                    console.log('<---------------------------------------------------------------->\n\n\n\n\n'
                        + '<' +
                        lowerCasedNodeName + ' '
                        + Array.prototype.map.call(elem[0].attributes, (item: Attr) => {
                            return item.name + '="' + item.value + '"';
                        }).join(' ')
                        + '></' + lowerCasedNodeName + '>' +
                        '\n\n\n\n\n<---------------------------------------------------------------->');
                    return toCamelCase(lowerCasedNodeName);
                }
            }
            return fallback;
        };

        this.elementHeight = function getallinheight(obj: any) {
            if (!obj || !obj[0]) {
                return 0;
            }
            obj = obj[0];
            let compstyle = (typeof window.getComputedStyle === 'undefined') ? obj.currentStyle : window.getComputedStyle(obj);
            let height;
            if (typeof compstyle.height === 'string') {
                const toReturn = parseFloat(compstyle.height);
                if (!isNaN(toReturn)) {
                    height = toReturn;
                }
            }
            if (!height) {
                height = obj.clientHeight || parseFloat(getStyle(obj, 'height'));
            }
            let marginTop = parseFloat(compstyle.marginTop);
            let marginBottom = parseFloat(compstyle.marginBottom);
            let borderTopWidth = parseFloat(compstyle.borderTopWidth);
            let borderBottomWidth = parseFloat(compstyle.borderBottomWidth);
            return height +
                (isNaN(marginTop) ? 0 : marginTop) + (isNaN(marginBottom) ? 0 : marginBottom) +
                (isNaN(borderTopWidth) ? 0 : borderTopWidth) + (isNaN(borderBottomWidth) ? 0 : borderBottomWidth);
        };
    }

    function isDomObject(elem: any): boolean {
        return elem.nodeType > 0 && (elem.tagName || elem.nodeName);
    }

    function getAcumulatedHeight(elem: any, siblingProperty: string): number {
        elem = isDomObject(elem) ? elem : elem[0];
        let toReturn = 0;
        while (elem = elem[siblingProperty]) {
            toReturn += elem.clientHeight || 0;
        }
        return toReturn;
    }

    function getDomElement(elem: any): HTMLElement {
        if (isDomObject(elem)) {
            return elem;
        } else {
            for (let ii = 0; ii < elem.length; ii++) {
                if (elem[ii].nodeType === Element.prototype.ELEMENT_NODE) {
                    return elem[ii];
                }
            }
        }
    }

    function toCamelCase(prop: string): string {
        return prop.
            replace(SPECIAL_CHARS_REGEXP, function (_: any, separator: any, letter: any, offset: any) {
                return offset ? letter.toUpperCase() : letter;
            });
    }


    function toJQ(elem: any): JQuery {
        if (isJQ(elem)) {
            return elem;
        } else if (Array.isArray(elem)) {
            const toReturn = Object.create(angular.element.prototype);
            for (let ii = 0; ii < elem.length; ii++) {
                toReturn[toReturn.length++] = elem[ii];
            }
            return toReturn;
        } else if (isDomObject(elem)) {
            return angular.element(elem);
        }
        throw 'Cannot convert to JQ';
    }


    function insertAfterElem(newNode: HTMLElement, reference: HTMLElement): void {
        reference.parentNode.insertBefore(newNode, reference.nextSibling);
    }

    function insertBeforeElem(newNode: HTMLElement, reference: HTMLElement): void {
        reference.parentNode.insertBefore(newNode, reference);
    }
})();

export interface IDomUtil {
    getStyle(element: JQuery | Element, property: string): string;
    isInDom(element: JQuery | Element): boolean;
    insertAfter(newItem: JQuery, reference: JQuery): void;
    insertBefore(newItem: JQuery, reference: JQuery): void;
    createComment(value: string, parent?: JQuery, after?: JQuery): JQuery;
    getHeightBeforeElement(element: JQuery | Element): number;
    getHeightAfterElement(element: JQuery | Element): number;
    clientHeight(elem: JQuery): number;
    elementHeight(elem: JQuery): number;
    getRecursiveMaxHeight(elem: JQuery): number;
    outterHeight(elem: JQuery): number;
    isContainedBy(container: JQuery | Element, containee: JQuery | Element, attr?: string): boolean;
    tryGetParentDirective(elem: JQuery, fallback?: string): string;
    isVisible($elem: JQuery | Element): boolean;
    getParentByAttribute($elem: JQuery | Element, attr: string): Element;
    show($elem: JQuery | Element, hidingClass?: string): void;
    hide($elem: JQuery | Element, hidingClass?: string): void;
    positionElem(host: JQuery | Element, target: JQuery | Element, place?: string): void;
}
