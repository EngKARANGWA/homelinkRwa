import Image from "next/image";

export function BuildingIllustration() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl bg-navy">
      <Image
        src="/images/animhouse.webp"
        alt="Modern managed property at dusk"
        fill
        unoptimized
        preload
        className="object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
    </div>
  );
}
