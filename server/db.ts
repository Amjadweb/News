import bcrypt from 'bcryptjs';
import {
  NewsArticle,
  NewsSourceRegistry,
  FactCheckItem,
  EventGroup,
  TrendingTopic,
  AuditLog,
  SystemSetting,
  BackgroundJob,
  User,
  UserRole,
  NewsCategory,
  VerificationStatus,
} from '../src/types';

export interface UserAccount extends User {
  passwordHash: string;
}

// In-Memory Database store with persistent defaults
class TruthPulseDatabase {
  public users: UserAccount[] = [
    {
      id: 'usr_owner_1',
      name: 'Rahim Chowdhury (Chief Editor & Owner)',
      email: 'owner@truthpulse.ai',
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00Z',
      lastLoginAt: '2026-08-28T01:00:00Z',
      // Default password: "TruthPulse@2026!"
      passwordHash: bcrypt.hashSync('TruthPulse@2026!', 10),
    },
    {
      id: 'usr_editor_1',
      name: 'Tanvir Hossain (Senior Fact Checker)',
      email: 'editor@truthpulse.ai',
      role: 'EDITOR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-15T00:00:00Z',
      lastLoginAt: '2026-08-27T18:30:00Z',
      // Default password: "Editor@2026!"
      passwordHash: bcrypt.hashSync('Editor@2026!', 10),
    },
    {
      id: 'usr_analyst_1',
      name: 'Nusrat Jahan (Data & Intelligence Analyst)',
      email: 'analyst@truthpulse.ai',
      role: 'ANALYST',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-03-10T00:00:00Z',
      lastLoginAt: '2026-08-27T12:00:00Z',
      // Default password: "Analyst@2026!"
      passwordHash: bcrypt.hashSync('Analyst@2026!', 10),
    },
  ];

  public systemSettings: SystemSetting[] = [
    {
      id: 'set_1',
      key: 'AI_MODEL',
      value: 'gemini-3.7-flash',
      category: 'AI',
      description: 'Primary AI model engine used for automated claim parsing and data profiling',
      updatedAt: '2026-08-28T00:00:00Z',
      updatedBy: 'Rahim Chowdhury',
    },
    {
      id: 'set_2',
      key: 'VERIFICATION_CONFIDENCE_THRESHOLD',
      value: '80',
      category: 'Newsroom',
      description: 'Minimum AI confidence score required for auto-flagging as Mostly Verified',
      updatedAt: '2026-08-28T00:00:00Z',
      updatedBy: 'Rahim Chowdhury',
    },
    {
      id: 'set_3',
      key: 'AUTO_FETCH_INTERVAL_MINUTES',
      value: '15',
      category: 'Newsroom',
      description: 'Periodic background poll frequency across active RSS news feeds and APIs',
      updatedAt: '2026-08-28T00:00:00Z',
      updatedBy: 'Rahim Chowdhury',
    },
    {
      id: 'set_4',
      key: 'AUTO_PUBLISH_TRUSTED_ONLY',
      value: 'false',
      category: 'Newsroom',
      description: 'Strict editorial review required before public publishing (Responsible Automation rule)',
      updatedAt: '2026-08-28T00:00:00Z',
      updatedBy: 'Rahim Chowdhury',
    },
    {
      id: 'set_5',
      key: 'DEFAULT_TIMEZONE',
      value: 'Asia/Dhaka',
      category: 'General',
      description: 'Timezone for date calculations and editorial scheduling',
      updatedAt: '2026-08-28T00:00:00Z',
      updatedBy: 'Rahim Chowdhury',
    },
  ];

  public sources: NewsSourceRegistry[] = [
    {
      id: 'src_dhaka_tribune',
      name: 'Dhaka Tribune Wire',
      feedUrl: 'https://www.dhakatribune.com/feed',
      category: 'Bangladesh',
      country: 'Bangladesh',
      language: 'English',
      isActive: true,
      fetchFrequencyMinutes: 15,
      lastSuccessfulFetch: '2026-08-28T00:30:00Z',
      lastFetchAttempt: '2026-08-28T00:30:00Z',
      errorCount: 0,
      healthStatus: 'Healthy',
      totalArticlesCollected: 412,
    },
    {
      id: 'src_prothom_alo',
      name: 'Prothom Alo Online',
      feedUrl: 'https://en.prothomalo.com/feed',
      category: 'Bangladesh',
      country: 'Bangladesh',
      language: 'English',
      isActive: true,
      fetchFrequencyMinutes: 15,
      lastSuccessfulFetch: '2026-08-28T00:25:00Z',
      lastFetchAttempt: '2026-08-28T00:25:00Z',
      errorCount: 0,
      healthStatus: 'Healthy',
      totalArticlesCollected: 580,
    },
    {
      id: 'src_reuters_tech',
      name: 'Reuters Technology & AI Wire',
      feedUrl: 'https://www.reutersagency.com/feed/?taxonomy=markets&post_type=best',
      category: 'Technology',
      country: 'International',
      language: 'English',
      isActive: true,
      fetchFrequencyMinutes: 20,
      lastSuccessfulFetch: '2026-08-28T00:15:00Z',
      lastFetchAttempt: '2026-08-28T00:15:00Z',
      errorCount: 0,
      healthStatus: 'Healthy',
      totalArticlesCollected: 920,
    },
    {
      id: 'src_bbc_world',
      name: 'BBC World News Service',
      feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
      category: 'International',
      country: 'United Kingdom',
      language: 'English',
      isActive: true,
      fetchFrequencyMinutes: 20,
      lastSuccessfulFetch: '2026-08-28T00:20:00Z',
      lastFetchAttempt: '2026-08-28T00:20:00Z',
      errorCount: 0,
      healthStatus: 'Healthy',
      totalArticlesCollected: 840,
    },
    {
      id: 'src_techcrunch',
      name: 'TechCrunch AI & Enterprise',
      feedUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
      category: 'Artificial Intelligence',
      country: 'United States',
      language: 'English',
      isActive: true,
      fetchFrequencyMinutes: 30,
      lastSuccessfulFetch: '2026-08-28T00:10:00Z',
      lastFetchAttempt: '2026-08-28T00:10:00Z',
      errorCount: 0,
      healthStatus: 'Healthy',
      totalArticlesCollected: 615,
    },
    {
      id: 'src_nature_science',
      name: 'Nature Scientific Reports',
      feedUrl: 'https://www.nature.com/subjects/science/rss',
      category: 'Science',
      country: 'International',
      language: 'English',
      isActive: true,
      fetchFrequencyMinutes: 60,
      lastSuccessfulFetch: '2026-08-27T23:00:00Z',
      lastFetchAttempt: '2026-08-27T23:00:00Z',
      errorCount: 0,
      healthStatus: 'Healthy',
      totalArticlesCollected: 310,
    },
  ];

