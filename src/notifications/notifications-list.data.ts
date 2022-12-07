import { Notification, NotificationType, PlatformType } from "./notification.interface";

const BANNERS_BUCKET_URL = 'https://generic-objects.fra1.digitaloceanspaces.com/notification-icons';

const DEFAULT_BANNER_URLS = {
  extension: {
    news: `${BANNERS_BUCKET_URL}/extension/news.svg`,
    platformUpdate: `${BANNERS_BUCKET_URL}/extension/platform-update.svg`,
    securityNote: `${BANNERS_BUCKET_URL}/extension/security-note.svg`
  },
  mobile: {
    news: `${BANNERS_BUCKET_URL}/mobile/news.svg`,
    platformUpdate: `${BANNERS_BUCKET_URL}/mobile/platform-update.svg`,
    securityNote: `${BANNERS_BUCKET_URL}/mobile/security-note.svg`
  }
};

export const NOTIFICATIONS_LIST: Notification[] = [
  {
    id: 7,
    createdAt: '2022-12-07T14:30:00.000Z',
    type: NotificationType.SecurityNote,
    platforms: [PlatformType.Extension],
    language: 'en-US',
    title: 'SecurityNote 222 test title',
    description: 'SecurityNote test description.',
    content: [
      "SecurityNote!\n",
      "\n",
      "test content.\n",
      "\n"
    ],
    extensionImageUrl: DEFAULT_BANNER_URLS.extension.securityNote,
    mobileImageUrl: DEFAULT_BANNER_URLS.mobile.securityNote
  },
  {
    id: 6,
    createdAt: '2022-12-07T14:30:00.000Z',
    type: NotificationType.PlatformUpdate,
    platforms: [PlatformType.Extension, ],
    language: 'en-US',
    title: 'PlatformUpdate for Vlad TTT',
    description: 'TTT is the best QA.',
    content: [
      "PlatformUpdate!\n",
      "\n",
      "test content.\n",
      "\n"
    ],
    extensionImageUrl: DEFAULT_BANNER_URLS.extension.platformUpdate,
    mobileImageUrl: DEFAULT_BANNER_URLS.mobile.platformUpdate
  },
  {
    id: 5,
    createdAt: '2022-12-03T13:00:00.000Z',
    type: NotificationType.SecurityNote,
    platforms: [PlatformType.Extension, PlatformType.Mobile],
    language: 'en-US',
    title: 'SecurityNote test title',
    description: 'SecurityNote test description.',
    content: [
      "SecurityNote!\n",
      "\n",
      "test content.\n",
      "\n"
    ],
    extensionImageUrl: DEFAULT_BANNER_URLS.extension.securityNote,
    mobileImageUrl: DEFAULT_BANNER_URLS.mobile.securityNote
  },
  {
    id: 4,
    createdAt: '2022-12-03T13:00:00.000Z',
    type: NotificationType.News,
    platforms: [PlatformType.Extension, PlatformType.Mobile],
    language: 'en-US',
    title: 'News test title',
    description: 'News test description.',
    content: [
      "News!\n",
      "\n",
      "test content.\n",
      "\n"
    ],
    extensionImageUrl: DEFAULT_BANNER_URLS.extension.news,
    mobileImageUrl: DEFAULT_BANNER_URLS.mobile.news
  },
  {
    id: 3,
    createdAt: '2022-12-03T13:00:00.000Z',
    type: NotificationType.PlatformUpdate,
    platforms: [PlatformType.Extension, PlatformType.Mobile],
    language: 'en-US',
    title: 'PlatformUpdate test title',
    description: 'PlatformUpdate test description.',
    content: [
      "PlatformUpdate!\n",
      "\n",
      "test content.\n",
      "\n"
    ],
    extensionImageUrl: DEFAULT_BANNER_URLS.extension.platformUpdate,
    mobileImageUrl: DEFAULT_BANNER_URLS.mobile.platformUpdate
  }
];

