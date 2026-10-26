import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Denkweise",
    short_name: "Denkweise",
    description: "Jeden Tag eine philosophische Frage. Sokrates hakt nach, und du erfährst, wie du denkst.",
    lang: "de",
    start_url: "/",
    display: "standalone",
    background_color: "#141b24",
    theme_color: "#141b24",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
