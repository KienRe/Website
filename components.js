// Site Navigation Component
class SiteNav extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") || ""

    this.innerHTML = `
      <nav class="fixed top-0 right-0 p-8 z-50">
        <div class="flex gap-8">
          <a href="index.html" class="nav-link ${current === "portfolio" ? "active" : ""} font-medium">Portfolio</a>
          <a href="blog.html" class="nav-link ${current === "blog" ? "active" : ""} font-medium">Blog</a>
        </div>
      </nav>
    `
  }
}

// Page Header Component
class PageHeader extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || ""
    const subtitle = this.getAttribute("subtitle") || ""
    const backLink = this.getAttribute("back-link") || ""
    const backText = this.getAttribute("back-text") || "Back"

    this.innerHTML = `
      <header class="pt-32 pb-20 px-8">
        <div class="max-w-5xl mx-auto">
          ${
            backLink
              ? `
            <a href="${backLink}" class="accent-link inline-flex items-center gap-2 mb-8">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              ${backText}
            </a>
          `
              : ""
          }
          <h1 class="text-5xl md:text-6xl font-bold mb-6">${title}</h1>
          ${subtitle ? `<p class="text-xl text-muted">${subtitle}</p>` : ""}
        </div>
      </header>
    `
  }
}

// Blog Card Component
class BlogCard extends HTMLElement {
  connectedCallback() {
    const date = this.getAttribute("date") || ""
    const title = this.getAttribute("title") || ""
    const excerpt = this.getAttribute("excerpt") || ""
    const link = this.getAttribute("link") || "#"

    this.innerHTML = `
      <article class="blog-card rounded-lg p-8 mb-4">
        <div class="mb-3">
          <span class="text-sm text-muted">${date}</span>
        </div>
        <h2 class="text-3xl font-bold mb-4">
          <a href="${link}" class="hover:text-cyan-400 transition-colors">
            ${title}
          </a>
        </h2>
        <p class="text-muted mb-6">
          ${excerpt}
        </p>
        <a href="${link}" class="accent-link font-medium inline-flex items-center gap-2">
          Read article
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </article>
    `
  }
}

// Register all custom elements
customElements.define("site-nav", SiteNav)
customElements.define("page-header", PageHeader)
customElements.define("blog-card", BlogCard)
