import { Article } from "@/types";

export const mockArticles: Article[] = [
  {
    id: "1",
    slug: "central-cee-announces-new-album-2025",
    title: "Central Cee Announces Surprise Album Drop This Friday",
    excerpt: "The West London rapper confirms his highly anticipated debut album is finally on the way, with features from some of the biggest names in UK and US rap.",
    content: `Central Cee has officially confirmed that his debut studio album will be dropping this Friday, sending fans into a frenzy across social media.

The West London rapper, who has dominated the UK drill scene for the past three years, took to Instagram to share the news with a cryptic post that quickly went viral.

The album is expected to feature collaborations with Dave, 21 Savage, and Lil Baby, according to sources close to the project. This would mark one of the most ambitious UK rap albums in recent memory, bridging the gap between UK drill and mainstream US hip-hop.

Industry insiders suggest the project has been in the works for over 18 months, with recording sessions taking place in London, Los Angeles, and Atlanta.

"This is the one everyone's been waiting for," said a source close to the rapper. "He's taken his time to make sure every track hits. No filler."

The announcement comes just weeks after Central Cee headlined a sold-out show at The O2 Arena, where he debuted several new tracks to an ecstatic crowd of 20,000.`,
    headerImage: "",
    author: {
      id: "a1",
      name: "Marcus Johnson",
      username: "marcusj",
      avatar: "",
      verified: true,
      followers: 12400,
    },
    publishDate: "2025-02-10",
    tags: ["MUSIC", "DROPS"],
    featured: true,
    likes: 2340,
    comments: 189,
    views: 45200,
  },
  {
    id: "2",
    slug: "uk-rap-awards-2025-nominees",
    title: "UK Rap Awards 2025: Full List Of Nominees Revealed",
    excerpt: "The nominations are in. From Dave to Little Simz, here's who's up for the biggest prizes in British rap this year.",
    content: "The UK Rap Awards has revealed its full list of nominees for 2025...",
    headerImage: "",
    author: {
      id: "a2",
      name: "Jade Williams",
      username: "jadewrites",
      avatar: "",
      verified: true,
      followers: 8700,
    },
    publishDate: "2025-02-09",
    tags: ["NEWS"],
    featured: false,
    likes: 1890,
    comments: 134,
    views: 32100,
  },
  {
    id: "3",
    slug: "opinion-uk-drill-dead-or-evolving",
    title: "Is UK Drill Dead Or Just Evolving?",
    excerpt: "The sound that defined a generation is changing. But is that a bad thing? We break down the state of drill in 2025.",
    content: "UK drill has always been a genre under pressure. From police intervention to YouTube censorship...",
    headerImage: "",
    author: {
      id: "a3",
      name: "Tobi Adeyemi",
      username: "tobiadeyemi",
      avatar: "",
      verified: false,
      followers: 3200,
    },
    publishDate: "2025-02-08",
    tags: ["OPINION"],
    featured: false,
    likes: 3400,
    comments: 267,
    views: 51800,
  },
  {
    id: "4",
    slug: "stormzy-glastonbury-headline-confirmed",
    title: "Stormzy Confirmed As Glastonbury 2025 Headliner",
    excerpt: "Big Mike is back on the Pyramid Stage. Glastonbury confirms Stormzy will headline Saturday night.",
    content: "Glastonbury Festival has confirmed that Stormzy will headline the Pyramid Stage...",
    headerImage: "",
    author: {
      id: "a1",
      name: "Marcus Johnson",
      username: "marcusj",
      avatar: "",
      verified: true,
      followers: 12400,
    },
    publishDate: "2025-02-07",
    tags: ["NEWS", "MUSIC"],
    featured: false,
    likes: 5600,
    comments: 312,
    views: 89400,
  },
  {
    id: "5",
    slug: "new-wave-producers-reshaping-uk-sound",
    title: "5 Producers Reshaping The UK Sound Right Now",
    excerpt: "From bedrooms in Birmingham to studios in Brixton, meet the beat-makers pushing boundaries.",
    content: "Behind every great rapper is a great producer...",
    headerImage: "",
    author: {
      id: "a2",
      name: "Jade Williams",
      username: "jadewrites",
      avatar: "",
      verified: true,
      followers: 8700,
    },
    publishDate: "2025-02-06",
    tags: ["CULTURE"],
    featured: false,
    likes: 1200,
    comments: 87,
    views: 18900,
  },
  {
    id: "6",
    slug: "dave-psychodrama-anniversary-tour",
    title: "Dave Announces Psychodrama Anniversary Tour Dates",
    excerpt: "Six years on and the classic album is getting a full live tour across the UK and Europe.",
    content: "Dave has announced a special anniversary tour celebrating his Mercury Prize-winning debut...",
    headerImage: "",
    author: {
      id: "a3",
      name: "Tobi Adeyemi",
      username: "tobiadeyemi",
      avatar: "",
      verified: false,
      followers: 3200,
    },
    publishDate: "2025-02-05",
    tags: ["MUSIC", "NEWS"],
    featured: false,
    likes: 2100,
    comments: 156,
    views: 34500,
  },
];

export const allTags = ["ALL", "MUSIC", "DROPS", "NEWS", "OPINION", "CULTURE"];

export const getTagColor = (tag: string): string => {
  const colors: Record<string, string> = {
    MUSIC: "tag-music",
    DROPS: "tag-drops",
    NEWS: "tag-news",
    OPINION: "tag-opinion",
    CULTURE: "tag-culture",
  };
  return colors[tag] || "tag-music";
};
