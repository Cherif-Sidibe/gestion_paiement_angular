import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@core/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      toast.error(extractMessage(error));
      return throwError(() => error);
    }),
  );
};

function extractMessage(error: HttpErrorResponse): string {
  const payload = error.error;
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: string }).message;
    if (message) {
      return message;
    }
  }
  if (typeof payload === 'string' && payload.length > 0) {
    return payload;
  }
  return error.message || 'Une erreur réseau est survenue.';
}
