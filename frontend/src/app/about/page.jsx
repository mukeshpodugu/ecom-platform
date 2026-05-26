'use client';

import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Heart, Sparkles, Terminal, Cpu, Database, Wallet } from 'lucide-react';

export default function AboutPage() {
  const stackItems = [
    { icon: <Terminal size={22} />, title: 'Next.js & React', desc: 'Modern server-rendered client component framework for ultra-fast load times and SEO optimization.' },
    { icon: <Cpu size={22} />, title: 'Node.js & Express', desc: 'Secure backend API orchestrator with role-based access, JWT auth, and rate limiting protections.' },
    { icon: <Database size={22} />, title: 'MongoDB & Adapter', desc: 'Hybrid data adapter system supporting native MongoDB as well as offline local JSON data engines.' },
    { icon: <Wallet size={22} />, title: 'Stripe & Sandbox', desc: 'Integrated checkout flows with mock and secure payment configurations for orders.' }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px', maxWidth: '900px' }}>
      
      {/* Hero Banner */}
      <section style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, hsl(222, 47%, 10%), hsl(263, 40%, 15%))',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '60px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(var(--accent-secondary), 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'hsl(var(--accent-secondary))',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px'
          }}>
            <Sparkles size={12} /> Innovation In E-Commerce
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
            Next-Gen Tech Marketplace
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
            Horizon Mall (Apex) is a high-fidelity, full-stack demonstration platform designed to showcase production-level features, interactive visuals, and AI-driven components.
          </p>
        </div>
      </section>

      {/* Corporate Values */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>
          Key Features & Core Pillars
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {[
            { icon: <Award size={20} style={{ color: 'hsl(var(--accent-primary))' }} />, title: 'Seller Panel Dashboard', desc: 'Allows vendors to list products, inspect sales charts, upload gallery images, and manage real-time inventory levels.' },
            { icon: <ShieldCheck size={20} style={{ color: 'hsl(var(--accent-success))' }} />, title: 'Secure Invoice Stream', desc: 'Automated server-side PDF generator (via PDFKit) to output secure customer invoices, downloadable straight from order tracks.' },
            { icon: <Heart size={20} style={{ color: 'hsl(var(--accent-danger))' }} />, title: 'AI Personalized Feeds', desc: 'Recommendation engine scoring items by category preferences gathered from the buyer’s wishlist or historical orders.' }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'hsl(var(--bg-tertiary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Details */}
      <section className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '32px' }}>
          Developer Architecture & Technology Stack
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {stackItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'hsla(var(--accent-primary), 0.1)',
                color: 'hsl(var(--accent-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Profile Card */}
      <section className="glass-panel" style={{ 
        padding: '30px', 
        borderRadius: 'var(--radius-lg)', 
        marginTop: '40px', 
        display: 'flex', 
        gap: '20px', 
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: 'hsla(var(--accent-primary), 0.15)',
          border: '1px solid hsla(var(--accent-primary), 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--accent-primary))',
          fontSize: '20px',
          fontWeight: 800
        }}>
          PM
        </div>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lead Developer</h3>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--text-primary))', margin: '4px 0' }}>PODUGU MUKESH</p>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <span><strong>Email:</strong> <a href="mailto:mukeshpodugu123@gmail.com" style={{ color: 'hsl(var(--accent-primary))', textDecoration: 'none' }}>mukeshpodugu123@gmail.com</a></span>
            <span><strong>Tel:</strong> +91 8143999463</span>
            <span><strong>Location:</strong> Srikakulam, India</span>
          </p>
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <Link href="/products" className="btn btn-primary" style={{ padding: '12px 30px' }}>
          Start Shopping
        </Link>
      </div>

    </div>
  );
}
