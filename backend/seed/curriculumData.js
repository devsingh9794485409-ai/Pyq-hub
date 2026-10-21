// backend/seed/curriculumData.js

/**
 * Standard AKTU / Technical University Curriculum Catalog for B.Tech.
 * Semesters 1 to 8 across 8 supported branches:
 * CSE, IT, ECE, EE, ME, CE, AIML, DS.
 *
 * Verification Legend:
 * - isVerified: true  => Verified core curriculum against standard university syllabus (e.g. AKTU K-Series).
 * - isVerified: false => Specialization/Departmental elective track subject — common across universities,
 *                        needs confirmation against specific college elective distribution.
 */

// ── Common First Year Curriculum (Semesters 1 & 2) ─────────────────────────
// In AKTU/UPTAC, 1st year is divided into Physics Group (Group A) and Chemistry Group (Group B).
const COMMON_FIRST_YEAR = {
  1: [
    { code: 'KAS101', name: 'Engineering Physics', isVerified: true },
    { code: 'KAS103', name: 'Engineering Mathematics-I', isVerified: true },
    { code: 'KEE101', name: 'Basic Electrical Engineering', isVerified: true },
    { code: 'KCS101', name: 'Programming for Problem Solving', isVerified: true },
    { code: 'KCE101', name: 'Engineering Graphics & Design', isVerified: true },
    { code: 'KAS104', name: 'Communication Skills', isVerified: true },
  ],
  2: [
    { code: 'KAS202', name: 'Engineering Chemistry', isVerified: true },
    { code: 'KAS203', name: 'Engineering Mathematics-II', isVerified: true },
    { code: 'KME201', name: 'Basic Mechanical Engineering', isVerified: true },
    { code: 'KCS201', name: 'Python Programming', isVerified: true },
    { code: 'KAS204', name: 'Environment & Ecology', isVerified: true },
  ],
};

