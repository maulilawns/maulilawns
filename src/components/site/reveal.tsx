import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Gentle fade + rise when the element enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container for word/child reveals. */
export function Stagger({
  children,
  className,
  stagger = 0.12,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

/** Image mask reveal on scroll — clip-path curtain lifting to unveil the photo. */
export function MaskReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(12% 6% 12% 6% round 8px)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0 0 0 0 round 8px)", opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Section heading with eyebrow, display title, optional italic accent and gold divider. */
export function SectionHeading({
  eyebrow,
  title,
  italic,
  description,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  italic?: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}>{eyebrow}</p>}
      <h2
        className={`heading-display mt-4 text-4xl sm:text-5xl ${light ? "text-ivory" : ""}`}
      >
        {title} {italic && <em className={light ? "text-gold-soft" : "heading-italic"}>{italic}</em>}
      </h2>
      <span className={`gold-divider mt-6 ${align === "center" ? "" : "justify-start"}`}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
          <path d="M6 0l1.6 4.4L12 6l-4.4 1.6L6 12l-1.6-4.4L0 6l4.4-1.6z" />
        </svg>
      </span>
      {description && (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed ${
            align === "center" ? "mx-auto" : ""
          } ${light ? "text-ivory/80" : "text-muted-foreground"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** Decorative botanical branch used in corners and ornaments. */
export function BotanicalBranch({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      aria-hidden
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M6 114C40 96 84 66 118 30c20-22 42-28 96-24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {[
        [26, 104, -38], [48, 88, -32], [72, 70, -28], [96, 50, -24], [120, 32, -18], [146, 18, -12], [172, 10, -8],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 0c10-8 24-8 32 2-10 8-24 8-32-2z" fill="currentColor" opacity="0.75" />
        </g>
      ))}
      <circle cx="128" cy="24" r="2.6" fill="currentColor" />
      <circle cx="160" cy="14" r="2.2" fill="currentColor" />
    </svg>
  );
}
