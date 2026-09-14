import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="error-page">
      <p className="eyebrow">SIGNAL LOST</p>
      <h1>That page is outside the graph.</h1>
      <p>The requested location could not be found.</p>
      <Link className="button primary" href="/">
        Return to CyberScan
      </Link>
    </main>
  );
}
