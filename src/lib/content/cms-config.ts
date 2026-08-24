export type PageContentMap = Record<string, string>;

export interface CmsField {
  key: string;
  label: string;
  default: string;
  multiline?: boolean;
}

export interface CmsSection {
  id: string;
  title: string;
  fields: CmsField[];
}

export interface CmsPage {
  slug: string;
  title: string;
  path: string;
  sections: CmsSection[];
}

function f(
  key: string,
  label: string,
  defaultValue: string,
  multiline = false
): CmsField {
  return { key, label, default: defaultValue, multiline };
}

function section(id: string, title: string, fields: CmsField[]): CmsSection {
  return { id, title, fields };
}

function legalSections(
  prefix: string,
  items: { heading: string; body: string }[]
): CmsSection {
  return section(
    "sections",
    "Content Sections",
    items.flatMap((item, index) => [
      f(`${prefix}.sections.${index}.heading`, `Section ${index + 1} heading`, item.heading),
      f(
        `${prefix}.sections.${index}.body`,
        `Section ${index + 1} body`,
        item.body,
        true
      ),
    ])
  );
}

const privacySectionData = [
  {
    heading: "1. Information We Collect",
    body: "We collect information you provide directly — such as name, email, phone number, and business details when you register, submit a listing, contact us, or subscribe to our newsletter. We also collect usage data including search queries, page views, and advertising interactions.",
  },
  {
    heading: "2. How We Use Information",
    body: "We use your information to operate and improve the directory, process business listings, deliver advertising services, respond to enquiries, send newsletters (with your consent), and analyze platform usage to better serve the Buffalo business community.",
  },
  {
    heading: "3. Business Listing Information",
    body: "Information you include in a published business listing (name, address, phone, hours, description, images) is displayed publicly on the platform and may appear in search engine results. Do not include private information you do not wish to be public.",
  },
  {
    heading: "4. Cookies & Analytics",
    body: "We use cookies and similar technologies to maintain sessions, remember preferences, and understand how visitors use our site. You can control cookies through your browser settings, though some features may not function properly without them.",
  },
  {
    heading: "5. Third-Party Services",
    body: "We use third-party services for authentication, payment processing (Stripe), email delivery, and image hosting. These providers have their own privacy policies governing how they handle your data.",
  },
  {
    heading: "6. Data Sharing",
    body: "We do not sell your personal information. We may share data with service providers who assist in operating the platform, when required by law, or to protect the rights and safety of our users and the public.",
  },
  {
    heading: "7. Data Retention & Security",
    body: "We retain your data for as long as your account is active or as needed to provide services. We implement reasonable security measures to protect your information, but no method of transmission over the internet is 100% secure.",
  },
  {
    heading: "8. Your Rights",
    body: "New York residents may request access to, correction of, or deletion of personal data we hold about you. Contact us to exercise these rights. You may unsubscribe from marketing emails at any time.",
  },
  {
    heading: "9. Children's Privacy",
    body: "The Service is not directed to children under 13. We do not knowingly collect personal information from children.",
  },
  {
    heading: "10. Contact Us",
    body: "For privacy-related questions, contact us at admin@letsgobuffalo.com or (716) 559-5955.",
  },
];

