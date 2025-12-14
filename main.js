const MALE_NAMES = [
  "Jan", "Pavel", "Tomáš", "Jiří", "Vratislav",
  "Karel", "Lukáš", "Martin", "Ondřej", "Petr",
  "Roman", "Radek", "Aleš", "Marek", "Michal",
  "Filip", "Jaroslav", "Václav", "Josef", "Daniel"
];

const FEMALE_NAMES = [
  "Jana", "Petra", "Lucie", "Eva", "Jiřina",
  "Martina", "Veronika", "Monika", "Alena", "Tereza",
  "Hana", "Barbora", "Karolína", "Helena", "Adéla",
  "Nikola", "Kateřina", "Lenka", "Zuzana", "Anna"
];

const SURNAMES_MALE = [
  "Novák", "Svoboda", "Doležal", "Krejčí", "Konečný",
  "Hájek", "Urban", "Bláha", "Vlček", "Krupa",
  "Hruška", "Beran", "Ševčík", "Janda", "Mikuš",
  "Kolář", "Strnad", "Veverka", "Mazal", "Jílek"
];

const SURNAMES_FEMALE = [
  "Malá", "Veselá", "Krátká", "Suchá", "Štěpánová",
  "Bílá", "Jírová", "Tichá", "Vlková", "Hrubá",
  "Krásná", "Sládková", "Šafářová", "Adamcová", "Burešová",
  "Moravcová", "Hanková", "Pokorná", "Fialová", "Bártová"
];

const WORKLOADS = [10, 20, 30, 40];

/**
 * Main entry.
 * It generates employees and then calculates statistics from them.
 * @param {object} dtoIn input data
 * @returns {object} dtoOut final result
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  return getEmployeeStatistics(employees);
}

/**
 * Generates employees based on dtoIn.
 * @param {object} dtoIn input data
 * @returns {Array} employees list
 */
export function generateEmployeeData(dtoIn) {
  const now = new Date();
  const count = dtoIn.count;
  const minAge = dtoIn.age.min;
  const maxAge = dtoIn.age.max;

  const employees = [];
  for (let i = 0; i < count; i++) {
    employees.push(createEmployee(minAge, maxAge, now));
  }
  return employees;
}

/**
 * Calculates statistics from employees list.
 * @param {Array} employees list of employees
 * @returns {object} dtoOut statistics result
 */
export function getEmployeeStatistics(employees) {
  const now = new Date();

  const workloadCounts = countWorkloads(employees);
  const ages = getAges(employees, now);
  const workloads = getWorkloads(employees);

  const averageAge = roundToOneDecimal(averageOfNumbers(ages));
  const minAge = minOfNumbers(ages);
  const maxAge = maxOfNumbers(ages);
  const medianAge = medianOfNumbers(ages);

  const medianWorkload = medianOfNumbers(workloads);
  const averageWomenWorkload = roundToOneDecimal(averageWorkloadOfWomen(employees));
  const sortedByWorkload = sortEmployeesByWorkload(employees);

  return {
    total: employees.length,
    workload10: workloadCounts.workload10,
    workload20: workloadCounts.workload20,
    workload30: workloadCounts.workload30,
    workload40: workloadCounts.workload40,
    averageAge: averageAge,
    minAge: minAge,
    maxAge: maxAge,
    medianAge: medianAge,
    medianWorkload: medianWorkload,
    averageWomenWorkload: averageWomenWorkload,
    sortedByWorkload: sortedByWorkload
  };
}

// ---------------------------
// employee creation
// ---------------------------

/**
 * Creates one employee object.
 * @param {number} minAge minimum age
 * @param {number} maxAge maximum age
 * @param {Date} now current time
 * @returns {object} employee
 */
function createEmployee(minAge, maxAge, now) {
  const gender = randomGender();
  const name = pickName(gender);
  const surname = pickSurname(gender);
  const workload = randomItem(WORKLOADS);
  const birthdate = randomBirthdateIso(minAge, maxAge, now);

  return { gender, birthdate, name, surname, workload };
}

