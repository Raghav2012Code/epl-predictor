import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

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
  React.ComponentProps<typeof motion.section>
> = ({ children, ...props }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      {...props}
      initial={reduceMotion ? false : "initial"}
      animate="animate"
      variants={reduceMotion ? undefined : pageVariants}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
};

export const MotionList: React.FC<React.ComponentProps<typeof motion.div>> = ({
  children,
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      {...props}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
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
  const reduceMotion = useReducedMotion();
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
