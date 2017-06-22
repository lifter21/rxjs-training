import {Observable, Observer} from 'rxjs';

let numbers = [1, 5, 10];
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

let source_1 = Observable.create(observer => {

    let index = 0;
    let length = numbers.length;

    let produceValue = () => {
        observer.next(numbers[index++]);

        if (index < length) {
            setTimeout(produceValue, 250);
        } else {
            observer.complete();
        }
    }

    produceValue();
})
    .map(n => n * 2)
    .filter(n => n > 5);

// source.subscribe(new MyObserver());

// source_1.subscribe(
//    value => console.log(`value: ${value}`),
//    e => console.error(`error: ${e}`),
//    () => console.log('completed')
// );

/*
 *
 *  Module 3
 *
 * */

let circle: HTMLElement;
circle = document.getElementById('circle');

let source = Observable.fromEvent(document, 'mousemove')
    .map((e: MouseEvent) => {
        return {
            x: e.clientX,
            y: e.clientY
        }
    })
    .filter(val => val.x < 500)
    .delay(250);

// works only in html4
function onNext(val) {
    circle.style.left = val.x;
    circle.style.top = val.y;
}

source.subscribe(
    onNext,
    e => console.error(`error: ${e}`),
    () => console.log('completed')
);
