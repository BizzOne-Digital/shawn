"use client";

import {
  motion,
  type HTMLMotionProps,
  type Variants,
  useReducedMotion,
} from "framer-motion";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function getTransition(reduced: boolean, duration = 0.5) {
  return reduced ? { duration: 0 } : { duration, ease: "easeOut" as const };
}

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: MotionWrapperProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeIn}
      transition={{ ...getTransition(reduced), delay: reduced ? 0 : delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUp({
  children,
  className,
  delay = 0,
  ...props
}: MotionWrapperProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ ...getTransition(reduced), delay: reduced ? 0 : delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  ...props
}: MotionWrapperProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={scaleIn}
      transition={{ ...getTransition(reduced, 0.4), delay: reduced ? 0 : delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  ...props
}: MotionWrapperProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={reduced ? fadeIn : staggerContainer}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: MotionWrapperProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      variants={reduced ? fadeIn : staggerItem}
      transition={getTransition(reduced, 0.4)}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  scale?: number;
}

export function HoverScale({
  children,
  className,
  scale = 1.02,
  ...props
}: HoverScaleProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      whileHover={reduced ? undefined : { scale, y: -2 }}
      transition={getTransition(reduced, 0.2)}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { motion, useReducedMotion };
