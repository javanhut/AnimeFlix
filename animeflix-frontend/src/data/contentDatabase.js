// Comprehensive content database for AnimeFlix
// This would typically come from your backend API

export const contentDatabase = {
  // Popular Anime Series
  "demon-slayer": {
    id: "demon-slayer",
    title: "Demon Slayer: Kimetsu no Yaiba",
    originalTitle: "鬼滅の刃",
    year: 2019,
    rating: "TV-14",
    imdbRating: 8.7,
    duration: "24min",
    status: "Ongoing",
    studio: "Ufotable",
    source: "Manga",
    type: "series",
    genres: ["Action", "Supernatural", "Historical", "Shounen"],
    description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    longDescription: "Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado's shoulders. Though living impoverished on a remote mountain, the Kamado family are able to enjoy a relatively peaceful and happy life. One day, Tanjirou decides to go down to the local village to make a little money selling charcoal.",
    banner: "https://images.unsplash.com/photo-1621570180008-b9e7c4d2cd35?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1621570180008-b9e7c4d2cd35?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1621570180008-b9e7c4d2cd35?w=300&h=170&fit=crop",
    seasons: 3,
    episodes: 44
  },
  
  "attack-on-titan": {
    id: "attack-on-titan",
    title: "Attack on Titan",
    originalTitle: "Shingeki no Kyojin",
    year: 2013,
    rating: "TV-MA",
    imdbRating: 9.0,
    duration: "24min",
    status: "Completed",
    studio: "Studio Pierrot",
    source: "Manga",
    type: "series",
    genres: ["Action", "Drama", "Fantasy", "Shounen"],
    description: "Humanity fights for survival against giant humanoid Titans that have breached their city walls. Eren Yeager and his friends join the fight to reclaim their world from these mysterious creatures.",
    longDescription: "Several hundred years ago, humans were nearly exterminated by giants. Giants are typically several stories tall, seem to have no intelligence, devour human beings and, worst of all, seem to do it for the pleasure rather than as a food source.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 4,
    episodes: 87
  },

  "jujutsu-kaisen": {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    originalTitle: "呪術廻戦",
    year: 2020,
    rating: "TV-14",
    imdbRating: 8.6,
    duration: "24min",
    status: "Ongoing",
    studio: "MAPPA",
    source: "Manga",
    type: "series",
    genres: ["Action", "Supernatural", "School", "Shounen"],
    description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
    longDescription: "Idly indulging in baseless paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather.",
    banner: "https://images.unsplash.com/photo-1621570180008-b9e7c4d2cd35?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1621570180008-b9e7c4d2cd35?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1621570180008-b9e7c4d2cd35?w=300&h=170&fit=crop",
    seasons: 2,
    episodes: 24
  },

  "one-piece": {
    id: "one-piece",
    title: "One Piece",
    originalTitle: "ワンピース",
    year: 1999,
    rating: "TV-14",
    imdbRating: 9.0,
    duration: "24min",
    status: "Ongoing",
    studio: "Toei Animation",
    source: "Manga",
    type: "series",
    genres: ["Action", "Adventure", "Comedy", "Shounen"],
    description: "Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left by the legendary Pirate, Gold Roger.",
    longDescription: "Gol D. Roger was known as the Pirate King, the strongest and most infamous being to have sailed the Grand Line. The capture and death of Roger by the World Government brought a change throughout the world.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 20,
    episodes: 1000
  },

  "naruto": {
    id: "naruto",
    title: "Naruto",
    originalTitle: "ナルト",
    year: 2002,
    rating: "TV-PG",
    imdbRating: 8.3,
    duration: "23min",
    status: "Completed",
    studio: "Studio Pierrot",
    source: "Manga",
    type: "series",
    genres: ["Action", "Adventure", "Martial Arts", "Shounen"],
    description: "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village's leader and strongest ninja.",
    longDescription: "Before Naruto's birth, a great demon fox had attacked the Hidden Leaf Village. A man known as the 4th Hokage sealed the demon inside the newly born Naruto, causing him to unknowingly grow up containing the demon fox.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 9,
    episodes: 720
  },

  "my-hero-academia": {
    id: "my-hero-academia",
    title: "My Hero Academia",
    originalTitle: "僕のヒーローアカデミア",
    year: 2016,
    rating: "TV-14",
    imdbRating: 8.5,
    duration: "24min",
    status: "Ongoing",
    studio: "Studio Bones",
    source: "Manga",
    type: "series",
    genres: ["Action", "School", "Superhero", "Shounen"],
    description: "A superhero-loving boy without any powers is determined to enroll in a prestigious hero academy and learn what it really means to be a hero.",
    longDescription: "In a world where eighty percent of the population has some kind of super-powered Quirk, Izuku was unlucky enough to be born completely normal. But that won't stop him from enrolling in a prestigious hero academy.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 6,
    episodes: 138
  },

  "death-note": {
    id: "death-note",
    title: "Death Note",
    originalTitle: "デスノート",
    year: 2006,
    rating: "TV-14",
    imdbRating: 9.0,
    duration: "23min",
    status: "Completed",
    studio: "Madhouse",
    source: "Manga",
    type: "series",
    genres: ["Supernatural", "Thriller", "Psychological", "Shounen"],
    description: "An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written into it.",
    longDescription: "Light Yagami is an ace student with great prospects—and he's bored out of his mind. But all that changes when he finds the Death Note, a notebook dropped by a rogue Shinigami death god.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 1,
    episodes: 37
  },

  "fullmetal-alchemist": {
    id: "fullmetal-alchemist",
    title: "Fullmetal Alchemist: Brotherhood",
    originalTitle: "鋼の錬金術師",
    year: 2009,
    rating: "TV-14",
    imdbRating: 9.1,
    duration: "24min",
    status: "Completed",
    studio: "Studio Bones",
    source: "Manga",
    type: "series",
    genres: ["Action", "Adventure", "Drama", "Shounen"],
    description: "Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes awry and leaves them in damaged physical forms.",
    longDescription: "After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse are left in a catastrophic new reality.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 1,
    episodes: 64
  },

  "spirited-away": {
    id: "spirited-away",
    title: "Spirited Away",
    originalTitle: "千と千尋の神隠し",
    year: 2001,
    rating: "PG",
    imdbRating: 9.3,
    duration: "125min",
    status: "Completed",
    studio: "Studio Ghibli",
    source: "Original",
    type: "movie",
    genres: ["Adventure", "Family", "Supernatural"],
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    longDescription: "Chihiro and her parents are moving to a new house in the Japanese countryside. After taking a wrong turn down a wooded path, they discover what appears to be an abandoned amusement park.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: null,
    episodes: null
  },

  "princess-mononoke": {
    id: "princess-mononoke",
    title: "Princess Mononoke",
    originalTitle: "もののけ姫",
    year: 1997,
    rating: "PG-13",
    imdbRating: 8.4,
    duration: "134min",
    status: "Completed",
    studio: "Studio Ghibli",
    source: "Original",
    type: "movie",
    genres: ["Adventure", "Drama", "Fantasy"],
    description: "On a journey to find the cure for a Tatarigami's curse, Ashitaka finds himself in the middle of a war between the forest gods and Tatara, a mining colony.",
    longDescription: "While protecting his village from a rampaging boar-god, the young warrior Ashitaka becomes afflicted with a deadly curse. To find the cure that will save his life, he journeys deep into sacred depths of the great forest.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: null,
    episodes: null
  },

  "your-name": {
    id: "your-name",
    title: "Your Name",
    originalTitle: "君の名は。",
    year: 2016,
    rating: "PG",
    imdbRating: 8.2,
    duration: "106min",
    status: "Completed",
    studio: "CoMix Wave Films",
    source: "Original",
    type: "movie",
    genres: ["Romance", "Drama", "Supernatural"],
    description: "Two teenagers share a profound, magical connection upon discovering they are swapping bodies. Things become even more complicated when the boy and girl decide to meet in person.",
    longDescription: "Mitsuha is the daughter of the mayor of a small mountain town. She's a straightforward girl who lives with her sister and grandmother and has no qualms about letting it be known that she's uninterested in Shinto rituals or helping her father's electoral campaign.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: null,
    episodes: null
  },

  "mob-psycho": {
    id: "mob-psycho",
    title: "Mob Psycho 100",
    originalTitle: "モブサイコ100",
    year: 2016,
    rating: "TV-14",
    imdbRating: 8.7,
    duration: "24min",
    status: "Completed",
    studio: "Studio Bones",
    source: "Manga",
    type: "series",
    genres: ["Action", "Comedy", "Supernatural", "Shounen"],
    description: "A psychic middle schooler and his con-man mentor exorcise evil spirits. But the psychic struggles with the morality of using his powers and the emotions he's suppressed.",
    longDescription: "Shigeo Kageyama, an average middle school student, nicknamed Mob, is aware that he taps into something beyond the natural when his emotions run high. In fact, his emotional state determines how powerful his psychic abilities become.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 3,
    episodes: 37
  },

  "haikyuu": {
    id: "haikyuu",
    title: "Haikyuu!!",
    originalTitle: "ハイキュー!!",
    year: 2014,
    rating: "TV-PG",
    imdbRating: 8.7,
    duration: "24min",
    status: "Completed",
    studio: "Production I.G",
    source: "Manga",
    type: "series",
    genres: ["Sports", "School", "Comedy", "Shounen"],
    description: "A high school volleyball player determined to become like his idol joins his school team and discovers what real teamwork means.",
    longDescription: "Inspired by a small-statured pro volleyball player, middle-schooler Shouyou Hinata creates a volleyball team in his last year of middle school and competes in a tournament.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 4,
    episodes: 85
  },

  "chainsaw-man": {
    id: "chainsaw-man",
    title: "Chainsaw Man",
    originalTitle: "チェンソーマン",
    year: 2022,
    rating: "TV-MA",
    imdbRating: 8.3,
    duration: "24min",
    status: "Ongoing",
    studio: "MAPPA",
    source: "Manga",
    type: "series",
    genres: ["Action", "Horror", "Supernatural", "Shounen"],
    description: "Following a betrayal, a young man left for dead is reborn as a powerful devil-human hybrid after merging with his pet devil and is soon enlisted into an organization dedicated to hunting devils.",
    longDescription: "Denji has a simple dream—to live a happy and peaceful life, spending time with a girl he likes. This is a far cry from reality, however, as Denji is forced by the yakuza into killing devils in order to pay off his crushing debts.",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 1,
    episodes: 12
  },

  "spy-family": {
    id: "spy-family",
    title: "Spy x Family",
    originalTitle: "スパイファミリー",
    year: 2022,
    rating: "TV-14",
    imdbRating: 8.6,
    duration: "24min",
    status: "Ongoing",
    studio: "WIT Studio",
    source: "Manga",
    type: "series",
    genres: ["Action", "Comedy", "Family", "Shounen"],
    description: "A spy must create a fake family to execute a mission, not realizing that the girl he adopts as a daughter is a telepath, and the woman he agrees to marry is a skilled assassin.",
    longDescription: "Master spy Twilight is the best at what he does when it comes to going undercover on dangerous missions in the name of a better world. But when he receives the ultimate impossible assignment—get married and have a kid—he may finally be in over his head!",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
    seasons: 2,
    episodes: 25
  }
};

