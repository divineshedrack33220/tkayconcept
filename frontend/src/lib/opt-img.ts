export function optImg(url: string, w?: number, h?: number): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;
  const transforms = [
    w ? `w_${w}` : "w_800",
    h ? `h_${h}` : "",
    "c_fill",
    "f_auto",
    "q_auto",
  ]
    .filter(Boolean)
    .join(",");
  return `${parts[0]}/upload/${transforms}/${parts[1]}`;
}
