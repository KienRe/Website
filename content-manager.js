const CONTENT = {
  blog: [
    {
      id: "reading-metadata",
      date: "2024-12-15",
      title: "Reading metadata specifiers in a packaged Unreal Build",
      excerpt: "One common challenge in Unreal Engine development is accessing metadata specifiers in a packaged build. This post walks through a robust solution using commandlets, runtime dependencies, and non-asset directories to export, package, and load metadata automatically.",
      tags: ["Unreal Engine", "C++", "Tooling"],
      link: "reading-metadata.html",
    },
    {
      id: "steam-upload-tool",
      date: "2024-12-20",
      title: "Building a quick one click deploy to Steam tool in Slate",
      excerpt: "Uploading builds to Steam typically involves running SteamCMD from the command line with various parameters. For teams working in Unreal Engine, having a custom editor tool that streamlines this process can save time and reduce errors.",
      tags: ["Unreal Engine", "Slate", "Steam", "Tooling"],
      link: "steam-upload-tool.html",
    }
  ],
  
  journal: [
    {
      id: "first-entry",
      date: "2025-01-15",
      title: "First Journal Entry",
      excerpt: "Welcome to my journal! Starting a new chapter...",
      content: `
        <p class="mb-6">Welcome to my journal! This is where I'll be sharing thoughts, updates, and reflections on my work and projects.</p>
        <h3 class="text-2xl font-bold mb-4">Getting Started</h3>
        <p class="mb-6">This journal will serve as a space for more personal reflections and shorter updates compared to the technical blog posts. I'm excited to share this journey with you.</p>
        <p class="mb-6">Feel free to check back regularly for new entries!</p>
      `,
    }
  ]
};

// Utility functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

const groupByYear = (items) => {
  const grouped = {};
  items.forEach(item => {
    const year = new Date(item.date).getFullYear();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(item);
  });
  return grouped;
};

// Blog rendering
function renderBlogPosts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  CONTENT.blog
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((post) => {
      const blogCard = document.createElement("blog-card");
      blogCard.setAttribute("date", formatDate(post.date));
      blogCard.setAttribute("title", post.title);
      blogCard.setAttribute("excerpt", post.excerpt);
      blogCard.setAttribute("link", post.link);
      if (post.tags) {
        blogCard.setAttribute("tags", post.tags.join(","));
      }
      container.appendChild(blogCard);
    });
}

// Journal rendering
function renderJournalArchive() {
  const archiveList = document.getElementById("journal-archive-list");
  if (!archiveList) return;

  const sortedEntries = [...CONTENT.journal].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sortedEntries.forEach((entry, index) => {
    const listItem = document.createElement("li");
    listItem.className = "mb-2";

    const link = document.createElement("a");
    link.href = `#${entry.id}`;
    link.className = `block py-2 px-3 rounded transition-colors ${
      index === 0
        ? "bg-cyan-900/30 text-cyan-400"
        : "text-muted hover:bg-slate-800 hover:text-cyan-400"
    }`;
    link.textContent = entry.title;
    link.onclick = (e) => {
      e.preventDefault();
      loadJournalEntry(entry.id);

      // Update active state
      document.querySelectorAll("#journal-archive-list a").forEach((a) => {
        a.className = "block py-2 px-3 rounded transition-colors text-muted hover:bg-slate-800 hover:text-cyan-400";
      });
      link.className = "block py-2 px-3 rounded transition-colors bg-cyan-900/30 text-cyan-400";
    };

    listItem.appendChild(link);
    archiveList.appendChild(listItem);
  });
}

function loadJournalEntry(entryId) {
  const entry = CONTENT.journal.find((e) => e.id === entryId);
  if (!entry) return;

  const contentArea = document.getElementById("journal-content");
  if (!contentArea) return;

  contentArea.innerHTML = `
    <article class="rounded-lg p-8 md:p-12" style="background-color: #1e293b; border: 1px solid #334155;">
      <div class="mb-6">
        <span class="text-sm text-muted">${formatDate(entry.date)}</span>
      </div>
      <h2 class="text-4xl font-bold mb-8">${entry.title}</h2>
      <div class="prose prose-invert max-w-none">
        ${entry.content}
      </div>
    </article>
  `;
}

// Auto-initialize based on page
document.addEventListener("DOMContentLoaded", () => {
  // Blog page
  if (document.getElementById("blog-posts-container")) {
    renderBlogPosts("blog-posts-container");
  }
  
  // Journal page
  if (document.getElementById("journal-archive-list")) {
    renderJournalArchive();
    if (CONTENT.journal.length > 0) {
      loadJournalEntry(CONTENT.journal[0].id);
    }
  }
});