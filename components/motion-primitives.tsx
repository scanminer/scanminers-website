"use client";

import { PropsWithChildren } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";

type BaseProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

function useFadeUp(delay = 0): Variants {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  }
  return {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut", delay } },
  };
}

const container: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

export function MSection({ className, children }: BaseProps) {
  return (
    <motion.section
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.section>
  );
}

export function MDIV({ className, children, delay = 0 }: BaseProps) {
  const variants = useFadeUp(delay);
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

export function MH1({ className, children, delay = 0 }: BaseProps) {
  const variants = useFadeUp(delay);
  return (
    <motion.h1 className={className} variants={variants}>
      {children}
    </motion.h1>
  );
}

export function MP({ className, children, delay = 0 }: BaseProps) {
  const variants = useFadeUp(delay);
  return (
    <motion.p className={className} variants={variants}>
      {children}
    </motion.p>
  );
}

export function MList({ className, children, delay = 0 }: BaseProps) {
  const variants = useFadeUp(delay);
  return (
    <motion.ul className={className} variants={variants}>
      {children}
    </motion.ul>
  );
}

export function MButton({ className, children, delay = 0 }: BaseProps) {
  const variants = useFadeUp(delay);
  return (
    <motion.a className={className} variants={variants} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      {children}
    </motion.a>
  );
}
