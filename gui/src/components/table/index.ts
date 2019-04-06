import './table.less';
import { Directive } from '../decorators';
import { Registros } from '../../servicios/registros';

@Directive({
    name: 'table',
    restrict: 'A',
    template: require('./table.html'),
    scope: {},
    bindToController: {
        rows: '&'
    }
})
export class TableDirective {
    public rows: any[];

    constructor(private registros: Registros) {
    }
}

