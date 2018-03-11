// import { Callback, Context, Handler } from 'aws-lambda'
import { lambdaHandlerifyAsyncFunction, promisifyLambdaHandler } from '../index'

describe('lambda-promise-interop', () => {
  describe('lambdaHandlerifyAsyncFunction', () => {
    it('works', () => {
      expect(typeof lambdaHandlerifyAsyncFunction).toEqual('function')
    })
  })

  describe('promisifyLambdaHandler', () => {
    it('works', () => {
      expect(typeof promisifyLambdaHandler).toEqual('function')
    })
  })
})
