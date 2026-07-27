'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { inquiries as inquiriesApi, toppers as toppersApi } from '@/lib/api';
import { Inquiry, Topper } from '@/types';

export default function HomePage() {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [toppersList, setToppersList] = useState<Topper[]>([]);
  const [form, setForm] = useState({
    studentName: '', parentName: '', parentPhone: '',
    section: '9th' as Inquiry['section'], address: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function loadToppers() {
      toppersApi.getAll()
        .then((data) => { if (!cancelled) setToppersList(data); })
        .catch(() => {/* silently ignore — fallback data is fine */});
    }
    loadToppers();
    window.addEventListener('focus', loadToppers);
    const interval = setInterval(loadToppers, 60_000);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', loadToppers);
      clearInterval(interval);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inquiry = await inquiriesApi.submit(form);
    const adminMsg = `🎓 *New Admission Inquiry - New Perfect Tuition Classes*\n\nStudent: ${inquiry.studentName}\nParent: ${inquiry.parentName}\nPhone: ${inquiry.parentPhone}\nSection: ${inquiry.section === 'others' ? 'Primary Section' : inquiry.section + ' Standard'}\nAddress: ${inquiry.address}${inquiry.message ? `\nMessage: ${inquiry.message}` : ''}\n\n_Submitted on ${new Date().toLocaleString('en-IN')}_`;
    const adminPhone = '9925432574';
    window.open(`https://wa.me/91${adminPhone}?text=${encodeURIComponent(adminMsg)}`, '_blank');
    setSubmitted(true);
  }

  function closeModal() {
    setShowInquiryModal(false);
    setSubmitted(false);
    setForm({ studentName: '', parentName: '', parentPhone: '', section: '9th', address: '', message: '' });
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section style={{ padding: '4.5rem 1.5rem 3.5rem', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            
            {/* Logo Emblem */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/logo.png"
                alt="New Perfect Tuition Classes Logo"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  objectFit: 'cover',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', marginBottom: '1.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '0.8125rem', color: '#38bdf8', fontWeight: 600 }}>Admissions Open — 2026 Academic Year</span>
            </div>

            <h1 className="font-display" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>
              New Perfect Tuition Classes
            </h1>
            
            <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '680px', margin: '0 auto 2.25rem', lineHeight: 1.7 }}>
              Guided by <strong>Firoz Sir</strong> (25+ Years Experience) — Premier coaching institute in <strong>Juhapura, Ahmedabad</strong> for 9th Standard, 10th SSC Board Preparation, and Primary Standard classes.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowInquiryModal(true)} className="btn-primary btn-mobile-full" style={{ fontSize: '0.9375rem', padding: '0.75rem 1.75rem' }} id="hero-inquire-btn">
                Enquire for Admission
              </button>
              <a href="#courses" className="btn-ghost btn-mobile-full" style={{ fontSize: '0.9375rem', padding: '0.75rem 1.75rem' }}>
                View Courses & Fees
              </a>
            </div>
          </div>
        </section>

        {/* Key Metrics Bar */}
        <section style={{ backgroundColor: '#111827', borderBottom: '1px solid #1e293b', padding: '2rem 1.5rem' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { number: '500+', label: 'Students Enrolled' },
              { number: '25+', label: 'Years Experience' },
              { number: '100%', label: 'Board Result Success' },
              { number: '3', label: 'Dedicated Batches' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>{stat.number}</div>
                <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Courses Section */}
        <section id="courses" style={{ padding: '4.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.625rem', color: '#f8fafc' }}>
              Offered Courses & Fee Structure
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Structured coaching for 9th, 10th Board, and Primary standards in Juhapura</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                title: '9th Standard Foundation',
                badge: 'Class 9',
                subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
                fee: '₹12,000',
                desc: 'Building fundamental concepts in Mathematics and Science for high school success.',
              },
              {
                title: '10th Board Exam Prep',
                badge: '10th SSC Board',
                highlight: true,
                subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
                fee: '₹15,000',
                desc: 'Intensive SSC Board exam preparation with chapter-wise test series and past papers.',
              },
              {
                title: 'Primary Section (1st–8th)',
                badge: 'Primary',
                subjects: ['Mathematics', 'Science', 'English', 'All Core Subjects'],
                fee: '₹8,000',
                desc: 'Nurturing young learners with structured subject basics and regular homework assistance.',
              },
            ].map((course) => (
              <div
                key={course.title}
                className="card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderColor: course.highlight ? '#0284c7' : undefined,
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="badge badge-blue">{course.badge}</span>
                    {course.highlight && <span className="badge badge-amber">Popular Choice</span>}
                  </div>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.625rem', color: '#f8fafc' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.6 }}>{course.desc}</p>
                  
                  <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {course.subjects.map((subj) => (
                      <div key={subj} style={{ fontSize: '0.84rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#38bdf8' }}>✓</span> {subj}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Annual Fee</div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f8fafc' }}>{course.fee}</div>
                  </div>
                  <button onClick={() => setShowInquiryModal(true)} className="btn-primary" style={{ fontSize: '0.8125rem' }} id={`enroll-${course.title.replace(/\s+/g, '-')}`}>
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section style={{ backgroundColor: '#111827', padding: '4.5rem 1.5rem', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f8fafc' }}>
                Why Parents & Students Choose Us
              </h2>
              <p style={{ color: '#94a3b8' }}>Proven academic methods led by experienced educators in Juhapura</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {[
                { title: 'Personalized Focus', desc: 'Individual attention given to every student to strengthen weak concepts.' },
                { title: '25+ Years Experience', desc: 'Direct guidance from Firoz Sir with over two decades of coaching excellence.' },
                { title: 'Parent Updates', desc: 'Real-time WhatsApp notification updates for attendance and fee receipts.' },
                { title: 'SSC Board Exam Success', desc: 'Consistently high 10th Board result percentages year after year.' },
                { title: 'Comprehensive Notes', desc: 'Curated chapter-wise study materials, revision guides, and practice papers.' },
                { title: 'Dedicated Doubt Sessions', desc: 'Special 1-on-1 doubt clearing before school exams and board tests.' },
              ].map((feature) => (
                <div key={feature.title} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: '0.5rem' }}>{feature.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Last Year's Toppers */}
        <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f8fafc' }}>
              Board Examination Toppers
            </h2>
            <p style={{ color: '#94a3b8' }}>Honoring top academic performance from our students</p>
          </div>

          {toppersList.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Toppers List Updating</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                New board examination results and student profiles will be published here shortly.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {toppersList.map((topper) => (
                <div key={topper.id} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: '0.25rem' }}>{topper.name}</div>
                  <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>{topper.percentage}</div>
                  {topper.subjectScore && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{topper.subjectScore}</div>}
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                    {topper.section === 'others' ? 'Primary Section' : topper.section + ' Standard'} · {topper.year}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Lead Educator Section */}
        <section style={{ padding: '4rem 1.5rem', backgroundColor: '#111827', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div className="badge badge-blue" style={{ marginBottom: '1rem' }}>Head Educator & Founder</div>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#f8fafc' }}>
                Guided by Firoz Sir
              </h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>
                With over <strong>25 years</strong> of dedicated teaching experience in <strong>Juhapura, Ahmedabad</strong>, Firoz Sir has guided hundreds of students to achieve top scores in SSC Board examinations with conceptual clarity in Mathematics, Science, and English.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                <div>✓ 1-on-1 Doubt Resolution Sessions</div>
                <div>✓ Structured SSC Board Exam Test Series</div>
                <div>✓ Regular Parent Performance Updates</div>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>Firoz Sir</div>
              <div style={{ fontSize: '0.8125rem', color: '#38bdf8', marginBottom: '1rem' }}>Director & Lead Educator</div>
              
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, textAlign: 'left', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Address:</strong><br />
                  <a href="https://maps.google.com/?q=3+Samim+Society+Near+Sharifabad+Society+Juhapura+Ahmedabad" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                    3, Samim Society, Near Sharifabad Society, Juhapura, Ahmedabad
                  </a>
                </div>
                <div>
                  <strong>Contact:</strong><br />
                  <a href="tel:9925432574" style={{ color: '#38bdf8', textDecoration: 'none' }}>+91 99254 32574</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '4.5rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f8fafc' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#94a3b8' }}>Key information about admissions, courses, and location</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                q: 'Who is Firoz Sir?',
                a: 'Firoz Sir is the Head Educator and Founder at New Perfect Tuition Classes in Juhapura, Ahmedabad, with over 25 years of teaching experience in 9th, 10th Board, and Primary standards.',
              },
              {
                q: 'Which courses are offered at New Perfect Tuition Classes?',
                a: 'We offer specialized coaching for 9th Standard Foundation, 10th SSC Board Preparation, and Primary Standard classes (1st to 8th) covering Mathematics, Science, English, and Social Studies.',
              },
              {
                q: 'Where are the tuition classes located in Juhapura?',
                a: 'Our institute is located at 3, Samim Society, Near Sharifabad Society, Juhapura, Ahmedabad, Gujarat.',
              },
              {
                q: 'How can parents track attendance and performance?',
                a: 'Parents receive real-time WhatsApp notifications for student attendance and fee receipts, alongside access to our online Student Portal.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.375rem', color: '#f8fafc' }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ backgroundColor: '#111827', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', padding: '4rem 1.5rem', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f8fafc' }}>
            Reserve Your Seat Today
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.75rem', maxWidth: '440px', margin: '0 auto 1.75rem' }}>
            Admissions open for the current academic session. Contact us or submit an inquiry to learn more.
          </p>
          <button onClick={() => setShowInquiryModal(true)} className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }} id="cta-inquire-btn">
            Submit Admission Inquiry
          </button>
        </section>

        {/* Footer */}
        <footer style={{ backgroundColor: '#0f172a', padding: '2.5rem 1.5rem', textAlign: 'center', borderTop: '1px solid #1e293b' }}>
          <div className="font-display" style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            New Perfect Tuition Classes
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem 1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span>3, Samim Society, Near Sharifabad Society, Juhapura, Ahmedabad</span>
            <span>·</span>
            <span>Tel: +91 99254 32574</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            © {new Date().getFullYear()} New Perfect Tuition Classes. All rights reserved.
          </div>
        </footer>
      </main>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            {!submitted ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#f8fafc' }}>Admission Inquiry</h2>
                  <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }} id="inquiry-form">
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Student Name *</label>
                    <input className="input-field" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Full Name" required id="inquiry-student-name" />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Parent Name *</label>
                      <input className="input-field" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Parent / Guardian" required id="inquiry-parent-name" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>WhatsApp Number *</label>
                      <input className="input-field" type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="10-digit mobile" required id="inquiry-phone" />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Interested Section *</label>
                    <select className="input-field" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value as Inquiry['section'] })} id="inquiry-section">
                      <option value="9th">9th Standard</option>
                      <option value="10th">10th Standard</option>
                      <option value="others">Primary Section (1st–8th)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Address / Area</label>
                    <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Locality in Juhapura" id="inquiry-address" />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem', fontWeight: 500 }}>Message (optional)</label>
                    <textarea className="input-field" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Any specific requirements..." rows={3} style={{ resize: 'vertical' }} id="inquiry-message" />
                  </div>

                  <button type="submit" className="btn-whatsapp" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.375rem' }} id="submit-inquiry-btn">
                    Submit via WhatsApp
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f8fafc' }}>Inquiry Submitted</h3>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.875rem' }}>We will contact you on WhatsApp shortly regarding your admission.</p>
                <button onClick={closeModal} className="btn-primary" id="close-success-modal">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating WhatsApp Quick Action */}
      <a
        href="https://wa.me/919925432574?text=Hello%20Firoz%20Sir!%20I%20want%20to%20inquire%20about%20New%20Perfect%20Tuition%20Classes."
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 99,
          backgroundColor: '#16a34a',
          color: '#ffffff',
          borderRadius: '50px',
          padding: '0.625rem 1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          fontSize: '0.8125rem',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        }}
        id="floating-whatsapp-btn"
      >
        <span>Chat on WhatsApp</span>
      </a>
    </>
  );
}
