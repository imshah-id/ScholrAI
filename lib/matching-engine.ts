export interface CanonicalProfile {
  id: string;
  profile: {
    gpa: {
      value: number; // Normalized 0-1
      raw: number;
      scale: string;
    };
    language: {
      type: string;
      value: number; // Normalized 0-1
      raw_score: number;
    };
    budget: {
      max_annual: number;
      currency: string;
      is_flexible: boolean; // True if "60k+"
    };
    preferences: {
      target_degree: string;
      preferred_countries: string[];
    };
    background: {
      highest_qualification: string;
      field_of_study: string;
      citizenship: string;
    };
  };
}

export interface CanonicalUniversity {
  id: string;
  name: string;
  rank: number;
  location: {
    country: string;
    city: string;
  };
  costs: {
    tuition: number;
    currency: string;
  };
  difficulty: {
    acceptance_rate: number;
    academic_expectation: number;
    language_expectation: number;
  };
  tags: string[];
}

// --- Helper Functions ---
function parseFee(feeStr: string): number {
  if (!feeStr) return 0;
  // "$60k" or "€0" or "£30,000"
  const num = parseFloat(feeStr.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return 0;
  // Heuristic: If < 1000, likely 'k' notation implied or explicit
  if (feeStr.toLowerCase().includes("k")) return num * 1000;
  return num;
}

function parseBudgetAmount(budgetStr: string): number {
  if (!budgetStr) return 0;
  // Extract all numbers
  const matches = budgetStr.match(/(\d+)/g);
  if (!matches) return 0;

  // If "20k-40k", take average or max? Let's take max to be permissive
  const nums = matches.map((n) => parseInt(n));
  const val = Math.max(...nums);

  // Check for 'k'
  if (budgetStr.toLowerCase().includes("k")) return val * 1000;
  return val;
}

function isBudgetFlexible(budgetStr: string): boolean {
  if (!budgetStr) return false;
  return (
    budgetStr.includes("+") || budgetStr.toLowerCase().includes("flexible")
  );
}

export function createCanonicalProfile(
  id: string,
  gpaStr: string,
  gpaScale: string,
  englishTest: string, // "IELTS", "TOEFL"
  testScoreStr: string, // NEW: Actual score
  budgetStr: string,
  degree: string,
  countries: string[],
  qualification: string = "",
  field: string = "",
  citizenshipStr: string = "",
): CanonicalProfile {
  // 1. Normalize GPA
  let gpaVal = 0;
  let rawGpa = parseFloat(gpaStr) || 0;

  if (gpaScale === "4.0") gpaVal = rawGpa / 4.0;
  else if (gpaScale === "5.0") gpaVal = rawGpa / 5.0;
  else if (gpaScale === "10.0") gpaVal = rawGpa / 10.0;
  else if (gpaScale === "Percentage") gpaVal = rawGpa / 100.0;

  gpaVal = Math.min(Math.max(gpaVal, 0), 1); // Clamp 0-1

  // 2. Normalize Language
  let langVal = 0;
  let rawLang = parseFloat(testScoreStr) || 0;

  if (englishTest === "IELTS") {
    langVal = rawLang / 9.0;
  } else if (englishTest === "TOEFL") {
    langVal = rawLang / 120.0;
  } else if (englishTest === "Duolingo") {
    langVal = rawLang / 160.0;
  } else if (englishTest === "None") {
    langVal = 0; // Strict: No test = No score
  }

  langVal = Math.min(Math.max(langVal, 0), 1);

  // 3. Budget
  const maxBudget = parseBudgetAmount(budgetStr);
  const flexible = isBudgetFlexible(budgetStr);

  return {
    id,
    profile: {
      gpa: { value: gpaVal, raw: rawGpa, scale: gpaScale },
      language: { type: englishTest, value: langVal, raw_score: rawLang },
      budget: { max_annual: maxBudget, currency: "USD", is_flexible: flexible },
      preferences: {
        target_degree: degree,
        preferred_countries: countries,
      },
      background: {
        highest_qualification: qualification,
        field_of_study: field,
        citizenship: citizenshipStr,
      },
    },
  };
}

export function createCanonicalUniversity(dbUni: any): CanonicalUniversity {
  const fees = parseFee(dbUni.fees);

  // Difficulty Inference or Explicit
  let acadExp = 0.5;
  let langExp = 0.5;

  // Check explicit overrides first
  if (dbUni.expectations) {
    try {
      const exp = JSON.parse(dbUni.expectations);
      if (exp.academic_expectation) acadExp = exp.academic_expectation;
      if (exp.language_expectation) langExp = exp.language_expectation;
    } catch (e) {}
  } else {
    // Fallback to Rank
    const rank = dbUni.rank;
    if (rank <= 10) {
      acadExp = 0.92;
      langExp = 0.85;
    } else if (rank <= 50) {
      acadExp = 0.85;
      langExp = 0.8;
    } else if (rank <= 150) {
      acadExp = 0.75;
      langExp = 0.7;
    } else if (rank <= 500) {
      acadExp = 0.65;
      langExp = 0.6;
    } else {
      acadExp = 0.5;
      langExp = 0.5;
    }
  }

  return {
    id: dbUni.id,
    name: dbUni.name,
    rank: dbUni.rank,
    location: {
      country: dbUni.country,
      city: dbUni.location.split(",")[1]?.trim() || "",
    },
    costs: { tuition: fees, currency: "USD" },
    difficulty: {
      acceptance_rate: parseFloat(dbUni.acceptanceRate) || 10,
      academic_expectation: acadExp, // 0-1
      language_expectation: langExp, // 0-1
    },
    tags: [],
  };
}

export function evaluateUniversity(
  user: CanonicalProfile,
  uni: CanonicalUniversity,
) {
  let score = 0;
  let reasons: string[] = [];

  // 1. Academic Fit (40%) -> 4 points max
  const userAcad = user.profile.gpa.value;
  const reqAcad = uni.difficulty.academic_expectation;
  let acadScore = 0;

  if (userAcad >= reqAcad) {
    acadScore = 4; // Full points
    reasons.push("Perfect Academic Match");
  } else if (userAcad >= reqAcad - 0.1) {
    acadScore = 3;
    reasons.push("Good Academic Fit");
  } else if (userAcad >= reqAcad - 0.2) {
    acadScore = 2; // Reach
    reasons.push("Ambitious Academic Reach");
  } else {
    acadScore = 0; // Hard Reach
    reasons.push("High Academic Barrier");
  }
  score += acadScore;

  // 2. Budget Fit (30%) -> 3 points max
  const userMax = user.profile.budget.max_annual;
  const cost = uni.costs.tuition;
  const isFlexible = user.profile.budget.is_flexible;
  let budgetScore = 0;

  if (isFlexible) {
    budgetScore = 3;
    reasons.push("Budget fit (Flexible)");
  } else {
    if (cost === 0 || cost <= userMax) {
      budgetScore = 3;
      reasons.push("Within Budget");
    } else if (cost <= userMax * 1.15) {
      budgetScore = 2; // Stretch
      reasons.push("Slightly Over Budget");
    } else {
      budgetScore = 0; // Too expensive
      reasons.push("Exceeds Budget");
    }
  }
  score += budgetScore;

  // 3. Country Preference (20%) -> 2 points max
  const prefs = user.profile.preferences.preferred_countries.map((c) =>
    c.toLowerCase(),
  );
  const uniCountry = uni.location.country.toLowerCase();

  if (prefs.some((p) => uniCountry.includes(p))) {
    score += 2;
    reasons.push("Location Match");
  }

  // 4. Language Fit (10%) -> 1 point max
  const userLang = user.profile.language.value;
  const reqLang = uni.difficulty.language_expectation;
  let langScore = 0;

  // If user has 'None', we assume they are willing to take it or will be waived
  // But strictly, if they have low score, it hurts
  if (user.profile.language.type === "None") {
    // Strict - No score provided
    langScore = 0;
  } else {
    if (userLang >= reqLang) {
      langScore = 1;
      reasons.push("English Score Met");
    } else if (userLang >= reqLang - 0.1) {
      langScore = 0.5;
      reasons.push("English Score Borderline");
    } else {
      langScore = 0;
      reasons.push("English Score Low");
    }
  }
  score += langScore;

  // 5. Background Relevance (Bonus) -> +1 max
  if (user.profile.background?.field_of_study) {
    score += 0.5;
    reasons.push("Academic Background Aligned");
  }
  if (user.profile.background?.highest_qualification) {
    score += 0.5;
  }

  // 6. Citizenship / Domestic Advantage -> +1 max
  const userCitizen = user.profile.background?.citizenship?.toLowerCase();
  // uniCountry is already defined above? If not, define it.
  // Actually, let's just use uni.location.country directly to be safe or rename.
  const uniLocationCountry = uni.location.country.toLowerCase();

  // Simple Domestic Check
  // Note: This logic assumes if you are a citizen of the country, you have higher chances/lower fees
  // Ideally we check "Accepts Int'l" but assuming ALL do, domestic is just a bonus.
  if (
    userCitizen &&
    (userCitizen === uniLocationCountry ||
      uniLocationCountry.includes(userCitizen) ||
      userCitizen.includes(uniLocationCountry))
  ) {
    score += 1;
    reasons.push("Domestic Applicant (High Acceptance)");
  }

  return {
    score: score, // Out of ~12 now
    match_category: score >= 9 ? "SAFE" : score >= 7 ? "TARGET" : "DREAM",
    acceptance_chance: score >= 9 ? "High" : score >= 7 ? "Medium" : "Low",
    why_it_fits: reasons,
  };
}
