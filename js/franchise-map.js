const FRANCHISE_MAP = {
  marvel: {
    title: "Marvel Cinematic Universe",

    curated: {
      movies: [
        1726,    // Iron Man
        10138,   // Iron Man 2
        68721,   // Iron Man 3
        76338,   // Thor: The Dark World
        1771,    // Captain America: The First Avenger
        24428,   // Avengers
        100402,  // Captain America: The Winter Soldier
        99861,   // Avengers: Age of Ultron
        271110,  // Captain America: Civil War
        284053,  // Thor: Ragnarok
        299536,  // Avengers: Infinity War
        299534,  // Avengers: Endgame
        497698,  // Black Widow
        566525,  // Shang-Chi
        634649,  // Spider-Man: No Way Home
        640146   // Ant-Man and the Wasp: Quantumania
      ],
      series: [
        85271,   // WandaVision
        84958,   // Loki
        88396,   // Falcon & Winter Soldier
        92749,   // Moon Knight
        91363    // She-Hulk
      ]
    },

    sources: [
      { type: "collection", value: 131292 },
      { type: "company-movie", value: 420 },
      { type: "keyword-tv", value: 180547 }
    ]
  },

  dc: {
    title: "DC Universe",

    curated: {
      movies: [
        297762, // Wonder Woman
        297761, // Suicide Squad
        141052, // Justice League
        495764, // Birds of Prey
        464052, // Wonder Woman 1984
        436969, // The Suicide Squad
        414906, // The Batman
        436270  // Black Adam
      ],
      series: [
        60735,  // The Flash
        1412,   // Arrow
        60708,  // Gotham
      ]
    },

    sources: [
      { type: "keyword-movie", value: 849 }, // DC keyword (movies)
      { type: "keyword-tv", value: 849 }     // DC keyword (series)
    ]
  },


  starwars: {
    title: "Star Wars",
    sources: [
      { type: "collection", value: 10 },        // Skywalker Saga
      { type: "keyword-movie", value: 131292 }, // Star Wars movies
      { type: "keyword-tv", value: 131292 },     // Star Wars series
      { type: "company-tv", value: 1 }
    ]
  },

  harrypotter: {
    title: "Harry Potter",
    sources: [
      { type: "collection", value: 1241 }
    ]
  },

  fastfurious: {
    title: "Fast & Furious",
    sources: [
      { type: "collection", value: 9485 }
    ]
  },

  jurassic: {
    title: "The Jurassic Franchise",
    sources: [
      { type: "collection", value: 328 }
    ]
  },

  xmen: {
    title: "X-Men",
    curated: {
      series: [
        4574 
      ]
    },
    sources: [
      { type: "collection", value: 748 }
    ]
  },

  transformers: {
    title: "Transformers",

    curated: {
      movies: [
        1858 // Transformers: The Movie (1986) – Animated
      ]
    },

    sources: [
      { type: "collection", value: 8650 }
    ]
  },

  johnwick: {
    title: "John Wick",

    curated: {
      movies: [
        404609,  
      ]
    },

    sources: [
      { type: "collection", value: 404609 } // John Wick Collection
    ]
  },


  lotr: {
    title: "Lord of the Rings",
    sources: [
      { type: "collection", value: 119 },      // LOTR + Hobbit movies
      { type: "keyword-tv", value: 130392 }    // Rings of Power (Middle-earth TV)
    ]
  },


  mission: {
    title: "Mission Impossible",
    sources: [
      { type: "collection", value: 87359 }
    ]
  },

  bond: {
    title: "James Bond",
    sources: [
      { type: "collection", value: 645 }
    ]
  },

  pirates: {
    title: "Pirates of the Caribbean",
    sources: [{ type: "collection", value: 295 }]
  },

  hungergames: {
    title: "The Hunger Games",
    sources: [{ type: "collection", value: 131635 }]
  },

  matrix: {
    title: "The Matrix Universe",
    sources: [{ type: "collection", value: 2344 }]
  },

  apes: {
    title: "Planet of the Apes",
    sources: [{ type: "collection", value: 173710 }]
  },

  predator: {
    title: "Predator",
    sources: [{ type: "collection", value: 399 }]
  },

  indiana: {
    title: "Indiana Jones",
    sources: [{ type: "collection", value: 84 }]
  },

  terminator: {
    title: "The Terminator",
    sources: [{ type: "collection", value: 528 }]
  },

  mib: {
    title: "Men in Black",

    curated: {
      movies: [
        479455 // Men in Black: International (Chris Hemsworth)
      ]
    },

    sources: [{ type: "collection", value: 86055 }]
  },

  madmax: {
    title: "Mad Max",
    sources: [{ type: "collection", value: 8945 }]
  },

  mazerunner: {
    title: "The Maze Runner",
    sources: [{ type: "collection", value: 295130 }]
  },

  alien: {
    title: "Alien Universe",
    sources: [{ type: "collection", value: 8091 }]
  },

  finaldestination: {
    title: "Final Destination",
    sources: [{ type: "collection", value: 8864 }]
  },
};
