import { motion } from "framer-motion";
import React from "react";

export const sentenceVariants = {
  hidden: {},
  // change staggerChildren variable to speed up or slow down typing.
  visible: { opacity: 1, transition: { staggerChildren: 0.005 } },
};

export const letterVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { opacity: { duration: 0 } } },
};

interface TypewriterProps {
  text: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text }) => (
  <motion.pre
    key={text}
    variants={sentenceVariants}
    initial="hidden"
    animate="visible"
    className="text-left text-wrap"
  >
    {text.split("").map((char, i) => (
      <motion.span key={`${char}-${i}`} variants={letterVariants}>
        {char}
      </motion.span>
    ))}
  </motion.pre>
);