// ── CSE (Computer Science & Engineering) ───────────────────────────────────
// Updated B-series curriculum (Semesters 1-6) + senior year (Semesters 7-8)
const CSE = {
  1: [
    { code: 'BAS101', name: 'Engineering Physics', isVerified: true },
    { code: 'BAS103', name: 'Engineering Mathematics-I', isVerified: true },
    { code: 'BEC101', name: 'Fundamentals of Electronics Engineering', isVerified: true },
    { code: 'BME101', name: 'Fundamentals of Mechanical Engineering', isVerified: true },
    { code: 'BAS105', name: 'Soft Skills', isVerified: true },
    { code: 'BAS151', name: 'Engineering Physics Lab', isVerified: true },
    { code: 'BEC151', name: 'Basic Electronics Engineering Lab', isVerified: true },
    { code: 'BAS155', name: 'English Language Lab', isVerified: true },
    { code: 'BWS151', name: 'Workshop Practice Lab', isVerified: true },
  ],
  2: [
    { code: 'BAS202', name: 'Engineering Chemistry', isVerified: true },
    { code: 'BAS203', name: 'Engineering Mathematics-II', isVerified: true },
    { code: 'BEE201', name: 'Fundamentals of Electrical Engineering', isVerified: true },
    { code: 'BCS201', name: 'Programming for Problem Solving', isVerified: true },
    { code: 'BAS204', name: 'Environment and Ecology', isVerified: true },
    { code: 'BAS252', name: 'Engineering Chemistry Lab', isVerified: true },
    { code: 'BEE251', name: 'Basic Electrical Engineering Lab', isVerified: true },
    { code: 'BCS251', name: 'Programming for Problem Solving Lab', isVerified: true },
    { code: 'BCS252', name: 'Engineering Graphics & Design Lab', isVerified: true },
    { code: 'BVA251', name: 'Sports and Yoga', isVerified: true },
  ],
  3: [
    { code: 'BOE303', name: 'Material Science', isVerified: true },
    { code: 'BAS301', name: 'Technical Communication', isVerified: true },
    { code: 'BCS301', name: 'Data Structure', isVerified: true },
    { code: 'BCS302', name: 'Computer Organization and Architecture', isVerified: true },
    { code: 'BCS303', name: 'Discrete Structures & Theory of Logic', isVerified: true },
    { code: 'BCC301', name: 'Cyber Security', isVerified: true },
    { code: 'BCS351', name: 'Data Structure Lab', isVerified: true },
    { code: 'BCS352', name: 'Computer Organization and Architecture Lab', isVerified: true },
    { code: 'BCS353', name: 'Web Designing Workshop', isVerified: true },
    { code: 'BCC351', name: 'Internship Assessment / Mini Project', isVerified: true },
  ],
  4: [
    { code: 'BAS403', name: 'Mathematics-IV', isVerified: true },
    { code: 'BVE401', name: 'Universal Human Values and Professional Ethics', isVerified: true },
    { code: 'BCS401', name: 'Operating System', isVerified: true },
    { code: 'BCS402', name: 'Theory of Automata and Formal Languages', isVerified: true },
    { code: 'BCS403', name: 'Object Oriented Programming with Java', isVerified: true },
    { code: 'BCC402', name: 'Python Programming', isVerified: true }, // Verified official code (replaces duplicate BCS402)
    { code: 'BCS451', name: 'Operating System Lab', isVerified: true },
    { code: 'BCS452', name: 'Object Oriented Programming with Java Lab', isVerified: true },
    { code: 'BCS453', name: 'Cyber Security Workshop', isVerified: true },
    { code: 'BVA451', name: 'Sports and Yoga - II', isVerified: true },
  ],
  5: [
    { code: 'BCS501', name: 'Web Technology', isVerified: true },
    { code: 'BCS502', name: 'Design and Analysis of Algorithms (DAA)', isVerified: true },
    { code: 'BCS503', name: 'Object-Oriented System Design with C++ (OOSD)', isVerified: true },
    { code: 'BCS504', name: 'Application of Soft Computing (ASC)', isVerified: true },
    { code: 'BCS505', name: 'Database Management Systems (DBMS)', isVerified: true },
    { code: 'BVE501', name: 'Constitution of India (COI)', isVerified: true },
  ],
  6: [
    { code: 'BCS601', name: 'Compiler Design (CD)', isVerified: true },
    { code: 'BCS602', name: 'Computer Networks (CNW)', isVerified: true },
    { code: 'BVE601', name: 'Essence of Traditional Knowledge (EITK)', isVerified: true },
    { code: 'BCS603', name: 'Blockchain Architecture and Design (BCAD)', isVerified: true },
    { code: 'BCS604', name: 'Software Engineering (SE)', isVerified: true },
    { code: 'BVE602', name: 'Idea to Business Model (IBM)', isVerified: true },
  ],
  7: [
    { code: 'KCS701', name: 'Cryptography & Network Security', isVerified: true },
    { code: 'KCS702', name: 'Big Data Analytics', isVerified: true },
    { code: 'KCS703', name: 'Deep Learning', isVerified: true },
    { code: 'KCS704', name: 'Software Testing & Quality Assurance', isVerified: true },
  ],
  8: [
    { code: 'KCS801', name: 'Blockchain Technology', isVerified: true },
    { code: 'KCS802', name: 'Internet of Things', isVerified: true },
    { code: 'KCS803', name: 'Natural Language Processing', isVerified: true },
  ],
};

// ── IT (Information Technology) ───────────────────────────────────────────
const IT = {
  ...COMMON_FIRST_YEAR,
  3: [
    { code: 'KIT301', name: 'Data Structures & Algorithms', isVerified: true },
    { code: 'KIT302', name: 'Discrete Mathematics', isVerified: true },
    { code: 'KIT303', name: 'Computer Organization & Architecture', isVerified: true },
    { code: 'KIT304', name: 'Object Oriented Programming with Java', isVerified: true },
    { code: 'KAS301', name: 'Technical Communication', isVerified: true },
  ],
  4: [
    { code: 'KIT401', name: 'Operating Systems', isVerified: true },
    { code: 'KIT402', name: 'Design & Analysis of Algorithms', isVerified: true },
    { code: 'KIT403', name: 'Theory of Computation', isVerified: true },
    { code: 'KIT404', name: 'Database Management Systems', isVerified: true },
    { code: 'KIT405', name: 'Web Designing & Development', isVerified: true },
  ],
  5: [
    { code: 'KIT501', name: 'Information Security & Cyber Laws', isVerified: true },
    { code: 'KIT502', name: 'Computer Networks', isVerified: true },
    { code: 'KIT503', name: 'Design and Analysis of IT Systems', isVerified: true },
    { code: 'KIT504', name: 'Software Engineering', isVerified: true },
    { code: 'KIT505', name: 'Web Technology', isVerified: true },
  ],
  6: [
    { code: 'KIT601', name: 'Artificial Intelligence', isVerified: true },
    { code: 'KIT602', name: 'Data Analytics & Visualization', isVerified: true },
    { code: 'KIT603', name: 'Cloud Computing & Virtualization', isVerified: true },
    { code: 'KIT604', name: 'E-Commerce & ERP', isVerified: false }, // Needs college syllabus verification
    { code: 'KIT605', name: 'Mobile Computing', isVerified: false },     // Needs college syllabus verification
  ],
  7: [
    { code: 'KIT701', name: 'Cryptography & Network Security', isVerified: true },
    { code: 'KIT702', name: 'Big Data Management', isVerified: true },
    { code: 'KIT703', name: 'Software Project Management', isVerified: false }, // Elective
    { code: 'KIT704', name: 'Software Testing & Automation', isVerified: true },
  ],
  8: [
    { code: 'KIT801', name: 'Cyber Forensics & Digital Investigation', isVerified: false }, // Elective
    { code: 'KIT802', name: 'Internet of Things & Applications', isVerified: true },
    { code: 'KIT803', name: 'Virtual & Augmented Reality', isVerified: false },       // Elective
  ],
};

