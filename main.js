// TODO add imports if needed
// TODO doc change as needed

/**
 * Main function.
 * It generates employees and then calculates statistics from them.
 *
 * @param {object} dtoIn input data
 * @param {number} dtoIn.count number of employees to generate
 * @param {object} dtoIn.age age interval
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
 * Generates an array of employees.
 *
 * @param {object} dtoIn input data
 * @param {number} dtoIn.count number of employees
 * @param {object} dtoIn.age age interval
 * @param {number} dtoIn.age.min minimum age
 * @param {number} dtoIn.age.max maximum age
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
    "Hájek", "Urban", "Bláha", "Vlk", "Krupa",
    "Hruška", "Beran", "Ševčík", "Janda", "Mikuš",
    "Kolář", "Strnad", "Veverka", "Mazal", "Jílek"
  ];

  const surnamesFemale = [
    "Malá", "Veselá", "Krátká", "Suchá", "Štěpánová",
    "Bílá", "Jírova", "Tichá", "Vlková", "Hrubá",
    "Krásná", "Sládková", "Šafářová", "Adamcová", "Burešová",
    "Moravcová", "Hanáková", "Pokorná", "Fialová", "Bártová"
  ];

  const workloads = [10, 20, 30, 40];

  const employees = [];

  // to avoid having the same birthdate twice
  const usedBirthdates = new Set();

  for (let i = 0; i < count; i++) {
    // choose gender
    let gender;
    if (Math.random() < 0.5) {
      gender = "male";
    } else {
      gender = "female";
    }

    // choose name and surname based on gender
    let name;
    let surname;
    if (gender === "male") {
      name = randomItem(maleNames);
      surname = randomItem(surnamesMale);
    } else {
      name = randomItem(femaleNames);
      surname = randomItem(surnamesFemale);
    }

    // generate birthdate in correct age interval
    let birthdate;
    do {
      birthdate = randomBirthdate(minAge, maxAge);
    } while (usedBirthdates.has(birthdate));
    usedBirthdates.add(birthdate);

    // choose workload
    const workload = randomItem(workloads);

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
 *
 * @param {Array} employees list of employees
 * @returns {object} dtoOut statistics and sorted list
 */
export function getEmployeeStatistics(employees) {
  const total = employees.length;

  let workload10 = 0;
  let workload20 = 0;
  let workload30 = 0;
  let workload40 = 0;

  const now = new Date();

  let sumAgeExact = 0;
  const agesWhole = [];
  const workloads = [];

  let sumWomenWorkload = 0;
  let womenCount = 0;

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];

    // workload counters
    if (employee.workload === 10) workload10++;
    if (employee.workload === 20) workload20++;
    if (employee.workload === 30) workload30++;
    if (employee.workload === 40) workload40++;

    // age
    const ageExact = getAgeInYears(employee.birthdate, now);
    sumAgeExact += ageExact;
    agesWhole.push(Math.floor(ageExact));

    workloads.push(employee.workload);

    // average workload for women
    if (employee.gender === "female") {
      sumWomenWorkload += employee.workload;
      womenCount++;
    }
  }

  const averageAge = total === 0 ? 0 : roundToOneDecimal(sumAgeExact / total);
  const minAge = agesWhole.length === 0 ? 0 : Math.min(...agesWhole);
  const maxAge = agesWhole.length === 0 ? 0 : Math.max(...agesWhole);

  const medianAge = medianOfNumbers(agesWhole);
  const medianWorkload = medianOfNumbers(workloads);

  const averageWomenWorkload =
    womenCount === 0 ? 0 : roundToOneDecimal(sumWomenWorkload / womenCount);

  // sort employees by workload from lowest to highest
  const sortedByWorkload = employees
    .slice()
    .sort((a, b) => a.workload - b.workload);

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

// returns random item from array
function randomItem(array) {
  const index = randomNumber(0, array.length - 1);
  return array[index];
}

// returns random number between min and max (inclusive)
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// rounds number to one decimal place
function roundToOneDecimal(number) {
  return Math.round(number * 10) / 10;
}

// calculates age in years (using average year length)
function getAgeInYears(birthdateIso, now) {
  const birth = new Date(birthdateIso);
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  return (now.getTime() - birth.getTime()) / msPerYear;
}

// calculates median from number array
function medianOfNumbers(values) {
  if (values.length === 0) return 0;

  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return (sorted[middle - 1] + sorted[middle]) / 2;
}

// generates random birthdate between (now - maxAge) and (now - minAge)
function randomBirthdate(ageMin, ageMax) {
  const now = new Date();

  const oldest = new Date(now);
  oldest.setFullYear(oldest.getFullYear() - ageMax);

  const youngest = new Date(now);
  youngest.setFullYear(youngest.getFullYear() - ageMin);

  const minTime = oldest.getTime();
  const maxTime = youngest.getTime();

  const randomTime = randomNumber(minTime, maxTime);

  return new Date(randomTime).toISOString();
}

