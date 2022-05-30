import styled from 'styled-components'
import { Flex, Text } from 'rebass'

export const Header = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 2fr 1fr;
  padding: 12px 28px;
`

export const HeaderText = styled(Text)`
  font-weight: 600;
  font-size: 10px;
  color: ${({ theme }) => theme.purple3};
  text-transform: uppercase;
`

export const ListLayout = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-gap: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-gap: 20px;
    padding: 16px;
  `};
`

export const PaginationRow = styled(Flex)`
  width: 100%;
  justify-content: flex-end;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    justify-content: center;
  `};

  & ul {
    margin: 22px 0;
  }
`
