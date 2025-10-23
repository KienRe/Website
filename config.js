const SITE_CONFIG = {
  // Personal info
  name: "René Kienauer",
  title: "Gameplay Programmer",
  location: "Vienna, Austria",
  
  // Contact & Social (for future use)
  social: {
    github: "",
    linkedin: "",
    email: ""
  },
  
  // Site settings
  postsPerPage: 10,
  dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
  
  // Theme colors (if you want to make them configurable)
  theme: {
    primary: "#0f172a",
    accent: "#22d3ee",
    text: "#e2e8f0",
    muted: "#94a3b8"
  },
  
  // SEO
  seo: {
    description: "Game developer from Austria specializing in Unreal Engine",
    keywords: ["game development", "unreal engine", "gameplay programming", "c++"],
    image: "/images/me.jpg"
  }
};

// Make config globally available
if (typeof window !== 'undefined') {
  window.SITE_CONFIG = SITE_CONFIG;
}