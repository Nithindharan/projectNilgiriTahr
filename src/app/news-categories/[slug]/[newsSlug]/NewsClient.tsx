"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileText,
  FileVideo,
  File,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";

import styles from "./NewsClient.module.css";

// ==================================================
// TYPES
// ==================================================

interface SanityAsset {
  _id?: string;
  url?: string;
  originalFilename?: string;
  mimeType?: string;
  size?: number;
  metadata?: {
    dimensions?: {
      width?: number;
      height?: number;
      aspectRatio?: number;
    };
  };
}

interface SanityImage {
  _key?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  caption?: string;
  asset?: SanityAsset;
}

interface SanityFile {
  asset?: SanityAsset;
}

interface PortableTextBlock {
  _key?: string;
  _type: string;
  children?: Array<{
    _type?: string;
    text?: string;
    marks?: string[];
  }>;
  asset?: SanityAsset;
  caption?: string;
  alt?: string;
  [key: string]: any;
}

interface GalleryItem {
  _key?: string;
  image?: SanityImage;
  caption?: string;
  body?: PortableTextBlock[] | null;
}

interface DownloadableResource {
  _key?: string;
  title?: string;
  description?: string;
  thumbnail?: SanityImage;
  file?: SanityFile;
}
/* interface DownloadableResource {
  _key?: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
} */

interface NewsData {
  _id?: string;
  title: string;
  excerpt?: string;
  publishedAt: string;
  category?: {
    title?: string;
    slug?: string;
  };
  mainImage?: SanityImage;
  body?: PortableTextBlock[];
  gallery?: GalleryItem[];
  downloadableResources?: DownloadableResource[];
  pdfAttachment?: SanityFile;
}

interface NewsClientProps {
  news: NewsData;
  slug: string;
}

type FeaturedImageLayout =
  | "wide"
  | "landscape"
  | "square"
  | "portrait"
  | "extraTall";
// ==================================================
// IMAGE HELPERS
// Supports both flattened GROQ image projections
// and expanded Sanity asset objects.
// ==================================================

function getImageUrl(image?: SanityImage | null): string | undefined {
  return image?.url || image?.asset?.url;
}

function getFeaturedImageUrl(image?: SanityImage): string | undefined {
  const imageUrl = getImageUrl(image);

  if (!imageUrl) return undefined;

  try {
    const url = new URL(imageUrl);

    if (url.hostname === "cdn.sanity.io") {
      url.searchParams.set("w", "1600");
      url.searchParams.set("fit", "max");
      url.searchParams.set("auto", "format");
      url.searchParams.set("q", "80");
    }

    return url.toString();
  } catch {
    return imageUrl;
  }
}

function getImageDimensions(image?: SanityImage | null) {
  const width = image?.width || image?.asset?.metadata?.dimensions?.width;

  const height = image?.height || image?.asset?.metadata?.dimensions?.height;

  const aspectRatio =
    image?.aspectRatio ||
    image?.asset?.metadata?.dimensions?.aspectRatio ||
    (width && height ? width / height : undefined);

  return {
    width,
    height,
    aspectRatio,
  };
}
function getFeaturedImageLayout(image?: SanityImage): FeaturedImageLayout {
  const { aspectRatio } = getImageDimensions(image);

  // Fallback is used only when Sanity dimensions are unavailable.
  const ratio = aspectRatio || 1.6;

  if (ratio > 1.65) return "wide";
  if (ratio > 1.25) return "landscape";
  if (ratio >= 0.85) return "square";
  if (ratio >= 0.55) return "portrait";

  return "extraTall";
}

function getGalleryImageLayout(image?: SanityImage): FeaturedImageLayout {
  const { aspectRatio } = getImageDimensions(image);
  const ratio = aspectRatio || 1.6;

  if (ratio < 0.85) return "portrait";
  if (ratio > 1.3) return "landscape";

  return "square";
}

// ==================================================
// CONTENT HELPERS
// ==================================================

function hasMeaningfulBody(body?: PortableTextBlock[] | null): boolean {
  if (!Array.isArray(body) || body.length === 0) {
    return false;
  }

  return body.some((block) => {
    if (block._type === "block") {
      return (
        block.children?.some(
          (child) =>
            typeof child.text === "string" && child.text.trim().length > 0,
        ) ?? false
      );
    }

    return true;
  });
}

function formatDate(date?: string) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileExtension(fileName?: string) {
  return fileName?.split(".").pop()?.toLowerCase() || "";
}

