import React from "react";
import { Users, Trophy, Globe, Calendar, MessageCircle, BarChart3 } from "lucide-react";

interface GridItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

const GridItem: React.FC<GridItemProps> = ({ 
  icon, 
  title, 
  description, 
  iconColor, 
  bgColor, 
  borderColor 
}) => (
  <div className={`group bg-white p-6 lg:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-${borderColor} transition-all duration-300 transform hover:-translate-y-1`}>
    <div className={`w-12 h-12 lg:w-14 lg:h-14 ${bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <div className={`w-6 h-6 lg:w-7 lg:h-7 ${iconColor}`}>
        {icon}
      </div>
    </div>
    <h3 className={`text-lg lg:text-xl font-bold text-gray-900 mb-3 group-hover:${iconColor.replace('text-', 'text-')} transition-colors`}>
      {title}
    </h3>
    <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
      {description}
    </p>
  </div>
);

export const ResponsiveGrid: React.FC = () => {
  const features = [
    {
      icon: <Users className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />,
      title: "Community Hub",
      description: "Connect with cricket players, coaches, and fans from around the world. Join discussions, share experiences, and build lasting relationships.",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "blue-200"
    },
    {
      icon: <Trophy className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />,
      title: "Live Matches",
      description: "Follow live cricket matches, get real-time updates, scores, and commentary. Never miss a moment of your favorite sport.",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "green-200"
    },
    {
      icon: <Globe className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />,
      title: "Global Reach",
      description: "Access cricket content from local clubs to international tournaments. Share your experiences from any cricket ground worldwide.",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "purple-200"
    },
    {
      icon: <Calendar className="w-6 h-6 lg:w-7 lg:h-7 text-orange-600" />,
      title: "Event Management",
      description: "Create and manage cricket events, tournaments, and training sessions. Keep track of schedules and never miss important matches.",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "orange-200"
    },
    {
      icon: <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 text-pink-600" />,
      title: "Real-time Chat",
      description: "Chat with fellow cricket enthusiasts during matches, share insights, and engage in meaningful discussions about the game.",
      iconColor: "text-pink-600",
      bgColor: "bg-pink-100",
      borderColor: "pink-200"
    },
    {
      icon: <BarChart3 className="w-6 h-6 lg:w-7 lg:h-7 text-indigo-600" />,
      title: "Statistics & Analytics",
      description: "Track player performance, match statistics, and team analytics. Get detailed insights to improve your game and strategy.",
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
      borderColor: "indigo-200"
    }
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the powerful features that make TheLineCricket the ultimate platform for cricket enthusiasts
          </p>
        </div>

        {/* Responsive 2x3 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <GridItem
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconColor={feature.iconColor}
              bgColor={feature.bgColor}
              borderColor={feature.borderColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
