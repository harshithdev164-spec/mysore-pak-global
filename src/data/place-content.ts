export interface LongFormContent {
  intro: string;
  history: {
    title: string;
    content: string;
    factBox: string;
  };
  architecture?: {
    title: string;
    content: string;
    highlights: { title: string; description: string }[];
  };
  attractions?: {
    title: string;
    items: { name: string; description: string }[];
  };
  timings: {
    title: string;
    table: { day: string; time: string }[];
    disclaimer: string;
  };
  tickets: {
    title: string;
    table: { category: string; price: string }[];
    disclaimer: string;
    gates?: { name: string; description: string }[];
    audioGuide?: string;
  };
  illumination?: {
    title: string;
    content: string;
    schedule: string[];
    timing: string;
    cost: string;
  };
  soundAndLight?: {
    title: string;
    content: string;
    table: { category: string; price: string }[];
  };
  dasara?: {
    title: string;
    content: string;
    highlights: string[];
  };
  howToReach: {
    title: string;
    address: string;
    options: { mode: string; description: string }[];
  };
  bestTime: {
    title: string;
    seasons: { season: string; description: string }[];
    advice: string;
    avoid?: string;
  };
  tips: string[];
  nearby: {
    title: string;
    table: { name: string; distance: string; type: string }[];
  };
  faqs: { q: string; a: string }[];
  conclusion: string;
  rules?: string;
}