  public articles: NewsArticle[] = [
    {
      id: 'art_1',
      slug: 'bangladesh-it-exports-surpass-record-2-billion-milestone-2026',
      title: 'Bangladesh IT & Software Exports Cross Record $2.1 Billion Milestone in FY 2025-26',
      titleBn: '২০২৫-২৬ অর্থবছরে বাংলাদেশের আইটি ও সফটওয়্যার রপ্তানি রেকর্ড ২.১ বিলিয়ন ডলার ছাড়িয়েছে',
      summary: 'Official export statistics from Bangladesh Bank and BASIS confirm national ICT exports reached $2.14 billion, driven by artificial intelligence outsourcing, fintech engineering, and European cloud migration contracts.',
      summaryBn: 'বাংলাদেশ ব্যাংক এবং বেসিসের তথ্য অনুযায়ী, কৃত্রিম বুদ্ধিমত্তা আউটসোর্সিং ও ক্লাউড প্রযুক্তির চাহিদায় তথ্যপ্রযুক্তি খাতের রপ্তানি নতুন মাইলফলক অর্জন করেছে।',
      byline: 'Tanvir Hossain & Sarah Jenkins',
      bylineRole: 'Technology & Economy Intelligence Desk',
      location: 'DHAKA',
      readTimeMinutes: 5,
      contentSnippet: 'The Export Promotion Bureau (EPB) and Bangladesh Bank confirmed that aggregate IT and IT-enabled services (ITES) revenue experienced a 24.6% year-on-year expansion.',
      content: `The Export Promotion Bureau (EPB) of Bangladesh alongside the Bangladesh Bank have officially certified that the country's information and communication technology (ICT) and software export earnings surpassed $2.14 billion in the fiscal year ending June 2026. This historic achievement marks a 24.6% year-on-year surge, establishing tech engineering as Bangladesh's second most promising high-value export sector following readymade garments.

### Strategic Growth Drivers: AI and Enterprise Engineering
According to granular breakdown data provided by the Bangladesh Association of Software and Information Services (BASIS), the primary catalysts behind this unprecedented growth include:
- **Artificial Intelligence & Data Annotation Pipelines:** High-end computer vision labeling, LLM fine-tuning datasets, and specialized prompt engineering hubs situated across Dhaka, Chattogram, and Sylhet Hi-Tech Parks contributed approximately $580 million.
- **Fintech & Core Banking Transformations:** Over 45 domestic software engineering firms secured multi-year digital transformation contracts across Southeast Asia, the Gulf Cooperation Council (GCC), and East Africa.
- **European Cloud Infrastructure Migration:** Accelerated demand for DevOps, site reliability engineering (SRE), and cybersecurity audits from Scandinavian and German mid-market enterprises.

### Regional and Global Market Distribution
North America remains the largest single recipient of Bangladeshi software services, capturing 44% of total export shipments ($941 million), followed by the European Union at 32% ($685 million), East Asia (Japan and South Korea) at 14% ($300 million), and the Middle East and domestic offshore banking units making up the remaining 10%.

Industry analysts attribute this rapid adoption to Bangladesh's competitive cost-to-quality ratio, high English proficiency among urban engineering graduates, and the government's 10-year tax exemption incentive for certified IT exporters.

### Infrastructure & Talent Pipeline Expansion
The state-backed ICT Division reports that over 350,000 certified engineers and data specialists are currently active across registered technology enterprises. Recent private-public partnerships with international universities have introduced 85 specialized vocational tracks covering quantum algorithms, robotics automation, and enterprise microservices.

Officials from the Ministry of Commerce underscored that with 12 new Tier-IV datacenter corridors coming online across the country by early 2027, Bangladesh is well positioned to target its next medium-term milestone of $5.0 billion in annual software exports before 2030.`,
      contentBn: `বাংলাদেশ রপ্তানি উন্নয়ন ব্যুরো (ইপিবি) এবং বাংলাদেশ ব্যাংকের সর্বশেষ যৌথ প্রতিবেদনে আনুষ্ঠানিকভাবে নিশ্চিত করা হয়েছে যে, সদ্য সমাপ্ত ২০২৫-২৬ অর্থবছরে বাংলাদেশের তথ্য ও যোগাযোগ প্রযুক্তি (আইসিটি) এবং সফটওয়্যার খাতের রপ্তানি আয় ২.১৪ বিলিয়ন (২১৪ কোটি) মার্কিন ডলারের ঐতিহাসিক মাইলফলক অতিক্রম করেছে। এটি বিগত অর্থবছরের তুলনায় ২৪.৬ শতাংশ বেশি প্রবৃদ্ধি নির্দেশ করে।

### প্রবৃদ্ধির মূল চালিকাশক্তি ও খাতভিত্তিক বিশ্লেষণ
বাংলাদেশ অ্যাসোসিয়েশন অব সফটওয়্যার অ্যান্ড ইনফরমেশন সার্ভিসেস (বেসিস)-এর তথ্য অনুযায়ী, এই অভাবনীয় সাফল্যের পেছনে কয়েকটি সুনির্দিষ্ট খাত মুখ্য ভূমিকা পালন করেছে:
- **কৃত্রিম বুদ্ধিমত্তা ও ডেটা অ্যানোটেশন:** আন্তর্জাতিক মডেল ফাইন-টিউনিং, কম্পিউটার ভিশন ডেটা লেবেলিং এবং এআই ইঞ্জিনিয়ারিং সেবা থেকে প্রায় ৫৮ কোটি ডলার অর্জিত হয়েছে।
- **ফিনটেক ও ব্যাংকিং সফটওয়্যার:** মধ্যপ্রাচ্য, দক্ষিণ-পূর্ব এশিয়া এবং আফ্রিকার ১৫টিরও বেশি দেশে বাংলাদেশের ৪২টি সফটওয়্যার প্রতিষ্ঠান কোর ব্যাংকিং সলিউশন সরবরাহ করেছে।
- **ক্লাউড মাইগ্রেশন ও সাইবার সিকিউরিটি:** ইউরোপীয় ইউনিয়নভুক্ত দেশগুলোতে ক্লাউড অবকাঠামো রূপান্তর ও সাইবার সুরক্ষায় বাংলাদেশি ডেভেলপারদের চাহিদা উল্লেখযোগ্য হারে বৃদ্ধি পেয়েছে।

### আন্তর্জাতিক বাজার বিভাজন
রপ্তানিকৃত আইটি সেবার একক বৃহত্তম বাজার হিসেবে উত্তর আমেরিকা শীর্ষে রয়েছে (৪৪% বা প্রায় ৯৪ কোটি ডলার)। এরপরই রয়েছে ইউরোপীয় ইউনিয়ন (৩২% বা প্রায় ৬৮ কোটি ডলার), পূর্ব এশিয়া (১৪% বা প্রায় ৩০ কোটি ডলার) এবং অবশিষ্ট অংশ মধ্যপ্রাচ্যের বাজারে রপ্তানি হয়েছে।

### দক্ষ জনশক্তি ও ভবিষ্যৎ রূপরেখা
বর্তমানে সারা দেশে নিবন্ধিত আইটি প্রতিষ্ঠানে সাড়ে তিন লক্ষাধিক দক্ষ প্রকৌশলী কর্মরত আছেন। হাই-টেক পার্কগুলোতে নিরবচ্ছিন্ন বিদ্যুৎ, দ্রুতগতির ফাইবার অপটিক ইন্টারনেট এবং সরকারি কর অবকাশ সুবিধার ফলে বৈশ্বিক প্রযুক্তি প্রতিষ্ঠানগুলো এখন বাংলাদেশে তাদের ব্যাক-অফিস ও গবেষণা কেন্দ্র স্থাপন করছে। সরকারের লক্ষ্যমাত্রা হলো ২০৩০ সালের মধ্যে এই রপ্তানি আয় ৫ বিলিয়ন ডলারে উন্নীত করা।`,
      analysis: {
        author: 'Dr. Mahfuzur Rahman',
        role: 'Chief Economic & Tech Analyst, Policy Research Forum',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        text: 'Crossing the $2 billion threshold represents a qualitative shift for Bangladesh. The transition from basic call centers to high-margin LLM fine-tuning and enterprise fintech platforms proves that Bangladesh has broken through the low-value trap in South Asian tech services.',
        textBn: '২ বিলিয়ন ডলারের সীমা অতিক্রম করা বাংলাদেশের জন্য এক গুণগত পরিবর্তন। সাধারণ কল সেন্টার সেবা থেকে জটিল এআই মডেল টিউনিং ও আন্তর্জাতিক ফিনটেক অবকাঠামো নির্মাণে প্রবেশ প্রমাণ করে যে বাংলাদেশ প্রযুক্তি খাতে উচ্চমূল্যের বৈশ্বিক বাজারে স্থায়ী অবস্থান তৈরি করেছে।'
      },
      quotes: [
        {
          speaker: 'Russell T. Ahmed',
          title: 'President, BASIS',
          quote: 'Our engineering workforce has demonstrated world-class capability in algorithmic engineering and cloud architecture. This $2.14B milestone is merely the baseline of what our tech youth can achieve.',
          quoteBn: 'আমাদের প্রকৌশলীরা বৈশ্বিক মানে অ্যালগরিদমিক সফটওয়্যার ও ক্লাউড প্রযুক্তিতে দক্ষতা প্রমাণ করেছেন। এই ২.১৪ বিলিয়ন ডলার আমাদের যুব সমাজের সম্ভাবনার সূচনা মাত্র।'
        },
        {
          speaker: 'Abdur Rouf Talukder',
          title: 'Governor / Central Bank Representative',
          quote: 'Repatriation channels have been streamlined, giving tech exporters 100% foreign currency account retention flexibility, which fundamentally spurred this registered formal inflow.',
          quoteBn: 'আইটি খাতের জন্য শতভাগ বৈদেশিক মুদ্রা রিটেনশন সুবিধা ও সহজ রেমিট্যান্স প্রক্রিয়া আনুষ্ঠানিক চ্যানেলে রেকর্ড পরিমাণ ডলার আয়ে ভূমিকা রেখেছে।'
        }
      ],
      fullCoverageSources: [
        {
          id: 'cov_1',
          name: 'The Daily Star',
          domain: 'thedailystar.net',
          url: 'https://thedailystar.net/business/news/it-exports-surpass-2b-record',
          headline: 'ICT exports create history by scaling beyond $2 billion mark',
          headlineBn: '২ বিলিয়ন ডলারের মাইলফলক ছাড়িয়ে তথ্যপ্রযুক্তি রপ্তানিতে নতুন ইতিহাস',
          snippet: 'Industry insiders call for zero-duty hardware component imports to maintain the 24% acceleration trajectory into the upcoming fiscal year.',
          snippetBn: 'প্রবৃদ্ধির এই ধারা অব্যাহত রাখতে হার্ডওয়্যার যন্ত্রাংশ আমদানিতে শুল্কমুক্ত সুবিধা অব্যাহত রাখার দাবি জানিয়েছে প্রযুক্তি মহল।',
          publishedAt: '2026-08-27T19:30:00Z',
          stance: 'supporting',
          reliabilityScore: 94
        },
        {
          id: 'cov_2',
          name: 'Prothom Alo',
          domain: 'prothomalo.com',
          url: 'https://prothomalo.com/business/bangladesh-it-export-growth',
          headline: 'আইটি খাতের রপ্তানি আয়ে উল্লম্ফন: ২১৪ কোটি ডলারের নতুন রেকর্ড',
          headlineBn: 'আইটি খাতের রপ্তানি আয়ে উল্লম্ফন: ২১৪ কোটি ডলারের নতুন রেকর্ড',
          snippet: 'কৃত্রিম বুদ্ধিমত্তা ও ডেটা প্রসেসিংয়ে বাংলাদেশি ফ্রিল্যান্সার ও কোম্পানিগুলোর আন্তর্জাতিক গ্রহণযোগ্যতা এই সাফল্যের অন্যতম ভিত্তি।',
          snippetBn: 'কৃত্রিম বুদ্ধিমত্তা ও ডেটা প্রসেসিংয়ে বাংলাদেশি ফ্রিল্যান্সার ও কোম্পানিগুলোর আন্তর্জাতিক গ্রহণযোগ্যতা এই সাফল্যের অন্যতম ভিত্তি।',
          publishedAt: '2026-08-27T20:15:00Z',
          stance: 'supporting',
          reliabilityScore: 95
        },
        {
          id: 'cov_3',
          name: 'Reuters World Wire',
          domain: 'reuters.com',
          url: 'https://reuters.com/markets/asia/bangladesh-tech-exports-surge-2026',
          headline: 'Bangladesh Emerges as Fast-Growing South Asian Hub for Enterprise AI Engineering',
          headlineBn: 'দক্ষিণ এশিয়ার দ্রুত বর্ধনশীল এআই ইঞ্জিনিয়ারিং হাব হিসেবে বাংলাদেশের আত্মপ্রকাশ',
          snippet: 'Global technology conglomerates diversify software outsourcing hubs into Dhaka amidst favorable demographic engineering dividends.',
          snippetBn: 'দক্ষ যুব জনশক্তির সুবিধার কারণে আন্তর্জাতিক টেক জায়ান্টরা ঢাকায় তাদের সফটওয়্যার আউটসোর্সিং বৃদ্ধি করছে।',
          publishedAt: '2026-08-27T21:00:00Z',
          stance: 'supporting',
          reliabilityScore: 97
        },
        {
          id: 'cov_4',
          name: 'Financial Express Bangladesh',
          domain: 'thefinancialexpress.com.bd',
          url: 'https://thefinancialexpress.com.bd/trade/ict-macro-balance',
          headline: 'Service Trade Balance Strengthens on Robust Tech Currency Inflows',
          headlineBn: 'তথ্যপ্রযুক্তির ডলার আয়ে বৈদেশিক বাণিজ্য ভারসাম্যে স্বস্তি',
          snippet: 'Central bank reserves gain durable cushion as formal channel documentation for digital earnings improves to 91%.',
          snippetBn: 'ডিজিটাল সেবার ৯১% আনুষ্ঠানিক ব্যাংকিং চ্যানেলে আসায় দেশের বৈদেশিক মুদ্রার রিজার্ভে ইতিবাচক প্রভাব পড়ছে।',
          publishedAt: '2026-08-27T21:40:00Z',
          stance: 'supporting',
          reliabilityScore: 92
        }
      ],
      category: 'Bangladesh',
      tags: ['Bangladesh', 'IT Export', 'Economy', 'BASIS', 'Technology', 'AI', 'Dhaka'],
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'High-tech IT workspace in Dhaka Silicon enclave',
      publishedAt: '2026-08-28T00:15:00Z',
      updatedAt: '2026-08-28T00:25:00Z',
      retrievedAt: '2026-08-28T00:10:00Z',
      status: 'Published',
      verificationStatus: 'Verified',
      confidenceScore: 94,
      importanceScore: 92,
      viewsCount: 3420,
      isBreaking: true,
      isTrending: true,
      isEditorPick: true,
      primarySource: {
        id: 'src_epb',
        name: 'Export Promotion Bureau Bangladesh',
        url: 'https://epb.gov.bd/reports/ict-2026',
        originalUrl: 'https://epb.gov.bd/reports/ict-2026',
        publisher: 'Ministry of Commerce, Bangladesh',
        domain: 'epb.gov.bd',
        publishedAt: '2026-08-27T18:00:00Z',
        retrievedAt: '2026-08-28T00:10:00Z',
        sourceType: 'Government Source',
        reliabilityScore: 96,
        isPrimary: true,
        biasRating: 'Official Agency',
      },
      sourceComparison: {
        totalChecked: 7,
        supporting: 6,
        conflicting: 0,
        primarySourceAvailable: true,
        sources: [
          {
            id: 's1',
            name: 'Bangladesh Bank Quarterly Review',
            url: 'https://bb.org.bd/pub/2026',
            publisher: 'Central Bank',
            domain: 'bb.org.bd',
            publishedAt: '2026-08-27T19:00:00Z',
            retrievedAt: '2026-08-28T00:10:00Z',
            sourceType: 'Official API',
            reliabilityScore: 98,
          },
          {
            id: 's2',
            name: 'BASIS Industry Intelligence',
            url: 'https://basis.org.bd/stats',
            publisher: 'BASIS',
            domain: 'basis.org.bd',
            publishedAt: '2026-08-27T20:00:00Z',
            retrievedAt: '2026-08-28T00:10:00Z',
            sourceType: 'Verified Outlet',
            reliabilityScore: 92,
          },
          {
            id: 's3',
            name: 'The Financial Express Bangladesh',
            url: 'https://thefinancialexpress.com.bd/trade/it-growth',
            publisher: 'Financial Express',
            domain: 'thefinancialexpress.com.bd',
            publishedAt: '2026-08-27T21:00:00Z',
            retrievedAt: '2026-08-28T00:10:00Z',
            sourceType: 'RSS Feed',
            reliabilityScore: 90,
          },
        ],
      },
      keyFacts: [
        'Total IT/ITES export earnings reached $2.14 billion in the fiscal year ending June 2026.',
        'Represents a 24.6% year-on-year surge compared to the prior fiscal period.',
        'Top foreign markets: North America (44%), European Union (32%), and East Asia (14%).',
        'Over 350,000 certified tech engineers actively engaged in registered export firms.',
      ],
      extractedClaims: [
        {
          id: 'cl_1',
          claim: 'Export value reached $2.14 billion as documented by EPB and Central Bank.',
          confidence: 96,
          evidenceStatus: 'supported',
          evidenceSnippet: 'Validated via EPB bulletin table 4.2 and BB currency inflows.',
        },
        {
          id: 'cl_2',
          claim: 'Growth rate was 24.6% year-on-year.',
          confidence: 94,
          evidenceStatus: 'supported',
          evidenceSnippet: 'Math matches previous baseline of $1.717B in FY2024-25.',
        },
      ],
      timeline: [
        {
          date: '2026-08-27',
          time: '18:00 BST',
          title: 'EPB Releases Fiscal Trade Summary',
          description: 'Official statistical publication confirming quarterly trade metrics.',
          sourceName: 'EPB',
        },
        {
          date: '2026-08-27',
          time: '20:30 BST',
          title: 'BASIS Convenes Press Briefing in Dhaka',
          description: 'Industry leaders detail breakdown of software engineering versus BPO services.',
          sourceName: 'BASIS',
        },
        {
          date: '2026-08-28',
          time: '00:15 BST',
          title: 'TruthPulse AI Synthesizes Cross-Agency Ledger',
          description: 'Full multi-source reconciliation published with confidence score 94%.',
          sourceName: 'TruthPulse AI',
        },
      ],
      entities: {
        organizations: ['Export Promotion Bureau', 'Bangladesh Bank', 'BASIS'],
        locations: ['Dhaka', 'Bangladesh'],
        numbers: ['$2.14 Billion', '24.6%', '350,000'],
        dates: ['FY 2025-26', 'August 2026'],
      },
      eventGroupId: 'grp_101',
    },
    {
      id: 'art_2',
      slug: 'global-ai-treaty-signed-geneva-autonomous-safeguards',
      title: '64 Nations Ratify Comprehensive Geneva Accord on Autonomous AI Safeguards',
      titleBn: 'জেনেভায় ৬৪ দেশের স্বাক্ষরে স্বয়ংক্রিয় এআই নিরাপত্তা চুক্তি চূড়ান্ত',
      summary: 'Delegates from 64 nations finalized binding international protocols establishing algorithmic transparency, auditability benchmarks for frontier reasoning models, and strict restrictions on autonomous warfare modules.',
      summaryBn: 'এআই নিরাপত্তা নিশ্চিত করতে জেনেভায় ঐতিহাসিক আন্তর্জাতিক চুক্তি স্বাক্ষরিত হয়েছে যাতে মডেল নিরীক্ষা ও স্বচ্ছতার নিয়ম অন্তর্ভুক্ত।',
      byline: 'Elena Rostova & David Vance',
      bylineRole: 'Global Governance & AI Ethics Correspondents',
      location: 'GENEVA',
      readTimeMinutes: 6,
      contentSnippet: 'The treaty establishes an International AI Safety Inspectorate headquartered in Geneva with mandatory disclosure protocols for compute clusters exceeding 10^26 FLOPs.',
      content: `In what diplomatic observers are calling the most pivotal technological accord since the Nuclear Non-Proliferation Treaty, delegates representing 64 sovereign nations concluded the week-long Geneva Summit on Frontier Artificial Intelligence by formally ratifying the Geneva AI Safeguards Accord of 2026.

The legally binding treaty creates an unprecedented multilateral framework to supervise frontier reasoning models, prohibit unconstrained lethal autonomous weapon systems (LAWS), and mandate cross-border algorithmic safety audits.

### Core Pillars of the Geneva Accord
1. **The 10^26 FLOP Compute Threshold:** Any AI training run utilizing aggregate compute exceeding 10^26 floating-point operations must submit to pre-deployment stress testing, red-teaming evaluations, and biological risk assessments.
2. **Establishment of the International AI Safety Inspectorate (IAISI):** Headquartered in Geneva with regional nodes in Tokyo, London, and Washington, the newly created UN-affiliated agency is granted rights to inspect frontier data center clusters and examine model weights for catastrophic biological, chemical, or cyber warfare capabilities.
3. **Mandatory Algorithmic Watermarking & Provenance:** Commercial generative systems generating synthetic media, audio cloning, or reasoning outputs must inject cryptographically verifiable C2PA-compliant provenance metadata.
4. **Human-in-the-Loop Safeguards:** Absolute prohibition on sovereign militaries delegating final launch authority for kinetic or nuclear weapons systems to autonomous reasoning agents.

### Geopolitical Stances and Corporate Reactions
The summit witnessed intense deliberations between Western democracies advocating for strict existential risk mitigation and emerging economies demanding unrestricted access to open-source foundation models for economic development.

A compromise clause guarantees developing nations access to compute subsidies and scientific model checkpoints provided they comply with civilian safety registration protocols.

Key technology industry leaders present at the Palais des Nations, including chief scientists from leading American, European, and Asian AI labs, expressed broad consensus, noting that harmonized international benchmarks alleviate regulatory fragmentation across jurisdictions.`,
      contentBn: `সুইজারল্যান্ডের জেনেভায় জাতিসংঘের প্যালেস দে নেশনস-এ দীর্ঘ আলোচনার পর ৬৪টি দেশের প্রতিনিধিরা কৃত্রিম বুদ্ধিমত্তার (এআই) ঝুঁকি নিয়ন্ত্রণ ও সামরিক ব্যবহারে বিধিনিষেধ আরোপে ঐতিহাসিক জেনেভা এআই নিরাপত্তা চুক্তি ২০২৬ স্বাক্ষর করেছেন।

আন্তর্জাতিক বিশ্লেষকরা এটিকে প্রযুক্তি ক্ষেত্রে পারমাণবিক নিরস্ত্রীকরণ চুক্তির পর সবচেয়ে যুগান্তকারী আন্তর্জাতিক ঐকমত্য হিসেবে আখ্যা দিচ্ছেন।

### চুক্তির মূল বিধান ও শর্তসমূহ
১. **আন্তর্জাতিক এআই নিরাপত্তা পরিদর্শন সংস্থা (IAISI):** জেনেভায় সদর দফতর স্থাপন করে একটি নিরপেক্ষ পরিদর্শন সংস্থা গঠিত হচ্ছে, যারা বৃহৎ ফ্রন্টিয়ার মডেলগুলোর বায়োলজিক্যাল ও সাইবার ঝুঁকি যাচাই করার এখতিয়ার রাখবে।
২. **কম্পিউট ক্ষমতা নিরীক্ষা:** ১০^২৬ এফএলওপি (FLOP)-এর অধিক ক্ষমতাসম্পন্ন যেকোনো এআই প্রশিক্ষণ শুরু করার পূর্বে বাধ্যতামূলক আন্তর্জাতিক সুরক্ষা রিপোর্ট জমা দিতে হবে।
৩. **অটোনোমাস অস্ত্রে মানুষের চূড়ান্ত নিয়ন্ত্রণ:** কোনো দেশের সেনাবাহিনী সম্পূর্ণ স্বয়ংক্রিয় এআই সিস্টেমের হাতে মারণাস্ত্র প্রয়োগ বা পারমাণবিক কমান্ড হস্তান্তরের অনুমতি পাবে না।
৪. **ডিজিটাল কনটেন্ট ও ডিপফেক ট্র্যাকিং:** বাণিজ্যিক কৃত্রিম বুদ্ধিমত্তা কনটেন্টে ক্রিপ্টোগ্রাফিক ওয়াটারমার্কিং বাধ্যতামূলক করা হয়েছে যাতে বিভ্রান্তিকর তথ্য প্রচার রোধ করা যায়।

### বৈশ্বিক প্রতিক্রিয়া
উন্নত ও উন্নয়নশীল দেশগুলোর মধ্যে ফলপ্রসূ সমঝোতার মাধ্যমে চুক্তিটি অনুমোদিত হয়েছে। চুক্তির ফলে উন্নয়নশীল দেশগুলো যাতে গবেষণা ও অর্থনৈতিক প্রবৃদ্ধির স্বার্থে ওপেন-সোর্স এআই প্রযুক্তির ন্যায্য সুবিধা পায়, সে বিষয়ে বিশেষ আন্তর্জাতিক তহবিলের ব্যবস্থা রাখা হয়েছে।`,
      analysis: {
        author: 'Prof. Julian Sterling',
        role: 'Director, Center for Frontier Technology Governance, Oxford',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        text: 'The treaty strikes a pragmatic middle ground between innovation and existential risk containment. The 10^26 FLOP threshold protects scientific research while ensuring catastrophic dual-use capabilities are subject to multi-nation oversight.',
        textBn: 'এই চুক্তিটি প্রযুক্তির উদ্ভাবনী অগ্রগতি বজায় রেখে সম্ভাব্য মহাবিপর্যয়মূলক ঝুঁকি রোধে একটি ভারসাম্যপূর্ণ কাঠামো প্রদান করেছে। গবেষণাকে উন্মুক্ত রেখে বৃহৎ ফ্রন্টিয়ার মডেলের অপব্যবহার রুখতে এটি কার্যকর ভূমিকা রাখবে।'
      },
      quotes: [
        {
          speaker: 'Amandeep Singh Gill',
          title: 'UN Secretary-General Envoy on Technology',
          quote: 'We have proven today that international multilateralism can keep pace with exponential technological change before irreversible harms manifest.',
          quoteBn: 'আমরা প্রমাণ করেছি যে প্রযুক্তিগত দ্রুতগতির পরিবর্তনের সাথে তাল মিলিয়ে আন্তর্জাতিক ঐকমত্য অর্জন ও বৈশ্বিক নিরাপত্তা নিশ্চিত করা সম্ভব।'
        },
        {
          speaker: 'Dr. Yann LeCun / Representative',
          title: 'Chief AI Scientist, Open Foundation Consortium',
          quote: 'Safeguarding open-source scientific weights in the treaty text is a monumental victory for global academic equity and decentralization.',
          quoteBn: 'চুক্তিতে মুক্ত বিজ্ঞান ও ওপেন সোর্স গবেষণাকে সুরক্ষিত রাখা বিশ্বব্যাপী মেধার সমবণ্টনের জন্য এক বিরাট জয়।'
        }
      ],
      fullCoverageSources: [
        {
          id: 'cov_bbc_treaty',
          name: 'BBC World News',
          domain: 'bbc.co.uk',
          url: 'https://bbc.com/news/world-tech-geneva-treaty',
          headline: 'Geneva AI summit ends with historic 64-nation safety pact',
          headlineBn: 'জেনেভা এআই সম্মেলনে ৬৪ দেশের ঐতিহাসিক নিরাপত্তা চুক্তি স্বাক্ষরিত',
          snippet: 'Diplomats praise unprecedented consensus on weaponized AI limits while enforcement mechanisms face rigorous future tests.',
          snippetBn: 'সামরিক এআই নিয়ন্ত্রণে নজিরবিহীন ঐকমত্য অর্জিত হলেও এর বাস্তবায়ন প্রক্রিয়া কঠিন চ্যালেঞ্জের মুখে পড়তে পারে বলে মত বিশেষজ্ঞদের।',
          publishedAt: '2026-08-27T21:30:00Z',
          stance: 'supporting',
          reliabilityScore: 96
        },
        {
          id: 'cov_reuters_treaty',
          name: 'Reuters Technology Wire',
          domain: 'reuters.com',
          url: 'https://reuters.com/technology/global-ai-treaty-signed-2026',
          headline: '64 Countries Agree to International AI Inspectorate in Geneva Protocol',
          headlineBn: 'আন্তর্জাতিক এআই পরিদর্শন সংস্থা প্রতিষ্ঠায় ৬৪ দেশের সম্মতি',
          snippet: 'Treaty mandates red-team audits for frontier models before commercial cloud deployment across member states.',
          snippetBn: 'সদস্য দেশগুলোতে বাণিজ্যিক ব্যবহারের আগে উন্নত এআই মডেলের সুরক্ষায় রেড-টিম অডিট বাধ্যতামূলক করা হয়েছে।',
          publishedAt: '2026-08-27T21:45:00Z',
          stance: 'supporting',
          reliabilityScore: 98
        },
        {
          id: 'cov_techcrunch_treaty',
          name: 'TechCrunch Global',
          domain: 'techcrunch.com',
          url: 'https://techcrunch.com/2026/08/27/geneva-ai-accord-what-it-means-for-startups',
          headline: 'What the Geneva AI Accord Means for Foundation Model Startups',
          headlineBn: 'এআই স্টার্টআপ ও ডেভেলপারদের জন্য জেনেভা চুক্তির তাৎপর্য',
          snippet: 'Small and medium AI labs exempted from heavy regulatory reporting unless scaling past the global compute ceiling.',
          snippetBn: 'ক্ষুদ্র ও মাঝারি এআই ল্যাবগুলোকে জটিল লাইসেন্সিং শর্তের বাইরে রেখে কেবল অতিবৃহৎ মডেলগুলোতে এই তদারকি প্রযোজ্য রাখা হয়েছে।',
          publishedAt: '2026-08-27T22:10:00Z',
          stance: 'neutral',
          reliabilityScore: 91
        }
      ],
      category: 'Artificial Intelligence',
      tags: ['AI', 'Treaty', 'Geneva', 'Global Governance', 'Frontier AI', 'UN'],
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Plenary hall at the International AI Safety Summit in Geneva',
      publishedAt: '2026-08-27T22:30:00Z',
      updatedAt: '2026-08-27T23:00:00Z',
      retrievedAt: '2026-08-27T22:00:00Z',
      status: 'Published',
      verificationStatus: 'Verified',
      confidenceScore: 92,
      importanceScore: 96,
      viewsCount: 5210,
      isBreaking: false,
      isTrending: true,
      isEditorPick: true,
      primarySource: {
        id: 'src_geneva_wire',
        name: 'UN Office for Digital Affairs',
        url: 'https://un.org/digital/geneva-ai-treaty-2026',
        publisher: 'United Nations',
        domain: 'un.org',
        publishedAt: '2026-08-27T21:00:00Z',
        retrievedAt: '2026-08-27T22:00:00Z',
        sourceType: 'Government Source',
        reliabilityScore: 98,
        isPrimary: true,
      },
      sourceComparison: {
        totalChecked: 9,
        supporting: 8,
        conflicting: 1,
        primarySourceAvailable: true,
        sources: [
          {
            id: 's_bbc',
            name: 'BBC World News',
            url: 'https://bbc.com/news/tech-treaty',
            publisher: 'BBC',
            domain: 'bbc.co.uk',
            publishedAt: '2026-08-27T21:30:00Z',
            retrievedAt: '2026-08-27T22:00:00Z',
            sourceType: 'Verified Outlet',
            reliabilityScore: 94,
          },
          {
            id: 's_reuters',
            name: 'Reuters World Wire',
            url: 'https://reuters.com/tech/ai-accord',
            publisher: 'Reuters',
            domain: 'reuters.com',
            publishedAt: '2026-08-27T21:45:00Z',
            retrievedAt: '2026-08-27T22:00:00Z',
            sourceType: 'Verified Outlet',
            reliabilityScore: 96,
          },
        ],
      },
      keyFacts: [
        '64 sovereign signatory states committed to mandatory red-teaming standards.',
        'Established International AI Safety Inspectorate for multi-national model validation.',
        'Ratified clause prohibiting fully autonomous lethality authorization.',
      ],
      extractedClaims: [
        {
          id: 'cl_201',
          claim: '64 countries ratified the accord in Geneva plenary session.',
          confidence: 98,
          evidenceStatus: 'supported',
          evidenceSnippet: 'Official voting roster signed and posted to UN depository.',
        },
      ],
      eventGroupId: 'grp_102',
    },
    {
      id: 'art_3',
      slug: 'solar-energy-grid-expansion-chattogram-megawatt-milestone',
      title: 'Chattogram 400MW Floating Solar Facility Connected to Bangladesh National Grid',
      titleBn: 'চট্টগ্রামে ৪০০ মেগাওয়াট ভাসমান সৌর বিদ্যুৎকেন্দ্র জাতীয় গ্রিডে যুক্ত',
      summary: 'The largest floating photovoltaic project in South Asia has commenced commercial power distribution to the national electrical grid in Chattogram, offsetting an estimated 520,000 tons of carbon emissions annually.',
      summaryBn: 'দক্ষিণ এশিয়ার সর্ববৃহৎ ভাসমান সৌর বিদ্যুৎকেন্দ্র থেকে চট্টগ্রামে জাতীয় গ্রিডে বিদ্যুৎ সরবরাহ শুরু হয়েছে।',
      byline: 'Fariha Yasmin & Rafiqul Islam',
      bylineRole: 'Energy & Climate Transitions Bureau',
      location: 'CHATTOGRAM',
      readTimeMinutes: 4,
      contentSnippet: 'Power Grid Company of Bangladesh (PGCB) confirmed smooth frequency synchronization across the 230kV substation line.',
      content: `The Power Grid Company of Bangladesh (PGCB) and the Ministry of Power, Energy and Mineral Resources have announced the commercial synchronization of South Asia's largest floating solar power station—a 400-megawatt (MW) photovoltaic installation spanning the water surface of the Kaptai reservoir corridor in Chattogram division.

The landmark clean energy infrastructure is engineered to deliver over 620 gigawatt-hours (GWh) of renewable electricity annually into the national transmission network, enough to reliably power approximately 320,000 households while conserving valuable agricultural arable land.

### Engineering & Environmental Highlights
- **High-Density Water-Cooling Efficiency:** Floating photovoltaic panels operate at 12% to 15% lower temperatures compared to land-based arrays due to water evaporation convection, increasing overall power generation efficiency.
- **Reservoir Water Conservation:** By shading large surface tracts of the reservoir, the installation is projected to reduce natural water evaporation by 48 million cubic meters annually, preserving freshwater reserves for downstream agricultural irrigation.
- **Carbon Offset & Fossil Displacement:** Displaces approximately 520,000 metric tons of carbon dioxide equivalent annually, reducing national reliance on imported liquified natural gas (LNG) and furnace oil.

### Financing & Future Scaling
Constructed over a 26-month timeline with concessional co-financing from the Asian Development Bank (ADB), the Asian Infrastructure Investment Bank (AIIB), and domestic commercial green bonds, the project utilized high-grade anti-corrosive anchoring systems capable of withstanding monsoon water level fluctuations of up to 9 meters.

PGCB officials confirmed that frequency synchronization at the Hathazari 230kV high-voltage substation completed with zero grid harmonics disruption, marking a decisive milestone toward Bangladesh's target of generating 20% of total electrical power from renewable sources by 2030.`,
      contentBn: `চট্টগ্রাম অঞ্চলের কাপ্তাই লেকের জলসীমার ওপর নির্মিত দক্ষিণ এশিয়ার সর্ববৃহৎ ৪০০ মেগাওয়াট ক্ষমতাসম্পন্ন ভাসমান সৌর বিদ্যুৎকেন্দ্র থেকে আনুষ্ঠানিকভাবে জাতীয় বিদ্যুৎ গ্রিডে বাণিজ্যিক বিদ্যুৎ সরবরাহ শুরু হয়েছে।

পাওয়ার গ্রিড কোম্পানি অব বাংলাদেশ (পিজিসিবি) এবং বিদ্যুৎ, জ্বালানি ও খনিজ সম্পদ মন্ত্রণালয় যৌথভাবে এই ঐতিহাসিক সাফল্যের ঘোষণা দিয়েছে।

### প্রকৌশলগত ও পরিবেশগত সুবিধা
- **উচ্চ কার্যক্ষমতা:** পানির শীতল প্রভাবের কারণে স্বাভাবিক ভূমিতে স্থাপিত সৌর প্যানেলের তুলনায় ভাসমান প্যানেল থেকে ১২ থেকে ১৫ শতাংশ বেশি বিদ্যুৎ উৎপাদিত হয়।
- **কৃষি জমির সাশ্রয়:** নদীমাতৃক দেশে মূল্যবান ফসলি জমি নষ্ট না করে জলাশয়ের উপরিভাগ ব্যবহারের মাধ্যমে এই সুবিশাল বিদ্যুৎকেন্দ্র তৈরি করা হয়েছে।
- **বাৎসরিক কার্বন নিঃসরণ হ্রাস:** এই প্রকল্প থেকে বছরে প্রায় ৫ লাখ ২০ হাজার টন কার্বন নিঃসরণ কমবে এবং বছরে প্রায় ৩ লাখ ২০ হাজার পরিবারকে পরিবেশবান্ধব বিদ্যুৎ সরবরাহ করা সম্ভব হবে।

### অর্থায়ন ও জাতীয় গ্রিডের অগ্রগতি
এশিয়ান ডেভেলপমেন্ট ব্যাংক (এডিবি) এবং দেশীয় গ্রিন বন্ডের অর্থায়নে নির্মিত এই প্রকল্পে অত্যাধুনিক ফ্লোটিং পন্টুন ও টাইফুন-সহনশীল নোঙর প্রযুক্তি ব্যবহার করা হয়েছে। হাটহাজারী ২৩০ কেভি সাবস্টেশনের মাধ্যমে এই বিদ্যুৎ জাতীয় গ্রিডে নির্বিঘ্নে সঞ্চালিত হচ্ছে।`,
      analysis: {
        author: 'Engr. Nurul Alam Chowdhury',
        role: 'Senior Renewable Energy Specialist, SREDA',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        text: 'Floating solar solves Bangladesh’s core renewable dilemma: land scarcity. Demonstrating 400MW scalability on water reservoirs unlocks immense replication potential across the country’s vast coastal polders and wetlands.',
        textBn: 'ভাসমান সৌর প্রযুক্তি বাংলাদেশের জমির স্বল্পতাজনিত সংকট দূর করতে সবচেয়ে কার্যকর উপায়। কাপ্তাইয়ে ৪০০ মেগাওয়াটের এই সাফল্য দেশের অন্যান্য জলাশয়েও সৌর প্রকল্পের নতুন দিগন্ত উন্মোচন করবে।'
      },
      quotes: [
        {
          speaker: 'Engr. Golam Kibria',
          title: 'Managing Director, PGCB',
          quote: 'The 230kV transmission link achieved instantaneous phase synchronization within 40 milliseconds, proving the technical stability of massive floating solar arrays.',
          quoteBn: '২৩০ কেভি সঞ্চালন লাইনে মাত্র ৪০ মিলিসেকেন্ডের মধ্যে নিখুঁত ফ্রিকোয়েন্সি সিঙ্ক্রোনাইজেশন সম্পন্ন হয়েছে, যা আমাদের গ্রিডের সক্ষমতা প্রমাণ করে।'
        }
      ],
      fullCoverageSources: [
        {
          id: 'cov_ds_solar',
          name: 'The Daily Star',
          domain: 'thedailystar.net',
          url: 'https://thedailystar.net/business/news/chattogram-floating-solar-grid-connected',
          headline: 'South Asia’s Largest Floating Solar Plant Begins Power Delivery',
          headlineBn: 'দক্ষিণ এশিয়ার সর্ববৃহৎ ভাসমান সৌর কেন্দ্র থেকে জাতীয় গ্রিডে বিদ্যুৎ সঞ্চালন শুরু',
          snippet: 'Clean energy milestone praised by climate scientists as a masterstroke against land scarcity constraints in South Asia.',
          snippetBn: 'জমি সাশ্রয় করে পরিবেশবান্ধব বিদ্যুৎ উৎপাদনের এক যুগান্তকারী উদাহরণ হিসেবে প্রকল্পটিকে অভিহিত করেছেন পরিবেশবিদরা।',
          publishedAt: '2026-08-27T17:00:00Z',
          stance: 'supporting',
          reliabilityScore: 95
        },
        {
          id: 'cov_prothom_solar',
          name: 'Prothom Alo',
          domain: 'prothomalo.com',
          url: 'https://prothomalo.com/bangladesh/chattogram-solar-milestone',
          headline: 'চট্টগ্রামে ৪০০ মেগাওয়াট ভাসমান সৌর বিদ্যুৎকেন্দ্র চালু: ৩ লাখ পরিবার পাবে আলো',
          headlineBn: 'চট্টগ্রামে ৪০০ মেগাওয়াট ভাসমান সৌর বিদ্যুৎকেন্দ্র চালু: ৩ লাখ পরিবার পাবে আলো',
          snippet: 'পরিবেশ সুরক্ষার পাশাপাশি কাপ্তাই হ্রদের বাষ্পীভবন রোধেও কার্যকর ভূমিকা রাখবে এই সৌর প্যানেল প্রকল্প।',
          snippetBn: 'পরিবেশ সুরক্ষার পাশাপাশি কাপ্তাই হ্রদের বাষ্পীভবন রোধেও কার্যকর ভূমিকা রাখবে এই সৌর প্যানেল প্রকল্প।',
          publishedAt: '2026-08-27T17:20:00Z',
          stance: 'supporting',
          reliabilityScore: 94
        }
      ],
      category: 'Environment',
      tags: ['Environment', 'Renewable Energy', 'Solar', 'Chattogram', 'Bangladesh', 'Kaptai', 'Clean Energy'],
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Solar array panels situated on Kaptai reservoir surface',
      publishedAt: '2026-08-27T16:40:00Z',
      updatedAt: '2026-08-27T17:15:00Z',
      retrievedAt: '2026-08-27T16:20:00Z',
      status: 'Published',
      verificationStatus: 'Verified',
      confidenceScore: 91,
      importanceScore: 85,
      viewsCount: 2190,
      primarySource: {
        id: 'src_pgcb',
        name: 'Power Grid Company of Bangladesh',
        url: 'https://pgcb.gov.bd/grid-updates/chattogram-solar',
        publisher: 'PGCB',
        domain: 'pgcb.gov.bd',
        publishedAt: '2026-08-27T15:00:00Z',
        retrievedAt: '2026-08-27T16:20:00Z',
        sourceType: 'Government Source',
        reliabilityScore: 95,
        isPrimary: true,
      },
      sourceComparison: {
        totalChecked: 5,
        supporting: 5,
        conflicting: 0,
        primarySourceAvailable: true,
        sources: [],
      },
      keyFacts: [
        '400 Megawatt peak generating capacity fully synchronized with the 230kV transmission corridor.',
        'Calculated to supply clean electricity to approximately 320,000 households.',
        'Financed through a hybrid consortium including the Asian Development Bank (ADB).',
      ],
      extractedClaims: [
        {
          id: 'cl_301',
          claim: 'Plant provides 400MW peak output to the national grid.',
          confidence: 93,
          evidenceStatus: 'supported',
        },
      ],
    },
    {
      id: 'art_4',
      slug: 'quantum-computing-breakthrough-mit-room-temperature-qubits',
      title: 'Physicists Achieve Stable 128-Qubit Coherence at Room Temperature',
      titleBn: 'সাধারণ তাপমাত্রায় ১২৮-কিউবিট কোয়ান্টাম সুসংগততা অর্জন বিজ্ঞানীদের',
      summary: 'A multi-institutional physics consortium led by MIT and Cambridge demonstrated continuous quantum coherence in diamond nitrogen-vacancy registers without cryogenic liquid helium cooling.',
      summaryBn: 'তরল হিলিয়াম ছাড়া সাধারণ তাপমাত্রায় ১২৮-কিউবিট কোয়ান্টাম চিপের সফল পরীক্ষা সম্পন্ন হয়েছে।',
      byline: 'Dr. Alistair Finch & Lin Zhao',
      bylineRole: 'Quantum Physics & Deep Tech Correspondents',
      location: 'CAMBRIDGE, MA',
      readTimeMinutes: 5,
      contentSnippet: 'Diamond nitrogen-vacancy centers achieved over 420 milliseconds of continuous coherence at standard ambient room temperature (295 Kelvin).',
      content: `In a landmark experimental breakthrough published in the latest issue of *Nature Physical Sciences*, an international consortium of physicists from the Massachusetts Institute of Technology (MIT), Harvard University, and Cambridge has successfully maintained stable quantum coherence across a 128-qubit register at room temperature (295 Kelvin, 22°C).

For decades, quantum processors based on superconducting transmon circuits required extreme cryogenic cooling apparatus—dilution refrigerators chilling chips to near absolute zero (-273.15°C) using scarce and expensive liquid Helium-3.

### The Nitrogen-Vacancy Diamond Innovation
The breakthrough hinges on synthetic diamond lattices doped with nitrogen-vacancy (NV) optical color centers. By using high-frequency stroboscopic optical dynamical decoupling pulses:
- **Extended Coherence Times:** Spin coherence persisted for an extraordinary 420 milliseconds—more than 10,000 times longer than prior ambient temperature benchmarks.
- **High-Fidelity Two-Qubit Gates:** Demonstrated entangling gate fidelities of 99.82%, well above the theoretical threshold required for surface-code fault-tolerant quantum error correction.
- **Compact Form Factor:** The entire quantum optical assembly fits inside a standard 19-inch server rack without external refrigeration plumbing.

### Practical Implications for Cryptography and Medicine
Eliminating the cryogenic bottleneck enables room-temperature quantum sensors for ultra-precise MRI molecular scanning, portable quantum GPS navigation impervious to satellite spoofing, and scalable quantum coprocessors directly deployable in standard cloud enterprise datacenters.`,
      contentBn: `ম্যাসাচুসেটস ইনস্টিটিউট অব টেকনোলজি (এমআইটি), হার্ভার্ড এবং কেমব্রিজ বিশ্ববিদ্যালয়ের পদার্থবিজ্ঞানীদের একটি যৌথ আন্তর্জাতিক গবেষক দল সাধারণ কক্ষ তাপমাত্রায় (২৯৫ কেলভিন বা ২২ ডিগ্রি সেলসিয়াস) ১২৮-কিউবিট কোয়ান্টাম চিপের সফল স্থিতিশীলতা প্রদর্শন করেছেন।

আন্তর্জাতিক বিজ্ঞান সাময়িকী *নেচার ফিজিক্যাল সায়েন্সেস*-এ প্রকাশিত এই গবেষণাকে কোয়ান্টাম কম্পিউটিংয়ের ইতিহাসে এক যুগান্তকারী মাইলফলক বিবেচনা করা হচ্ছে।

### নাইট্রোজেন-ভ্যাকেন্সি হীরক ল্যাটিস প্রযুক্তির কৌশল
কোয়ান্টাম কম্পিউটারের কিউবিটগুলোকে স্থিতিশীল রাখতে এতদিন তরল হিলিয়াম ব্যবহার করে পরম শূন্য তাপমাত্রার (-২৭৩ ডিগ্রি সেলসিয়াস) কাছাকাছি ঠাণ্ডা রাখতে হতো। 
- **দীর্ঘস্থায়ী সুসংগততা (Coherence):** নতুন সিন্থেটিক ডায়মন্ড ক্রিস্টাল ও বিশেষ লেজার পালস ব্যবহারের মাধ্যমে কিউবিটগুলোর তথ্য ধারণ ক্ষমতা ৪২০ মিলিসেকেন্ড পর্যন্ত বজায় রাখা সম্ভব হয়েছে।
- **ছোট আকার ও স্বাভাবিক পরিবেশ:** কোনো বিশেষ হিমায়ন ব্যবস্থা ছাড়াই সাধারণ সার্ভার র‍্যাকে এই কোয়ান্টাম চিপ স্থাপন করা সম্ভব।

### ভবিষ্যৎ প্রভাব
এই আবিষ্কারের ফলে সাধারণ তাপমাত্রার কোয়ান্টাম সেন্সর, অতি-নিখুঁত চিকিৎসাবিষয়ক মলিকুলার স্ক্যানার এবং বিদ্যুৎ সাশ্রয়ী কোয়ান্টাম ক্লাউড ডাটা সেন্টারের বাস্তব রূপায়ন এখন সময়ের ব্যাপার মাত্র।`,
      analysis: {
        author: 'Prof. Clara Vance',
        role: 'Senior Fellow in Condensed Matter Physics, MIT',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        text: 'Ambient temperature NV-center diamond computing bypasses the multi-million dollar cryogenic tax. This marks the moment quantum hardware transitions from exotic physics laboratories into deployable industrial tech.',
        textBn: 'ক্রায়োজেনিক হিলিয়াম শীতলীকরণ ব্যবস্থার ওপর নির্ভরতা দূর হওয়ায় কোয়ান্টাম প্রযুক্তি এখন ল্যাবরেটরি থেকে সরাসরি বাণিজ্যিক ব্যবহারের উপযোগী হয়ে উঠছে।'
      },
      quotes: [
        {
          speaker: 'Dr. Mikhail Lukin',
          title: 'Principal Investigator, Harvard Quantum Initiative',
          quote: 'We achieved high-fidelity entanglement without cryogenic cooling. The scalability trajectory for room-temperature diamond processors is fundamentally validated.',
          quoteBn: 'হিমাঙ্কের শীতলীকরণ ছাড়াই আমরা কোয়ান্টাম এন্ট্যাঙ্গেলমেন্টের সফল বাস্তবায়ন করেছি, যা সাধারণ তাপমাত্রায় কোয়ান্টাম প্রসেসরের ভবিষ্যৎকে নিশ্চিত করেছে।'
        }
      ],
      fullCoverageSources: [
        {
          id: 'cov_nature_q',
          name: 'Nature Physical Sciences',
          domain: 'nature.com',
          url: 'https://nature.com/articles/s41586-026-quantum-nv',
          headline: '128-Qubit Spin Register Coherence Achieved at 295K in Diamond Lattices',
          headlineBn: 'হীরক ল্যাটিসে ২৯৫ কেলভিনে ১২৮-কিউবিট স্পিন রেজিস্টার সুসংগততা অর্জন',
          snippet: 'Peer-reviewed documentation confirms 99.82% gate fidelity under dynamical decoupling RF pulse sequences.',
          snippetBn: 'পিয়ার-রিভিউড রিপোর্টে ৯৯.৮২% গেট ফিডেলিটির প্রমাণ নিশ্চিত করা হয়েছে।',
          publishedAt: '2026-08-27T13:00:00Z',
          stance: 'supporting',
          reliabilityScore: 99
        },
        {
          id: 'cov_mit_tech',
          name: 'MIT Technology Review',
          domain: 'technologyreview.com',
          url: 'https://technologyreview.com/2026/08/27/room-temperature-quantum-computing-is-here',
          headline: 'Why Room-Temperature Qubits Change the Economics of Quantum Computing',
          headlineBn: 'সাধারণ তাপমাত্রার কিউবিট কীভাবে কোয়ান্টাম প্রযুক্তির রূপরেখা বদলে দিচ্ছে',
          snippet: 'Removing cryogenic chillers reduces datacenter power draw by 92% per quantum algorithmic compute node.',
          snippetBn: 'ক্রায়োজেনিক চিলার বাদ দেওয়ায় কোয়ান্টাম নোড প্রতি ডাটা সেন্টারের বিদ্যুৎ খরচ ৯২% হ্রাস পাবে।',
          publishedAt: '2026-08-27T14:00:00Z',
          stance: 'supporting',
          reliabilityScore: 96
        }
      ],
      category: 'Science',
      tags: ['Quantum', 'Physics', 'Science', 'Computing', 'MIT', 'Deep Tech'],
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Diamond lattice quantum register visualized under laser optical trap',
      publishedAt: '2026-08-27T14:10:00Z',
      updatedAt: '2026-08-27T14:30:00Z',
      retrievedAt: '2026-08-27T13:50:00Z',
      status: 'Published',
      verificationStatus: 'Mostly Verified',
      confidenceScore: 87,
      importanceScore: 89,
      viewsCount: 4120,
      isEditorPick: true,
      primarySource: {
        id: 'src_nature',
        name: 'Nature Physical Sciences',
        url: 'https://nature.com/articles/s41586-026-quantum-nv',
        publisher: 'Springer Nature',
        domain: 'nature.com',
        publishedAt: '2026-08-27T13:00:00Z',
        retrievedAt: '2026-08-27T13:50:00Z',
        sourceType: 'Verified Outlet',
        reliabilityScore: 97,
        isPrimary: true,
      },
      sourceComparison: {
        totalChecked: 6,
        supporting: 5,
        conflicting: 1,
        primarySourceAvailable: true,
        sources: [],
      },
      keyFacts: [
        'Coherence lifetime exceeded 420 milliseconds at 295 Kelvin.',
        'Eliminates requirement for bulky dilution refrigerators in specialized quantum nodes.',
        'Peer-reviewed and published in Nature Physical Sciences volume 632.',
      ],
      extractedClaims: [
        {
          id: 'cl_401',
          claim: 'Quantum coherence maintained at 295 Kelvin without cryogenic apparatus.',
          confidence: 88,
          evidenceStatus: 'supported',
        },
      ],
    },
    {
      id: 'art_5',
      slug: 'bangladesh-cricket-super-four-asia-cup-2026-victory',
      title: 'Tigers Secure Historic 4-Wicket Victory in Asia Cup Super Four Thriller',
      titleBn: 'এশিয়া কাপ সুপার ফোরে ৪ উইকেটের রোমাঞ্চকর জয় টাইগারদের',
      summary: 'Bangladesh clinched a dramatic victory chasing 284 in Colombo, powered by a record fifth-wicket partnership and tactical death bowling.',
      summaryBn: 'কলম্বোতে ২৮৪ রান তাড়া করে অসাধারণ ব্যাটিং নৈপুণ্যে ৪ উইকেটের জয় তুলে নিয়েছে বাংলাদেশ।',
      byline: 'Ashfaqur Rahman',
      bylineRole: 'Senior Cricket & Sports Correspondent',
      location: 'COLOMBO',
      readTimeMinutes: 4,
      contentSnippet: 'Bangladesh chased down a competitive 284-run target with 5 balls remaining in a pulse-pounding final over finish at R. Premadasa Stadium.',
      content: `Under the floodlights of the R. Premadasa International Cricket Stadium in Colombo, the Bangladesh national cricket team sealed a heart-stopping four-wicket triumph in their marquee Asia Cup 2026 Super Four encounter.

Chasing a demanding target of 284 runs on a gripping dry wicket, the Tigers rebounded from an early top-order stumble at 48/3 through a majestic 142-run fifth-wicket partnership between the vice-captain and middle-order specialist.

### Match Dynamics and Turning Points
- **Top Order Fightback:** Despite conceding two quick dismissals inside the powerplay overs, steady stroke-play during the middle overs neutralized the opposition spin attack.
- **The Decisive Partnership:** An unbeaten 89 off 72 balls, decorated with 8 boundaries and 3 towering sixes, anchored the run-chase while rotating strike at an impressive 88% dot-ball reduction rate.
- **Final Over Climax:** Needing 11 runs from the final 6 deliveries, a towering straight drive six off the first ball followed by a crisply placed cover drive sealed victory with 5 balls to spare.

### Tournament Standings & Final Qualifications
With this bonus-point win, Bangladesh moves to the top tier of the Super Four table with 4 points and an improved net run rate (+0.485). 

Head coach hailed the psychological composure of the squad, noting that the disciplined fielding display—including two crucial direct-hit run-outs—set the foundation for the record chase.`,
      contentBn: `কলম্বোর প্রেমাদাসা স্টেডিয়ামের ফ্লাডলাইটের নিচে চরম নাটকীয়তায় ভরা ম্যাচে ৪ উইকেটের ঐতিহাসিক জয় তুলে নিয়েছে বাংলাদেশ জাতীয় ক্রিকেট দল।

২৮৪ রানের চ্যালেঞ্জিং লক্ষ্য তাড়া করতে নেমে শুরুতে ৪৮ রানে ৩ উইকেট হারিয়ে চাপে পড়লেও পঞ্চম উইকেটে ১৪২ রানের রেকর্ড জুটিতে ম্যাচ নিজেদের নিয়ন্ত্রণে নেয় টাইগাররা।

### ম্যাচের মূল মুহূর্ত ও উল্লেখযোগ্য পরিসংখ্যান
- **দাপুটে ইনিংস:** ম্যান অব দ্য ম্যাচ নির্বাচিত হওয়া ব্যাটার ৭২ বলে অপরাজিত ৮৯ রানের অসাধারণ দায়িত্বশীল ইনিংস খেলেন।
- **ম্যাচ উইনিং পার্টনারশিপ:** স্পিন বান্ধব উইকেটে ধীরস্থিরভাবে স্ট্রাইক রোটেশন এবং পাওয়ার হিটিংয়ের চমৎকার সমন্বয়ে ম্যাচে ফেরে বাংলাদেশ।
- **শেষ ওভারের রোমাঞ্চ:** শেষ ওভারে জয়ের জন্য প্রয়োজন ছিল ১১ রান। ওভারের প্রথম বলেই লং-অফের ওপর দিয়ে বিশাল ছক্কা হাঁকিয়ে সমীকরণ সহজ করেন ব্যাটার এবং ৫ বল হাতে রেখেই কাঙ্ক্ষিত জয় নিশ্চিত করে বাংলাদেশ।

এই জয়ের ফলে এশিয়া কাপের সুপার ফোর টেবিলের শীর্ষে উঠে ফাইনালের পথে বড় ধাপ এগিয়ে গেল লাল-সবুজের দল।`,
      analysis: {
        author: 'Habibul Bashar',
        role: 'Former National Captain & Cricket Analyst',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        text: 'The maturity shown under 7.5 required run rate pressure proves this team has outgrown vulnerability in tight chases. Tactical rotation against mystery spin was textbook perfection.',
        textBn: 'চাপের মুখে তরুণ ক্রিকেটারদের এই পরিপক্বতা টাইগার ক্রিকেট দলের মানসিক দৃঢ়তার প্রতিফলন। স্পিনের বিরুদ্ধে সঠিক কৌশলই এই ঐতিহাসিক জয়ের মূল ভিত্তি।'
      },
      quotes: [
        {
          speaker: 'Najmul Hossain Shanto',
          title: 'Captain, Bangladesh Cricket Team',
          quote: 'We believed in our depth. The boys stayed calm even when the run rate climbed above eight, and the execution in the death overs was flawless.',
          quoteBn: 'আমাদের দলের গভীরতার ওপর পুরো বিশ্বাস ছিল। রান রেট আটের উপরে যাওয়ার পরেও খেলোয়াড়রা মাথা ঠাণ্ডা রেখে পরিকল্পনা বাস্তবায়ন করেছে।'
        }
      ],
      fullCoverageSources: [
        {
          id: 'cov_espn_cricket',
          name: 'ESPN Cricinfo Live',
          domain: 'espncricinfo.com',
          url: 'https://espncricinfo.com/series/asia-cup-2026/match-12-report',
          headline: 'Tigers ace 284 chase in Colombo classic to stun opposition',
          headlineBn: 'কলম্বোয় শ্বাসরুদ্ধকর ম্যাচে ২৮৪ রান তাড়া করে জয়ী বাংলাদেশ',
          snippet: 'Record fifth-wicket resistance transforms an improbable chase into a commanding Super Four victory.',
          snippetBn: 'পঞ্চম উইকেটে অনবদ্য ব্যাটিংয়ে অসম্ভব লক্ষ্যকে সহজ জয়ে রূপ দিল বাংলাদেশ।',
          publishedAt: '2026-08-27T20:15:00Z',
          stance: 'supporting',
          reliabilityScore: 99
        },
        {
          id: 'cov_bbc_cricket',
          name: 'BBC Sport',
          domain: 'bbc.com',
          url: 'https://bbc.com/sport/cricket/asia-cup-super-four-bangladesh',
          headline: 'Asia Cup: Bangladesh pull off thrilling final-over victory in Colombo',
          headlineBn: 'এশিয়া কাপ: কলম্বোয় শেষ ওভারের রোমাঞ্চে বাংলাদেশের রুদ্ধশ্বাস জয়',
          snippet: 'Tigers move within touching distance of the Asia Cup final after composed batting display.',
          snippetBn: 'চমৎকার ব্যাটিং নৈপুণ্যে এশিয়া কাপ ফাইনালের কাছাকাছি পৌঁছে গেল বাংলাদেশ।',
          publishedAt: '2026-08-27T20:45:00Z',
          stance: 'supporting',
          reliabilityScore: 97
        }
      ],
      category: 'Sports',
      tags: ['Cricket', 'Sports', 'Asia Cup', 'Bangladesh Cricket', 'Tigers', 'Colombo'],
      imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Bangladesh team celebrating winning boundary at Colombo',
      publishedAt: '2026-08-27T19:45:00Z',
      updatedAt: '2026-08-27T20:10:00Z',
      retrievedAt: '2026-08-27T19:30:00Z',
      status: 'Published',
      verificationStatus: 'Verified',
      confidenceScore: 98,
      importanceScore: 84,
      viewsCount: 6890,
      isTrending: true,
      primarySource: {
        id: 'src_espn',
        name: 'ESPN Cricinfo Live Desk',
        url: 'https://espncricinfo.com/series/asia-cup-2026/match-12',
        publisher: 'ESPN',
        domain: 'espncricinfo.com',
        publishedAt: '2026-08-27T19:20:00Z',
        retrievedAt: '2026-08-27T19:30:00Z',
        sourceType: 'Official API',
        reliabilityScore: 99,
        isPrimary: true,
      },
      sourceComparison: {
        totalChecked: 8,
        supporting: 8,
        conflicting: 0,
        primarySourceAvailable: true,
        sources: [],
      },
      keyFacts: [
        'Chased down 284 runs with 5 balls to spare.',
        'Man of the match registered an unbeaten 89 runs off 72 deliveries.',
      ],
      extractedClaims: [],
    },
    {
      id: 'art_6',
      slug: 'central-bank-digital-currency-pilot-cbdc-dhaka',
      title: 'Bangladesh Bank Launches Multi-Bank Digital Taka (CBDC) Pilot for Wholesale Clearing',
      titleBn: 'বাণিজ্যিক ব্যাংক লেনদেনে পরীক্ষামূলক ডিজিটাল টাকা চালু করলো বাংলাদেশ ব্যাংক',
      summary: 'The central bank commenced its sovereign digital currency pilot with 12 schedule commercial banks to expedite real-time interbank settlements and eliminate cross-border remittance remittance friction.',
      summaryBn: '১২টি বাণিজ্যিক ব্যাংকের সমন্বয়ে ডিজিটাল টাকা (সিবিডিসি) পাইলট প্রকল্প শুরু করেছে কেন্দ্রীয় ব্যাংক।',
      byline: 'Mohammad Farhad & Mehedi Hasan',
      bylineRole: 'Monetary Policy & Financial Systems Bureau',
      location: 'DHAKA',
      readTimeMinutes: 5,
      contentSnippet: 'The sovereign Digital Taka wholesale pilot achieved sub-800 millisecond interbank atomic settlement with 100% cryptographic ledger finality.',
      content: `Bangladesh Bank has officially initiated Phase 1 of its sovereign Central Bank Digital Currency (CBDC) pilot, colloquially named the **"Digital Taka"**, bringing 12 leading schedule commercial banks into a unified distributed clearing ledger.

The wholesale pilot focuses on real-time gross settlement (RTGS) replacements, corporate treasury liquidity rebalancing, and instant cross-border remittance clearing.

### Technical Architecture & Resilience
- **Hybrid Permissioned DLT Ledger:** Built on high-throughput, quantum-resistant cryptographic algorithms capable of clearing 25,000 transactions per second per shard.
- **Zero-Loss Atomic Settlement:** Replaces multi-day clearing cycles with sub-800ms atomic swap finality, eliminating counterparty default risk across participant commercial banks.
- **Dual-Layer Privacy Protocol:** Preserves corporate banking confidentiality while granting regulators full anti-money laundering (AML) and counter-terrorist financing (CFT) auditable visibility.

### Roadmap to Retail Rollout
According to the central bank's Payment Systems Department, Phase 1 will operate under sandbox limits through Q4 2026 before expanding to retail merchant wallets and offline NFC tap-and-pay tokens for rural and unbanked populations by late 2027.`,
      contentBn: `বাংলাদেশ ব্যাংক আনুষ্ঠানিকভাবে দেশের ১২টি শীর্ষ বাণিজ্যিক ব্যাংকের সমন্বয়ে নিজস্ব কেন্দ্রীয় ব্যাংক ডিজিটাল মুদ্রা (সিবিডিসি)—**"ডিজিটাল টাকা"**-র প্রথম ধাপের পরীক্ষামূলক কার্যক্রম চালু করেছে।

এই প্রকল্পের মূল উদ্দেশ্য হলো আন্তঃব্যাংক লেনদেনে তাৎক্ষণিক নিষ্পত্তিকরণ নিশ্চিত করা, রেমিট্যান্স প্রেরণের খরচ কমানো এবং তারল্য ব্যবস্থাপনায় স্বচ্ছতা বৃদ্ধি করা।

### কারিগরি অবকাঠামো ও সুবিধা
- **৮০০ মিলিসেকেন্ডে লেনদেন নিষ্পত্তি:** প্রচলিত কয়েকদিনের চেক ক্লিয়ারিংয়ের পরিবর্তে মাত্র ৮০০ মিলিসেকেন্ডে লেনদেন সম্পন্ন হচ্ছে।
- **নিরাপত্তা ও স্বচ্ছতা:** কোয়ান্টাম-প্রতিরোধী ক্রিপ্টোগ্রাফি ব্যবহারের মাধ্যমে জালিয়াতি ও অর্থপাচার রোধের স্বয়ংক্রিয় অডিট সুবিধা যুক্ত রয়েছে।
- **ভবিষ্যৎ পরিকল্পনা:** ২০২৬ সালের শেষ নাগাদ পাইকারি লেনদেনের সফল সমাপ্তির পর ২০২৭ সালে প্রত্যন্ত অঞ্চলের সাধারণ জনগণের জন্য অফলাইন ডিজিটাল ওয়ালেট চালু করা হবে।`,
      analysis: {
        author: 'Dr. Zaidi Sattar',
        role: 'Chairman, Policy Research Institute (PRI)',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
        text: 'The wholesale Digital Taka modernization will strip out hundreds of millions in interbank reconciliation overhead annually while positioning Dhaka at the vanguard of South Asian sovereign fintech.',
        textBn: 'ডিজিটাল টাকা চালুর ফলে ব্যাংকিং খাতে বাৎসরিক শত শত কোটি টাকার প্রশাসনিক ব্যয় সাশ্রয় হবে এবং বৈশ্বিক বাণিজ্যে লেনদেন বহুগুণ দ্রুত হবে।'
      },
      quotes: [
        {
          speaker: 'Mezbaul Haque',
          title: 'Executive Director, Bangladesh Bank',
          quote: 'Our pilot has demonstrated zero packet loss with instant finality. Digital Taka is the backbone of our future cashless economic architecture.',
          quoteBn: 'আমাদের পাইলট প্রকল্পে কোনো ধরনের ত্রুটি ছাড়াই নিখুঁত লেনদেন সম্পন্ন হয়েছে। ক্যাশলেস স্মার্ট অর্থনীতি বিনির্মাণে ডিজিটাল টাকা মূল স্তম্ভ হিসেবে কাজ করবে।'
        }
      ],
      fullCoverageSources: [
        {
          id: 'cov_bb_pilot_fe',
          name: 'The Financial Express',
          domain: 'thefinancialexpress.com.bd',
          url: 'https://thefinancialexpress.com.bd/economy/central-bank-digital-taka-pilot-underway',
          headline: 'Central Bank tests digital taka with 12 lenders in landmark pilot',
          headlineBn: '১২টি ব্যাংকের সাথে ডিজিটাল টাকার ঐতিহাসিক পাইলট শুরু করলো কেন্দ্রীয় ব্যাংক',
          snippet: 'Wholesale settlement speeds shrink from T+2 days to milliseconds in cryptographic clearing test.',
          snippetBn: 'ক্রিপ্টোগ্রাফিক ক্লিয়ারিংয়ের মাধ্যমে লেনদেনের গতি ২ দিনের পরিবর্তে মিলিসেকেন্ডে নেমে এসেছে।',
          publishedAt: '2026-08-27T11:45:00Z',
          stance: 'supporting',
          reliabilityScore: 94
        }
      ],
      category: 'Finance & Economy',
      tags: ['Finance', 'Economy', 'CBDC', 'Digital Taka', 'Banking', 'Bangladesh Bank'],
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Digital banking network visualization at Bangladesh Bank Motijheel headquarters',
      publishedAt: '2026-08-27T11:20:00Z',
      updatedAt: '2026-08-27T12:00:00Z',
      retrievedAt: '2026-08-27T11:00:00Z',
      status: 'Published',
      verificationStatus: 'Verified',
      confidenceScore: 93,
      importanceScore: 88,
      viewsCount: 2980,
      primarySource: {
        id: 'src_bb',
        name: 'Bangladesh Bank Communications',
        url: 'https://bb.org.bd/mediaroom/press/cbdc-pilot',
        publisher: 'Bangladesh Bank',
        domain: 'bb.org.bd',
        publishedAt: '2026-08-27T10:30:00Z',
        retrievedAt: '2026-08-27T11:00:00Z',
        sourceType: 'Government Source',
        reliabilityScore: 98,
        isPrimary: true,
      },
      sourceComparison: {
        totalChecked: 6,
        supporting: 6,
        conflicting: 0,
        primarySourceAvailable: true,
        sources: [],
      },
      keyFacts: [
        'Phase 1 strictly covers wholesale interbank settlements between 12 pilot financial institutions.',
        'Targeting 0% transaction loss with cryptographically verifiable settlement speeds under 800ms.',
      ],
      extractedClaims: [],
    },
    {
      id: 'art_7',
      slug: 'global-biotech-vaccine-mrna-dengue-clinical-trial-success',
      title: 'Universal Tetravalent Dengue mRNA Vaccine Shows 89% Efficacy in Phase 3 Trial',
      titleBn: 'নতুন ডেঙ্গু এমআরএনএ ভ্যাকসিনের তৃতীয় ধাপের পরীক্ষায় ৮৯% কার্যকারিতা প্রমাণিত',
      summary: 'A multi-country clinical trial across 18 endemic zones demonstrated broad neutralizing antibody response across all four dengue serotypes with zero severe adverse events.',
      summaryBn: '১৮টি দেশে পরিচালিত ক্লিনিক্যাল ট্রায়ালে ডেঙ্গুর সবকটি সেরোটাইপের বিরুদ্ধে ৮৯% সুরক্ষা প্রদর্শন করেছে নতুন ভ্যাকসিন।',
      byline: 'Dr. Rebecca Stern & Ariful Hoque',
      bylineRole: 'Global Health & Medical Virology Bureau',
      location: 'GENEVA / DHAKA',
      readTimeMinutes: 5,
      contentSnippet: 'The tetravalent mRNA dengue vaccine demonstrated 89.2% overall efficacy against symptomatic dengue fever across DEN-1, 2, 3, and 4 in 24,000 trial participants.',
      content: `In what global epidemiologists are calling a monumental leap forward in vector-borne disease prevention, results from a multi-center Phase 3 clinical trial published in *The Lancet Infectious Diseases* show that a newly developed universal tetravalent mRNA dengue vaccine delivers 89.2% protective efficacy across all four dengue virus serotypes (DEN-1, DEN-2, DEN-3, and DEN-4).

Conducted across 18 tropical and subtropical endemic nations involving over 24,000 enrolled participants aged 4 to 60, the trial showed an astounding **96.5% reduction in severe dengue hemorrhagic fever hospitalizations**.

### The Breakthrough in Serotype Neutralization
Previous traditional live-attenuated vaccines faced severe limitations regarding antibody-dependent enhancement (ADE), where partial immunity to one serotype could exacerbate severe infection if infected by another serotype.

The breakthrough mRNA platform resolves this constraint:
- **Balanced Quadrivalent Antigen Expression:** Encodes targeted structural envelope proteins (E-dimer) for all four strains simultaneously with equal immunological expression.
- **Durable T-Cell Priming:** Blood assays demonstrated sustained neutralizing memory T-cell titers persisting past 18 months post-second dose.
- **Safety Profile:** Zero vaccine-associated shock syndromes or neurotropic adverse reactions recorded throughout the 2-year surveillance timeline.

### Global Rollout and Local Production Prospects
The World Health Organization (WHO) has initiated accelerated emergency pre-qualification review. Bangladesh’s Directorate General of Drug Administration (DGDA) confirmed preliminary discussions with the global manufacturer and domestic pharmaceutical leaders in Gazipur for localized fill-and-finish technology transfer by early 2027.`,
      contentBn: `আন্তর্জাতিক চিকিৎসা সাময়িকী *দ্য ল্যানসেট ইনফেকশাস ডিজিজেস*-এ প্রকাশিত তৃতীয় ধাপের ক্লিনিক্যাল ট্রায়ালে দেখা গেছে, নতুন সর্বজনীন টেট্রাভ্যালেন্ট এমআরএনএ ডেঙ্গু ভ্যাকসিন ডেঙ্গু ভাইরাসের চারটি সেরোটাইপের (ডেন-১, ২, ৩ ও ৪) বিরুদ্ধেই ৮৯.২ শতাংশ কার্যকর সুরক্ষা প্রদানে সফল হয়েছে।

বিশ্বের ১৮টি দেশের ২৪,০০০ মানুষের ওপর পরিচালিত এই পরীক্ষায় দেখা গেছে, ভ্যাকসিনটি ডেঙ্গুজনিত গুরুতর জটিলতা ও হাসপাতালে ভর্তি হওয়ার ঝুঁকি **৯৬.৫ শতাংশ পর্যন্ত হ্রাস করে**।

### পূর্ববর্তী ভ্যাকসিনের সীমাবদ্ধতা দূরীকরণ
পূর্বে ডেঙ্গুর ভ্যাকসিনে অ্যান্টিবডি ডিপেন্ডেন্ট এনহান্সমেন্টের (ADE) ঝুঁকি থাকত, যার ফলে এক ধরনের সেরোটাইপ থেকে সুরক্ষা মিললেও অন্য সেরোটাইপে আক্রান্ত হলে ঝুঁকি বেড়ে যেত। নতুন এমআরএনএ প্রযুক্তিতে চারটি সেরোটাইপের অ্যান্টিজেনকে নিখুঁত ভারসাম্যে অন্তর্ভুক্ত করায় কোনো মারাত্মক পার্শ্বপ্রতিক্রিয়া দেখা যায়নি।

### বাংলাদেশ ও বৈশ্বিক উৎপাদন
বিশ্ব স্বাস্থ্য সংস্থা (ডাব্লিউএইচও) এই ভ্যাকসিনকে দ্রুত ছাড়পত্র প্রদানের প্রক্রিয়া শুরু করেছে। বাংলাদেশের ওষুধ প্রশাসন অধিদপ্তর (ডিজিডিএ) জানিয়েছে, দেশের শীর্ষস্থানীয় ফার্মাসিউটিক্যালস কারখানায় এই ভ্যাকসিনের স্থানীয় উৎপাদন ও বিতরণের বিষয়ে আলোচনা চলছে।`,
      analysis: {
        author: 'Prof. Dr. Tahmina Shirin',
        role: 'Director, Institute of Epidemiology, Disease Control and Research (IEDCR)',
        avatar: 'https://images.unsplash.com/photo-1594824813593-9c8646b9a8f4?w=200&auto=format&fit=crop&q=80',
        text: 'A high-efficacy balanced mRNA vaccine will fundamentally alter the epidemiological trajectory in tropical mega-cities like Dhaka, eliminating seasonal pediatric hospitalization surges.',
        textBn: 'চারটি সেরোটাইপের বিরুদ্ধে উচ্চমাত্রায় কার্যকর এই এমআরএনএ ভ্যাকসিন চালু হলে ঢাকার মতো ঘনবসতিপূর্ণ শহরে ডেঙ্গুর মৌসুমি আতঙ্ক ও প্রাণহানি স্থায়ীভাবে নিয়ন্ত্রণে আনা সম্ভব হবে।'
      },
      quotes: [
        {
          speaker: 'Dr. Tedros Adhanom Ghebreyesus',
          title: 'Director-General, WHO',
          quote: 'This vaccine marks a historic milestone in our fight against mosquito-borne pathogens, protecting billions living in vulnerable tropical climate zones.',
          quoteBn: 'মশাবাহিত ভাইরাসের বিরুদ্ধে লড়াইয়ে এটি একটি ঐতিহাসিক অর্জন, যা বিশ্বের কোটি কোটি মানুষকে সুরক্ষা দেবে।'
        }
      ],
      fullCoverageSources: [
        {
          id: 'cov_who_lancet_rep',
          name: 'The Lancet Infectious Diseases',
          domain: 'thelancet.com',
          url: 'https://thelancet.com/journals/laninf/article/dengue-mrna-p3',
          headline: 'Phase 3 Efficacy of Quadrivalent mRNA Vaccine Against Dengue in Endemic Zones',
          headlineBn: 'ডেঙ্গু প্রবণ অঞ্চলে টেট্রাভ্যালেন্ট এমআরএনএ ভ্যাকসিনের ৩য় ধাপের ফলাফল',
          snippet: 'Multi-center double-blind trial confirms 96.5% reduction in hospitalization risk with balanced quadrivalent immunogenicity.',
          snippetBn: 'ডাবল-ব্লাইন্ড ট্রায়ালে হাসপাতালে ভর্তির ঝুঁকি ৯৬.৫% হ্রাসের প্রমাণ মিলেছে।',
          publishedAt: '2026-08-27T08:30:00Z',
          stance: 'supporting',
          reliabilityScore: 99
        },
        {
          id: 'cov_bbc_dengue',
          name: 'BBC Health News',
          domain: 'bbc.com',
          url: 'https://bbc.com/news/health-dengue-mrna-vaccine-breakthrough',
          headline: 'Dengue: Scientists hail universal mRNA vaccine as game-changer for tropics',
          headlineBn: 'ডেঙ্গু: নতুন সর্বজনীন এমআরএনএ ভ্যাকসিনকে যুগান্তকারী আখ্যা বিজ্ঞানীদের',
          snippet: 'WHO initiates accelerated review as trial demonstrates unprecedented protection across all four virus strains.',
          snippetBn: 'চারটি সেরোটাইপেই অভূতপূর্ব সুরক্ষার পর ডাব্লিউএইচও দ্রুত অনুমোদনের প্রক্রিয়া শুরু করেছে।',
          publishedAt: '2026-08-27T09:00:00Z',
          stance: 'supporting',
          reliabilityScore: 98
        }
      ],
      category: 'Health',
      tags: ['Health', 'Dengue', 'Vaccine', 'Medicine', 'WHO', 'Lancet', 'Dhaka'],
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Medical researchers inspect vaccine vials in bio-safety laboratory',
      publishedAt: '2026-08-27T09:15:00Z',
      updatedAt: '2026-08-27T10:00:00Z',
      retrievedAt: '2026-08-27T08:50:00Z',
      status: 'Published',
      verificationStatus: 'Verified',
      confidenceScore: 95,
      importanceScore: 94,
      viewsCount: 4530,
      primarySource: {
        id: 'src_who_lancet',
        name: 'The Lancet Infectious Diseases',
        url: 'https://thelancet.com/journals/laninf/article/dengue-mrna-p3',
        publisher: 'Elsevier',
        domain: 'thelancet.com',
        publishedAt: '2026-08-27T08:00:00Z',
        retrievedAt: '2026-08-27T08:50:00Z',
        sourceType: 'Verified Outlet',
        reliabilityScore: 98,
        isPrimary: true,
      },
      sourceComparison: {
        totalChecked: 7,
        supporting: 7,
        conflicting: 0,
        primarySourceAvailable: true,
        sources: [],
      },
      keyFacts: [
        '89.2% overall efficacy against symptomatic dengue fever across DEN-1, 2, 3, and 4.',
        '96.5% reduction in hospitalization risk among enrolled cohort of 24,000 participants.',
      ],
      extractedClaims: [],
    },
    // Additional items in Incoming AI Inbox for editorial review demo
    {
      id: 'art_inbox_1',
      slug: 'quantum-satellite-mesh-communication-claim',
      title: 'Unverified Viral Claim: Private Firm Claims Instant Interplanetary Teleportation Network',
      titleBn: 'অযাচাইকৃত দাবি: বেসরকারি সংস্থার আন্তঃগ্রহ টেলিপোর্টেশন নেটওয়ার্ক চালুর দাবি',
      summary: 'A viral video press release claimed deployment of a commercial quantum teleportation constellation. TruthPulse AI automated ingestion detected extreme scientific anomalies and marked the item for strict editorial rejection or dispute.',
      category: 'Science',
      tags: ['Science', 'Viral Claim', 'Unverified'],
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      publishedAt: '2026-08-28T00:05:00Z',
      updatedAt: '2026-08-28T00:05:00Z',
      retrievedAt: '2026-08-28T00:02:00Z',
      status: 'Pending Review',
      verificationStatus: 'Disputed',
      confidenceScore: 18,
      importanceScore: 40,
      viewsCount: 120,
      primarySource: {
        id: 'src_viral',
        name: 'Unverified Social Wire',
        url: 'https://socialwire.example/quantum-teleport',
        publisher: 'Viral Social Account',
        domain: 'socialwire.example',
        publishedAt: '2026-08-28T00:00:00Z',
        retrievedAt: '2026-08-28T00:02:00Z',
        sourceType: 'Public Dataset',
        reliabilityScore: 15,
        isPrimary: true,
      },
      sourceComparison: {
        totalChecked: 4,
        supporting: 0,
        conflicting: 4,
        primarySourceAvailable: false,
        sources: [],
      },
      keyFacts: [
        'No peer-reviewed papers or independent telemetry validate the claim.',
        'Contradicts standard physical no-cloning and relativistic signaling laws.',
      ],
      extractedClaims: [
        {
          id: 'cl_fake_1',
          claim: 'Instant macroscopic data teleportation achieved with consumer hardware.',
          confidence: 12,
          evidenceStatus: 'contradicted',
          evidenceSnippet: 'Disputed by MIT and CERN public documentation.',
        },
      ],
      contradictionsFound: [
        'Violates established quantum information physics theorems.',
      ],
      misinformationFlags: [
        'Sensationalist non-accredited claims lacking reproducibility.',
      ],
    },
    {
      id: 'art_inbox_2',
      slug: 'south-asia-smart-agriculture-grant-world-bank',
      title: 'World Bank Approves $350 Million Climate-Resilient Agriculture Grant for Bangladesh',
      titleBn: 'বাংলাদেশের জলবায়ু-সহনশীল কৃষিতে ৩৫ কোটি ডলার অনুদান বিশ্বব্যাংকের',
      summary: 'The World Bank Executive Board approved a financing package to modernize coastal polder irrigation, sensor-guided soil management, and saline-tolerant rice cultivation across 16 southern districts.',
      category: 'Education',
      tags: ['Agriculture', 'World Bank', 'Bangladesh', 'Climate Finance'],
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
      publishedAt: '2026-08-27T23:45:00Z',
      updatedAt: '2026-08-28T00:00:00Z',
      retrievedAt: '2026-08-27T23:50:00Z',
      status: 'Pending Review',
      verificationStatus: 'Needs Editorial Review',
      confidenceScore: 89,
      importanceScore: 86,
      viewsCount: 45,
      primarySource: {
        id: 'src_wb',
        name: 'World Bank Newsroom Press Wire',
        url: 'https://worldbank.org/en/news/press-release/2026/08/bangladesh-agri',
        publisher: 'World Bank Group',
        domain: 'worldbank.org',
        publishedAt: '2026-08-27T23:30:00Z',
        retrievedAt: '2026-08-27T23:50:00Z',
        sourceType: 'Official API',
        reliabilityScore: 97,
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
        'Covers 16 coastal districts exposed to seasonal cyclonic tidal surges.',
        'Includes implementation of 2,400 solar smart-irrigation pumps.',
      ],
      extractedClaims: [],
    },
  ];

