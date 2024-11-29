const fs = require('fs');
const path = require('path');

// Models
class Discipline {
  constructor(name, totalHours, teacher, type) {
    this.name = name;
    this.totalHours = totalHours;
    this.remainingHours = totalHours;
    this.teacher = teacher;
    this.type = type;
    this.events = [];
  }

  scheduleEvent(event) {
    this.events.push(event);
    this.remainingHours -= event.duration;
  }
}

class Teacher {
  constructor(name, preferredTimeSlots, maxHoursPerWeek) {
    this.name = name;
    this.preferredTimeSlots = preferredTimeSlots;
    this.maxHoursPerWeek = maxHoursPerWeek;
    this.assignedHours = 0;
    this.dailyLoad = {}; 
    this.reservedSlots = {}; 
  }

  isAvailable(day, timeSlot) {
    // Check if the teacher has already reserved this time slot
    if (this.reservedSlots[day] && this.reservedSlots[day].includes(timeSlot)) {
      return false;
    }

    // Ensure the teacher does not exceed max hours per week
    return this.dailyLoad[day] ? this.dailyLoad[day] < this.maxHoursPerWeek : true;
  }

  reserveSlot(day, timeSlot) {
    if (!this.reservedSlots[day]) {
      this.reservedSlots[day] = [];
    }
    this.reservedSlots[day].push(timeSlot);
  }

  assignHours(day, hours) {
    if (!this.dailyLoad[day]) {
      this.dailyLoad[day] = 0;
    }
    this.dailyLoad[day] += hours;
    this.assignedHours += hours;
  }
}


class Room {
  constructor(name, size, resources) {
    this.name = name;
    this.size = size;
    this.resources = resources;
    this.availability = {}; // Track availability: { "Monday": [9, 10], "Tuesday": [10, 11] }
  }

  isAvailable(day, timeSlot) {
    return !this.availability[day] || !this.availability[day].includes(timeSlot);
  }

  reserve(day, timeSlot) {
    if (!this.availability[day]) this.availability[day] = [];
    this.availability[day].push(timeSlot);
  }
}

class Event {
  constructor(discipline, teacher, room, day, timeSlot, duration) {
    this.discipline = discipline;
    this.teacher = teacher;
    this.room = room;
    this.day = day;
    this.timeSlot = timeSlot;
    this.duration = duration;
  }
}

class Schedule {
  constructor() {
    this.events = [];
    this.timeSlots = [
      "9:00-10:20",
      "10:30-11:50",
      "12:40-14:00",
      "14:10-15:30",
      "15:40-17:00",
      "17:10-18:30",
      "18:40-20:00",
    ];
    this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  }

  addEvent(event) {
    this.events.push(event);
  }
}

// Specify Log Directory
const LOG_DIR = "D:\\CalendarPoC\\Generator\\Logs";

// Ensure the directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  console.log(`Log directory created at: ${LOG_DIR}`);
}

// Utility: Log to File
function writeLog(fileName, content) {
  const filePath = path.join(LOG_DIR, fileName);
  fs.writeFileSync(filePath, content, { encoding: "utf8" });
  console.log(`Log written to: ${filePath}`);
}

// Hardcoded Admin Inputs
const adminConstraints = {
  allowedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], // Generate on all working days
};



// Period Definitions
const PERIODS = {
  Lecture: { start: "2024-12-01", end: "2024-12-15" },
  Seminary: { start: "2024-12-16", end: "2024-12-22" },
  Exam: { start: "2024-12-23", end: "2024-12-31" },
};

function isDateInPeriod(date, period) {
  const currentDate = new Date(date);
  const startDate = new Date(period.start);
  const endDate = new Date(period.end);
  const inPeriod = currentDate >= startDate && currentDate <= endDate;
  console.log(`Checking ${date} in period ${period.start} to ${period.end}: ${inPeriod}`);
  return inPeriod;
}

function getAllowedDatesForPeriod(period) {
  const startDate = new Date(period.start);
  const endDate = new Date(period.end);
  const dates = [];

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    dates.push(formattedDate);
  }

  return dates;
}

