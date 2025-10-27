interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'photo';
}

export default function ImageSkeleton({ 
  className = '', 
  aspectRatio = 'photo' 
}: ImageSkeletonProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]'
  };

  return (
    <div className={`${aspectClasses[aspectRatio]} bg-gray-200 skeleton rounded-lg ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-12 h-12 bg-gray-300 rounded-full skeleton"></div>
      </div>
    </div>
  );
}