// Search function that works with the database
export const searchContent = (query) => {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.toLowerCase().trim();
  const results = [];
  
  // Search through all content
  Object.values(contentDatabase).forEach(content => {
    // Check title matches
    if (content.title.toLowerCase().includes(searchTerm) ||
        content.originalTitle?.toLowerCase().includes(searchTerm) ||
        content.id.replace('-', ' ').includes(searchTerm)) {
      results.push(content);
      return;
    }
    
    // Check genre matches
    if (content.genres.some(genre => genre.toLowerCase().includes(searchTerm))) {
      results.push(content);
      return;
    }
    
    // Check studio matches
    if (content.studio?.toLowerCase().includes(searchTerm)) {
      results.push(content);
      return;
    }
    
    // Check year matches
    if (content.year.toString().includes(searchTerm)) {
      results.push(content);
      return;
    }
    
    // Check type matches (series/movie)
    if (content.type.toLowerCase().includes(searchTerm)) {
      results.push(content);
    }
  });
  
  // Remove duplicates and return
  return results.filter((content, index, self) => 
    index === self.findIndex(c => c.id === content.id)
  );
};

// Get detailed content with video URLs for watching
export const getWatchData = (id, episodeId = null) => {
  const content = getContentById(id);
  if (!content) return null;

  // Mock video URLs - replace with actual video URLs from your CDN/API
  const videoSources = {
    sub: `https://example.com/videos/${id}/sub/${episodeId || 'movie'}.mp4`,
    dub: `https://example.com/videos/${id}/dub/${episodeId || 'movie'}.mp4`
  };

  // Generate episode data with video URLs
  if (content.type === 'series' && episodeId) {
    const episodeData = {
      id: episodeId,
      title: `Episode ${episodeId.replace(/\D/g, '')}`,
      description: `Watch ${content.title} Episode ${episodeId.replace(/\D/g, '')}`,
      duration: content.duration,
      videoSources: videoSources,
      hasSubtitles: true,
      hasDub: true,
      defaultLanguage: 'sub' // Can be user preference
    };
    
    return {
      content: content,
      episode: episodeData,
      videoSources: videoSources
    };
  } else if (content.type === 'movie') {
    const movieData = {
      id: content.id,
      title: content.title,
      description: content.description,
      duration: content.duration,
      videoSources: videoSources,
      hasSubtitles: true,
      hasDub: content.id !== 'spirited-away' && content.id !== 'princess-mononoke', // Studio Ghibli movies typically don't have dubs in some regions
      defaultLanguage: 'sub'
    };
    
    return {
      content: content,
      episode: movieData,
      videoSources: videoSources
    };
  }

  return null;
};

