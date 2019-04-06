export function singleScopeUpdated() {
  return function (scope: ng.IRepeatScope, collection: any[], currentIndex: number, itemKey: string): boolean {
    let toReturn = false;
    if (!collection) {
      return toReturn;
    }
    if (scope[itemKey] !== collection[currentIndex]) {
      scope[itemKey] = collection[currentIndex];
      toReturn = true;
    } else if (typeof collection[currentIndex] === 'object') {
      return false;
    }
    if (scope.$index !== currentIndex) {
      scope.$index = currentIndex;
    }
    if (scope.$last !== (currentIndex === (collection.length - 1))) {
      scope.$last = (currentIndex === collection.length - 1);
    }
    if (scope.$first !== (currentIndex === 0)) {
      scope.$first = currentIndex === 0;
    }
    if (scope.$middle !== (!scope.$last && !scope.$first)) {
      scope.$middle = !scope.$last && !scope.$first;
    }
    if (scope.$even !== (scope.$even = !(currentIndex % 2))) {
    }
    if (scope.$odd !== !scope.$even) {
      scope.$odd = !scope.$even;
    }
    return toReturn;
  };
}

export interface IScopeUpdated {
  (scope: ng.IRepeatScope, collection: any[], currentIndex: number, itemKey: string): boolean;
}
