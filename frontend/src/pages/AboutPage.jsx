import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Route, RefreshCw, BarChart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>CareerPath</div>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <header style={{ backgroundColor: '#2563eb', color: '#fff', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 16px 0' }}>How CareerPath Works</h1>
        <p style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>
          An intelligent platform designed to help you navigate, monitor, and recover your career trajectory.
        </p>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '64px 24px' }}>
        
        {/* Section 1 */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen color="#2563eb" /> Platform Purpose
          </h2>
          <p style={{ fontSize: '18px', color: '#4b5563', lineHeight: '1.6' }}>
            CareerPath solves the problem of uncertain career transitions. It analyzes your existing skill set, compares it against market demands for your target role, and provides a dynamic, step-by-step roadmap. If your chosen path becomes unfeasible due to time constraints, our engine helps you pivot smoothly.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Route color="#2563eb" /> The Career Journey
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              { num: '1', title: 'Profile & Skills', desc: 'Input your current proficiencies.' },
              { num: '2', title: 'Career Goal', desc: 'Select your target profession.' },
              { num: '3', title: 'Gap Analysis', desc: 'Discover what you need to learn.' },
              { num: '4', title: 'Dynamic Roadmap', desc: 'Follow your custom learning path.' },
              { num: '5', title: 'Monitoring', desc: 'Track feasibility over time.' },
              { num: '6', title: 'Recovery Engine', desc: 'Pivot if things go off track.' }
            ].map((step, i) => (
              <div key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '16px' }}>{step.num}</div>
                <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>{step.title}</h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RefreshCw color="#2563eb" /> The Career Recovery Engine
          </h2>
          <p style={{ fontSize: '18px', color: '#4b5563', lineHeight: '1.6', marginBottom: '24px' }}>
            When a career becomes unfeasible, our intelligent engine computes the optimal alternative paths using mathematical models based on your existing skills.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '24px', borderRadius: '8px', fontFamily: 'monospace' }}>
              <div style={{ color: '#94a3b8', marginBottom: '8px' }}>// Skill Reuse Score Formula</div>
              <div style={{ fontSize: '16px' }}>
                Reuse_Score = ( Σ(Transferable_Skills_Level) / Σ(Target_Career_Required_Skills) ) * 100
              </div>
            </div>
            
            <div style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '24px', borderRadius: '8px', fontFamily: 'monospace' }}>
              <div style={{ color: '#94a3b8', marginBottom: '8px' }}>// Recovery Score Formula</div>
              <div style={{ fontSize: '16px' }}>
                Recovery_Score = (W1 * Reuse_Score) + (W2 * Feasibility_Factor) + (W3 * Market_Demand)
              </div>
              <div style={{ marginTop: '12px', color: '#94a3b8', fontSize: '14px' }}>
                * Where W1, W2, W3 are dynamic weights prioritizing skill retention.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 style={{ fontSize: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart color="#2563eb" /> FAQ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'How is feasibility calculated?', a: 'It is based on your target deadline, available learning hours per week, and the estimated time to acquire the missing skills in the gap analysis.' },
              { q: 'Can I change my learning hours?', a: 'Yes, in the Career Monitoring page, you can update your constraints and recalculate feasibility instantly.' },
              { q: 'What happens if my path is Not Feasible?', a: 'We highly recommend running the Career Recovery Analysis to find alternative careers that require less time.' },
              { q: 'How does it know my skills?', a: 'You enter your baseline skills during onboarding, and update them as you complete items on your roadmap.' },
              { q: 'Are the recommendations realistic?', a: 'Yes, recommendations are sorted by Recovery Score, which heavily factors in the realistic transfer of your existing skills.' }
            ].map((faq, i) => (
              <div key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#111827' }}>{faq.q}</h3>
                <p style={{ color: '#4b5563', margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: '#9ca3af', padding: '32px', textAlign: 'center' }}>
        <p>&copy; 2026 CareerPath. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutPage;
