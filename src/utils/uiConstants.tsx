import TextyAnim from 'rc-texty'

import Entry2 from './../assets/images/blog/blog-entry-2.jpg'
import EcoRouterArticle from './../assets/images/blog/ecorouter-article.webp'
import MevArticle from './../assets/images/blog/mev-article.webp'
import BNBLogo from './../assets/images/BNBLogo.svg'
import Bridge from './../assets/images/features/bridge.png'
import EcoRouting from './../assets/images/features/eco-routing.png'
import Farming from './../assets/images/features/farm.png'
import Swap from './../assets/images/features/swap.png'
import gnosisChainLogo from './../assets/images/gnosis-chain.svg'
import BaoSwapStats from './../assets/images/isologo-baoswap.svg'
import HoneySwapStats from './../assets/images/isologo-honeyswap.svg'
import SushiSwapStats from './../assets/images/isologo-sushiswap.svg'
import UniSwapStats from './../assets/images/isologo-uniswap.svg'
import RoutingLevinSwap from './../assets/images/levinswap.svg'
import ArbitrumLogo from './../assets/images/logo-Arbitrum.svg'
import EthereumLogo from './../assets/images/logo-Ethereum.svg'
import PolygonLogo from './../assets/images/logo-Polygon.svg'
import xDaiLogo from './../assets/images/logo-xDai.svg'
import OptimismLogo from './../assets/images/optimism.svg'
import RoutingOneInch from './../assets/images/routing-1inch.svg'
import RoutingBaoSwap from './../assets/images/routing-BaoSwap.svg'
import RoutingBiSwap from './../assets/images/routing-biswap.svg'
import RoutingCoW from './../assets/images/routing-cow.svg'
import RoutingCurve from './../assets/images/routing-curve.svg'
import RoutingDFYN from './../assets/images/routing-DFYN.svg'
import RoutingHoneySwap from './../assets/images/routing-HoneySwap.svg'
import RoutingPancakeSwap from './../assets/images/routing-pancakeswap.svg'
import RoutingQuickSwap from './../assets/images/routing-Quickswap.svg'
import RoutingSushiSwap from './../assets/images/routing-SushiSwap.svg'
import RoutingUniswap from './../assets/images/routing-Uniswap.svg'
import RoutingVelodrome from './../assets/images/routing-velodrome.svg'
import RoutingZerox from './../assets/images/routing-zerox.svg'
import { scrollTo } from './helperFunctions'

export const mainNavigation = [
  {
    label: 'Documentation',
    href: 'http://dxdocs.eth.limo.ipns.localhost:8080/docs/Products/swapr/',
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
      href: '#',
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
  ],
}

type Images = { [key: string]: string }

function importAll(folderArray: __WebpackModuleApi.RequireContext) {
  const images: Images = {}
  folderArray.keys().forEach(item => {
    const name = item.substring(item.indexOf('./') + 2, item.lastIndexOf('.'))
    images[name] = folderArray(item)
  })
  return images
}

const animations = importAll(require.context('./../assets/images/animations', false, /\.(svg)$/))

export type FeatureButton = {
  label: string
  type: 'primary' | 'dark'
  external: boolean
  onClick?: () => void
  href?: string
}

export type Feature = {
  title: string
  content: string
  image: string
  animation: string
  buttons: readonly FeatureButton[]
}

export type FeatureContent = {
  topBanner: {
    title: string
    logos: readonly string[]
  }
  preHeader: string
  sectionTitle: string
  features: readonly Feature[]
}

