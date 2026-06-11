import { ReactNode } from "react";

const AnimatedPage = ({ children }: { children: ReactNode }) => {
  return (
    <div className="animate-[fade-in_200ms_ease-in-out]">
      {children}
    </div>
  );
};

export default AnimatedPage;
