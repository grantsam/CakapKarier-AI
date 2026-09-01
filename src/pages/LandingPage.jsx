import Navbar from '../components/Navbar';
import Hero from '../components/landing/Hero';
import InsightSection from '../components/landing/InsightSection';
import AboutSection from '../components/landing/AboutSection';
import WorkflowSection from '../components/landing/WorkflowSection';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main>
        <section id="hero">
          <Hero />
        </section>

        <section id="insight">
          <InsightSection />
        </section>

        <section id="about">
          <AboutSection />
        </section>

        <section id="workflow">
          <WorkflowSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;