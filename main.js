// main.js

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
 * Main entry function.
 *
 * @param {object} dtoIn Input object.
 * @returns {object} dtoOut Result object.
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  return getEmployeeStatistics(employees);
}

/**
 * Generates a list of employees.
 *
 * @param {object} dtoIn Input object.
 * @returns {Array} Array of employees.
 */
export function generateEmployeeData(dtoIn) {
  const count = dtoIn.count;
  const minAge = dtoIn.age.min;
  const maxAge = dtoIn.age.max;
  const now = new Date();

  const employees = [];
  for (let i = 0; i < count; i++) {
    employees.push(createEmployee(minAge, maxAge, now));
  }
  return employees;
}

/**
 * Calculates statistics from employees list.
 *
 * @param {Array} employees Array of employees.
 * @returns {object} Statistics object.
 */
export function getEmployeeStatistics(employees) {
  const now = new Date();

  const collected = collectFromEmployees(employees, now);
  const ageStats = getAgeStats(collected.ages);
  const medianWorkload = getMedian(collected.workloads);
  const sortedByWorkload = sortEmployeesByWorkload(employees);

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
 * Creates one employee object.
 *
 * @param {number} minAge Minimum allowed age.
 * @param {number} maxAge Maximum allowed age.
 * @param {Date} now Current date (for consistent results).
 * @returns {object} Employee object.
 */
function createEmployee(minAge, maxAge, now) {
  const gender = pickGender();
  const name = pickNameByGender(gender);
  const surname = pickSurnameByGender(gender);
  const workload = pickRandomItem(WORKLOADS);
  const birthdate = createBirthdateIso(minAge, maxAge, now);

  return { gender, birthdate, name, surname, workload };
}

/**
 * Picks gender randomly.
 *
 * @returns {string} "male" or "female".
 */
function pickGender() {
  return Math.random() < 0.5 ? "male" : "female";
}

/**
 * Picks a name based on gender.
 *
 * @param {string} gender Gender string.
 * @returns {string} Name.
 */
function pickNameByGender(gender) {
  const list = gender === "male" ? MALE_NAMES : FEMALE_NAMES;
  return pickRandomItem(list);
}

/**
 * Picks a surname based on gender.
 *
 * @param {string} gender Gender string.
 * @returns {string} Surname.
 */
function pickSurnameByGender(gender) {
  const list = gender === "male" ? SURNAMES_MALE : SURNAMES_FEMALE;
  return pickRandomItem(list);
}

/**
 * Goes through employees and collects values for stats.
 *
 * @param {Array} employees Employees array.
 * @param {Date} now Current date.
 * @returns {object} Collected values.
 */
function collectFromEmployees(employees, now) {
  const workloadCounts = { workload10: 0, workload20: 0, workload30: 0, workload40: 0 };
  const ages = [];
  const workloads = [];

  let womenSum = 0;
  let womenCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];

    increaseWorkloadCount(workloadCounts, e.workload);
    workloads.push(e.workload);

    const age = getAgeInWholeYears(e.birthdate, now);
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
 * Increases workload counter (10/20/30/40).
 *
 * @param {object} counts Counter object.
 * @param {number} workload Workload value.
 * @returns {void}
 */
function increaseWorkloadCount(counts, workload) {
  const key = `workload${workload}`;
  if (counts[key] !== undefined) counts[key] += 1;
}

/**
 * Calculates average/min/max/median for age array.
 *
 * @param {Array} ages Array of ages (whole years).
 * @returns {object} Age stats object.
 */
function getAgeStats(ages) {
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
 * Sorts employees by workload (ascending).
 *
 * @param {Array} employees Employees array.
 * @returns {Array} Sorted copy.
 */
function sortEmployeesByWorkload(employees) {
  return [...employees].sort((a, b) => a.workload - b.workload);
}

/**
 * Creates a birthdate in ISO format so that age is between minAge and maxAge (inclusive),
 * using whole-years logic.
 *
 * @param {number} minAge Minimum age.
 * @param {number} maxAge Maximum age.
 * @param {Date} now Current date.
 * @returns {string} ISO date-time string.
 */
function createBirthdateIso(minAge, maxAge, now) {
  const oldest = new Date(now);
  oldest.setFullYear(now.getFullYear() - maxAge);

  const youngest = new Date(now);
  youngest.setFullYear(now.getFullYear() - minAge);

  const minTime = oldest.getTime();
  const maxTime = youngest.getTime();

  const randomTime = randomWholeNumber(minTime, maxTime);
  return new Date(randomTime).toISOString();
}

/**
 * Calculates age as whole years (classic age).
 *
 * @param {string} birthdateIso Birthdate in ISO format.
 * @param {Date} now Current date.
 * @returns {number} Age in whole years.
 */
function getAgeInWholeYears(birthdateIso, now) {
  const birth = new Date(birthdateIso);

  let age = now.getFullYear() - birth.getFullYear();

  const nowMonth = now.getMonth();
  const birthMonth = birth.getMonth();

  if (nowMonth < birthMonth) age -= 1;
  if (nowMonth === birthMonth && now.getDate() < birth.getDate()) age -= 1;

  return age;
}

/**
 * Returns median of numeric array.
 *
 * @param {Array} values Numeric array.
 * @returns {number} Median value.
 */
function getMedian(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return medianFromSorted(sorted);
}

/**
 * Returns median from already sorted numeric array.
 *
 * @param {Array} sortedValues Sorted numeric array.
 * @returns {number} Median.
 */
function medianFromSorted(sortedValues) {
  const n = sortedValues.length;
  const middle = Math.floor(n / 2);

  if (n % 2 === 1) return sortedValues[middle];
  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
}

/**
 * Returns random item from array.
 *
 * @param {Array} array Input array.
 * @returns {*} Random item.
 */
function pickRandomItem(array) {
  const index = randomWholeNumber(0, array.length - 1);
  return array[index];
}

/**
 * Returns random whole number between min and max (inclusive).
 *
 * @param {number} min Minimum value.
 * @param {number} max Maximum value.
 * @returns {number} Random whole number.
 */
function randomWholeNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sums array of numbers.
 *
 * @param {Array} values Array of numbers.
 * @returns {number} Sum.
 */
function sumNumbers(values) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i];
  return sum;
}

/**
 * Rounds number to one decimal place.
 *
 * @param {number} value Input value.
 * @returns {number} Rounded value.
 */
function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}