// ── ECE (Electronics & Communication Engineering) ─────────────────────────
const ECE = {
  ...COMMON_FIRST_YEAR,
  3: [
    { code: 'KEC301', name: 'Electronic Devices', isVerified: true },
    { code: 'KEC302', name: 'Digital System Design', isVerified: true },
    { code: 'KEC303', name: 'Network Analysis & Synthesis', isVerified: true },
    { code: 'KAS301', name: 'Technical Communication', isVerified: true },
    { code: 'KAS302', name: 'Mathematics-IV', isVerified: true },
  ],
  4: [
    { code: 'KEC401', name: 'Communication Engineering', isVerified: true },
    { code: 'KEC402', name: 'Analog Circuits', isVerified: true },
    { code: 'KEC403', name: 'Signals & Systems', isVerified: true },
    { code: 'KEC404', name: 'Microprocessor & Microcontroller', isVerified: true },
    { code: 'KAS401', name: 'Universal Human Values', isVerified: true },
  ],
  5: [
    { code: 'KEC501', name: 'Electromagnetic Field Theory', isVerified: true },
    { code: 'KEC502', name: 'Integrated Circuits & Applications', isVerified: true },
    { code: 'KEC503', name: 'Digital Signal Processing', isVerified: true },
    { code: 'KEC504', name: 'Control Systems', isVerified: true },
    { code: 'KEC505', name: 'Advance Communication Systems', isVerified: false },
  ],
  6: [
    { code: 'KEC601', name: 'Digital Communication', isVerified: true },
    { code: 'KEC602', name: 'Antenna and Wave Propagation', isVerified: true },
    { code: 'KEC603', name: 'VLSI Design', isVerified: true },
    { code: 'KEC604', name: 'Embedded Systems', isVerified: true },
    { code: 'KEC605', name: 'Optical Communication', isVerified: false },
  ],
  7: [
    { code: 'KEC701', name: 'Microwave & Radar Engineering', isVerified: true },
    { code: 'KEC702', name: 'Wireless & Mobile Communication', isVerified: true },
    { code: 'KEC703', name: 'Satellite Communication', isVerified: false },
    { code: 'KEC704', name: 'Biomedical Signal Processing', isVerified: false },
  ],
  8: [
    { code: 'KEC801', name: 'Wireless Sensor Networks', isVerified: false },
    { code: 'KEC802', name: 'Fiber Optic Networks', isVerified: false },
    { code: 'KEC803', name: 'Neural Networks & Fuzzy Logic', isVerified: false },
  ],
};

