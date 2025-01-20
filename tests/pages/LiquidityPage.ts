export class LiquidityPage {
  static visitLiquidityPage() {
    cy.visit('/#/pools')
  }
  static getAllPairsButton() {
    return cy.get('[data-testid=all-token-list]')
  }
  static getCreatePairButton() {
    return cy.get('[data-testid=create-pair]')
  }
  static getCampaignsAndMyPairsToggleSwitch() {
    return cy.get('[data-testid=campaigns-toggle]')
  }
  static typeValueToFirstToken(value: string) {
    this.getFirstTokenField().type(value)
    return this
  }
  static getFirstTokenField() {
    return cy.get('[data-testid=transaction-value-input]').first()
  }
  static getSecondTokenField() {
    return cy.get('[data-testid=transaction-value-input]').last()
  }
  static getInputFields() {
    return cy.get('[data-testid=transaction-value-input]')
  }
  static getSelectTokenButton() {
    return cy.get('[data-testid=select-token-button]')
  }
  static getCreateAPairInputField() {
    return cy.get('[data-testid=select-token-button]')
  }
  static getTokenSearchField() {
    return cy.get('[id=token-search-input]')
  }
  static getAddLiquidityButton() {
    return cy.get('[data-testid=add-liquidity]')
  }
  static getYourPoolTokens() {
    return cy.get('[data-testid=user-pool-balance]')
  }
  static getFirstTokenBalance() {
    return cy.get('[data-testid=token-balance]').eq(0)
  }
  static getSecondTokenBalance() {
    return cy.get('[data-testid=token-balance]').eq(1)
  }

  static getUsersPoolShare() {
    return cy.get('[data-testid=pool-share]')
  }
  static getSupplyButton() {
    return cy.get('[data-testid=supply-button]')
  }
  static getConfirmSupplyButton() {
    return cy.get('[data-testid=confirm-supply]')
  }
  static getCloseTransactionSubmittedWindowButton() {
    return cy.get('[data-testid=close-modal-button]')
  }
  static getPairCards() {
    return cy.get('[data-testid=pair-card]')
  }
  static getOpenRewardsButton() {
    return cy.get('[data-testid=open-rewards-button]')
  }
  static getRewardsCampaignButton() {
    return cy.get('#rewards-campaign-for-pair')
  }
  static switchCampaignsToogle() {
    LiquidityPage.getCampaignsAndMyPairsToggleSwitch().within(() => {
      return cy.get('label').first().click()
    })
  }
}
