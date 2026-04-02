import React from "react";
import { Helmet } from "react-helmet-async";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://credlocity-unified-new.onrender.com";

const portals = [
  {
    name: "Admin / CMS Dashboard",
    description: "Internal backend management — content, clients, team, billing, collections, and all admin operations.",
    path: "/admin/login",
    icon: "🔐",
    color: "from-purple-600 to-indigo-700",
  },
  {
    name: "Attorney Portal",
    description: "Attorney network login — case marketplace, bidding, case management, payments, and reviews.",
    path: "/attorney/login",
    icon: "⚖️",
    color: "from-blue-600 to-cyan-700",
  },
  {
    name: "Company Portal",
    description: "Credit repair company login — outsourcing partners who use Credlocity's platform for their clients.",
    path: "/company/login",
    icon: "🏢",
    color: "from-emerald-600 to-teal-700",
  },
  {
    name: "Outsourcing Partner Portal",
    description: "Partner login — outsourcing clients with dedicated dashboards, tickets, work logs, and invoices.",
    path: "/partner/login",
    icon: "🤝",
    color: "from-orange-600 to-amber-700",
  },
  {
    name: "Attorney Signup",
    description: "Public application form for attorneys to join the Credlocity attorney network.",
    path: "/attorney/signup",
    icon: "📋",
    color: "from-slate-600 to-gray-700",
  },
  {
    name: "Company Signup",
    description: "Registration for credit repair companies interested in outsourcing through Credlocity.",
    path: "/company/signup",
    icon: "✍️",
    color: "from-rose-600 to-pink-700",
  },
];

const quickLinks = [
  { name: "Backend API Health", url: `${BACKEND_URL}/api/health`, icon: "💚" },
  { name: "Backend API Docs", url: `${BACKEND_URL}/docs`, icon: "📖" },
  { name: "Vercel Dashboard", url: "https://vercel.com", icon: "▲" },
  { name: "Render Dashboard", url: "https://dashboard.render.com", icon: "🚀" },
  { name: "MongoDB Atlas", url: "https://cloud.mongodb.com", icon: "🍃" },
  { name: "GitHub Repo", url: "https://github.com/Jvazquez215/credlocity-unified", icon: "🐙" },
];

export default function PortalLinks() {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Portal Access — Credlocity (Internal)</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔑</span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Credlocity Portal Access</h1>
                <p className="text-gray-400 text-sm mt-0.5">Internal links — not indexed by search engines</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Portal Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {portals.map((portal) => (
              <a
                key={portal.path}
                href={portal.path}
                className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 p-6 transition-all hover:border-gray-600 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${portal.color}`} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{portal.icon}</span>
                    <h2 className="text-lg font-semibold">{portal.name}</h2>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{portal.description}</p>
                  <div className="mt-4 text-xs text-gray-500 font-mono">
                    credlocity.com{portal.path}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-12">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-sm text-gray-300 hover:text-white hover:border-gray-600 hover:bg-gray-800 transition-all"
                >
                  <span>{link.icon}</span>
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-6 border-t border-gray-800 text-center text-gray-600 text-xs">
            This page is hidden from search engines and the public sitemap.
            <br />
            Bookmark it for easy access.
          </div>
        </div>
      </div>
    </>
  );
}
