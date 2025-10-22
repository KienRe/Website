// Blog post data - add new posts here to automatically show them on the blog page
const BLOG_POSTS = [
  {
    id: "reading-metadata",
    date: "December 2024",
    title: "Reading metadata specifiers in a packaged Unreal Build",
    excerpt:
      "One common challenge in Unreal Engine development is accessing metadata specifiers in a packaged build. This post walks through a robust solution using commandlets, runtime dependencies, and non-asset directories to export, package, and load metadata automatically.",
    link: "reading-metadata.html",
  },
  {
    id: "steam-upload-tool",
    date: "December 2025",
    title: "Building a quick one click deploy to Steam tool in Slate",
    excerpt:
      "Uploading builds to Steam typically involves running SteamCMD from the command line with various parameters. For teams working in Unreal Engine, having a custom editor toothat streamlines this process can save time and reduce errors.",
    link: "steam-upload-tool.html",
  }
  // Add more blog posts here:
  // {
  //   id: 'my-new-post',
  //   date: 'January 2025',
  //   title: 'My New Blog Post',
  //   excerpt: 'A brief description of the post...',
  //   link: 'my-new-post.html'
  // }
]

// Function to render all blog posts
function renderBlogPosts(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  BLOG_POSTS.forEach((post) => {
    const blogCard = document.createElement("blog-card")
    blogCard.setAttribute("date", post.date)
    blogCard.setAttribute("title", post.title)
    blogCard.setAttribute("excerpt", post.excerpt)
    blogCard.setAttribute("link", post.link)
    container.appendChild(blogCard)
  })
}

renderBlogPosts('blog-posts-container');