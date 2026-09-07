const categories = [
  { title: "Digital Art", text: "Printable artwork and illustration collections." },
  { title: "Worksheets", text: "Playful learning activities for children and families." },
  { title: "Paper Craft", text: "Cut, fold, build, and create printable projects." },
  { title: "Bundles", text: "Curated themed packs with more value in one download." },
];

export default function Home() {
  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top">Digital Arts</a>
        <nav aria-label="Primary navigation">
          <a href="#shop">Shop</a>
          <a href="#collections">Collections</a>
          <a href="#finder">Activity Finder</a>
          <a href="#freebies">Freebies</a>
        </nav>
      </header>

      <section className="hero shell" id="top">
        <p className="eyebrow">Digital products made to feel special</p>
        <h1>Little ideas.<br />Big imagination.</h1>
        <p className="lede">
          Discover thoughtful digital art, printables, and creative activities designed for beautiful everyday moments.
        </p>
        <div className="actions">
          <a className="button primary" href="#shop">Explore the shop</a>
          <a className="button secondary" href="#finder">Find an activity</a>
        </div>
        <div className="art-card" aria-label="Brand illustration placeholder">
          <span>✦</span>
          <strong>Woodland Stories</strong>
          <small>First collection concept</small>
        </div>
      </section>

      <section className="section shell" id="shop">
        <div className="section-heading">
          <p className="eyebrow">Shop by category</p>
          <h2>Start with what inspires you.</h2>
        </div>
        <div className="grid">
          {categories.map((category, index) => (
            <article className="category-card" key={category.title}>
              <span className="index">0{index + 1}</span>
              <h3>{category.title}</h3>
              <p>{category.text}</p>
              <a href="#collections">Explore →</a>
            </article>
          ))}
        </div>
      </section>

      <section className="feature shell" id="finder">
        <div>
          <p className="eyebrow">Activity Finder</p>
          <h2>Find the right printable without endless scrolling.</h2>
        </div>
        <div className="finder-card">
          <label>Age <span>4–5 years</span></label>
          <label>Skill <span>Creative Thinking</span></label>
          <label>Theme <span>Woodland Animals</span></label>
          <button type="button">Find activities</button>
        </div>
      </section>

      <section className="section shell" id="collections">
        <div className="collection-card">
          <p className="eyebrow">Featured collection</p>
          <h2>Woodland Storybook</h2>
          <p>A warm, hand-crafted visual world for printable art, activities, and learning adventures.</p>
          <a className="button secondary" href="#freebies">View collection</a>
        </div>
      </section>

      <section className="freebie shell" id="freebies">
        <div>
          <p className="eyebrow">Free printable</p>
          <h2>Try the world before you buy.</h2>
          <p>Use a focused freebie to introduce each collection and build a useful email funnel later.</p>
        </div>
        <a className="button primary" href="mailto:hello@example.com">Get the free sample</a>
      </section>

      <footer className="footer shell">
        <strong>Digital Arts</strong>
        <p>Brand website MVP • Etsy can remain a sales channel while this grows into an owned platform.</p>
      </footer>
    </main>
  );
}
