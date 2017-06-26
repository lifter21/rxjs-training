import { Observable, Observer } from 'rxjs/Rx';
import * as $ from 'jquery';

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

// source_1.subscribe(new MyObserver());

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

let $circle = $('#circle');

let source_2 = Observable.fromEvent(document, 'mousemove')
    .map((e: MouseEvent) => {
        return {
            x: e.clientX,
            y: e.clientY
        }
    })
    .filter(val => val.x < 500)
    .delay(250);

function onNext(val) {
    // works only in html4 :
    // circle.style.left = val.x;
    // circle.style.top = val.y;

    $circle.css({ left: val.x, top: val.y })
}

// source_2.subscribe(
//     onNext,
//     e => console.error(`error: ${e}`),
//     () => console.log('completed')
// );

const getMoviesBtn = document.getElementById('getMoviesBtn');
const movieList = document.getElementById('movies');

const moviesPath = 'movies.json'

let click = Observable.fromEvent(getMoviesBtn, 'click')

interface Movie {
    title: string;
    [propName: string]: any;
}

const retryStrategy = ({ attempts = 3, delay = 1000 } = {}) => {
    return function (errors) {
        return errors
            .scan((acc, value) => {
                return acc += 1;
            }, 0)
            .takeWhile(acc => acc < attempts)
            .delay(delay);
    }
}

const load = (path: string) => {
    return Observable.create(observer => {
        const xhr = new XMLHttpRequest();


        // return Observable.fromEvent(xhr, 'load')
        //     .map(...)

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                observer.next(data);
                observer.complete();
            } else {
                observer.error(xhr.statusText);
            }
        });

        xhr.open('GET', path);
        xhr.send();
    })
        // .retry(3)
        .retryWhen(retryStrategy({ attempts: 5, delay: 2000 }));
};

function loadWithFetch(path: string): Observable<Movie[]> {
    return Observable
        .defer(() => {
            return Observable.fromPromise(fetch(path).then(data => data.json()));
        })
        .retryWhen(retryStrategy({ attempts: 5, delay: 2000 }));
};

const renderMovies = (movies: Movie[]) => {
    movies.forEach(movie => {
        appendListItem(movie.title, movieList);
    });
};

// loadMovies(moviesPath).subscribe(renderMovies);

click
    .flatMap(e => loadWithFetch(moviesPath))
    .subscribe(
    renderMovies,
    err => console.error(err),
    () => console.log('completed')
    )

/**
 *
 * Rxjs book
 *
 */

function appendListItem(value, parentNode) {
    let node = document.createElement('li');                 // Create a <li> node
    let textnode = document.createTextNode(value);         // Create a text node
    node.appendChild(textnode);                              // Append the text to <li>
    parentNode.appendChild(node);
}

let input = document.getElementById('input'),
    results = document.getElementById('results');

let keyups = Observable.fromEvent(input, 'keyup')
    .map((e: KeyboardEvent) => (<HTMLInputElement>e.target).value)
    .filter(text => text.length > 2);

let throttled = keyups.throttleTime(500);

let distinct = throttled.distinctUntilChanged();

function searchWiki(term) {
    return $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        dataType: 'jsonp',
        data: {
            action: 'opensearch',
            format: 'json',
            search: term
        }
    }).promise();
}

let suggestions = distinct.flatMap(searchWiki);

const clearResults = () => {
    results.innerHTML = '';
}

// suggestions.subscribe(
//     data => {
//         // console.log(data);
//         const res = data[1];
//         clearResults();
//         res.forEach(r => appendListItem(r, results));
//     },
//     error => {
//         console.log(error);
//         clearResults();
//     },
//     () => console.log('finished')
// );