  public factChecks: FactCheckItem[] = [
    {
      id: 'fc_1',
      claim: 'Did Bangladesh IT and software exports exceed $2 billion for the first time in FY 2025-26?',
      claimant: 'Social Media & Trade Briefings',
      claimDate: '2026-08-26',
      verdict: 'TRUE',
      confidenceScore: 96,
      summary: 'Audited balance-of-payments accounts published by Bangladesh Bank and the Export Promotion Bureau confirm aggregate IT and ITES export receipts reached $2.14 billion.',
      assertions: [
        'Export earnings surpassed the $2.0 billion threshold',
        'Official numbers are corroborated by Central Bank forex settlements',
        'BASIS industry member receipts reflect the 24.6% expansion'
      ],
      evidences: [
        {
          sourceName: 'Export Promotion Bureau (EPB) Fiscal Ledger',
          sourceUrl: 'https://epb.gov.bd/reports/2026',
          publishedDate: '2026-08-27',
          evidenceType: 'Official',
          quoteSnippet: 'Aggregate software and IT-enabled export earnings tallied at $2,142.8 million for FY 2025-26.',
          supportsClaim: true,
        },
        {
          sourceName: 'Bangladesh Bank Quarterly Monetary Bulletin',
          sourceUrl: 'https://bb.org.bd',
          publishedDate: '2026-08-27',
          evidenceType: 'Primary',
          quoteSnippet: 'Banking channel inward remittances for computer service exports grew by 24.6% year-on-year.',
          supportsClaim: true,
        },
        {
          sourceName: 'BASIS Industry Census 2026',
          sourceUrl: 'https://basis.org.bd',
          publishedDate: '2026-08-25',
          evidenceType: 'Independent',
          quoteSnippet: 'Member survey data indicates 420 active exporters logged direct overseas software billing exceeding targets.',
          supportsClaim: true,
        }
      ],
      contradictoryEvidence: [],
      primarySourceAvailable: true,
      conclusion: 'The claim is supported by official government documentation and central bank transaction ledgers. Rated TRUE.',
      whyTrustedExplanation: 'Reconciled against 3 independent official and industrial fiscal registries.',
      createdAt: '2026-08-27T20:00:00Z',
      category: 'Economy & Tech',
    },
    {
      id: 'fc_2',
      claim: 'Are commercial airlines grounding fleets globally due to a solar flare radiation warning on August 28?',
      claimant: 'Viral Messaging Channels',
      claimDate: '2026-08-27',
      verdict: 'FALSE',
      confidenceScore: 98,
      summary: 'NOAA Space Weather Prediction Center and FAA international flight telemetry confirm geomagnetic activity remains at benign G1 (minor) levels with zero aviation ground stops or route cancellations.',
      assertions: [
        'Claim asserts global aviation ground stop order in place',
        'Claim asserts extreme coronal mass ejection targeting aviation bands'
      ],
      evidences: [
        {
          sourceName: 'NOAA Space Weather Prediction Center (SWPC)',
          sourceUrl: 'https://swpc.noaa.gov',
          publishedDate: '2026-08-28',
          evidenceType: 'Official',
          quoteSnippet: 'Current planetary K-index is 2.33 (quiet/unsettled). No severe geomagnetic storm alerts active.',
          supportsClaim: false,
        },
        {
          sourceName: 'Federal Aviation Administration (FAA) Operations Status',
          sourceUrl: 'https://faa.gov',
          publishedDate: '2026-08-28',
          evidenceType: 'Primary',
          quoteSnippet: 'System-wide air traffic status is normal. No radiation ground stops reported.',
          supportsClaim: false,
        },
        {
          sourceName: 'FlightRadar24 Global Aircraft Live Telemetry',
          sourceUrl: 'https://flightradar24.com',
          publishedDate: '2026-08-28',
          evidenceType: 'Independent',
          quoteSnippet: 'Over 14,200 commercial aircraft actively airborne on scheduled flight paths.',
          supportsClaim: false,
        }
      ],
      contradictoryEvidence: [
        'Fabricated screenshot used doctored graphics from a 2012 storm simulation.'
      ],
      primarySourceAvailable: true,
      conclusion: 'Live space weather satellites and global civil aviation authorities confirm normal operations. The claim is completely fabricated. Rated FALSE.',
      whyTrustedExplanation: 'Verified via direct satellite feed from NOAA and global radar feeds.',
      createdAt: '2026-08-28T00:20:00Z',
      category: 'Science & Aviation',
    },
    {
      id: 'fc_3',
      claim: 'Did the WHO declare a new global health emergency for variant X-42 in August 2026?',
      claimant: 'Social Media Posts',
      claimDate: '2026-08-24',
      verdict: 'FALSE',
      confidenceScore: 99,
      summary: 'The World Health Organization has issued no Public Health Emergency of International Concern (PHEIC) declaration. No pathogen designated "variant X-42" exists in WHO nomenclature.',
      assertions: [
        'Asserts WHO Emergency Committee convened and declared PHEIC',
        'Asserts new pathogen designated variant X-42'
      ],
      evidences: [
        {
          sourceName: 'World Health Organization (WHO) Official Disease Outbreak News',
          sourceUrl: 'https://who.int/emergencies/disease-outbreak-news',
          publishedDate: '2026-08-27',
          evidenceType: 'Official',
          quoteSnippet: 'Active declarations and surveillance records list no emergency meeting or variant designated X-42.',
          supportsClaim: false,
        }
      ],
      contradictoryEvidence: [],
      primarySourceAvailable: true,
      conclusion: 'Rated FALSE. Fabricated headline circulated without institutional source backing.',
      whyTrustedExplanation: 'Official WHO press and surveillance directory checked directly.',
      createdAt: '2026-08-26T14:00:00Z',
      category: 'Health',
    },
  ];

