import { useState } from 'react';

const EMAIL = 'kvaleria@stanford.edu';

function CaptchaModal({ onClose, onPass }) {
  const [a, setB]     = useState(() => Math.ceil(Math.random() * 9));
  const [b, setA]     = useState(() => Math.ceil(Math.random() * 9));
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');

  const check = () => {
    if (parseInt(val, 10) === a + b) { onPass(); }
    else { setErr('Incorrect — try again'); setVal(''); }
  };

  return (
    <div className="captcha-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="captcha-box">
        <div className="captcha-title">// verify you are human</div>
        <div className="captcha-question">What is {a} + {b}?</div>
        <input
          className="captcha-input"
          type="number"
          autoFocus
          value={val}
          onChange={(e) => { setVal(e.target.value); setErr(''); }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder="answer"
        />
        {err && <div className="captcha-error">{err}</div>}
        <div className="captcha-actions">
          <button className="btn-ghost" onClick={onClose}>CANCEL</button>
          <button className="btn-primary" onClick={check} disabled={!val.trim()}>CONFIRM</button>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleContactClick = (e) => {
    e.preventDefault();
    setShowCaptcha(true);
  };

  const handlePass = () => {
    setShowCaptcha(false);
    window.location.href = `mailto:${EMAIL}`;
  };

  return (
    <div className="page">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        <div className="about-block">
          <div className="about-label">// about</div>
          <div className="about-title">Try<span style={{ color: 'var(--sage-d)' }}>&#123;pl&#125;</span> — unified IIIF workspace</div>
          <div className="about-text">
            Built to remove the context-switching that digital collections teams face.
            Validating manifests and previewing them are typically separate tasks —
            Try&#123;pl&#125; combines them into one spreadsheet-driven workflow.
          </div>
        </div>

        <div className="about-block">
          <div className="about-label">// built on</div>
          <table className="about-table">
            <tbody>
              <tr><td className="at-key">IIIF Presentation Validator</td><td><a href="https://presentation-validator.iiif.io" target="_blank" rel="noreferrer">presentation-validator.iiif.io</a></td></tr>
              <tr><td className="at-key">Mirador Viewer</td><td><a href="https://projectmirador.org" target="_blank" rel="noreferrer">projectmirador.org</a></td></tr>
              <tr><td className="at-key">IIIF Community</td><td><a href="https://iiif.io" target="_blank" rel="noreferrer">iiif.io</a></td></tr>
              <tr><td className="at-key">Vercel</td><td><a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a></td></tr>
            </tbody>
          </table>
        </div>

        <div className="about-block">
          <div className="about-label">// team</div>
          <table className="about-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>[NO]</th>
                <th>[NAME]</th>
                <th>[ROLE]</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="at-num">[01]</td><td>Valeriia Korotkova</td><td>Creator — concept &amp; development</td></tr>
              <tr><td className="at-num">[02]</td><td>Georgii Korotkov</td><td>Development support</td></tr>
            </tbody>
          </table>
        </div>

        <div className="about-block">
          <div className="about-label">// contact</div>
          <div className="about-contact-row">
            <div className="about-text">
              <strong className="about-contact-strong">Get in touch</strong>
              Have a question, found a bug, or want to suggest a feature?
              We'd love to hear from you.
            </div>
            <a href={`mailto:${EMAIL}`} className="btn-primary about-contact-btn" onClick={handleContactClick}>
              SEND MESSAGE &#8594;
            </a>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="foot-l">&copy; 2026 Try&#123;pl&#125;</div>
      </footer>

      {showCaptcha && <CaptchaModal onClose={() => setShowCaptcha(false)} onPass={handlePass} />}
    </div>
  );
}
