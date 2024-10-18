import * as Sentry from '@sentry/node';

const SENTRY_DSN = process.env.SENTRY_DSN;
const environment = process.env.SENTRY_ENV;

const sentryDebug = process.env.SENTRY_DEBUG === 'true';

const sentryTraceSampleRate = process.env.SENTRY_TRACE_RATE;
const sentryEventRate = process.env.SENTRY_EVENT_RATE;

// If no DSN, don't bother configuring Sentry.
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: sentryTraceSampleRate ? Number(sentryTraceSampleRate) : 1.0,
    sampleRate: sentryEventRate ? Number(sentryEventRate) : 1.0,

    debug: sentryDebug,
    environment,
  });
}