// ── EE (Electrical Engineering) ───────────────────────────────────────────
const EE = {
  ...COMMON_FIRST_YEAR,
  3: [
    { code: 'KEE301', name: 'Electromagnetic Field Theory', isVerified: true },
    { code: 'KEE302', name: 'Electrical Measurements & Instrumentation', isVerified: true },
    { code: 'KEE303', name: 'Basic System Analysis', isVerified: true },
    { code: 'KEE304', name: 'Analog Electronics', isVerified: true },
    { code: 'KAS301', name: 'Technical Communication', isVerified: true },
  ],
  4: [
    { code: 'KEE401', name: 'Digital Electronics', isVerified: true },
    { code: 'KEE402', name: 'Electrical Machines-I', isVerified: true },
    { code: 'KEE403', name: 'Network Analysis and Synthesis', isVerified: true },
    { code: 'KAS402', name: 'Mathematics-IV', isVerified: true },
    { code: 'KAS401', name: 'Universal Human Values', isVerified: true },
  ],
  5: [
    { code: 'KEE501', name: 'Electrical Machines-II', isVerified: true },
    { code: 'KEE502', name: 'Power System-I', isVerified: true },
    { code: 'KEE503', name: 'Control System', isVerified: true },
    { code: 'KEE504', name: 'Power Electronics', isVerified: true },
    { code: 'KEE505', name: 'Microprocessor and Its Applications', isVerified: false },
  ],
  6: [
    { code: 'KEE601', name: 'Power System-II', isVerified: true },
    { code: 'KEE602', name: 'Microprocessor and Microcontroller', isVerified: true },
    { code: 'KEE603', name: 'Power System Protection', isVerified: true },
    { code: 'KEE604', name: 'Switchgear & Protection', isVerified: false },
    { code: 'KEE605', name: 'Electric Drives', isVerified: true },
  ],
  7: [
    { code: 'KEE701', name: 'Power Quality and FACTS', isVerified: true },
    { code: 'KEE702', name: 'Renewable Energy Resources', isVerified: true },
    { code: 'KEE703', name: 'Smart Grid Technology', isVerified: false },
    { code: 'KEE704', name: 'High Voltage Engineering', isVerified: false },
  ],
  8: [
    { code: 'KEE801', name: 'Energy Management & Auditing', isVerified: true },
    { code: 'KEE802', name: 'Electric & Hybrid Vehicles', isVerified: true },
    { code: 'KEE803', name: 'Utilization of Electrical Energy & Traction', isVerified: false },
  ],
};

// ── ME (Mechanical Engineering) ───────────────────────────────────────────
const ME = {
  ...COMMON_FIRST_YEAR,
  3: [
    { code: 'KME301', name: 'Thermodynamics', isVerified: true },
    { code: 'KME302', name: 'Fluid Mechanics & Fluid Machines', isVerified: true },
    { code: 'KME303', name: 'Materials Engineering', isVerified: true },
    { code: 'KAS301', name: 'Technical Communication', isVerified: true },
    { code: 'KAS302', name: 'Mathematics-IV', isVerified: true },
  ],
  4: [
    { code: 'KME401', name: 'Applied Thermodynamics', isVerified: true },
    { code: 'KME402', name: 'Engineering Mechanics', isVerified: true },
    { code: 'KME403', name: 'Manufacturing Processes', isVerified: true },
    { code: 'KCS401', name: 'Computer Programming with Python', isVerified: true },
    { code: 'KAS401', name: 'Universal Human Values', isVerified: true },
  ],
  5: [
    { code: 'KME501', name: 'Heat & Mass Transfer', isVerified: true },
    { code: 'KME502', name: 'Strength of Materials', isVerified: true },
    { code: 'KME503', name: 'Kinematics of Machines', isVerified: true },
    { code: 'KME504', name: 'Machine Design-I', isVerified: true },
    { code: 'KME505', name: 'Internal Combustion Engines', isVerified: false },
  ],
  6: [
    { code: 'KME601', name: 'Dynamics of Machines', isVerified: true },
    { code: 'KME602', name: 'Refrigeration & Air Conditioning', isVerified: true },
    { code: 'KME603', name: 'Machine Design-II', isVerified: true },
    { code: 'KME604', name: 'Non-Destructive Testing', isVerified: false },
    { code: 'KME605', name: 'Production Planning & Control', isVerified: false },
  ],
  7: [
    { code: 'KME701', name: 'CAD / CAM & Automation', isVerified: true },
    { code: 'KME702', name: 'Automobile Engineering', isVerified: true },
    { code: 'KME703', name: 'Power Plant Engineering', isVerified: false },
    { code: 'KME704', name: 'Total Quality Management', isVerified: false },
  ],
  8: [
    { code: 'KME801', name: 'Automation & Robotics', isVerified: true },
    { code: 'KME802', name: 'Operations Research', isVerified: true },
    { code: 'KME803', name: 'Supply Chain Management', isVerified: false },
  ],
};