  public eventGroups: EventGroup[] = [
    {
      id: 'grp_101',
      mainHeadline: 'Bangladesh IT & Software Exports Cross Record $2.1B in FY2026',
      category: 'Bangladesh',
      createdAt: '2026-08-27T18:00:00Z',
      articlesCount: 4,
      primarySourceId: 'src_epb',
      sourcesCount: 4,
      supportingCount: 4,
      conflictingCount: 0,
      articles: [],
    },
    {
      id: 'grp_102',
      mainHeadline: '64 Nations Finalize Geneva Accord on Frontier AI Transparency & Safeguards',
      category: 'Artificial Intelligence',
      createdAt: '2026-08-27T21:00:00Z',
      articlesCount: 6,
      primarySourceId: 'src_geneva_wire',
      sourcesCount: 6,
      supportingCount: 5,
      conflictingCount: 1,
      articles: [],
    },
  ];

  public trendingTopics: TrendingTopic[] = [
    {
      id: 'tr_1',
      topic: 'Bangladesh IT Export $2.1B',
      topicBn: 'বাংলাদেশ আইটি রপ্তানি ২.১ বিলিয়ন ডলার',
      mentionCount: 384,
      growthPercentage: 214,
      sourcesCount: 18,
      categories: ['Bangladesh', 'Business', 'Technology'],
      keyArticles: [
        { id: 'art_1', title: 'Bangladesh IT & Software Exports Cross Record $2.1 Billion Milestone', slug: 'bangladesh-it-exports-surpass-record-2-billion-milestone-2026' }
      ],
      updatedAt: '2026-08-28T00:30:00Z',
    },
    {
      id: 'tr_2',
      topic: 'Geneva AI Safety Accord',
      topicBn: 'জেনেভা এআই নিরাপত্তা চুক্তি',
      mentionCount: 612,
      growthPercentage: 184,
      sourcesCount: 26,
      categories: ['Artificial Intelligence', 'International', 'Technology'],
      keyArticles: [
        { id: 'art_2', title: '64 Nations Ratify Comprehensive Geneva Accord on Autonomous AI Safeguards', slug: 'global-ai-treaty-signed-geneva-autonomous-safeguards' }
      ],
      updatedAt: '2026-08-28T00:20:00Z',
    },
    {
      id: 'tr_3',
      topic: 'Dengue mRNA Vaccine Trial',
      topicBn: 'ডেঙ্গু এমআরএনএ ভ্যাকসিন ট্রায়াল',
      mentionCount: 290,
      growthPercentage: 142,
      sourcesCount: 14,
      categories: ['Health', 'Science'],
      keyArticles: [
        { id: 'art_7', title: 'Universal Tetravalent Dengue mRNA Vaccine Shows 89% Efficacy', slug: 'global-biotech-vaccine-mrna-dengue-clinical-trial-success' }
      ],
      updatedAt: '2026-08-28T00:15:00Z',
    },
    {
      id: 'tr_4',
      topic: 'Chattogram Floating Solar 400MW',
      topicBn: 'চট্টগ্রাম ভাসমান সৌর বিদ্যুৎ',
      mentionCount: 175,
      growthPercentage: 98,
      sourcesCount: 9,
      categories: ['Environment', 'Bangladesh'],
      keyArticles: [
        { id: 'art_3', title: 'Chattogram 400MW Floating Solar Facility Connected to Bangladesh National Grid', slug: 'solar-energy-grid-expansion-chattogram-megawatt-milestone' }
      ],
      updatedAt: '2026-08-28T00:10:00Z',
    },
  ];

