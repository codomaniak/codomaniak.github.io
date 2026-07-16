/* Browser-side math word problem generator (demo). */
(function (global) {
  "use strict";

  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const TEENS = [
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  const WORD_VALUES = {};
  ONES.forEach((w, i) => { WORD_VALUES[w] = i; });
  TEENS.forEach((w, i) => { WORD_VALUES[w] = i + 10; });
  TENS.slice(2).forEach((w, i) => { WORD_VALUES[w] = (i + 2) * 10; });
  WORD_VALUES.hundred = 100;

  const PERCENT_VALUES = [5, 10, 15, 20, 25, 30, 40, 50];
  const TIME_PERCENT_SPLITS = [
    [20, 35], [10, 25], [15, 30], [20, 40], [25, 35],
    [10, 30], [15, 25], [20, 30], [10, 40], [15, 35],
  ];
  const EXAM_SECTIONS = [
    ["multiple-choice questions", "short answers", "an essay"],
    ["reading questions", "grammar exercises", "writing tasks"],
    ["listening tasks", "vocabulary questions", "a presentation"],
  ];
  const LUNCH_GOALS = ["eat their lunch", "eat lunch", "have their meal"];
  const CHORE_TASKS_A = [
    "cleaning the kitchen", "vacuuming the living room", "tidying the bathroom",
    "washing dishes", "mopping the floor", "dusting the bedroom",
  ];
  const CHORE_TASKS_B = [
    "doing laundry", "deep-cleaning the refrigerator", "ironing clothes",
    "organizing the closet", "cleaning the windows", "taking out the rubbish",
  ];

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function randInt(lo, hi) {
    return lo + Math.floor(Math.random() * (hi - lo + 1));
  }

  function sample(items, n) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  function pickTwo(items) {
    const [a, b] = sample(items, 2);
    return [a, b];
  }

  function intToWords(n) {
    if (n < 10) return ONES[n];
    if (n < 20) return TEENS[n - 10];
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`;
    }
    const hundreds = Math.floor(n / 100);
    const rem = n % 100;
    if (rem === 0) return `${ONES[hundreds]} hundred`;
    return `${ONES[hundreds]} hundred ${intToWords(rem)}`;
  }

  function W(n) {
    const words = intToWords(n);
    return words ? words[0].toUpperCase() + words.slice(1) : words;
  }

  function wordsToInt(text) {
    const tokens = text.toLowerCase().trim().replace(/-/g, " ").split(/\s+/).filter((t) => t && t !== "and");
    if (!tokens.length) return null;
    let total = 0;
    let current = 0;
    for (const token of tokens) {
      if (token === "hundred") {
        current = (current || 1) * 100;
        continue;
      }
      const value = WORD_VALUES[token];
      if (value === undefined) return null;
      current += value;
    }
    return total + current;
  }

  function parseAnswer(text) {
    const raw = text.trim().replace(",", ".");
    if (!raw) return null;
    if (/[0-9]/.test(raw) || raw === "." || raw === "-" || raw === "+.") {
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    }
    return wordsToInt(raw);
  }

  function formatAnswer(n) {
    if (typeof n === "number" && !Number.isInteger(n)) return String(n);
    const value = Math.trunc(n);
    if (value >= 0 && value < 1000) return `${value} (${intToWords(value)})`;
    return String(value);
  }

  function plural(noun) {
    if (noun === "homework") return noun;
    if (noun.endsWith(" pass")) return `${noun}es`;
    if (noun.endsWith("s")) return noun;
    if (noun.endsWith("y") && noun.length > 1 && !"aeiou".includes(noun[noun.length - 2])) {
      return `${noun.slice(0, -1)}ies`;
    }
    if (/(ch|sh|x|z)$/.test(noun)) return `${noun}es`;
    return `${noun}s`;
  }

  function nounForm(noun, count) {
    return count === 1 ? noun : plural(noun);
  }

  function singularGroup(group) {
    if (group === "children") return "child";
    if (group === "staff") return "staff member";
    if (group.endsWith("s")) return group.slice(0, -1);
    return group;
  }

  function discountMember(group) {
    const label = singularGroup(group);
    const article = "aeiou".includes(label[0]) ? "an" : "a";
    return `${article} ${label}`;
  }

  function storyLabels(person) {
    if (person.startsWith("a ")) {
      const name = person.slice(2);
      return {
        person,
        Person: `A ${name}`,
        person_the: `the ${name}`,
        Person_the: `The ${name}`,
      };
    }
    if (person.startsWith("an ")) {
      const name = person.slice(3);
      return {
        person,
        Person: `An ${name}`,
        person_the: `the ${name}`,
        Person_the: `The ${name}`,
      };
    }
    const capitalized = person ? person[0].toUpperCase() + person.slice(1) : person;
    return {
      person,
      Person: capitalized,
      person_the: person,
      Person_the: capitalized,
    };
  }

  function scenarioLabels(scenario) {
    if (scenario.topic_key === "education") {
      return { assigner: "The teacher", institution: "The school", members: "students", member: "student" };
    }
    if (scenario.topic_key === "work") {
      return { assigner: "The manager", institution: "The office", members: "employees", member: "employee" };
    }
    return { assigner: "Staff", institution: "The team", members: "people", member: "person" };
  }

  function fill(template, values) {
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
      if (!(key in values)) throw new Error(`Missing template key: ${key}`);
      return String(values[key]);
    });
  }

  function eligibleContexts(scenario, operation) {
    if (!scenario.contexts.length) return [];
    if (operation === "percentage" && scenario.purchase_items.length) {
      const filtered = scenario.contexts.filter((c) => scenario.purchase_items.includes(c.noun));
      if (filtered.length) return filtered;
    }
    return scenario.contexts;
  }

  function pickContext(scenario, operation) {
    const contexts = eligibleContexts(scenario, operation);
    if (contexts.length) return pick(contexts);
    return { noun: pick(scenario.nouns), place: pick(scenario.places), city: "" };
  }

  function subtractionTemplates(scenario) {
    const kind = scenario.item_kind;
    if (kind === "consumable") {
      return [
        "{Person} bought {total} {noun_total} for the shared {place}. By the end of the week, {person} discovered that the flatmate had eaten {taken} of them. How many {noun} were left for {person}?",
        "{Person} had {total} {noun_total} in the {place}. The roommate ate {taken}. How many {noun} are left?",
      ];
    }
    if (kind === "ticket") {
      return [
        "{Person} bought {total} {noun_total} at the {place}. During the week, {person_the} used {taken}. How many {noun} are left?",
        "There were {total} {noun_total} at the {place}. {Taken} were used. How many remain?",
        "{Person} had {total} {noun_total} for travel. After using {taken}, how many {noun} are still valid?",
      ];
    }
    if (kind === "document") {
      return [
        "{Person} had {total} {noun_total} to finish at the {place}. {Taken} are completed. How many are still left?",
        "There were {total} {noun_total} in the {place}. {Taken} are finished. How many remain?",
      ];
    }
    if (kind === "meal") {
      return [
        "{Person} ordered {total} {noun_total} at the {place}. The table sent back {taken}. How many {noun} were still served?",
        "The {place} prepared {total} {noun_total}. {Taken} were not picked up. How many were collected?",
      ];
    }
    if (scenario.topic_key === "family") {
      return [
        "There were {total} {noun_total} at the {place}. {Person} took {taken}. How many {noun} are left?",
        "There were {total} {noun_total} in the {place}. {Person} gave away {taken}. How many remain?",
        "{Person} had {total} {noun_total} for the family gathering. After giving away {taken}, how many {noun} are left?",
      ];
    }
    if (scenario.topic_key === "home") {
      return [
        "There were {total} {noun_total} in the {place}. {Person} took {taken} away. How many {noun} are left?",
        "There were {total} {noun_total} at the {place}. {Taken} were put into a cupboard. How many remain?",
        "{Person} had {total} {noun_total} in the {place}. After packing {taken} away, how many {noun} are still out?",
      ];
    }
    if (scenario.topic_key === "travelling") {
      return [
        "{Person} packed {total} {noun_total} for the trip. After taking {taken} from the bag at the {place}, how many {noun} are left?",
        "There were {total} {noun_total} at the {place}. {Person} took {taken}. How many {noun} remain?",
        "{Person} had {total} {noun_total}. {Person_the} left {taken} at the {place}. How many {noun} does {person_the} still have?",
      ];
    }
    if (scenario.topic_key === "city_life") {
      return [
        "There were {total} {noun_total} at the {place}. {Person} took {taken}. How many {noun} are left?",
        "There were {total} {noun_total} in the {place}. {Taken} were given out. How many remain?",
        "{Person} collected {total} {noun_total} at the {place}. After handing out {taken}, how many {noun} are left?",
      ];
    }
    return [
      "There were {total} {noun_total} at the {place}. {Person} took {taken}. How many {noun} are left?",
      "There were {total} {noun_total} in the {place}. {Taken} were taken away. How many remain?",
      "You had {total} {noun_total}. You gave away {taken}. How many {noun} do you still have?",
    ];
  }

  function additionTemplates(scenario) {
    const kind = scenario.item_kind;
    if (kind === "document") {
      return [
        "{Person} has {a} {noun} to finish at the {place}. {Person_the} gets {b} more. How many {noun} are there now?",
        "{assigner} at the {place} assigns {a} {noun} and then {b} more. What is the total number of {noun}?",
        "There are {a} {noun} on the list for the {place}. {institution} adds {b} more. How many {noun} are on the list?",
      ];
    }
    if (kind === "consumable") {
      return [
        "There are {a} {noun} in the {place}. {Person} buys {b} more. How many {noun} are there now?",
        "The {place} has {a} {noun}. Someone brings {b} more. What is the total number of {noun}?",
        "You count {a} {noun} and then {b} more in the {place}. How many {noun} are there in all?",
      ];
    }
    if (kind === "meal") {
      return [
        "There are {a} {noun} on the menu at the {place}. The kitchen prepares {b} more. How many {noun} are available now?",
        "{Person} orders {a} {noun} at the {place} and then {b} more. What is the total number of {noun}?",
      ];
    }
    if (kind === "ticket") {
      return [
        "The {place} sells {a} {noun} in the morning and {b} more in the afternoon. How many {noun} are sold in total?",
        "{Person} buys {a} {noun} at the {place} and later buys {b} more. How many {noun} does {person_the} have?",
      ];
    }
    return [
      "There are {a} {noun} at the {place}. {Person} gets {b} more. How many {noun} are there now?",
      "There are {a} {noun} in the {place}. Someone brings {b} more. What is the total number of {noun}?",
      "You count {a} {noun} and then {b} more at the {place}. How many {noun} are there in all?",
    ];
  }

  function multiplicationTemplates(scenario) {
    if (scenario.item_kind === "ticket") {
      return [
        "Each passenger at the {place} buys {per_group} {noun}. There are {groups} passengers. How many {noun} are bought in total?",
        "A group buys {groups} packs with {per_group} {noun} in each pack at the {place}. How many {noun} do they buy?",
      ];
    }
    if (scenario.item_kind === "document") {
      return [
        "Each {member} at the {place} is assigned {per_group} {noun}. There are {groups} {members}. How many {noun} are assigned in total?",
        "{Person} has {groups} meetings at the {place} and reviews {per_group} {noun} at each one. How many {noun} are there altogether?",
      ];
    }
    return [
      "Each box at the {place} has {per_group} {noun}. There are {groups} boxes. How many {noun} are there in total?",
      "A team packs {groups} bags with {per_group} {noun} in each bag. How many {noun} did they pack?",
      "You visit the {place} {groups} times and collect {per_group} {noun} each time. How many {noun} do you collect?",
    ];
  }

  function divisionTemplates(scenario) {
    if ((scenario.item_kind === "meal" || scenario.item_kind === "ticket") && scenario.purchase_items.length) {
      return [
        "{Person} and {groups} friends bought {noun} that cost ${total} at the {place}. They agreed to split the bill equally. How much should each of them pay?",
        "A bill of ${total} for {noun} at the {place} is shared equally among {groups} people. How much does each person pay?",
      ];
    }
    if (scenario.item_kind === "document") {
      return [
        "{Person} has {total} {noun} to finish at the {place} and shares the work equally with {groups} other {members}. How many {noun} does each {member} finish?",
        "There are {total} {noun} to divide equally among {groups} {members} at the {place}. How many {noun} does each {member} get?",
      ];
    }
    return [
      "{Person} shared {total} {noun} equally among {groups} friends at the {place}. How many {noun} did each friend get?",
      "There are {total} {noun} to put into {groups} equal groups. How many {noun} are in one group?",
      "A shelf at the {place} holds {total} {noun} on {groups} trays. Each tray has the same number. How many {noun} are on one tray?",
    ];
  }

  function percentageTemplates(scenario, savings) {
    if (scenario.topic_key === "travelling") {
      return savings
        ? ["A {item} {route} costs ${price}. If there's a {percent}% discount for {group}, how much would {discount_member} save on their ticket?"]
        : ["A {item} {route} costs ${price}. If there's a {percent}% discount for {group}, how much would {discount_member} pay?"];
    }
    if (savings) {
      return [
        "A {item} at the {place} costs ${price}. If there's a {percent}% discount for {group}, how much would {discount_member} save?",
        "A {item} for {city_a} costs ${price}. With a {percent}% discount for {group}, how much would {discount_member} save?",
      ];
    }
    return [
      "A {item} at the {place} costs ${price}. If {group} receive a {percent}% discount, how much would {discount_member} pay?",
    ];
  }

  function timeRemainingTemplates() {
    return [
      "{Person} has {total} minutes for {activity} between classes. If it takes {a} minutes to walk to the {place}, {b} minutes to order food, and {c} minutes to walk back to class, how many minutes does {person_the} have left to {goal}?",
      "{Person} has {total} minutes for {activity} at school. It takes {a} minutes to get to the {place}, {b} minutes to buy food, and {c} minutes to return to class. How many minutes are left to {goal}?",
    ];
  }

  function timePercentageTemplates() {
    return [
      "During a {hours}-hour {event} at the {place}, {person_the} spends {p1}% of the time on {part1}, {p2}% on {part2}, and the rest on {part3}. How many minutes does {person_the} have for {part3}?",
      "A {hours}-hour {event} in the {place} is divided into three parts. {Person_the} spends {p1}% on {part1} and {p2}% on {part2}. The remaining time is for {part3}. How many minutes is that?",
    ];
  }

  function timeCompareTemplates() {
    return [
      "{person_a} spent {a1} minutes {task_a1}, {a2} minutes {task_a2}, and {a3} minutes {task_a3}. {person_b} spent {b1} minutes {task_b1} and {b2} minutes {task_b2}. How many more minutes did {person_b} spend on chores compared to {person_a}?",
      "{person_a} did chores for {a1} minutes {task_a1}, {a2} minutes {task_a2}, and {a3} minutes {task_a3}. {person_b} spent {b1} minutes {task_b1} and {b2} minutes {task_b2} on chores. How many more minutes did {person_b} work than {person_a}?",
    ];
  }

  function templateCount(operation, scenario) {
    if (operation === "percentage") return 2;
    if (operation === "time_remaining") return timeRemainingTemplates().length;
    if (operation === "time_percentage") return timePercentageTemplates().length;
    if (operation === "time_compare") return timeCompareTemplates().length;
    if (operation === "subtraction") return subtractionTemplates(scenario).length;
    if (operation === "addition") return additionTemplates(scenario).length;
    if (operation === "multiplication") return multiplicationTemplates(scenario).length;
    if (operation === "division") return divisionTemplates(scenario).length;
    throw new Error(`Unknown operation: ${operation}`);
  }

  function pickPricePercent() {
    const pairs = [];
    for (let price = 20; price <= 100; price += 10) {
      for (const percent of PERCENT_VALUES) {
        if ((price * percent) % 100 === 0) pairs.push([price, percent]);
      }
    }
    return pick(pairs);
  }

  function percentageCities(scenario, context) {
    if (scenario.topic_key === "travelling" && scenario.cities.length >= 2) {
      if (context.city) {
        const others = scenario.cities.filter((c) => c !== context.city);
        return [context.city, others.length ? pick(others) : pick(scenario.cities)];
      }
      return pickTwo(scenario.cities);
    }
    if (context.city) return [context.city, context.place];
    if (scenario.cities.length >= 2) return pickTwo(scenario.cities);
    if (scenario.places.length) return [scenario.places[0], scenario.places[scenario.places.length - 1]];
    return [context.place, context.place];
  }

  function pickTimeRemainingParams() {
    const total = randInt(35, 60);
    for (;;) {
      const a = randInt(3, 12);
      const b = randInt(3, 10);
      const c = randInt(3, 12);
      if (total - a - b - c >= 5) {
        return { total, a, b, c, goal: pick(LUNCH_GOALS) };
      }
    }
  }

  function pickTimePercentageParams() {
    const hours = pick([2, 3, 4]);
    const totalMinutes = hours * 60;
    const valid = TIME_PERCENT_SPLITS.filter(([p1, p2]) => p1 + p2 < 100 && (totalMinutes * (100 - p1 - p2)) % 100 === 0);
    const [p1, p2] = pick(valid);
    const [part1, part2, part3] = pick(EXAM_SECTIONS);
    return { hours, p1, p2, part1, part2, part3, event: "exam" };
  }

  function pickTimeCompareParams(scenario, personA, personB) {
    for (;;) {
      const a1 = randInt(15, 50);
      const a2 = randInt(15, 50);
      const a3 = randInt(15, 50);
      const b1 = randInt(20, 60);
      const b2 = randInt(20, 60);
      if (b1 + b2 > a1 + a2 + a3) {
        const tasksA = sample(CHORE_TASKS_A, 3);
        const tasksB = sample(CHORE_TASKS_B, 2);
        return {
          person_a: personA,
          person_b: personB,
          a1, a2, a3, b1, b2,
          task_a1: tasksA[0], task_a2: tasksA[1], task_a3: tasksA[2],
          task_b1: tasksB[0], task_b2: tasksB[1],
        };
      }
    }
  }

  function scenarioParams(scenario, operation, context, person, secondPerson) {
    if (operation === "time_remaining") return pickTimeRemainingParams();
    if (operation === "time_percentage") return pickTimePercentageParams();
    if (operation === "time_compare") {
      let personA = person || pick(scenario.people);
      let personB = secondPerson;
      if (!personB) {
        const others = scenario.people.filter((p) => p !== personA);
        personB = others.length ? pick(others) : personA;
      }
      return pickTimeCompareParams(scenario, personA, personB);
    }
    if (operation === "percentage") {
      const [price, percent] = pickPricePercent();
      const [cityA, cityB] = percentageCities(scenario, context);
      let item = context.noun;
      if (scenario.purchase_items.length && !scenario.purchase_items.includes(item)) {
        item = pick(scenario.purchase_items);
      }
      return {
        price,
        percent,
        city_a: cityA,
        city_b: cityB,
        item,
        group: pick(scenario.discount_groups.length ? scenario.discount_groups : ["students"]),
      };
    }
    if (operation === "addition") return { a: randInt(2, 25), b: randInt(2, 25) };
    if (operation === "subtraction") {
      const total = randInt(10, 40);
      return { total, taken: randInt(2, total - 1) };
    }
    if (operation === "multiplication") return { groups: randInt(2, 8), per_group: randInt(2, 9) };
    return { groups: randInt(2, 8), per_group: randInt(2, 9) };
  }

  function renderProblem(scenario, operation, templateIndex, noun, place, person, params, topicLabel) {
    let text;
    let answer;

    if (operation === "percentage") {
      const savings = (params.price * params.percent) / 100;
      const finalPrice = params.price - savings;
      const templates = percentageTemplates(scenario, templateIndex === 0);
      const fmt = {
        price: params.price,
        percent: params.percent,
        place,
        city_a: params.city_a,
        city_b: params.city_b,
        item: params.item,
        group: params.group,
        discount_member: discountMember(params.group),
        route: `from ${params.city_a} to ${params.city_b}`,
      };
      text = fill(templates[0], fmt);
      answer = templateIndex === 0 ? savings : finalPrice;
    } else if (operation === "time_remaining") {
      const templates = timeRemainingTemplates();
      answer = params.total - params.a - params.b - params.c;
      text = fill(templates[templateIndex], {
        total: intToWords(params.total),
        a: intToWords(params.a),
        b: intToWords(params.b),
        c: intToWords(params.c),
        place,
        activity: "lunch",
        goal: params.goal,
        ...storyLabels(person),
      });
    } else if (operation === "time_percentage") {
      const templates = timePercentageTemplates();
      answer = (params.hours * 60 * (100 - params.p1 - params.p2)) / 100;
      text = fill(templates[templateIndex], {
        hours: intToWords(params.hours),
        place,
        event: params.event,
        p1: params.p1,
        p2: params.p2,
        part1: params.part1,
        part2: params.part2,
        part3: params.part3,
        ...storyLabels(person),
      });
    } else if (operation === "time_compare") {
      const templates = timeCompareTemplates();
      answer = (params.b1 + params.b2) - (params.a1 + params.a2 + params.a3);
      text = fill(templates[templateIndex], {
        person_a: params.person_a,
        person_b: params.person_b,
        a1: intToWords(params.a1),
        a2: intToWords(params.a2),
        a3: intToWords(params.a3),
        b1: intToWords(params.b1),
        b2: intToWords(params.b2),
        task_a1: params.task_a1,
        task_a2: params.task_a2,
        task_a3: params.task_a3,
        task_b1: params.task_b1,
        task_b2: params.task_b2,
      });
    } else if (operation === "addition") {
      const templates = additionTemplates(scenario);
      answer = params.a + params.b;
      text = fill(templates[templateIndex], {
        a: intToWords(params.a),
        b: intToWords(params.b),
        noun: nounForm(noun, answer),
        place,
        ...storyLabels(person),
        ...scenarioLabels(scenario),
      });
    } else if (operation === "subtraction") {
      const templates = subtractionTemplates(scenario);
      answer = params.total - params.taken;
      text = fill(templates[templateIndex], {
        total: intToWords(params.total),
        taken: intToWords(params.taken),
        Taken: W(params.taken),
        noun: nounForm(noun, answer),
        noun_total: nounForm(noun, params.total),
        place,
        ...storyLabels(person),
      });
    } else if (operation === "multiplication") {
      const templates = multiplicationTemplates(scenario);
      answer = params.groups * params.per_group;
      text = fill(templates[templateIndex], {
        groups: intToWords(params.groups),
        per_group: intToWords(params.per_group),
        noun: nounForm(noun, answer),
        place,
        ...storyLabels(person),
        ...scenarioLabels(scenario),
      });
    } else {
      const templates = divisionTemplates(scenario);
      answer = params.per_group;
      const total = params.groups * params.per_group;
      text = fill(templates[templateIndex], {
        groups: intToWords(params.groups),
        per_group: intToWords(params.per_group),
        total: intToWords(total),
        noun: nounForm(noun, params.per_group),
        place,
        ...storyLabels(person),
        ...scenarioLabels(scenario),
      });
    }

    return {
      text,
      answer,
      topic: topicLabel,
      operation,
      scenario: scenario.key,
    };
  }

  function generateProblem(topicKey) {
    const data = global.DEMO_DATA;
    if (!data) throw new Error("Demo data not loaded.");
    const scenarioKeys = data.topic_to_scenarios[topicKey];
    if (!scenarioKeys || !scenarioKeys.length) throw new Error("Unknown topic.");
    const scenario = data.scenarios[pick(scenarioKeys)];
    const operation = pick(scenario.operations);
    const context = pickContext(scenario, operation);
    const person = pick(scenario.people);
    let secondPerson = "";
    if (operation === "time_compare") {
      const others = scenario.people.filter((p) => p !== person);
      secondPerson = others.length ? pick(others) : person;
    }
    const params = scenarioParams(scenario, operation, context, person, secondPerson);
    const templateIndex = randInt(0, templateCount(operation, scenario) - 1);
    return renderProblem(
      scenario,
      operation,
      templateIndex,
      context.noun,
      context.place,
      person,
      params,
      data.topic_labels[scenario.topic_key],
    );
  }

  function checkAnswer(problem, userInput) {
    if (!String(userInput).trim()) {
      return { correct: false, message: "Please enter a number or write it in words (e.g. 12 or twelve)." };
    }
    const value = parseAnswer(userInput);
    if (value === null) {
      return { correct: false, message: "That is not a valid number. Use digits (12) or words (twelve)." };
    }
    const correct = Math.abs(Number(value) - Number(problem.answer)) < 1e-9;
    if (correct) return { correct: true, message: "Correct! Well done." };
    return { correct: false, message: `Not quite. The correct answer is ${formatAnswer(problem.answer)}.` };
  }

  global.DemoGenerator = { generateProblem, checkAnswer, formatAnswer };
})(window);
