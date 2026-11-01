// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// The landing page is src/pages/index.astro; the docs live under /docs/ (src/content/docs/docs).
export default defineConfig({
  integrations: [
    starlight({
      title: 'Lagrange',
      description: 'Addresses for agents and people: an open-source A2A platform.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/three-agent-problem/lagrange' }],
      customCss: ['./src/styles/docs.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' } },
      ],
      sidebar: [
        { label: 'Start here', items: ['docs', 'docs/quickstart'] },
        {
          label: 'Concepts',
          items: ['docs/concepts/addresses', 'docs/concepts/tasks-and-runs', 'docs/concepts/people', 'docs/concepts/workspaces'],
        },
        { label: 'Guides', items: ['docs/guides/connect-an-agent', 'docs/guides/call-an-address', 'docs/guides/approvals', 'docs/guides/self-host'] },
        { label: 'Reference', items: ['docs/reference/api', 'docs/reference/configuration'] },
      ],
    }),
  ],
})
