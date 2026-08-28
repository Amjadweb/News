import { NewsArticle, FactCheckItem, TrendingTopic } from '../types';

export const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    id: 'art_101',
    slug: 'bangladesh-it-exports-surpass-record-2-billion-milestone-2026',
    title: 'Bangladesh IT & Software Exports Surpass Record $2 Billion Milestone with 34% Annual Growth',
    titleBn: 'রেকর্ড ২ বিলিয়ন ডলার ছাড়াল বাংলাদেশের আইটি ও সফটওয়্যার রপ্তানি, বার্ষিক প্রবৃদ্ধি ৩৪%',
    summary: 'Official export promotion bureau records and trade body verifications confirm that Bangladesh ICT and software export revenue crossed $2.14 billion in FY 2025-2026, driven by global enterprise SaaS, AI development services, and high-value tech infrastructure contracts.',
    summaryBn: 'রপ্তানি উন্নয়ন ব্যুরো (ইপিবি) ও বেসিস-এর যৌথ তথ্যে নিশ্চিত হওয়া গেছে যে ২০২৫-২৬ অর্থবছরে বাংলাদেশের তথ্যপ্রযুক্তি ও সফটওয়্যার রপ্তানি আয় ২.১৪ বিলিয়ন ডলার অতিক্রম করেছে, যার পেছনে রয়েছে গ্লোবাল এন্টারপ্রাইজ সাস ও কৃত্রিম বুদ্ধিমত্তা সলিউশন।',
    content: `## Executive Overview

Dhaka, Bangladesh — In a landmark transformation for South Asian digital engineering, the Export Promotion Bureau (EPB) and the Bangladesh Association of Software and Information Services (BASIS) have officially validated that Bangladesh's ICT, IT-enabled services (ITES), and software exports reached **$2.14 billion** in the fiscal year 2025-2026. This reflects a remarkable **34.2% year-over-year surge**, marking the fastest growth rate among export sectors.

### Primary Growth Catalysts
1. **High-Value Enterprise AI & FinTech Engineering**: Over 65% of contract valuations shifted from traditional maintenance to custom machine learning models, cloud computing infrastructure, and banking cybersecurity systems.
2. **Expansion in North American and European Markets**: US and UK enterprise contracts represented $1.18B (55.1%) of total receipts, followed by Japan and the EU ($640M).
3. **Hyper-Specialized Tech Workforce**: Over 420,000 active IT professionals and registered technology exporters contributed to the output across Dhaka, Chattogram, Sylhet, and Rajshahi high-tech parks.

### BBC & Reuters Corroboration
Financial technology analysts from Bloomberg Asia and Reuters have cross-verified the central bank remittance pipelines through Authorized Dealer (AD) banks, confirming that remittance leakages have been curtailed through transparent digital reporting rails and automated foreign exchange declarations.

> "This is not merely a quantitative milestone; it represents a structural qualitative leap. Bangladeshi technology companies are no longer just subcontracting basic tasks—they are architecting core cloud and AI infrastructures for Fortune 500 corporations worldwide."
> — *Russell T. Ahmed, Industry Representative*

### Key Verified Takeaways
- **Total Certified Export Revenue**: $2,142,500,000 USD
- **Top Destination Markets**: United States (38%), United Kingdom (17%), Japan (14%), Germany (9%)
- **Active Certified Exporters**: 482 Tier-1 IT corporations and over 85,000 registered high-tier engineering freelancers`,
    category: 'Bangladesh',
    tags: ['Bangladesh', 'IT Export', 'Economy', 'BASIS', 'Tech Growth', 'EPB'],
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    publishedAt: '2026-08-28T01:30:00Z',
    updatedAt: '2026-08-28T01:45:00Z',
    retrievedAt: '2026-08-28T01:35:00Z',
    status: 'Published',
    verificationStatus: 'Verified',
    confidenceScore: 98,
    importanceScore: 96,
    viewsCount: 1420,
    isBreaking: true,
    isTrending: true,
    readTimeMinutes: 4,
    byline: 'TruthPulse Economic Intelligence Bureau',
    bylineRole: 'Lead Financial Correspondent',
    location: 'Dhaka, Bangladesh',
    analysis: {
      author: 'Dr. Shahriar Rahman',
      role: 'Senior Trade & Macroeconomics Fellow',
      text: 'Crossing the $2B baseline firmly places Bangladesh on the tier-2 global outsourcing index alongside Poland and Vietnam. The critical next phase requires sovereign AI computing cluster investments.',
      textBn: '২ বিলিয়ন ডলার অতিক্রমের ফলে বাংলাদেশ বৈশ্বিক তথ্যপ্রযুক্তি রফতানিকারকদের তালিকায় নতুন উচ্চতায় পৌঁছেছে।',
    },
    quotes: [
      {
        speaker: 'Russell T. Ahmed',
        title: 'President, BASIS',
        quote: 'This is a structural qualitative leap. Bangladeshi technology companies are now architecting core enterprise cloud systems.',
      },
    ],
    primarySource: {
      id: 'src_epb_gov',
      name: 'Export Promotion Bureau (EPB) & BASIS Wire',
      url: 'https://epb.gov.bd/reports/ict-export-milestone-2026',
      publisher: 'Ministry of Commerce, Government of Bangladesh',
      domain: 'epb.gov.bd',
      publishedAt: '2026-08-28T01:30:00Z',
      retrievedAt: '2026-08-28T01:35:00Z',
      sourceType: 'Government Source',
      reliabilityScore: 99,
      isPrimary: true,
    },
    sourceComparison: {
      totalChecked: 5,
      supporting: 5,
      conflicting: 0,
      primarySourceAvailable: true,
      sources: [
        {
          id: 'src_bb',
          name: 'Bangladesh Bank Remittance Ledger',
          url: 'https://bb.org.bd',
          publisher: 'Central Bank',
          domain: 'bb.org.bd',
          publishedAt: '2026-08-28T01:00:00Z',
          retrievedAt: '2026-08-28T01:35:00Z',
          sourceType: 'Official API',
          reliabilityScore: 99,
        },
      ],
    },
    keyFacts: [
      'Bangladesh IT & ITES export revenue officially recorded at $2.14B for FY 2025-2026.',
      '34.2% YoY growth verified through Bangladesh Bank remittance accounting.',
      'North America and EU accounted for over 72% of software procurement volume.',
    ],
    extractedClaims: [
      {
        id: 'clm_101',
        claim: 'Bangladesh IT exports crossed $2.14 billion in FY 2025-2026.',
        confidence: 99,
        evidenceStatus: 'supported',
        evidenceSnippet: 'Official EPB trade figures corroborating bank clearance files.',
      },
    ],
    entities: {
      people: ['Russell T. Ahmed', 'Dr. Shahriar Rahman'],
      organizations: ['Export Promotion Bureau', 'BASIS', 'Bangladesh Bank'],
      locations: ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi'],
      numbers: ['$2.14B', '34.2%', '420,000'],
      dates: ['FY 2025-2026', 'August 2026'],
    },
  },
  {
    id: 'art_102',
    slug: 'deepmind-gemini-next-gen-autonomous-scientific-discovery',
    title: 'Google DeepMind Unveils Next-Gen AI System Capable of Autonomous Material Discovery and Quantum Chemistry',
    titleBn: 'গুগল ডিপমাইন্ড উন্মোচন করল স্বয়ংক্রিয় পদার্থ আবিষ্কার ও কোয়ান্টাম রসায়নের নতুন এআই সিস্টেম',
    summary: 'DeepMind researchers announce a breakthrough autonomous laboratory model that synthesizes 2.2 million new crystal structures, predicting stable superconductivity candidates and next-generation solid-state battery electrolytes with atomic-level precision.',
    summaryBn: 'ডিপমাইন্ড গবেষকরা একটি যুগান্তকারী এআই মডেল প্রকাশ করেছেন যা ২২ লক্ষ নতুন ক্রিস্টাল গঠন সংশ্লেষণ এবং পরবর্তী প্রজন্মের সলিড-স্টেট ব্যাটারি প্রযুক্তির জন্য অতিপরিবাহী উপাদান নিখুঁতভাবে শনাক্ত করতে সক্ষম।',
    content: `## Breakthrough in Computational Physics

London / Mountain View — Google DeepMind and partnered international physics consortiums have revealed their newest generative AI chemistry model, **GNoME-v3 (Graph Networks for Materials Exploration)**, which has synthesized and experimentally confirmed hundreds of novel stable materials previously undiscovered by human science.

### Quantum Physics & Energy Storage Implications
- **Solid-State Battery Breakthroughs**: Identifies 52 high-conductivity lithium and sodium solid electrolytes that eliminate thermal runaway risks.
- **Room-Temperature Superconductor Candidates**: Screens quantum lattice interactions across 80,000 chemical permutations.
- **Autonomous Lab Validation**: Integrated with robotic synthesis facilities in Berkeley and Cambridge, achieving a 78% experimental synthesis success rate without human intervention.`,
    category: 'Artificial Intelligence',
    tags: ['AI', 'DeepMind', 'Quantum Chemistry', 'Materials Science', 'Batteries'],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    publishedAt: '2026-08-28T00:15:00Z',
    updatedAt: '2026-08-28T01:10:00Z',
    retrievedAt: '2026-08-28T00:20:00Z',
    status: 'Published',
    verificationStatus: 'Verified',
    confidenceScore: 97,
    importanceScore: 94,
    viewsCount: 2890,
    isBreaking: false,
    isTrending: true,
    readTimeMinutes: 5,
    byline: 'Dr. Alistair Finch',
    bylineRole: 'Lead Science & Quantum Physics Editor',
    location: 'London, UK',
    primarySource: {
      id: 'src_deepmind_press',
      name: 'DeepMind Science & Nature Communications',
      url: 'https://deepmind.google/discover/blog/materials-exploration-ai-2026',
      publisher: 'Google DeepMind',
      domain: 'deepmind.google',
      publishedAt: '2026-08-28T00:15:00Z',
      retrievedAt: '2026-08-28T00:20:00Z',
      sourceType: 'Verified Outlet',
      reliabilityScore: 98,
      isPrimary: true,
    },
    sourceComparison: {
      totalChecked: 4,
      supporting: 4,
      conflicting: 0,
      primarySourceAvailable: true,
      sources: [],
    },
    keyFacts: [
      'Over 2.2 million crystalline structures discovered and verified through computational density functional theory.',
      '78% autonomous synthesis success rate confirmed in robotic laboratory trials.',
      'Identified 52 candidates for high-density, zero-fire-risk solid state batteries.',
    ],
    extractedClaims: [],
    entities: {
      people: ['Dr. Alistair Finch'],
      organizations: ['Google DeepMind', 'Nature Journal', 'Berkeley Lab'],
      locations: ['London', 'Mountain View', 'Cambridge'],
      numbers: ['2.2 Million', '52 Candidates', '78%'],
      dates: ['August 2026'],
    },
  },
  {
    id: 'art_103',
    slug: 'bangladesh-bank-digital-taka-cbdc-pilot-launch',
    title: 'Bangladesh Bank Launches Nationwide Phase-2 Pilot for Digital Taka (CBDC) with Instant Offline Payments',
    titleBn: 'দেশজুড়ে ডিজিটাল টাকার পাইলট কার্যক্রমের দ্বিতীয় ধাপ শুরু করল বাংলাদেশ ব্যাংক, সাথে অফলাইন পেমেন্ট সুবিধা',
    summary: 'The central bank of Bangladesh initiates comprehensive field trials for the sovereign Digital Taka, featuring dual-ledger cryptographic security, low-cost merchant acceptance, and device-to-device offline transaction support for remote regions.',
    summaryBn: 'বাংলাদেশ ব্যাংক তাদের ডিজিটাল টাকার (সিবিডিসি) দ্বিতীয় ধাপের পরীক্ষামূলক কার্যক্রম চালু করেছে, যার মধ্যে রয়েছে তাত্ক্ষণিক অফলাইন লেনদেন ও কম খরচে মার্চেন্ট পেমেন্ট সুবিধা।',
    content: `## Financial Technology Transformation

Dhaka — Bangladesh Bank Governor and payment systems directors have officially commenced the second expansion phase of the **Central Bank Digital Currency (CBDC) — the Digital Taka**.

### Key System Architecture
- **Offline Cryptographic Mesh**: Transactions can execute between two NFC-enabled devices even in areas with zero cellular internet reception.
- **Near-Zero Merchant Interchange**: Merchant transaction fees capped at 0.1%, drastically reducing friction for small micro-enterprises and grocers.
- **Interoperability**: Seamlessly bridges with National Financial Switch (NFSB), MFS providers (bKash, Nagad), and commercial banking apps.`,
    category: 'Finance & Economy',
    tags: ['Digital Taka', 'CBDC', 'Bangladesh Bank', 'FinTech', 'Economy'],
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    publishedAt: '2026-08-27T22:00:00Z',
    updatedAt: '2026-08-28T00:30:00Z',
    retrievedAt: '2026-08-27T22:15:00Z',
    status: 'Published',
    verificationStatus: 'Verified',
    confidenceScore: 95,
    importanceScore: 91,
    viewsCount: 1840,
    isBreaking: false,
    isTrending: true,
    readTimeMinutes: 4,
    primarySource: {
      id: 'src_bb_press',
      name: 'Bangladesh Bank Press Release & BSS',
      url: 'https://bb.org.bd/cbdc/pilot-phase-2-announcement',
      publisher: 'Central Bank of Bangladesh',
      domain: 'bb.org.bd',
      publishedAt: '2026-08-27T22:00:00Z',
      retrievedAt: '2026-08-27T22:15:00Z',
      sourceType: 'Government Source',
      reliabilityScore: 99,
      isPrimary: true,
    },
    sourceComparison: {
      totalChecked: 3,
      supporting: 3,
      conflicting: 0,
      primarySourceAvailable: true,
      sources: [],
    },
    keyFacts: [
      'Phase 2 pilot incorporates 25 commercial banks and 150,000 registered retail merchants across 8 divisions.',
      'Full offline payment capability verified through secure enclave chip hardware.',
      'Consumer transactions remain free with 0.1% merchant processing cap.',
    ],
    extractedClaims: [],
    entities: {
      organizations: ['Bangladesh Bank', 'National Payment Switch', 'bKash', 'Nagad'],
      locations: ['Dhaka', 'Bangladesh'],
      numbers: ['25 Banks', '150,000 Merchants', '0.1% Cap'],
    },
  },
];

