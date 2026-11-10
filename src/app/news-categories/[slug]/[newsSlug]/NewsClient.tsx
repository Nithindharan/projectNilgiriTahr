"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import styles from "./NewsClient.module.css";

export default function NewsClient({
  news,
  slug,
}: {
  news: any;
  slug: string;
}) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={styles.newsContainer}
    >
      <div className={styles.inner}>
        {/* Title */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={styles.newsTitle}
        >
          {news.title}
        </motion.h1>

        {/* Meta */}
        <p className={styles.newsMeta}>
          {new Date(news.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          — {news.category?.title}
        </p>

        {/* Main Image */}
        {news.mainImage?.asset?.url && (
          <motion.div
            className={styles.newsImageWrapper}
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <Image
              src={news.mainImage.asset.url}
              alt={news.mainImage.alt || news.title}
              fill
              className={styles.newsMainImage}
            />
          </motion.div>
        )}

        {/* Excerpt */}
        {news.excerpt && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={styles.newsExcerpt}
          >
            <p>{news.excerpt}</p>
          </motion.div>
        )}

        {/* Divider */}
        <div className={styles.sectionDivider}></div>

        {/* Body Content */}
        {news.body && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`${styles.newsBody} prose`}>
              <PortableText
                value={news.body}
                components={{
                  block: {
                    h2: ({ children }) => <h2>{children}</h2>,
                    h3: ({ children }) => <h3>{children}</h3>,
                    normal: ({ children }) => <p>{children}</p>,
                  },
                  list: {
                    bullet: ({ children }) => <ul>{children}</ul>,
                    number: ({ children }) => <ol>{children}</ol>,
                  },
                  listItem: {
                    bullet: ({ children }) => <li>{children}</li>,
                    number: ({ children }) => <li>{children}</li>,
                  },
                  marks: {
                    link: ({ value, children }) => (
                      <a
                        href={value?.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  },
                }}
              />
              {news.pdfAttachment?.asset?.url && (
                <a
                  href={news.pdfAttachment.asset.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-link"
                >
                  Download PDF
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <div className={styles.sectionDivider}></div>

        {/* Downloadable Resources Section */}
        {news.downloadableResources &&
          news.downloadableResources.length > 0 && (
            <>
              <section className={styles.downloadSection}>
                <h2 className={styles.downloadTitle}>Downloadable Resources</h2>

                <div className={styles.downloadList}>
                  {news.downloadableResources.map(
                    (resource: any, index: number) => {
                      if (!resource.fileUrl) return null;

                      return (
                        <div
                          key={resource.fileUrl || index}
                          className={styles.downloadItem}
                        >
                          <div className={styles.downloadInfo}>
                            <h3>{resource.title}</h3>

                            {resource.description && (
                              <p>{resource.description}</p>
                            )}

                            {resource.fileName && (
                              <span>{resource.fileName}</span>
                            )}
                          </div>

                          <a
                            href={`${resource.fileUrl}?dl=`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.downloadButton}
                          >
                            Download
                          </a>
                        </div>
                      );
                    },
                  )}
                </div>
              </section>

              <div className={styles.sectionDivider}></div>
            </>
          )}

        {/* Gallery Section */}
        {news.gallery && news.gallery.length > 0 && (
          <section className={styles.gallerySection}>
            {news.gallery.map((item: any, index: number) => (
              <motion.div
                key={index}
                className={`${styles.galleryItem} ${
                  index % 2 === 0 ? styles.leftLayout : styles.rightLayout
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* Image */}
                {item.image?.asset?.url && (
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className={styles.galleryImageWrapper}
                  >
                    <Image
                      src={item.image.asset.url}
                      alt={item.image.alt || `Gallery image ${index + 1}`}
                      fill
                      className={styles.galleryImage}
                    />
                  </motion.div>
                )}

                {/* Caption & Body */}
                {item.body && (
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    viewport={{ once: true }}
                    className={styles.galleryText}
                  >
                    {item.caption && (
                      <h3 className={styles.galleryCaption}>{item.caption}</h3>
                    )}
                    {item.body && (
                      <div className={styles.galleryBody}>
                        <PortableText value={item.body} />
                      </div>
                    )}
                  </motion.div>
                )}
                <div className={styles.sectionDivider}></div>
              </motion.div>
            ))}
          </section>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            marginTop: "3rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Link href={`/news-categories/${slug}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              style={{
                background: "transparent",
                border: "2px solid #432d05",
                color: "linear-gradient(135deg, #473422cb, #251d15)",
                padding: "1rem 2rem",
                fontSize: "1rem",
                fontWeight: "600",
                fontFamily: "Inter, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginTop: "2rem",
                marginBottom: "2rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #473422cb, #251d15)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#251d15";
              }}
            >
              Back to Recent News
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
