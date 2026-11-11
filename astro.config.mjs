// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// The landing page is src/pages/index.astro; the docs live under /docs/ (src/content/docs/docs).
// It's served from GitHub Pages at <SITE_URL><BASE_PATH>, on the custom domain lagrange.3agents.dev (public/CNAME). For the old project URL, set SITE_URL=https://three-agent-problem.github.io BASE_PATH=/site.
const site = process.env.SITE_URL ?? 'https://lagrange.3agents.dev'
const base = process.env.BASE_PATH ?? '/'

// withBase prefixes root-relative links in the docs (/docs/quickstart/) with the base path,
// in Markdown links and in MDX components' href props.
function withBase(base) {
  const prefix = base.replace(/\/$/, '')
  const fix = (v) => (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(prefix + '/') ? prefix + v : v)
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && node.properties) node.properties.href = fix(node.properties.href)
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      for (const attr of node.attributes ?? []) if (attr.name === 'href') attr.value = fix(attr.value)
    }
    node.children?.forEach(walk)
  }
  return () => walk
}

export default defineConfig({
  site,
  base,
  markdown: { rehypePlugins: [withBase(base)] },
  integrations: [
    starlight({
      title: 'Lagrange',
      description: 'Addresses for agents and people: an open-source A2A platform.',
      logo: { light: './src/assets/logo-light.svg', dark: './src/assets/logo-dark.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/three-agent-problem/lagrange' }],
      customCss: ['./src/styles/docs.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap' } },
      ],
      sidebar: [
        { label: 'Start here', items: ['docs', 'docs/quickstart', 'docs/tour'] },
        {
          label: 'Concepts',
          items: ['docs/concepts/addresses', 'docs/concepts/tasks-and-runs', 'docs/concepts/people', 'docs/concepts/workspaces'],
        },
        { label: 'Guides', items: ['docs/guides/connect-an-agent', 'docs/guides/call-an-address', 'docs/guides/mcp', 'docs/guides/webhooks', 'docs/guides/telegram', 'docs/guides/approvals', 'docs/guides/self-host'] },
        { label: 'Reference', items: ['docs/reference/cli', 'docs/reference/api', 'docs/reference/configuration'] },
      ],
    }),
  ],
})
