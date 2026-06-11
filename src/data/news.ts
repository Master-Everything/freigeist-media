import {
  Target, Landmark, Building2, Leaf, Shirt, Heart, Ship, Plane,
  Car, Cog, Zap, Truck, BookOpen, Tv, Newspaper, Tablet,
  Printer, FlaskConical, Recycle, Shield, Home
} from 'lucide-react';

export interface Category {
  slug: string;
  name: string;
  color: string;
  icon: any;
}

export interface Author {
  name: string;
  role: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  content: string;
  publishedAt: string;
  readingTime: number;
  author: Author;
  tags: string[];
}

export const categories: Category[] = [
  { slug: "strategic", name: "Strategic", color: "#1056b5", icon: Target },
  { slug: "avisbank", name: "AvisBank", color: "#0d7c66", icon: Landmark },
  { slug: "construction", name: "Construction", color: "#b45309", icon: Building2 },
  { slug: "avisgreens", name: "AvisGreens", color: "#16a34a", icon: Leaf },
  { slug: "fashion", name: "Fashion", color: "#c026d3", icon: Shirt },
  { slug: "noage", name: "NoAge", color: "#dc2626", icon: Heart },
  { slug: "shipping", name: "Shipping", color: "#0284c7", icon: Ship },
  { slug: "air-transport", name: "Air Transport", color: "#6366f1", icon: Plane },
  { slug: "automotive", name: "Automotive", color: "#475569", icon: Car },
  { slug: "vortex", name: "Vortex", color: "#9333ea", icon: Cog },
  { slug: "power", name: "Power", color: "#ea580c", icon: Zap },
  { slug: "logistics", name: "Logistics", color: "#0891b2", icon: Truck },
  { slug: "publisher", name: "Publisher", color: "#854d0e", icon: BookOpen },
  { slug: "avistv", name: "AvisTV", color: "#e11d48", icon: Tv },
  { slug: "press", name: "Press", color: "#334155", icon: Newspaper },
  { slug: "apad", name: "aPad", color: "#7c3aed", icon: Tablet },
  { slug: "3d-printing", name: "3D Printing", color: "#059669", icon: Printer },
  { slug: "test-facility", name: "Test Facility", color: "#2563eb", icon: FlaskConical },
  { slug: "waste-facility", name: "Waste Facility", color: "#65a30d", icon: Recycle },
  { slug: "insurance", name: "Insurance", color: "#0f766e", icon: Shield },
  { slug: "real-estate", name: "Real Estate", color: "#a16207", icon: Home },
];

