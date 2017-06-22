import { Observable, Observer } from 'rxjs/Rx';

let numbers = [1,5,10];
// let source = Observable.from(numbers);

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

let source = Observable.create(observer => {

    let index= 0;
    let length = numbers.length;

    let produceValue = () => {
        observer.next(numbers[index++]);

        if (index < length) {
            setTimeout(produceValue, 2000);
        } else {
            observer.complete();
        }
    }

    produceValue();
});


// source.subscribe(new MyObserver());

 source.subscribe(
    value => console.log(`value: ${value}`),
    e => console.error(`error: ${e}`),
    () => console.log('completed')
 );