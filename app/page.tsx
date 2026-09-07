const collections = [
  { title: "Woodland Tales", note: "Soft forest stories for little dreamers.", tone: "sage" },
  { title: "Moonlight Friends", note: "Gentle bedtime artwork with a quiet glow.", tone: "moon" },
  { title: "Little Garden", note: "Tiny blooms, curious creatures, and sunny days.", tone: "peach" },
];

const prints = [
  { title: "Forest Rabbit", meta: "Printable Art · A4 / US Letter", tone: "sage" },
  { title: "Night Fox", meta: "Printable Art · A4 / US Letter", tone: "moon" },
  { title: "Garden Bear", meta: "Printable Art · A4 / US Letter", tone: "butter" },
  { title: "Tiny Deer", meta: "Printable Art · A4 / US Letter", tone: "peach" },
];

export default function Home() {
  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Digital Arts home">
          Digital Arts
        </a>
        <nav aria-label="Primary navigation">
          <a href="#collections">Collections</a>
          <a href="#prints">Art Prints</a>
          <a href="#activities">Printables</a>
          <a href="#freebie">Free Story Page</a>
        </nav>
        <a className="nav-shop" href="#prints">Shop</a>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Illustrated digital goods for little worlds</p>
          <h1>Little worlds,<br />made to keep.</h1>
          <p className="lede">
            Storybook-inspired art, printable activities, and gentle collections created to bring imagination into everyday spaces.
          </p>
          <div className="actions">
            <a className="button primary" href="#collections">Explore the stories</a>
            <a className="text-link" href="#prints">Shop art prints <span>→</span></a>
          </div>
        </div>

        <div className="hero-art" aria-label="Featured woodland artwork placeholder">
          <div className="sun" />
          <div className="hill hill-one" />
          <div className="hill hill-two" />
          <div className="tree tree-one" />
          <div className="tree tree-two" />
          <div className="character-mark">DA</div>
          <div className="art-caption">
            <span>Featured story</span>
            <strong>Woodland Tales</strong>
          </div>
        </div>
      </section>

      <section className="story-section shell" id="collections">
        <div className="section-intro">
          <p className="eyebrow">Our little collections</p>
          <h2>Every artwork belongs to a story.</h2>
          <p>Explore visual worlds designed as cohesive collections, not isolated pieces.</p>
        </div>

        <div className="story-grid">
          {collections.map((collection, index) => (
            <article className={`story-card ${collection.tone}`} key={collection.title}>
              <div className="story-art">
                <span className="story-number">0{index + 1}</span>
                <div className="story-orbit" />
                <div className="story-land" />
              </div>
              <div className="story-copy">
                <h3>{collection.title}</h3>
                <p>{collection.note}</p>
                <a href="#prints">View the collection <span>→</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shop-story shell" id="activities">
        <div className="shop-story-copy">
          <p className="eyebrow">Shop the story</p>
          <h2>One world.<br />More ways to enjoy it.</h2>
        </div>
        <div className="journey">
          <article><span>01</span><strong>Art Print</strong><p>Frame the story for a bedroom, nursery, or creative corner.</p></article>
          <article><span>02</span><strong>Printable Play</strong><p>Turn the same characters into simple activities and quiet-time play.</p></article>
          <article><span>03</span><strong>Story Bundle</strong><p>Collect matching artwork and printables in one cohesive little world.</p></article>
        </div>
      </section>

      <section className="prints-section shell" id="prints">
        <div className="section-row">
          <div>
            <p className="eyebrow">Featured art prints</p>
            <h2>Made for the wall.<br />Built around the artwork.</h2>
          </div>
          <a className="text-link" href="#prints">View all prints <span>→</span></a>
        </div>

        <div className="prints-grid">
          {prints.map((print) => (
            <article className="print-card" key={print.title}>
              <div className={`print-art ${print.tone}`}>
                <div className="print-moon" />
                <div className="print-ground" />
                <span className="print-signature">Digital Arts</span>
              </div>
              <div className="print-info">
                <div>
                  <h3>{print.title}</h3>
                  <p>{print.meta}</p>
                </div>
                <span className="print-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="freebie shell" id="freebie">
        <div className="freebie-art">
          <div className="freebie-page">01</div>
          <div className="freebie-page page-two">02</div>
        </div>
        <div className="freebie-copy">
          <p className="eyebrow">A little gift from the story</p>
          <h2>Start with a free story page.</h2>
          <p>Meet the visual world before you buy. This area will later connect to the email funnel and downloadable sample.</p>
          <a className="button primary" href="mailto:hello@example.com">Get the free page</a>
        </div>
      </section>

      <footer className="footer shell">
        <div>
          <strong>Digital Arts</strong>
          <p>Small illustrated worlds for print, play, and imagination.</p>
        </div>
        <div className="footer-links">
          <a href="#collections">Collections</a>
          <a href="#prints">Art Prints</a>
          <a href="#activities">Printables</a>
        </div>
      </footer>
    </main>
  );
}
