// Site Navigation Component
class SiteNav extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") || "";

    this.innerHTML = `
      <nav class="fixed top-0 right-0 p-8 z-50" aria-label="Main navigation">
        <div class="flex gap-8">
          <a href="index.html" 
             class="nav-link ${current === "portfolio" ? "active" : ""} font-medium"
             ${current === "portfolio" ? 'aria-current="page"' : ''}>
            Portfolio
          </a>
          <a href="blog.html" 
             class="nav-link ${current === "blog" ? "active" : ""} font-medium"
             ${current === "blog" ? 'aria-current="page"' : ''}>
            Blog
          </a>
          <a href="journal.html" 
             class="nav-link ${current === "journal" ? "active" : ""} font-medium"
             ${current === "journal" ? 'aria-current="page"' : ''}>
            Journal
          </a>
        </div>
      </nav>
    `;
  }
}

// Page Header Component
class PageHeader extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const subtitle = this.getAttribute("subtitle") || "";
    const backLink = this.getAttribute("back-link") || "";
    const backText = this.getAttribute("back-text") || "Back";

    this.innerHTML = `
      <header class="pt-32 pb-20 px-8">
        <div class="max-w-5xl mx-auto">
          ${
            backLink
              ? `
            <a href="${backLink}" class="accent-link inline-flex items-center gap-2 mb-8" aria-label="${backText}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
    `;
  }
}

// Enhanced Blog Card Component with tags
class BlogCard extends HTMLElement {
  connectedCallback() {
    const date = this.getAttribute("date") || "";
    const title = this.getAttribute("title") || "";
    const excerpt = this.getAttribute("excerpt") || "";
    const link = this.getAttribute("link") || "#";
    const tags = this.getAttribute("tags")?.split(",") || [];

    this.innerHTML = `
      <article class="blog-card rounded-lg p-8 mb-4">
        <div class="mb-3 flex items-center justify-between">
          <time datetime="${date}" class="text-sm text-muted">${date}</time>
          ${tags.length > 0 ? `
            <div class="flex gap-2 flex-wrap">
              ${tags.map(tag => `
                <span class="text-xs px-2 py-1 rounded" style="background-color: #334155; color: #94a3b8;">
                  ${tag.trim()}
                </span>
              `).join('')}
            </div>
          ` : ''}
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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </article>
    `;
  }
}

// Loading State Component
class LoadingSpinner extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="flex justify-center items-center p-8" role="status" aria-live="polite">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        <span class="sr-only">Loading...</span>
      </div>
    `;
  }
}

// Register all custom elements
customElements.define("site-nav", SiteNav);
customElements.define("page-header", PageHeader);
customElements.define("blog-card", BlogCard);
customElements.define("loading-spinner", LoadingSpinner);