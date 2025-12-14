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
 * Main function.
 * It generates employees and then calculates statistics.
 * @param {object} dtoIn input data
 * @returns {object} dtoOut final result
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  const dtoOut = getEmployeeStatistics(employees);
  return dtoOut;
}

/**
 * Generates employee list based on input.
 * @param {object} dtoIn input data
 * @returns {Array} list of employees
 */
export function generateEmployeeData(dtoIn) {
  const count = dtoIn.count;
  const minAge = dtoIn.age.min;
  const maxAge = dtoIn.age.max;

  const now = new Date();
  const employees = [];

  for (let i = 0; i < count; i++) {
    const gender = Math.random() < 0.5 ? "male" : "female";
    const name = gender === "male" ? randomItem(MALE_NAMES) : randomItem(FEMALE_NAMES);
    const surname = gender === "male" ? randomItem(SURNAMES_MALE) : randomItem(SURNAMES_FEMALE);
    const workload = randomItem(WORKLOADS);
    const birthdate = randomBirthdateIsoInAgeRange(minAge, maxAge, now);

    employees.push({ gender, birthdate, name, surname, workload });
  }

  return employees;
}

/**
 * Calculates statistics from employee list.
 * @param {Array} employees list of employees
 * @returns {object} dtoOut statistics result
 */
export function getEmployeeStatistics(employees) {
  const now = new Date();
  const base = collectNumbers(employees, now);

  const ageStats = getAgeStats(base.ages);
  const medianWorkload = base.workloads.length === 0 ? 0 : medianFromSorted([...base.workloads].sort((a, b) => a - b));

  const sortedByWorkload = [...employees].sort((a, b) => a.workload - b.workload);

  return {
    total: employees.length,
    workload10: base.workloadCounts.workload10,
    workload20: base.workloadCounts.workload20,
    workload30: base.workloadCounts.workload30,
    workload40: base.workloadCounts.workload40,
    averageAge: ageStats.averageAge,
    minAge: ageStats.minAge,
    maxAge: ageStats.maxAge,
    medianAge: ageStats.medianAge,
    medianWorkload: medianWorkload,
    averageWomenWorkload: base.averageWomenWorkload,
    sortedByWorkload: sortedByWorkload
  };
}

/**
 * Goes through employees once and collects numbers we need.
 * @param {Array} employees list of employees
 * @param {Date} now current date
 * @returns {object} collected data
 */
function collectNumbers(employees, now) {
  const workloadCounts = { workload10: 0, workload20: 0, workload30: 0, workload40: 0 };
  const ages = [];
  const workloads = [];

  let womenSum = 0;
  let womenCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];

    const key = `workload${e.workload}`;
    if (workloadCounts[key] !== undefined) {
      workloadCounts[key] += 1;
    }

    if (e.gender === "female") {
      womenSum += e.workload;
      womenCount += 1;
    }

    ages.push(ageInYearsFromIso(e.birthdate, now));
    workloads.push(e.workload);
  }

  const averageWomenWorkload = womenCount === 0 ? 0 : roundToOneDecimal(womenSum / womenCount);

  return { workloadCounts, ages, workloads, averageWomenWorkload };
}

/**
 * Calculates age stats from age array.
 * @param {Array} ages array of ages (numbers)
 * @returns {object} age stats
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
 * Returns random item from array.
 * @param {Array} array input array
 * @returns {*} random item
 */
function randomItem(array) {
  const index = randomWholeNumber(0, array.length - 1);
  return array[index];
}

/**
 * Returns random whole number between min and max.
 * @param {number} min minimum value
 * @param {number} max maximum value
 * @returns {number} random whole number
 */
function randomWholeNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates random birthdate in ISO format so that age is between minAge and maxAge.
 * @param {number} minAge minimum age 
 * @param {number} maxAge maximum age 
 * @param {Date} now current date
 * @returns {string} ISO date-time string
 */
function randomBirthdateIsoInAgeRange(minAge, maxAge, now) {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;

  const oldestAllowed = now.getTime() - (maxAge * msPerYear);
  const youngestAllowed = now.getTime() - (minAge * msPerYear);

  const randomTime = oldestAllowed + Math.random() * (youngestAllowed - oldestAllowed);
  return new Date(randomTime).toISOString();
}

/**
 * Calculates age in years from ISO date string.
 * @param {string} birthdateIso ISO date-time string
 * @param {Date} now current date
 * @returns {number} age in years (can be decimal)
 */
function ageInYearsFromIso(birthdateIso, now) {
  const birth = new Date(birthdateIso);
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  return (now.getTime() - birth.getTime()) / msPerYear;
}

/**
 * Sums number array.
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
 * @param {number} value input number
 * @returns {number} rounded number
 */
function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Returns median from a sorted numeric array.
 * @param {Array} sortedValues sorted array of numbers
 * @returns {number} median value
 */
function medianFromSorted(sortedValues) {
  const n = sortedValues.length;
  const middle = Math.floor(n / 2);

  if (n % 2 === 1) {
    return sortedValues[middle];
  }

  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
}



