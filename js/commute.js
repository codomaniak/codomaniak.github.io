function calculateCommute() {
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }
    const commuteTimeMinutes = Math.floor(Math.random() * 61) + 30; // Random time between 30 to 90 minutes
    const daysPerWeek = Math.floor(Math.random() * 3) + 3; // Random days between 3 to 5 days
    const weeksInSemester = Math.floor(Math.random() * 8) + 12; // Random weeks between 12 to 20 weeks

    const totalCommuteMinutes = commuteTimeMinutes * daysPerWeek * weeksInSemester;
    const totalCommuteHours = totalCommuteMinutes / 60;

    const problemStatement = 'Student`s commute to university takes ${commuteTimeMinutes} minutes by bus. If he has classes ${daysPerWeek} days a week for ${weeksInSemester} weeks in a semester, how many hours does he spend commuting in total for one semester?';

    return {
        problem: problemStatement,
        answer: totalCommuteHours
    };
}

const result = calculateCommute();
console.log(result.problem);