  public auditLogs: AuditLog[] = [
    {
      id: 'log_1',
      actorId: 'usr_owner_1',
      actorName: 'Rahim Chowdhury',
      actorRole: 'OWNER',
      action: 'ARTICLE_PUBLISHED',
      entityType: 'Article',
      entityId: 'art_1',
      previousValue: 'Status: Pending Review',
      newValue: 'Status: Published | Verification: Verified (94%)',
      timestamp: '2026-08-28T00:15:00Z',
    },
    {
      id: 'log_2',
      actorId: 'usr_editor_1',
      actorName: 'Tanvir Hossain',
      actorRole: 'EDITOR',
      action: 'FACT_CHECK_APPROVED',
      entityType: 'FactCheck',
      entityId: 'fc_2',
      previousValue: 'Draft Investigation',
      newValue: 'Verdict: FALSE | Confidence: 98%',
      timestamp: '2026-08-28T00:20:00Z',
    },
    {
      id: 'log_3',
      actorId: 'usr_owner_1',
      actorName: 'Rahim Chowdhury',
      actorRole: 'OWNER',
      action: 'SOURCE_HEALTH_CHECK',
      entityType: 'Source',
      entityId: 'src_dhaka_tribune',
      previousValue: 'Health: Healthy',
      newValue: 'Health: Healthy (0 errors, 412 fetched)',
      timestamp: '2026-08-28T00:30:00Z',
    },
  ];

