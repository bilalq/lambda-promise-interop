lambda-promise-interop
======================
Have you ever found yourself wishing you could use the async/await syntax in the unit tests of your Lambda handlers? Or wished there was a way to just write a Lambda handler as an async function that takes in an event & context and returns some result? Well now you can.

This package offers two *tiny* functions for transforming traditional handler
functions to promisified async ones and vice versa. Type definitions for
TypeScript users are included as well.


Installation
------------
```
npm install --save lambda-promise-interop
```


API
---
### `handlerifyAsyncFn<E, R>`

**Input:**

* `fn`: `(event: E, context: Context) => Promise<R>`

**Output:**

* `Handler<E, R>`

**Description:**

Transforms simple `(Event, Context) => Promise<Result>` functions into functions
that are compatible with the Handler type that AWS Lambda expects. This lets you
write a simple function signature that is easily testable and fits neatly with
the async/await model.

### `promisifyHandler<E, R>`

**Input:**

* `handler`: `Handler<E, R>`

**Output:**

* `(event: E, context: Context) => Promise<R>`

**Description:**

Transforms lambda handler functions into functions that take in an event input
object E and return a promise of type R. This is useful for unit-testing of
traditionally written lambda handlers, as it makes it much easier to just write
tests using async/await syntax.


Usage
-----
### Importing

```typescript
import { handlerifyAsyncFn, promisifyHandler } from 'lambda-promise-interop'
```

TypeScript users may also find it helpful to take a devDependency on
[@types/aws-lambda][lambdaTypes], since that includes many useful type
definitions.

### Turning Async Functions into Lambda Handlers
You have to point Lambda do a function that matches a signature of
`<T, R>(T, Context, Callback<R>) => void`. It'd be preferable to just return a
Promise or write an async function instead of invoking a callback and making
sure you account for both synchronous and asynchronous errors. That would make
code more readable _and_ easier to test.


JavaScript example:

```javascript
import { handlerifyAsyncFn } from 'lambda-promise-interop'
import { someAsyncThing, ClientError } from './lib/example'

// Our easily testable and readable async function
const myApi = async (event, context) => {
  let body, statusCode
  try {
    body = await someAsyncThing(event.body)
    statusCode = 200
  } catch (err) {
    body = err.message
    statusCode = (err instanceof ClientError) ? 400 : 500
  }
  return { body, statusCode }
}

// A handler function in the signature that Lambda expects
const handler = handlerifyAsyncFn(myApi)

// We export `myApi` just for ease of testing and export `handler` for Lambda to
// actually use.
export { handler, myApi }
```

TypeScript example:

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { handlerifyAsyncFn } from 'lambda-promise-interop'
import { someAsyncThing, ClientError } from './lib/example'

// Our easily testable and readable async function
const myApi = async (event: APIGatewayProxyEvent, context: Context): APIGatewayProxyResult => {
  let body: string
  let statusCode: number
  try {
    body = await someAsyncThing(event.body)
    statusCode = 200
  } catch (err) {
    body = err.message
    statusCode = (err instanceof ClientError) ? 400 : 500
  }
  return { body, statusCode }
}

// A handler function in the signature that Lambda expects
const handler = handlerifyAsyncFn(myApi)

// We export `myApi` just for ease of testing and export `handler` for Lambda to
// actually use.
export { handler, myApi }
```


### Promisifying Normal Lambda Handlers
If you already have Lambda handler functions written, you may have noticed that
it's somewhat painful to test them. JS testing frameworks like Jest support
async functions, but Lambda handlers force you back into Callback Hell if you
want to run any assertions before your test is done.

You're stuck writing something like this:

```typescript
// Example spec

import { handler } from '../index'
import mockContext from 'aws-lambda-mock-context'

describe('My Lambda Handler', () => {
  it('does something', (done) => {
    handler({someInput: 'foo'}, mockContext(), (err, res) => {
      expect(err).toBeFalsy()
      expect(res.someValue).toEqual(something)
      done(undefined, res)
    })
  })
})
```

With this library, you can instead write that same test as:

```typescript
// Example spec

import { handler } from '../index'
import mockContext from 'aws-lambda-mock-context'
import { promisifyHandler } from 'lambda-promise-interop'

const asyncHandler = promisifyHandler(handler)

describe('My Lambda Handler', () => {
  it('does something', async () => {
    const res = await asyncHandler({someInput: 'foo'}, mockContext())
    expect(res.someValue).toEqual(something)
  })
})
```


License
-------
MIT




  [lambdaTypes]: https://www.npmjs.com/package/@types/aws-lambda
