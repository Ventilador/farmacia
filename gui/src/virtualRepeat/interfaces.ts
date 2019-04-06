declare namespace PerformanceUtils {
    export interface ITailingFunction {
        <T>(val: IFunction): (...args: any[]) => T;
        (val: IFunction): IFunction;
        (val: any): IFunction;
    }

    export interface IDebouncer {
        <T>(param: IDebounceOptions<T>, timeout: number): (...args: any[]) => void;
    }


    export interface IDebounceOptions<T> {
        context?: any;
        called?: (...args: any[]) => any;
        before?: () => void;
        action: () => ng.IPromise<T>;
        then: (val: T) => any;
        catch?: (err: Error) => any;
        finally?: () => void;
    }



    export interface ISubcriptorService {
        $emit(eventId: string, ...args: any[]): void;
        $emit(eventId: number, ...args: any[]): void;
        $collection(eventId: string, getter: IFunction, cb: IFunction, context?: any): IFunction;
        $collection(eventId: number, getter: IFunction, cb: IFunction, context?: any): IFunction;
        $collection(eventId: string, getter: string, cb: IFunction, context?: any): IFunction;
        $collection(eventId: number, getter: string, cb: IFunction, context?: any): IFunction;
        (eventId: string, getter: IFunction, cb: IFunction, context?: any): IFunction;
        (eventId: number, getter: IFunction, cb: IFunction, context?: any): IFunction;
        (eventId: string, getter: string, cb: IFunction, context?: any): IFunction;
        (eventId: number, getter: string, cb: IFunction, context?: any): IFunction;
    }

    export interface QueuePrototype<T> {
        push(value: T);
        unshift(value: T);
        shift(): T;
        pop(): T;
        peek(): T;
        peekFirst(): T;
        forEach(cb: Function, thisArgs?: any);
        forEachReverse(cb: Function, thisArgs?: any);
        readonly length: number;
    }


    export interface Queue<T> {
        prototype: QueuePrototype<T>;
        new <T>(): QueuePrototype<T>;
    }


    export interface IFunction {
        (...args: any[]): any;
    }

    export interface IFinder {
        (item: any, ...args: any[]): boolean;
    }


    export interface IReducer {
        (item: any[], initialVal?: any): any;
    }
}
