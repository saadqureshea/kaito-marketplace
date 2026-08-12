/**
 * Populates an empty KAITO MarketPlace database with demo accounts and a
 * wider catalog of approved listings (with placeholder images via
 * picsum.photos, since nothing needs to be uploaded manually) so the
 * marketplace isn't blank on a fresh install.
 *
 * Idempotent - skips users/listings that already exist by email or
 * title+owner, but backfills `images` on existing listings that don't
 * have any yet, so re-running after this update still adds pictures to
 * whatever an earlier `npm run seed` already created.
 *
 * Usage: npm run seed
 */
import connectDB from "../config/db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Job from "../models/Job.js";

const DEMO_PASSWORD = "Kaito123!";

const pic = (seed, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const users = [
  { name: "Ava Admin", email: "admin@kaito.dev", role: "admin" },
  {
    name: "Nova Studio",
    email: "seller@kaito.dev",
    role: "seller",
    sellerProfile: {
      storeName: "Nova Studio",
      storeDescription: "Design templates and made-to-order goods.",
      payoutEmail: "seller-sandbox@business.example.com",
      isVerifiedSeller: true,
    },
  },
  {
    name: "Aurora Loom",
    email: "seller2@kaito.dev",
    role: "seller",
    sellerProfile: {
      storeName: "Aurora Loom",
      storeDescription: "Dev services and handmade textiles.",
      payoutEmail: "aurora-sandbox@business.example.com",
      isVerifiedSeller: true,
    },
  },
  { name: "Beau Buyer", email: "buyer@kaito.dev", role: "buyer" },
  {
    name: "Wren Worker",
    email: "worker@kaito.dev",
    role: "worker",
    professionalProfile: {
      headline: "Full-Stack Developer",
      skills: ["React", "Node.js", "MongoDB"],
      hourlyRate: 45,
      portfolioUrl: "https://example.com/wren",
      yearsExperience: 4,
      approvalStatus: "approved",
    },
  },
  { name: "Emery Employer", email: "employer@kaito.dev", role: "employer" },

  // Extra approved workers so the talent directory has something to browse.
  {
    name: "Rafi Ahmed",
    email: "rafi@kaito.dev",
    role: "worker",
    country: "Pakistan",
    bio: "Backend engineer focused on APIs, payments and data pipelines.",
    professionalProfile: {
      headline: "Backend & API Engineer",
      skills: ["Node.js", "PostgreSQL", "AWS", "Stripe"],
      hourlyRate: 38,
      portfolioUrl: "https://example.com/rafi",
      yearsExperience: 6,
      approvalStatus: "approved",
    },
  },
  {
    name: "Mina Park",
    email: "mina@kaito.dev",
    role: "worker",
    country: "South Korea",
    bio: "Product designer working across research, UI systems and prototyping.",
    professionalProfile: {
      headline: "Product & UI/UX Designer",
      skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
      hourlyRate: 52,
      portfolioUrl: "https://example.com/mina",
      yearsExperience: 8,
      approvalStatus: "approved",
    },
  },
  {
    name: "Tomas Silva",
    email: "tomas@kaito.dev",
    role: "worker",
    country: "Portugal",
    bio: "Motion designer and video editor for short-form and product launches.",
    professionalProfile: {
      headline: "Video Editor & Motion Designer",
      skills: ["After Effects", "Premiere Pro", "Motion Graphics"],
      hourlyRate: 29,
      portfolioUrl: "https://example.com/tomas",
      yearsExperience: 4,
      approvalStatus: "approved",
    },
  },
  {
    name: "Aisha Bello",
    email: "aisha@kaito.dev",
    role: "worker",
    country: "Nigeria",
    bio: "Technical writer and content strategist for developer tools.",
    professionalProfile: {
      headline: "Technical Writer & Content Strategist",
      skills: ["Technical Writing", "SEO", "Documentation", "Content Strategy"],
      hourlyRate: 33,
      portfolioUrl: "https://example.com/aisha",
      yearsExperience: 5,
      approvalStatus: "approved",
    },
  },
  {
    name: "Lucas Meyer",
    email: "lucas@kaito.dev",
    role: "worker",
    country: "Germany",
    bio: "AI engineer building retrieval systems and automation workflows.",
    professionalProfile: {
      headline: "AI & Automation Engineer",
      skills: ["Python", "LangChain", "RAG", "Node.js"],
      hourlyRate: 65,
      portfolioUrl: "https://example.com/lucas",
      yearsExperience: 7,
      approvalStatus: "approved",
    },
  },
];

async function seedUsers() {
  const created = {};
  for (const u of users) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({ ...u, password: DEMO_PASSWORD });
      console.log(`Created user: ${u.email} (${u.role})`);
    }
    // seller/seller2 both map to "seller" key - keep the first, expose the
    // second under its own key for clarity below
    if (u.email === "seller2@kaito.dev") created.seller2 = user;
    else created[u.role] = user;
  }
  return created;
}

