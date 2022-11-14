import { Currency, Token } from '@swapr/sdk'

import {
  ChangeEvent,
  KeyboardEvent,
  MutableRefObject,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { FixedSizeList } from 'react-window'
import { useTheme } from 'styled-components'

import { ReactComponent as SettingsIcon } from '../../../assets/svg/settings.svg'
import { useActiveWeb3React } from '../../../hooks'
import { useSearchInactiveTokenLists } from '../../../hooks/Tokens'
import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import useToggle from '../../../hooks/useToggle'
import { TYPE } from '../../../theme'
import { isAddress } from '../../../utils'
import Column, { AutoColumn } from '../../Column'
import Row from '../../Row'
import { BalanceTokens } from '../BalanceTokens'
import { CommonTokens } from '../CommonTokens'
import { CurrencyList } from '../CurrencyList'
import { CurrencySearchModalContext } from '../CurrencySearchModal/CurrencySearchModal.context'
import { SearchInput } from '../shared'
import { filterTokens, useSortedTokensByQuery } from '../utils/filtering'
import { useTokenComparator } from '../utils/sorting'
import { CurrencySearchContext } from './CurrencySearch.context'
import { ContentWrapper, Footer, FooterButton, InputCloseButton } from './CurrencySearch.styles'
import { CurrencySearchProps } from './CurrencySearch.types'
export const CurrencySearch = ({
  isOpen,
  onDismiss,
  showManageView,
  showImportView,
  showCommonBases,
  selectedCurrency,
  onCurrencySelect,
  showNativeCurrency,
  otherSelectedCurrency,
  isOutputPanel,
}: CurrencySearchProps) => {
  const { t } = useTranslation('common')
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()
  const {
    allTokens,
    allTokensOnSecondChain,
    searchToken,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    selectedTokenList,
    showFallbackTokens,
  } = useContext(CurrencySearchContext)
  const { setImportToken } = useContext(CurrencySearchModalContext)

  const tokens = isOutputPanel ? allTokensOnSecondChain : allTokens

  const fixedList = useRef<FixedSizeList>()

  const nativeCurrency = useNativeCurrency()

  const [invertSearchOrder] = useState<boolean>(false)

  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery)

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(tokens ?? {}), debouncedQuery)
  }, [tokens, debouncedQuery])

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator)
  }, [filteredTokens, tokenComparator])

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery)

  const filteredSortedTokensWithNativeCurrency: Currency[] = useMemo(() => {
    if (!showNativeCurrency || !nativeCurrency.symbol || !nativeCurrency.name || isOutputPanel)
      return filteredSortedTokens

    if (
      nativeCurrency &&
      new RegExp(debouncedQuery.replace(/\s/g, ''), 'gi').test(`${nativeCurrency.symbol} ${nativeCurrency.name}`)
    ) {
      const tokensWithoutNativeCurrency = filteredSortedTokens.filter(token => token.address !== nativeCurrency.address)
      return [nativeCurrency, ...tokensWithoutNativeCurrency]
    }
    return filteredSortedTokens
  }, [showNativeCurrency, nativeCurrency, isOutputPanel, filteredSortedTokens, debouncedQuery])

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen, setSearchQuery])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      const checksummedInput = isAddress(input)
      setSearchQuery(checksummedInput || input)
      fixedList.current?.scrollTo(0)
    },
    [setSearchQuery]
  )

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim()
        if (s === nativeCurrency.symbol) {
          onCurrencySelect(nativeCurrency)
        } else if (filteredSortedTokensWithNativeCurrency.length > 0) {
          if (
            filteredSortedTokensWithNativeCurrency[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokensWithNativeCurrency.length === 1
          ) {
            onCurrencySelect(filteredSortedTokensWithNativeCurrency[0])
          }
        }
      }
    },
    [debouncedQuery, filteredSortedTokensWithNativeCurrency, onCurrencySelect, nativeCurrency]
  )

  // menu ui
  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, open ? toggle : undefined)

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(
    filteredTokens.length === 0 || (debouncedQuery.length > 2 && !isAddressSearch) ? debouncedQuery : undefined
  )
  const filteredInactiveTokensWithFallback = useMemo(() => {
    if (filteredTokens.length > 0) return []
    if (showFallbackTokens && filteredInactiveTokens.length > 0) return filteredInactiveTokens
    if (searchToken) return [searchToken]
    return []
  }, [filteredInactiveTokens, filteredTokens.length, searchToken, showFallbackTokens])

  useEffect(() => {
    inputRef.current?.focus()
  }, [inputRef])

  return (
    <ContentWrapper data-testid="token-picker">
      <AutoColumn
        style={{
          padding: '22px 18.5px 20px 18.5px',
          width: '100%',
        }}
        gap="34px"
        justify="center"
      >
        <Row
          style={{
            position: 'relative',
            maxWidth: '480px',
          }}
        >
          <SearchInput
            height={49}
            type="text"
            id="token-search-input"
            placeholder={t('searchPlaceholder')}
            autoComplete="off"
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
            fontWeight={500}
          />
          {searchQuery.length > 0 && (
            <InputCloseButton onClick={() => setSearchQuery('')}>
              <X />
            </InputCloseButton>
          )}
        </Row>
        {searchQuery.length === 0 && (
          <BalanceTokens
            onCurrencySelect={onCurrencySelect}
            filteredSortedTokensWithNativeCurrency={filteredSortedTokensWithNativeCurrency}
            selectedCurrency={selectedCurrency}
          />
        )}
        {searchQuery.length === 0 && showCommonBases && (
          <CommonTokens chainId={chainId} onCurrencySelect={onCurrencySelect} selectedCurrency={selectedCurrency} />
        )}
      </AutoColumn>

      {searchQuery.length > 0 && (
        <>
          {(filteredSortedTokens?.length > 0 || filteredInactiveTokensWithFallback.length > 0) &&
          fixedList !== undefined ? (
            <CurrencyList
              currencies={filteredSortedTokensWithNativeCurrency}
              otherListTokens={filteredInactiveTokensWithFallback}
              onCurrencySelect={onCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList as MutableRefObject<FixedSizeList>}
              showImportView={showImportView}
              setImportToken={setImportToken}
              selectedTokenList={selectedTokenList}
              hideBalance={isOutputPanel}
            />
          ) : (
            <Column style={{ padding: '20px', height: '100%' }}>
              <TYPE.Main color={theme.text3} textAlign="center" mb="20px">
                No results found.
              </TYPE.Main>
            </Column>
          )}
        </>
      )}

      <Footer>
        <Row justify="center" gap={'24px'}>
          <FooterButton onClick={showManageView} data-testid="manage-token-lists-button">
            <SettingsIcon />
          </FooterButton>
          <FooterButton onClick={onDismiss} data-testid="close-icon">
            <X />
          </FooterButton>
        </Row>
      </Footer>
    </ContentWrapper>
  )
}
