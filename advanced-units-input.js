module.exports = [
  {
    // Light Ex Deus Summoner
    'id': '10101905', // used for generating filename, required by all entries
    'anime': [ // array of sprite sheets to be used
      'http://dlc.bfglobal.gumi.sg/content/unit/img/unit_anime_10101905_L.png',
      'http://dlc.bfglobal.gumi.sg/content/unit/img/unit_anime_10101905_U.png'
    ],
    'cgg': 'http://dlc.bfglobal.gumi.sg/content/unit/cgg/unit_cgg_10101901.csv', // CGG CSV file
    'cgs': { // mapping of animation name to CGS CSV file
      'idle': 'http://dlc.bfglobal.gumi.sg/content/unit/cgs/unit_idle_cgs_10101901.csv',
      'move': 'http://dlc.bfglobal.gumi.sg/content/unit/cgs/unit_move_cgs_10101901.csv',
      'atk': 'http://dlc.bfglobal.gumi.sg/content/unit/cgs/unit_atk_cgs_10101901.csv'
    },
    'doTrim': true // indicate that we should trim off all extra white space (may trim too much on some animations)
  },
  // {
  //   // Thunder Golem from Guild Raid
  //   'id': '87515244',
  //   'type': 'monster', // default is unit if not specified; used in generating filename
  //   'anime': ['http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/img/unit_anime_87515244.png'],
  //   'cgg': 'http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgg/unit_cgg_87515244.csv',	
  //   'cgs': {
  //     'idle': 'http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgs/unit_idle_cgs_87515244.csv',
  //     'atk': 'http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgs/unit_atk_cgs_87515244.csv'
  //   },
  // },
  // {
  //   // OE Vargas in a simplified format
  //   // NOTE: simplified format only supported by BF1 units
  //   'id': '10017',
  //   'server': 'gl',
  //   'doTrim': true
  // },
];