const termsSectionData = [
  {
    heading: "1. Acceptance of Terms",
    body: 'By accessing or using Let\'s Go Buffalo ("the Service"), operated in Buffalo, New York, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service.',
  },
  {
    heading: "2. Description of Service",
    body: "Let's Go Buffalo provides an online business directory for Western New York, allowing users to discover local businesses and business owners to create and manage listings. Optional advertising services are available through a bidding system.",
  },
  {
    heading: "3. Business Listings",
    body: "Business owners are responsible for the accuracy of their listing information, including hours, contact details, and descriptions. We reserve the right to review, edit, reject, suspend, or remove any listing that violates our guidelines or contains false, misleading, or offensive content.",
  },
  {
    heading: "4. Advertising & Bidding",
    body: "Sponsored placement is subject to campaign approval and available wallet balance. Daily bids are charged against your account balance when impressions are recorded. We do not guarantee specific placement, click-through rates, or business outcomes. All advertising fees are non-refundable except as required by law.",
  },
  {
    heading: "5. User Conduct",
    body: "You agree not to misuse the Service, submit spam or fraudulent listings, scrape data without permission, interfere with other users, or use the platform for unlawful purposes. We may terminate accounts that violate these terms.",
  },
  {
    heading: "6. Intellectual Property",
    body: "The Let's Go Buffalo name, logo, and website design are our property. Business owners retain ownership of content they submit but grant us a license to display it on the platform for directory and promotional purposes.",
  },
  {
    heading: "7. Disclaimer of Warranties",
    body: 'The Service is provided "as is." We do not warrant the accuracy of business listings, endorse any business, or guarantee uninterrupted access. Your use of listed businesses is at your own risk.',
  },
  {
    heading: "8. Limitation of Liability",
    body: "To the fullest extent permitted by New York law, Let's Go Buffalo shall not be liable for indirect, incidental, or consequential damages arising from your use of the Service.",
  },
  {
    heading: "9. Governing Law",
    body: "These terms are governed by the laws of the State of New York. Any disputes shall be resolved in Erie County, New York.",
  },
  {
    heading: "10. Contact",
    body: "Questions about these terms? Contact us at admin@letsgobuffalo.com or call (716) 559-5955.",
  },
];

