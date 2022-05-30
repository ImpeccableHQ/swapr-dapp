import React, { useState, useContext, useRef } from 'react'
import { ThemeContext } from 'styled-components'
import Popover from '../../Popover'
import { useTranslation } from 'react-i18next'
import { Text, Flex } from 'rebass/styled-components'
import { ChevronDown } from 'react-feather'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { LIQUIDITY_SORTING_TYPES } from '../../../constants'
import { List, ListItem, StyledFlex, StyledText } from './SortByDropdown.styles'

export function SortByDropdown({
  sortBy,
  onSortByChange,
}: {
  sortBy: string
  onSortByChange: (sortBy: string) => void
}) {
  const popoverRef = useRef()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const theme = useContext(ThemeContext)
  useOnClickOutside(popoverRef, () => setIsOpen(false))

  const sortOptions = {
    [LIQUIDITY_SORTING_TYPES.TVL]: t('TVL'),
    [LIQUIDITY_SORTING_TYPES.APY]: t('APY'),
    [LIQUIDITY_SORTING_TYPES.NEW]: t('NEW'),
  }

  return (
    <Flex alignItems="center" ml="18px" ref={popoverRef}>
      <Popover
        placement="bottom-end"
        show={isOpen}
        content={
          <List>
            {Object.entries(sortOptions).map(([option, translation]) => (
              <ListItem key={option}>
                <Text
                  fontWeight={600}
                  fontSize={10}
                  color={theme.purple2}
                  onClick={() => {
                    onSortByChange(option)
                    setIsOpen(false)
                  }}
                >
                  {translation}
                </Text>
              </ListItem>
            ))}
          </List>
        }
      >
        <StyledFlex alignItems="center" onClick={() => setIsOpen(!isOpen)}>
          <StyledText fontWeight={600} fontSize={10} color={theme.purple2}>
            {t('sortBy', { option: sortOptions[sortBy] })}
          </StyledText>
          <ChevronDown color={theme.purple2} size={16} />
        </StyledFlex>
      </Popover>
    </Flex>
  )
}
