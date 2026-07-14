import Image from "next/image";

export function EditorialImage({
  src,
  alt,
  className,
  imageClassName,
  imagePosition,
  imageFit,
  aspectRatio,
  preload,
  priority,
  quality,
  sizes,
  unoptimized,
}: {
  src?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  aspectRatio?: string;
  preload?: boolean;
  /** Compatibility for older callers. Prefer preload in new code. */
  priority?: boolean;
  quality?: number;
  sizes?: string;
  unoptimized?: boolean;
}) {
  const imageStyle =
    imagePosition || imageFit
      ? { objectPosition: imagePosition, objectFit: imageFit }
      : undefined;
  const shouldPreload = preload ?? priority ?? false;

  if (src) {
    return (
      <div
        className={`editorial-image-shell relative overflow-hidden ${className ?? ""}`}
        data-has-image="true"
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          preload={shouldPreload}
          quality={quality}
          unoptimized={unoptimized}
          sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
          className={`object-cover ${imageClassName ?? ""}`}
          style={imageStyle}
        />
      </div>
    );
  }

  return (
    <div
      className={`editorial-image-shell placeholder-art ${className ?? ""}`}
      aria-label={alt}
    />
  );
}