export const FALLBACK_FACT_CHECKS: FactCheckItem[] = [
  {
    id: 'fc_201',
    claim: 'Viral social media claims state that ATM transactions in Bangladesh will require a mandatory 15% VAT deduction per withdrawal starting September 2026.',
    claimant: 'Viral Facebook & WhatsApp forward messages',
    verdict: 'FALSE',
    confidenceScore: 99,
    summary: 'Bangladesh Bank and the National Board of Revenue (NBR) have issued an unequivocal clarification confirming that no new tax or VAT has been imposed on cash withdrawals from automated teller machines (ATMs). Existing standard inter-bank ATM interchange rules remain unchanged.',
    assertions: [
      'Claims 15% VAT on all retail ATM cash withdrawals',
      'Purports effective implementation date of September 1, 2026',
    ],
    evidences: [
      {
        sourceName: 'Bangladesh Bank Press Statement Ref: BB-PSD-2026/08',
        sourceUrl: 'https://bb.org.bd/notices/vat-rumor-refutation',
        publishedDate: '2026-08-28T00:30:00Z',
        evidenceType: 'Official',
        quoteSnippet: 'No tax or surcharge added to standard consumer ATM withdrawals.',
        supportsClaim: false,
      },
    ],
    primarySourceAvailable: true,
    conclusion: 'False. Both central bank directives and NBR statutory orders confirm ATM withdrawal fees remain free of any new VAT surcharge.',
    whyTrustedExplanation: 'Cross-verified directly with official gazettes and statutory regulatory circulars from Bangladesh Bank and NBR.',
    createdAt: '2026-08-28T00:30:00Z',
    category: 'Finance & Economy',
  },
  {
    id: 'fc_202',
    claim: 'Video circulating online claims a major electrical fire destroyed the central server room of the Padma Bridge Railway signaling control center.',
    claimant: 'TikTok & YouTube Shorts clickbait channels',
    verdict: 'FALSE',
    confidenceScore: 98,
    summary: 'Fire Service and Civil Defence (FSCD) and Bangladesh Railway authorities verified that the viral footage is from a 2023 warehouse fire in another district. The Padma Bridge rail control system is operating with 100% redundancy and no fire incident occurred.',
    assertions: [
      'Asserts total destruction of railway signaling central control room',
    ],
    evidences: [
      {
        sourceName: 'Bangladesh Railway Press Release',
        sourceUrl: 'https://railway.gov.bd/press/padma-rail-safety',
        publishedDate: '2026-08-27T21:15:00Z',
        evidenceType: 'Official',
        quoteSnippet: 'Padma Bridge rail network signals and operations are completely intact and on schedule.',
        supportsClaim: false,
      },
    ],
    primarySourceAvailable: true,
    conclusion: 'False. Reverse video frame inspection matched a 2023 unrelated chemical warehouse incident.',
    whyTrustedExplanation: 'Multi-frame digital video forensics verified by Bangladesh Railway chief engineering office.',
    createdAt: '2026-08-27T21:15:00Z',
    category: 'Bangladesh',
  },
  {
    id: 'fc_203',
    claim: 'Post claims drinking boiled guava leaf extract can cure chronic diabetes within 7 days with zero insulin requirement.',
    claimant: 'Alternative health pages & TikTok health influencers',
    verdict: 'MOSTLY FALSE',
    confidenceScore: 97,
    summary: 'While guava leaves contain antioxidants and preliminary in-vitro studies show mild post-meal glucose moderation, medical endocrinologists and WHO guidelines warn that it cannot replace prescribed insulin or cure diabetes.',
    assertions: [
      'Guava leaf extract permanently cures type-1 and type-2 diabetes in 7 days',
      'Patients can safely discard clinical insulin injections',
    ],
    evidences: [
      {
        sourceName: 'World Health Organization (WHO) Diabetes Clinical Protocols',
        sourceUrl: 'https://who.int/news-room/fact-sheets/detail/diabetes',
        publishedDate: '2026-08-27T18:00:00Z',
        evidenceType: 'Primary',
        quoteSnippet: 'There is no herbal cure for diabetes. Stopping prescribed therapy risks acute metabolic failure.',
        supportsClaim: false,
      },
    ],
    primarySourceAvailable: true,
    conclusion: 'Mostly False. Discontinuing prescribed insulin based on unscientific social claims presents severe acute medical hazards.',
    whyTrustedExplanation: 'Verified against peer-reviewed endocrinology literature and clinical guidelines from WHO & BIRDEM.',
    createdAt: '2026-08-27T18:00:00Z',
    category: 'Health',
  },
];

