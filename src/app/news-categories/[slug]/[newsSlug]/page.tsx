import { groq } from "next-sanity";
import { client } from "@/lib/sanityClient";
import NewsClient from "./NewsClient";
import PosterClient from "./PosterClient";

export const revalidate = 60;

interface NewsPageProps {
  params: Promise<{ slug: string; newsSlug: string }>;
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { slug, newsSlug } = await params;

  // ✅ Check Category First
  const category = await client.fetch(
    groq`*[_type == "category" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current
    }`,
    { slug },
  );

  if (!category) {
    return <p>Category not found</p>;
  }

  const isPosterCategory = category.title?.toLowerCase().trim() === "poster";

  // Fetch the post by its slug
  const news = await client.fetch(
    isPosterCategory
      ? groq`*[_type == "poster" && slug.current == $newsSlug && category._ref == $catId][0]{
          _id,
          _type,
          title,
          publishedAt,
          caption,
          image{
            asset->{ url },
            alt
          },
          downloadableFile{ asset->{ url, originalFilename } },
          category->{ title, "slug": slug.current }
        }`
      : groq`*[_type == "post" && slug.current == $newsSlug && category._ref == $catId][0]{
  _id,
  _type,
  title,
  excerpt,
  publishedAt,

  // Featured image
  mainImage {
    alt,
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "aspectRatio": asset->metadata.dimensions.aspectRatio
  },

  // Main article Portable Text
  body[]{
    ...,

    // Inline images
    _type == "image" => {
      ...,
      asset-> {
        url,
        metadata {
          dimensions
        }
      }
    },

    // Inline videos/files
    _type == "file" => {
      ...,
      asset-> {
        url,
        mimeType,
        originalFilename,
        size
      }
    }
  },
  downloadableResources[]{
  _key,
  title,
  description,
 thumbnail {
    alt,
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
  },
  file {
    asset-> {
      _id,
      url,
      originalFilename,
      mimeType,
      size
    }
  }
},

pdfAttachment {
  asset-> {
    _id,
    url,
    originalFilename,
    mimeType,
    size
  }
},

  // Gallery
  gallery[]{
    _key,
    caption,

    image {
      alt,
      "url": asset->url,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    },

    body[]{
      ...,

      _type == "image" => {
        ...,
        asset-> {
          url,
          metadata {
            dimensions
          }
        }
      },

      _type == "file" => {
        ...,
        asset-> {
          url,
          mimeType,
          originalFilename,
          size
        }
      }
    }
  }
}`,
    { newsSlug, catId: category._id },
  );

  if (!news) {
    return <p>News not found</p>;
  }

  return isPosterCategory ? (
    <PosterClient news={news} />
  ) : (
    <NewsClient news={news} slug={slug} />
  );
}
