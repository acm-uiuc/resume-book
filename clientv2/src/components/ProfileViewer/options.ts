export const institutionOptions = [
    "University of Illinois Urbana-Champaign",
    "Massachusetts Institute of Technology (MIT)",
    "Stanford University",
    "Carnegie Mellon University",
    "University of California, Berkeley",
    "California Institute of Technology (Caltech)",
    "Harvard University",
    "University of Washington",
    "Princeton University",
    "University of California, Los Angeles (UCLA)",
    "University of Texas at Austin",
    "Cornell University",
    "University of Michigan, Ann Arbor",
    "University of California, San Diego",
    "University of Wisconsin-Madison",
    "Georgia Institute of Technology",
    "University of California, Irvine",
    "University of Southern California",
    "University of Maryland, College Park",
    "Columbia University",
    "University of Pennsylvania",
    "University of Chicago",
    "Yale University",
    "Duke University",
    "University of California, Santa Barbara",
    "University of North Carolina at Chapel Hill",
    "Purdue University",
    "University of California, Davis",
    "New York University (NYU)",
    "University of Minnesota, Twin Cities",
    "Rice University",
    "Northwestern University",
    "University of Florida",
    "University of Massachusetts Amherst",
    "Brown University",
    "Pennsylvania State University",
    "University of Virginia",
    "Johns Hopkins University",
    "University of Colorado Boulder",
    "University of Pittsburgh",
    "Rutgers University",
    "Ohio State University",
    "Boston University",
    "University of Utah",
    "Washington University in St. Louis",
    "University of California, Riverside",
    "Michigan State University",
    "University of Arizona",
    "University of Notre Dame",
    "Indiana University Bloomington"
  ];

const csPlusXMajors = [
    "Computer Science + Animal Sciences",
    "Computer Science + Crop Sciences",
    "Computer Science + Education",
    "Computer Science + Bioengineering",
    "Computer Science + Physics",
    "Computer Science + Music",
    "Computer Science + Anthropology",
    "Computer Science + Astronomy",
    "Computer Science + Chemistry",
    "Computer Science + Economics",
    "Computer Science + Geography & Geographic Information Science",
    "Computer Science + Linguistics",
    "Computer Science + Philosophy",
    "Computer Science + Advertising",
    "Mathematics & Computer Science",
    "Statistics & Computer Science"
];

export const degreeOptions = ["BS", "BSLAS", "BS/MS", "BS/MCS", "Master's (Thesis)" , "Master's (Non-Thesis)", "PhD"]
export type DegreeLevel = typeof degreeOptions[number];
const commonMajorsBS = [
    "Computer Science", "Computer Engineering", "Electrical Engineering"
];

const commonMajorsBSLAS = [
    "Mathematics"
];

const commonMajorsMasters = [
    "Computer Science", "Mathematics"
];

const allMajorsBS = [
    ...commonMajorsBS,
    "Accountancy", "Advertising", "Aerospace Engineering", "Agricultural and Biological Engineering", 
    "Agricultural Communications", "Agricultural Consumer Economics", "Agricultural Leadership, Education and Communications", 
    "Animal Sciences", "Anthropology", "Architectural Studies", "Art and Art History", "Astronomy", 
    "Atmospheric Sciences", "Biochemistry", "Bioengineering", "Biology", "Business Administration", 
    "Chemical Engineering", "Chemistry", "Civil Engineering", "Classics", "Communication", "Community Health", 
    "Comparative and World Literature", "Crop Sciences", "Dance", "Dietetics", "Earth, Society and Environmental Sustainability", 
    "Early Childhood Education", "Economics", "Elementary Education", "Engineering Mechanics", "English", "Environmental Sciences", 
    "Finance", "Food Science and Human Nutrition", "French", "Gender and Women's Studies", "Geography and Geographic Information Science", 
    "Geology", "Germanic Languages and Literatures", "Graphic Design", "History", "History of Art", "Human Development and Family Studies", 
    "Information Sciences", "Industrial Design", "Industrial Engineering", "Integrative Biology", "Interdisciplinary Health Sciences", 
    "Italian", "Journalism", "Kinesiology", "Landscape Architecture", "Latina/Latino Studies", "Linguistics", "Materials Science and Engineering", 
    "Media and Cinema Studies", "Meteorology", "Middle Grades Education", "Molecular and Cellular Biology", "Music", 
    "Natural Resources and Environmental Sciences", "Neuroscience", "Nuclear, Plasma, and Radiological Engineering", "Philosophy", 
    "Physics", "Plant Biotechnology", "Political Science", "Portuguese", "Psychology", "Recreation, Sport and Tourism", "Religion", 
    "Russian, East European, and Eurasian Studies", "Secondary Education", "Social Work", "Sociology", "Spanish", 
    "Speech and Hearing Science", "Statistics", "Studio Art", "Sustainability, Energy, and Environment Fellows Program", 
    "Systems Engineering and Design", "Theatre", "Urban Planning", "Writing Studies"
];

