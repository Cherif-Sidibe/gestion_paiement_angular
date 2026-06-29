import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { WALLET_API_SERVICE_TOKEN } from '@core/services/interfaces/wallet-api.interface';
import { WalletApiService } from '@core/services/wallet-api.service';
import { BILLING_API_SERVICE_TOKEN } from '@core/services/interfaces/billing-api.interface';
import { BillingApiService } from '@core/services/billing-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    {
      provide: WALLET_API_SERVICE_TOKEN,
      useClass: WalletApiService,
    },
    {
      provide: BILLING_API_SERVICE_TOKEN,
      useClass: BillingApiService,
    },
  ],
};
