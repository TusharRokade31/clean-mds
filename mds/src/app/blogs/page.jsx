// page.jsx
import BlogsClient from "./BlogsClient"

export const metadata = {
  title: "Spiritual Travel Blogs & Sacred Journeys",
  description: "Discover inspiring blogs on pilgrim journeys, divine destinations, and soulful travel experiences that uplift and enrich your spiritual path.",
  alternates: {
    canonical: "https://mydivinestays.com/blogs",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://mydivinestays.com/blogs"
  },
  "headline": "Why Book Your Stay at a Dharamshala? The Spiritual and Practical Benefits",
  "description": "Book your Dharamshala stay for a peaceful spiritual retreat. Enjoy affordable, serene, and convenient accommodations during your pilgrimage in India.",
  "image": "",
  "author": {
    "@type": "Organization",
    "name": "My Divine Stays",
    "url": "https://mydivinestays.com/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "My Divine Stays",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mydivinestays.com/mds.png"
    }
  },
  "datePublished": "2026-02-05"
}

export default function BlogsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogsClient />
    </>
  )
}