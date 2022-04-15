import { Settings, CheckCircle } from 'react-feather'
import { ThemeContext } from 'styled-components/macro'
import React, { useContext } from 'react'

import Card from '../../Card'
import ListLogo from '../../ListLogo'
import ListToggle from '../../Toggle/ListToggle'
import Column, { AutoColumn } from '../../Column'
import Row, { RowFixed, RowBetween } from '../../Row'
import { ButtonEmpty, ButtonPrimary } from '../../Button'
import { PaddedColumn, SearchInput, Separator, SeparatorDark } from '../shared'
import {
  Wrapper,
  RowWrapper,
  StyledMenu,
  ListContainer,
  StyledTitleText,
  PopoverContainer,
  StyledListUrlText,
  UnpaddedLinkStyledButton
} from './ManageLists.styles'

import { ExternalLink, TYPE, IconWrapper } from '../../../theme'

import { ListRowProps, ManageListsComponentProps } from './ManageLists.types'
import { useListRow } from './ManageLists.hooks'

const listUrlRowHTMLId = (listUrl: string) => {
  return `list-row-${listUrl.replace(/\./g, '-')}`
}

const ListRow = ({ listUrl, ...listRowEntryProps }: ListRowProps) => {
  const {
    attributes,
    handleAcceptListUpdate,
    handleDisableList,
    handleEnableList,
    handleRemoveList,
    isActive,
    styles,
    tokensAmountInCurrentChain,
    list,
    node,
    toggle,
    open,
    pending,
    setPopperElement,
    setReferenceElement,
    listsByUrl
  } = useListRow({ listUrl, ...listRowEntryProps })
  const theme = useContext(ThemeContext)

  if (!list || tokensAmountInCurrentChain === 0) return null

  return (
    <RowWrapper active={isActive} bgColor={theme.primary1} key={listUrl} id={listUrlRowHTMLId(listUrl)}>
      <ListLogo size="40px" style={{ marginRight: '1rem' }} logoURI={list.logoURI || ''} defaultText={list.name} />
      <Column style={{ flex: '1' }}>
        <Row>
          <StyledTitleText active={isActive}>{list.name}</StyledTitleText>
        </Row>
        <RowFixed mt="4px">
          <StyledListUrlText active={isActive} mr="6px">
            {tokensAmountInCurrentChain} tokens
          </StyledListUrlText>
          <StyledMenu ref={node as any}>
            <ButtonEmpty onClick={toggle} ref={setReferenceElement} padding="0">
              <Settings stroke={theme.text1} size={12} />
            </ButtonEmpty>
            <PopoverContainer show={open} ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
              <div>{list && `v${list.version.major}.${list.version.minor}.${list.version.patch}`}</div>
              <SeparatorDark />
              <ExternalLink href={`https://tokenlists.org/token-list?url=${listUrl}`}>View list</ExternalLink>
              <UnpaddedLinkStyledButton onClick={handleRemoveList} disabled={Object.keys(listsByUrl).length === 1}>
                Remove list
              </UnpaddedLinkStyledButton>
              {pending && (
                <UnpaddedLinkStyledButton onClick={handleAcceptListUpdate}>Update list</UnpaddedLinkStyledButton>
              )}
            </PopoverContainer>
          </StyledMenu>
        </RowFixed>
      </Column>
      <ListToggle
        isActive={isActive}
        bgColor={theme.primary1}
        toggle={() => {
          isActive ? handleDisableList() : handleEnableList()
        }}
      />
    </RowWrapper>
  )
}

export const ManageLists = ({
  addError,
  handleImport,
  handleInput,
  isImported,
  listUrlInput,
  renderableLists,
  tempList,
  listRowEntryProps
}: ManageListsComponentProps) => {
  const theme = useContext(ThemeContext)

  return (
    <Wrapper>
      <PaddedColumn gap="14px">
        <Row>
          <SearchInput
            type="text"
            id="list-add-input"
            placeholder="https:// or ipfs:// or ENS name"
            value={listUrlInput}
            onChange={handleInput}
          />
        </Row>
        {addError ? (
          <TYPE.error title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} error>
            {addError}
          </TYPE.error>
        ) : null}
      </PaddedColumn>
      {tempList && (
        <PaddedColumn style={{ paddingTop: 0 }}>
          <Card backgroundColor={theme.bg1And2} padding="12px 20px">
            <RowBetween>
              <RowFixed>
                {tempList.logoURI && <ListLogo logoURI={tempList.logoURI} defaultText={tempList.name} size="40px" />}
                <AutoColumn gap="4px" style={{ marginLeft: '20px' }}>
                  <TYPE.body fontWeight={600}>{tempList.name}</TYPE.body>
                  <TYPE.main fontSize={'12px'}>{tempList.tokens.length} tokens</TYPE.main>
                </AutoColumn>
              </RowFixed>
              {isImported ? (
                <RowFixed>
                  <IconWrapper stroke={theme.text2} size="16px" marginRight={'10px'}>
                    <CheckCircle />
                  </IconWrapper>
                  <TYPE.body color={theme.text2}>Loaded</TYPE.body>
                </RowFixed>
              ) : (
                <ButtonPrimary
                  style={{ fontSize: '14px' }}
                  padding="6px 8px"
                  width="fit-content"
                  onClick={handleImport}
                >
                  Import
                </ButtonPrimary>
              )}
            </RowBetween>
          </Card>
        </PaddedColumn>
      )}
      <Separator />
      <ListContainer>
        <AutoColumn gap="md">
          {renderableLists.map(listUrl => (
            <ListRow key={listUrl} listUrl={listUrl} {...listRowEntryProps} />
          ))}
        </AutoColumn>
      </ListContainer>
    </Wrapper>
  )
}
