import type { CommentWithReply } from "@/lib/types";

const ANONYMOUS_NAMES = [
  "Alice",
  "Bob",
  "Carol",
  "David",
  "Emma",
  "Frank",
  "Grace",
  "Henry",
  "Iris",
  "Jack",
  "Kate",
  "Leo",
  "Mia",
  "Noah",
  "Olivia",
  "Paul",
  "Quinn",
  "Rose",
  "Sam",
  "Tina",
  "Uma",
  "Victor",
  "Wendy",
  "Xander",
  "Yara",
  "Zoe"
];

export function buildAnonymousNameMap(comments: CommentWithReply[], postAuthorId: string) {
  const namesByUserId = new Map<string, string>();
  let nextGuestIndex = 0;

  for (const comment of comments) {
    if (comment.user_id === postAuthorId) {
      namesByUserId.set(comment.user_id, "OP");
      continue;
    }

    if (!namesByUserId.has(comment.user_id)) {
      namesByUserId.set(comment.user_id, getGuestName(nextGuestIndex));
      nextGuestIndex += 1;
    }
  }

  return namesByUserId;
}

function getGuestName(index: number) {
  if (index < ANONYMOUS_NAMES.length) {
    return ANONYMOUS_NAMES[index];
  }

  return `Mr.${index + 1}`;
}
