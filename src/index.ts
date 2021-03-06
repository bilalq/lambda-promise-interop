import { Callback, Context, Handler } from 'aws-lambda'

/**
 * Transforms simple `(Event, Context) => Promise<Result>` functions into
 * functions that are compatible with the Handler type that AWS Lambda expects.
 *
 * This lets you write a simple function signature that is easily testable and
 * fits neatly with the async/await model.
 */
export function handlerifyAsyncFn<E, R>(fn: (event: E, context: Context) => Promise<R>): Handler<E, R> {
  return (event: E, context: Context, callback: Callback<R>) => {
    fn(event, context).then(res => callback(undefined, res)).catch(callback)
  }
}

/**
 * Transforms lambda handler functions into functions that take in an event
 * input object E and return a promise of type R.
 *
 * This is useful for unit-testing of traditionally written lambda handlers, as
 * it makes it much easier to just write tests using async/await syntax.
 */
export function promisifyHandler<E, R>(handler: Handler<E, R>): ((event: E, context: Context) => Promise<R>) {
  return (event: E, context: Context) => new Promise((resolve, reject) => {
    handler(event, context, (err, res?) => err ? reject(err) : resolve(res))
  })
}