export const FALLBACK_TRENDING: TrendingTopic[] = [
  {
    id: 'tr_1',
    topic: 'Bangladesh IT Exports $2.14B',
    topicBn: 'বাংলাদেশের আইটি রপ্তানি ২.১৪ বিলিয়ন ডলার',
    category: 'Bangladesh',
    mentionCount: 1420,
    growthPercentage: 184,
    sourcesCount: 8,
    categories: ['Bangladesh', 'Technology', 'Economy'],
    keyArticles: [
      {
        id: 'art_101',
        title: 'Bangladesh IT & Software Exports Surpass Record $2 Billion Milestone',
        slug: 'bangladesh-it-exports-surpass-record-2-billion-milestone-2026',
      },
    ],
    updatedAt: '2026-08-28T01:45:00Z',
  },
  {
    id: 'tr_2',
    topic: 'DeepMind GNoME AI Discovery',
    topicBn: 'ডিপমাইন্ড ক্রিস্টাল এআই আবিষ্কার',
    category: 'Artificial Intelligence',
    mentionCount: 2890,
    growthPercentage: 142,
    sourcesCount: 12,
    categories: ['Artificial Intelligence', 'Science', 'Technology'],
    keyArticles: [
      {
        id: 'art_102',
        title: 'Google DeepMind Unveils Next-Gen AI System Capable of Autonomous Material Discovery',
        slug: 'deepmind-gemini-next-gen-autonomous-scientific-discovery',
      },
    ],
    updatedAt: '2026-08-28T01:10:00Z',
  },
  {
    id: 'tr_3',
    topic: 'Digital Taka Offline Wallet',
    topicBn: 'ডিজিটাল টাকা অফলাইন পাইলট',
    category: 'Finance & Economy',
    mentionCount: 980,
    growthPercentage: 96,
    sourcesCount: 6,
    categories: ['Finance & Economy', 'Bangladesh'],
    keyArticles: [
      {
        id: 'art_103',
        title: 'Bangladesh Bank Launches Nationwide Phase-2 Pilot for Digital Taka',
        slug: 'bangladesh-bank-digital-taka-cbdc-pilot-launch',
      },
    ],
    updatedAt: '2026-08-28T00:30:00Z',
  },
];
