import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://58afe73e05e2cdfb04e3bd6cd04a25fd@o4507493285363712.ingest.de.sentry.io/4507493288902736",

  // Remove the replayIntegration as it seems it is not a valid function in this context
  // integrations: [
  //   Sentry.replayIntegration(),
  // ],

  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});

export async function register() {
  // No need for conditional imports if configurations are identical
}
