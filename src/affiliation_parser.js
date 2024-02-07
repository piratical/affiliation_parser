//////////////////////////////////////////////////////////////////////////////////////
//
// affiliation_parser
//
// This parser is designed to parse the affiliation field from an LDAP directory
// entry of staff or members of an organization.
//
// This parser (c) 2024 by Edward H. Trager. ALL RIGHTS RESERVED
// Released under GPL v.3
//
//////////////////////////////////////////////////////////////////////////////////////
const fs       = require('fs');
const readline = require('readline');

if(process.argv.length != 3){
  console.log('Please specify file to read.');
  process.exit(1);
}

/////////////////////////////////////////////////////////////////////////////////////
//
// Campuses:
//
/////////////////////////////////////////////////////////////////////////////////////
//const campus = [
//  { abbr:'aa', title:'The University of Michigan-Ann Arbor'},
//  { abbr:'db', title:'The University of Michigan-Dearborn' },
//  { abbr:'fl', title:'The University of Michigan-Flint'    }
//];

/////////////////////////////////////////////////////////////////////////////////////
//
// Schools and college by campus abbreviation:
//
/////////////////////////////////////////////////////////////////////////////////////
const campus = [
  { abbr:'aa',
    name:'Ann Arbor',
    school:[
      { key:'College of Architecture (and|&) Urban Planning', name:'College of Architecture and Urban Planning' },
      { key:'College of Engineering', name:'College of Engineering' },
      { key:'College of Literature, Science,? and the Arts', name:'College of Literature, Science and the Arts' },
      { key:'College of Pharmacy', name:'College of Pharmacy' },
      { key:'Institute for Social Research', name:'Institute for Social Research' },
      { key:'Law School', name:'Law School' },
      { key:'Medical School|University of Michigan Hospitals|Michigan Medicine', name:'Medical School' },
      { key:'National Center for Institutional Diversity', name:'National Center for Institutional Diversity' },
      { key:'Office of the Vice President for Research', name:'Office of the Vice President for Research' },
      { key:'School for Environment (and|&) Sustainability', name:'School for Environment and Sustainability' },
      { key:'School of Dentistry', name:'School of Dentistry' },
      { key:'School of Education', name:'School of Education' },
      { key:'School of Information', name:'School of Information' },
      { key:'School of Music, Theatre (and|&) Dance', name:'School of Music, Theatre and Dance' },
      { key:'School of Nursing', name:'School of Nursing' },
      { key:'School of Public Health', name:'School of Public Health' },
      { key:'School of Public Policy', name:'School of Public Policy' },
      { key:'School of Social Work', name:'School of Social Work' },
      { key:'University Library', name: 'University Library' }
    ]
  },
  { abbr:'db',
    name:'Dearborn',
    school:[    
      { key:'College of Arts, Sciences (and|&) Letters', name:'College of Arts, Sciences and Letters' },
      { key:'College of Education, Health (and|&) Human Services', name:'College of Education, Health and Human Services' },
      { key:'College of Engineering (and|&) Computer Science', name:'College of Engineering and Computer Science' }
    ],
  },
  { abbr:'fl',
    name:'Flint',
    school:[
      { key:'College of Innovation (and|&) Technology', name:'College of Innovation and Technology' },
      { key:'College of Arts (and|&) Sciences', name:'College of Arts and Sciences' }
     ]
  }
];

////////////////////////////////////////////////////////////
// 
// Unit or department within a school or institute (unit):
// 
///////////////////////////////////////////////////////////
const unit = [
  'Residential College',
  'American Culture',
  'Judaic Studies',
  '',
];

/////////////////////////////////////////////////
//
// arrayToRegexOptionGroup
//
// NOTE: This also sorts the array in place
//       in order to put longest options first
//       which is what you will want for proper
//       behavior in your regular expression.
//
/////////////////////////////////////////////////
function arrayToRegexOptionGroup(arr){
  // Sort to longest strings first.
  // Since we are sorting in descending order by
  // length, it seems reasonable to also do
  // the nested alphabetic sort in reverse order too.
  // This nested sort is not critical, but makes it a
  // little bit easier for human eyes:
  arr.sort( (a,b)=>{
    return b.length-a.length || b.localeCompare(a);
  });
  return '('+arr.join('|')+')';
}

// Turn the POS array into a regexp fragment with the OR operator '|' between each option:
//const posAbbr = arrayToRegexOptionGroup(abbr);
//console.log(posAbbr);

// REGEXPS FOR DATA COLLECTION:
//const peelPattern = new RegExp(`(.+) ${posAbbr}\. (.+)$`);
//const wppPattern  = new RegExp(`^${wppAbbr}\. (.+)$`);


// Accumulator class to save data in for multiline reads:
class Accumulator {
  // constructor
  constructor(entry,pos,def){
    this.entry=entry;
    this.pos=pos;
    this.def=def;
  }

  // reset:
  reset(){
    this.entry='';
    this.pos  ='';
    this.def  ='';
  }
  
  // set
  set(entry='',pos='',def=''){
    this.entry=entry;
    this.pos=pos;
    this.def=def;
  }

  // addToDefinition
  addToDefinition(s){
    s = s.trim();
    if( s.length === 0 ){
      return;
    }
    if(this.def && this.def.length && this.def.substr(this.def.length-1)!=' '){
      this.def += ' ';
    }
    this.def += s;
  }
  
  // write
  write(){
    if(this.entry || this.pos || this.def){
      console.log(`${this.entry}\t${this.pos}\t${this.def}`);
    }
  }
  
  // copy (copy constructor):
  copy(){
    return new Accumulator(this.entry,this.pos,this.def);
  }
}

// Global reusable container to accumulate the parts of an entry:
const accumulator = new Accumulator();

// On the first pass through, put all entries into this:
const accumulatorArray = [];

const inputFile = process.argv[2];
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(inputFile)
});

////////////////////////////////////////////
//
// processLine
//
////////////////////////////////////////////
function processLine(line){
  console.log('==============');
  for(let i=0;i<campus.length;i++){
    for(let j=0;j<campus[i].school.length;j++){
      const pattern = campus[i].school[j].key;
      //console.log(`TESTING ${item}...`);
      if(line.match(pattern)){
        console.log(`{ 'campus':'${campus[i].abbr}', school:'${campus[i].school[j].name}', 'line':'${line}' }`);
        return; 
      }
    }
  }
  console.log(`NO MATCH: ${line}`);
};

/////////////////////////////////////
//
// lineReader ON LINE PROCESSOR:
//
/////////////////////////////////////
let count=0;
lineReader.on('line',processLine);

//lineReader.on('line', function (line) {
  //console.log('==============');
  //const tokens = line.split(', ');
  //console.log(tokens);
//  school.
//  const matches = line.match(/(College|School).*/);
//  if(matches){
//    console.log(matches[0]);
//  }
//});

  //
  // JSONIFIED OUTPUT:
  //
  //console.log(JSON.stringify(accumulatorArray,null,1));
  //console.log(accumulatorArray.length);

