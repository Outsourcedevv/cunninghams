// next/image drops basePath when images are unoptimized, so every src would 404 on a GitHub
// project site. A custom loader is the one place that applies to all of them, including any
// image added later. No resizing happens — the files in public/ are already sized webp.
export default function imageLoader({ src }: { src: string }): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
}