function productCatalog(novaId, auroraId) {
  return [
    {
      seller: novaId,
      title: "Minimalist Notion Dashboard Template",
      description:
        "A clean, ready-to-use Notion dashboard for tracking projects, habits, and goals. Instant download.",
      listingType: "digital",
      category: "Templates",
      tags: ["notion", "productivity", "template"],
      price: 19,
      images: [pic("kaito-notion-1"), pic("kaito-notion-2")],
      status: "approved",
      rating: 4.8,
      numReviews: 64,
      totalSold: 210,
    },
    {
      seller: novaId,
      title: "Custom Embroidered Denim Jacket",
      description: "Hand-embroidered denim jacket, made to order with your choice of size and thread color.",
      listingType: "made_to_order",
      category: "Handmade",
      tags: ["fashion", "handmade", "custom"],
      price: 89,
      images: [pic("kaito-jacket-1"), pic("kaito-jacket-2")],
      productionDetails: {
        leadTimeDays: 10,
        manufacturer: "Nova Studio Atelier",
        customizationOptions: ["Size", "Thread Color"],
      },
      status: "approved",
      rating: 4.9,
      numReviews: 38,
      totalSold: 72,
    },
    {
      seller: novaId,
      title: "Modern Portfolio Website Icon Pack",
      description: "120 hand-crafted SVG icons for portfolios, dashboards, and landing pages. Instant download.",
      listingType: "digital",
      category: "Graphics",
      tags: ["icons", "svg", "design"],
      price: 12,
      images: [pic("kaito-icons-1")],
      status: "approved",
      rating: 4.6,
      numReviews: 21,
      totalSold: 44,
    },
    {
      seller: novaId,
      title: "React + Tailwind Admin Starter Kit",
      description: "A production-ready React/Tailwind admin dashboard starter with auth screens and charts.",
      listingType: "digital",
      category: "Code",
      tags: ["react", "tailwind", "starter kit"],
      price: 39,
      images: [pic("kaito-admin-kit-1"), pic("kaito-admin-kit-2")],
      status: "approved",
      rating: 4.9,
      numReviews: 112,
      totalSold: 389,
    },
    {
      seller: auroraId,
      title: "Hand-Thrown Ceramic Mug Set",
      description: "Set of two hand-thrown ceramic mugs, made to order in your choice of glaze color.",
      listingType: "made_to_order",
      category: "Handmade",
      tags: ["ceramics", "handmade", "home"],
      price: 54,
      images: [pic("kaito-mugs-1"), pic("kaito-mugs-2")],
      productionDetails: {
        leadTimeDays: 14,
        manufacturer: "Aurora Loom Studio",
        customizationOptions: ["Glaze Color"],
      },
      status: "approved",
      rating: 4.7,
      numReviews: 29,
      totalSold: 53,
    },
    {
      seller: auroraId,
      title: "Freelancer Invoice & Budget E-book",
      description: "A 40-page e-book with templates for invoicing, budgeting, and tax prep as a freelancer.",
      listingType: "digital",
      category: "E-books",
      tags: ["ebook", "freelance", "finance"],
      price: 9,
      images: [pic("kaito-ebook-1")],
      status: "approved",
      rating: 4.4,
      numReviews: 17,
      totalSold: 31,
    },
    {
      seller: novaId,
      title: "Mobile App UI Kit — 60 Screens",
      description: "A complete Figma UI kit with 60 ready-made mobile screens, components, and a design system.",
      listingType: "digital",
      category: "Templates",
      tags: ["figma", "ui kit", "mobile"],
      price: 45,
      images: [pic("kaito-uikit-1"), pic("kaito-uikit-2")],
      status: "approved",
      rating: 4.9,
      numReviews: 86,
      totalSold: 174,
    },
    {
      seller: novaId,
      title: "Python Web Scraper Toolkit",
      description: "Production-ready scraping scripts with proxy rotation, rate limiting, and CSV/JSON export.",
      listingType: "digital",
      category: "Code",
      tags: ["python", "automation", "scraping"],
      price: 29,
      images: [pic("kaito-scraper-1")],
      status: "approved",
      rating: 4.5,
      numReviews: 41,
      totalSold: 96,
    },
    {
      seller: auroraId,
      title: "Hand-Poured Soy Candle Trio",
      description: "Three hand-poured soy candles made to order in your choice of scent and vessel colour.",
      listingType: "made_to_order",
      category: "Handmade",
      tags: ["candles", "handmade", "home"],
      price: 38,
      images: [pic("kaito-candles-1"), pic("kaito-candles-2")],
      productionDetails: {
        leadTimeDays: 7,
        manufacturer: "Aurora Loom Studio",
        customizationOptions: ["Scent", "Vessel Colour"],
      },
      status: "approved",
      rating: 4.8,
      numReviews: 52,
      totalSold: 118,
    },
    {
      seller: auroraId,
      title: "Custom Hand-Stitched Leather Wallet",
      description: "Full-grain leather wallet, hand-stitched to order with optional initials embossing.",
      listingType: "made_to_order",
      category: "Handmade",
      tags: ["leather", "accessories", "custom"],
      price: 72,
      images: [pic("kaito-wallet-1")],
      productionDetails: {
        leadTimeDays: 12,
        manufacturer: "Aurora Loom Studio",
        customizationOptions: ["Leather Colour", "Initials"],
      },
      status: "approved",
      rating: 4.9,
      numReviews: 67,
      totalSold: 143,
    },
    {
      seller: novaId,
      title: "Social Media Template Pack — 90 Posts",
      description: "Editable Canva and Figma templates for Instagram, LinkedIn, and X, in light and dark styles.",
      listingType: "digital",
      category: "Graphics",
      tags: ["social media", "canva", "templates"],
      price: 24,
      images: [pic("kaito-social-1"), pic("kaito-social-2")],
      status: "approved",
      rating: 4.7,
      numReviews: 93,
      totalSold: 265,
    },
    {
      seller: auroraId,
      title: "Hand-Embroidered Linen Tote",
      description: "Natural linen tote bag, embroidered to order with your choice of motif and thread colour.",
      listingType: "made_to_order",
      category: "Handmade",
      tags: ["embroidery", "bags", "custom"],
      price: 46,
      images: [pic("kaito-tote-1")],
      productionDetails: {
        leadTimeDays: 9,
        manufacturer: "Aurora Loom Studio",
        customizationOptions: ["Motif", "Thread Colour"],
      },
      status: "approved",
      rating: 4.6,
      numReviews: 24,
      totalSold: 39,
    },
    {
      seller: novaId,
      title: "SaaS Pitch Deck Template",
      description: "An investor-ready pitch deck in Keynote, PowerPoint, and Google Slides, with guidance notes.",
      listingType: "digital",
      category: "Templates",
      tags: ["pitch deck", "startup", "presentation"],
      price: 34,
      images: [pic("kaito-deck-1")],
      status: "approved",
      rating: 4.8,
      numReviews: 58,
      totalSold: 127,
    },
    {
      seller: novaId,
      title: "Lightroom Presets — Urban Collection",
      description: "24 Lightroom presets tuned for street and architectural photography, desktop and mobile.",
      listingType: "digital",
      category: "Graphics",
      tags: ["lightroom", "photography", "presets"],
      price: 16,
      images: [pic("kaito-presets-1")],
      status: "approved",
      rating: 4.5,
      numReviews: 35,
      totalSold: 71,
    },
  ];
}

