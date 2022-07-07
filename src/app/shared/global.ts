import {InjectionToken} from '@angular/core';

export const PS_ROOT = new InjectionToken<string>('apiUrl');
export const STRIPE_API = new InjectionToken<string>('apiUrl');
export const WEBHOSE_API = new InjectionToken<string>('apiUrl');
export const QUOTES_API = new InjectionToken<string>('apiUrl');
export const PAYPAL_API = new InjectionToken<string>('apiUrl');
export const PAYPAL_TOKEN_API = new InjectionToken<string>('apiUrl');
export const STRIPE_PUB_KEY = new InjectionToken<string>('key');
