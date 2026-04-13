export const imageUrl = (url: string) => {
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    return url;
  } else {
    return "/assets/images/static/demmyPic.png";
  }
};
