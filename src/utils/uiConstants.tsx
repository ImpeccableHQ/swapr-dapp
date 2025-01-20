import {
  DISCORD_INVITE_LINK,
  SWAPR_DOCS_BASE_URL,
  SWAPR_DOCS_PATH_URLS,
  LIQUIDITY_V3_INFO_POOLS_LINK,
} from '../constants'

import BNBLogo from './../assets/images/BNBLogo.svg'
import ArbitrumLogo from './../assets/images/logo-Arbitrum.svg'
import EthereumLogo from './../assets/images/logo-Ethereum.svg'
import PolygonLogo from './../assets/images/logo-Polygon.svg'
import xDaiLogo from './../assets/images/logo-xDai.svg'
import OptimismLogo from './../assets/images/optimism.svg'
import RoutingOneInch from './../assets/images/routing-1inch.svg'
import RoutingBaoSwap from './../assets/images/routing-BaoSwap.svg'
import RoutingBiSwap from './../assets/images/routing-Biswap.svg'
import RoutingCoW from './../assets/images/routing-CoW.svg'
import RoutingCurve from './../assets/images/routing-Curve.svg'
import RoutingDFYN from './../assets/images/routing-DFYN.svg'
import RoutingHoneySwap from './../assets/images/routing-HoneySwap.svg'
import RoutingLevinSwap from './../assets/images/routing-Levinswap.svg'
import RoutingLifi from './../assets/images/routing-Lifi.svg'
import RoutingOpenOcean from './../assets/images/routing-OpenOcean.svg'
import RoutingPancakeSwap from './../assets/images/routing-Pancakeswap.svg'
import RoutingQuickSwap from './../assets/images/routing-Quickswap.svg'
import RoutingSushiSwap from './../assets/images/routing-SushiSwap.svg'
import RoutingUniswap from './../assets/images/routing-Uniswap.svg'
import RoutingVelodrome from './../assets/images/routing-Velodrome.svg'
import RoutingZerox from './../assets/images/routing-Zerox.svg'

export const mainNavigation = [
  {
    label: 'Documentation',
    href: SWAPR_DOCS_BASE_URL,
  },
  {
    label: 'Stats',
    href: '/#stats',
  },
  {
    label: 'Launch Swapr',
    href: '#',
    cta: true,
  },
]

export const HeroContent = {
  mainText: <span>Swap, Bridge, Farm across chains.</span>,
  heroLogos: [
    {
      img: EthereumLogo,
      title: 'Ethereum',
    },
    {
      img: ArbitrumLogo,
      title: 'Arbitrum',
    },
    {
      img: xDaiLogo,
      title: 'xDai',
    },
    {
      img: PolygonLogo,
      title: 'Polygon',
    },
    {
      img: OptimismLogo,
      title: 'Optimism',
    },
    {
      img: BNBLogo,
      title: 'BNB',
    },
  ],
  heroButtons: [
    {
      label: 'Launch Swapr',
      type: 'secondary',
      href: '#',
    },
    {
      label: 'Join Our Discord',
      type: 'dark',
      href: DISCORD_INVITE_LINK,
    },
  ],
} as const

export const RoutingThroughContent = {
  title: 'ROUTING THROUGH',
  companies: [
    {
      title: '0x',
      img: RoutingZerox,
    },
    {
      title: '1inch',
      img: RoutingOneInch,
    },
    {
      title: 'BaoSwap',
      img: RoutingBaoSwap,
    },
    {
      title: 'BiSwap',
      img: RoutingBiSwap,
    },
    {
      title: 'CoW',
      img: RoutingCoW,
    },
    {
      title: 'Curve',
      img: RoutingCurve,
    },
    { title: 'DFYN', img: RoutingDFYN },
    {
      title: 'HoneySwap',
      img: RoutingHoneySwap,
    },
    {
      title: 'Levinswap',
      img: RoutingLevinSwap,
    },
    {
      title: 'OpenOcean',
      img: RoutingOpenOcean,
    },
    {
      title: 'PancakeSwap',
      img: RoutingPancakeSwap,
    },
    { title: 'QuickSwap', img: RoutingQuickSwap },
    {
      title: 'SushiSwap',
      img: RoutingSushiSwap,
    },
    {
      title: 'Uniswap',
      img: RoutingUniswap,
    },
    {
      title: 'Velodrome',
      img: RoutingVelodrome,
    },
    {
      title: 'Lifi',
      img: RoutingLifi,
    },
  ],
}

export const FooterContent = {
  linkColumns: [
    {
      title: 'Product',
      footerLinks: [
        {
          label: 'Pools V2',
          href: '/pools',
        },
        {
          label: 'Pools V3',
          href: `${LIQUIDITY_V3_INFO_POOLS_LINK}`,
        },
        {
          label: 'Rewards V2',
          href: '/rewards',
        },
      ],
    },
    {
      title: 'About',
      footerLinks: [
        {
          label: 'Docs',
          href: `${SWAPR_DOCS_BASE_URL}`,
        },
        {
          label: 'FAQ',
          href: `${SWAPR_DOCS_BASE_URL}${SWAPR_DOCS_PATH_URLS.FAQ}`,
        },
        {
          label: 'Audits',
          href: 'https://dxdocs.eth.limo/docs/Technical%20Documentation/Audits/#swapr',
        },
        {
          label: 'Brand Assets',
          href: `${SWAPR_DOCS_BASE_URL}${SWAPR_DOCS_PATH_URLS.PROJECT_INFO_BRANDING}`,
        },
      ],
    },
    {
      title: 'Community',
      footerLinks: [
        {
          label: 'Discord',
          href: DISCORD_INVITE_LINK,
        },
        {
          label: 'X',
          href: 'https://x.com/Swapr_dapp',
        },
        {
          label: 'Forum',
          href: 'https://daotalk.org/c/dx-dao/15',
        },
        {
          label: 'Blog',
          href: 'https://medium.com/swapr',
        },
      ],
    },
    {
      title: 'Analytics',
      footerLinks: [
        {
          label: 'DXstats',
          href: 'https://dxstats.eth.limo/#/home',
        },
      ],
    },
  ],
} as const
