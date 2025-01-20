import { MenuBar } from '../../../../pages/MenuBar'
import { SwapPage } from '../../../../pages/SwapPage'
import { LiquidityPage } from '../../../../pages/LiquidityPage'
import { MetamaskNetworkHandler } from '../../../../utils/MetamaskNetworkHandler'

describe('Add liquidity', () => {
  const TRANSACTION_VALUE: number = 0.000001
  let firstTokenBefore: number
  let secondTokenBefore: number
  let firstTokenAfter: number
  let secondTokenAfter: number
  let firstTokenAddedAmount: number = TRANSACTION_VALUE
  let secondTokenAddedAmount: number
  let firstTokenBalance: number = 0
  let secondTokenBalance: number = 0

  before(() => {
    MetamaskNetworkHandler.switchToNetworkIfNotConnected()
  })
  beforeEach(() => {
    LiquidityPage.visitLiquidityPage()
    MenuBar.connectWallet()
  })
  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.clearCookies()
    cy.clearLocalStorage()
  })
  after(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.resetMetamaskAccount()
    cy.wait(500)
  })

  it('Should get balance of tokens from liquidity pool [TC-59]', () => {
    MenuBar.getLiquidity().click()
    LiquidityPage.getPairCards().contains('DXD').contains('WEENUS').click()
    LiquidityPage.getFirstTokenBalance()
      .invoke('text')
      .should(res => {
        expect(parseFloat(res)).be.greaterThan(0)
        console.log('FIRST TOKEN BALANCE: ', res)
        firstTokenBefore = parseFloat(res)
      })
    cy.wrap(null).then(() => {
      console.log('FIRST TOKEN BALANCE: ', firstTokenBefore)
    })
    LiquidityPage.getSecondTokenBalance()
      .invoke('text')
      .should(res => {
        expect(parseFloat(res)).be.greaterThan(0)
        console.log('SECOND TOKEN BALANCE: ', res)
        secondTokenBefore = parseFloat(res)
      })
    cy.wrap(null).then(() => {
      console.log('SECOND TOKEN BALANCE: ', secondTokenBefore)
    })
  })
  it('Should add tokens to liquidity pool [TC-59]', () => {
    LiquidityPage.getAddLiquidityButton().click()
    LiquidityPage.typeValueToFirstToken(TRANSACTION_VALUE.toFixed(9).toString())
    console.log('FIST TOKEN ADDED AMOUNT', firstTokenAddedAmount)
    LiquidityPage.getSecondTokenField()
      .invoke('val')
      .should(res => {
        expect(parseFloat(res as string)).be.greaterThan(0)
        console.log('SECOND TOKEN ADDED AMOUNT', res)
        secondTokenAddedAmount = parseFloat(res as string)
        firstTokenBalance = firstTokenBefore + firstTokenAddedAmount
        console.log('FINAL FIRST TOKEN BALANCE', firstTokenBalance)
        secondTokenBalance = secondTokenBefore + secondTokenAddedAmount
        console.log('FINAL SECOND TOKEN BALANCE', secondTokenBalance)
      })
    LiquidityPage.getSupplyButton().click()
    LiquidityPage.getConfirmSupplyButton().click()
    cy.confirmMetamaskTransaction({})
    LiquidityPage.getCloseTransactionSubmittedWindowButton().click()
    MenuBar.checkToastMessage('Add')
  })
  it('Should check if tokens are added to liquidity pool [TC-59]', () => {
    MenuBar.getLiquidity().click()
    LiquidityPage.getPairCards().contains('DXD').contains('WEENUS').click()
    LiquidityPage.getFirstTokenBalance()
      .invoke('text')
      .should(res => {
        expect(parseFloat(res)).be.greaterThan(0)
        console.log('FIRST TOKEN BALANCE AFTER: ', res)
        firstTokenAfter = parseFloat(res)
      })
    cy.wrap(null).then(() => {
      console.log('FIRST TOKEN BALANCE AFTER: ', firstTokenAfter)
    })
    LiquidityPage.getSecondTokenBalance()
      .invoke('text')
      .should(res => {
        expect(parseFloat(res)).be.greaterThan(0)
        console.log('SECOND TOKEN BALANCE AFTER: ', res)
        secondTokenAfter = parseFloat(res)
      })
    cy.wrap(null).then(() => {
      console.log('SECOND TOKEN BALANCE AFTER: ', secondTokenAfter)
      if (firstTokenBalance.toFixed(3) === firstTokenAfter.toFixed(3)) {
        console.log('SUM OF THE FIRST TOKEN BALANCE IS OK')
      } else {
        console.log('NOT GOOD SUM OF THE FIRST TOKEN BALANCE')
      }
      if (secondTokenBalance.toFixed(3) === secondTokenAfter.toFixed(3)) {
        console.log('SUM OF THE SECOND TOKEN BALANCE IS OK')
      } else {
        console.log('NOT GOOD SUM OF THE SECOND TOKEN BALANCE')
      }
      expect(firstTokenBalance.toFixed(3)).to.be.eq(firstTokenAfter.toFixed(3))
      expect(secondTokenBalance.toFixed(3)).to.be.eq(secondTokenAfter.toFixed(3))
    })
  })
})
