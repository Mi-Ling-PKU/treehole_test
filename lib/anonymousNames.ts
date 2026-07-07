const ANONYMOUS_NAMES = [
  "Alice",
  "Bob",
  "Carol",
  "Dave",
  "Eve",
  "Francis",
  "Grace",
  "Hans",
  "Isabella",
  "Jason",
  "Kate",
  "Louis",
  "Margaret",
  "Nathan",
  "Olivia",
  "Paul",
  "Queen",
  "Richard",
  "Susan",
  "Thomas",
  "Uma",
  "Vivian",
  "Winnie",
  "Xander",
  "Yasmine",
  "Zach"
];

const MODIFIERS = [
  "Angry",
  "Baby",
  "Crazy",
  "Diligent",
  "Excited",
  "Fat",
  "Greedy",
  "Hungry",
  "Interesting",
  "Jolly",
  "Kind",
  "Little",
  "Magic",
  "Naive",
  "Old",
  "PKU",
  "Quiet",
  "Rich",
  "Superman",
  "THU",
  "Undefined",
  "Valuable",
  "Wifeless",
  "Xenial",
  "Young",
  "Zombie"
];

export function getGuestName(index: number) {
  if (index < ANONYMOUS_NAMES.length) {
    return ANONYMOUS_NAMES[index];
  }

  const modifierIndex = Math.floor(index / ANONYMOUS_NAMES.length) - 1;
  const name = ANONYMOUS_NAMES[index % ANONYMOUS_NAMES.length];

  if (modifierIndex < MODIFIERS.length) {
    return `${MODIFIERS[modifierIndex]} ${name}`;
  }

  return `You Win ${index}`;
}
