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
 * Main entry for the assignment.
 * @param {object} dtoIn Input data.
 * @returns {object} dtoOut Output data.
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  return getEmployeeStatistics(employees);
}

/**
 * Creates an array of employees.
 * @param {object} dtoIn Input data.
 * @returns {Array} Array of employee objects.
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
 * Calculates statistics from the employee list.
 * @param {Array} employees Array of employee objects.
 * @returns {object} dtoOut Statistics.
 */
export function getEmployeeStatistics(employees) {
  const collected = collectInputs(employees);

  const ageStats = calculateAgeStats(collected.ages);
  const medianWorkload = medianOfNumbers(collected.workloads);
  const sortedByWorkload = sortByWorkload(employees);

  return {
    total: employees.length,
    workload10: collected.workloadCounts.workload10,
    workload20: collected.workloadCounts.workload20,
    workload30: collected.workloadCounts.workload30,
    workload40: collected.workloadCounts.workload40,
    averageAge: ageStats.averageAge,
    minAge: ageStats.minAge,
    maxAge: ageStats.maxAge,
    medianAge: ageStats.medianAge,
    medianWorkload: medianWorkload,
    averageWomenWorkload: collected.averageWomenWorkload,
    sortedByWorkload: sortedByWorkload
  };
}

/**
 * Creates one employee.
 * @param {number} minAge Minimum age.
 * @param {number} maxAge Maximum age.
 * @param {Date} now Current date.
 * @returns {object} Employee object.
 */
function createEmployee(minAge, maxAge, now) {
  const gender = randomGender();
  const name = pickName(gender);
  const surname = pickSurname(gender);
  const workload = randomFromArray(WORKLOADS);
  const birthdate = randomBirthdateIsoForAgeRange(minAge, maxAge, now);
  return { gender, birthdate, name, surname, workload };
}

/**
 * Random gender.
 * @returns {string} "male" or "female".
 */
function randomGender() {
  return Math.random() < 0.5 ? "male" : "female";
}

/**
 * Picks a name based on gender.
 * @param {string} gender Gender.
 * @returns {string} Name.
 */
function pickName(gender) {
  return gender === "male" ? randomFromArray(MALE_NAMES) : randomFromArray(FEMALE_NAMES);
}

/**
 * Picks a surname based on gender.
 * @param {string} gender Gender.
 * @returns {string} Surname.
 */
function pickSurname(gender) {
  return gender === "male" ? randomFromArray(SURNAMES_MALE) : randomFromArray(SURNAMES_FEMALE);
}

/**
 * Collects values we need for statistics.
 * @param {Array} employees Employee list.
 * @returns {object} Collected values.
 */
function collectInputs(employees) {
  const now = new Date();
  const workloadCounts = { workload10: 0, workload20: 0, workload30: 0, workload40: 0 };

  const ages = [];
  const workloads = [];

  let womenSum = 0;
  let womenCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];

    incrementWorkload(workloadCounts, e.workload);
    workloads.push(e.workload);

    const age = ageInWholeYears(e.birthdate, now);
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
 * Increments correct workload counter.
 * @param {object} counts Counters object.
 * @param {number} workload Workload value.
 * @returns {void}
 */
function incrementWorkload(counts, workload) {
  const key = `workload${workload}`;
  if (counts[key] !== undefined) counts[key] += 1;
}

/**
 * Age stats (average/min/max/median).
 * @param {Array} ages Array of ages (numbers).
 * @returns {object} Age statistics.
 */
function calculateAgeStats(ages) {
  if (ages.length === 0) return { averageAge: 0, minAge: 0, maxAge: 0, medianAge: 0 };

  const sorted = [...ages].sort((a, b) => a - b);

  const averageAge = roundToOneDecimal(sumNumbers(ages) / ages.length);
  const minAge = sorted[0];
  const maxAge = sorted[sorted.length - 1];
  const medianAge = medianFromSorted(sorted);

  return { averageAge, minAge, maxAge, medianAge };
}

/**
 * Sorts employees by workload (ascending).
 * @param {Array} employees Employee list.
 * @returns {Array} Sorted copy.
 */
function sortByWorkload(employees) {
  return [...employees].sort((a, b) => a.workload - b.workload);
}

/**
 * Returns random element from array.
 * @param {Array} array Input array.
 * @returns {*} Random element.
 */
function randomFromArray(array) {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Random integer between min and max (inclusive).
 * @param {number} min Min.
 * @param {number} max Max.
 * @returns {number} Random integer.
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates birthdate so the "whole years" age is between minAge and maxAge.
 * @param {number} minAge Min age.
 * @param {number} maxAge Max age.
 * @param {Date} now Current date.
 * @returns {string} ISO date-time.
 */
function randomBirthdateIsoForAgeRange(minAge, maxAge, now) {
  const targetAge = randomInt(minAge, maxAge);

  const start = new Date(now);
  start.setFullYear(now.getFullYear() - targetAge - 1);
  start.setDate(start.getDate() + 1);

  const end = new Date(now);
  end.setFullYear(now.getFullYear() - targetAge);

  const time = randomInt(start.getTime(), end.getTime());
  return new Date(time).toISOString();
}

/**
 * Calculates age in whole years (like normal age).
 * @param {string} birthdateIso ISO date-time.
 * @param {Date} now Current date.
 * @returns {number} Age in whole years.
 */
function ageInWholeYears(birthdateIso, now) {
  const birth = new Date(birthdateIso);

  let age = now.getFullYear() - birth.getFullYear();

  const monthDiff = now.getMonth() - birth.getMonth();
  const dayDiff = now.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

/**
 * Sum of number array.
 * @param {Array} values Number array.
 * @returns {number} Sum.
 */
function sumNumbers(values) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i];
  return sum;
}

/**
 * Rounds to one decimal place.
 * @param {number} value Input value.
 * @returns {number} Rounded value.
 */
function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Median of a number array.
 * @param {Array} values Number array.
 * @returns {number} Median.
 */
function medianOfNumbers(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return medianFromSorted(sorted);
}

/**
 * Median from already sorted array.
 * @param {Array} sortedValues Sorted numbers.
 * @returns {number} Median.
 */
function medianFromSorted(sortedValues) {
  const n = sortedValues.length;
  const middle = Math.floor(n / 2);

  if (n % 2 === 1) return sortedValues[middle];
  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
}



