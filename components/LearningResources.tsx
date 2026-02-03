import Image from "next/image";
import { LearningResource } from "@/constants/learning-resources";

interface LearningResourcesProps {
  resources: LearningResource[];
}

const LearningResources = ({ resources }: LearningResourcesProps) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  const getTypeIcon = (type: LearningResource['type']) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'book':
        return '📚';
      case 'course':
        return '🎓';
      case 'practice':
        return '💪';
      default:
        return '📖';
    }
  };

  const getDifficultyColor = (difficulty: LearningResource['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-2xl">📚</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">
            Recommended Learning Resources
          </h2>
          <p className="text-sm text-light-700">
            Curated materials to help you improve in your focus areas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-5 rounded-xl bg-dark-300 border border-dark-400 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">
                {getTypeIcon(resource.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                    {resource.title}
                  </h3>
                  <svg
                    className="size-4 text-light-700 group-hover:text-primary transition-colors flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>

                <p className="text-sm text-light-700 mb-3 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                      resource.difficulty
                    )}`}
                  >
                    {resource.difficulty}
                  </span>
                  <span className="text-xs text-light-700 flex items-center gap-1">
                    <svg
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {resource.estimatedTime}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-dark-400 text-light-700 capitalize">
                    {resource.type}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-dark-400/50 border border-dark-400">
        <p className="text-sm text-light-700">
          💡 <span className="font-semibold text-white">Pro Tip:</span> Focus on resources that match your areas for improvement. Start with beginner-level materials and progress to advanced topics as you build confidence.
        </p>
      </div>
    </div>
  );
};

export default LearningResources;