// ── CE (Civil Engineering) ────────────────────────────────────────────────
const CE = {
  ...COMMON_FIRST_YEAR,
  3: [
    { code: 'KCE301', name: 'Engineering Mechanics & Strength of Materials', isVerified: true },
    { code: 'KCE302', name: 'Fluid Mechanics', isVerified: true },
    { code: 'KCE303', name: 'Building Materials & Construction', isVerified: true },
    { code: 'KAS301', name: 'Technical Communication', isVerified: true },
    { code: 'KAS302', name: 'Mathematics-IV', isVerified: true },
  ],
  4: [
    { code: 'KCE401', name: 'Surveying & Geomatics', isVerified: true },
    { code: 'KCE402', name: 'Hydraulic Engineering & Hydraulic Machines', isVerified: true },
    { code: 'KCE403', name: 'Concrete Technology', isVerified: true },
    { code: 'KCS401', name: 'Computer Programming', isVerified: true },
    { code: 'KAS401', name: 'Universal Human Values', isVerified: true },
  ],
  5: [
    { code: 'KCE501', name: 'Structural Analysis-I', isVerified: true },
    { code: 'KCE502', name: 'Geotechnical Engineering', isVerified: true },
    { code: 'KCE503', name: 'Transportation Engineering', isVerified: true },
    { code: 'KCE504', name: 'Design of Concrete Structures', isVerified: true },
    { code: 'KCE505', name: 'Environmental Engineering-I', isVerified: false },
  ],
  6: [
    { code: 'KCE601', name: 'Structural Analysis-II', isVerified: true },
    { code: 'KCE602', name: 'Design of Steel Structures', isVerified: true },
    { code: 'KCE603', name: 'Environmental Engineering-II', isVerified: true },
    { code: 'KCE604', name: 'Foundation Engineering', isVerified: true },
    { code: 'KCE605', name: 'Hydrology & Water Resources Engineering', isVerified: false },
  ],
  7: [
    { code: 'KCE701', name: 'Estimating, Costing & Valuation', isVerified: true },
    { code: 'KCE702', name: 'Earthquake Resistant Design', isVerified: true },
    { code: 'KCE703', name: 'Irrigation Engineering', isVerified: false },
    { code: 'KCE704', name: 'Construction Technology & Management', isVerified: false },
  ],
  8: [
    { code: 'KCE801', name: 'Bridge Engineering', isVerified: false },
    { code: 'KCE802', name: 'Remote Sensing and GIS', isVerified: true },
    { code: 'KCE803', name: 'Disaster Preparedness and Management', isVerified: false },
  ],
};

// ── AIML (Artificial Intelligence & Machine Learning) ─────────────────────
const AIML = {
  ...COMMON_FIRST_YEAR,
  3: [
    { code: 'KAI301', name: 'Data Structures & Algorithms', isVerified: true },
    { code: 'KAI302', name: 'Discrete Structures & Logic', isVerified: true },
    { code: 'KAI303', name: 'Computer Organization & Architecture', isVerified: true },
    { code: 'KAI304', name: 'Python Programming for AI', isVerified: true },
    { code: 'KAS301', name: 'Technical Communication', isVerified: true },
  ],
  4: [
    { code: 'KAI401', name: 'Operating Systems', isVerified: true },
    { code: 'KAI402', name: 'Design & Analysis of Algorithms', isVerified: true },
    { code: 'KAI403', name: 'Database Management Systems', isVerified: true },
    { code: 'KAI404', name: 'Mathematical Foundations of AI', isVerified: true },
    { code: 'KAI405', name: 'Introduction to Artificial Intelligence', isVerified: true },
  ],
  5: [
    { code: 'KAI501', name: 'Machine Learning Fundamentals', isVerified: true },
    { code: 'KAI502', name: 'Computer Networks', isVerified: true },
    { code: 'KAI503', name: 'Knowledge Representation & Reasoning', isVerified: true },
    { code: 'KAI504', name: 'Software Engineering', isVerified: true },
    { code: 'KAI505', name: 'Web Technologies & AI APIs', isVerified: false },
  ],
  6: [
    { code: 'KAI601', name: 'Deep Learning Architectures', isVerified: true },
    { code: 'KAI602', name: 'Natural Language Processing', isVerified: true },
    { code: 'KAI603', name: 'Computer Vision', isVerified: true },
    { code: 'KAI604', name: 'Reinforcement Learning', isVerified: false }, // Elective
    { code: 'KAI605', name: 'Cloud Computing & MLOps', isVerified: false },   // Elective
  ],
  7: [
    { code: 'KAI701', name: 'AI for Autonomous Systems & Robotics', isVerified: false }, // Elective
    { code: 'KAI702', name: 'Big Data Analytics', isVerified: true },
    { code: 'KAI703', name: 'Ethics, Privacy & Explainable AI', isVerified: true },
    { code: 'KAI704', name: 'Software Testing & Quality Assurance', isVerified: true },
  ],
  8: [
    { code: 'KAI801', name: 'Generative AI & Large Language Models', isVerified: false }, // Elective
    { code: 'KAI802', name: 'Internet of Things & Edge AI', isVerified: true },
    { code: 'KAI803', name: 'Cognitive Computing', isVerified: false },             // Elective
  ],
};