// Get content by ID
export const getContentById = (id) => {
  // Handle various ID formats
  const searchToId = {
    'demon-slayer': 'demon-slayer',
    'demon slayer': 'demon-slayer',
    'kimetsu': 'demon-slayer',
    'kimetsu-no-yaiba': 'demon-slayer',
    'attack-on-titan': 'attack-on-titan',
    'attack on titan': 'attack-on-titan',
    'shingeki': 'attack-on-titan',
    'jujutsu-kaisen': 'jujutsu-kaisen',
    'jujutsu kaisen': 'jujutsu-kaisen',
    'one-piece': 'one-piece',
    'one piece': 'one-piece',
    'my-hero-academia': 'my-hero-academia',
    'my hero academia': 'my-hero-academia',
    'boku-no-hero': 'my-hero-academia',
    'death-note': 'death-note',
    'death note': 'death-note',
    'fullmetal-alchemist': 'fullmetal-alchemist',
    'fullmetal alchemist': 'fullmetal-alchemist',
    'fma': 'fullmetal-alchemist',
    'spirited-away': 'spirited-away',
    'spirited away': 'spirited-away',
    'princess-mononoke': 'princess-mononoke',
    'princess mononoke': 'princess-mononoke',
    'your-name': 'your-name',
    'your name': 'your-name',
    'kimi-no-na-wa': 'your-name',
    'mob-psycho': 'mob-psycho',
    'mob psycho': 'mob-psycho',
    'haikyuu': 'haikyuu',
    'chainsaw-man': 'chainsaw-man',
    'chainsaw man': 'chainsaw-man',
    'spy-family': 'spy-family',
    'spy family': 'spy-family',
    'spy-x-family': 'spy-family'
  };
  
  const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const mappedId = searchToId[normalizedId] || searchToId[id] || id;
  
  return contentDatabase[mappedId] || null;
};

export default contentDatabase;