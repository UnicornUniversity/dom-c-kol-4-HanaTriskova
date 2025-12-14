// TODO add imports if needed
// TODO doc change as needed

/**
 * Main function.
 * Generates a list of employees based on input data.
 *
 * @param {object} dtoIn - input data
 * @param {number} dtoIn.count - how many employees should be generated
 * @param {object} dtoIn.age - age range
 * @param {number} dtoIn.age.min - minimum age
 * @param {number} dtoIn.age.max - maximum age
 * @returns {Array} dtoOut - generated employees
 */
export function main(dtoIn) {

  // read input values
  const count = dtoIn.count;
  const minAge = dtoIn.age.min;
  const maxAge = dtoIn.age.max;

  // lists used for random selection
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

  // result array
  const dtoOut = [];

  // store already used birthdates so they are not duplicated
  const usedBirthdates = new Set();

  // generate employees one by one
  for (let employeeIndex = 0; employeeIndex < count; employeeIndex++) {

    // randomly decide gender
    let gender;
    if (Math.random() < 0.5) {
      gender = "male";
    } else {
      gender = "female";
    }

    // pick name and surname based on gender
    let name;
    let surname;
    if (gender === "male") {
      name = randomItem(maleNames);
      surname = randomItem(surnamesMale);
    } else {
      name = randomItem(femaleNames);
      surname = randomItem(surnamesFemale);
    }

    // generate birthdate until it is unique
    let birthdate;
    do {
      birthdate = randomBirthdate(minAge, maxAge);
    } while (usedBirthdates.has(birthdate));
    usedBirthdates.add(birthdate);

    // pick workload
    const workload = randomItem(workloads);

    // create employee object
    const employee = {
      gender: gender,
      birthdate: birthdate,
      name: name,
      surname: surname,
      workload: workload
    };

    // add employee to result
    dtoOut.push(employee);
  }

  return dtoOut;
}

/**
 * Returns a random number without decimals between min and max.
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns one random item from the given array.
 */
function randomItem(array) {
  const index = randomInt(0, array.length - 1);
  return array[index];
}

/**
 * Generates a random birthdate so that the age is between ageMin and ageMax.
 * The result is returned as an ISO date string.
 */
function randomBirthdate(ageMin, ageMax) {

  const now = new Date();

  // calculate allowed date range
  const minDate = new Date(now);
  minDate.setFullYear(minDate.getFullYear() - ageMax);

  const maxDate = new Date(now);
  maxDate.setFullYear(maxDate.getFullYear() - ageMin);

  // pick random time between the two dates
  const minTime = minDate.getTime();
  const maxTime = maxDate.getTime();
  const randomTime = randomInt(minTime, maxTime);

  const date = new Date(randomTime);
  return date.toISOString();
}
