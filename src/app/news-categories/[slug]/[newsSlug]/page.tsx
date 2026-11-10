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
      : groq`*[(_type == "post") && slug.current == $newsSlug && category._ref == $catId][0]{
      _id,
      _type,
      title,
      excerpt,
      body,
      publishedAt,
      mainImage{
        asset->{
         
          url
        },
        alt
      },
       gallery[]{
        image{
          asset->{ url },
          alt
        },
        caption,
        body
      },
      category->{
        title,
        "slug": slug.current
      },
       "downloadableResources": downloadableResources[] {
    title,
    description,
    "fileUrl": file.asset->url,
    "fileName": file.asset->originalFilename,
    "mimeType": file.asset->mimeType,
    "size": file.asset->size
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
