import { Helmet } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description?: string;
  ogImage?: string;
}

export function PageMeta({ 
  title, 
  description = "Learn about surgical procedures in ScrubIn – interactive surgical simulation platform.",
  ogImage = "/og/default.png" 
}: PageMetaProps) {
  return (
    <Helmet>
      <title>{title} – ScrubIn</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} – ScrubIn`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
