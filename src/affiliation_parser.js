/////////////////////////////////////////////////////////////////////////////////////
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
// getCampus
//
/////////////////////////////////////////////////////////////////////////////////////
function getCampus(affiliationString){

  affiliationString = affiliationString.trim();
  if(!affiliationString || affiliationString==='#N/A'){
    return null;
  }
   
  const campus = [
    { abbr:'aa', key:'The University of Michigan-Ann Arbor', name:'Ann Arbor' },
    { abbr:'db', key:'The University of Michigan-Dearborn' , name:'Dearborn'  },
    { abbr:'fl', key:'The University of Michigan-Flint'    , name:'Flint'     }
  ];
  
  for(let i=0;i<campus.length;i++){
    if(affiliationString.match(campus[i].key)){
      return campus[i];
    }
  }
  // No match then default to Ann Arbor:
  return campus[0];
}

/////////////////////////////////////////
//
// getFacultyTitle
//
/////////////////////////////////////////
function getFacultyTitle(affiliationString){
  
  affiliationString = affiliationString.trim();
  if(!affiliationString || affiliationString==='#N/A'){
    return { is_faculty:null, title: null };
  }
   
  const title = [
    { key:'Professsor emerit(us|a)', name:'Professor Emeritus/a' },
    { key:'Assistant Professor', name:'Assistant Professor' },
    { key:'Associate Professor', name:'Associate Professor' },
    { key:'Professor', name:'Professor' },
    { key:'Lecturer', name:'Lecturer' }
  ];

  for(let i=0;i<title.length;i++){
    if( affiliationString.match(title[i].key)){
      return { is_faculty:true, title: title[i].name };
    }
  }
  // No match:
  return { is_faculty:false, title: null };
}

/////////////////////////////////////////////////////////////////////////////////////
//
// getSchoolOnCampus(campus,affiliationString)
//
/////////////////////////////////////////////////////////////////////////////////////
function getSchoolOnCampus(campus,affiliationString){

  affiliationString = affiliationString.trim();
  if( !affiliationString || affiliationString==='#N/A'){
    return null;
  }
  
  const schoolMap = {
    aa:{
      abbr:'AA',
      name:'Ann Arbor',
      school:[
        { key:'College of Architecture (and|&) Urban Planning', name:'Taubman College of Architecture and Urban Planning' },
        { key:'School of Art (and|&) Design', name:'Stamps School of Art and Design' },
        { key:'School of Business', name:'Ross School Business' },
        { key:'School of Education', name:'Marsal Family School of Education' },
        { key:'School of Information', name:'School of Information' },
        { key:'School of Kinesiology', name:'School of Kinesiology' },
        { key:'College of Engineering', name:'College of Engineering' },
        { key:'College of Literature, Science,? and the Arts', name:'College of Literature, Science and the Arts' },
        { key:'College of Pharmacy', name:'College of Pharmacy' },
        { key:'Institute for Social Research', name:'Institute for Social Research' },
        { key:'Law School', name:'Law School' },
        { key:'UMHS|Medical School|University of Michigan Hospitals|Michigan Medicine', name:'Medical School' },
        { key:'National Center for Institutional Diversity', name:'National Center for Institutional Diversity' },
        { key:'Office of the Vice President for Research', name:'Office of the Vice President for Research' },
        { key:'Rackham( School of Graduate Studies)?', name:'Rackham School of Graduate Studies' },
        { key:'SEAS|School for Environment (and|&) Sustainability', name:'School for Environment and Sustainability' },
        { key:'School of Dentistry', name:'School of Dentistry' },
        { key:'School of Education', name:'School of Education' },
        { key:'School of Information', name:'School of Information' },
        { key:'School of Music, Theat(re|er) (and|&) Dance', name:'School of Music, Theatre and Dance' },
        { key:'School of Nursing', name:'School of Nursing' },
        { key:'School of Pharmacy', name:'School of Pharmacy' },
        { key:'School of Public Health', name:'School of Public Health' },
        { key:'School of Public Policy', name:'School of Public Policy' },
        { key:'School of Social Work', name:'School of Social Work' },
        { key:'University Library', name: 'University Library' }
     ]
    },
    db:{
      abbr:'DB',
      name:'Dearborn',
      school:[    
        { key:'College of Arts, Sciences (and|&) Letters', name:'College of Arts, Sciences and Letters' },
        { key:'College of Business', name:'College of Business' },
        { key:'College of Education, Health,? (and|&) Human Services', name:'College of Education, Health and Human Services' },
        { key:'College of Engineering (and|&) Computer Science', name:'College of Engineering and Computer Science' }
      ]
    },
    fl:{
      abbr:'FL',
      name:'Flint',
      school:[
        { key:'College of Arts (and|&) Sciences|College of Arts,? Sciences (and|&) Education', 
          name:'College of Arts, Sciences and Education' },
        { key: 'School of Management', name:'School of Management' },
        { key: 'College of Health Sciences', name:'College of Health Sciences' },
        { key: 'School of Nursing', name:'School of Nursing' },
        { key:'College of Innovation (and|&) Technology', name:'College of Innovation and Technology' },
      ]
    }
  };

  const map = schoolMap[campus.abbr]
  if( map === undefined ){
    return null;
  }
  
  for(let i=0;i<map.school.length;i++){
    if(affiliationString.match( map.school[i].key )){
      return map.school[i].name;
    }
  }
  // no match:
  return null;
}

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

  const data={};
  data.campus = getCampus(line);
  data.school = getSchoolOnCampus(data.campus,line);
  const facultyStaffInfo = getFacultyTitle(line);
  data.is_faculty = facultyStaffInfo.is_faculty;

  console.log('==============')
  console.log(line);
  console.log(` +- campus: ${ data.campus ? data.campus.name : null }`);
  console.log(`      +- school: ${data.school}`);
  console.log(`           +- type: ${ data.is_faculty===null ? null : data.is_faculty ? 'faculty' : 'staff' }`);
} 


/////////////////////////////////////
//
// lineReader ON LINE PROCESSOR:
//
/////////////////////////////////////
let count=0;
lineReader.on('line',processLine);

