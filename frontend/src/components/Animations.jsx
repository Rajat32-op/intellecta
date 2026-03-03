// components/FadeInView.jsx
import { motion } from "framer-motion";
import { div } from "framer-motion/client";
import { useEffect ,useState} from "react";
import { useInView } from "react-intersection-observer";

export const FadeInView = ({
  children,
  delay = 0,
  duration = 0.8,
  yOffset = 40,
  className = "",
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleAndBlur = ({
  children,
  delay = 0,
  duration = 0.8,
  blur = true,
  className = "",
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, filter: blur ? "blur(4px)" : "none" }}
      animate={
        inView
          ? { opacity: 1, scale: 1, filter: "blur(0px)" }
          : { opacity: 0 }
      }
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );

};

export const ZoominIcon=(({children})=>{
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);
  if(isLoading){

    return (
      <div className="flex justify-center items-center bg-gradient-to-b from-[#0b1e1e] via-[#043f43] to-[#041b1b] min-h-screen">
      <motion.img
      src="/icon.png"
      alt="logo"
      className="h-1/3 w-1/3"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 2, delay: 0.2 }}
      whileHover={{ scale: 1.1 }}
      />
      </div>
    );
  }
  return children
})