function isVideoResource(mimeType?: string, fileName?: string) {
  const extension = getFileExtension(fileName);

  return mimeType?.startsWith("video/") || ["mp4"].includes(extension);
}

function getFileIcon(mimeType?: string, fileName?: string) {
  const extension = getFileExtension(fileName);

  if (mimeType?.includes("pdf") || extension === "pdf") {
    return FileText;
  }

  if (
    mimeType?.includes("spreadsheet") ||
    mimeType?.includes("excel") ||
    ["xls", "xlsx"].includes(extension)
  ) {
    return FileSpreadsheet;
  }

  if (
    mimeType?.includes("presentation") ||
    ["ppt", "pptx"].includes(extension)
  ) {
    return FileText;
  }

  if (isVideoResource(mimeType, fileName)) {
    return FileVideo;
  }

  return File;
}

function getFileTypeLabel(mimeType?: string, fileName?: string) {
  const extension = getFileExtension(fileName);

  if (extension) return extension.toUpperCase();

  if (mimeType?.includes("pdf")) return "PDF";
  if (mimeType?.includes("spreadsheet")) return "Excel";
  if (mimeType?.includes("presentation")) return "PowerPoint";
  if (mimeType?.startsWith("video/")) return "Video";

  return "FILE";
}

/**
 * Sanity CDN supports the dl parameter for attachment downloads.
 * This is the initial direct-download implementation.
 * A validated streaming endpoint can replace this helper later.
 */
function getDownloadUrl(url?: string, fileName?: string) {
  if (!url) return "";

  try {
    const downloadUrl = new URL(url);

    if (fileName) {
      downloadUrl.searchParams.set("dl", fileName);
    } else {
      downloadUrl.searchParams.set("dl", "");
    }

    return downloadUrl.toString();
  } catch {
    return url;
  }
}

// ==================================================
// VIDEO RESOURCE
// ==================================================

interface VideoResourceProps {
  resource: DownloadableResource;
}

