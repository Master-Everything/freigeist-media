import { getIconByName } from "@/lib/icons";
import { getYouTubeThumbnail } from "@/lib/videoUtils";
import { toAbsoluteUrl } from "@/lib/imageUrl";

interface ArticleThumbnailProps {
  categoryIcon?: string;
  categoryColor?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  className?: string;
}

const ArticleThumbnail = ({ categoryIcon, categoryColor, imageUrl, videoUrl, className = "" }: ArticleThumbnailProps) => {
  const displayImage = (imageUrl ? toAbsoluteUrl(imageUrl) : null) || (videoUrl ? getYouTubeThumbnail(videoUrl) : null);

  if (displayImage) {
    return (
      <div className={`rounded-md overflow-hidden bg-muted flex items-center justify-center ${className}`}>
        <img src={displayImage} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  if (!categoryIcon || !categoryColor) return <div className={className} />;

  const IconComp = getIconByName(categoryIcon);

  return (
    <div
      className={`flex items-center justify-center rounded-md ${className}`}
      style={{ backgroundColor: `${categoryColor}18` }}
    >
      <IconComp size={28} style={{ color: categoryColor }} strokeWidth={1.5} />
    </div>
  );
};

export default ArticleThumbnail;
