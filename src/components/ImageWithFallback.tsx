import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imageClassName?: string;
  onError?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  imageClassName = '',
  onError,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed) {
    return (
      <div className={`image-unavailable ${className}`.trim()} role="img" aria-label={`${alt}: image unavailable`}>
        <ImageOff size={22} aria-hidden="true" />
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      className={`${className} ${imageClassName}`.trim()}
      src={src as string}
      alt={alt}
      loading="lazy"
      onError={() => {
        setFailed(true);
        onError?.();
      }}
    />
  );
}
