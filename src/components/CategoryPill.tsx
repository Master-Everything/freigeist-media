interface CategoryPillProps {
  name?: string;
  color?: string;
  size?: "sm" | "md";
  variant?: "default" | "light";
}

const CategoryPill = ({ name, color, size = "md", variant = "default" }: CategoryPillProps) => {
  if (!name || !color) return null;

  const sizeClasses = size === "sm"
    ? "text-[0.65rem] px-2 py-0.5 gap-1"
    : "text-[0.72rem] px-3 py-1 gap-1.5";

  const isLight = variant === "light";

  return (
    <span
      className={`inline-flex items-center font-ui font-semibold uppercase rounded-full ${sizeClasses}`}
      style={{
        backgroundColor: isLight ? "rgba(255,255,255,0.15)" : `${color}15`,
        color: isLight ? "#fff" : color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: isLight ? "#fff" : color }}
      />
      {name}
    </span>
  );
};

export default CategoryPill;
