import { DocumentTextIcon, ImageIcon, DocumentIcon } from "@sanity/icons";

import { defineField, defineType } from "sanity";

const downloadableFileTypes = [
  // Video
  "video/mp4",

  // PDF
  "application/pdf",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
    }),

    defineField({
      name: "mainImage",
      type: "image",
      title: "Main Image (Featured)",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
        }),
      ],
    }),

    // Image Gallery
    defineField({
      name: "gallery",
      title: "Image Gallery",
      type: "array",
      of: [
        {
          type: "object",
          name: "galleryItem",
          title: "Gallery Item",
          icon: ImageIcon,
          fields: [
            defineField({
              name: "image",
              type: "image",
              title: "Image",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  type: "string",
                  title: "Alternative text",
                }),
              ],
            }),

            defineField({
              name: "caption",
              title: "Caption / Description",
              type: "string",
            }),

            defineField({
              name: "body",
              title: "Related Paragraph / Content",
              type: "blockContent",
            }),
          ],

          preview: {
            select: {
              title: "caption",
              media: "image",
            },
            prepare(selection) {
              const { title } = selection;
              return {
                title: title || "Gallery Item",
                media: selection.media,
              };
            },
          },
        },
      ],
      options: {
        layout: "grid",
      },
      description:
        "Add one or more images with optional captions or paragraphs.",
    }),

    // Category
    defineField({
      name: "category",
      title: "Post Category",
      type: "reference",
      to: [{ type: "category" }],
      options: {
        filter: "categoryType == $type",
        filterParams: { type: "post" },
      },
    }),

    defineField({
      name: "publishedAt",
      title: "Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
    }),

    // Main Rich Text Content
    defineField({
      name: "body",
      title: "Post Content",
      type: "blockContent",
    }),

    // Downloadable Resources
    defineField({
      name: "downloadableResources",
      title: "Downloadable Resources",
      type: "array",
      of: [
        {
          type: "object",
          name: "downloadableResource",
          title: "Downloadable File",
          icon: DocumentIcon,

          fields: [
            defineField({
              name: "title",
              title: "File Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "thumbnail",
              title: "Video Thumbnail",
              type: "image",
              description:
                "Optional preview image displayed before a video starts playing.",
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alternative Text",
                  type: "string",
                }),
              ],
            }),

            defineField({
              name: "file",
              title: "Upload File",
              type: "file",
              options: {
                accept: downloadableFileTypes,
                storeOriginalFilename: true,
              },
              validation: (Rule) => Rule.required(),
            }),
          ],

          preview: {
            select: {
              title: "title",
              filename: "file.asset.originalFilename",
            },
            prepare({ title, filename }) {
              return {
                title: title || filename || "Downloadable File",
                subtitle: filename || "No file uploaded",
              };
            },
          },
        },
      ],

      description:
        "Upload PDFs, videos, PowerPoint, Excel and Word files for visitors to download.",
    }),

    // Legacy PDF field - retain temporarily for existing content
    defineField({
      name: "pdfAttachment",
      title: "Legacy PDF Attachment",
      type: "file",
      hidden: true,
      options: {
        accept: ".pdf",
        storeOriginalFilename: true,
      },
    }),
  ],

  preview: {
    select: {
      title: "title",
      author: "author.name",
      category: "category.title",
      media: "mainImage",
    },
    prepare(selection) {
      const { author, category } = selection;

      return {
        ...selection,
        subtitle: `${author ? `by ${author}` : ""}${
          category ? ` | ${category}` : ""
        }`,
      };
    },
  },

  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Oldest first",
      name: "publishedAtAsc",
      by: [{ field: "publishedAt", direction: "asc" }],
    },
    {
      title: "Title, Asc",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
