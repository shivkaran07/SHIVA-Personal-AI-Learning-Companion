import { Bot, Compass, History, Home, Library, Music2 } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Discover", icon: Compass },
  { to: "/music", label: "Music", icon: Music2 },
  { to: "/library", label: "Library", icon: Library },
  { to: "/ai", label: "Shiva.AI", icon: Bot },
  { to: "/history", label: "History", icon: History },
] as const;