export const MANDATORY_NOTIFICATIONS_LIST: Notification[] = [
  {
    id: 2,
    createdAt: '2022-11-29T13:00:00.000Z',
    type: NotificationType.SecurityNote,
    platforms: [PlatformType.Extension],
    language: 'en-US',
    title: 'A note on security',
    description: 'Please read this short write-up to learn how we help you secure your wallet and what additional steps you may take on your part.',
    content: [
      "Attention!\n",
      "\n",
      "Never and under any pretext share your private keys and a seed phrase with the third parties.\n",
      "\n",
      "Also, remember:\n",
      " • Your wallet can be targeted through a browser’s zero-day exploit or via other malicious extensions installed;\n",
      " • The screen can potentially be manipulated by malicious software installed in the system;\n",
      " • User’s host machine can be targeted by malware to steal encrypted wallet;\n",
      " • Choosing weak passwords can reduce the ability of a wallet to resist adversarial brute-forcing.\n",
      "\n",
      "To keep your assets safe, we recommend:\n",
      " • Move your funds from “hot” wallet to “cold” as soon as possible (Temple wallet supports integration with “Ledger Nano” devices);\n",
      " • Use separate browsers for web-surfing and wallet’s operating;\n",
      " • Use one browser’s tab at a time to make transactions;\n",
      " • Keep the wallet locked when it is not in usage.\n",
      "\n",
      "Take care of your safety in the crypto world!",
      "You can find even more security tips ",
      {text: 'here', url: 'https://madfish.crunch.help/temple-wallet/a-note-on-security'},
      "."
    ],
    extensionImageUrl: DEFAULT_BANNER_URLS.extension.securityNote,
    mobileImageUrl: DEFAULT_BANNER_URLS.mobile.securityNote
  },
  {
    id: 1,
    createdAt: '2022-11-29T13:00:00.000Z',
    type: NotificationType.SecurityNote,
    platforms: [PlatformType.Mobile],
    language: 'en-US',
    title: 'A note on security',
    description: 'Please read this short write-up to learn how we help you secure your wallet and what additional steps you may take on your part.',
    content: [
      "Attention\n",
      "\n",
      "Never and under any pretext share your private keys and seed phrases with the third parties.\n",
      "\n",
      "Also, remember:\n",
      " • Your wallet can be targeted through a zero-day exploit or via other malicious software installed;\n",
      " • The screen can potentially be manipulated by malicious software installed in the system;\n",
      " • User’s device can be targeted by malware to steal encrypted wallet;\n",
      " • Choosing weak passwords can reduce the ability of a wallet to resist adversarial brute-forcing.\n",
      "\n",
      "To keep your assets safe, we recommend:\n",
      " • Ideally, use separate devices for web-surfing and wallet’s operating;\n",
      " • Use one browser’s tab at a time to make transactions;\n",
      " • Keep the wallet locked when it is not in usage.\n",
      "\n",
      "Take care of your safety in the crypto world!\n",
      "You can find even more security tips ",
      {text: 'here', url: 'https://madfish.crunch.help/temple-wallet/a-note-on-security'},
      "."
    ],
    extensionImageUrl: DEFAULT_BANNER_URLS.extension.securityNote,
    mobileImageUrl: DEFAULT_BANNER_URLS.mobile.securityNote
  },
  {
    id: 0,
    createdAt: '2022-11-29T13:00:00.000Z',
    type: NotificationType.News,
    platforms: [PlatformType.Mobile, PlatformType.Extension],
    language: 'en-US',
    title: 'Welcome to the Temple wallet!',
    description: 'Thank you for choosing Temple wallet for all your Tezos related needs!',
    content: [
      "Welcome, traveler.\n",
      "\n",
      "You are now entering the ancient halls of the Temple. Stay a while and listen.\n",
      "\n",
      "Temple wallet stands among the first dedicated Tezos wallets and is used by hundreds of thousand Tezonians. ",
      "This is a great start of your Tezos experience if you are new or a great boost of your capabilities if you’re ",
      "a seasoned adventurer.\n",
      "\n",
      "It boasts all the features you would expect from a modern crypto wallet:\n",
      " • Top up balance with crypto or credit card.\n",
      " • Sync your wallet between mobile and desktop devices.\n",
      " • Use our swap router to conduct advantageous exchanges.\n",
      " • Store NFTs in the Collectibles tab.\n",
      " • And more!\n",
      "\n",
      "To quickly learn the ropes, check our ",
      {text: "knowledge base", url: "https://madfish.crunch.help/temple-wallet"},
      " and ",
      {
        text: "YouTube video tutorials",
        url: 'https://www.youtube.com/watch?v=0wgR-H8I9xg&list=PLVfSwYHwGJ2Gyyf16LEIgvkNoC1YtgjX1'
      },
      " out.\n\n",
      "If you have any questions or suggestions, reach us at ",
      {text: "info@madfish.solutions", url: "mailto:info@madfish.solutions"},
      ". To talk to us directly, join our online communities in ",
      {text: "Telegram", url: "https://t.me/MadFishCommunity"},
      " and ",
      {text: "Discord", url: "https://discord.com/invite/qFRZ8kVzkv"},
      ". We’re happy to have you!\n"
    ],
    extensionImageUrl: DEFAULT_BANNER_URLS.extension.news,
    mobileImageUrl: DEFAULT_BANNER_URLS.mobile.news
  }
]