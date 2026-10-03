import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  plain?: boolean;
}

export function Logo({ className = '', showWordmark = true, plain = false }: LogoProps) {
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        R
      </span>
      {showWordmark ? (
        <span className="brand-name">
          Rafna <em>Investment</em>
        </span>
      ) : null}
    </>
  );

  if (plain) {
    return <a className={`brand ${className}`.trim()} href="/" aria-label="Rafna Investment home">{content}</a>;
  }

  return <Link className={`brand ${className}`.trim()} to="/" aria-label="Rafna Investment home">{content}</Link>;
}
