import React from "react";
import ImageUploading, { ImageType } from "react-images-uploading";
import styles from "./image-uploader.module.css";
import Image from "next/image";

interface ImageUploaderProps {
  onImageChange: (image: ImageType | null) => void;
  image: ImageType | null;
  inlinePicBoxStyles?: any;
}

export default function ImageUploader({
  onImageChange,
  image,
  inlinePicBoxStyles,
}: ImageUploaderProps) {
  const handleImageChange = (imageList: ImageType[]) => {
    const selectedImage = imageList[0] || null;
    onImageChange(selectedImage);
  };

  return (
    <ImageUploading
      multiple={false}
      value={image ? [image] : []}
      onChange={handleImageChange}
      dataURLKey="data_url"
    >
      {({ onImageUpload }) => (
        <div className={styles.wrapper}>
          <div className={styles.buttonImageBox} onClick={onImageUpload}>
            <div className={styles.imageParent}>
              <Image
                src="/assets/svgs/edit.svg"
                alt="icon"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>

          <div className={styles.imageItem}>
            <div className={styles.picBox} style={{ ...inlinePicBoxStyles }}>
              <Image
                src={image?.data_url || "/assets/images/demmyPic.png"}
                alt="Uploaded image"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>
      )}
    </ImageUploading>
  );
}