const allMajorsBSLAS = [
    ...csPlusXMajors, ...commonMajorsBSLAS,
    "Actuarial Science", "African American Studies", "Anthropology", "Astronomy", "Atmospheric Sciences", "Biochemistry", "Biology", 
    "Chemistry", "Classics", "Comparative and World Literature", "Earth, Society, and Environmental Sustainability", "Economics", "English", 
    "French", "Gender and Women's Studies", "Geography and Geographic Information Science", "Geology", "Germanic Languages and Literatures", 
    "History", "Integrative Biology", "Italian", "Latin American Studies", "Latina/Latino Studies", "Linguistics", 
    "Mathematics and Computer Science", "Molecular and Cellular Biology", "Philosophy", "Physics", "Political Science", "Portuguese", 
    "Psychology", "Religion", "Russian, East European, and Eurasian Studies", "Sociology", "Spanish", "Statistics"
];

const allMajorsMastersThesis = [
    ...commonMajorsMasters,
    "Aerospace Engineering", "Agricultural and Biological Engineering", "Animal Sciences", "Bioengineering", "Business Administration", 
    "Chemical and Biomolecular Engineering", "Civil and Environmental Engineering", "Crop Sciences", "Electrical and Computer Engineering", 
    "Entomology", "Food Science and Human Nutrition", "Geology", "Human Development and Family Studies", "Industrial and Enterprise Systems Engineering", 
    "Materials Science and Engineering", "Mechanical Engineering", "Microbiology", "Natural Resources and Environmental Sciences", 
    "Neuroscience", "Nuclear, Plasma, and Radiological Engineering", "Physics", "Plant Biology", "Psychology", "Statistics"
];

const allMajorsMastersNonThesis = [
    ...commonMajorsMasters,
    "Aerospace Engineering", "Agricultural and Biological Engineering", "Animal Sciences", "Bioengineering", "Business Administration", 
    "Chemical and Biomolecular Engineering", "Civil and Environmental Engineering", "Crop Sciences", "Electrical and Computer Engineering", 
    "Entomology", "Food Science and Human Nutrition", "Geology", "Human Development and Family Studies", "Industrial and Enterprise Systems Engineering", 
    "Materials Science and Engineering", "Mechanical Engineering", "Microbiology", "Natural Resources and Environmental Sciences", 
    "Neuroscience", "Nuclear, Plasma, and Radiological Engineering", "Physics", "Plant Biology", "Psychology", "Statistics"
];

const allMajorsPhD = [
    ...commonMajorsMasters,
    "Aerospace Engineering", "Agricultural and Biological Engineering", "Animal Sciences", "Bioengineering", "Chemical and Biomolecular Engineering", 
    "Civil and Environmental Engineering", "Crop Sciences", "Electrical and Computer Engineering", "Entomology", "Food Science and Human Nutrition", 
    "Geology", "Human Development and Family Studies", "Industrial and Enterprise Systems Engineering", "Materials Science and Engineering", 
    "Mechanical Engineering", "Microbiology", "Natural Resources and Environmental Sciences", "Neuroscience", 
    "Nuclear, Plasma, and Radiological Engineering", "Physics", "Plant Biology", "Psychology", "Statistics"
];

export const majorOptions: Record<DegreeLevel, string[]> = {
    "BS": allMajorsBS,
    "BSLAS": allMajorsBSLAS,
    "BS/MS": ["Computer Science"],
    "BS/MCS": ["Computer Science"],
    "Masters (Thesis)": allMajorsMastersThesis,
    "Masters (Non-Thesis)": allMajorsMastersNonThesis,
    "PhD": allMajorsPhD
};
