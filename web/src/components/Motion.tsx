import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export const MotionPreferenceContext = createContext(false);

/** The one spring for sliding indicators: quick, no visible overshoot. */
export const SPRING = { type: "spring", stiffness: 520, damping: 42, mass: 0.9 } as const;

/** A shared-layout indicator that glides between whichever item renders it. */
export const ActiveIndicator: React.FC<{ id: string; className: string }> = ({ id, className }) => (
  <motion.span layoutId={id} className={className} aria-hidden="true" />
);

/** Crossfade for content that swaps in place (fixture detail, club profile). */
export const SwapFade: React.FC<{ swapKey: string | number; className?: string; children: ReactNode }> = ({
  swapKey,
  className,
  children,
}) => {
  const reduceMotion = useMotionDisabled();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      key={swapKey}
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
export const MotionPreferenceProvider: React.FC<{ disabled: boolean; children: ReactNode }> = ({ disabled, children }) => (
  <MotionPreferenceContext.Provider value={disabled}>
    <MotionConfig reducedMotion={disabled ? "always" : "user"} transition={SPRING}>
      <div className="motion-preference-root" data-motion-disabled={disabled ? "true" : "false"}>{children}</div>
    </MotionConfig>
  </MotionPreferenceContext.Provider>
);
export const useMotionDisabled = () => useReducedMotion() || useContext(MotionPreferenceContext);

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export const MotionSection: React.FC<
  React.ComponentProps<typeof motion.section> & { inView?: boolean }
> = ({ children, inView, ...props }) => {
  const reduceMotion = useMotionDisabled();
  return (
    <motion.section
      {...props}
      initial={reduceMotion ? false : "initial"}
      animate={inView ? undefined : "animate"}
      whileInView={inView ? "animate" : undefined}
      viewport={inView ? { once: true, amount: 0.25 } : undefined}
      exit={reduceMotion ? undefined : "exit"}
      variants={reduceMotion ? undefined : pageVariants}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
};

export const MotionPresence: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <AnimatePresence mode="wait" initial={false}>
    {children}
  </AnimatePresence>
);

export const MotionPop: React.FC<{
  popKey: string;
  className?: string;
  role?: string;
  children: ReactNode;
}> = ({ popKey, className, role, children }) => {
  const reduceMotion = useMotionDisabled();
  if (reduceMotion) {
    return (
      <div key={popKey} className={className} role={role}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      key={popKey}
      className={className}
      role={role}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const RouteFade: React.FC<{ routeKey: string; children: ReactNode }> = ({
  routeKey,
  children,
}) => {
  const reduceMotion = useMotionDisabled();
  if (reduceMotion) {
    return <div key={routeKey}>{children}</div>;
  }
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
