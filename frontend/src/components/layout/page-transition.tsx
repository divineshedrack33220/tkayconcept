"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState("enter");

  useEffect(() => {
    if (children !== displayChildren) {
      setTransitionStage("exit");
    }
  }, [children, displayChildren, pathname]);

  useEffect(() => {
    if (transitionStage === "exit") {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage("enter");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, children]);

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        transitionStage === "enter"
          ? "opacity-100 translate-y-0"
          : "opacity-80 translate-y-1"
      }`}
    >
      {displayChildren}
    </div>
  );
}
