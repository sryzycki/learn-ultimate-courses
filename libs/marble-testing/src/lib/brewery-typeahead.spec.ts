import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { RunHelpers } from 'rxjs/internal/testing/TestScheduler';

import { breweryTypeahead } from './brewery-typeahead';

describe('breweryTypeahead', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should debounce input by 200ms', () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const searchTerm = 'testing';

      const source$ = cold('a', { a: { target: { value: searchTerm } } });
      const final$ = source$.pipe(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        breweryTypeahead({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          getJSON: () => of(searchTerm).pipe(delay(300)),
        }),
      );
      const expected = '500ms a'; // ms = debounce + fake response delay

      expectObservable(final$).toBe(expected, { a: searchTerm });
    });
  });

  it('should cancel active request if another value is emitted', () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const searchTerm = 'testing';

      const source$ = cold('a 250ms b', {
        a: { target: { value: 'first' } },
        b: { target: { value: 'second' } },
      });
      const final$ = source$.pipe(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        breweryTypeahead({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          getJSON: () => of(searchTerm).pipe(delay(300)),
        }),
      );
      const expected = '751ms a'; // ms = 1 frame + 250 + debounce + fake response delay

      expectObservable(final$).toBe(expected, { a: searchTerm });
    });
  });

  it('should not emit duplicate values in a row', () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const searchTerm = 'testing';

      const source$ = cold('a 250ms b', {
        a: { target: { value: 'first' } },
        b: { target: { value: 'first' } },
      });
      const final$ = source$.pipe(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        breweryTypeahead({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          getJSON: () => of(searchTerm).pipe(delay(300)),
        }),
      );
      const expected = '500ms a'; // ms = initial debounce + fake response delay (second input is not distinct)

      expectObservable(final$).toBe(expected, { a: searchTerm });
    });
  });

  it('should ignore ajax errors', () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const searchTerm = 'testing';

      const source$ = cold('a 250ms b', {
        a: { target: { value: 'first' } },
        b: { target: { value: 'first' } },
      });
      const final$ = source$.pipe(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        breweryTypeahead({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          getJSON: () => throwError('error'),
        }),
      );
      const expected = '';

      expectObservable(final$).toBe(expected);
    });
  });
});
