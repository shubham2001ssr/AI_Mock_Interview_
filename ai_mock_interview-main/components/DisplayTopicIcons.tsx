import Image from "next/image";

import { cn, getTopicIcons } from "@/lib/utils";

const DisplayTopicIcons = ({ focusAreas }: TopicIconProps) => {
  const topicIcons = getTopicIcons(focusAreas);

  return (
    <div className="flex flex-row">
      {topicIcons.slice(0, 3).map(({ topic, url }, index) => (
        <div
          key={topic}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{topic}</span>

          <Image
            src={url}
            alt={topic}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTopicIcons;
