import { of } from 'rxjs';
import { catchError, delay, map, mergeMap, toArray } from 'rxjs/operators';

describe('subscribe and assert testing in RxJS', () => {
  it('should compare each emitted value', (done) => {
    const source$ = of(1, 2, 3);
    const final$ = source$.pipe(
      map(val => val * 10)
    );

    const expected = [10, 20, 30];
    let index = 0;

    final$.subscribe(val => {
      expect(val).toEqual(expected[ index ]);
      index++;
    }, null, done);
  });

  it('should compare emitted values on completion with toArray operator', () => {
    const source$ = of(1, 2, 3);
    const final$ = source$.pipe(
      map(val => val * 10),
      toArray()
    );

    const expected = [10, 20, 30];

    final$.subscribe(val => {
      expect(val).toEqual(expected);
    });
  });

  it('should let you test async operation with done callback', (done) => {
    const source$ = of('Ready', 'Set', 'Go!').pipe(
      mergeMap((message, index) => of(message).pipe(
        delay(index * 1000)
      ))
    );

    const expected = ['Ready', 'Set', 'Go!'];
    let index = 0;

    source$.subscribe(
      val => {
        expect(val).toEqual(expected[ index ]);
        index++;
      },
      null,
      done,
    );
  });

  it('should let you test errors and error messages', done => {
    const source$ = of({firstName: 'Brian', lastName: 'Smith'}, null).pipe(
      map(o => `${o.firstName} ${o.lastName}`),
      catchError(() => {
        throw 'Invalid response!';
      }),
    );

    const expected = ['Brian Smith', 'Invalid response!'];
    const actual = [];

    source$.subscribe({
      next: value => {
        actual.push(value);
      },
      error: error => {
        actual.push(error);
        expect(actual).toEqual(expected);
        done();
      },
    });
  });
});
