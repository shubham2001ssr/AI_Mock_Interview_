import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTopicName = (topic: string) => {
  const key = topic.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

export const getTopicIcons = (topicArray: string[]) => {
  return topicArray.map((topic) => {
    const normalized = normalizeTopicName(topic);
    return {
      topic,
      url: normalized ? `${techIconBaseURL}/${normalized}/${normalized}-original.svg` : "/tech.svg",
    };
  });
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  // interviewCovers in constants already includes /covers/ prefix if I updated it that way
  // Let's check constants again. I updated it to include /covers/ prefix.
  // So here I should just return the string.
  return interviewCovers[randomIndex];
};
