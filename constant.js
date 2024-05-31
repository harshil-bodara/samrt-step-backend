const DB_NAME = 'university'

const minQualifications = [
    { degree: "High school diploma", priority: 0 },
    { degree: "Bachelor's degree", priority: 1 },
    { degree: "Master's degree", priority: 2 },
    { degree: "Ph.D degree", priority: 3 },
  ];

  const experiencePriorities = [
    { experience: "No experience", priority: 0 },
    { experience: "1 Year", priority: 1 },
    { experience: "2 Year", priority: 2 },
    { experience: "3-4 Year", priority: 3 },
    { experience: "5+ Year", priority: 4 },
  ];

  const gradePriorities = [
    { grade: "High Distinction", priority: 4 },
    { grade: "Distinction", priority: 3 },
    { grade: "Credit", priority: 2 },
    { grade: "Pass", priority: 1 },
    { grade: "Near Pass", priority: 0 },
  ];

  const selectedTests = [
    { test: "IELTS", score: 8 },
    { test: "PTE Academic", score: 60 },
    { test: "TOEFL", score: 520 },
  ];

module.exports={DB_NAME, minQualifications, experiencePriorities, gradePriorities, selectedTests}