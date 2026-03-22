export default function About() {
  return (
    <div className="page" style={{ flex: 1 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* About */}
        <div className="about-block">
          <div className="about-label">// about</div>
          <div className="about-title">Try<span style={{ color: 'var(--sage-d)' }}>&#123;pl&#125;</span> — unified IIIF workspace</div>
          <div className="about-text">
            Built to remove the context-switching that digital collections teams face.
            Validating manifests and previewing them are typically separate tasks —
            Try&#123;pl&#125; combines them into one spreadsheet-driven workflow.
          </div>
        </div>

        {/* Built on */}
        <div className="about-block">
          <div className="about-label">// built on</div>
          <table className="about-table">
            <tbody>
              <tr>
                <td className="at-key">IIIF Presentation Validator</td>
                <td><a href="https://presentation-validator.iiif.io" target="_blank" rel="noreferrer">presentation-validator.iiif.io</a></td>
              </tr>
              <tr>
                <td className="at-key">Mirador Viewer</td>
                <td><a href="https://projectmirador.org" target="_blank" rel="noreferrer">projectmirador.org</a></td>
              </tr>
              <tr>
                <td className="at-key">IIIF Community</td>
                <td><a href="https://iiif.io" target="_blank" rel="noreferrer">iiif.io</a></td>
              </tr>
              <tr>
                <td className="at-key">Vercel</td>
                <td><a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Team */}
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
              <tr>
                <td className="at-num">[01]</td>
                <td>Valeria</td>
                <td>Project lead &amp; design</td>
              </tr>
              <tr>
                <td className="at-num">[02]</td>
                <td>Georgii</td>
                <td>Development</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Contact */}
        <div className="about-block">
          <div className="about-label">// contact</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, maxWidth: 520 }}>
            <div className="about-text">
              <strong style={{ color: 'var(--ink)', fontWeight: 700, display: 'block', marginBottom: 3 }}>
                Get in touch
              </strong>
              Have a question, found a bug, or want to suggest a feature?
              We'd love to hear from you.
            </div>
            <a href="mailto:" className="btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap', padding: '8px 16px' }}>
              SEND MESSAGE &#8594;
            </a>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="foot-l">&copy; 2026 Try&#123;pl&#125;</div>
        <div className="foot-r">
          Built with <a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a>
        </div>
      </footer>
    </div>
  );
}
