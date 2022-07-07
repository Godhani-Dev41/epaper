// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'https://epaperweekly-gw.herokuapp.com',
  stripeApiUrl: 'https://epaperweekly-gw.herokuapp.com/stripe.php',
  webHoseApiUrl: 'https://epaperweekly-gw.herokuapp.com/news.php',
  quotesApiUrl: 'https://epaperweekly-gw.herokuapp.com/quotes.php',
  payPalTokenApiUrl: 'https://epaperweekly-gw.herokuapp.com/paypal-token.php',
  payPalApiUrl: 'https://epaperweekly-gw.herokuapp.com/paypal.php',
  stripePubKey: 'pk_live_CRHTYbBe9YxvIYOyt2pUfm0m',
  twilio:{
    accountSID: 'AC65c231dbfff16ac7c902155e1cf9b719',
    authToken: 'c68ce4c5c5895cd125a46da5d731461b'
  },
  firebase: {
    apiKey: '1:678246679815:web:bc968c48e0e952338c71a2',
    authDomain: 'eac-app-d4f1e.firebaseapp.com',
    databaseURL: 'https://eac-app-d4f1e.firebaseio.com',
    projectId: 'eac-app-d4f1e',
    storageBucket: 'eac-app-d4f1e.appspot.com',
    messagingSenderId: '678246679815'
  }
};