export const placeLongFormContent: Record<string, LongFormContent> = {
  'mysore-palace': {
    intro: "Amba Vilas Palace — more commonly known as Mysore Palace — is the grand ceremonial residence of the Wadiyar dynasty and the most iconic landmark in Mysuru, Karnataka. Situated at the heart of the city and facing the Chamundi Hills, this breathtaking monument draws over six million visitors annually, making it one of the most visited tourist sites in India after the Taj Mahal.\n\nThe palace is not just a monument; it is a living symbol of Karnataka's royal legacy, a centre of cultural celebration, and an architectural masterpiece that has mesmerized travelers, historians, and photographers for over a century. Whether you are visiting Mysore for the first time or returning for the legendary Dasara festival, Amba Vilas Palace belongs at the top of your itinerary.",
    history: {
      title: "History of Amba Vilas Palace",
      content: "The story of Amba Vilas Palace begins in the 14th century when the first royal residence was constructed on the same site by Yaduraya Wodeyar — the founder of the Kingdom of Mysore. The palace was located inside the Old Fort, which was built of wood, and caught fire multiple times over the centuries.\n\nThe most significant fire occurred in 1896, during the wedding celebrations of Jayalakshammani, the eldest daughter of Maharaja Chamaraja Wodeyar. The old wooden palace was completely destroyed. Maharaja Krishnaraja Wadiyar IV and his mother, Maharani Kempananjammani Devi, commissioned the renowned British architect Henry Irwin to design a new palace. The Maharaja and his family moved to Jaganmohan Palace temporarily while construction was underway.\n\nConstruction of the current structure began in 1897 and was completed in 1912, at a total cost of approximately ₹41.47 lakhs — a sum equivalent to tens of millions of dollars in today's terms. The palace was named \"Amba Vilas\" — a tribute to the goddess Amba (Chamundeshwari), the royal family's presiding deity.\n\nToday, the Wadiyar family continues to occupy a small residential section of the palace, while the rest operates as a heritage museum under the Government of Karnataka.",
      factBox: "The current Amba Vilas Palace was built between 1897 and 1912 by British architect Henry Irwin in the Indo-Saracenic style. It replaced an older wooden palace that burned down in 1896 and serves as the ancestral home of the Wadiyar dynasty of Mysore."
    },
    architecture: {
      title: "Architecture: A Fusion of Four Styles",
      content: "Few palaces in the world showcase as rich an architectural dialogue as Amba Vilas. Henry Irwin drew inspiration from four distinct traditions — Hindu, Mughal, Rajput, and Gothic — blending them seamlessly into what is now classified as Indo-Saracenic Revival architecture.",
      highlights: [
        { title: "Exterior Structure", description: "The palace is a three-story structure approximately 75 metres long and 48 metres wide, built primarily from fine grey granite. The domes, including the dominant central dome plated in gold, are constructed with deep pink marble. Five-story square towers rise at each cardinal point, giving the palace an imposing, fortress-like silhouette." },
        { title: "The Facade", description: "The arched facade is adorned with a large sculpture of Goddess Gajalakshmi flanked by elephants — a symbol of wealth and prosperity. The coat of arms of the Mysore Kingdom and a Sanskrit motto, \"Nabhibe Ti Kadachana\" (Never be afraid), greet visitors at the main Jaya Maarthaanda Gate." },
        { title: "Stained Glass and Ceilings", description: "Perhaps the most awe-inspiring interior element is the stained glass ceiling of the Kalyana Mantapa (marriage pavilion), entirely crafted in Scotland and installed in Mysore. The ceiling's peacock-and-floral motifs combined with a grand chandelier imported from Czechoslovakia create a breathtaking visual effect." },
        { title: "Bronze Tigers", description: "At the main entrance, life-size bronze tigers sculpted by British artist Robert William Colton stand guard on either side of the walkway — a nod to Tipu Sultan's legacy and the royal family's warrior heritage." }
      ]
    },
    attractions: {
      title: "Top Attractions Inside the Palace",
      items: [
        { name: "Kalyana Mantapa (Marriage Pavilion)", description: "The octagonal marriage hall features a multi-colored stained glass ceiling, iron pillars painted green, and an ornate Czechoslovakian chandelier." },
        { name: "Durbar Hall (Public Audience Hall)", description: "Added in 1938, the Durbar Hall is where the Maharaja held public ceremonies. The hall has an ornate ceiling decorated with sculpted pillars." },
        { name: "Ambavilasa (Private Durbar Hall)", description: "The most opulent room in the palace, featuring gilded blue-and-gold wrought iron pillars and a stained glass ceiling." },
        { name: "Gombe Thotti (Dolls' Pavilion)", description: "Holds an eclectic collection of royal dolls, ivory pieces, and ceremonial artifacts spanning multiple generations." },
        { name: "Ane Bagilu (Elephant Gate)", description: "The principal gate of the palace interior, symbolizing royal power. Opened exclusively for the Dasara procession." },
        { name: "Golden Throne", description: "The jewel-encrusted golden throne of the Wadiyar dynasty, displayed publicly only during Dasara celebrations." },
        { name: "Palace Temples", description: "The palace complex houses over twelve temples, the oldest dating back to the 14th century." }
      ]
    },
    timings: {
      title: "Amba Vilas Palace Timings & Entry Hours",
      table: [
        { day: "Monday to Sunday", time: "10:00 AM – 5:30 PM" },
        { day: "Public Holidays", time: "10:00 AM – 5:30 PM" },
        { day: "Dasara Festival Period", time: "Extended hours (check official schedule)" }
      ],
      disclaimer: "Visiting timings mentioned are for reference only. Actual timings may vary due to holidays, maintenance, weather, or management decisions. Please verify before visiting."
    },
    tickets: {
      title: "Amba Vilas Palace Ticket Price (2025)",
      table: [
        { category: "Indian Adults", price: "₹50 per person" },
        { category: "Indian Children (7–12 years)", price: "₹30 per person" },
        { category: "Children below 7 years", price: "Free" },
        { category: "Foreign Nationals", price: "₹200" }
      ],
      disclaimer: "Prices mentioned are approximate and for reference only. Actual prices may vary depending on season, location, and availability.",
      gates: [
        { name: "South Gate (Balarama)", description: "Main entrance for the general public" },
        { name: "East Gate (Jaya Maarthaanda)", description: "VVIP and royal family use; opens for Dasara" },
        { name: "West Gate (Varaha)", description: "Open primarily during Dasara; also used for Sound and Light Show" },
        { name: "North Gate (Jayarama)", description: "Secondary entrance" }
      ],
      audioGuide: "Available in English, Hindi, Kannada, German, Italian, Japanese, and French. Included for Foreign Nationals."
    },
    illumination: {
      title: "Palace Illumination: When the Magic Happens",
      content: "The evening illumination of Amba Vilas Palace is considered one of the most spectacular visual experiences in India. When the sun sets and 97,000 electric bulbs light up the palace facade simultaneously, the structure transforms into a glowing golden apparition.",
      schedule: ["Every Sunday evening", "All Government Public Holidays", "Throughout the Dasara Festival"],
      timing: "7:00 PM to 7:45 PM (approximately 45-minute display)",
      cost: "The illumination maintenance alone costs approximately ₹1 crore per year."
    },
    soundAndLight: {
      title: "Sound and Light Show",
      content: "An immersive evening experience where the history of the Mysore Kingdom is narrated through dramatic lighting effects on the palace facade.",
      table: [
        { category: "Adults", price: "₹100" },
        { category: "Children", price: "₹40" }
      ]
    },
    dasara: {
      title: "Dasara Festival at Amba Vilas Palace",
      content: "For ten days culminating on Vijayadashami, the Amba Vilas Palace becomes the epicenter of Karnataka's grandest cultural celebration.",
      highlights: [
        "The Grand Procession (Jamboo Savari) with Goddess Chamundeshwari on a golden mantapa.",
        "Palace Illumination with 97,000 bulbs for two continuous months.",
        "Cultural Programs featuring artists from across India at the palace forecourt.",
        "Torchlight Parade held on the evening of Vijayadashami."
      ]
    },
    howToReach: {
      title: "How to Reach Amba Vilas Palace Mysore",
      address: "Amba Vilas Palace Road, Agrahara, Chamrajpura, Mysuru, Karnataka 570001",
      options: [
        { mode: "By Auto-Rickshaw", description: "The most convenient option. Simply say \"Mysore Palace\" — every driver knows the route." },
        { mode: "By City Bus", description: "KSRTC routes 201, 202, and 203 pass near the palace. Minimal fare." },
        { mode: "By Car/Cab", description: "Centrally located near the Mysore City Bus Stand. Parking available outside." },
        { mode: "From Bengaluru", description: "150 km away. Connected by direct buses, private cabs, and trains like Shatabdi Express." }
      ]
    },
    bestTime: {
      title: "Best Time to Visit Amba Vilas Palace",
      seasons: [
        { season: "October – November", description: "Best for Dasara. Peak festival season, book in advance." },
        { season: "September – February", description: "Best for Weather. Pleasant temperatures (18–28°C)." },
        { season: "March – May", description: "Warm but manageable. Crowds are lighter." },
        { season: "June – August", description: "Monsoon season. The city turns green and beautiful." }
      ],
      advice: "Visit on a Sunday to witness the evening illumination, but arrive early (10–11 AM) to explore the interiors before afternoon crowds peak.",
      avoid: "Long weekends and school holidays if you prefer smaller crowds."
    },
    tips: [
      "Arrive early at 10 AM to avoid queues.",
      "Hire an audio guide for layered history.",
      "Wear comfortable footwear (required to remove inside).",
      "No photography inside (strictly enforced).",
      "Plan for the Sunday illumination at 7 PM.",
      "Combine with nearby attractions like Mysore Zoo.",
      "Carry water for the expansive 44-acre grounds.",
      "Weekday visits are quieter."
    ],
    nearby: {
      title: "Nearby Attractions",
      table: [
        { name: "Mysore Zoo", distance: "0.8 km", type: "Wildlife & Nature" },
        { name: "Jaganmohan Palace", distance: "0.5 km", type: "Heritage & Art" },
        { name: "Chamundi Hills", distance: "13 km", type: "Pilgrimage" },
        { name: "Brindavan Gardens", distance: "19 km", type: "Gardens" },
        { name: "St. Philomena's Cathedral", distance: "1.2 km", type: "Landmark" },
        { name: "Devaraja Market", distance: "0.7 km", type: "Culture & Shopping" }
      ]
    },
    faqs: [
      { q: "What is Amba Vilas Palace famous for?", a: "Famous for Indo-Saracenic architecture, Durbar Hall, golden throne, Sunday illumination, and the Dasara festival." },
      { q: "Who built Amba Vilas Palace?", a: "Designed by Henry Irwin, commissioned by Maharaja Krishnaraja Wadiyar IV, built between 1897-1912." },
      { q: "What is the ticket price in 2025?", a: "₹50 for Indian adults, ₹30 for children (7-12), and ₹200 for foreign nationals (includes audio guide)." }
    ],
    conclusion: "Amba Vilas Palace Mysore is more than a monument — it is an experience that layers history, architecture, spirituality, and royal grandeur into one unforgettable visit. Whether you are gazing at its golden dome at dawn, exploring the opulent Ambavilasa Hall, or watching 97,000 bulbs light up the night, the palace delivers a sense of wonder at every turn.",
    rules: "Photography inside the palace interior is strictly prohibited. You may take photos on the grounds."
  },
  'sand-museum': {
    intro: "Most people visit Mysore for the Palace, the Chamundeshwari Temple, and the fragrance of sandalwood in the markets. Far fewer know that on the road leading up to Chamundi Hills, tucked beside a lush stretch of green, sits a museum unlike anything else in the country.\n\nThe Mysore Sand Sculpture Museum is India's first museum dedicated entirely to sand art. Established in 2014, it displays over 150 sand sculptures across 16 themes — from Mysore's royal heritage and Hindu mythology to ancient Egypt, Arabian Nights, and even Tom & Jerry. Built on just one acre of land, using 115 truckloads of construction sand and four months of unrelenting work, it is the life's creation of a single artist: M.N. Gowri.",
    history: {
      title: "The Artist Behind the Museum: M.N. Gowri",
      content: "The Mysore Sand Sculpture Museum is the story of one woman's commitment to an art form that almost no one in India had taken seriously as a profession.\n\nM.N. Gowri is a Mysuru-based sand artist with an MFA in Sculpture. Her background is unusual — she trained in machine tool technology and computer animation before pursuing sand sculpting full-time. She is widely recognised as the only female sand sculpture artist in India.\n\nTo build the museum, she leased a one-acre plot and took a ₹20 lakh loan — a significant financial risk. Over four months, she shaped and installed the 150 sculptures that opened to the public in 2014.",
      factBox: "Established in 2014 by artist M.N. Gowri, this is India's first sand sculpture museum. It houses over 150 sculptures made from 115 truckloads of construction sand, covering themes from mythology to pop culture."
    },
    architecture: {
      title: "The Technique: Permanent Sand Art",
      content: "Sand sculpting is typically temporary, associated with beaches. Gowri's vision was to make it semi-permanent. Each sculpture is built from a simple combination of sand, water, and a minimal amount of glue.",
      highlights: [
        { title: "Material", description: "Uses fine construction sand mixed with water and small amounts of organic glue for stability." },
        { title: "Protection", description: "Housed in an open-air gallery with overhead waterproof sheets to protect against rain while allowing natural light." },
        { title: "Maintenance", description: "Sculptures are brushed and repaired weekly; insecticide is used to prevent damage from pests." },
        { title: "Longevity", description: "With proper care, these delicate structures can last up to a year before requiring full restoration." }
      ]
    },
    attractions: {
      title: "Collection Highlights",
      items: [
        { name: "15-Foot Ganesha", description: "The arresting entrance piece carved in meticulous detail." },
        { name: "Heritage & Royalty", description: "Sculptures of Mysore King Srikanta Datta Narasimharaja Wadiyar and the Dasara procession." },
        { name: "Mythology", description: "Intricate depictions of Goddess Chamundeshwari and the Gitopadesha." },
        { name: "World Cultures", description: "Sections dedicated to Ancient Egypt, Arabian Nights, and Islamic culture." },
        { name: "3D Selfie Gallery", description: "Interactive 3D optical illusion paintings perfect for photographs." },
        { name: "Pop Culture", description: "Fun sculptures of Tom & Jerry and Disneyland themes for children." }
      ]
    },
    timings: {
      title: "Visitor Timings",
      table: [
        { day: "Monday to Sunday", time: "8:30 AM – 6:30 PM" },
        { day: "Holidays", time: "Open (unless extreme weather)" }
      ],
      disclaimer: "Timings may vary due to holidays or extreme weather. Please verify locally before visiting."
    },
    tickets: {
      title: "Entry Fees",
      table: [
        { category: "Adults", price: "₹40 – ₹60" },
        { category: "Children", price: "₹20 – ₹40" }
      ],
      disclaimer: "Prices are approximate and subject to revision by management."
    },
    howToReach: {
      title: "Getting There",
      address: "Chamundi Hill Main Road, KC Layout, Mysuru, Karnataka 570010",
      options: [
        { mode: "By Auto/Cab", description: "6 km from Mysore Railway Station (15-20 mins). Located on the main road to Chamundi Hills." },
        { mode: "By Bus", description: "Buses heading to Chamundi Hills stop at KC Layout near the museum." },
        { mode: "Nearby Landmark", description: "Directly opposite the Sea Shell Museum." }
      ]
    },
    bestTime: {
      title: "When to Visit",
      seasons: [
        { season: "Oct to Feb", description: "Pleasant weather, ideal for exploring open-air galleries." },
        { season: "Mar to May", description: "Visit in the early morning (8:30-11:00 AM) to avoid the heat." },
        { season: "Jun to Sep", description: "Monsoon season. Check for closures during heavy downpours." }
      ],
      advice: "Combine your visit with Chamundi Hills since it is on the same route."
    },
    tips: [
      "Carry cash for entry tickets.",
      "Budget 1.5 to 2 hours for a thorough visit.",
      "Visit in the morning or late afternoon for better lighting.",
      "The museum is not air-conditioned; wear light clothing in summer.",
      "Photography is allowed throughout."
    ],
    nearby: {
      title: "Nearby Attractions",
      table: [
        { name: "Sea Shell Museum", distance: "0.1 km", type: "Museum" },
        { name: "Chamundi Hills", distance: "4 km", type: "Temple" },
        { name: "Karanji Lake", distance: "2.5 km", type: "Nature" },
        { name: "Mysore Zoo", distance: "3 km", type: "Wildlife" }
      ]
    },
    faqs: [
      { q: "Who built the Sand Museum?", a: "It was built and is managed by M.N. Gowri, India's only female sand artist." },
      { q: "Is photography allowed?", a: "Yes, photography is permitted throughout the museum and the 3D gallery." },
      { q: "How many sculptures are there?", a: "Over 150 sculptures organized across 16 different themes." }
    ],
    conclusion: "The Mysore Sand Sculpture Museum is more than just a tourist stop; it's a testament to artistic perseverance. From the 15-foot Ganesha to the playful 3D gallery, it offers a unique, creative experience that beautifully complements Mysore's traditional heritage sites.",
    rules: "Touching the sculptures is strictly prohibited to prevent damage. Photography is allowed."
  },
  'payana-vintage-cars': {
    intro: "Somewhere between Bengaluru and Mysuru, just as the highway starts to flatten into the Deccan plains, a building shaped like a giant tyre rises from the landscape. It isn't easy to miss — and it isn't meant to be.\n\nThat tyre-shaped structure is the entrance to Payana Vintage Car Museum, one of South India's most exciting new cultural landmarks. Inaugurated in April 2024 on the Bengaluru-Mysuru Expressway, the museum has quickly become a must-stop for road-trippers, car enthusiasts, history lovers, and families looking for something more memorable than the usual tourist circuit.",
    history: {
      title: "The Visionary Founder: Shree D. Veerendra Heggade",
      content: "Founded by Shree D. Veerendra Heggade, the Dharmadhikari of Sri Kshetra Dharmasthala, Payana is an extension of the renowned Manjusha Museum. Heggade's lifelong passion for vintage automobiles and cultural preservation drove the creation of a museum that functions less like a showroom and more like a living archive.\n\nSpread across 23 acres, the museum houses a collection of 70+ vintage and classic vehicles, ranging from pre-Independence-era automobiles to iconic post-Independence Indian models. The building itself is an architectural statement before you've even seen a single car.",
      factBox: "Payana (Kannada for 'Journey') is the creation of Dr. Veerendra Heggade. Opened in 2024, it spans 23 acres and features 70+ rare vehicles, including those owned by royalty and Nobel laureates."
    },
    architecture: {
      title: "Design: The Tyre-Shaped Landmark",
      content: "The museum's architecture is as distinctive as its collection. The front facade is shaped like a massive car tyre, symbolizing the 'Payana' or journey of automotive history.",
      highlights: [
        { title: "Facade Design", description: "A unique tyre-shaped entrance that serves as a landmark on the Bengaluru-Mysuru Expressway." },
        { title: "Inclusive Infrastructure", description: "Designed with disabled-friendly slideways instead of stairs throughout, ensuring accessibility for all." },
        { title: "Restoration Unit", description: "A working facility where vintage cars are meticulously restored from scrap to pristine condition." },
        { title: "Campus Layout", description: "A 23-acre grounds featuring an open-air theatre and a multi-cuisine food court." }
      ]
    },
    attractions: {
      title: "Collection Highlights",
      items: [
        { name: "Personalities' Vehicles", description: "Cars belonging to Maharaja Jayachamarajendra Wadiyar, Nobel laureate Sir C.V. Raman, and film icon Dr. Vishnuvardhan." },
        { name: "The Rolls-Royce Timeline", description: "A dedicated section tracing Rolls-Royce models from 1904 all the way to 2022." },
        { name: "Pre-War Classics", description: "Rare specimens like the 1925 Austin Seven, 1938 Buick 8, and the 1947 Frazer Nash." },
        { name: "Urban Heritage", description: "Mumbai's iconic double-decker bus and the classic 'Kaali-peeli' black-and-yellow taxis." },
        { name: "Military Vehicles", description: "World War 2 Jeeps, Willy Trucks, and the massive Dodge Power Wagon." },
        { name: "Interactive Exhibits", description: "Dissected car models that expose internal engines and transmissions for educational discovery." }
      ]
    },
    timings: {
      title: "Museum Hours",
      table: [
        { day: "Monday to Sunday", time: "9:00 AM – 8:00 PM" },
        { day: "Public Holidays", time: "9:00 AM – 8:00 PM" }
      ],
      disclaimer: "Timings are for reference only and may vary due to maintenance or weather conditions."
    },
    tickets: {
      title: "Entry Fees (2025)",
      table: [
        { category: "Adults (13+ years)", price: "₹75" },
        { category: "Children (Under 12)", price: "Free" }
      ],
      disclaimer: "Prices are approximate and subject to change. QR codes at exhibits provide extended digital content."
    },
    howToReach: {
      title: "Location & Access",
      address: "Bengaluru–Mysuru Expressway, Brahmapura, opposite Bharat Benz, Srirangapatna, Karnataka 571477",
      options: [
        { mode: "From Mysuru", description: "9 km from city centre on NH275 (15-20 mins). Located near Srirangapatna." },
        { mode: "From Bengaluru", description: "Approximately 2 hours via the Expressway. Visible on the left side from Bengaluru." },
        { mode: "Travel Tip", description: "Take the service road off the expressway; look for the tyre-shaped building." }
      ]
    },
    bestTime: {
      title: "Planning Your Visit",
      seasons: [
        { season: "Best Hours", description: "Weekday mornings (9-11 AM) are ideal for avoiding crowds." },
        { season: "Duration", description: "Budget at least 2-3 hours for a thorough exploration of the collection." },
        { season: "Nearby Stop", description: "Combine with a visit to the historic Srirangapatna island fortress (15 mins away)." }
      ],
      advice: "The museum is fully wheelchair accessible with slideways throughout."
    },
    tips: [
      "Scan QR codes on exhibits for deep-dive technical specs.",
      "Visit the restoration unit to see mechanics bringing antique cars back to life.",
      "Wear comfortable walking shoes for the large 23-acre campus.",
      "The on-site food court is a great stop for road-trippers.",
      "Photography is encouraged; the tyre entrance is a great photo spot."
    ],
    nearby: {
      title: "Explore Nearby",
      table: [
        { name: "Srirangapatna", distance: "5 km", type: "Heritage" },
        { name: "Ranganathittu", distance: "8 km", type: "Nature" },
        { name: "Mysore Palace", distance: "12 km", type: "Heritage" },
        { name: "Brindavan Gardens", distance: "15 km", type: "Nature" }
      ]
    },
    faqs: [
      { q: "Who founded the Payana Museum?", a: "It was founded by Dr. Veerendra Heggade, Dharmadhikari of Dharmasthala." },
      { q: "Is it wheelchair accessible?", a: "Yes, it is designed with slideways throughout instead of stairs." },
      { q: "How many cars are on display?", a: "The collection features over 70 rare vintage and classic vehicles." }
    ],
    conclusion: "Payana Vintage Car Museum is not simply a place to look at old cars. It is a meditation on how machines carry memory — of people, of eras, and of the journeys that shaped our history. The tyre-shaped building on the highway is worth every minute you give it.",
    rules: "Photography is permitted throughout. Please do not cross exhibit barriers or touch the vehicles."
  },
  'wax-museum': {
    intro: "Most tourists visit Mysore for the Palace, Chamundi Hills, and the Dasara heritage. But nestled within the city's dense sightseeing circuit are two museums that tend to surprise visitors who stumble upon them — and delight visitors who plan for them.\n\nMysore has two wax museums, each with a completely different personality. One is a music-lover's paradise housed in a 90-year-old heritage building (Melody World). The other is a celebrity-focused experience with lifelike figures of global icons (Chamundeshwari Celebrity Wax Museum).",
    history: {
      title: "A Tale of Two Craftsmanships",
      content: "Melody World Wax Museum was established in 2010 by Shreeji Bhaskaran as a tribute to musical traditions. It operates within a heritage building over 90 years old, lending it a unique period atmosphere. Each statue here requires 50 kg of wax and takes up to four months to complete.\n\nChamundeshwari Celebrity Wax Museum, founded in 2018, is Karnataka's first celebrity-focused wax museum. Sculpted by artist Umesh Shetty and a team of 12 people, it focuses on high realism for its collection of Indian and international icons.",
      factBox: "Mysore houses two distinct wax museums: the music-themed Melody World (housed in a 90-year-old heritage structure) and the celebrity-focused Chamundeshwari Museum (Karnataka's first of its kind)."
    },
    architecture: {
      title: "Heritage vs. Modern Experience",
      content: "While one museum preserves the charm of Mysore's royal-era architecture, the other is built for high-energy family entertainment.",
      highlights: [
        { title: "Melody World Heritage", description: "Set in a 90-year-old building with 19 themed galleries dedicated to music genres." },
        { title: "Interactive Hub", description: "Chamundeshwari features a 3D art gallery, infinity room, and adventure rides." },
        { title: "Vortex Tunnel", description: "A unique spatial illusion attraction at Melody World that challenges your balance." },
        { title: "Horror Zones", description: "Both museums feature horror-themed walkthroughs with spooky wax figures and sound effects." }
      ]
    },
    attractions: {
      title: "What to See: Highlights from Both",
      items: [
        { name: "1,500+ Instruments", description: "At Melody World, explore musical history from the Stone Age to Jazz and Rock." },
        { name: "Iconic Celebrities", description: "At Chamundeshwari, pose with wax figures of PM Modi, Rajinikanth, and Lionel Messi." },
        { name: "Spiritual Statues", description: "Detailed figures of Raghavendra Swami and Mother Teresa." },
        { name: "Cartoon Gallery", description: "Wax replicas of Chota Bheem and Angry Birds for children at Melody World." },
        { name: "Infinity Room", description: "A visually striking mirror-and-light installation at the Celebrity museum." },
        { name: "3D Art Gallery", description: "Interactive optical illusion artworks perfect for photos at Chamundeshwari." }
      ]
    },
    timings: {
      title: "Visiting Hours",
      table: [
        { day: "Melody World (Daily)", time: "9:30 AM – 7:30 PM" },
        { day: "Celebrity Museum (Daily)", time: "9:00 AM – 7:00 PM" }
      ],
      disclaimer: "Timings are subject to change during public holidays or festivals. Verify locally before visiting."
    },
    tickets: {
      title: "Entry Fees",
      table: [
        { category: "Melody World (Adults)", price: "₹60" },
        { category: "Celebrity Museum (Adults)", price: "₹60" },
        { category: "Combo (Celebrity + Rides)", price: "₹100" },
        { category: "Camera Fee (Melody World)", price: "₹10" }
      ],
      disclaimer: "Children under 5 years typically enter for free at both locations."
    },
    howToReach: {
      title: "Locations & Directions",
      address: "Melody World (Siddhartha Layout); Celebrity Museum (Near CARP Ground, Race Course Rd)",
      options: [
        { mode: "Distance", description: "The two museums are only 2.5 km apart, making it easy to visit both in one trip." },
        { mode: "By Auto", description: "3 km from Mysore Palace. Simply ask for 'Siddhartha Layout Wax Museum' or 'CARP Ground Museum'." },
        { mode: "Public Transport", description: "Routes 340, 342, and 346 pass near Melody World's Jockey Quarters stop." }
      ]
    },
    bestTime: {
      title: "Planning Your Experience",
      seasons: [
        { season: "Oct to Mar", description: "The most comfortable months for city exploration." },
        { season: "Indoor Benefit", description: "Perfect rainy-day activity as most exhibits are indoors." },
        { season: "Crowds", description: "Visit early (before 11 AM) to avoid school groups and weekend rushes." }
      ],
      advice: "Combine both for a 3-hour half-day itinerary."
    },
    tips: [
      "Carry cash as some digital payment methods may have connectivity issues.",
      "Melody World is better for music/history lovers; Chamundeshwari is better for kids and selfies.",
      "Both have Horror walkthroughs—they are mildly scary but mostly fun.",
      "Adjacent to Melody World is Karanji Lake, perfect for a following walk.",
      "Chamundeshwari has an infinity room that is a must for Instagram photos."
    ],
    nearby: {
      title: "Nearby Gems",
      table: [
        { name: "Karanji Lake", distance: "0.2 km", type: "Nature" },
        { name: "Mysore Zoo", distance: "1 km", type: "Wildlife" },
        { name: "Mysore Palace", distance: "3 km", type: "Heritage" },
        { name: "Sand Museum", distance: "2 km", type: "Art" }
      ]
    },
    faqs: [
      { q: "How many wax museums are there?", a: "There are two: Melody World (Music-themed) and Chamundeshwari (Celebrity-themed)." },
      { q: "Which one is better for kids?", a: "Chamundeshwari is generally preferred for its adventure rides and 3D art gallery." },
      { q: "Can I take photos?", a: "Yes, both allow photography. Melody World has a small nominal fee for cameras." }
    ],
    conclusion: "Mysore overdelivers on museums. Whether you are exploring musical history in a 90-year-old heritage building or posing with your favorite stars, these wax museums offer an affordable and original layer to your Mysore journey.",
    rules: "Photography is allowed. Please do not touch the wax figures as they are delicate and expensive to restore."
  },
  'ranganathittu': {
    intro: "Sixteen kilometres north of Mysore, the Kaveri river widens quietly into a stretch of backwaters where six green islands rise from the water. On any given morning between October and March, these islands are almost invisible — hidden under a living canopy of Painted Storks, spot-billed pelicans, Asian openbill storks, cormorants, and kingfishers.\n\nThis is Ranganathittu Bird Sanctuary — Karnataka's largest bird sanctuary, a Ramsar-designated wetland of international importance, and one of the finest bird-watching destinations in peninsular India.",
    history: {
      title: "History: From 17th Century Dam to Bird Paradise",
      content: "The islands of Ranganathittu are a consequence of human engineering. Between 1645 and 1648, Mysore king Kanteerava Narasimharaja Wadiyar commissioned an embankment across the Kaveri River. The resulting islets became a natural nesting ground for birds.\n\nIn 1940, Dr. Salim Ali, India's most celebrated ornithologist, surveyed the region and persuaded the Maharaja of Mysore to grant it official protection. It was formally declared a bird sanctuary on 1 July 1940, marking it as a triumph of early Indian conservation.",
      factBox: "Ranganathittu was designated a Ramsar site in February 2022. Known locally as 'Pakshi Kashi' (the Varanasi of birds), it attracts up to 40,000 birds during peak winter months, including migrants from as far as Siberia."
    },
    architecture: {
      title: "Biodiversity: The Heart of the Kaveri",
      content: "With 170+ recorded bird species and a dense population of marsh crocodiles, Ranganathittu is a unique riverine ecosystem that balances avian and reptilian life in a compact 40-acre area.",
      highlights: [
        { title: "Resident Birds", description: "Home to Painted Storks, Asian Openbill Storks, Spot-billed Pelicans, and the elusive Stork-billed Kingfisher." },
        { title: "Migratory Visitors", description: "Host to species from Siberia, Central Asia, and Latin America during the winter months (Dec-Feb)." },
        { title: "Mugger Crocodiles", description: "Hosts Karnataka's largest freshwater crocodile population, often seen basking within metres of tourist boats." },
        { title: "Fruit Bat Colonies", description: "Large clusters of Flying Foxes roost in the tall trees along the river islets." }
      ]
    },
    attractions: {
      title: "The Ranganathittu Experience",
      items: [
        { name: "Guided Boat Rides", description: "The core experience; flat-bottomed boats take you through river channels for close-up bird and crocodile sightings." },
        { name: "Nature Interpretation Centre", description: "Educational displays detailing the sanctuary's history, ecology, and documented bird species." },
        { name: "Watch Towers", description: "Elevated platforms providing a panoramic scan of the islets and Kaveri backwaters." },
        { name: "Woodlot Walk", description: "A peaceful wilderness zone for walking amidst the forested sections of the sanctuary." }
      ]
    },
    timings: {
      title: "Visiting Hours",
      table: [
        { day: "Daily Entry", time: "9:00 AM – 6:00 PM" },
        { day: "Boating Hours", time: "9:30 AM – 5:30 PM" }
      ],
      disclaimer: "Entry and boating may be restricted during heavy monsoon rains or river floods."
    },
    tickets: {
      title: "Entry & Activity Fees (2025)",
      table: [
        { category: "Indian Adults", price: "₹75" },
        { category: "Indian Children", price: "₹25" },
        { category: "Foreign Adults", price: "₹300 – ₹500" },
        { category: "Shared Boat Ride (Indian)", price: "₹100" },
        { category: "Private Boat Ride", price: "₹1,000 – ₹2,000" }
      ],
      disclaimer: "Camera charges apply for DSLRs (₹150 for standard lenses; ₹600 for lenses above 500mm)."
    },
    howToReach: {
      title: "Location & Access",
      address: "Ranganathittu Rd, Srirangapatna, Mandya, Karnataka 571438",
      options: [
        { mode: "From Mysore", description: "19 km from city centre (30-40 mins). Easiest by taxi or auto-rickshaw." },
        { mode: "From Bengaluru", description: "130 km via the Expressway. A natural stop en route to Mysore." },
        { mode: "By Bus", description: "Take a bus to Srirangapatna bus stand, then an auto (4-5 km) to the gate." }
      ]
    },
    bestTime: {
      title: "Best Season for Birding",
      seasons: [
        { season: "Oct to Mar", description: "Peak season. Best weather and maximum bird variety." },
        { season: "Jan to Feb", description: "Prime window for 30+ migratory species arriving from the northern hemisphere." },
        { season: "Jun to Sep", description: "Monsoon season. Islets partially submerge; boat rides may be suspended." }
      ],
      advice: "Arrive for the first boat at 9:30 AM for the best light and bird activity."
    },
    tips: [
      "Bring binoculars (8x42 or 10x42) for observing nesting detail on the islands.",
      "Wear muted colors (greens and browns) to avoid disturbing the nesting colonies.",
      "A zoom lens (minimum 200mm) is essential for bird photography from the boat.",
      "The morning boat rides are significantly quieter and offer better wildlife sightings.",
      "Combine your visit with the historic town of Srirangapatna just 5 km away."
    ],
    nearby: {
      title: "Explore Nearby",
      table: [
        { name: "Srirangapatna", distance: "5 km", type: "Heritage" },
        { name: "Payana Car Museum", distance: "6 km", type: "Museum" },
        { name: "KRS Dam / Brindavan", distance: "16 km", type: "Gardens" },
        { name: "Mysore Palace", distance: "19 km", type: "Heritage" }
      ]
    },
    faqs: [
      { q: "Is the boat ride included in entry?", a: "No, boat ride charges are separate (approx. ₹100 for shared boats)." },
      { q: "Can we see crocodiles?", a: "Yes, it hosts Karnataka's largest mugger crocodile population; they are easily seen from the boats." },
      { q: "How long should I plan for?", a: "Budget 2 to 3 hours for a comfortable visit including the boat ride and nature center." }
    ],
    conclusion: "Ranganathittu is a 40-acre demonstration of what patient protection can do. Whether you are watching a Painted Stork adjust its wings eye-level from a boat or spotting a crocodile on the bank, this 'Pakshi Kashi' remains one of the most immersive wildlife experiences in South India.",
    rules: "Do not feed any animals (monkeys, birds, or crocodiles). Follow ranger instructions on the boat at all times."
  },
  'mysore-zoo': {
    intro: "Mysore Zoo (Sri Chamarajendra Zoological Gardens) is one of the oldest and most well-managed zoos in India, situated just 700 metres from the iconic Mysore Palace. Established in 1892, it spans 157 acres and is home to over 168 species of animals and birds, including rare residents like gorillas and three species of rhinoceros. This complete guide covers everything you need to plan your visit to one of Asia's premier zoological institutions.",
    history: {
      title: "History: From Royal Menagerie to India's Premier Zoo",
      content: "The story of Mysore Zoo begins in 1892, when Maharaja Chamaraja Wadiyar X carved out a private menagerie from 10 acres of the Summer Palace grounds. Originally called Khas-Bangle (the Private Bungalow), it was the king's personal collection of animals gathered from his travels across Europe and Africa. The Maharaja engaged G.H. Krumbeigal, a German landscaper and horticulturist, to design the grounds with shaded canopy walks and naturalistic enclosures that still define the zoo's character today. Public entry began in 1920, and in 1909, it was officially renamed Sri Chamarajendra Zoological Gardens in honour of its founder. Today, it is managed by the Zoo Authority of Karnataka.",
      factBox: "Established in 1892 by Maharaja Chamaraja Wadiyar X, Mysore Zoo is one of the oldest zoos in Asia. It was designed by German horticulturist G.H. Krumbeigal and covers 157 acres, including 77 acres of Karanji Lake."
    },
    attractions: {
      title: "Major Attractions & Zones",
      items: [
        { name: "Primate Section", description: "The only zoo in India to house Gorillas, alongside Chimpanzees and Orangutans." },
        { name: "Big Cats Zone", description: "Home to Royal Bengal Tigers (including White Tigers), Lions, Leopards, Jaguars, and Cheetahs." },
        { name: "Elephant Domain", description: "The largest elephant collection in any Indian zoo, featuring both Asiatic and African species." },
        { name: "Rhinoceros Enclosures", description: "The only zoo in India to house all three species: Indian One-Horned, Southern White, and African Black Rhino." },
        { name: "Walk-Through Aviary", description: "A massive netted space where visitors walk among Pelicans, Flamingos, Storks, and Cranes." },
        { name: "Reptile House", description: "Home to Green Anacondas, King Cobras, Iguanas, and seven species of Crocodiles." },
        { name: "Karanji Lake Nature Park", description: "A 77-acre wetland habitat perfect for birdwatching and boating." }
      ]
    },
    timings: {
      title: "Mysore Zoo Timings",
      table: [
        { day: "Wednesday to Monday", time: "8:30 AM – 5:30 PM" },
        { day: "Tuesday", time: "Closed" }
      ],
      disclaimer: "Last entry is at 4:30 PM. The zoo is closed every Tuesday for maintenance."
    },
    tickets: {
      title: "Ticket Prices 2026",
      table: [
        { category: "Adult (Weekday)", price: "₹100" },
        { category: "Child (Weekday)", price: "₹50" },
        { category: "Still Camera", price: "₹100" },
        { category: "Video Camera", price: "₹500" }
      ],
      disclaimer: "Prices are approximate. Weekend and holiday prices are higher. Online booking at mysuruzoo.info is recommended."
    },
    howToReach: {
      title: "How to Reach Mysore Zoo",
      address: "Zoo Main Road, Indiranagar, Mysuru – 570 010",
      options: [
        { mode: "By Cab/Auto", description: "Just 700m from Mysore Palace (5-min drive). Every auto driver knows the way." },
        { mode: "By Bus", description: "KSRTC city buses run frequently through the Zoo Road corridor." },
        { mode: "By Walk", description: "A pleasant 10-15 minute walk from the Mysore Palace area." }
      ]
    },
    bestTime: {
      title: "Best Time to Visit",
      seasons: [
        { season: "October to February", description: "Ideal mild weather (15°C–26°C) and peak bird activity." },
        { season: "Morning Slot (8:30 AM)", description: "Best for seeing active animals and avoiding crowds." }
      ],
      advice: "Arrive at 8:30 AM sharp to see the big cats and elephants feeding.",
      avoid: "Tuesdays (Closed) and weekend afternoons (Extremely crowded)."
    },
    tips: [
      "Book tickets online at mysuruzoo.info to skip the long entry queues.",
      "Plastic is strictly banned; carry water in a reusable steel or glass bottle.",
      "The Walk-Through Aviary closes at 5:00 PM; visit it before the final hour.",
      "Wear comfortable walking shoes as the circuit spans over 150 acres.",
      "Do not feed the animals or make loud noises to get their attention."
    ],
    nearby: {
      title: "Attractions Near Mysore Zoo",
      table: [
        { name: "Mysore Palace", distance: "700 m", type: "Heritage" },
        { name: "Karanji Lake", distance: "0 km", type: "Nature" },
        { name: "Chamundi Hills", distance: "4.5 km", type: "Spiritual" }
      ]
    },
    faqs: [
      { q: "Which animals are unique to Mysore Zoo?", a: "It is the only zoo in India with a Gorilla and all three rhinoceros species (Indian, White, and Black)." },
      { q: "Is the zoo open on public holidays?", a: "Yes, but it is always closed on Tuesdays, regardless of holidays." },
      { q: "Are battery-operated vehicles available?", a: "Yes, for those who prefer not to walk the entire 157-acre circuit." }
    ],
    conclusion: "For any visitor to Mysore, the zoo is essential. It offers a rare combination of historical landscape, world-class animal welfare, and species you simply won't find anywhere else in India. Whether you are a wildlife enthusiast, a photographer, or a family with children, Mysore Zoo delivers a genuinely memorable experience.",
    rules: "No feeding animals. No plastic. Stay on designated paths. Maintain silence near enclosures."
  },
  'grs-updown-museum': {
    intro: "GRS UpDown Museum is India's first and only upside-down photography attraction, located right beside GRS Fantasy Park on KRS Road, Mysuru. Launched in 2020, this fully air-conditioned museum features over 40 themed photo points with inverted gravity, allowing visitors to capture physics-defying photos that look like they're walking on walls or hanging from ceilings. It is one of Mysore's most innovative and Instagrammable tourist spots, perfect for families, couples, and content creators.",
    history: {
      title: "The Rise of India's First InstaMagic Attraction",
      content: "Opened in June 2020, GRS UpDown Museum was designed to bring a globally popular 'inverted house' concept to India. Since its launch, it has served over 8 lakh visitors and won the 'Most Innovative Attraction' award at the Amusement National Awards. The museum has expanded from its original 12 rooms to over 40 distinct photo points, integrating technology with creative set design to offer a unique interactive experience in Mysore.",
      factBox: "GRS UpDown Museum is India's first and only upside-down attraction. Since 2020, it has hosted over 800,000 visitors and features 40+ physics-defying photo points."
    },
    attractions: {
      title: "Interactive Zones & Photo Points",
      items: [
        { name: "Upside-Down Rooms", description: "Fully furnished living rooms, kitchens, and bedrooms fixed to the ceiling for perfect gravity-reversal photos." },
        { name: "40+ Themed Photo Points", description: "Diverse sets ranging from superhero landings to wall-walking and creative visual storytelling spots." },
        { name: "IlluSe Game Zone", description: "An interactive gaming area that layers digital illusion with physical sets for a tech-forward experience." },
        { name: "Vintage Vehicle Sets", description: "Nostalgic exhibits featuring a 19th-century car and vintage scooters for classic aesthetic shots." },
        { name: "Interactive Posing", description: "Dedicated staff members who guide your poses and help capture the perfect angles on your smartphone." }
      ]
    },
    timings: {
      title: "GRS UpDown Museum Timings",
      table: [
        { day: "Monday to Sunday", time: "10:30 AM – 7:00 PM" },
        { day: "Public Holidays", time: "10:30 AM – 8:00 PM" }
      ],
      disclaimer: "Open all days of the week, including national holidays."
    },
    tickets: {
      title: "Ticket Prices & Offers",
      table: [
        { category: "Standard Entry", price: "Check grsupdown.com" },
        { category: "Combo (UpDown + Snow)", price: "15% Discount" },
        { category: "Student Offer", price: "Discount with ID" },
        { category: "Birthday Special", price: "Free Entry" }
      ],
      disclaimer: "Birthday offer valid during the birthday month with ID proof. Online booking is recommended."
    },
    howToReach: {
      title: "How to Reach GRS UpDown Museum",
      address: "KRS Road, Beside GRS Fantasy Park, Mysuru",
      options: [
        { mode: "By Car / Cab", description: "Approximately 20-25 minutes from Mysore Palace or Railway Station. Ola/Uber available." },
        { mode: "By Bus", description: "Take KSRTC buses heading to KRS Dam; get down at GRS Fantasy Park stop." },
        { mode: "By Auto", description: "A very popular landmark; every driver in the city knows the GRS complex." }
      ]
    },
    bestTime: {
      title: "Planning Your Visit",
      seasons: [
        { season: "October to February", description: "Pleasant outdoor weather; the museum itself is fully air-conditioned year-round." },
        { season: "Weekdays (Tue-Fri)", description: "Best for avoiding crowds and having more time at each photo point." }
      ],
      advice: "Visit between 10:30 AM and 12:30 PM to enjoy the quietest slots before afternoon peaks.",
      avoid: "Weekend afternoons and major festival seasons like Dasara if you want to avoid long wait times."
    },
    tips: [
      "Let the staff pose you; they know exactly which angles make the upside-down illusion work.",
      "Shoot in portrait mode to capture the full height and depth of the inverted rooms.",
      "Wear solid, contrast-heavy colors for your photos; busy patterns can distract from the optical illusion.",
      "Purchase a combo ticket if you plan to visit GRS Snow Park or GRS Fantasy Park on the same day.",
      "Book online at grsupdown.com to save time at the ticket counter."
    ],
    nearby: {
      title: "Attractions Near GRS UpDown",
      table: [
        { name: "GRS Fantasy Park", distance: "0 m", type: "Water Park" },
        { name: "GRS Snow Park", distance: "0 km", type: "Indoor Snow" },
        { name: "Brindavan Gardens", distance: "8 km", type: "Garden/Fountain" }
      ]
    },
    faqs: [
      { q: "Do I need a professional camera?", a: "No, the attraction is designed specifically for smartphones. Staff are trained to help you get the best shots on your own phone." },
      { q: "Is it safe for senior citizens?", a: "Yes, it is fully accessible and does not require physical exertion beyond standard walking." },
      { q: "How long does a visit take?", a: "Most visitors spend between 45 minutes and 1 hour. Content creators may want up to 90 minutes." }
    ],
    conclusion: "If you're looking for a fun, interactive break from historical tours, GRS UpDown Museum is a must-visit. It's one of the most accessible and creative experiences in Mysore, offering photos that are guaranteed to stand out on any social feed. Whether it's a family outing or a creative session, the museum offers a unique way to 'flip' your Mysore experience.",
    rules: "No food inside the photo zones. Follow staff posing instructions for best results. Photography allowed on all devices."
  }
};