export const FeaturesContent: Readonly<FeatureContent> = {
  topBanner: {
    title: 'Swap, Bridge and Farm across chains.',
    logos: [EthereumLogo, ArbitrumLogo, gnosisChainLogo, PolygonLogo, OptimismLogo, BNBLogo],
  },
  preHeader: 'Swapr Features',
  sectionTitle: 'Your DeFi Powertool',
  features: [
    {
      title: 'SWAP',
      content: 'Trade your favorite pairs on your favorite chains through the Swapr interface.',
      image: Swap,
      animation: animations['01_Swap'],
      buttons: [
        {
          label: 'SWAP',
          onClick: () => {
            scrollTo('app-wrapper')
          },
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
    {
      title: 'BRIDGE',
      content: 'Bridge directly to or from multiple chains: Ethereum, Gnosis, Arbitrum, Polygon, Optimism.',
      image: Bridge,
      animation: animations['06_Bridge'],
      buttons: [
        {
          label: 'BRIDGE',
          href: '/#/bridge',
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
    {
      title: 'ECO-ROUTING',
      content: 'The eco-router ensures the best price through established DEXes with no extra fees!',
      animation: animations['02_Eco_Routing'],
      image: EcoRouting,
      buttons: [
        {
          label: 'SWAP',
          onClick: () => {
            scrollTo('app-wrapper')
          },
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
    {
      title: 'FARMING',
      content: 'Users can participate in permissionless farming campaigns directly in the Swapr interface.',
      image: Farming,
      animation: animations['04_Farming'],
      buttons: [
        {
          label: 'FARM',
          href: '/#/rewards',
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
  ],
} as const

export const BlogContent = {
  readBlogPost: 'READ BLOG POST',
  posts: [
    {
      image: EcoRouterArticle,
      title: 'The Eco Router — Effortlessly Combining Safety and Best Value Trading!',
      content: 'Introducing external liquidity into swapr with no extra cost to the user',
      postLink:
        'https://medium.com/swapr/the-eco-router-effortlessly-combining-safety-and-best-value-trading-1a3fe23c5255',
    },
    {
      image: MevArticle,
      title: 'Full MEV Protection from CoW Protocol within Swapr’s Eco Router.',
      content: 'MEV Protection in Swapr',
      postLink: 'https://medium.com/swapr/full-mev-protection-from-cow-protocol-within-swaprs-eco-router-8a0d67d7f394',
    },
    {
      image: Entry2,
      title: 'Introducing SWPR Token Farming Rewards',
      content:
        'Introducing SWPR Token Farming RewardsRecently, the DXdao community identified a misconfiguration with ...',
      postLink: 'https://medium.com/swapr/introducing-swpr-token-farming-rewards-7fbdcc9507ae',
    },
  ],
} as const

export const FooterContent = {
  linkColumns: [
    {
      title: 'About',
      footerLinks: [
        {
          label: 'FAQ',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/faq/',
        },
        {
          label: 'Blog',
          href: 'https://medium.com/swapr',
        },
        {
          label: 'Audits',
          href: 'https://dxdocs.eth.limo/docs/Technical%20Documentation/Audits/#swapr',
        },
        {
          label: 'Brand Assets',
          href: 'https://dxdocs.eth.limo/docs/BrandingAssets/#swapr-brand-assets',
        },
      ],
    },
    {
      title: 'Community',
      footerLinks: [
        {
          label: 'Discord',
          href: 'https://discord.gg/QFkNsjTkzD',
        },
        {
          label: 'Twitter',
          href: 'https://twitter.com/SwaprEth',
        },
        {
          label: 'Forum',
          href: 'https://daotalk.org/c/dx-dao/15',
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
  footerCta: {
    label: 'GO TO SWAPR',
    href: '#',
  },
} as const

type Company = {
  name: string
  image: string
  href: string
}

type Status = {
  title: 'TOTAL VOLUME' | 'TRADES' | 'TOTAL FEES COLLECTED' | 'SWPR PRICE' | 'TVL' | 'ROUTING THROUGH'
  value?: JSX.Element
  externalSource?: boolean
  headingDollar?: boolean
  moreLabel?: string
  companies?: readonly Company[]
}

type StatusContent = {
  title: string
  stats: readonly Status[]
}

export const StatsContent: Readonly<StatusContent> = {
  title: 'Swapr Stats',
  stats: [
    {
      title: 'TOTAL VOLUME',
      value: <TextyAnim type="flash">$145,000,000+</TextyAnim>,
      externalSource: true,
    },
    {
      title: 'TRADES',
      value: (
        <>
          <TextyAnim type="flash">570,000+</TextyAnim>
        </>
      ),
      externalSource: true,
    },
    {
      title: 'TOTAL FEES COLLECTED',
      value: (
        <>
          <TextyAnim type="flash">$34,000+</TextyAnim>
          <TextyAnim type="flash" className="dim"></TextyAnim>
        </>
      ),
    },
    {
      title: 'SWPR PRICE',
      value: (
        <>
          <TextyAnim type="flash">$49</TextyAnim>
          <TextyAnim type="flash" className="dim">
            0
          </TextyAnim>
          <TextyAnim type="flash" className="hiddable-mobile">
            00
          </TextyAnim>
        </>
      ),
      externalSource: true,
      headingDollar: true,
    },
    {
      title: 'TVL',
      value: <TextyAnim>10,149,321</TextyAnim>,
      externalSource: true,
    },
    {
      title: 'ROUTING THROUGH',
      companies: [
        {
          name: 'UniSwap',
          image: UniSwapStats,
          href: '#',
        },
        {
          name: 'SushiSwap',
          image: SushiSwapStats,
          href: '#',
        },
        {
          name: 'BaoSwap',
          image: BaoSwapStats,
          href: '#',
        },
        {
          name: 'HoneySwap',
          image: HoneySwapStats,
          href: '#',
        },
      ],
      moreLabel: '+ 3 more',
    },
  ],
} as const
