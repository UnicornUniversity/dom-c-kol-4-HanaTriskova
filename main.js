// TODO add imports if needed
// TODO doc change as needed

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
 * @param {object} dtoIn input data
 * @returns {object} dtoOut final output
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
  const employees = [];
  const count = dtoIn.count;

  for (let i = 0; i < count; i++) {
    employees.push(createEmployee(dtoIn.age.min, dtoIn.age.max, now));
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
  const collected = collectStatsInputs(employees, now);

  const ageStats = calculateAgeStats(collected.ages);
  const medianWorkload = calculateMedianWorkload(collected.workloads);
  const sortedByWorkload = sortEmployeesByWorkload(employees);

  return buildDtoOut(employees.length, collected.workloadCounts, ageStats, medianWorkload, collected.averageWomenWorkload, sortedByWorkload);
}

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

/**
 * Picks name by gender.
 * @param {string} gender gender
 * @returns {string} name
 */
function pickName(gender) {
  const list = gender === "male" ? MALE_NAMES : FEMALE_NAMES;
  return randomItem(list);
}

/**
 * Picks surname by gender.
 * @param {string} gender gender
 * @returns {string} surname
 */
function pickSurname(gender) {
  const list = gender === "male" ? SURNAMES_MALE : SURNAMES_FEMALE;
  return randomItem(list);
}

/**
 * Goes through employees and collects numbers we need.
 * @param {Array} employees list of employees
 * @param {Date} now current time
 * @returns {object} collected values
 */
function collectStatsInputs(employees, now) {
  const workloadCounts = { workload10: 0, workload20: 0, workload30: 0, workload40: 0 };
  const ages = [];
  const workloads = [];

  let womenSum = 0;
  let womenCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];

    addWorkloadCount(workloadCounts, e.workload);
    workloads.push(e.workload);

    const age = ageInYears(e.birthdate, now);
    ages.push(age);

    if (e.gender === "female") {
      womenSum += e.workload;
      womenCount += 1;
    }
  }

  const averageWomenWorkload = womenCount === 0 ? 0 : roundToOneDecimal(womenSum / womenCount);

  return { workloadCounts, ages, workloads, averageWomenWorkload };
}

/**
 * Increases the correct workload counter.
 * @param {object} counts counters object
 * @param {number} workload workload value
 * @returns {void}
 */
function addWorkloadCount(counts, workload) {
  const key = `workload${workload}`;
  if (counts[key] !== undefined) {
    counts[key] += 1;
  }
}

/**
 * Calculates average/min/max/median for ages.
 * @param {Array} ages array of numbers
 * @returns {object} age statistics
 */
function calculateAgeStats(ages) {
  if (ages.length === 0) {
    return { averageAge: 0, minAge: 0, maxAge: 0, medianAge: 0 };
  }

  const sorted = [...ages].sort((a, b) => a - b);
  const averageAge = roundToOneDecimal(sumNumbers(ages) / ages.length);
  const minAge = sorted[0];
  const maxAge = sorted[sorted.length - 1];
  const medianAge = medianFromSorted(sorted);

  return { averageAge, minAge, maxAge, medianAge };
}

/**
 * Calculates median workload.
 * @param {Array} workloads array of numbers
 * @returns {number} median workload
 */
function calculateMedianWorkload(workloads) {
  if (workloads.length === 0) return 0;
  const sorted = [...workloads].sort((a, b) => a - b);
  return medianFromSorted(sorted);
}

/**
 * Sorts employees by workload.
 * @param {Array} employees list of employees
 * @returns {Array} sorted copy of employees
 */
function sortEmployeesByWorkload(employees) {
  return [...employees].sort((a, b) => a.workload - b.workload);
}

/**
 * Builds dtoOut in required structure.
 * @param {number} total total employees
 * @param {object} workloadCounts counts of workloads
 * @param {object} ageStats age statistics
 * @param {number} medianWorkload median workload
 * @param {number} averageWomenWorkload average workload for women
 * @param {Array} sortedByWorkload employees sorted by workload
 * @returns {object} dtoOut
 */
function buildDtoOut(total, workloadCounts, ageStats, medianWorkload, averageWomenWorkload, sortedByWorkload) {
  return {
    total: total,
    workload10: workloadCounts.workload10,
    workload20: workloadCounts.workload20,
    workload30: workloadCounts.workload30,
    workload40: workloadCounts.workload40,
    averageAge: ageStats.averageAge,
    minAge: ageStats.minAge,
    maxAge: ageStats.maxAge,
    medianAge: ageStats.medianAge,
    medianWorkload: medianWorkload,
    averageWomenWorkload: averageWomenWorkload,
    sortedByWorkload: sortedByWorkload
  };
}

/**
 * Returns random item from array.
 * @param {Array} array input array
 * @returns {*} random item
 */
function randomItem(array) {
  const index = randomWholeNumber(0, array.length - 1);
  return array[index];
}

/**
 * Returns random whole number between min and max (inclusive).
 * @param {number} min minimum value
 * @param {number} max maximum value
 * @returns {number} random whole number
 */
function randomWholeNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates random birthdate ISO so age is in <minAge, maxAge> (inclusive).
 * @param {number} minAge minimum age (inclusive)
 * @param {number} maxAge maximum age (inclusive)
 * @param {Date} now current time
 * @returns {string} ISO date-time string
 */
function randomBirthdateIso(minAge, maxAge, now) {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const oldest = now.getTime() - (maxAge * msPerYear);
  const youngest = now.getTime() - (minAge * msPerYear);
  const randomTime = oldest + Math.random() * (youngest - oldest);
  return new Date(randomTime).toISOString();
}

/**
 * Calculates age in years from ISO date.
 * @param {string} birthdateIso ISO date-time
 * @param {Date} now current time
 * @returns {number} age in years
 */
function ageInYears(birthdateIso, now) {
  const birth = new Date(birthdateIso);
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  return (now.getTime() - birth.getTime()) / msPerYear;
}

/**
 * Sums array of numbers.
 * @param {Array} values array of numbers
 * @returns {number} sum
 */
function sumNumbers(values) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum;
}

/**
 * Rounds number to one decimal place.
 * @param {number} value input value
 * @returns {number} rounded value
 */
function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Returns median from sorted numeric array.
 * @param {Array} sortedValues sorted array
 * @returns {number} median
 */
function medianFromSorted(sortedValues) {
  const n = sortedValues.length;
  const middle = Math.floor(n / 2);

  if (n % 2 === 1) {
    return sortedValues[middle];
  }

  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
}