// Teachers
const teacherSmith = new Teacher("Mr. Smith", ["Monday", "Wednesday"], 20);
const teacherJohnson = new Teacher("Dr. Johnson", ["Tuesday", "Thursday"], 15);
const teacherMaks = new Teacher("Dr. Maks", ["Monday", "Wednesday"], 30);
const teacherAndrii = new Teacher("Dr. Andrii", ["Tuesday", "Friday"], 20);
const teacherAlex = new Teacher("Dr. Alex", ["Tuesday", "Tuesday"], 18);
const teacherVlad = new Teacher("Mr. Vlad", ["Monday", "Wednesday"], 13);
const teacherPetro = new Teacher("Dr. Petro", ["Tuesday", "Friday"], 29);
const teacherSasha = new Teacher("Dr. Sasha", ["Monday", "Thursday"], 10);
const teacherVitaliy = new Teacher("Mr. Vitaliy", ["Tuesday", "Friday"], 3);
const teacherNatalia = new Teacher("Ms. Natalia", ["Monday", "Wednesday"], 23);

// Disciplines
const cybersecurity = new Discipline("Cybersecurity", 20, teacherSmith, "Lecture");
const dataScience = new Discipline("Data Science", 12, teacherJohnson, "Lecture");
const ITSM = new Discipline("ITSM", 15, teacherMaks, "Seminary");
const Mats = new Discipline("Math", 30, teacherAndrii, "Lecture");
const Cryptography = new Discipline("Cryptography", 14, teacherAlex, "Seminary");
const IT = new Discipline("IT", 5, teacherVlad, "Lecture");
const DataBase_Security = new Discipline("DataBase_Security", 23, teacherPetro, "Seminary");
const Web_tehnology = new Discipline("Web_tehnology", 27, teacherSasha, "Lecture");
const ITOB = new Discipline("ITOB", 17, teacherVitaliy, "Seminary");
const Virtual_asistent = new Discipline("Virtual_asistent", 13, teacherNatalia, "Seminary");
const Sport = new Discipline("Sport", 20, teacherAndrii, "Seminary");
const psychology = new Discipline("Psychology", 15, teacherSasha, "Lecture");
const philosophy = new Discipline("Philosophy", 10, teacherNatalia, "Seminary");


// Rooms
const roomA101 = new Room("A101", 30, ["computers", "projector"]);
const roomB202 = new Room("B202", 50, ["whiteboard"]);
const roomB102 = new Room("B102", 20, ["whiteboard"]);
const roomB103 = new Room("B103", 30, ["whiteboard"]);
const roomB203 = new Room("B203", 40, ["whiteboard"]);
const roomB303 = new Room("B303", 55, ["whiteboard"]);
const roomB301 = new Room("B301", 50, ["whiteboard"]);
const roomB302 = new Room("B302", 60, ["whiteboard"]);
const roomB405 = new Room("B405", 10, ["whiteboard"]);


// Schedule instance
const schedule = new Schedule();

function evaluateCandidate(discipline, date, timeSlot, room, teacher, schedule) {
  let baseScore = 100;

  // Penalize if the teacher exceeds max hours or already has a class on the same day
  if (!teacher.isAvailable(date, timeSlot)) {
    baseScore -= 30;
  }

  // Penalize if the room is not available
  if (!room.isAvailable(date, timeSlot)) {
    baseScore -= 50;
  }

  // Dispersion Penalty: Check teacher's daily load
  const teacherDailyLoad = teacher.dailyLoad[date] || 0;
  if (teacherDailyLoad >= 4) {
    baseScore -= 20;
  }

  console.log(
    `Evaluating candidate for discipline "${discipline.name}":\n` +
    `  Date: ${date}\n` +
    `  Time Slot: ${timeSlot}\n` +
    `  Room: ${room.name} (Size: ${room.size}, Resources: ${room.resources.join(", ")})\n` +
    `  Teacher: ${teacher.name}\n` +
    `  Score: ${baseScore}\n`
  );

  return baseScore;
}


