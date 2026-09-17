import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { createContext, useContext, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

export const MotionPreferenceContext = createContext(false);
export const MotionPreferenceProvider: React.FC<{ disabled: boolean; children: ReactNode }> = ({ disabled, children }) => (
  <MotionPreferenceContext.Provider value={disabled}>
    <div className="motion-preference-root" data-motion-disabled={disabled ? "true" : "false"}>{children}</div>
  </MotionPreferenceContext.Provider>
);
export const useMotionDisabled = () => useReducedMotion() || useContext(MotionPreferenceContext);

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
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
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
};

export const MotionList: React.FC<
  React.ComponentProps<typeof motion.div> & { inView?: boolean }
> = ({ children, inView, ...props }) => {
  const reduceMotion = useMotionDisabled();
  return (
    <motion.div
      {...props}
      initial={reduceMotion ? false : "hidden"}
      animate={inView ? undefined : "visible"}
      whileInView={inView ? "visible" : undefined}
      viewport={inView ? { once: true, amount: 0.25 } : undefined}
      variants={reduceMotion ? undefined : staggerVariants}
    >
      {children}
    </motion.div>
  );
};

export const MotionItem: React.FC<React.ComponentProps<typeof motion.div>> = ({
  children,
  ...props
}) => {
  const reduceMotion = useMotionDisabled();
  return (
    <motion.div
      {...props}
      variants={reduceMotion ? undefined : itemVariants}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const MotionPresence: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <AnimatePresence mode="wait" initial={false}>
    {children}
  </AnimatePresence>
);

export const MotionButton: React.FC<React.ComponentProps<typeof motion.button>> = ({
  children,
  ...props
}) => {
  const reduceMotion = useMotionDisabled();
  return (
    <motion.button
      {...props}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.button>
  );
};

export const MotionBar: React.FC<{
  value: number;
  className?: string;
  style?: CSSProperties;
}> = ({ value, className, style }) => {
  const reduceMotion = useMotionDisabled();
  if (reduceMotion) {
    return (
      <span className={className} style={{ ...style, transform: `scaleX(${value})` }} />
    );
  }
  return (
    <motion.span
      className={className}
      style={{ ...style, transformOrigin: "left center" }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: value }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    />
  );
};

export const MotionNumber: React.FC<{
  value: number;
  decimals?: number;
  suffix?: string;
}> = ({ value, decimals = 0, suffix = "" }) => {
  const reduceMotion = useMotionDisabled();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const motionValue = useMotionValue(0);
  const text = useTransform(motionValue, (current) => current.toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, motionValue, reduceMotion, value]);

  if (reduceMotion) {
    return (
      <span ref={ref}>
        {value.toFixed(decimals)}
        {suffix}
      </span>
    );
  }
  return (
    <span ref={ref}>
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  );
};

export const MotionKeyFade: React.FC<{
  fadeKey: string | number;
  className?: string;
  children: ReactNode;
}> = ({ fadeKey, className, children }) => {
  const reduceMotion = useMotionDisabled();
  if (reduceMotion) {
    return (
      <div key={fadeKey} className={className}>
        {children}
      </div>
    );
  }
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={fadeKey}
        className={className}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