function VideoResource({ resource }: VideoResourceProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Store the generated thumbnail together with its source video URL.
  // This prevents a thumbnail from an earlier video being reused.
  const [generatedThumbnail, setGeneratedThumbnail] = useState<{
    videoUrl: string;
    dataUrl: string;
  } | null>(null);

  const asset = resource.file?.asset;
  const videoUrl = asset?.url;
  const fileName = asset?.originalFilename || "video.mp4";

  const uploadedThumbnail = getImageUrl(resource.thumbnail);

  const generatedThumbnailUrl =
    generatedThumbnail && generatedThumbnail.videoUrl === videoUrl
      ? generatedThumbnail.dataUrl
      : null;

  const thumbnailUrl = uploadedThumbnail || generatedThumbnailUrl;

  useEffect(() => {
    if (!videoUrl || uploadedThumbnail) return;

    let isActive = true;
    let seekAttempted = false;

    const video = document.createElement("video");

    // Must be set before assigning the video URL for canvas access.
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const captureFrame = () => {
      if (!isActive) return;

      if (
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        return;
      }

      try {
        // Limit the thumbnail dimensions to reduce memory usage.
        const maxWidth = 640;
        const scale = Math.min(1, maxWidth / video.videoWidth);

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const context = canvas.getContext("2d");
        if (!context) return;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);

        if (isActive) {
          setGeneratedThumbnail({
            videoUrl,
            dataUrl,
          });
        }
      } catch {
        // Canvas extraction can fail when the video CDN blocks CORS.
        // The preview will show the placeholder instead.
      }
    };

    const handleLoadedMetadata = () => {
      if (!isActive) return;

      const duration = video.duration;

      if (Number.isFinite(duration) && duration > 0.1) {
        // Capture a frame slightly into the video rather than the
        // potentially blank first frame.
        const targetTime = Math.min(1, duration * 0.1);

        if (targetTime > 0.05) {
          seekAttempted = true;

          try {
            video.currentTime = targetTime;
          } catch {
            captureFrame();
          }
        } else {
          captureFrame();
        }
      }
    };

    const handleLoadedData = () => {
      // For videos with unavailable duration metadata, try the
      // first available frame.
      if (!seekAttempted) {
        captureFrame();
      }
    };

    const handleSeeked = () => {
      captureFrame();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("seeked", handleSeeked);

    video.src = videoUrl;
    video.load();

    return () => {
      isActive = false;

      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("seeked", handleSeeked);

      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [videoUrl, uploadedThumbnail]);

  if (!videoUrl) return null;

  const downloadUrl = getDownloadUrl(videoUrl, fileName);

  return (
    <article className={styles.videoResource}>
      <div className={styles.videoResourcePlayer}>
        {!isPlaying ? (
          <button
            type="button"
            className={styles.videoPreview}
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${resource.title || fileName}`}
          >
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={
                  resource.thumbnail?.alt || resource.title || "Video thumbnail"
                }
                fill
                unoptimized={!!generatedThumbnailUrl && !uploadedThumbnail}
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                className={styles.videoThumbnail}
              />
            ) : (
              <div className={styles.videoPlaceholder}>
                <FileVideo size={42} strokeWidth={1.3} />
              </div>
            )}

            {/* Always centred independently of the thumbnail */}
            <span className={styles.videoPlayButton} aria-hidden="true">
              <Play size={26} fill="currentColor" />
            </span>
          </button>
        ) : (
          <video
            controls
            autoPlay
            playsInline
            preload="none"
            poster={thumbnailUrl || undefined}
            className={styles.resourceVideoPlayer}
          >
            <source src={videoUrl} type={asset?.mimeType || "video/mp4"} />
            Your browser does not support HTML video.
          </video>
        )}
      </div>

      <div className={styles.videoResourceInfo}>
        <div className={styles.videoResourceDetails}>
          <h3>{resource.title || fileName}</h3>

          {resource.description && <p>{resource.description}</p>}

          <div className={styles.downloadMeta}>
            <span>{getFileTypeLabel(asset?.mimeType, fileName)}</span>
            <span>{formatFileSize(asset?.size)}</span>
          </div>
        </div>

        <a
          href={downloadUrl}
          className={styles.downloadButton}
          aria-label={`Download ${resource.title || fileName}`}
        >
          <Download size={12} />
        </a>
      </div>
    </article>
  );
}

// ==================================================
// DOCUMENT RESOURCE
// ==================================================

interface DocumentResourceProps {
  resource: DownloadableResource;
}

function DocumentResource({ resource }: DocumentResourceProps) {
  const asset = resource.file?.asset;

  if (!asset?.url) return null;

  const fileName = asset.originalFilename || "document";
  const Icon = getFileIcon(asset.mimeType, fileName);

  const downloadUrl = getDownloadUrl(asset.url, fileName);

  return (
    <article className={styles.downloadItem}>
      <div className={styles.downloadIcon}>
        <Icon size={25} strokeWidth={1.6} />
      </div>

      <div className={styles.downloadInfo}>
        <h3>{resource.title || fileName}</h3>

        {resource.description && <p>{resource.description}</p>}

        <div className={styles.downloadMeta}>
          <span>{getFileTypeLabel(asset.mimeType, fileName)}</span>

          <span>{formatFileSize(asset.size)}</span>
        </div>
      </div>

      <a
        href={downloadUrl}
        className={styles.downloadButton}
        aria-label={`Download ${resource.title || fileName}`}
      >
        <Download size={12} />
      </a>
    </article>
  );
}

// ==================================================
// IMAGE LIGHTBOX
// ==================================================

interface ImageLightboxProps {
  images: SanityImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function ImageLightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const activeImage = images[activeIndex];
  const activeImageUrl = getImageUrl(activeImage);

  const previous = useCallback(() => {
    onNavigate((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, onNavigate]);

  const next = useCallback(() => {
    onNavigate((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, onNavigate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();

      if (event.key === "ArrowLeft" && images.length > 1) {
        previous();
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        next();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, previous, next, images.length]);

  if (!activeImageUrl || !activeImage) return null;

  return (
    <motion.div
      className={styles.lightboxOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery viewer"
    >
      <div
        className={styles.lightboxContent}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.lightboxClose}
          onClick={onClose}
          aria-label="Close image viewer"
        >
          <X size={26} />
        </button>

        {images.length > 1 && (
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
            onClick={previous}
            aria-label="Previous image"
          >
            <ChevronLeft size={30} />
          </button>
        )}

        <div className={styles.lightboxImageWrapper}>
          <Image
            src={activeImageUrl}
            alt={activeImage.alt || "Gallery image"}
            fill
            sizes="100vw"
            className={styles.lightboxImage}
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            onClick={next}
            aria-label="Next image"
          >
            <ChevronRight size={30} />
          </button>
        )}

        <div className={styles.lightboxCaption}>
          <p>{activeImage.caption || activeImage.alt || ""}</p>

          <span className={styles.lightboxCounter}>
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ==================================================
// MAIN COMPONENT
// ==================================================

export default function NewsClient({ news, slug }: NewsClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.getElementById("site-header");

    if (!header) return;

    const updateHeaderHeight = () => {
      setHeaderHeight(header.getBoundingClientRect().height);
    };

    updateHeaderHeight();

    const observer = new ResizeObserver(updateHeaderHeight);

    observer.observe(header);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);
  // ------------------------------------------------
  // Separate editorial items and standalone images
  // ------------------------------------------------

  const { editorialItems, standaloneImages } = useMemo(() => {
    const editorial: GalleryItem[] = [];
    const standalone: GalleryItem[] = [];

    (news.gallery || []).forEach((item) => {
      if (!getImageUrl(item.image)) return;

      if (hasMeaningfulBody(item.body)) {
        editorial.push(item);
      } else {
        standalone.push(item);
      }
    });

    return {
      editorialItems: editorial,
      standaloneImages: standalone,
    };
  }, [news.gallery]);

  const lightboxImages = useMemo(
    () =>
      standaloneImages
        .map((item) => item.image)
        .filter(
          (image): image is SanityImage => !!image && !!getImageUrl(image),
        ),
    [standaloneImages],
  );

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setActiveImageIndex(null);
  }, []);

  const navigateLightbox = useCallback((index: number) => {
    setActiveImageIndex(index);
  }, []);

  // ------------------------------------------------
  // Portable Text components
  // ------------------------------------------------

  const portableTextComponents: PortableTextComponents = {
    block: {
      h1: ({ children }) => <h2 className={styles.articleH1}>{children}</h2>,

      h2: ({ children }) => <h2 className={styles.articleH2}>{children}</h2>,

      h3: ({ children }) => <h3 className={styles.articleH3}>{children}</h3>,

      h4: ({ children }) => <h4 className={styles.articleH4}>{children}</h4>,

      normal: ({ children }) => (
        <p className={styles.articleParagraph}>{children}</p>
      ),

      blockquote: ({ children }) => (
        <blockquote className={styles.articleQuote}>{children}</blockquote>
      ),
    },

    list: {
      bullet: ({ children }) => (
        <ul className={styles.articleList}>{children}</ul>
      ),

      number: ({ children }) => (
        <ol className={styles.articleOrderedList}>{children}</ol>
      ),
    },

    listItem: {
      bullet: ({ children }) => <li>{children}</li>,
      number: ({ children }) => <li>{children}</li>,
    },

    marks: {
      link: ({ value, children }) => {
        const href = value?.href;

        if (!href) return <>{children}</>;

        const isExternal = /^https?:\/\//i.test(href);

        return (
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {children}

            {isExternal && (
              <ArrowUpRight
                size={14}
                className={styles.externalLinkIcon}
                aria-hidden="true"
              />
            )}
          </a>
        );
      },
    },

    types: {
      image: ({ value }) => {
        const image = value as SanityImage;
        const imageUrl = getFeaturedImageUrl(image);
        const { aspectRatio } = getImageDimensions(image);

        if (!imageUrl) return null;

        return (
          <figure className={styles.inlineMediaFigure}>
            <div
              className={styles.inlineImageWrapper}
              style={{
                aspectRatio: aspectRatio || "16 / 9",
              }}
            >
              <Image
                src={imageUrl}
                alt={image.alt || image.caption || ""}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className={styles.inlineImage}
              />
            </div>

            {image.caption && (
              <figcaption className={styles.mediaCaption}>
                {image.caption}
              </figcaption>
            )}
          </figure>
        );
      },

      file: ({ value }) => {
        const video = value as PortableTextBlock;
        const videoUrl = video.asset?.url;
        const mimeType = video.asset?.mimeType || "";

        if (!videoUrl || !mimeType.startsWith("video/")) {
          return null;
        }

        return (
          <figure className={styles.inlineMediaFigure}>
            <div className={styles.videoWrapper}>
              <video
                controls
                preload="metadata"
                playsInline
                className={styles.articleVideo}
              >
                <source src={videoUrl} type={mimeType} />
                Your browser does not support HTML video.
              </video>
            </div>

            {video.caption && (
              <figcaption className={styles.mediaCaption}>
                {video.caption}
              </figcaption>
            )}
          </figure>
        );
      },
    },
  };

  // ------------------------------------------------
  // Downloadable resources
  // GROQ returns resource.file.asset, not flattened
  // fileUrl/fileName/mimeType properties.
  // ------------------------------------------------

  const resources = (news.downloadableResources || []).filter(
    (resource) => !!resource.file?.asset?.url,
  );

  const videos = resources.filter((resource) =>
    isVideoResource(
      resource.file?.asset?.mimeType,
      resource.file?.asset?.originalFilename,
    ),
  );

  const documents = resources.filter(
    (resource) =>
      !isVideoResource(
        resource.file?.asset?.mimeType,
        resource.file?.asset?.originalFilename,
      ),
  );

  const legacyPdf = news.pdfAttachment?.asset;

  // Avoid rendering a legacy PDF twice if it is already
  // present in downloadableResources.
  const legacyPdfAlreadyListed =
    !!legacyPdf?._id &&
    resources.some((resource) => resource.file?.asset?._id === legacyPdf._id);

  const showLegacyPdf = !!legacyPdf?.url && !legacyPdfAlreadyListed;

  const hasResources =
    videos.length > 0 || documents.length > 0 || showLegacyPdf;

  const featuredImageLayout =
    news.mainImage && getImageUrl(news.mainImage)
      ? getFeaturedImageLayout(news.mainImage)
      : null;

  const isPortraitFeatured =
    featuredImageLayout === "portrait" || featuredImageLayout === "extraTall";

  // ------------------------------------------------
  // Render
  // ------------------------------------------------

  return (
    <>
      <motion.main
        className={styles.newsContainer}
        style={
          {
            "--site-header-height": `${headerHeight}px`,
          } as CSSProperties
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.inner}>
          {/* ARTICLE INTRO — HEADER + FEATURED IMAGE */}

          <section
            className={`${styles.articleIntro} ${
              isPortraitFeatured ? styles.articleIntroPortrait : ""
            }`}
          >
            {/* ARTICLE HEADER */}

            <header className={styles.articleHeader}>
              <div className={styles.articleEyebrow}>
                {news.category?.title && (
                  <span className={styles.categoryLabel}>
                    {news.category.title}
                  </span>
                )}

                {news.category?.title && news.publishedAt && (
                  <span className={styles.metaSeparator} aria-hidden="true" />
                )}

                {news.publishedAt && (
                  <time dateTime={news.publishedAt}>
                    {formatDate(news.publishedAt)}
                  </time>
                )}
              </div>

              <motion.h1
                className={styles.newsTitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {news.title}
              </motion.h1>

              {news.excerpt && (
                <motion.p
                  className={styles.newsExcerpt}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  {news.excerpt}
                </motion.p>
              )}
            </header>

            {/* ADAPTIVE FEATURED IMAGE */}

            {news.mainImage && getImageUrl(news.mainImage) && (
              <section className={styles.featuredImageSection}>
                {(() => {
                  const image = news.mainImage!;
                  const imageUrl = getFeaturedImageUrl(image)!;
                  const layout = getFeaturedImageLayout(image);
                  const dimensions = getImageDimensions(image);

                  const imageWidth = dimensions.width || 1600;
                  const imageHeight = dimensions.height || 900;

                  const imageSizes = {
                    wide: "(max-width: 640px) 100vw, 1120px",
                    landscape: "(max-width: 640px) 100vw, 1000px",
                    square: "(max-width: 640px) 100vw, 800px",
                    portrait: "(max-width: 640px) 100vw, 650px",
                    extraTall: "(max-width: 640px) 100vw, 550px",
                  } satisfies Record<FeaturedImageLayout, string>;

                  return (
                    <figure
                      className={`${styles.featuredImageFrame} ${
                        styles[`featuredImage_${layout}`]
                      }`}
                    >
                      <Image
                        src={imageUrl}
                        alt={image.alt || news.title}
                        width={imageWidth}
                        height={imageHeight}
                        priority
                        sizes={imageSizes[layout]}
                        className={styles.newsMainImage}
                      />

                      {image.caption && (
                        <figcaption className={styles.featuredImageCaption}>
                          {image.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                })()}
              </section>
            )}
          </section>

          {/* MAIN ARTICLE BODY */}

          {news.body && news.body.length > 0 && (
            <section className={styles.articleSection}>
              <motion.article
                className={styles.newsBody}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6 }}
              >
                <PortableText
                  value={news.body as any}
                  components={portableTextComponents}
                />
              </motion.article>
            </section>
          )}

          {/* EDITORIAL GALLERY */}

          {editorialItems.length > 0 && (
            <section className={styles.editorialGallery}>
              {editorialItems.map((item, index) => {
                const image = item.image!;
                const imageUrl = getImageUrl(image)!;
                const layout = getGalleryImageLayout(image);

                return (
                  <motion.article
                    key={item._key || index}
                    className={`${styles.editorialItem} ${
                      styles[`editorial_${layout}`]
                    } ${index % 2 === 1 ? styles.editorialReverse : ""}`}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <figure className={styles.editorialImageColumn}>
                      <div className={styles.editorialImageWrapper}>
                        <Image
                          src={imageUrl}
                          alt={image.alt || item.caption || ""}
                          fill
                          sizes="(max-width: 768px) 100vw, 600px"
                          className={styles.editorialImage}
                        />
                      </div>

                      {(item.caption || image.caption) && (
                        <figcaption className={styles.editorialCaption}>
                          {item.caption || image.caption}
                        </figcaption>
                      )}
                    </figure>

                    <div className={styles.editorialText}>
                      {item.body && (
                        <PortableText
                          value={item.body as any}
                          components={portableTextComponents}
                        />
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </section>
          )}

          {/* MEDIA & DOWNLOADS */}

          {hasResources && (
            <section className={styles.downloadSection}>
              <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>MEDIA & DOWNLOADS</span>
                <h2 className={styles.downloadTitle}>Resources</h2>
              </div>

              {/* VIDEO GALLERY */}

              {videos.length > 0 && (
                <div className={styles.videoResourceGrid}>
                  {videos.map((resource, index) => (
                    <VideoResource
                      key={resource._key || resource.file?.asset?._id || index}
                      resource={resource}
                    />
                  ))}
                </div>
              )}

              {/* DOCUMENT DOWNLOADS */}

              {(documents.length > 0 || showLegacyPdf) && (
                <div className={styles.downloadList}>
                  {documents.map((resource, index) => (
                    <DocumentResource
                      key={resource._key || resource.file?.asset?._id || index}
                      resource={resource}
                    />
                  ))}

                  {/* Legacy PDF fallback */}

                  {showLegacyPdf && legacyPdf?.url && (
                    <article className={styles.downloadItem}>
                      <div className={styles.downloadIcon}>
                        <FileText size={25} />
                      </div>

                      <div className={styles.downloadInfo}>
                        <h3>PDF Attachment</h3>

                        <div className={styles.downloadMeta}>
                          <span>
                            {legacyPdf.originalFilename || "PDF Document"}
                          </span>
                          <span>{formatFileSize(legacyPdf.size)}</span>
                        </div>
                      </div>

                      <a
                        href={getDownloadUrl(
                          legacyPdf.url,
                          legacyPdf.originalFilename || "document.pdf",
                        )}
                        className={styles.downloadButton}
                        aria-label="Download PDF attachment"
                      >
                        <Download size={12} />
                      </a>
                    </article>
                  )}
                </div>
              )}
            </section>
          )}

          {/* STANDALONE PHOTO GALLERY */}

          {standaloneImages.length > 0 && (
            <section className={styles.gallerySection}>
              <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>PHOTO COLLECTION</span>

                <h2 className={styles.galleryTitle}>Photo Gallery</h2>

                <p className={styles.galleryDescription}>
                  Moments and highlights from this event.
                </p>
              </div>

              <div className={styles.galleryGrid}>
                {standaloneImages.map((item, index) => {
                  const image = item.image!;
                  const imageUrl = getImageUrl(image)!;

                  return (
                    <motion.button
                      type="button"
                      key={item._key || index}
                      className={styles.galleryCard}
                      onClick={() => openLightbox(index)}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: Math.min(index % 4, 3) * 0.08,
                      }}
                      aria-label={`View gallery image ${index + 1}`}
                    >
                      <div className={styles.galleryImageWrapper}>
                        <Image
                          src={imageUrl}
                          alt={image.alt || item.caption || ""}
                          fill
                          sizes="(max-width: 600px) 50vw, (max-width: 1000px) 50vw, 33vw"
                          className={styles.galleryImage}
                        />
                      </div>

                      {(item.caption || image.caption) && (
                        <span className={styles.editorialCaption}>
                          {item.caption || image.caption}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </section>
          )}

          {/* BACK TO NEWS */}

          <div>
            <Link href={`/news-categories/${slug}`} className={styles.backLink}>
              <ArrowLeft size={18} />
              <span>Back to Recent News</span>
            </Link>
          </div>
        </div>
      </motion.main>

      {/* IMAGE LIGHTBOX */}

      <AnimatePresence>
        {activeImageIndex !== null && lightboxImages.length > 0 && (
          <ImageLightbox
            images={lightboxImages}
            activeIndex={activeImageIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </AnimatePresence>
    </>
  );
}
