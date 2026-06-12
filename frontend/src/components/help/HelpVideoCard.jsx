import React from "react";

export default function HelpVideoCard({ title, url }) {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-sm aspect-video">
      <iframe
        className="w-full h-full"
        src={url}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
