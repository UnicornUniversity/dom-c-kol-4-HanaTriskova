// TODO add imports if needed
// TODO doc change as needed

/**
 * Main function.
 * It generates employees and then calculates statistics.
 * @param {object} dtoIn input data
 * @param {number} dtoIn.count number of employees to generate
 * @param {object} dtoIn.age age range
 * @param {number} dtoIn.age.min minimum age (inclusive)
 * @param {number} dtoIn.age.max maximum age (inclusive)
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
 * @param {number} dtoIn.count number of employees
 * @param {object} dtoIn.age age range
 * @param {number} dtoIn.age.min minimum age (inclusive)
 * @param {number} dtoIn.age.max maximum age (inclusive)
 * @returns {Array} list of employees
 */
export function generateEmployeeData(dtoIn) {
  const count = dtoIn.count;
  const minAge = dtoIn.age.min;
  const maxAge = dtoIn.age.max;

  const maleNames = [
    "Jan", "Pavel", "Tomáš", "Jiří", "Vratislav",
    "Karel", "Lukáš", "Martin", "Ondřej", "Petr",
    "Roman", "Radek", "Aleš", "Marek", "Michal",
    "Filip", "Jaroslav", "Václav", "Josef", "Daniel"
  ];

  const femaleNames = [
    "Jana", "Petra", "Lucie", "Eva", "Jiřina",
    "Martina", "Veronika", "Monika", "Alena", "Tereza",
    "Hana", "Barbora", "Karolína", "Helena", "Adéla",
    "Nikola", "Kateřina", "Lenka", "Zuzana", "Anna"
  ];

  const surnamesMale = [
    "Novák", "Svoboda", "Doležal", "Krejčí", "Konečný",
    "Hájek", "Urban", "Bláha", "Vlček", "Krupa",
    "Hruška", "Beran", "Ševčík", "Janda", "Mikuš",
    "Kolář", "Strnad", "Veverka", "Mazal", "Jílek"
  ];

  const surnamesFemale = [
    "Malá", "Veselá", "Krátká", "Suchá", "Štěpánová",
    "Bílá", "Jírová", "Tichá", "Vlková", "Hrubá",
    "Krásná", "Sládková", "Šafářová", "Adamcová", "Burešová",
    "Moravcová", "Hanková", "Pokorná", "Fialová", "Bártová"
  ];

  const workloads = [10, 20, 30, 40];

  const now = new Date();
  const employees = [];

  for (let i = 0; i < count; i++) {
    const gender = Math.random() < 0.5 ? "male" : "female";

    const name = gender === "male"
      ? randomItem(maleNames)
      : randomItem(femaleNames);

    const surname = gender === "male"
      ? randomItem(surnamesMale)
      : randomItem(surnamesFemale);

    const workload = randomItem(workloads);

    const birthdate = randomBirthdateIsoInAgeRange(minAge, maxAge, now);

    employees.push({
      gender: gender,
      birthdate: birthdate,
      name: name,
      surname: surname,
      workload: workload
    });
  }

  return employees;
}

/**
 * Calculates statistics from employee list.
 * @param {Array} employees list of employees
 * @returns {object} dtoOut statistics result
 */
export function getEmployeeStatistics(employees) {
  const total = employees.length;

  let workload10 = 0;
  let workload20 = 0;
  let workload30 = 0;
  let workload40 = 0;

  let womenWorkloadSum = 0;
  let womenCount = 0;

  const now = new Date();

  const ages = [];
  const workloads = [];

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];

    if (e.workload === 10) workload10++;
    if (e.workload === 20) workload20++;
    if (e.workload === 30) workload30++;
    if (e.workload === 40) workload40++;

    if (e.gender === "female") {
      womenWorkloadSum += e.workload;
      womenCount++;
    }

    const age = ageInYearsFromIso(e.birthdate, now);
    ages.push(age);
    workloads.push(e.workload);
  }

  const averageAge = total === 0 ? 0 : roundToOneDecimal(sumNumbers(ages) / total);

  const sortedAges = [...ages].sort((a, b) => a - b);
  const minAge = total === 0 ? 0 : sortedAges[0];
  const maxAge = total === 0 ? 0 : sortedAges[sortedAges.length - 1];
  const medianAge = total === 0 ? 0 : medianFromSorted(sortedAges);

  const sortedWorkloads = [...workloads].sort((a, b) => a - b);
  const medianWorkload = total === 0 ? 0 : medianFromSorted(sortedWorkloads);

  const averageWomenWorkload = womenCount === 0
    ? 0
    : roundToOneDecimal(womenWorkloadSum / womenCount);

  // do not change original employees array
  const sortedByWorkload = [...employees].sort((a, b) => a.workload - b.workload);

  return {
    total: total,
    workload10: workload10,
    workload20: workload20,
    workload30: workload30,
    workload40: workload40,
    averageAge: averageAge,
    minAge: minAge,
    maxAge: maxAge,
    medianAge: medianAge,
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
 * Creates random birthdate in ISO format so that age is between minAge and maxAge (inclusive).
 * @param {number} minAge minimum age (inclusive)
 * @param {number} maxAge maximum age (inclusive)
 * @param {Date} now current date
 * @returns {string} ISO date-time string
 */
function randomBirthdateIsoInAgeRange(minAge, maxAge, now) {
  // We use average year length (365.25 days) like the assignment hints.
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;

  // Age is (now - birth) / msPerYear
  // For age <= maxAge  => birth >= now - maxAge*msPerYear
  // For age >= minAge  => birth <= now - minAge*msPerYear
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
  if (n === 0) return 0;

  const middle = Math.floor(n / 2);

  // odd length => middle item
  if (n % 2 === 1) {
    return sortedValues[middle];
  }

  // even length => average of two middle items
  return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
}


