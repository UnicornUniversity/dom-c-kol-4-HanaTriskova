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
 * @param {object} dtoIn Input data.
 * @returns {object} dtoOut Final output.
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  return getEmployeeStatistics(employees);
}

/**
 * Generates employees based on dtoIn.
 * @param {object} dtoIn Input data.
 * @returns {Array} List of employees.
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
 * @param {Array} employees List of employees.
 * @returns {object} dtoOut Statistics result.
 */
export function getEmployeeStatistics(employees) {
  const now = new Date();

  const collected = collectStats(employees, now);
  const ageStats = calculateAgeStats(collected.ages);
  const medianWorkload = calculateMedian(collected.workloads);
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
 * @param {number} minAge Minimum age (inclusive).
 * @param {number} maxAge Maximum age (inclusive).
 * @param {Date} now Current time.
 * @returns {object} Employee.
 */
function createEmployee(minAge, maxAge, now) {
  const gender = randomGender();
  const name = pickName(gender);
  const surname = pickSurname(gender);
  const workload = randomItem(WORKLOADS);
  const birthdate = randomBirthdateIsoForWholeYears(minAge, maxAge, now);

  return { gender, birthdate, name, surname, workload };
}

/**
 * Returns random gender.
 * @returns {string} "male" or "female".
 */
function randomGender() {
  return Math.random() < 0.5 ? "male" : "female";
}

/**
 * Picks name based on gender.
 * @param {string} gender Gender.
 * @returns {string} Name.
 */
function pickName(gender) {
  return gender === "male" ? randomItem(MALE_NAMES) : randomItem(FEMALE_NAMES);
}

/**
 * Picks surname based on gender.
 * @param {string} gender Gender.
 * @returns {string} Surname.
 */
function pickSurname(gender) {
  return gender === "male" ? randomItem(SURNAMES_MALE) : randomItem(SURNAMES_FEMALE);
}

/**
 * Collects values needed for statistics.
 * @param {Array} employees List of employees.
 * @param {Date} now Current time.
 * @returns {object} Collected values.
 */
function collectStats(employees, now) {
  const workloadCounts = { workload10: 0, workload20: 0, workload30: 0, workload40: 0 };
  const ages = [];
  const workloads = [];

  let womenSum = 0;
  let womenCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];

    increaseWorkloadCount(workloadCounts, e.workload);
    workloads.push(e.workload);

    const age = getWholeYearsAge(e.birthdate, now);
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
 * @param {object} counts Counters object.
 * @param {number} workload Workload value.
 * @returns {void}
 */
function increaseWorkloadCount(counts, workload) {
  if (workload === 10) counts.workload10 += 1;
  if (workload === 20) counts.workload20 += 1;
  if (workload === 30) counts.workload30 += 1;
  if (workload === 40) counts.workload40 += 1;
}

/**
 * Calculates average/min/max/median for ages (ages are whole years).
 * @param {Array} ages Array of numbers.
 * @returns {object} Age statistics.
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
 * Sorts employees by workload (ascending), returns a new array.
 * @param {Array} employees List of employees.
 * @returns {Array} Sorted copy.
 */
function sortEmployeesByWorkload(employees) {
  return [...employees].sort((a, b) => a.workload - b.workload);
}

/**
 * Returns random item from array.
 * @param {Array} array Input array.
 * @returns {*} Random item.
 */
function randomItem(array) {
  const index = randomWholeNumber(0, array.length - 1);
  return array[index];
}

/**
 * Returns random whole number between min and max (inclusive).
 * @param {number} min Minimum value.
 * @param {number} max Maximum value.
 * @returns {number} Random whole number.
 */
function randomWholeNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates ISO birthdate so age (in whole years) is between minAge and maxAge (inclusive).
 * @param {number} minAge Minimum age.
 * @param {number} maxAge Maximum age.
 * @param {Date} now Current time.
 * @returns {string} ISO date-time string.
 */
function randomBirthdateIsoForWholeYears(minAge, maxAge, now) {
  const targetAge = randomWholeNumber(minAge, maxAge);

  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();
  const nowDay = now.getUTCDate();

  const month = randomWholeNumber(0, 11);
  const yearBase = nowYear - targetAge;

  const yearForMonth = yearBase;
  const day = randomWholeNumber(1, daysInMonthUTC(yearForMonth, month));

  let year = yearBase;

  const isAfterToday =
    month > nowMonth || (month === nowMonth && day > nowDay);

  if (isAfterToday) {
    year = yearBase - 1;
  }

  const hour = randomWholeNumber(0, 23);
  const minute = randomWholeNumber(0, 59);
  const second = randomWholeNumber(0, 59);
  const ms = randomWholeNumber(0, 999);

  return new Date(Date.UTC(year, month, day, hour, minute, second, ms)).toISOString();
}

/**
 * Returns how many days are in the given month (UTC-safe).
 * @param {number} year Year.
 * @param {number} month Month 0-11.
 * @returns {number} Days in that month.
 */
function daysInMonthUTC(year, month) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Calculates age in whole years from ISO birthdate.
 * @param {string} birthdateIso ISO date-time.
 * @param {Date} now Current time.
 * @returns {number} Age in whole years.
 */
function getWholeYearsAge(birthdateIso, now) {
  const b = new Date(birthdateIso);

  let age = now.getUTCFullYear() - b.getUTCFullYear();

  const nowMonth = now.getUTCMonth();
  const nowDay = now.getUTCDate();

  const bMonth = b.getUTCMonth();
  const bDay = b.getUTCDate();

  if (nowMonth < bMonth || (nowMonth === bMonth && nowDay < bDay)) {
    age -= 1;
  }

  return age;
}

/**
 * Sums array of numbers.
 * @param {Array} values Array of numbers.
 * @returns {number} Sum.
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
 * @param {number} value Input value.
 * @returns {number} Rounded value.
 */
function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Calculates median from numeric array.
 * @param {Array} values Array of numbers.
 * @returns {number} Median.
 */
function calculateMedian(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return medianFromSorted(sorted);
}

/**
 * Returns median from sorted numeric array.
 * @param {Array} sortedValues Sorted array.
 * @returns {number} Median.
 */
function medianFromSorted(sortedValues) {
  const n = sortedValues.length;
  const middle = Math.floor(n / 2);

  if (n % 2 === 1) {
    return sortedValues[middle];
  }

  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
}