// ── DS (Data Science) ─────────────────────────────────────────────────────
const DS = {
  ...COMMON_FIRST_YEAR,
  3: [
    { code: 'KDS301', name: 'Data Structures & Algorithms', isVerified: true },
    { code: 'KDS302', name: 'Discrete Structures & Logic', isVerified: true },
    { code: 'KDS303', name: 'Computer Organization & Architecture', isVerified: true },
    { code: 'KDS304', name: 'Data Analysis with Python', isVerified: true },
    { code: 'KAS301', name: 'Technical Communication', isVerified: true },
  ],
  4: [
    { code: 'KDS401', name: 'Operating Systems', isVerified: true },
    { code: 'KDS402', name: 'Design & Analysis of Algorithms', isVerified: true },
    { code: 'KDS403', name: 'Database Management Systems', isVerified: true },
    { code: 'KDS404', name: 'Applied Statistics & Probability for DS', isVerified: true },
    { code: 'KDS405', name: 'Exploratory Data Analysis & Visualization', isVerified: true },
  ],
  5: [
    { code: 'KDS501', name: 'Machine Learning for Data Science', isVerified: true },
    { code: 'KDS502', name: 'Computer Networks', isVerified: true },
    { code: 'KDS503', name: 'Data Warehousing & Business Intelligence', isVerified: true },
    { code: 'KDS504', name: 'Software Engineering', isVerified: true },
    { code: 'KDS505', name: 'Web Scraping & Data Engineering', isVerified: false },
  ],
  6: [
    { code: 'KDS601', name: 'Big Data Technologies (Hadoop & Spark)', isVerified: true },
    { code: 'KDS602', name: 'Predictive Modeling & Analytics', isVerified: true },
    { code: 'KDS603', name: 'Data Mining & Knowledge Discovery', isVerified: true },
    { code: 'KDS604', name: 'Deep Learning for Data Science', isVerified: false }, // Elective
    { code: 'KDS605', name: 'Cloud Computing & Data Pipelines', isVerified: false }, // Elective
  ],
  7: [
    { code: 'KDS701', name: 'Time Series Analysis & Forecasting', isVerified: true },
    { code: 'KDS702', name: 'Big Data Analytics', isVerified: true },
    { code: 'KDS703', name: 'Data Governance, Ethics & Privacy', isVerified: true },
    { code: 'KDS704', name: 'Software Testing & Quality Assurance', isVerified: true },
  ],
  8: [
    { code: 'KDS801', name: 'Data Science in Healthcare & Finance', isVerified: false }, // Elective
    { code: 'KDS802', name: 'Internet of Things & Streaming Data', isVerified: true },
    { code: 'KDS803', name: 'Natural Language Processing & Text Mining', isVerified: false }, // Elective
  ],
};

export const BRANCH_CATALOGS = {
  CSE,
  IT,
  ECE,
  EE,
  ME,
  CE,
  AIML,
  DS,
};

export const getAllCatalogSubjects = () => {
  const result = [];
  for (const [branch, semMap] of Object.entries(BRANCH_CATALOGS)) {
    for (const [semester, subjects] of Object.entries(semMap)) {
      for (const s of subjects) {
        result.push({
          code: s.code.toUpperCase().trim(),
          name: s.name.trim(),
          branch: branch.toUpperCase(),
          semester: Number(semester),
          isVerified: s.isVerified,
        });
      }
    }
  }
  return result;
};