// Core Generation Logic
function generateSchedule(disciplines, rooms, schedule, period) {
  if (!period || !period.start || !period.end) {
    console.error("Invalid period provided. Make sure 'start' and 'end' are defined.");
    return [];
  }

  const allowedDates = getAllowedDatesForPeriod(period);
  console.log(`Allowed dates for period: ${allowedDates.join(", ")}`);
  let logMessages = [];

  for (const discipline of disciplines) {
    console.log(`Processing discipline: ${discipline.name}, Type: ${discipline.type}`);

    while (discipline.remainingHours > 0) {
      console.log(`Remaining hours for ${discipline.name}: ${discipline.remainingHours}`);
      let bestCandidate = null;
      let bestScore = -Infinity;

      for (const date of allowedDates) {
        for (const timeSlot of schedule.timeSlots) {
          for (const room of rooms) {
            const teacher = discipline.teacher;

            // Skip if the teacher is not available for this time slot
            if (!teacher.isAvailable(date, timeSlot)) {
              logMessages.push(
                `Teacher ${teacher.name} is not available on ${date} at ${timeSlot}.`
              );
              continue;
            }

            const score = evaluateCandidate(discipline, date, timeSlot, room, teacher, schedule);
            logMessages.push(
              `Score for discipline "${discipline.name}" on ${date} at ${timeSlot} in ${room.name} with ${teacher.name}: ${score}`
            );

            if (score > bestScore) {
              bestScore = score;
              bestCandidate = { date, timeSlot, room, teacher };
            }
          }
        }
      }

      if (bestCandidate) {
        console.log(`Best candidate found for ${discipline.name}:`, bestCandidate);

        const event = new Event(
          discipline,
          bestCandidate.teacher,
          bestCandidate.room,
          bestCandidate.date,
          bestCandidate.timeSlot,
          2
        );

        schedule.addEvent(event);
        discipline.scheduleEvent(event);
        bestCandidate.room.reserve(bestCandidate.date, bestCandidate.timeSlot);
        bestCandidate.teacher.reserveSlot(bestCandidate.date, bestCandidate.timeSlot);
        bestCandidate.teacher.assignHours(bestCandidate.date, 2);

        // Log the detailed information about the best candidate
        logMessages.push(
          `Scheduled ${discipline.name} on ${bestCandidate.date} at ${bestCandidate.timeSlot} in ${bestCandidate.room.name} with ${bestCandidate.teacher.name}.\n` +
          `Best Candidate Details:\n` +
          `  Date: ${bestCandidate.date}\n` +
          `  Time Slot: ${bestCandidate.timeSlot}\n` +
          `  Room: ${bestCandidate.room.name} (Size: ${bestCandidate.room.size}, Resources: ${bestCandidate.room.resources.join(", ")})\n` +
          `  Teacher: ${bestCandidate.teacher.name}\n`
        );
      } else {
        const error = `Could not find a slot for ${discipline.name}`;
        console.error(error);
        logMessages.push(error);
        break;
      }
    }
  }

  return logMessages;
}



const logMessages = generateSchedule(
  [cybersecurity, dataScience, ITSM, Mats, Cryptography, IT, DataBase_Security, Web_tehnology, ITOB, Virtual_asistent, Sport, psychology, philosophy],
  [roomA101, roomB202, roomB102, roomB103, roomB203, roomB303, roomB301, roomB302, roomB405],
  schedule,
  PERIODS.Lecture
);


// Output the Schedule
function printSchedule(schedule) {
  console.log("Generated Schedule:");
  schedule.events.forEach((event) => {
    console.log(
      `${event.day} ${event.timeSlot}: ${event.discipline.name} in ${event.room.name} by ${event.teacher.name}`
    );
  });
}

// Log Schedule to File
const logContent = `
=== Schedule Generation Log ===
${new Date().toISOString()}

Generated Schedule:
${schedule.events
  .map(
    (event) =>
      `${event.day} ${event.timeSlot}: ${event.discipline.name} in ${event.room.name} by ${event.teacher.name}`
  )
  .join("\n")}

Log Messages:
${logMessages.join("\n")}
`;

// Use formatted timestamp for the log file name
const logFileName = `schedule_log_${new Date().toISOString().replace(/:/g, "-")}.txt`;
writeLog(logFileName, logContent);

printSchedule(schedule);
