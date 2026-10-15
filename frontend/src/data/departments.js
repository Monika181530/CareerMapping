// Comprehensive catalog of academic departments, degree specializations, and majors
export const DEPARTMENTS_DATA = [
  // --- Computer Science & Information Technology ---
  {
    name: "Computer Science and Engineering",
    code: "CSE",
    category: "Computing & IT",
    aliases: ["CSE", "CS", "Computer Science", "Comp Sci"]
  },
  {
    name: "Information Technology",
    code: "IT",
    category: "Computing & IT",
    aliases: ["IT", "Info Tech", "Information Tech"]
  },
  {
    name: "Artificial Intelligence and Data Science",
    code: "AI & DS",
    category: "Computing & IT",
    aliases: ["AI", "DS", "AIDS", "AI&DS", "Data Science", "Artificial Intelligence"]
  },
  {
    name: "Artificial Intelligence and Machine Learning",
    code: "AI & ML",
    category: "Computing & IT",
    aliases: ["AIML", "AI&ML", "Machine Learning", "ML"]
  },
  {
    name: "Computer Science and Business Systems",
    code: "CSBS",
    category: "Computing & IT",
    aliases: ["CSBS", "CS & BS", "Business Systems"]
  },
  {
    name: "Cyber Security",
    code: "CYBER",
    category: "Computing & IT",
    aliases: ["Cyber Security", "Information Security", "Cyber", "InfoSec"]
  },
  {
    name: "Data Science and Analytics",
    code: "DSA",
    category: "Computing & IT",
    aliases: ["Data Science", "Analytics", "Big Data"]
  },
  {
    name: "Software Engineering",
    code: "SE",
    category: "Computing & IT",
    aliases: ["Software Engg", "SE", "Software"]
  },
  {
    name: "Internet of Things (IoT)",
    code: "IoT",
    category: "Computing & IT",
    aliases: ["IoT", "Internet of Things", "Smart Systems"]
  },
  {
    name: "Cloud Computing and Big Data",
    code: "CC",
    category: "Computing & IT",
    aliases: ["Cloud", "Big Data", "AWS Cloud"]
  },
  {
    name: "Computer Applications (BCA / MCA)",
    code: "BCA/MCA",
    category: "Computer Applications",
    aliases: ["BCA", "MCA", "Computer Applications"]
  },
  {
    name: "B.Sc Computer Science",
    code: "B.Sc CS",
    category: "Science & Computing",
    aliases: ["BSc CS", "B.Sc CS", "BSc Computer Science"]
  },
  {
    name: "B.Sc Information Technology",
    code: "B.Sc IT",
    category: "Science & Computing",
    aliases: ["BSc IT", "B.Sc IT"]
  },

  // --- Electrical, Electronics & Communication ---
  {
    name: "Electronics and Communication Engineering",
    code: "ECE",
    category: "Electrical & Electronics",
    aliases: ["ECE", "Electronics", "Communication", "Telecom"]
  },
  {
    name: "Electrical and Electronics Engineering",
    code: "EEE",
    category: "Electrical & Electronics",
    aliases: ["EEE", "Electrical", "Triple E"]
  },
  {
    name: "Electronics and Instrumentation Engineering",
    code: "EIE",
    category: "Electrical & Electronics",
    aliases: ["EIE", "Instrumentation"]
  },
  {
    name: "Biomedical Engineering",
    code: "BME",
    category: "Interdisciplinary",
    aliases: ["BME", "Biomedical", "Bio Medical"]
  },
  {
    name: "Robotics and Automation",
    code: "ROBOTICS",
    category: "Interdisciplinary",
    aliases: ["Robotics", "Automation", "Robo"]
  },

  // --- Mechanical, Mechatronics & Core Disciplines ---
  {
    name: "Mechanical Engineering",
    code: "MECH",
    category: "Core Engineering",
    aliases: ["MECH", "Mechanical"]
  },
  {
    name: "Mechatronics Engineering",
    code: "MTS",
    category: "Core Engineering",
    aliases: ["Mechatronics", "MTS", "Robo-Mech"]
  },
  {
    name: "Civil Engineering",
    code: "CIVIL",
    category: "Core Engineering",
    aliases: ["CIVIL", "Civil Engg", "Construction"]
  },
  {
    name: "Automobile Engineering",
    code: "AUTO",
    category: "Core Engineering",
    aliases: ["Automobile", "Automotive", "Auto"]
  },
  {
    name: "Aerospace Engineering",
    code: "AERO",
    category: "Core Engineering",
    aliases: ["Aerospace", "Space Engg"]
  },
  {
    name: "Aeronautical Engineering",
    code: "AERO",
    category: "Core Engineering",
    aliases: ["Aeronautical", "Aero"]
  },
  {
    name: "Chemical Engineering",
    code: "CHEM",
    category: "Core Engineering",
    aliases: ["Chemical", "Chem Engg"]
  },
  {
    name: "Biotechnology",
    code: "BT",
    category: "Bio-Sciences",
    aliases: ["Biotech", "BT", "Bio Technology"]
  },
  {
    name: "Agricultural Engineering",
    code: "AGRI",
    category: "Core Engineering",
    aliases: ["Agri", "Agriculture", "Agri Engg"]
  },
  {
    name: "Food Technology",
    code: "FT",
    category: "Bio-Sciences",
    aliases: ["Food Tech", "Food Engineering", "FT"]
  },
  {
    name: "Textile Technology",
    code: "TXT",
    category: "Manufacturing",
    aliases: ["Textile", "Textile Tech", "Fashion Tech"]
  },

  // --- Management, Commerce & Science ---
  {
    name: "Business Administration (BBA / MBA)",
    code: "BBA/MBA",
    category: "Management",
    aliases: ["BBA", "MBA", "Management", "Business Admin"]
  },
  {
    name: "Commerce and Finance (B.Com / M.Com)",
    code: "B.COM",
    category: "Commerce",
    aliases: ["BCom", "MCom", "Commerce", "Finance", "Accounting"]
  },
  {
    name: "Mathematics and Statistics",
    code: "MATH",
    category: "Pure Sciences",
    aliases: ["Maths", "Statistics", "Applied Mathematics", "Stats"]
  },
  {
    name: "Economics and Analytics",
    code: "ECO",
    category: "Economics",
    aliases: ["Economics", "Eco", "Econometrics"]
  }
];

