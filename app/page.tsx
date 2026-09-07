import { artwork } from "./artwork";
import { catalogLastSynced, products } from "./catalog";

const storyPieces = [
  { title: "Morning Rabbit", note: "A quiet creek, wildflowers and a little courage.", image: artwork.rabbit, className: "morning" },
  { title: "Forest Fox", note: "Golden light, mossy stones and a curious companion.", image: artwork.fox, className: "forest" },
  { title: "Moonlit Owl", note: "A calm night story lit by moonlight and fireflies.", image: artwork.owl, className: "night" },
];

const productImages = {
  rabbit: artwork.rabbit,
  fox: artwork.fox,
  owl: artwork.owl,
};

export default function Home() {
  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Digital Arts home">Digital Arts</a>
        <nav aria-label="Primary navigation">
          <a href="#story">Collection 01</a>
          <a href="#shop">Ready Printables</a>
          <a href="#about">About the World</a>
        </nav>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">The first story collection</p>
          <h1>Small wonders<br />live in the woods.</h1>
          <p className="lede">
            Woodland Storybook brings one illustrated world across art, learning activities, and quiet-time printables — with the artwork always leading the experience.
          </p>
          <div className="actions">
            <a className="button primary" href="#story">Enter the story</a>
            <a className="button secondary" href="#shop">Explore ready printables</a>
          </div>
          <p className="sync-note">Collection 01 · Artwork synced from the approved Drive library</p>
        </div>

        <figure className="hero-art">
          <img src={artwork.hero} alt="Rabbit, fox and owl exploring a warm woodland storybook scene" />
          <figcaption>Woodland Storybook · Collection 01</figcaption>
        </figure>
      </section>

      <section className="section shell" id="story">
        <div className="section-heading">
          <p className="eyebrow">Meet the little world</p>
          <h2>One collection, three gentle characters.</h2>
          <p className="lede">Each piece belongs to the same visual world, so the shop feels like a story rather than a shelf of unrelated files.</p>
        </div>

        <div className="story-grid">
          {storyPieces.map((piece) => (
            <article className={`story-card ${piece.className}`} key={piece.title}>
              <img src={piece.image} alt={`${piece.title} artwork from Woodland Storybook`} />
              <div className="story-copy">
                <h3>{piece.title}</h3>
                <p>{piece.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">From the production library</p>
            <h2>Ready printables from the same woodland world.</h2>
            <p className="lede">Only products marked COMPLETE with final QA PASS in the production File Index are surfaced here.</p>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={productImages[product.image]} alt={`${product.title} woodland artwork preview`} />
                </div>
                <div className="product-body">
                  <div className="product-status"><span>{product.id}</span><span>{product.status}</span></div>
                  <h3>{product.title}</h3>
                  <p className="product-meta">{product.meta}</p>
                  <p>{product.detail}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="catalog-note">Catalog source: Etsy Digital Product — File Index · Last synced {catalogLastSynced}</p>
        </div>
      </section>

      <section className="story-strip shell" id="about">
        <img src={artwork.hero} alt="Woodland Storybook collection overview" />
        <div>
          <p className="eyebrow">Artwork-first by design</p>
          <h2>One visual world, many printable stories.</h2>
          <p>Original full-resolution artwork stays in Google Drive as the source of truth. The website uses lightweight mirrored previews for fast delivery while the Sheet keeps product status and traceability.</p>
        </div>
      </section>

      <section className="freebie shell">
        <div>
          <p className="eyebrow">More stories are growing</p>
          <h2>Start with what is production-ready.</h2>
          <p>New artwork and products can enter the website only after they are stored in Drive and pass the catalog gate in the File Index.</p>
        </div>
        <a className="button primary" href="#shop">Explore ready printables</a>
      </section>

      <footer className="footer shell">
        <strong>Digital Arts</strong>
        <p>Original artwork lives in Drive. Approved catalog status is mirrored from the production File Index into this website.</p>
      </footer>
    </main>
  );
}
