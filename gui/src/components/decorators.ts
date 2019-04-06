let module: angular.IModule = null;
export function config(module_: angular.IModule) {
    module = module_;
}

export function Directive(config: angular.IDirective & { name: string }) {
    return function (target: any) {
        module.directive(config.name, () => Object.assign({
            controller: target,
            controllerAs: 'ctrl'
        }, config));
    }
}

export function Filter(name: string) {
    return function (target: any) {
        module.filter(name, target);
    }
}

export function Component(config: angular.IDirective & { name: string }) {
    return Directive(Object.assign({
        scope: {},
        restrict: 'E'
    }, config));
}