async function seedProducts(catalog) {
  for (const item of catalog) {
    const existing = await Product.findOne({ title: item.title, seller: item.seller });
    if (!existing) {
      await Product.create(item);
      console.log(`Created product: ${item.title}`);
      continue;
    }
    // Backfill demo fields that were added to this script after an earlier
    // run, without clobbering anything a real user has since changed.
    const patches = [];
    if (existing.images.length === 0 && item.images?.length) {
      existing.images = item.images;
      patches.push("images");
    }
    if (!existing.numReviews && item.numReviews) {
      existing.rating = item.rating;
      existing.numReviews = item.numReviews;
      patches.push("ratings");
    }
    if (!existing.totalSold && item.totalSold) {
      existing.totalSold = item.totalSold;
      patches.push("sales");
    }
    if (patches.length) {
      await existing.save();
      console.log(`Backfilled ${patches.join(" + ")} on: ${item.title}`);
    }
  }
}

function serviceCatalog(novaId, auroraId) {
  return [
    {
      seller: novaId,
      title: "Full-Stack Web App Development",
      description: "End-to-end web app development - React/Node, database design, and deployment.",
      category: "web_app_dev",
      tags: ["react", "node", "fullstack"],
      images: [pic("kaito-webdev-1"), pic("kaito-webdev-2")],
      status: "approved",
      rating: 4.9,
      numReviews: 47,
      totalOrders: 68,
      packages: [
        { name: "basic", title: "Landing page", description: "Single responsive page.", price: 299, deliveryDays: 7, revisions: 2 },
        { name: "standard", title: "Multi-page app", description: "Up to 5 pages with a database.", price: 599, deliveryDays: 14, revisions: 4 },
        { name: "premium", title: "Full platform", description: "Full-stack app with auth and admin panel.", price: 1299, deliveryDays: 21, revisions: 10 },
      ],
    },
    {
      seller: auroraId,
      title: "Brand Identity & UI/UX Design",
      description: "Logo, brand guidelines, and a full UI/UX design pass for your app or website.",
      category: "ui_ux_design",
      tags: ["branding", "ui", "ux"],
      images: [pic("kaito-uiux-1")],
      status: "approved",
      rating: 4.8,
      numReviews: 33,
      totalOrders: 41,
      packages: [
        { name: "basic", title: "Logo + palette", description: "Logo and color palette only.", price: 149, deliveryDays: 5, revisions: 2 },
        { name: "standard", title: "Brand kit", description: "Logo, palette, and style guide.", price: 349, deliveryDays: 10, revisions: 3 },
        { name: "premium", title: "Full UI/UX", description: "Brand kit plus full app UI/UX design.", price: 899, deliveryDays: 18, revisions: 5 },
      ],
    },
    {
      seller: auroraId,
      title: "Short-Form Video Editing",
      description: "Fast-turnaround editing for reels, shorts, and TikToks - cuts, captions, and pacing.",
      category: "video_editing",
      tags: ["video", "reels", "editing"],
      images: [pic("kaito-video-1")],
      status: "approved",
      rating: 4.7,
      numReviews: 58,
      totalOrders: 96,
      packages: [
        { name: "basic", title: "1 video (under 60s)", description: "Single short-form edit.", price: 45, deliveryDays: 2, revisions: 1 },
        { name: "standard", title: "5 videos", description: "Batch of 5 short-form edits.", price: 199, deliveryDays: 5, revisions: 2 },
        { name: "premium", title: "15 videos + captions", description: "Monthly batch with captions and pacing notes.", price: 549, deliveryDays: 10, revisions: 3 },
      ],
    },
  ];
}

