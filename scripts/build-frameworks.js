#!/usr/bin/env node
/*
 * build-frameworks.js
 * -------------------------------------------------------------
 * Ingests your existing *_curriculum.html files and regenerates the
 * framework content registry used by the app, with ZERO manual copying.
 *
 * It reads each source file, extracts the `const days = [ ... ]` lesson
 * array verbatim, attaches the catalog metadata below, and writes a single
 * file: js/frameworks.generated.js  (defines window.FRAMEWORKS).
 *
 * USAGE:
 *   node scripts/build-frameworks.js "C:/path/to/GRC/Frameworks"
 *
 *   - The argument is the ROOT folder that contains your framework subfolders
 *     (e.g. ISO/ISO27001/iso27001_30day_curriculum.html).
 *   - If omitted, it defaults to the SOURCE_ROOT constant below.
 *
 * After running, open index.html — it will load the full curricula.
 * (index.html already includes:  <script src="js/frameworks.generated.js"></script>
 *  when present; otherwise it falls back to the inline preview data.)
 * -------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');

// ---- EDIT THIS if you don't pass the path as an argument ----
let SOURCE_ROOT = process.argv[2] ||
  'G:/My Drive/CyberSecurity Studies/GRC/Frameworks';

// ---- Catalog: id, display metadata, and the source file (relative to SOURCE_ROOT) ----
const MANIFEST = [
  { id:'iso27001',   name:'ISO/IEC 27001', subtitle:'Information Security Management Systems', category:'ISO/IEC Standards', color:'#0f6e56', lessonsTotal:30,
    file:'ISO/ISO27001/iso27001_30day_curriculum.html', desc:'The global gold standard for building a certifiable Information Security Management System (ISMS).' },
  { id:'iso27002',   name:'ISO/IEC 27002', subtitle:'Information Security Controls — Code of Practice', category:'ISO/IEC Standards', color:'#0f6e56', lessonsTotal:30,
    file:'ISO/ISO27002/iso27002_30day_curriculum.html', desc:'The implementation companion to ISO 27001 — detailed guidance for the 93 Annex A security controls.' },
  { id:'iso27017',   name:'ISO/IEC 27017', subtitle:'Cloud Security Controls', category:'ISO/IEC Standards', color:'#0f6e56', lessonsTotal:30,
    file:'ISO/ISO27017/iso27017_30day_curriculum.html', desc:'Cloud-specific security guidance extending ISO 27002 for cloud customers and providers.' },
  { id:'iso27018',   name:'ISO/IEC 27018', subtitle:'Protection of PII in Public Clouds', category:'ISO/IEC Standards', color:'#0f6e56', lessonsTotal:30,
    file:'ISO/ISO27018/iso27018_30day_curriculum.html', desc:'Privacy controls for protecting personal data (PII) processed in public cloud services.' },
  { id:'iso27701',   name:'ISO/IEC 27701', subtitle:'Privacy Information Management (PIMS)', category:'ISO/IEC Standards', color:'#0f6e56', lessonsTotal:30,
    file:'ISO/ISO27701/iso27701_30day_curriculum.html', desc:'Extends ISO 27001/27002 into a certifiable Privacy Information Management System.' },
  { id:'iso42001',   name:'ISO/IEC 42001', subtitle:'AI Management Systems', category:'ISO/IEC Standards', color:'#0f6e56', lessonsTotal:30,
    file:'ISO/ISO42001/iso42001_30day_curriculum.html', desc:"The world's first certifiable management system standard for responsible Artificial Intelligence." },
  { id:'iso42005',   name:'ISO/IEC 42005', subtitle:'AI System Impact Assessment', category:'ISO/IEC Standards', color:'#0f6e56', lessonsTotal:30,
    file:'ISO/ISO42005/iso42005_30day_curriculum.html', desc:'Guidance for conducting AI system impact assessments — a core tool for AI governance.' },

  { id:'nist-csf',   name:'NIST CSF 2.0', subtitle:'Cybersecurity Framework 2.0', category:'NIST Frameworks', color:'#1f3a4d', lessonsTotal:30,
    file:'NIST/NIST Cybersecurity Framework (CSF) 2.0/nist_csf20_30day_curriculum.html', desc:'The most widely adopted voluntary cybersecurity framework — now with Govern at its core.' },
  { id:'nist-rmf',   name:'NIST RMF', subtitle:'Risk Management Framework (SP 800-37)', category:'NIST Frameworks', color:'#1f3a4d', lessonsTotal:30,
    file:'NIST/NIST Risk Management Framework/nist_rmf_30day_curriculum.html', desc:'The seven-step process U.S. federal systems use to authorize and continuously monitor security.' },
  { id:'nist-ai-rmf',name:'NIST AI RMF', subtitle:'AI Risk Management Framework', category:'NIST Frameworks', color:'#1f3a4d', lessonsTotal:30,
    file:'NIST/NIST AI Risk Management Framework/nist_ai_rmf_30day_curriculum.html', desc:'A voluntary framework for managing the risks of AI systems across their lifecycle.' },
  { id:'nist-800-30',name:'NIST SP 800-30', subtitle:'Conducting Risk Assessments', category:'NIST Frameworks', color:'#1f3a4d', lessonsTotal:20,
    file:'NIST/NIST SP 800-30 Conducting Risk Assessments/nist_sp800_30_curriculum.html', desc:'The definitive U.S. guide to conducting structured information security risk assessments.' },

  { id:'fedramp',    name:'FedRAMP', subtitle:'Federal Risk and Authorization Management Program', category:'US Government & Defense', color:'#7a3e9d', lessonsTotal:30,
    file:'FedRAMP/fedramp_30day_curriculum.html', desc:"The U.S. government's standardized security authorization program for cloud services." },
  { id:'fisma',      name:'FISMA', subtitle:'Federal Information Security Modernization Act', category:'US Government & Defense', color:'#7a3e9d', lessonsTotal:30,
    file:'FISMA/fisma_30day_curriculum.html', desc:'The U.S. law requiring federal agencies to secure their information systems.' },
  { id:'cmmc',       name:'CMMC', subtitle:'Cybersecurity Maturity Model Certification', category:'US Government & Defense', color:'#7a3e9d', lessonsTotal:30,
    file:'CMMC/cmmc_30day_curriculum.html', desc:"The Department of Defense's tiered certification for protecting controlled unclassified information." },

  { id:'gdpr',       name:'GDPR', subtitle:'General Data Protection Regulation', category:'Privacy & Industry Regulations', color:'#b0512a', lessonsTotal:30,
    file:'GDPR/gdpr_30day_curriculum.html', desc:"The EU's landmark privacy law governing personal data — with global reach and serious penalties." },
  { id:'hipaa',      name:'HIPAA', subtitle:'Health Insurance Portability and Accountability Act', category:'Privacy & Industry Regulations', color:'#b0512a', lessonsTotal:30,
    file:'HIPAA/hipaa_30day_curriculum.html', desc:'The U.S. law protecting the privacy and security of health information.' },
  { id:'pci-dss',    name:'PCI DSS', subtitle:'Payment Card Industry Data Security Standard', category:'Privacy & Industry Regulations', color:'#b0512a', lessonsTotal:30,
    file:'PCI DSS/pci_dss_30day_curriculum.html', desc:'The mandatory security standard for any organization that handles payment card data.' },
  { id:'soc2',       name:'SOC 2', subtitle:'Service Organization Control 2', category:'Privacy & Industry Regulations', color:'#b0512a', lessonsTotal:30,
    file:'SOC2/soc2_30day_curriculum.html', desc:'The leading U.S. attestation report demonstrating security controls to customers.' },
  { id:'hitrust',    name:'HITRUST CSF', subtitle:'Common Security Framework', category:'Privacy & Industry Regulations', color:'#b0512a', lessonsTotal:30,
    file:'HITRUST/hitrust_30day_curriculum.html', desc:'A certifiable framework that harmonizes HIPAA, ISO, NIST, and PCI into one assessment.' },

  { id:'eu-ai-act',  name:'EU AI Act', subtitle:'European Union Artificial Intelligence Act', category:'AI Governance & Emerging', color:'#0c6b80', lessonsTotal:30,
    file:'EU AI/eu_ai_act_30day_curriculum.html', desc:"The world's first comprehensive AI law, using a risk-based approach to regulate AI systems." },
  { id:'owasp-llm',  name:'OWASP Top 10 for LLMs', subtitle:'Large Language Model Application Risks', category:'AI Governance & Emerging', color:'#0c6b80', lessonsTotal:20,
    file:'OWASP/Top 10 LLM/owasp_llm_top10_curriculum.html', desc:'The leading catalog of the most critical security risks in LLM and generative-AI applications.' },
  { id:'singapore-maigf', name:'Singapore Model AI Gov.', subtitle:'Model AI Governance Framework', category:'AI Governance & Emerging', color:'#0c6b80', lessonsTotal:20,
    file:'Singapore Governance Framework/singapore_maigf_curriculum.html', desc:"Singapore's influential, practical, voluntary framework for deploying AI responsibly." },

  { id:'cobit',      name:'COBIT', subtitle:'Control Objectives for Information Technologies', category:'Governance & Controls', color:'#6b6b3a', lessonsTotal:30,
    file:'COBIT/cobit_30day_curriculum.html', desc:"ISACA's framework for the governance and management of enterprise IT." },
  { id:'cis-18',     name:'CIS Controls v8', subtitle:'18 Critical Security Controls', category:'Governance & Controls', color:'#6b6b3a', lessonsTotal:30,
    file:'CIS-18/cis18_30day_curriculum.html', desc:'A prioritized, prescriptive set of 18 defensive actions to stop the most common attacks.' },
];

/* Extract the `const days = [ ... ]` array literal text from a source file,
   using bracket matching that ignores brackets inside strings / template literals. */
