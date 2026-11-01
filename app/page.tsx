import styles from "./Home.module.css";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import AudienceSplit from "./components/AudienceSplit";
import TrustSafety from "./components/TrustSafety";
import EarlyAccess from "./components/EarlyAccess";

export default function Home() {
  return (
    <div className={styles.home}>
  <Hero />
  <HowItWorks />
  <AudienceSplit />
  <TrustSafety />
  <EarlyAccess />
</div>
  );
}

