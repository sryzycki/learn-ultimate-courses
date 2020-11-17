import { EMPTY, Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, debounceTime, distinctUntilChanged, pluck, switchMap } from 'rxjs/operators';

export interface BreweryDTO {
  name: string;
}

const BASE_URL = '/api/typeahead';

export function breweryTypeahead(ajaxHelper = ajax) {
  return (sourceObservable: Observable<InputEvent>) => {
    return sourceObservable.pipe(
      debounceTime(200),
      pluck('target', 'value'),
      distinctUntilChanged(),
      switchMap((searchTerm: string) => {
        return ajaxHelper
          .getJSON<BreweryDTO[]>(`${BASE_URL}?by_name=${searchTerm}`)
          .pipe(
            catchError(() => EMPTY),
          );
      }),
    );
  }
}
