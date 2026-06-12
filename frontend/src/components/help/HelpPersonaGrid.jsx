import React from "react";
import HelpPersonaCard from "./HelpPersonaCard";
import { Shield, BookOpen, UserCircle, Users } from "lucide-react";

const PERSONAS = [
  {
    id: "admin",
    title: "Admin",
    subtitle: "System setup & controls",
    icon: Shield,
  },
  {
    id: "teacher",
    title: "Teacher",
    subtitle: "Manage classes & grading",
    icon: BookOpen,
  },
  {
    id: "student",
    title: "Student",
    subtitle: "Access lessons & learning",
    icon: UserCircle,
  },
  {
    id: "parent",
    title: "Parent",
    subtitle: "Track progress & fees",
    icon: Users,
  },
];

export default function HelpPersonaGrid({ onSelectPersona }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Who are you?</h2>
        <p className="text-gray-500 text-sm">Select your role to find relevant guides and tutorials.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PERSONAS.map((persona) => (
          <HelpPersonaCard
            key={persona.id}
            title={persona.title}
            subtitle={persona.subtitle}
            icon={persona.icon}
            onClick={() => onSelectPersona(persona.id)}
          />
        ))}
      </div>
    </div>
  );
}
