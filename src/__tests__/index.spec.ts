import { Context, Handler } from 'aws-lambda'
import { handlerifyAsyncFn, promisifyHandler } from '../index'

describe('lambda-promise-interop', () => {

  describe('handlerifyAsyncFn', () => {

    it('returns a handler that calls back with async function result', done => {
      const fn = async (event: number, context: Context) => `${context.functionName}${event}`
      const handler = handlerifyAsyncFn(fn)
      handler(42, { functionName: 'test' } as Context, (err, res) => {
        expect(err).toBeFalsy()
        expect(res).toEqual('test42')
        done()
      })
    })

    it('returns a handlers that calls back with async function error', done => {
      const expectedError = new Error('test')
      const fn = async (_event: number, _context: Context) => { throw expectedError }
      const handler = handlerifyAsyncFn(fn)
      handler(42, { functionName: 'test' } as Context, (err, res) => {
        expect(err).toBe(expectedError)
        expect(res).toBeUndefined()
        done()
      })
    })
  })

  describe('promisifyHandler', () => {

    it('returns a function that returns a promise that resolves with the callback result', async () => {
      const handler: Handler<number, string> = (event, context, callback) => {
        callback(undefined, `${context.functionName}${event}`)
      }
      const promisifiedHandler = promisifyHandler(handler)
      const res = await promisifiedHandler(42, { functionName: 'test' } as Context)
      expect(res).toEqual('test42')
    })

    it('returns a function that returns a promise that rejects with the callback error', async () => {
      const expectedError = new Error('test')
      const handler: Handler<number, string> = (_event, _context, callback) => callback(expectedError)
      const promisifiedHandler = promisifyHandler(handler)
      try {
        await promisifiedHandler(42, {} as Context)
      } catch (err) {
        expect(err).toBe(expectedError)
        return
      }
      fail('Expected promise to reject')
    })

  })

})
