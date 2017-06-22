import { Observable, Observer } from 'rxjs/Rx';

let numbers = [1,5,10];
let source = Observable.from(numbers);

class MyObserver implements Observer<number> {

    next(value) {
        console.log(value);
    }

    error(e) {
        console.log(e);
    }

    complete() {
        console.log('complete');
    }
}

// source.subscribe(new MyObserver());

 source.subscribe(
    value => console.log(`value: ${value}`),
    e => console.error(`error: ${e}`),
    () => console.log('completed')
 );