  public backgroundJobs: BackgroundJob[] = [
    {
      id: 'job_1',
      name: 'RSS Ingestion Engine: Bangladesh & Global Feeds',
      type: 'NEWS_COLLECTION',
      status: 'Completed',
      progress: 100,
      details: 'Polled 6 registered sources, ingested 14 new candidate dispatches.',
      startedAt: '2026-08-28T00:25:00Z',
      completedAt: '2026-08-28T00:25:12Z',
    },
    {
      id: 'job_2',
      name: 'Semantic Event Deduplication & Grouping',
      type: 'DUPLICATE_DETECTION',
      status: 'Completed',
      progress: 100,
      details: 'Grouped 18 incoming reports into 2 primary Event Groups.',
      startedAt: '2026-08-28T00:26:00Z',
      completedAt: '2026-08-28T00:26:04Z',
    },
    {
      id: 'job_3',
      name: 'AI Real-Time Claim Extraction & Verification',
      type: 'AI_CLASSIFICATION',
      status: 'Completed',
      progress: 100,
      details: 'Extracted 32 factual assertions; cross-referenced with public indices.',
      startedAt: '2026-08-28T00:27:00Z',
      completedAt: '2026-08-28T00:27:08Z',
    },
  ];

  // Helper Methods
  public getArticles(filter?: { category?: string; status?: string; search?: string; verificationStatus?: string }) {
    let list = [...this.articles];
    if (filter?.status) {
      list = list.filter((a) => a.status.toLowerCase() === filter.status?.toLowerCase());
    } else {
      // By default for public API, return Published
      list = list.filter((a) => a.status === 'Published');
    }

    if (filter?.category && filter.category !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === filter.category?.toLowerCase());
    }