export const CMS_PAGES: CmsPage[] = [
  {
    slug: "home",
    title: "Homepage",
    path: "/",
    sections: [
      section("hero", "Hero", [
        f("hero.headline_line1", "Headline line 1", "Discover the"),
        f("hero.headline_highlight", "Headline highlight", "Best"),
        f("hero.headline_line2", "Headline line 2", "of Buffalo"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Find trusted local businesses, hidden gems, and everything Western New York has to offer.",
          true
        ),
        f("hero.cta_explore", "Explore button", "Explore Businesses"),
        f("hero.cta_list", "List business button", "List Your Business"),
        f("hero.card_0.title", "Card 1 title", "Restaurants"),
        f("hero.card_0.subtitle", "Card 1 subtitle", "Savor local flavors"),
        f("hero.card_1.title", "Card 2 title", "Home Services"),
        f("hero.card_1.subtitle", "Card 2 subtitle", "Local experts you trust"),
        f("hero.card_2.title", "Card 3 title", "Shopping"),
        f("hero.card_2.subtitle", "Card 3 subtitle", "Find unique local shops"),
      ]),
      section("news_weather", "News & Weather", [
        f("news_weather.title", "Section title", "Buffalo News & Weather"),
        f(
          "news_weather.subtitle",
          "Section subtitle",
          "Local headlines and today's forecast for Western New York"
        ),
        f("news_weather.weather_title", "Weather card title", "Today in Buffalo"),
        f("news_weather.news_title", "News card title", "Local Headlines"),
        f(
          "news_weather.news_footer",
          "News footer text",
          "Headlines from trusted WNY sources."
        ),
        f("news_weather.community_link", "Community link text", "Join the community fan page →"),
      ]),
      section("popular_categories", "Popular Categories", [
        f("popular_categories.title", "Section title", "Popular Categories"),
        f(
          "popular_categories.subtitle",
          "Section subtitle",
          "Browse Buffalo-area businesses by what you're looking for"
        ),
        f("popular_categories.cta", "View all button", "View All Categories"),
      ]),
      section("sponsored", "Sponsored Businesses", [
        f("sponsored.title", "Section title", "Sponsored Businesses"),
        f(
          "sponsored.subtitle",
          "Section subtitle",
          "Featured partners supporting the Buffalo business community"
        ),
      ]),
      section("featured", "Featured Businesses", [
        f("featured.title", "Section title", "Featured Businesses"),
        f(
          "featured.subtitle",
          "Section subtitle",
          "Hand-picked local favorites across Western New York"
        ),
      ]),
      section("recent", "Recently Added", [
        f("recent.title", "Section title", "Recently Added"),
        f(
          "recent.subtitle",
          "Section subtitle",
          "New listings from Buffalo-area businesses"
        ),
      ]),
      section("how_it_works", "How It Works", [
        f("how_it_works.title", "Section title", "How It Works"),
        f(
          "how_it_works.subtitle",
          "Section subtitle",
          "Three simple steps to find and support Buffalo-area businesses"
        ),
        f("how_it_works.step_0.title", "Step 1 title", "Search & Discover"),
        f(
          "how_it_works.step_0.description",
          "Step 1 description",
          "Find restaurants on Hertel, contractors in Cheektowaga, or shops on Elmwood — all in one Buffalo-focused directory.",
          true
        ),
        f("how_it_works.step_1.title", "Step 2 title", "Connect with Locals"),
        f(
          "how_it_works.step_1.description",
          "Step 2 description",
          "View hours, contact info, and services from verified Western New York businesses you can trust.",
          true
        ),
        f("how_it_works.step_2.title", "Step 3 title", "Support & Grow"),
        f(
          "how_it_works.step_2.description",
          "Step 3 description",
          "List your business for free, reach more customers, and boost visibility with optional sponsored placement.",
          true
        ),
      ]),
      section("stats", "Stats Bar", [
        f("stats.label_businesses", "Businesses label", "Local Businesses"),
        f("stats.label_categories", "Categories label", "Categories"),
        f("stats.label_communities", "Communities label", "WNY Communities"),
        f("stats.value_proud", "Proud value", "716"),
        f("stats.label_proud", "Proud label", "Buffalo Proud"),
      ]),
      section("benefits", "Why Let's Go Buffalo", [
        f("benefits.title", "Section title", "Why Let's Go Buffalo?"),
        f(
          "benefits.subtitle",
          "Section subtitle",
          "The directory Western New York businesses and residents actually use"
        ),
        f("benefits.item_0.title", "Benefit 1 title", "Hyper-Local Focus"),
        f(
          "benefits.item_0.description",
          "Benefit 1 description",
          "Built for Buffalo, Amherst, Cheektowaga, and every corner of Western New York — not a generic national directory.",
          true
        ),
        f("benefits.item_1.title", "Benefit 2 title", "Verified Listings"),
        f(
          "benefits.item_1.description",
          "Benefit 2 description",
          "Look for the verified badge on businesses that have been reviewed by our team for accuracy and legitimacy.",
          true
        ),
        f("benefits.item_2.title", "Benefit 3 title", "Free to List"),
        f(
          "benefits.item_2.description",
          "Benefit 3 description",
          "Every local business deserves visibility. Basic listings are free — always. Optional ads help you stand out.",
          true
        ),
        f("benefits.item_3.title", "Benefit 4 title", "Community First"),
        f(
          "benefits.item_3.description",
          "Benefit 4 description",
          "We prioritize local ownership, honest reviews, and keeping dollars circulating in the 716 economy.",
          true
        ),
      ]),
      section("advertising", "Advertising Promo", [
        f("advertising.badge", "Badge text", "For Business Owners"),
        f("advertising.title", "Title", "Get Found First with Sponsored Placement"),
        f(
          "advertising.description",
          "Description",
          'Bid for top spots in search results and category pages. Set your daily budget, target keywords like "Buffalo pizza" or "Amherst plumber," and only pay when customers see your listing.',
          true
        ),
        f("advertising.cta_primary", "Primary button", "Learn About Advertising"),
        f("advertising.cta_secondary", "Secondary button", "Go to Dashboard"),
        f("advertising.price", "Price display", "$0.25"),
        f("advertising.price_label", "Price label", "minimum daily bid"),
        f(
          "advertising.price_note",
          "Price note",
          "Up to 3 sponsored spots per search — highest bid wins"
        ),
      ]),
      section("testimonials", "Testimonials", [
        f("testimonials.title", "Section title", "What Buffalo Says"),
        f(
          "testimonials.subtitle",
          "Section subtitle",
          "Hear from local business owners and residents across the 716"
        ),
        f(
          "testimonials.item_0.quote",
          "Testimonial 1 quote",
          "Let's Go Buffalo helped our Hertel Avenue shop get discovered by neighbors who didn't know we existed. Foot traffic is up 30%.",
          true
        ),
        f("testimonials.item_0.name", "Testimonial 1 name", "Maria S."),
        f("testimonials.item_0.business", "Testimonial 1 business", "Elmwood Boutique Owner"),
        f(
          "testimonials.item_1.quote",
          "Testimonial 2 quote",
          "As a Cheektowaga HVAC company, showing up when people search 'AC repair near me' through sponsored ads has been a game-changer.",
          true
        ),
        f("testimonials.item_1.name", "Testimonial 2 name", "Tom R."),
        f("testimonials.item_1.business", "Testimonial 2 business", "WNY Comfort Services"),
        f(
          "testimonials.item_2.quote",
          "Testimonial 3 quote",
          "Finally, a directory that actually understands Buffalo. No national chains drowning out our family restaurant.",
          true
        ),
        f("testimonials.item_2.name", "Testimonial 3 name", "Angela & Joe M."),
        f("testimonials.item_2.business", "Testimonial 3 business", "Allentown Eatery"),
      ]),
      section("newsletter", "Newsletter", [
        f("newsletter.title", "Section title", "Stay in the Herd"),
        f(
          "newsletter.subtitle",
          "Section subtitle",
          "Get weekly picks for new Buffalo businesses, seasonal guides, and local deals delivered to your inbox",
          true
        ),
        f(
          "newsletter.disclaimer",
          "Disclaimer",
          "No spam — just good stuff from the 716. Unsubscribe anytime."
        ),
      ]),
      section("cta", "Bottom CTA", [
        f("cta.title", "Title", "Ready to Join Buffalo's Business Community?"),
        f(
          "cta.description",
          "Description",
          "Whether you run a food truck at Canalside or a law office downtown, list your business free and connect with customers across Western New York.",
          true
        ),
        f("cta.primary", "Primary button", "List Your Business Free"),
        f("cta.secondary", "Secondary button", "Browse Directory"),
      ]),
    ],
  },
  {
    slug: "layout",
    title: "Header & Footer",
    path: "(site-wide)",
    sections: [
      section("header", "Top Banner", [
        f(
          "header.banner",
          "Banner text",
          "Explore local. Support Buffalo. Grow together."
        ),
      ]),
      section("footer", "Footer", [
        f(
          "footer.tagline",
          "Tagline",
          "Discover the best local businesses across Buffalo and Western New York. From restaurants to services, find trusted neighbors in your community.",
          true
        ),
        f("footer.email", "Email", "admin@letsgobuffalo.com"),
        f("footer.phone", "Phone", "716-559-5955"),
        f("footer.location", "Location", "Buffalo, New York"),
        f(
          "footer.newsletter_text",
          "Newsletter text",
          "Get local business highlights and community updates delivered to your inbox.",
          true
        ),
        f(
          "footer.copyright",
          "Copyright",
          "Let's Go Buffalo. All rights reserved."
        ),
      ]),
    ],
  },
  {
    slug: "about",
    title: "About Us",
    path: "/about",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "About Let's Go Buffalo"),
        f(
          "hero.intro",
          "Introduction",
          "Let's Go Buffalo is Western New York's homegrown business directory — built to help Buffalonians discover great local restaurants, contractors, retailers, and service providers while giving WNY business owners a free platform to reach new customers.",
          true
        ),
      ]),
      section("body", "Main Content", [
        f(
          "body.paragraph_1",
          "Paragraph 1",
          "Whether you're searching for a plumber in Cheektowaga, a date-night spot on Elmwood, or a family dentist in Williamsville, we make it easy to find businesses you can trust — with verified listings, real hours, and direct contact info.",
          true
        ),
        f(
          "body.paragraph_2",
          "Paragraph 2",
          "Founded with a simple mission: keep more dollars circulating in the 716 economy. We're not owned by a Silicon Valley conglomerate. We're neighbors who care about Hertel, the waterfront, the suburbs, and every block in between.",
          true
        ),
        f(
          "body.paragraph_3",
          "Paragraph 3",
          "For business owners, listing is always free. Optional sponsored placement lets you bid for top spots in search results — putting your business in front of customers actively looking for what you offer.",
          true
        ),
      ]),
      section("values", "Values", [
        f("values.item_0.title", "Value 1 title", "Love Local"),
        f(
          "values.item_0.description",
          "Value 1 description",
          "We're Buffalonians who believe in supporting the shops, restaurants, and services that make our neighborhoods unique — from Allentown to the Southtowns.",
          true
        ),
        f("values.item_1.title", "Value 2 title", "716 Focused"),
        f(
          "values.item_1.description",
          "Value 2 description",
          "This isn't a national directory with Buffalo as an afterthought. Every feature, every category, every search is built for Western New York.",
          true
        ),
        f("values.item_2.title", "Value 3 title", "Community Driven"),
        f(
          "values.item_2.description",
          "Value 3 description",
          "Business owners list for free. Residents discover honestly. We moderate listings to keep the directory trustworthy and spam-free.",
          true
        ),
      ]),
      section("cta", "Bottom CTA", [
        f("cta.title", "CTA title", "Join the Buffalo Business Community"),
        f("cta.subtitle", "CTA subtitle", "List your business free or get in touch with our team."),
        f("cta.primary", "Primary button", "List Your Business"),
        f("cta.secondary", "Secondary button", "Contact Us"),
      ]),
    ],
  },
  {
    slug: "advertise",
    title: "Advertise",
    path: "/advertise",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Advertise on Let's Go Buffalo"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Put your business at the top of category search results when Buffalo-area customers browse your industry. Bid per category starting at just $0.25/day.",
          true
        ),
        f("hero.cta", "CTA button", "Go to Advertising Dashboard"),
      ]),
      section("features", "Features", [
        f("features.item_0.title", "Feature 1 title", "Per-Category Bidding"),
        f(
          "features.item_0.description",
          "Feature 1 description",
          "Bid within specific categories like Restaurants, Home Services, or Retail. Your ad competes only in the categories you choose.",
          true
        ),
        f("features.item_1.title", "Feature 2 title", "Flexible Bidding"),
        f(
          "features.item_1.description",
          "Feature 2 description",
          "Set your daily bid starting at $0.25 per category. Bid on multiple categories — create separate campaigns for different amounts.",
          true
        ),
        f("features.item_2.title", "Feature 3 title", "Track Performance"),
        f(
          "features.item_2.description",
          "Feature 3 description",
          "Monitor impressions, clicks, and leads from your dashboard. Adjust bids anytime.",
          true
        ),
        f("features.item_3.title", "Feature 4 title", "Instant Visibility"),
        f(
          "features.item_3.description",
          "Feature 4 description",
          'Active campaigns appear at the top of search results with a clear "Ad" label — right where customers are looking.',
          true
        ),
      ]),
      section("bidding", "How Bidding Works", [
        f("bidding.title", "Section title", "How Bidding Works"),
        f(
          "bidding.step_1",
          "Step 1",
          "Create a campaign in your dashboard and set a daily bid (minimum $0.25).",
          true
        ),
        f(
          "bidding.step_2",
          "Step 2",
          "Choose your categories — select one or more categories to bid on. Each category has its own sponsored placement.",
          true
        ),
        f(
          "bidding.step_3",
          "Step 3",
          "Win placement — top bidders appear as sponsored results when customers search.",
          true
        ),
        f("bidding.cta_primary", "Primary button", "Create Free Account"),
        f("bidding.cta_secondary", "Secondary button", "Start Advertising"),
      ]),
      section("newsletter", "Newsletter", [
        f("newsletter.title", "Title", "Stay in the loop"),
        f(
          "newsletter.subtitle",
          "Subtitle",
          "Subscribe for advertising tips and Buffalo business updates."
        ),
      ]),
      section("footer_note", "Footer Note", [
        f(
          "footer_note.text",
          "Footer text",
          "Don't have a listing yet? List your business free before creating an ad campaign."
        ),
      ]),
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    path: "/contact",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Contact Us"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Have a question about listing your business, advertising, or using the directory? Our Buffalo-based team is here to help.",
          true
        ),
      ]),
      section("form", "Contact Form", [
        f("form.title", "Form card title", "Send a Message"),
      ]),
      section("info", "Contact Info", [
        f("info.email_label", "Email label", "Email"),
        f("info.email", "Email address", "admin@letsgobuffalo.com"),
        f("info.phone_label", "Phone label", "Phone"),
        f("info.phone", "Phone number", "(716) 559-5955"),
        f("info.area_label", "Service area label", "Service Area"),
        f("info.area_line_1", "Service area line 1", "Buffalo & Western New York"),
        f("info.area_line_2", "Service area line 2", "Erie & Niagara Counties"),
      ]),
      section("hours", "Business Hours", [
        f("hours.title", "Title", "Business Hours"),
        f(
          "hours.text",
          "Hours text",
          "Monday – Friday: 9:00 AM – 5:00 PM EST\nWe typically respond within one business day.",
          true
        ),
      ]),
    ],
  },
  {
    slug: "community",
    title: "Community Fan Page",
    path: "/community",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Community Fan Page"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Talk Buffalo businesses, local events, and WNY life. Comments are reviewed before appearing publicly.",
          true
        ),
      ]),
      section("posts", "Posts", [
        f("posts.item_0.author", "Post 1 author", "Let's Go Buffalo Team"),
        f("posts.item_0.title", "Post 1 title", "Welcome to the 716 Fan Page!"),
        f(
          "posts.item_0.body",
          "Post 1 body",
          "Share local tips, shout out your favorite businesses, and connect with fellow Buffalonians. Drop a comment below!",
          true
        ),
        f("posts.item_0.date", "Post 1 date", "2026-08-14"),
        f("posts.item_1.author", "Post 2 author", "Mike from Allentown"),
        f("posts.item_1.title", "Post 2 title", "Best wing spot this week?"),
        f(
          "posts.item_1.body",
          "Post 2 body",
          "Looking for recommendations — what local spot should I try next?",
          true
        ),
        f("posts.item_1.date", "Post 2 date", "2026-08-13"),
        f("posts.item_2.author", "Post 3 author", "Sarah W."),
        f("posts.item_2.title", "Post 3 title", "Supporting local this summer"),
        f(
          "posts.item_2.body",
          "Post 3 body",
          "Love seeing so many WNY businesses on the directory. Keep listing, Buffalo!",
          true
        ),
        f("posts.item_2.date", "Post 3 date", "2026-08-12"),
      ]),
      section("footer", "Footer Link", [
        f(
          "footer.text",
          "Footer text",
          "Want a custom @LetsGoBuffalo.com email? Request one here"
        ),
      ]),
    ],
  },
  {
    slug: "gear",
    title: "Gear Shop",
    path: "/gear",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Let's Go Buffalo Gear"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Rep the 716 with official Let's Go Buffalo merchandise. Submit an order inquiry and we'll email you to complete checkout.",
          true
        ),
      ]),
      section("products", "Products (text only)", [
        f("products.item_0.name", "Product 1 name", "Let's Go Buffalo Trucker Hat"),
        f(
          "products.item_0.description",
          "Product 1 description",
          "Navy & red snapback with embroidered logo."
        ),
        f("products.item_0.price", "Product 1 price", "24.99"),
        f("products.item_1.name", "Product 2 name", "716 Classic T-Shirt"),
        f(
          "products.item_1.description",
          "Product 2 description",
          "Soft cotton tee — show your Buffalo pride."
        ),
        f("products.item_1.price", "Product 2 price", "29.99"),
        f("products.item_2.name", "Product 3 name", "Buffalo Hoodie"),
        f(
          "products.item_2.description",
          "Product 3 description",
          "Cozy navy hoodie for chilly WNY evenings."
        ),
        f("products.item_2.price", "Product 3 price", "54.99"),
        f("products.item_3.name", "Product 4 name", "Sticker Pack (5)"),
        f(
          "products.item_3.description",
          "Product 4 description",
          "Laptop, water bottle, and tailgate ready."
        ),
        f("products.item_3.price", "Product 4 price", "9.99"),
      ]),
    ],
  },
  {
    slug: "lgb-email",
    title: "LGB Email",
    path: "/lgb-email",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Your @LetsGoBuffalo.com Email"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Get a professional local email like Sally@letsgobuffalo.com or JoesPizza@letsgobuffalo.com. Mail forwards to your existing inbox.",
          true
        ),
      ]),
      section("bullets", "Bullet Points", [
        f("bullets.item_0", "Bullet 1", "Available with Pro business or individual membership"),
        f("bullets.item_1", "Bullet 2", "Choose your preferred address (subject to availability)"),
        f(
          "bullets.item_2",
          "Bullet 3",
          "We set up forwarding to Gmail, Outlook, or any email you use today"
        ),
      ]),
      section("footer", "Footer Link", [
        f(
          "footer.text",
          "Footer text",
          "Already have an account? View membership plans"
        ),
      ]),
    ],
  },
  {
    slug: "directory",
    title: "Business Directory",
    path: "/directory",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Business Directory"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Explore local businesses across Buffalo, Amherst, Cheektowaga, and all of Western New York"
        ),
      ]),
    ],
  },
  {
    slug: "search",
    title: "Search",
    path: "/search",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Search Buffalo Businesses"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Find restaurants, services, shops, and more across Western New York"
        ),
      ]),
      section("empty", "Empty State", [
        f("empty.title", "Empty title", "Enter a search term to find local businesses."),
        f(
          "empty.hint",
          "Empty hint",
          'Try "wing sauce supplier," "Elmwood coffee," or "Amherst dentist"'
        ),
      ]),
      section("error", "Error State", [
        f("error.title", "Error title", "Search is temporarily unavailable"),
        f(
          "error.message",
          "Error message",
          "Please try again in a moment or browse the directory."
        ),
      ]),
      section("no_results", "No Results", [
        f("no_results.title_prefix", "No results title prefix", "No results for"),
        f(
          "no_results.message",
          "No results message",
          "We couldn't find any businesses matching your search. Try different keywords or browse our recommendations below.",
          true
        ),
        f("no_results.suggestions_label", "Suggestions label", "Try searching for:"),
      ]),
      section("recommendations", "Recommendations", [
        f("recommendations.with_query", "With query heading", "You might also like"),
        f("recommendations.without_query", "Without query heading", "Recently added in Buffalo"),
      ]),
    ],
  },
  {
    slug: "pricing",
    title: "Pricing",
    path: "/pricing",
    sections: [
      section("hero", "Page Header", [
        f("hero.badge", "Badge", "Pre-Launch Pricing"),
        f("hero.title", "Title", "Membership Plans"),
        f(
          "hero.subtitle",
          "Subtitle",
          "Promote your business, engage regionally and globally, or join as an individual to access community perks. All paid plans are recurring subscriptions until canceled.",
          true
        ),
      ]),
      section("business", "Business Plans Section", [
        f("business.title", "Section title", "Business Team Member"),
      ]),
      section("individual", "Individual Plans Section", [
        f("individual.title", "Section title", "Individual Team Member"),
      ]),
      section("advertising", "Advertising Note", [
        f("advertising.title", "Title", "Advertising is separate"),
        f(
          "advertising.description",
          "Description",
          "Sponsored search placement is available as an add-on starting at $0.25/day, independent of your listing tier.",
          true
        ),
        f("advertising.cta", "CTA button", "Learn About Advertising"),
      ]),
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    path: "/privacy",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Privacy Policy"),
        f("hero.updated", "Last updated", "Last updated: August 14, 2026"),
      ]),
      legalSections("privacy", privacySectionData),
    ],
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    path: "/terms",
    sections: [
      section("hero", "Page Header", [
        f("hero.title", "Title", "Terms & Conditions"),
        f("hero.updated", "Last updated", "Last updated: August 14, 2026"),
      ]),
      legalSections("terms", termsSectionData),
    ],
  },
];

export function getCmsPage(slug: string): CmsPage | undefined {
  return CMS_PAGES.find((page) => page.slug === slug);
}

export function getDefaultPageContent(slug: string): PageContentMap {
  const page = getCmsPage(slug);
  if (!page) return {};
  return Object.fromEntries(
    page.sections.flatMap((cmsSection) =>
      cmsSection.fields.map((field) => [field.key, field.default])
    )
  );
}