function extractDaysArray(src){
  const m = src.match(/const\s+days\s*=\s*\[/);
  if(!m) return null;
  let i = m.index + m[0].length - 1;     // position of the opening '['
  let depth = 0, str = null, esc = false, out = '';
  for(; i < src.length; i++){
    const ch = src[i];
    out += ch;
    if(str){
      if(esc){ esc = false; continue; }
      if(ch === '\\'){ esc = true; continue; }
      if(ch === str){ str = null; }
      continue;
    }
    if(ch === '"' || ch === "'" || ch === '`'){ str = ch; continue; }
    if(ch === '['){ depth++; }
    else if(ch === ']'){ depth--; if(depth === 0){ break; } }
  }
  return out; // includes the surrounding [ ... ]
}

function main(){
  SOURCE_ROOT = SOURCE_ROOT.replace(/\\/g,'/');
  console.log('Source root:', SOURCE_ROOT, '\n');
  const out = [];
  let ok = 0, miss = 0;

  for(const fw of MANIFEST){
    const full = path.join(SOURCE_ROOT, fw.file);
    let daysText = null;
    try{
      const src = fs.readFileSync(full, 'utf8');
      daysText = extractDaysArray(src);
      if(!daysText){ console.warn('  ⚠  no days[] found in', fw.file); }
    }catch(e){
      console.warn('  ✗  missing:', fw.file);
    }
    const meta = { id:fw.id, name:fw.name, subtitle:fw.subtitle, category:fw.category,
                   color:fw.color, lessonsTotal:fw.lessonsTotal, source:fw.file, desc:fw.desc };
    if(daysText){ ok++; out.push('  Object.assign('+JSON.stringify(meta)+', { days: '+daysText+' })'); }
    else {
      miss++;
      // keep a minimal placeholder so the catalog still renders
      out.push('  Object.assign('+JSON.stringify(meta)+', { days: [{title:"Coming soon",tagline:"Source file not found during build",body:"<p>Place '+fw.file+' under the source root and re-run the build.</p>",_partial:true}] })');
    }
  }

  const banner = '/* AUTO-GENERATED by scripts/build-frameworks.js — do not edit by hand. */\n';
  const body = 'window.FRAMEWORKS = [\n' + out.join(',\n') + '\n];\n';
  const dest = path.join(__dirname, '..', 'js', 'frameworks.generated.js');
  fs.mkdirSync(path.dirname(dest), { recursive:true });
  fs.writeFileSync(dest, banner + body, 'utf8');

  console.log('\nWrote', dest);
  console.log('Imported', ok, 'frameworks,', miss, 'missing/placeholder.');
  console.log('\nNext: ensure index.html includes  <script src="js/frameworks.generated.js"></script>  before the app script,');
  console.log('then open index.html. (See README.md → "Loading full curricula".)');
}
main();