/**
 * Picks random gender.
 * @returns {string} "male" or "female"
 */
function randomGender() {
  return Math.random() < 0.5 ? "male" : "female";
}

function pickName(gender) {
  return gender === "male" ? randomItem(MALE_NAMES) : randomItem(FEMALE_NAMES);
}

function pickSurname(gender) {
  return gender === "male" ? randomItem(SURNAMES_MALE) : randomItem(SURNAMES_FEMALE);
}

// ---------------------------
// birthdate + age (exact years)
// ---------------------------

/**
 * Generates random birthdate ISO so the age (in whole years) is in <minAge, maxAge> inclusive.
 * @param {number} minAge minimum age (inclusive)
 * @param {number} maxAge maximum age (inclusive)
 * @param {Date} now current time
 * @returns {string} ISO date-time string
 */
function randomBirthdateIso(minAge, maxAge, now) {
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - maxAge - 1);

  const end = new Date(now);
  end.setFullYear(now.getFullYear() - minAge + 1);

  // we pick random dates and keep only those that pass the exact age check
  while (true) {
    const birth = randomDateBetween(start, end);
    const age = ageInWholeYears(birth, now);
    if (age >= minAge && age <= maxAge) {
      return birth.toISOString();
    }
  }
}

/**
 * Calculates age in whole years (based on birthday).
 * @param {Date} birth birth date
 * @param {Date} now current date
 * @returns {number} age in whole years
 */
function ageInWholeYears(birth, now) {
  let age = now.getFullYear() - birth.getFullYear();

  const nowMonth = now.getMonth();
  const birthMonth = birth.getMonth();

  if (nowMonth < birthMonth) {
    age -= 1;
    return age;
  }

  if (nowMonth > birthMonth) {
    return age;
  }

  // same month -> compare day
  if (now.getDate() < birth.getDate()) {
    age -= 1;
  }

  return age;
}

function randomDateBetween(startDate, endDate) {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const t = startMs + Math.random() * (endMs - startMs);
  return new Date(t);
}

// ---------------------------
// statistics parts
// ---------------------------

function countWorkloads(employees) {
  const counts = { workload10: 0, workload20: 0, workload30: 0, workload40: 0 };

  for (let i = 0; i < employees.length; i++) {
    const w = employees[i].workload;
    if (w === 10) counts.workload10 += 1;
    else if (w === 20) counts.workload20 += 1;
    else if (w === 30) counts.workload30 += 1;
    else if (w === 40) counts.workload40 += 1;
  }

  return counts;
}

function getAges(employees, now) {
  const ages = [];
  for (let i = 0; i < employees.length; i++) {
    const birth = new Date(employees[i].birthdate);
    ages.push(ageInWholeYears(birth, now));
  }
  return ages;
}

function getWorkloads(employees) {
  const workloads = [];
  for (let i = 0; i < employees.length; i++) {
    workloads.push(employees[i].workload);
  }
  return workloads;
}

function averageWorkloadOfWomen(employees) {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];
    if (e.gender === "female") {
      sum += e.workload;
      count += 1;
    }
  }

  if (count === 0) return 0;
  return sum / count;
}

function sortEmployeesByWorkload(employees) {
  return [...employees].sort((a, b) => a.workload - b.workload);
}

// ---------------------------
// basic math functions
// ---------------------------

function averageOfNumbers(values) {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}

function minOfNumbers(values) {
  if (values.length === 0) return 0;
  let min = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] < min) min = values[i];
  }
  return min;
}

function maxOfNumbers(values) {
  if (values.length === 0) return 0;
  let max = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] > max) max = values[i];
  }
  return max;
}

function medianOfNumbers(values) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);

  if (n % 2 === 1) {
    return sorted[mid];
  }

  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function randomItem(array) {
  const index = randomWholeNumber(0, array.length - 1);
  return array[index];
}

function randomWholeNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}




