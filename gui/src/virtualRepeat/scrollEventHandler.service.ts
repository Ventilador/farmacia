export const ScrollEventServiceHandler = (function () {
  return ['$window', '$rootScope', ScrollEventHandler];
  function ScrollEventHandler($window: ng.IWindowService, $rootScope: ng.IRootScopeService) {
    const callbacks: Function[] = [];
    let index: number;
    let length: number;
    let evalAsyncQueued: boolean;
    let isEventAttached = false;

    return decoratedDestroyCallback;

    function decoratedDestroyCallback(callback: Function) {
      if (typeof callback !== 'function') {
        throw 'Expected "function", got "' + typeof callback + '" instead.';
      }
      if (!callbacks.length && !isEventAttached) {
        $window.addEventListener('scroll', handleScrollEvent, true);
        isEventAttached = true;
      }
      callbacks.push(callback);
      return function () {
        if ((index = callbacks.indexOf(callback)) !== -1) {
          callbacks.splice(index, 1);
        }
        if (!callbacks.length && isEventAttached) {
          isEventAttached = false;
          $window.removeEventListener('scroll', handleScrollEvent, true);
        }
      };
    }

    function handleScrollEvent(event: JQueryEventObject) {
      if (length = callbacks.length) {
        let shouldEvalAsync;
        while (length--) {
          shouldEvalAsync = callbacks[length](event) || shouldEvalAsync;
        }
        if (shouldEvalAsync) {
          evalAsyncQueued = true;
          $rootScope.$evalAsync(doEval);
        }
      }
    }

    function doEval() {
      evalAsyncQueued = false;
    }
  }
})();

export interface IScrollEventHandler {
  (callback: (ev?: JQueryEventObject) => any): (event: ng.IAngularEvent, ...args: any[]) => any;
}
