import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { WalletApiServiceInterface } from '@core/services/interfaces/wallet-api.interface';

export function differentPhoneValidator(currentPhone: string | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').trim();
    if (!value || !currentPhone) {
      return null;
    }
    return value === currentPhone ? { samePhone: true } : null;
  };
}

export function receiverExistsValidator(
  walletApi: WalletApiServiceInterface,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = (control.value ?? '').trim();
    if (!value) {
      return of(null);
    }
    return walletApi
      .walletExists(value)
      .pipe(map((exists) => (exists ? null : { receiverNotFound: true })));
  };
}