export const articles: Article[] = [
  {
    id: "strategic-1",
    title: "AVIS Umbrella Acquires 120 Land Parcels Across 40 Countries",
    subtitle: "The strategic expansion secures key industrial and commercial plots on four continents, positioning AVIS for accelerated infrastructure development through 2030.",
    category: "strategic",
    content: `<p>AVIS Umbrella has finalized the acquisition of 120 land parcels spanning 40 countries, marking one of the largest coordinated real-estate moves in the conglomerate's history. The portfolio includes industrial zones in Southeast Asia, commercial corridors in Western Europe, and greenfield sites across Sub-Saharan Africa.</p>
<h2>Global Footprint</h2>
<p>The acquisitions were structured through a series of bilateral agreements and competitive tenders over a 14-month period. Each parcel was selected based on proximity to transport networks, regulatory stability, and projected GDP growth in the host region.</p>
<div class="pull-quote">This is the foundation for the next decade of AVIS infrastructure projects — a bridge between ambition and geography.</div>
<p>Legal due diligence was handled by a consortium of international law firms, with environmental impact assessments completed for every site. The total investment exceeds €2.4 billion, funded through a combination of retained earnings and a recently oversubscribed green bond issuance.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>120 parcels across 40 countries secured in under 14 months — the fastest land acquisition programme in AVIS Umbrella history.</p></div>
<p>Construction on the first wave of projects is expected to begin in Q3 2025, with priority given to logistics hubs in Vietnam, solar manufacturing plants in Morocco, and mixed-use developments in Portugal and Estonia.</p>`,
    publishedAt: "2025-06-10",
    readingTime: 6,
    author: { name: "Margarethe Weiß", role: "Chief Communications Officer" },
    tags: ["Expansion", "Real Estate", "Global Strategy", "Infrastructure"],
  },
  {
    id: "strategic-2",
    title: "Board Approves Five-Year Diversification Roadmap",
    subtitle: "AVIS Umbrella's board of directors has ratified a comprehensive diversification strategy targeting new revenue streams in health-tech, green energy, and digital media.",
    category: "strategic",
    content: `<p>At an extraordinary board meeting in Hamburg, AVIS Umbrella's directors unanimously approved a five-year diversification roadmap that will channel €8.6 billion into emerging sectors. The plan identifies health-tech, renewable energy infrastructure, and next-generation digital media as the three strategic pillars.</p>
<h2>Investment Priorities</h2>
<p>Health-tech will receive the largest allocation at €3.2 billion, funding the expansion of the NoAge clinic network and the development of proprietary diagnostic devices. Green energy investments focus on scaling AvisGreens' solar and wind portfolio to 2 GW of installed capacity by 2029.</p>
<p>Digital media investments centre on AvisTV's streaming platform, which has recently surpassed five million subscribers, and a new AI-driven content personalization engine currently in beta testing.</p>
<div class="pull-quote">Diversification is not a hedge — it is a conviction that AVIS can lead in multiple verticals simultaneously.</div>
<p>The roadmap also includes provisions for strategic minority stakes in up to 15 high-growth startups annually, managed through a newly established AVIS Ventures unit based in Berlin. Portfolio companies will have access to AVIS infrastructure, distribution networks, and mentorship programmes.</p>
<p>Analysts have responded positively, with Berenberg upgrading AVIS Umbrella to "Buy" and setting a 12-month price target of €142, citing the disciplined capital allocation framework embedded in the plan.</p>`,
    publishedAt: "2025-06-08",
    readingTime: 5,
    author: { name: "Dr. Henrik Falk", role: "Head of Investor Relations" },
    tags: ["Strategy", "Board", "Investment", "Diversification"],
  },
  {
    id: "avisbank-1",
    title: "AVIS Quantum Bank Completes Blockchain Payment Integration",
    subtitle: "The proprietary quantum-secured distributed ledger now processes cross-border transactions in under three seconds, a first for European corporate banking.",
    category: "avisbank",
    content: `<p>AVIS Quantum Bank has successfully deployed its blockchain payment integration across all 14 European markets, enabling near-instant cross-border transfers secured by post-quantum cryptographic protocols. The system went live following a six-month pilot with over 2,000 corporate clients.</p>
<h2>Technical Architecture</h2>
<p>The platform uses a hybrid consensus mechanism that combines proof-of-authority validation with lattice-based encryption, ensuring resilience against both conventional and quantum computing attacks. Transaction throughput has been benchmarked at 12,000 operations per second.</p>
<p>Integration with existing SWIFT and SEPA networks ensures backward compatibility, allowing clients to transition at their own pace without disrupting existing treasury workflows.</p>
<div class="highlight"><div class="highlight-label">Important</div><p>All transactions are settled in under 3 seconds with full regulatory compliance across 14 jurisdictions.</p></div>
<p>The rollout has attracted significant interest from institutional investors, with three major pension funds initiating due diligence for custodial accounts on the platform. AvisBank expects to process over €40 billion in transactions through the new system by year-end.</p>`,
    publishedAt: "2025-06-07",
    readingTime: 5,
    author: { name: "Julian Krebs", role: "Senior Analyst" },
    tags: ["Blockchain", "Banking", "Fintech", "Quantum Security"],
  },
  {
    id: "avisbank-2",
    title: "AvisBank Launches Green Bond Programme for SME Financing",
    subtitle: "A new €1.5 billion green bond framework will provide affordable capital to small and medium enterprises pursuing sustainability certifications.",
    category: "avisbank",
    content: `<p>AvisBank has unveiled a dedicated green bond programme designed to channel €1.5 billion in affordable financing to SMEs across the European Economic Area. The bonds carry a coupon 40 basis points below standard corporate rates, subsidised through AvisBank's own ESG treasury allocation.</p>
<h2>Eligibility and Impact</h2>
<p>Eligible enterprises must demonstrate a credible pathway to ISO 14001 or equivalent environmental management certification. Funds may be used for energy efficiency retrofits, renewable energy installations, waste reduction systems, or sustainable supply chain upgrades.</p>
<p>An independent verification committee, including representatives from the European Investment Fund, will review each application to ensure alignment with the EU Taxonomy Regulation.</p>
<div class="pull-quote">We believe SMEs are the backbone of Europe's green transition, and access to capital should not be a barrier.</div>
<p>The first tranche of €300 million was oversubscribed within 48 hours of announcement, with applications from manufacturing, agriculture, and logistics sectors leading demand. AvisBank plans quarterly issuances through 2027.</p>`,
    publishedAt: "2025-06-05",
    readingTime: 4,
    author: { name: "Claudia Bernstein", role: "Press Officer" },
    tags: ["Green Bonds", "SME", "Sustainability", "Financing"],
  },
  {
    id: "construction-1",
    title: "Green City Tower Prototype Approved in Rostock",
    subtitle: "The 32-storey modular timber-hybrid tower has received full planning approval, becoming the tallest mass-timber structure in Northern Europe.",
    category: "construction",
    content: `<p>AVIS Construction's Green City Tower prototype has received unconditional planning approval from the Rostock municipal authority. At 32 storeys and 118 metres, it will become the tallest mass-timber hybrid building in Northern Europe upon completion in Q2 2027.</p>
<h2>Engineering Innovation</h2>
<p>The structure uses cross-laminated timber panels combined with a steel-reinforced concrete core, achieving a 62% reduction in embodied carbon compared to conventional reinforced concrete designs. The facade features integrated photovoltaic glazing capable of generating 380 MWh annually.</p>
<p>Prefabrication of structural modules will take place at AVIS Construction's Wismar factory, with on-site assembly projected to take just 14 months — roughly half the time of a comparable concrete build.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>62% reduction in embodied carbon versus conventional concrete construction, validated by TÜV Süd.</p></div>
<p>The tower will house 240 residential units, co-working spaces, a rooftop urban farm, and ground-floor retail. Pre-sales for the residential units are expected to open in September 2025.</p>`,
    publishedAt: "2025-06-04",
    readingTime: 5,
    author: { name: "Thomas Richter", role: "Editorial Team" },
    tags: ["Construction", "Timber", "Sustainability", "Rostock"],
  },
  {
    id: "construction-2",
    title: "Modular Housing Initiative Delivers 500 Units in Record Time",
    subtitle: "AVIS Construction's factory-built housing programme has completed its first 500 units across three German states, averaging 18 days per dwelling.",
    category: "construction",
    content: `<p>AVIS Construction's modular housing initiative has reached a significant milestone, delivering 500 fully finished residential units across Baden-Württemberg, Saxony, and Mecklenburg-Vorpommern. The average construction time per unit — from factory floor to occupancy — was just 18 days.</p>
<h2>Scale and Efficiency</h2>
<p>Each unit is manufactured in AVIS's automated Wismar production facility, where robotic assembly lines handle framing, insulation, electrical wiring, and plumbing before modules are transported to site for final connection. Quality control is maintained through a 147-point inspection protocol.</p>
<p>The programme was developed in partnership with three state housing agencies to address Germany's persistent housing shortage, which the Federal Institute for Building estimates at 700,000 units nationwide.</p>
<div class="pull-quote">Factory precision meets on-site speed — this is how we solve the housing crisis at scale.</div>
<p>Resident satisfaction surveys from the first occupied developments in Rostock and Dresden show 94% positive ratings for build quality, sound insulation, and energy performance. AVIS Construction has committed to delivering an additional 2,000 units by the end of 2026.</p>`,
    publishedAt: "2025-06-01",
    readingTime: 4,
    author: { name: "Sabine Engel", role: "Press Officer" },
    tags: ["Modular Housing", "Manufacturing", "Germany", "Innovation"],
  },
  {
    id: "avisgreens-1",
    title: "50 MW Solar Farm Begins Operation in Sicily",
    subtitle: "The Catania solar installation marks AvisGreens' largest Mediterranean project and will power approximately 25,000 households annually.",
    category: "avisgreens",
    content: `<p>AvisGreens has officially commissioned its 50 MW solar photovoltaic installation near Catania, Sicily, following 16 months of construction. The plant, covering 68 hectares of previously unused agricultural land, is expected to generate 85 GWh of clean electricity per year.</p>
<h2>Technical Specifications</h2>
<p>The facility uses bifacial monocrystalline silicon panels mounted on single-axis trackers, maximising energy yield by following the sun's arc across Sicily's exceptionally high irradiance zone. Battery storage of 20 MWh provides four hours of dispatchable capacity for grid balancing.</p>
<p>A 15-year power purchase agreement with Enel Distribuzione guarantees offtake at a fixed tariff, providing revenue certainty that underpins the project's financial model.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>85 GWh annual output — enough clean energy to power 25,000 Italian households and offset 38,000 tonnes of CO₂ per year.</p></div>
<p>AvisGreens is already conducting feasibility studies for a second Sicilian installation of 80 MW, as well as a 120 MW wind farm on Sardinia's western coast, scheduled for permitting in late 2025.</p>`,
    publishedAt: "2025-05-30",
    readingTime: 5,
    author: { name: "Dr. Lucia Ferrante", role: "Head of Renewable Projects" },
    tags: ["Solar", "Renewable Energy", "Italy", "Clean Power"],
  },
  {
    id: "avisgreens-2",
    title: "Wind Energy Portfolio Surpasses 500 MW Installed Capacity",
    subtitle: "With the commissioning of three new offshore turbines in the North Sea, AvisGreens crosses the half-gigawatt threshold for wind energy.",
    category: "avisgreens",
    content: `<p>AvisGreens has reached 500 MW of total installed wind energy capacity following the commissioning of three 15 MW offshore turbines in the German Bight sector of the North Sea. The milestone cements AvisGreens' position as one of Europe's fastest-growing independent renewable energy producers.</p>
<h2>Offshore Expansion</h2>
<p>The three new turbines, manufactured by Siemens Gamesa, are mounted on monopile foundations at a depth of 35 metres and feature 236-metre rotor diameters. Each unit is capable of powering approximately 20,000 homes at full capacity.</p>
<p>Grid connection was achieved through a dedicated 220 kV submarine cable to the Büttel substation in Schleswig-Holstein, with commissioning completed two months ahead of schedule.</p>
<div class="pull-quote">Half a gigawatt is a waypoint, not a destination — our 2030 target is 2 GW of combined wind and solar capacity.</div>
<p>AvisGreens' onshore portfolio spans 14 wind farms across Germany, Poland, and Sweden, while its offshore assets are concentrated in the North Sea and Baltic Sea. The company's pipeline includes 800 MW of projects currently in permitting or construction phases.</p>`,
    publishedAt: "2025-05-28",
    readingTime: 6,
    author: { name: "Martin Sjöberg", role: "Senior Analyst" },
    tags: ["Wind Energy", "Offshore", "North Sea", "Milestones"],
  },
  {
    id: "fashion-1",
    title: "New Sustainable Clothing Line Launches Q2 2025",
    subtitle: "AVIS Fashion debuts Everweave, a collection crafted entirely from recycled ocean plastics and organic cotton, targeting the conscious luxury segment.",
    category: "fashion",
    content: `<p>AVIS Fashion has announced the launch of Everweave, a 48-piece sustainable clothing collection that will debut in flagship stores across Milan, Berlin, and Stockholm in Q2 2025. Every garment in the line is produced using a proprietary blend of recycled ocean plastics and GOTS-certified organic cotton.</p>
<h2>Material Innovation</h2>
<p>The recycled plastic yarn is sourced from a partnership with Ocean Cleanup Initiative, which collects post-consumer plastic waste from Mediterranean and North Sea waterways. The material undergoes a patented decontamination and re-polymerisation process at AVIS Fashion's textile laboratory in Como, Italy.</p>
<p>Organic cotton components are sourced from certified farms in Portugal and Turkey, with full supply chain traceability enabled through blockchain-based provenance tracking.</p>
<div class="highlight"><div class="highlight-label">Important</div><p>Each Everweave garment carries a QR code linking to its full material provenance, from ocean collection point to finished product.</p></div>
<p>Pricing positions Everweave in the accessible luxury segment, with pieces ranging from €89 for basic tees to €620 for tailored outerwear. Pre-orders have already exceeded projections by 40%, driven by strong interest from ESG-focused retail buyers in Scandinavia and the Benelux region.</p>`,
    publishedAt: "2025-05-26",
    readingTime: 4,
    author: { name: "Isabella Marini", role: "Creative Director" },
    tags: ["Fashion", "Sustainability", "Everweave", "Recycled Materials"],
  },
  {
    id: "fashion-2",
    title: "AVIS Fashion Partners with Paris Atelier for Couture Capsule",
    subtitle: "A limited-edition collaboration with Maison Beaumont brings haute couture craftsmanship to AVIS Fashion's growing luxury portfolio.",
    category: "fashion",
    content: `<p>AVIS Fashion has entered a creative partnership with Maison Beaumont, a storied Parisian atelier, to produce a 12-piece couture capsule collection. The collaboration merges Beaumont's century-old hand-finishing techniques with AVIS Fashion's sustainable material innovations.</p>
<h2>Creative Vision</h2>
<p>The capsule collection draws inspiration from architectural geometry and natural forms, featuring structured silhouettes in muted earth tones accented with hand-embroidered metallic thread. Each piece requires between 120 and 400 hours of handwork.</p>
<p>Fabrics include peace silk from Japan, hand-loomed wool from the Scottish Highlands, and AVIS Fashion's proprietary recycled polyester. All dyes are plant-based, sourced from a cooperative of botanical dye houses in southern France.</p>
<div class="pull-quote">When heritage craftsmanship meets material innovation, the result transcends fashion — it becomes cultural commentary.</div>
<p>The collection will be unveiled at a private salon event during Paris Fashion Week in September 2025, with pieces available exclusively through appointment at AVIS Fashion's Place Vendôme showroom. Prices will range from €8,000 to €45,000.</p>`,
    publishedAt: "2025-05-24",
    readingTime: 4,
    author: { name: "Sophie Laurent", role: "Editorial Team" },
    tags: ["Couture", "Paris", "Collaboration", "Luxury"],
  },
  {
    id: "noage-1",
    title: "Anti-Aging Clinic Expansion Reaches 8 European Locations",
    subtitle: "NoAge opens its eighth clinic in Zurich, offering personalised longevity programmes backed by AI-driven biomarker analysis.",
    category: "noage",
    content: `<p>NoAge, AVIS Umbrella's longevity and wellness division, has opened its eighth European clinic in Zurich's Bahnhofstrasse district. The 1,200 m² facility offers comprehensive anti-aging assessments, regenerative therapies, and bespoke wellness programmes designed around individual biomarker profiles.</p>
<h2>AI-Driven Diagnostics</h2>
<p>Each client undergoes a proprietary 360-point biomarker panel that analyses blood chemistry, genetic predispositions, gut microbiome composition, and cellular senescence markers. Results are processed by NoAge's AI platform, which generates a personalised longevity protocol updated quarterly.</p>
<p>Therapies available at the Zurich clinic include NAD+ infusion therapy, hyperbaric oxygen treatments, cryotherapy, and a new photobiomodulation suite using medical-grade red and near-infrared light panels.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>8 clinics operational across Europe: Munich, Vienna, Milan, Barcelona, London, Copenhagen, Stockholm, and now Zurich.</p></div>
<p>NoAge reports a 92% client retention rate across its network, with average programme durations exceeding 18 months. The company plans to open clinics in Paris and Dubai before the end of 2025.</p>`,
    publishedAt: "2025-05-22",
    readingTime: 5,
    author: { name: "Dr. Annette Gruber", role: "Medical Director" },
    tags: ["Longevity", "Health-Tech", "Clinics", "Zurich"],
  },
  {
    id: "noage-2",
    title: "NoAge Publishes Landmark Study on Cellular Rejuvenation",
    subtitle: "A peer-reviewed study in Nature Aging demonstrates significant reversal of epigenetic age markers in a controlled trial of 340 participants.",
    category: "noage",
    content: `<p>NoAge's research division has published a landmark study in Nature Aging, reporting statistically significant reversal of epigenetic age markers in a randomised controlled trial involving 340 participants aged 45 to 72. The intervention combined targeted supplementation, lifestyle modification, and NoAge's proprietary photobiomodulation protocol.</p>
<h2>Study Design and Results</h2>
<p>Participants were divided into treatment and control groups and monitored over 12 months. The treatment group received a tailored regimen including NAD+ precursors, senolytics, and twice-weekly sessions in NoAge's light therapy chambers.</p>
<p>Epigenetic clock analysis (Horvath and GrimAge) showed an average biological age reduction of 4.7 years in the treatment group versus 0.3 years in controls. Improvements were also observed in cardiovascular markers, cognitive function scores, and telomere length.</p>
<div class="pull-quote">For the first time, we have clinical evidence that a multimodal intervention can meaningfully reverse biological aging in a diverse adult population.</div>
<p>The study has generated significant interest from the scientific community, with over 200 citation requests in the first two weeks following publication. NoAge plans to launch a Phase III clinical trial in partnership with Charité — Universitätsmedizin Berlin in early 2026.</p>`,
    publishedAt: "2025-05-20",
    readingTime: 7,
    author: { name: "Dr. Katarina Voss", role: "R&D Lead" },
    tags: ["Research", "Epigenetics", "Clinical Trial", "Nature Aging"],
  },
  {
    id: "shipping-1",
    title: "Fleet Expansion: 12 New Eco-Friendly Vessels Delivered",
    subtitle: "AVIS Shipping takes delivery of a dozen LNG-powered cargo ships, reducing fleet-wide emissions by an estimated 25%.",
    category: "shipping",
    content: `<p>AVIS Shipping has taken delivery of 12 new LNG-powered bulk carriers from Hyundai Heavy Industries, completing the first phase of its fleet modernisation programme. The vessels, each with a deadweight tonnage of 82,000, are equipped with dual-fuel engines that can operate on both LNG and conventional marine fuel.</p>
<h2>Environmental Performance</h2>
<p>LNG propulsion reduces sulphur oxide emissions by 99%, nitrogen oxides by 85%, and CO₂ by approximately 25% compared to conventional heavy fuel oil. The ships also feature air lubrication systems that reduce hull friction, improving fuel efficiency by an additional 5–7%.</p>
<p>Each vessel is fitted with a ballast water treatment system exceeding IMO D-2 standards, and the hull coatings are biocide-free silicone-based anti-fouling paints that minimise marine organism transfer between ecosystems.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>12 LNG vessels delivered — fleet-wide CO₂ intensity reduced by 25%, ahead of the IMO 2030 target.</p></div>
<p>The new ships will be deployed primarily on European coastal routes and transatlantic grain transport corridors. AVIS Shipping has committed to a second tranche of eight ammonia-ready vessels, scheduled for delivery in 2027.</p>`,
    publishedAt: "2025-05-18",
    readingTime: 5,
    author: { name: "Kapitän Lars Nielsen", role: "Fleet Operations Director" },
    tags: ["Shipping", "LNG", "Fleet", "Emissions"],
  },
  {
    id: "shipping-2",
    title: "Autonomous Navigation System Passes North Sea Trial",
    subtitle: "AVIS Shipping's AI-powered autonomous navigation system has completed a 72-hour unsupervised voyage across the North Sea.",
    category: "shipping",
    content: `<p>AVIS Shipping's autonomous navigation system, designated AVIS-NAV 3.0, has successfully completed a 72-hour unsupervised transit from Bremerhaven to Gothenburg across the North Sea. The 480-nautical-mile voyage was conducted aboard the MV Horizon, a 65,000 DWT bulk carrier retrofitted with the company's sensor and AI suite.</p>
<h2>System Capabilities</h2>
<p>AVIS-NAV 3.0 integrates LiDAR, radar, AIS transponder data, satellite imagery, and machine learning algorithms trained on over 2 million hours of maritime traffic data. The system handled all navigation decisions including route optimisation, collision avoidance, and weather routing without human intervention.</p>
<p>A qualified bridge crew remained on standby throughout the voyage as required by current maritime regulations, but reported no need for manual override during the entire transit.</p>
<div class="pull-quote">The North Sea trial proves that autonomous commercial shipping is no longer theoretical — it is operational and safe.</div>
<p>Classification society DNV has begun the process of certifying AVIS-NAV 3.0 for Autonomy Level 3 operations. AVIS Shipping aims to deploy the system across its entire European short-sea fleet by 2028, reducing crewing costs and improving voyage efficiency.</p>`,
    publishedAt: "2025-05-16",
    readingTime: 6,
    author: { name: "Erik Johansson", role: "Senior Analyst" },
    tags: ["Autonomous", "Navigation", "AI", "North Sea"],
  },
  {
    id: "air-transport-1",
    title: "AVIS Air Launches Cargo Routes to Asia-Pacific",
    subtitle: "Three new weekly freight services connect Frankfurt and Munich to Singapore, Seoul, and Sydney, expanding AVIS Air's intercontinental cargo network.",
    category: "air-transport",
    content: `<p>AVIS Air has inaugurated three new weekly cargo routes linking its Frankfurt and Munich hubs to Singapore Changi, Seoul Incheon, and Sydney Kingsford Smith airports. The services are operated by Boeing 777F freighters configured for high-value and time-sensitive cargo.</p>
<h2>Route Strategy</h2>
<p>The Asia-Pacific expansion targets the growing demand for pharmaceutical cold-chain logistics, semiconductor component transport, and e-commerce fulfilment for European luxury brands entering Asian markets.</p>
<p>Each 777F offers 102 tonnes of payload capacity with advanced temperature-controlled zones, enabling simultaneous transport of ambient, chilled, and frozen cargo on a single flight.</p>
<div class="highlight"><div class="highlight-label">Important</div><p>Frankfurt–Singapore service offers guaranteed 22-hour door-to-door for pharmaceutical shipments via dedicated cold-chain handling.</p></div>
<p>AVIS Air's cargo division reported a 34% year-on-year revenue increase in Q1 2025, driven by capacity constraints at competing carriers and strong demand from AVIS Umbrella's own logistics and manufacturing divisions.</p>`,
    publishedAt: "2025-05-14",
    readingTime: 4,
    author: { name: "Carsten Müller", role: "Head of Cargo Operations" },
    tags: ["Cargo", "Asia-Pacific", "Aviation", "Logistics"],
  },
  {
    id: "air-transport-2",
    title: "Sustainable Aviation Fuel Agreement Covers 30% of Fleet",
    subtitle: "A landmark five-year SAF supply contract with Neste will reduce AVIS Air's lifecycle carbon emissions by an estimated 80,000 tonnes annually.",
    category: "air-transport",
    content: `<p>AVIS Air has signed a five-year sustainable aviation fuel supply agreement with Neste, the world's largest producer of renewable diesel and SAF. The deal will provide sufficient SAF to cover 30% of AVIS Air's total fuel consumption, blended at a 50/50 ratio with conventional Jet A-1.</p>
<h2>Environmental Impact</h2>
<p>The SAF, produced from waste fats and residual oils at Neste's Rotterdam refinery, achieves up to 80% lifecycle greenhouse gas reduction compared to conventional jet fuel. AVIS Air estimates the agreement will eliminate approximately 80,000 tonnes of CO₂ annually.</p>
<p>The contract includes a price escalation mechanism linked to the EU Emissions Trading System carbon price, ensuring cost predictability for both parties as regulatory frameworks evolve.</p>
<div class="pull-quote">Sustainable aviation fuel is the most immediate and impactful decarbonisation lever available to commercial aviation today.</div>
<p>AVIS Air is also investing in next-generation power-to-liquid synthetic fuel research through a consortium with Lufthansa Technik and the German Aerospace Centre (DLR), with a pilot plant expected to begin production in 2027.</p>`,
    publishedAt: "2025-05-12",
    readingTime: 5,
    author: { name: "Anna Bergström", role: "Sustainability Officer" },
    tags: ["SAF", "Aviation", "Carbon Reduction", "Neste"],
  },
  {
    id: "automotive-1",
    title: "Electric Vehicle Prototype Enters Testing Phase",
    subtitle: "The AVIS EV-1, a mid-size electric sedan with 680 km range, begins road testing on public roads in Bavaria following TÜV certification.",
    category: "automotive",
    content: `<p>AVIS Automotive has commenced public road testing of the EV-1, a mid-size electric sedan featuring a solid-state battery pack with a projected range of 680 km under WLTP conditions. The prototype received its TÜV safety certification in April 2025 after completing 120,000 km of closed-circuit testing at the Nürburgring and AVIS's own Sarno test facility.</p>
<h2>Powertrain Specifications</h2>
<p>The EV-1 is powered by a dual-motor all-wheel-drive system producing 420 kW (570 PS) and 680 Nm of torque. The 105 kWh solid-state battery, developed in partnership with QuantumScape, supports 350 kW DC fast charging, enabling a 10–80% charge in 18 minutes.</p>
<p>The chassis uses a combination of aluminium and carbon-fibre-reinforced polymer, keeping kerb weight to 1,780 kg despite the large battery. Aerodynamic efficiency is rated at Cd 0.21, aided by active aero elements and flush door handles.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>680 km WLTP range with 18-minute fast charging — benchmarks that exceed every current production EV in the segment.</p></div>
<p>Series production is targeted for Q4 2026 at AVIS Automotive's plant in Ingolstadt, with an initial annual capacity of 25,000 units. Pre-registration interest has already exceeded 8,000 expressions of intent from European and Asian markets.</p>`,
    publishedAt: "2025-05-10",
    readingTime: 6,
    author: { name: "Michael Brandt", role: "Chief Engineer" },
    tags: ["EV", "Prototype", "Solid-State Battery", "Testing"],
  },
  {
    id: "automotive-2",
    title: "AVIS Automotive Opens Design Studio in Turin",
    subtitle: "A new 3,000 m² design centre in Italy's automotive heartland will develop the visual language for AVIS's next generation of vehicles.",
    category: "automotive",
    content: `<p>AVIS Automotive has inaugurated a new design studio in Turin, Italy, occupying 3,000 m² of a renovated Fiat-era industrial building in the Lingotto district. The studio will house a team of 45 designers, clay modellers, and digital visualisation specialists tasked with defining the brand's design direction for 2027 and beyond.</p>
<h2>Creative Direction</h2>
<p>The studio is led by Marco Pellegrini, formerly of Pininfarina, who has articulated a design philosophy centred on "engineered elegance" — the intersection of aerodynamic efficiency and emotional design language.</p>
<p>Facilities include a full-scale clay modelling workshop, a virtual reality cave for immersive design review, and a materials library containing over 4,000 fabric, leather, metal, and composite samples.</p>
<div class="pull-quote">Turin is where automotive design was born — there is no better place to imagine the future of mobility.</div>
<p>The first project emerging from the Turin studio will be the exterior and interior design of the EV-2, AVIS Automotive's planned electric crossover, which is expected to enter production in 2028. Early sketches reveal a bold, sculptural design language that departs significantly from the more conservative EV-1.</p>`,
    publishedAt: "2025-05-08",
    readingTime: 4,
    author: { name: "Marco Pellegrini", role: "Head of Design" },
    tags: ["Design", "Turin", "Studio", "EV-2"],
  },
  {
    id: "vortex-1",
    title: "Contactless Milling System Reduces Production Costs by 22%",
    subtitle: "Vortex's patented electromagnetic milling technology eliminates tool wear and achieves sub-micron precision at industrial scale.",
    category: "vortex",
    content: `<p>Vortex, AVIS Umbrella's advanced manufacturing division, has completed industrial validation of its contactless electromagnetic milling system. The technology uses precisely controlled magnetic fields to shape metal workpieces without physical tool contact, eliminating tool wear and reducing per-unit production costs by 22%.</p>
<h2>Technical Breakthrough</h2>
<p>The system generates a rotating magnetic vortex field that induces controlled material removal at the atomic level. Precision is maintained to ±0.3 microns, surpassing the capabilities of conventional CNC milling for most aerospace and medical device applications.</p>
<p>Because there is no physical contact between tool and workpiece, heat generation is reduced by 95%, eliminating the need for coolant fluids and their associated disposal costs and environmental impact.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>22% cost reduction with sub-micron precision — validated across 14,000 production cycles with zero defect rate.</p></div>
<p>The first commercial installation is scheduled for Airbus's Toulouse facility in Q3 2025, where it will be used for titanium turbine blade finishing. Vortex has a pipeline of 23 qualified prospects across aerospace, automotive, and medical device sectors.</p>`,
    publishedAt: "2025-05-06",
    readingTime: 5,
    author: { name: "Dr. Friedrich Wendt", role: "R&D Director" },
    tags: ["Manufacturing", "Electromagnetic", "Precision", "Cost Reduction"],
  },
  {
    id: "vortex-2",
    title: "Vortex Partners with CERN for Particle Detector Components",
    subtitle: "A €40 million contract will see Vortex manufacture ultra-precision components for CERN's next-generation particle detector upgrades.",
    category: "vortex",
    content: `<p>Vortex has been awarded a €40 million contract by CERN to manufacture ultra-precision components for the High-Luminosity Large Hadron Collider (HL-LHC) upgrade programme. The contract covers the production of 2,400 superconducting magnet support structures and 800 beam screen assemblies.</p>
<h2>Precision Requirements</h2>
<p>The components must meet tolerances of ±1 micron across structures up to 15 metres in length, while maintaining cryogenic compatibility at operating temperatures of 1.9 Kelvin. Vortex's electromagnetic milling system is the only commercial technology capable of achieving these specifications without post-processing.</p>
<p>Production will take place at Vortex's expanded facility in Aachen, which has been equipped with a new clean room rated to ISO Class 4 for the project.</p>
<div class="pull-quote">Working with CERN pushes the boundaries of what is manufacturable — and that is exactly where Vortex thrives.</div>
<p>Deliveries are scheduled over a five-year period beginning in early 2026, with a rigorous quality assurance programme involving joint inspections by CERN's engineering team and independent metrology consultants. The contract includes options for additional components valued at up to €15 million.</p>`,
    publishedAt: "2025-05-04",
    readingTime: 5,
    author: { name: "Dr. Helena Stark", role: "Senior Analyst" },
    tags: ["CERN", "Precision Manufacturing", "Physics", "Contract"],
  },
  {
    id: "power-1",
    title: "Alternative Generator HMD Exceeds 1 GW Output Milestone",
    subtitle: "AVIS Power's hydrodynamic generator platform has surpassed one gigawatt of cumulative installed capacity across 14 sites worldwide.",
    category: "power",
    content: `<p>AVIS Power has announced that its alternative generator HMD (Hydrodynamic Magnetic Drive) platform has exceeded one gigawatt of cumulative installed capacity, with 14 operational sites across Europe, Southeast Asia, and South America. The milestone was reached with the commissioning of a 120 MW installation in Chile.</p>
<h2>Technology Overview</h2>
<p>The HMD system converts kinetic energy from water flow into electricity using superconducting magnetic bearings that eliminate mechanical friction. Efficiency rates of 94% have been consistently demonstrated, compared to 85–90% for conventional hydroelectric turbines.</p>
<p>The technology is particularly suited to low-head, high-flow river installations where conventional turbines are economically unviable. Environmental impact is minimised through fish-safe passage designs validated by the International Commission for the Protection of the Danube River.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>1 GW cumulative installed capacity — equivalent to the output of a large nuclear power station, without radioactive waste.</p></div>
<p>AVIS Power's order backlog for HMD systems currently stands at 2.4 GW, with the largest pending projects in Indonesia (340 MW) and Brazil (280 MW). The company is investing €180 million in a new manufacturing facility in Saxony to increase annual production capacity to 500 MW.</p>`,
    publishedAt: "2025-05-02",
    readingTime: 6,
    author: { name: "Prof. Carlos Mendes", role: "Chief Technology Officer" },
    tags: ["HMD", "Hydropower", "Gigawatt", "Clean Energy"],
  },
  {
    id: "power-2",
    title: "Hydrogen Fuel Cell Plant Begins Commercial Operations",
    subtitle: "The 50 MW green hydrogen facility in Schleswig-Holstein produces fuel cells for heavy transport and industrial backup power applications.",
    category: "power",
    content: `<p>AVIS Power's first commercial-scale green hydrogen facility has begun operations in Brunsbüttel, Schleswig-Holstein. The 50 MW electrolyser plant produces up to 6,000 tonnes of green hydrogen annually, powered entirely by offshore wind energy from AVIS's North Sea installations.</p>
<h2>Production and Applications</h2>
<p>The hydrogen is compressed and stored in high-pressure tanks before being distributed to two primary markets: PEM fuel cells for heavy-duty transport (trucks, buses, and rail) and stationary fuel cell systems for industrial backup power and data centre applications.</p>
<p>A dedicated hydrogen pipeline connects the Brunsbüttel facility to the nearby ChemCoast Park industrial zone, supplying feedstock to chemical manufacturers who previously relied on grey hydrogen produced from natural gas.</p>
<div class="pull-quote">Green hydrogen is the missing link between renewable electricity generation and hard-to-decarbonise industrial sectors.</div>
<p>AVIS Power has secured offtake agreements covering 85% of the plant's annual output through 2030, with customers including Deutsche Bahn, a major logistics company, and two data centre operators. A second plant of 100 MW capacity is in the permitting stage for a site near Hamburg.</p>`,
    publishedAt: "2025-04-30",
    readingTime: 5,
    author: { name: "Ingrid Hoffmann", role: "Press Officer" },
    tags: ["Hydrogen", "Fuel Cells", "Green Energy", "Transport"],
  },
  {
    id: "logistics-1",
    title: "AI-Driven Supply Chain Optimization Cuts Delivery Time 30%",
    subtitle: "AVIS Logistics deploys a machine learning platform that dynamically routes shipments, reducing average delivery times by nearly a third across European operations.",
    category: "logistics",
    content: `<p>AVIS Logistics has rolled out an AI-powered supply chain optimization platform across its European operations, achieving a 30% reduction in average delivery times within the first quarter of deployment. The system processes real-time data from over 4,000 vehicles, 120 warehouses, and 50,000 daily shipments.</p>
<h2>How It Works</h2>
<p>The platform uses reinforcement learning algorithms trained on three years of historical logistics data to predict demand patterns, optimise route selection, and dynamically reallocate inventory across the warehouse network. Decision latency is under 200 milliseconds, enabling real-time rerouting in response to traffic, weather, or capacity changes.</p>
<p>Integration with AVIS Shipping and AVIS Air cargo systems allows the platform to seamlessly coordinate multimodal shipments, selecting the optimal combination of road, rail, sea, and air transport for each consignment.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>30% faster deliveries, 18% reduction in fuel consumption, and 12% improvement in vehicle utilisation rates.</p></div>
<p>Customer satisfaction scores have increased by 15 points since deployment, and the platform has identified €23 million in annual cost savings through reduced empty running and improved load consolidation. AVIS Logistics plans to extend the system to its Middle Eastern and Asian operations by Q1 2026.</p>`,
    publishedAt: "2025-04-28",
    readingTime: 5,
    author: { name: "Stefan Köhler", role: "Head of Digital Innovation" },
    tags: ["AI", "Supply Chain", "Optimization", "Delivery"],
  },
  {
    id: "logistics-2",
    title: "Automated Warehouse in Rotterdam Achieves Full Operational Status",
    subtitle: "The 85,000 m² robotic fulfilment centre processes 120,000 parcels daily with a 99.97% accuracy rate.",
    category: "logistics",
    content: `<p>AVIS Logistics' fully automated warehouse in Rotterdam's Maasvlakte industrial zone has reached full operational capacity, processing 120,000 parcels per day across 85,000 m² of floor space. The facility employs 450 autonomous mobile robots, 28 robotic picking arms, and an AI-driven warehouse management system.</p>
<h2>Automation Architecture</h2>
<p>The warehouse uses a goods-to-person model where autonomous mobile robots transport storage pods to stationary picking stations. Robotic arms equipped with machine vision handle 78% of picks autonomously, with human operators managing irregular items and quality assurance.</p>
<p>The facility's 99.97% order accuracy rate exceeds industry benchmarks by a significant margin, attributable to multi-stage verification including weight checks, barcode scanning, and photographic documentation of each packed order.</p>
<div class="pull-quote">Rotterdam is our blueprint for the warehouse of the future — where robots handle the repetitive and humans handle the exceptional.</div>
<p>Energy consumption per parcel processed is 40% below conventional warehouse benchmarks, achieved through LED lighting, rooftop solar panels generating 2.8 MW, and regenerative braking systems on the robotic fleet. AVIS Logistics is planning similar facilities in Duisburg and Milan, with construction expected to begin in 2026.</p>`,
    publishedAt: "2025-04-26",
    readingTime: 5,
    author: { name: "Peter van den Berg", role: "Facility Director" },
    tags: ["Automation", "Warehouse", "Rotterdam", "Robotics"],
  },
  {
    id: "publisher-1",
    title: "New AVIS Press Imprint Focuses on Tech and Sustainability",
    subtitle: "AVIS Publisher launches Blueprint Books, a non-fiction imprint dedicated to technology, sustainability, and the future of industry.",
    category: "publisher",
    content: `<p>AVIS Publisher has announced the launch of Blueprint Books, a new non-fiction imprint that will publish titles at the intersection of technology, sustainability, and industrial transformation. The imprint plans to release 24 titles annually, with its inaugural list featuring works by leading engineers, climate scientists, and business strategists.</p>
<h2>Editorial Vision</h2>
<p>Blueprint Books aims to fill a gap in the market for accessible, rigorously researched books that explain complex technological and environmental topics to a business-literate audience. The editorial team, based in Hamburg, includes former editors from MIT Press and Springer Nature.</p>
<p>Launch titles include "The Hydrogen Economy: From Promise to Pipeline" by energy economist Dr. Maria Santos, and "Building with Biology: The Future of Sustainable Construction" by AVIS Construction's own chief architect.</p>
<div class="highlight"><div class="highlight-label">Important</div><p>Blueprint Books' first 6 titles will be available in print, e-book, and audiobook formats simultaneously, with open-access editions for university libraries.</p></div>
<p>Distribution will be handled through a partnership with Penguin Random House's Verlagsgruppe division for German-speaking markets, and through Ingram for English-language territories. All titles will be printed on FSC-certified paper using plant-based inks.</p>`,
    publishedAt: "2025-04-24",
    readingTime: 4,
    author: { name: "Elisabeth Hartmann", role: "Editorial Director" },
    tags: ["Publishing", "Books", "Non-Fiction", "Blueprint"],
  },
  {
    id: "publisher-2",
    title: "AVIS Publisher Acquires Digital Magazine Platform",
    subtitle: "The acquisition of Mediavolt brings 14 digital magazine titles and 2.8 million monthly readers into the AVIS media ecosystem.",
    category: "publisher",
    content: `<p>AVIS Publisher has completed the acquisition of Mediavolt, a Berlin-based digital magazine platform operating 14 titles across technology, design, business, and lifestyle verticals. The deal, valued at €85 million, brings 2.8 million monthly unique readers and a subscription base of 340,000 paying members into the AVIS media portfolio.</p>
<h2>Strategic Rationale</h2>
<p>The acquisition provides AVIS Publisher with an established digital distribution infrastructure, a proven subscription revenue model, and a talented editorial team of 120 journalists and content creators.</p>
<p>Mediavolt's technology platform, built on a proprietary headless CMS with advanced personalisation algorithms, will be integrated with AvisTV's content recommendation engine to create a unified media experience across text, video, and audio.</p>
<div class="pull-quote">Mediavolt's digital DNA combined with AVIS's scale creates a media platform that can compete with the best in Europe.</div>
<p>All 14 Mediavolt titles will continue to operate independently under their existing brands, with no editorial staff reductions planned. AVIS Publisher expects the acquisition to be earnings-accretive within 18 months through advertising revenue synergies and cross-platform subscription bundling.</p>`,
    publishedAt: "2025-04-22",
    readingTime: 4,
    author: { name: "Jan-Philipp Weber", role: "Head of Investor Relations" },
    tags: ["Acquisition", "Digital Media", "Mediavolt", "Strategy"],
  },
  {
    id: "avistv-1",
    title: "Streaming Platform Reaches 5M Subscribers Globally",
    subtitle: "AvisTV crosses the five-million-subscriber mark, driven by exclusive documentary series and live business event coverage.",
    category: "avistv",
    content: `<p>AvisTV, AVIS Umbrella's streaming platform, has surpassed five million paid subscribers worldwide, achieving the milestone 14 months ahead of its original business plan projection. Growth has been driven by a combination of exclusive documentary content, live business event coverage, and strategic partnerships with telecommunications providers.</p>
<h2>Content Strategy</h2>
<p>AvisTV's most-watched original series, "Inside the Factory," which provides behind-the-scenes access to AVIS Umbrella's manufacturing facilities, has accumulated over 40 million views across three seasons. The platform's live coverage of major industry conferences and shareholder meetings has also proven popular with professional audiences.</p>
<p>The platform recently launched a dedicated "Markets and Analysis" channel featuring daily commentary from AVIS's in-house analysts, real-time data visualisations, and weekly deep-dive interviews with industry leaders.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>5 million subscribers — 14 months ahead of plan. Monthly active users exceed 3.2 million with an average session duration of 47 minutes.</p></div>
<p>AvisTV is available in 28 countries and supports 12 languages. The company plans to invest €120 million in original content production over the next two years, including a scripted drama series based on the history of European industrial innovation.</p>`,
    publishedAt: "2025-04-20",
    readingTime: 5,
    author: { name: "Sarah Lindqvist", role: "Chief Content Officer" },
    tags: ["Streaming", "Subscribers", "Content", "Growth"],
  },
  {
    id: "avistv-2",
    title: "AvisTV Launches Interactive Financial Dashboard for Viewers",
    subtitle: "A new second-screen experience allows subscribers to explore real-time market data, company financials, and analyst reports while watching business content.",
    category: "avistv",
    content: `<p>AvisTV has launched an interactive financial dashboard that provides subscribers with real-time market data, company financial summaries, and analyst reports synchronised with the platform's business programming. The feature is accessible via a companion web app and will be integrated directly into the main streaming interface in Q3 2025.</p>
<h2>Feature Details</h2>
<p>When viewers watch business news, interviews, or documentary content, the dashboard automatically surfaces relevant financial data, stock charts, and background information about the companies and topics being discussed. Users can pin securities to a watchlist, set price alerts, and access one-page analyst summaries.</p>
<p>Data is sourced from partnerships with Bloomberg, Refinitiv, and the Deutsche Börse, providing coverage of over 50,000 securities across global exchanges.</p>
<div class="pull-quote">We are transforming passive viewing into active intelligence — every piece of content becomes a gateway to deeper financial insight.</div>
<p>The dashboard is available to all AvisTV Premium subscribers at no additional cost. Early beta testing with 50,000 users showed 73% engagement with the feature during business programming, with an average of 12 data interactions per viewing session. AvisTV plans to add portfolio tracking and trade execution capabilities through a partnership with AvisBank in 2026.</p>`,
    publishedAt: "2025-04-18",
    readingTime: 5,
    author: { name: "David Chen", role: "Product Director" },
    tags: ["Fintech", "Dashboard", "Interactive", "Markets"],
  },
  {
    id: "press-1",
    title: "CEO Addresses Shareholders on 2025 Growth Targets",
    subtitle: "In the annual shareholder letter, AVIS Umbrella CEO outlines ambitious revenue targets, sustainability commitments, and plans for strategic acquisitions.",
    category: "press",
    content: `<p>AVIS Umbrella CEO Dr. Alexander Voss has published the annual shareholder letter, outlining 2025 growth targets that include a 15% revenue increase to €18.4 billion, EBITDA margin expansion to 22%, and a commitment to carbon neutrality across all European operations by year-end.</p>
<h2>Strategic Priorities</h2>
<p>Dr. Voss identified three strategic priorities for 2025: accelerating the energy transition through AvisGreens and AVIS Power investments, scaling the digital media ecosystem (AvisTV and AVIS Publisher), and completing the EV-1 vehicle programme for a Q4 2026 production launch.</p>
<p>The letter also addressed capital allocation, confirming a €2.1 billion acquisition budget for bolt-on transactions in health-tech, fintech, and advanced manufacturing. Dividend per share is proposed to increase by 8% to €3.85.</p>
<div class="pull-quote">Our diversified portfolio is not complexity — it is resilience. Each division strengthens the whole.</div>
<p>The shareholder letter was accompanied by a 45-minute video address available exclusively on AvisTV, featuring facility tours, employee interviews, and visualisations of key projects. Analyst consensus following the letter publication was broadly positive, with three upgrades and no downgrades across the 18 covering analysts.</p>`,
    publishedAt: "2025-04-16",
    readingTime: 5,
    author: { name: "Dr. Alexander Voss", role: "Chief Executive Officer" },
    tags: ["Shareholders", "Growth", "CEO", "Annual Letter"],
  },
  {
    id: "press-2",
    title: "AVIS Umbrella Named in TIME100 Most Influential Companies",
    subtitle: "The recognition highlights AVIS Umbrella's cross-sector impact in sustainability, manufacturing innovation, and corporate media.",
    category: "press",
    content: `<p>AVIS Umbrella has been named to the TIME100 Most Influential Companies list for 2025, recognising the conglomerate's impact across sustainability, advanced manufacturing, and corporate media. The selection committee cited AVIS's integrated approach to business — combining industrial scale with environmental responsibility and media transparency.</p>
<h2>Recognition Highlights</h2>
<p>TIME's profile specifically highlighted three AVIS initiatives: the AvisGreens renewable energy portfolio exceeding 500 MW, the Vortex contactless manufacturing technology, and AvisTV's innovative approach to corporate transparency through streaming media.</p>
<p>AVIS Umbrella joins a list that includes technology giants, pharmaceutical innovators, and climate-focused organisations from 30 countries.</p>
<div class="highlight"><div class="highlight-label">Important</div><p>AVIS Umbrella is one of only four European industrial conglomerates to be included in the 2025 TIME100 Most Influential Companies list.</p></div>
<p>Dr. Alexander Voss commented: "This recognition belongs to the 42,000 people across AVIS Umbrella who turn ambitious ideas into measurable impact every day." The company plans to leverage the recognition in upcoming investor roadshows and recruitment campaigns targeting top-tier engineering and business talent.</p>`,
    publishedAt: "2025-04-14",
    readingTime: 4,
    author: { name: "Margarethe Weiß", role: "Chief Communications Officer" },
    tags: ["TIME100", "Recognition", "Influence", "Awards"],
  },
  {
    id: "apad-1",
    title: "Hologram Quantum Computer Enters Beta Testing",
    subtitle: "aPad's revolutionary holographic quantum computing interface allows researchers to visualise and manipulate qubit states in three-dimensional space.",
    category: "apad",
    content: `<p>aPad, AVIS Umbrella's advanced computing division, has opened beta testing for its holographic quantum computing interface. The system projects a three-dimensional representation of quantum circuits and qubit states into physical space, allowing researchers to design, debug, and optimise quantum algorithms through gestural interaction.</p>
<h2>Interface Innovation</h2>
<p>The holographic display uses a custom light-field generator capable of producing 4K-resolution volumetric images within a 60 cm³ interaction zone. Researchers can pinch, rotate, and rearrange quantum gates using hand gestures tracked by an array of infrared cameras, dramatically reducing the learning curve for quantum algorithm development.</p>
<p>The underlying quantum processor is a 256-qubit superconducting chip maintained at 15 millikelvin in a dilution refrigerator. Quantum error correction is handled by aPad's proprietary surface code implementation, achieving logical error rates below one in a million.</p>
<div class="pull-quote">Making quantum computing tangible — literally — is how we bridge the gap between theoretical physics and practical engineering.</div>
<p>Beta access has been granted to research groups at ETH Zurich, Max Planck Institute for Quantum Optics, and Oxford University. aPad plans a commercial release in Q2 2026, targeting pharmaceutical companies, financial institutions, and national laboratories.</p>`,
    publishedAt: "2025-04-12",
    readingTime: 6,
    author: { name: "Dr. Yuki Tanaka", role: "Quantum Systems Lead" },
    tags: ["Quantum Computing", "Hologram", "Beta", "Research"],
  },
  {
    id: "apad-2",
    title: "aPad Tablet Line Achieves Carbon-Neutral Manufacturing",
    subtitle: "Every aPad device produced from May 2025 onwards will carry a verified carbon-neutral certification, a first for the computing hardware industry.",
    category: "apad",
    content: `<p>aPad has announced that its entire tablet product line will achieve carbon-neutral manufacturing status from May 2025, making it the first computing hardware manufacturer to receive this certification from the Carbon Trust. The achievement covers all stages from raw material extraction through final assembly and packaging.</p>
<h2>Methodology</h2>
<p>Carbon neutrality was achieved through a combination of emissions reduction and high-quality carbon removal credits. Manufacturing emissions were cut by 64% through the transition to 100% renewable energy at aPad's production facility in Dresden, optimised logistics routes, and the elimination of air freight for component shipping.</p>
<p>Residual emissions of approximately 12 kg CO2e per device are offset through a portfolio of engineered carbon removal projects, including direct air capture facilities in Iceland and biochar production in Scandinavia.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>First computing hardware manufacturer to achieve Carbon Trust-verified carbon-neutral manufacturing across an entire product line.</p></div>
<p>Each aPad device will ship with a QR code linking to a detailed carbon accounting report for that specific unit's production run. The company is also developing a device recycling programme that will offer trade-in credits and ensure 95% material recovery rates.</p>`,
    publishedAt: "2025-04-10",
    readingTime: 4,
    author: { name: "Lisa Yamamoto", role: "Sustainability Manager" },
    tags: ["Carbon Neutral", "Manufacturing", "Tablets", "Certification"],
  },
  {
    id: "3d-printing-1",
    title: "Kinetic Fusion Printers Produce First Full Building Components",
    subtitle: "AVIS 3D Printing's kinetic fusion technology has successfully printed structural-grade concrete wall sections for a residential construction project.",
    category: "3d-printing",
    content: `<p>AVIS 3D Printing has achieved a landmark milestone by producing the first full-scale structural building components using its kinetic fusion printing technology. The system printed 24 reinforced concrete wall sections for a four-storey residential building in Lübeck, each measuring 3.2 metres tall and 6 metres long.</p>
<h2>Technology Advancement</h2>
<p>Kinetic fusion printing uses a high-velocity deposition process that accelerates concrete mix through an electromagnetic nozzle at speeds exceeding 200 m/s. The kinetic energy of impact densifies the material beyond what is achievable with conventional pouring and vibration, resulting in concrete with 40% higher compressive strength.</p>
<p>Steel reinforcement is embedded continuously during printing through an integrated wire-feed system, eliminating the need for separate rebar installation. Each wall section was printed in approximately four hours, compared to two days for conventional formwork-and-pour methods.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>First structurally certified 3D-printed building components in Germany — approved by DIBt for residential construction up to 5 storeys.</p></div>
<p>The Lübeck project is a collaboration with AVIS Construction and will serve as a demonstration building, with occupancy expected in Q1 2026. AVIS 3D Printing has received enquiries from construction firms in 12 countries following the announcement.</p>`,
    publishedAt: "2025-04-08",
    readingTime: 6,
    author: { name: "Dr. Markus Stein", role: "Head of Additive Manufacturing" },
    tags: ["3D Printing", "Construction", "Kinetic Fusion", "Innovation"],
  },
  {
    id: "3d-printing-2",
    title: "Medical-Grade Titanium Implants Now 3D Printed In-House",
    subtitle: "A new selective laser melting facility enables AVIS to produce patient-specific orthopaedic implants with 48-hour turnaround.",
    category: "3d-printing",
    content: `<p>AVIS 3D Printing has opened a dedicated medical additive manufacturing facility in Erlangen, Bavaria, capable of producing patient-specific titanium orthopaedic implants with a turnaround time of just 48 hours from CT scan to sterilised, packaged implant ready for surgery.</p>
<h2>Production Process</h2>
<p>The facility houses six selective laser melting (SLM) machines operating with medical-grade Ti-6Al-4V titanium alloy powder. Each machine can produce up to 12 implants simultaneously, with layer resolutions as fine as 20 microns for the most complex geometries.</p>
<p>Patient CT scans are processed by AI software that automatically generates optimal implant designs, accounting for bone density, load distribution, and osseointegration surface textures. Surgeons can review and modify designs through a secure web portal before approving production.</p>
<div class="pull-quote">Every patient's anatomy is unique — their implant should be too. 3D printing makes personalised medicine a production reality.</div>
<p>The facility has received ISO 13485 and FDA 510(k) certifications, allowing distribution in the European Union and United States. Initial production focuses on hip and knee replacement components, with spinal implants planned for Q4 2025. Annual production capacity is projected at 15,000 implants.</p>`,
    publishedAt: "2025-04-06",
    readingTime: 5,
    author: { name: "Dr. Sarah Fischer", role: "Medical Devices Director" },
    tags: ["Medical", "Titanium", "Implants", "Personalised Medicine"],
  },
  {
    id: "test-facility-1",
    title: "Sarno Validation Center Certifies 40 New Product Lines",
    subtitle: "The AVIS test facility in Sarno, Italy, has completed validation and certification for 40 product lines across automotive, aerospace, and consumer electronics.",
    category: "test-facility",
    content: `<p>AVIS Test Facility's Sarno Validation Center has completed testing and certification for 40 new product lines in Q1 2025, setting a quarterly record for the facility. The certifications span automotive safety components, aerospace structural materials, consumer electronics durability, and medical device biocompatibility.</p>
<h2>Testing Capabilities</h2>
<p>The Sarno facility operates 14 specialised testing laboratories covering mechanical stress, thermal cycling, electromagnetic compatibility, environmental exposure, and accelerated life testing. Recent investments have added a 20G vibration table, a 2,000-bar pressure chamber, and an expanded anechoic chamber for EMC testing.</p>
<p>The facility is accredited by DAKKS (Germany), ACCREDIA (Italy), and UKAS (UK), with test results recognised in over 80 countries through mutual recognition agreements.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>40 product lines certified in Q1 2025 — a 60% increase over the same period last year, with zero failed submissions.</p></div>
<p>Approximately 35% of testing volume now comes from external clients, including major automotive OEMs and consumer electronics brands who value the facility's independence and breadth of accreditations. Revenue from external testing services grew 42% year-on-year.</p>`,
    publishedAt: "2025-04-04",
    readingTime: 5,
    author: { name: "Giuseppe Moretti", role: "Facility Manager" },
    tags: ["Testing", "Certification", "Sarno", "Quality"],
  },
  {
    id: "test-facility-2",
    title: "New Climate Simulation Chamber Replicates Extreme Environments",
    subtitle: "The facility's newest test chamber can simulate conditions from -70 to +180 degrees Celsius with humidity, altitude, and solar radiation control.",
    category: "test-facility",
    content: `<p>AVIS Test Facility has commissioned a state-of-the-art climate simulation chamber at its Sarno location, capable of replicating virtually any terrestrial environment from Arctic tundra to Saharan desert. The chamber measures 12 x 8 x 6 metres, large enough to test complete vehicles or large industrial equipment.</p>
<h2>Environmental Range</h2>
<p>Temperature range spans -70 to +180 degrees Celsius with ramp rates up to 15 degrees per minute. Relative humidity can be controlled from 5% to 98%, and altitude simulation up to 12,000 metres is achieved through a vacuum system that reduces atmospheric pressure to 200 mbar.</p>
<p>A solar simulation array using metal halide lamps reproduces irradiance levels up to 1,400 W/m², matching equatorial noon conditions. Rain, snow, fog, and dust simulation modules are available as configurable add-ons.</p>
<div class="pull-quote">If a product works in our chamber, it will work anywhere on Earth — and possibly beyond.</div>
<p>The chamber's first major project is the environmental qualification of AVIS Automotive's EV-1 battery pack, which must demonstrate safe operation across the full temperature range. Subsequent bookings include aerospace component testing for an undisclosed European space agency and durability testing for outdoor telecommunications equipment.</p>`,
    publishedAt: "2025-04-02",
    readingTime: 4,
    author: { name: "Dr. Francesca Ricci", role: "R&D Engineer" },
    tags: ["Climate Testing", "Simulation", "Extreme Environments", "Equipment"],
  },
  {
    id: "waste-facility-1",
    title: "Nanopowder Conversion Plant Processes 500 Tons Per Day",
    subtitle: "AVIS Waste Facility's proprietary plasma gasification system converts municipal waste into high-value nanopowder materials at industrial scale.",
    category: "waste-facility",
    content: `<p>AVIS Waste Facility has ramped its nanopowder conversion plant to full operational capacity, processing 500 tonnes of municipal solid waste per day and converting it into high-value nanopowder materials. The facility, located near Leipzig, uses a proprietary plasma gasification process that operates at temperatures exceeding 5,000 degrees Celsius.</p>
<h2>Conversion Process</h2>
<p>Incoming waste is first sorted and shredded, then fed into a plasma torch reactor where it is dissociated into its elemental components. The resulting gas stream is rapidly cooled through a controlled quenching process that causes atomic-scale recondensation, producing nanopowders with particle sizes between 10 and 100 nanometres.</p>
<p>Output materials include silicon dioxide, aluminium oxide, titanium dioxide, and carbon black nanoparticles — all of which command significant premiums over conventionally produced equivalents due to their exceptional purity and particle size uniformity.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>500 tonnes/day waste processing capacity — eliminating landfill while producing €4.2 million in nanomaterials per month.</p></div>
<p>The plant has achieved a 99.7% waste diversion rate, with only vitrified slag (used as aggregate in road construction) as a non-recovered output stream. AVIS Waste Facility has signed agreements with three German municipalities and is in discussions with waste management authorities in Poland and the Czech Republic.</p>`,
    publishedAt: "2025-03-30",
    readingTime: 6,
    author: { name: "Dr. Klaus Berger", role: "Plant Director" },
    tags: ["Waste Processing", "Nanopowder", "Plasma Gasification", "Circular Economy"],
  },
  {
    id: "waste-facility-2",
    title: "Zero-Landfill Certification Awarded to Leipzig Complex",
    subtitle: "The Leipzig waste processing complex has achieved TÜV-verified zero-landfill status, diverting 100% of processed waste from disposal.",
    category: "waste-facility",
    content: `<p>The AVIS Waste Facility complex in Leipzig has received TÜV Rheinland's zero-landfill certification, confirming that 100% of waste processed at the site is either converted into valuable materials, recovered as energy, or transformed into inert construction aggregates. No material from the facility enters landfill.</p>
<h2>Achievement Details</h2>
<p>The certification covers all four processing streams at the Leipzig complex: plasma gasification for nanopowder production, anaerobic digestion for biogas generation, mechanical-biological treatment for compost production, and thermal treatment with energy recovery for non-recyclable residuals.</p>
<p>Combined, the four streams process 850 tonnes of mixed municipal and commercial waste per day, generating approximately 35 MW of thermal energy (used to supply the Leipzig district heating network) and producing materials valued at over €6 million monthly.</p>
<div class="pull-quote">Zero-landfill is not just an environmental achievement — it is an economic one. Every tonne of waste is a tonne of raw material.</div>
<p>AVIS Waste Facility is now using the Leipzig complex as a reference site for potential clients and partners worldwide, with delegations from 15 countries having visited in the past six months. The company is planning a second integrated waste processing complex near Gdansk, Poland, with construction expected to begin in late 2025.</p>`,
    publishedAt: "2025-03-28",
    readingTime: 5,
    author: { name: "Eva Schneider", role: "Environmental Compliance Officer" },
    tags: ["Zero Landfill", "Certification", "TÜV", "Circular Economy"],
  },
  {
    id: "insurance-1",
    title: "AVIS Insurance Launches Parametric Climate Risk Products",
    subtitle: "New insurance products use satellite data and IoT sensors to provide automatic payouts when predefined climate thresholds are breached.",
    category: "insurance",
    content: `<p>AVIS Insurance has launched a suite of parametric climate risk insurance products targeting agricultural businesses, renewable energy operators, and coastal infrastructure owners. Unlike traditional indemnity policies, parametric products trigger automatic payouts when predefined environmental thresholds — such as rainfall levels, wind speeds, or temperature extremes — are breached.</p>
<h2>How It Works</h2>
<p>Payout triggers are monitored through a network of IoT weather stations, satellite earth observation data, and government meteorological service feeds. Smart contracts on a private blockchain automatically execute payments within 72 hours of a trigger event, eliminating the need for claims adjusters and reducing settlement times from months to days.</p>
<p>Products are available for drought protection (crop yield insurance), wind speed exceedance (offshore wind farm revenue protection), and coastal flood risk (infrastructure damage coverage).</p>
<div class="highlight"><div class="highlight-label">Important</div><p>72-hour automatic settlement via smart contract — no claims forms, no adjusters, no disputes.</p></div>
<p>The parametric product line has been developed in collaboration with Munich Re, which provides reinsurance capacity. Early adoption has been strong among AvisGreens' partner solar farms and AVIS Shipping's port infrastructure clients. Premium volume is projected to reach €180 million by 2026.</p>`,
    publishedAt: "2025-03-26",
    readingTime: 5,
    author: { name: "Dr. Matthias Jung", role: "Chief Actuary" },
    tags: ["Parametric Insurance", "Climate Risk", "IoT", "Smart Contracts"],
  },
  {
    id: "insurance-2",
    title: "Cyber Insurance Portfolio Grows 85% Year-on-Year",
    subtitle: "Rising demand from mid-market enterprises drives rapid growth in AVIS Insurance's cyber risk coverage offerings.",
    category: "insurance",
    content: `<p>AVIS Insurance's cyber insurance division has reported 85% year-on-year premium growth, reaching €420 million in gross written premium for 2024. The growth is driven by surging demand from mid-market enterprises (€50–500 million revenue) who are increasingly targeted by sophisticated ransomware and supply chain attacks.</p>
<h2>Product Innovation</h2>
<p>AVIS Insurance has differentiated its cyber offering through a "prevention-first" model that bundles coverage with proactive security services. Policyholders receive continuous vulnerability scanning, quarterly penetration testing, and access to a 24/7 incident response team staffed by former intelligence agency cyber specialists.</p>
<p>Premiums are dynamically priced based on real-time risk scoring, with discounts for clients who maintain strong security postures. Clients implementing all recommended controls receive up to 30% premium reductions.</p>
<div class="pull-quote">The best cyber insurance claim is the one that never happens — that is why we invest as much in prevention as in coverage.</div>
<p>Loss ratios have remained below 45% — significantly better than the industry average of 65% — attributed to the proactive security services that prevent many incidents before they escalate. AVIS Insurance plans to expand the cyber portfolio to North American markets in Q3 2025 through a partnership with a US-based managing general agent.</p>`,
    publishedAt: "2025-03-24",
    readingTime: 5,
    author: { name: "Tobias Krämer", role: "Cyber Risk Director" },
    tags: ["Cyber Insurance", "Growth", "Ransomware", "Prevention"],
  },
  {
    id: "real-estate-1",
    title: "Mixed-Use Development in Lisbon Breaks Ground",
    subtitle: "A €340 million project in Lisbon's Parque das Nações district will combine 800 residences, office space, and a rooftop urban farm.",
    category: "real-estate",
    content: `<p>AVIS Real Estate has broken ground on "Parque Vida," a €340 million mixed-use development in Lisbon's Parque das Nações district. The project, designed by Pritzker Prize-winning architect Eduardo Souto de Moura, will comprise 800 residential units, 25,000 m² of Grade A office space, ground-floor retail, and a 4,000 m² rooftop urban farm.</p>
<h2>Design Philosophy</h2>
<p>The development consists of five interconnected buildings of varying heights (8 to 22 storeys), arranged around a central public garden with native Mediterranean planting. The architectural language combines Lisbon's traditional limestone and azulejo tile aesthetic with contemporary glass and steel elements.</p>
<p>All buildings will achieve BREEAM Outstanding certification, with features including ground-source heat pumps, greywater recycling, and facade-integrated photovoltaic panels generating 1.2 MW of on-site renewable energy.</p>
<div class="highlight"><div class="highlight-label">Key Milestone</div><p>€340 million investment — AVIS Real Estate's largest single-site development and its first project in Portugal.</p></div>
<p>Residential units range from 45 m² studios to 180 m² penthouses, with pre-sales achieving 30% sell-through within three weeks of launch. Completion is scheduled for Q4 2027, with phased delivery beginning from Q2 2027.</p>`,
    publishedAt: "2025-03-22",
    readingTime: 5,
    author: { name: "Pedro Almeida", role: "Development Director" },
    tags: ["Real Estate", "Lisbon", "Mixed-Use", "Development"],
  },
  {
    id: "real-estate-2",
    title: "Smart Building Platform Deployed Across 30 Properties",
    subtitle: "AVIS Real Estate's IoT-based building management system now controls energy, security, and tenant services across its entire commercial portfolio.",
    category: "real-estate",
    content: `<p>AVIS Real Estate has completed the deployment of its proprietary smart building platform, "AVIS Living," across all 30 properties in its commercial real estate portfolio. The IoT-based system integrates building management, energy optimisation, security, and tenant services into a unified digital interface.</p>
<h2>Platform Capabilities</h2>
<p>AVIS Living connects over 45,000 sensors and actuators across the portfolio, monitoring temperature, humidity, air quality, occupancy, lighting levels, and energy consumption in real-time. Machine learning algorithms continuously optimise HVAC and lighting systems, reducing energy consumption by an average of 28% compared to conventional building management.</p>
<p>Tenants access building services through a mobile app that handles access control, meeting room booking, maintenance requests, package delivery notifications, and community features.</p>
<div class="pull-quote">A smart building is not about technology — it is about creating environments where people do their best work and live their best lives.</div>
<p>The platform has contributed to a 15-point increase in tenant satisfaction scores and a 22% reduction in maintenance response times. AVIS Real Estate is now licensing the platform to third-party property managers, with five licensing agreements signed in the past quarter generating a new recurring revenue stream.</p>`,
    publishedAt: "2025-03-20",
    readingTime: 4,
    author: { name: "Katrin Lehmann", role: "Head of PropTech" },
    tags: ["Smart Buildings", "IoT", "PropTech", "Portfolio"],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}

export function getArticlesByCategory(slug: string): Article[] {
  return articles.filter(a => a.category === slug);
}

export function getArticleById(id: string): Article | undefined {
  return articles.find(a => a.id === id);
}

export function getRelatedArticles(article: Article, count: number = 3): Article[] {
  return articles
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, count);
}
