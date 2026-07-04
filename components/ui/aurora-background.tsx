"use client";

// Adapted from 21st.dev @aceternity/aurora-background — re-tinted to the
// Satori gold/crimson palette and wired to html[data-theme] tokens.
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
        style={
          {
            "--aurora":
              "repeating-linear-gradient(100deg, rgb(var(--accent-gold)) 10%, rgb(var(--accent-red)) 15%, rgb(var(--accent-gold) / 0.7) 20%, #b78dd8 25%, rgb(var(--accent-gold)) 30%)",
            "--stripes":
              "repeating-linear-gradient(100deg, rgb(var(--bg-primary)) 0%, rgb(var(--bg-primary)) 7%, transparent 10%, transparent 12%, rgb(var(--bg-primary)) 16%)",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "absolute -inset-[10px] animate-aurora opacity-40 blur-[12px] will-change-transform",
            "[background-image:var(--stripes),var(--aurora)] [background-size:300%,200%] [background-position:50%_50%,50%_50%]",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_50%_0%,black_12%,transparent_72%)]"
          )}
        />
      </div>
      {children}
    </div>
  );
};
