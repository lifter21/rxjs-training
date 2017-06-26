import { Observable } from 'rxjs/Rx';

const retryStrategy = ({ attempts = 3, delay = 1000 } = {}) => {
    return function (errors) {
        return errors
            .scan((acc, value) => {
                acc += 1;

                if (acc < attempts) {
                    return acc;
                } else {
                    throw new Error(value);
                }
            }, 0)
            // .takeWhile(acc => acc < attempts)
            .delay(delay);
    }
}

export const load = (path: string)  : Observable<any> => {
    return Observable.create(observer => {
        const xhr = new XMLHttpRequest();

        // return Observable.fromEvent(xhr, 'load')
        //     .map(...)

        const onLoad = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                observer.next(data);
                observer.complete();
            } else {
                observer.error(xhr.statusText);
            }
        }

        xhr.addEventListener('load', onLoad);
        xhr.open('GET', path);
        xhr.send();

        return () => {
            console.log('CleanUp');

            xhr.removeEventListener('load', onLoad);
            xhr.abort();
        }
    })
        // .retry(3)
        .retryWhen(retryStrategy({ attempts: 5, delay: 2000 }));
};

export const loadWithFetch = (path: string) : Observable<any> => {
    return Observable
        .defer(() => {
            return Observable.fromPromise(fetch(path).then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    return Promise.reject(res);
                }
            }));
        })
        .retryWhen(retryStrategy({ attempts: 3, delay: 1000 }));
};