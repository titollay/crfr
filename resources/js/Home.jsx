import NavBar from "./components/navBar";
import Hero from "./components/Section";
import About from "./Components/About";
import Infrastructure from "./Components/Infrastructure";
import Activities from "./Components/Activities";
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import config from "./config";
import Stats from "./Components/stats";

export default function Home() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0.3, 1], ["0%", "5%"]);

  return (
    <>
      <Helmet>
        <title>{config.BRAND_NAME} | Premium E-Commerce Experience</title>
        <meta name="description" content={`Discover premium products at ${config.BRAND_NAME}. High-quality electronics, fashion, and home essentials with fast delivery.`} />
        <meta property="og:title" content={`${config.BRAND_NAME} | Premium E-Commerce Experience`} />
        <meta property="og:description" content={`Shop the best selection of electronics, clothing, and more at ${config.BRAND_NAME}.`} />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* ===== Hero ===== */}
      <div className="relative z-80 bg-[#fdf2ea] dark:bg-gray-900 transition-colors duration-300">
        <div className="relative z-90">
          <NavBar />
          <Hero />
          
        </div>
      </div>
<Stats />
      <About />
      <Infrastructure />
      <Activities />
        {/* Contact */}
        <div className="relative z-100">
          <Contact />
        </div>

        {/* Footer */}
        <Footer />
      
    </>
  );
}