async function seedServices(catalog) {
  for (const item of catalog) {
    const existing = await Service.findOne({ title: item.title, seller: item.seller });
    if (!existing) {
      await Service.create(item);
      console.log(`Created service: ${item.title}`);
      continue;
    }
    const patches = [];
    if (existing.images.length === 0 && item.images?.length) {
      existing.images = item.images;
      patches.push("images");
    }
    if (!existing.numReviews && item.numReviews) {
      existing.rating = item.rating;
      existing.numReviews = item.numReviews;
      patches.push("ratings");
    }
    if (!existing.totalOrders && item.totalOrders) {
      existing.totalOrders = item.totalOrders;
      patches.push("orders");
    }
    if (patches.length) {
      await existing.save();
      console.log(`Backfilled ${patches.join(" + ")} on: ${item.title}`);
    }
  }
}

function jobCatalog(employerId) {
  return [
    {
      employer: employerId,
      title: "Remote React Developer (Contract)",
      description: "Looking for a React/Node developer for a 3-month contract building an internal dashboard.",
      category: "Development",
      skillsRequired: ["React", "Node.js", "MongoDB"],
      employmentType: "contract",
      budgetType: "hourly",
      budgetMin: 35,
      budgetMax: 60,
      isRemote: true,
      location: "Remote",
      status: "open",
    },
    {
      employer: employerId,
      title: "Part-Time Social Media Manager",
      description: "Manage content calendar and posting across Instagram, TikTok, and X for a growing brand.",
      category: "Marketing",
      skillsRequired: ["Social Media", "Content Strategy", "Copywriting"],
      employmentType: "part_time",
      budgetType: "hourly",
      budgetMin: 20,
      budgetMax: 30,
      isRemote: true,
      location: "Remote",
      status: "open",
    },
    {
      employer: employerId,
      title: "UI/UX Designer for Mobile App Redesign",
      description: "Fixed-scope project to redesign our mobile app's onboarding and checkout flows.",
      category: "Design",
      skillsRequired: ["Figma", "Mobile UX", "Prototyping"],
      employmentType: "freelance_project",
      budgetType: "fixed",
      budgetMin: 1500,
      budgetMax: 3000,
      isRemote: true,
      location: "Remote",
      status: "open",
    },
  ];
}

async function seedJobs(catalog) {
  for (const item of catalog) {
    const exists = await Job.findOne({ title: item.title, employer: item.employer });
    if (!exists) {
      await Job.create(item);
      console.log(`Created job: ${item.title}`);
    }
  }
}

async function run() {
  await connectDB();
  const { seller, seller2, employer } = await seedUsers();
  await seedProducts(productCatalog(seller._id, seller2._id));
  await seedServices(serviceCatalog(seller._id, seller2._id));
  await seedJobs(jobCatalog(employer._id));
  console.log(`\nDone. Demo accounts use password: ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
