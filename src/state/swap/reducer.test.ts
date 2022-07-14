import { createStore, Store } from 'redux'

import { selectCurrency } from './actions'
import reducer, { initialState, SwapState } from './reducer'
import { Field } from './types'

describe('swap reducer', () => {
  let store: Store<SwapState>

  beforeEach(() => {
    store = createStore(reducer, initialState)
  })

  describe('selectToken', () => {
    it('changes token', () => {
      store.dispatch(
        selectCurrency({
          field: Field.OUTPUT,
          currencyId: '0x0000',
        })
      )

      expect(store.getState()).toEqual({
        [Field.OUTPUT]: { currencyId: '0x0000' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '',
        independentField: Field.INPUT,
        recipient: null,
        loading: true,
        protocolFeeTo: undefined,
      })
    })
  })
})
