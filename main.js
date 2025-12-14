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
 * It generates employees and returns statistics.
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

  const workloadCounts = { workload10: 0, workload20: 0, workload30: 0, workload40: 0 };
  const ages = [];
  const workloads = [];

  let womenSum = 0;
  let womenCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];

    increaseWorkloadCount(workloadCounts, e.workload);
    workloads.push(e.workload);

    const age = getFullYearsAge(e.birthdate, now);
    ages.push(age);

    if (e.gender === "female") {
      womenSum += e.workload;
      womenCount += 1;
    }
  }

  const ageStats = calculateAgeStats(ages);
  const medianWorkload = calculateMedian(workloads);
  const averageWomenWorkload = womenCount === 0 ? 0 : roundToOneDecimal(womenSum / womenCount);
  const sortedByWorkload = sortEmployeesByWorkload(employees);

  return {
    total: employees.length,
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
 * Creates one employee object.
 * @param {number} minAge minimum age
 * @param {number} maxAge maximum age
 * @param {Date} now current time
 * @returns {object} employee
 */
function createEmployee(minAge, maxAge, now) {
  const gender = Math.random() < 0.5 ? "male" : "female";
  const name = gender === "male" ? randomItem(MALE_NAMES) : randomItem(FEMALE_NAMES);
  const surname = gender === "male" ? randomItem(SURNAMES_MALE) : randomItem(SURNAMES_FEMALE);

  const workload = randomItem(WORKLOADS);

  // pick target age first, then generate a birthdate that really gives this age
  const targetAge = randomWholeNumber(minAge, maxAge);
  const birthdate = randomBirthdateIsoForAge(targetAge, now);

  return { gender, birthdate, name, surname, workload };
}

/**
 * Increases the correct workload counter.
 * @param {object} counts counters object
 * @param {number} workload workload value
 * @returns {void}
 */
function increaseWorkloadCount(counts, workload) {
  const key = `workload${workload}`;
  if (counts[key] !== undefined) counts[key] += 1;
}

/**
 * Calculates average/min/max/median for ages (ages are whole years).
 * @param {Array} ages array of numbers
 * @returns {object} age statistics
 */
function calculateAgeStats(ages) {
  if (ages.length === 0) {
    return { averageAge: 0, minAge: 0, maxAge: 0, medianAge: 0 };
  }

  const sorted = [...ages].sort((a, b) => a - b);
  const avg = sumNumbers(ages) / ages.length;

  return {
    averageAge: roundToOneDecimal(avg),
    minAge: sorted[0],
    maxAge: sorted[sorted.length - 1],
    medianAge: medianFromSorted(sorted)
  };
}

/**
 * Calculates median from numeric array.
 * @param {Array} values array of numbers
 * @returns {number} median
 */
function calculateMedian(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return medianFromSorted(sorted);
}

/**
 * Sorts employees by workload (does not change original array).
 * @param {Array} employees list of employees
 * @returns {Array} sorted copy
 */
function sortEmployeesByWorkload(employees) {
  return [...employees].sort((a, b) => a.workload - b.workload);
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
 * Generates a random birthdate so the full-years age equals targetAge.
 * @param {number} targetAge target full-years age
 * @param {Date} now current time
 * @returns {string} ISO date-time string
 */
function randomBirthdateIsoForAge(targetAge, now) {
  // We want birthdate to be between:
  // (now shifted by -(targetAge+1) years, now shifted by -targetAge years] so full-years age is targetAge.
  const end = new Date(now);
  end.setFullYear(end.getFullYear() - targetAge);

  const start = new Date(now);
  start.setFullYear(start.getFullYear() - (targetAge + 1));
  // small push forward so we don't accidentally get targetAge+1
  start.setMilliseconds(start.getMilliseconds() + 1);

  const startMs = start.getTime();
  const endMs = end.getTime();
  const randomMs = startMs + Math.random() * (endMs - startMs);

  return new Date(randomMs).toISOString();
}

/**
 * Calculates age in full years (like real age).
 * @param {string} birthdateIso ISO date-time
 * @param {Date} now current time
 * @returns {number} age in full years
 */
function getFullYearsAge(birthdateIso, now) {
  const birth = new Date(birthdateIso);

  let age = now.getFullYear() - birth.getFullYear();

  const nowMonth = now.getMonth();
  const birthMonth = birth.getMonth();

  if (nowMonth < birthMonth) {
    age -= 1;
  } else if (nowMonth === birthMonth && now.getDate() < birth.getDate()) {
    age -= 1;
  }

  return age;
}

/**
 * Sums array of numbers.
 * @param {Array} values array of numbers
 * @returns {number} sum
 */
function sumNumbers(values) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i];
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
  const mid = Math.floor(n / 2);

  if (n % 2 === 1) return sortedValues[mid];
  return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
}



