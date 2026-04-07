import NavBar from "./components/navBar";
import Hero from "./components/Section";
import About from "./Components/About";
import Infrastructure from "./Components/Infrastructure";
import Activities from "./Components/Activities";
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";

import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import Stats from "./Components/stats";

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta property="og:title" content={t("meta.title")} />
        <meta property="og:description" content={t("meta.description")} />
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
