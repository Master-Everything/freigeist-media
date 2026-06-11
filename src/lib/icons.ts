import {
  Target, Landmark, Building2, Leaf, Shirt, Heart, Ship, Plane,
  Car, Cog, Zap, Truck, BookOpen, Tv, Newspaper, Tablet,
  Printer, FlaskConical, Recycle, Shield, Home, type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Target, Landmark, Building2, Leaf, Shirt, Heart, Ship, Plane,
  Car, Cog, Zap, Truck, BookOpen, Tv, Newspaper, Tablet,
  Printer, FlaskConical, Recycle, Shield, Home,
};

export function getIconByName(name: string): LucideIcon {
  return iconMap[name] || Target;
}
