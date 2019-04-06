import { IDomUtil } from './domUtil.service';
import { IScopeUpdated } from './singleScopeUpdater.service';
import { IScrollEventHandler } from './scrollEventHandler.service';
declare var angular;
interface IContainerItems {
    compiledElementBlock: JQuery;
    scope: ng.IRepeatScope;
    index: number;
}

/*@ngInject*/
export function virtualRepeatDirective(
    $parse: ng.IParseService,
    domUtil: IDomUtil,
    $animate: any,
    Queue: PerformanceUtils.Queue<IContainerItems>,
    scrollEventHandlerService: IScrollEventHandler,
    singleScopeUpdated: IScopeUpdated
) {
    const animate = $animate;
    const parse = $parse;
    const REPEATER_OVERFLOW = 8;
    const expressionParser = /(.+)\s+in\s+(.+)/;
    class Worker {
        public pending = 0;
        public done = 0;
        public skip = 0;
        public error: (item: IContainerItems) => void = null;
        public check: (item: IContainerItems) => boolean = null;

        constructor(
            public readonly itemsInDom: PerformanceUtils.QueuePrototype<IContainerItems>,
            public readonly startElement: JQuery,
            public readonly container: JQuery,
            public readonly scopeName: string
        ) { }

        public configForward(skip: number) {
            this.pending = 0;
            this.done = 0;
            this.skip = skip;
            this.error = errorF;
            this.check = checkF;
            return this;
        }
        public configBackwards(skip: number) {
            this.pending = 0;
            this.done = 0;
            this.skip = skip + this.itemsInDom.length;
            this.error = errorB;
            this.check = checkB;
            return this;
        }
        public success(item: IContainerItems, arr: any[]) {
            this.done++;
            singleScopeUpdated(item.scope, arr, item.index, this.scopeName);
        }
    }
    function checkF(this: Worker, item: IContainerItems) {
        return item.index !== (this.skip + this.done);
    }

    function checkB(this: Worker, item: IContainerItems) {
        return item.index !== (this.skip - this.done);
    }

    function errorB(this: Worker, item: IContainerItems) {
        item.index = this.itemsInDom.peekFirst().index - 1;
        animate.enter(item.compiledElementBlock, this.container, this.startElement);
        this.itemsInDom.unshift(this.itemsInDom.pop());
    }
    function errorF(this: Worker, item: IContainerItems) {
        item.index = this.itemsInDom.peek().index + 1;
        animate.enter(item.compiledElementBlock, this.container, this.itemsInDom.peek().compiledElementBlock);
        this.itemsInDom.push(this.itemsInDom.shift());
    }
    return {
        terminal: true,
        restrict: 'A',
        priority: 1000,
        transclude: 'element',
        require: '^^virtualRepeatContainer',
        link: function (scope: ng.IScope, elm: JQuery, attrs: any, containerController: any, transclude: ng.ITranscludeFunction) {
            const expression = attrs.virtualRepeat;
            if (!expression) {
                throw 'No expression passed';
            }
            const result = expressionParser.exec(expression);
            if (!result) {
                throw 'Cannot parse expression "' + expression + '". Expected "_indexer_ in _collection_"';
            }
            if (containerController.inUse) {
                throw 'Could not find an unused virtual repeater container';
            }
            containerController.inUse = true;
            const scopeItemName = result[1];
            const expGetter = parse(result[2], interceptor);

            const eventTarget = (containerController.$element as JQuery)[0].parentElement;
            const jTarget = angular.element(eventTarget);
            const sizer = containerController.$sizerElement as JQuery;
            const translator = containerController.$translatorElement as JQuery;

            const repeaterColumns = attrs.repeaterColumns !== undefined ? scope.$eval(attrs.repeaterColumns) : 1;
            const ROW_OVERFLOW = attrs.rowOverflow !== undefined ? scope.$eval(attrs.rowOverflow) : REPEATER_OVERFLOW;
            const HALF_ROW_OVERFLOW = ROW_OVERFLOW / 2;
            const itemsInDom = new Queue<IContainerItems>();

            let diff = Number.MIN_SAFE_INTEGER, lastValue = [], lastLength = 0;
            let maxCapacity = false;
            let itemSize = 0;
            let containerSize = 0;
            let skipped = 0;
            let maxSkip = Number.MAX_SAFE_INTEGER;
            let maxTranslate = Number.MAX_SAFE_INTEGER;
            let lastTranslate = 0;
            let renderedRows = 0;
            let calculatedItemsInDom = 0;
            const worker = new Worker(itemsInDom, elm, translator, scopeItemName);
            const interval = setInterval(init);
            return;

            function init() {
                if (domUtil.isInDom(eventTarget)) {
                    clearInterval(interval);
                    scope.$on('$destroy', scrollEventHandlerService(onScroll));
                    scope.$watch(expGetter, contextChanged);
                    scope.$apply();
                }
            }
            function interceptor(currentVal: any) {
                if (!areEqual(currentVal, lastValue)) {
                    diff++;
                    lastValue = currentVal;
                }
                if (currentVal && (currentVal.length !== lastLength)) {
                    diff++;
                    lastLength = currentVal.length;

                }
                return diff;
            }

            function contextChanged() {
                if (lastLength > itemsInDom.length) {
                    let count = lastLength - itemsInDom.length;
                    while (!maxCapacity && count--) {
                        // if the total height of the items is less than the maxHeight and I have more items to add still
                        // add more items to the dom
                        transclude(addNewDomElement);
                    }
                } else {
                    while (lastLength < itemsInDom.length) {
                        // if i have less items in the collection than in the dom, remove those
                        removeDomElement();
                    }
                }

                updateRenderedRows();
                updateSize();
                updateMaxSkip();
                updateMaxTranslate();
                updateSkipped();
                updateScopes();
                updateTranslate();
            }

            function updateMaxCapacity() {
                maxCapacity = getAllowedRenderedSize() > getContainerMaxSize();
            }

            function updateTranslate() {
                translator.css('transform', `translateY(${Math.min(Math.ceil(skipped / repeaterColumns) * getItemSize(), maxTranslate)}px)`);
            }

            function updateMaxSkip() {
                return maxSkip = Math.ceil((renderedRows - calculatedItemsInDom) * repeaterColumns);
            }

            function updateMaxTranslate() {
                return maxTranslate = (renderedRows - calculatedItemsInDom) * getItemSize();
            }

            function updateSkipped() {
                const size = getItemSize();
                const scrolled = Math.max(eventTarget.scrollTop - ((HALF_ROW_OVERFLOW) * size), 0);
                const maybeSkip = scrolled && Math.floor(scrolled / size);

                return (skipped = (maybeSkip && Math.min(maybeSkip * repeaterColumns, maxSkip)));
            }

            function updateScopes() {
                if (calculatedItemsInDom) {
                    if (itemsInDom.peekFirst().index > skipped) {
                        itemsInDom.forEachReverse(updateScope, worker.configBackwards(skipped - 1));
                    } else {
                        itemsInDom.forEach(updateScope, worker.configForward(skipped));
                    }
                }
            }

            function updateScope(this: Worker, item: IContainerItems) {
                if (this.check(item)) {
                    this.error(item);
                } else {
                    this.success(item, lastValue);
                }
            }

            function updateCalculatedItemsInDom() {
                calculatedItemsInDom = Math.ceil(itemsInDom.length / repeaterColumns);
            }

            function updateSize() {
                sizer.css('height', (getItemSize() * renderedRows) + 'px');
            }

            function updateRenderedRows() {
                renderedRows = Math.ceil(lastLength / repeaterColumns);
            }


            function onScroll(event: JQueryEventObject) {
                if ((event.target === eventTarget) && (skipped !== updateSkipped() || skipped === maxSkip || !skipped)) {
                    updateScopes();
                    updateTranslate();
                    if (scope.$root.$$phase) {
                        return;
                    }
                    scope.$digest();
                }
            }

            function removeDomElement() {
                const item = itemsInDom.pop();
                item.scope.$destroy();
                animate.leave(item.compiledElementBlock);
                updateCalculatedItemsInDom();
                updateMaxCapacity();
            }

            function addNewDomElement(clone: JQuery, scope: ng.IRepeatScope) {
                if (calculatedItemsInDom) {
                    animate.enter(clone, jTarget, itemsInDom.peek().compiledElementBlock);
                } else {
                    domUtil.insertAfter(clone, elm);
                }
                const item = {
                    scope: scope,
                    compiledElementBlock: clone,
                    index: itemsInDom.length
                };
                itemsInDom.push(item);
                singleScopeUpdated(item.scope, lastValue, item.index, worker.scopeName);
                updateCalculatedItemsInDom();
                updateMaxCapacity();
            }



            function getAllowedRenderedSize() {
                const size = getItemSize();
                return (size * calculatedItemsInDom) - Math.ceil(size * ROW_OVERFLOW);
            }

            function getContainerMaxSize(): number {
                if (containerSize) {
                    return containerSize;
                }
                return (containerSize = calcElemMaxHeight(jTarget));
            }

            function getItemSize() {
                if (itemSize) {
                    return itemSize;
                }
                const item = itemsInDom.peek();
                return (itemSize = (item && calcElemSize(item.compiledElementBlock))) || 0;
            }
        }
    };

    function areEqual(a: any[], b: any[]) {
        if ((a && !b) || (!a && b)) {
            return false;
        }
        if (a.length !== b.length) {
            return false;
        }
        let length = a.length;
        while (length--) {
            if (a[length] !== b[length]) {
                return false;
            }
        }
        return true;
    }

    function calcElemSize(elm: JQuery) {
        let size: any = 0;
        if (elm && elm.length) {
            size = domUtil.elementHeight(elm) as any;
            if (typeof size !== 'number') {
                size = domUtil.outterHeight(elm);
            }
        }
        return size;
    }

    function calcElemMaxHeight(elm: JQuery): number {
        let maxHeight = domUtil.getStyle(elm, 'maxHeight') as any;
        if (!maxHeight) {
            return 0;
        } else if (maxHeight.indexOf('px') !== -1) {
            maxHeight = +maxHeight.slice(0, -2); // remove last two chars
        } else if ((maxHeight === 'none' || maxHeight.indexOf('%') !== -1)) {
            maxHeight = domUtil.getRecursiveMaxHeight(elm.parent());
        } else {
            maxHeight = 0;
        }
        // domUtil.getStyle uses the getComputedStyle method which is kinda heavy, so Im caching the maxHeight value, but only when Ive found it
        return maxHeight;
    }
}




