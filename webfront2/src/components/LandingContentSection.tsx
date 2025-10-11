import React from "react";

interface LandingContentSectionProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
  imageOnLeft?: boolean;
  style?: React.CSSProperties;
}

export function LandingContentSection({
  imageUrl,
  imageAlt,
  title,
  description,
  imageOnLeft = true,
  style,
}: LandingContentSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" style={style}>
      <div className={`max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:space-x-16 ${
        imageOnLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
      }`}>
        {/* Image */}
        <div className="w-full lg:w-1/2 mb-12 lg:mb-0 flex justify-center">
          <div className="relative">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="rounded-2xl shadow-xl object-cover w-full max-w-lg h-80 sm:h-96 lg:h-[400px]"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>

        {/* Text */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left px-4 lg:px-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}