    if (filter?.verificationStatus && filter.verificationStatus !== 'All') {
      list = list.filter((a) => a.verificationStatus.toLowerCase() === filter.verificationStatus?.toLowerCase());
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.primarySource.name.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  public getArticleBySlug(slug: string) {
    return this.articles.find((a) => a.slug === slug || a.id === slug);
  }

  public addArticle(article: NewsArticle) {
    this.articles.unshift(article);
    return article;
  }

  public updateArticle(id: string, updates: Partial<NewsArticle>, actor: User) {
    const idx = this.articles.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    const prev = this.articles[idx];
    const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
    this.articles[idx] = updated;

    // Record audit log
    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: updates.status ? `ARTICLE_${updates.status.toUpperCase()}` : 'ARTICLE_EDITED',
      entityType: 'Article',
      entityId: id,
      previousValue: `Status: ${prev.status} | Title: ${prev.title}`,
      newValue: `Status: ${updated.status} | Title: ${updated.title}`,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  // User Management & Auth Methods
  public getUserById(id: string): User | null {
    const account = this.users.find((u) => u.id === id);
    if (!account) return null;
    const { passwordHash, ...safeUser } = account;
    return safeUser;
  }

  public getUserByEmail(email: string): User | null {
    const account = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!account) return null;
    const { passwordHash, ...safeUser } = account;
    return safeUser;
  }

  public getAccountByEmail(email: string): UserAccount | null {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public getAllUsers(): User[] {
    return this.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  public updateUserLastLogin(id: string): void {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
    }
  }

  public createUser(userData: { name: string; email: string; role: UserRole; password: string; avatar?: string }): User {
    const existing = this.getAccountByEmail(userData.email);
    if (existing) {
      throw new Error(`A user account with email "${userData.email}" already exists.`);
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      role: userData.role,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(userData.password, 10),
    };

    this.users.push(newUser);

    this.addAuditLog({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser.id,
      newValue: `Registered account: ${newUser.name} (${newUser.role})`,
    });

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }
}

export const db = new TruthPulseDatabase();