/**
 * Smart department search supporting code/acronyms, aliases, and partial keyword matching.
 */
export function searchDepartments(query, limit = 8) {
  if (!query || !query.trim()) {
    // Return top popular departments when input is empty or focused
    return DEPARTMENTS_DATA.slice(0, limit);
  }

  const cleanQuery = query.trim().toLowerCase();
  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

  const scored = [];

  for (const dept of DEPARTMENTS_DATA) {
    const nameLower = dept.name.toLowerCase();
    const codeLower = dept.code.toLowerCase();
    const catLower = dept.category.toLowerCase();
    const aliasLower = (dept.aliases || []).map(a => a.toLowerCase());

    let score = 0;

    // Exact code match (e.g. 'cse' -> Computer Science and Engineering)
    if (codeLower === cleanQuery) {
      score += 120;
    } else if (aliasLower.some(a => a === cleanQuery)) {
      score += 110;
    } else if (nameLower.startsWith(cleanQuery)) {
      score += 100;
    } else if (aliasLower.some(a => a.startsWith(cleanQuery))) {
      score += 90;
    } else if (nameLower.includes(cleanQuery)) {
      score += 70;
    } else if (catLower.includes(cleanQuery)) {
      score += 40;
    }

    // Token matching across all fields
    const allText = `${nameLower} ${codeLower} ${catLower} ${aliasLower.join(' ')}`;
    const allTokensMatch = queryTokens.every(tok => allText.includes(tok));
    if (allTokensMatch) {
      score += 30;
    }

    if (score > 0) {
      scored.push({ dept, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(item => item.dept);
}
