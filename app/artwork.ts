import hero1 from "./artwork-data/hero-1";
import hero2 from "./artwork-data/hero-2";
import hero3 from "./artwork-data/hero-3";
import hero4 from "./artwork-data/hero-4";
import rabbit1 from "./artwork-data/rabbit-1";
import rabbit2 from "./artwork-data/rabbit-2";
import rabbit3 from "./artwork-data/rabbit-3";
import fox1 from "./artwork-data/fox-1";
import fox2 from "./artwork-data/fox-2";
import owl1 from "./artwork-data/owl-1";
import owl2 from "./artwork-data/owl-2";
import owl3 from "./artwork-data/owl-3";

const webp = (data: string) => `data:image/webp;base64,${data}`;

export const artwork = {
  hero: webp(hero1 + hero2 + hero3 + hero4),
  rabbit: webp(rabbit1 + rabbit2 + rabbit3),
  fox: webp(fox1 + fox2),
  owl: webp(owl1 + owl2 + owl3),
};
