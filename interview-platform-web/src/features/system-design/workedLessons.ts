import { URL_SHORTENER_LESSON } from "./interviewFramework";
import { NEWS_FEED_LESSON, NOTIFICATION_LESSON, RATE_LIMITER_LESSON, type LessonSection } from "./additionalLessons";

export type WorkedLesson = { label: string; sections: LessonSection[] };

const WORKED_LESSONS: Record<string, WorkedLesson> = {
  "design a url shortener": { label: "URL Shortener", sections: URL_SHORTENER_LESSON },
  "design a rate limiter": { label: "Rate Limiter", sections: RATE_LIMITER_LESSON },
  "design twitter / news feed": { label: "Twitter / News Feed", sections: NEWS_FEED_LESSON },
  "design a notification system": { label: "Notification System", sections: NOTIFICATION_LESSON },
};

export function getWorkedLesson(title: string): WorkedLesson | undefined {
  const key = title.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(WORKED_LESSONS, key) ? WORKED_LESSONS[key] : undefined;
}
