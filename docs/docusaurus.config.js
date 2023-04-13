// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'BigBlueButton',
    tagline: 'Official Documentation',
    url: 'https://docs.bigbluebutton.org/',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'bigbluebutton', // Usually your GitHub org/user name.
    projectName: 'bigbluebutton', // Usually your repo name.

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    routeBasePath: "/",
                    sidebarPath: require.resolve('./sidebars.js'),
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    plugins: [require.resolve("@cmfcmf/docusaurus-search-local")],

    themeConfig:

    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            tableOfContents: {
                minHeadingLevel: 2,
                maxHeadingLevel: 4,
            },
            navbar: {
                title: 'BigBlueButton',
                logo: {
                    alt: 'BigBlueButton Logo',
                    src: 'img/logo.svg',
                },
                items: [
                    {to: 'https://bigbluebutton.org/teachers/tutorials/', label: 'Teaching', position: 'left'},
                    {to: '/development/guide', label: 'Development', position: 'left'},
                    {to: '/administration/install', label: 'Administration', position: 'left'},
                    {to: '/greenlight/v3/install', label: 'Greenlight', position: 'left'},
                    {to: '/new-features', label: 'New Features', position: 'left'},
                    {
                        type: 'docsVersionDropdown',
                        position: 'right',
                        dropdownActiveClassDisabled: true,
                    },
                    {
                        href: 'https://github.com/bigbluebutton/bigbluebutton/tree/v2.6.x-release/docs',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'BigBlueButton',
                        items: [
                            {
                                label: 'Release notes',
                                href: '/release-notes',
                            },
                            {
                                label: 'Github',
                                href: 'https://github.com/bigbluebutton',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Setup Forums',
                                href: 'https://groups.google.com/forum/#!forum/bigbluebutton-setup',
                            },
                            {
                                label: 'Users Forums',
                                href: 'https://groups.google.com/forum/#!forum/bigbluebutton-users',
                            },
                            {
                                label: 'Developers Forums',
                                href: 'https://groups.google.com/forum/#!forum/bigbluebutton-dev',
                            },
                        ],
                    },
                    {
                        title: 'Support',
                        items: [
                            {
                                label: 'Road Map',
                                to: '/support/road-map',
                            },
                            {
                                label: 'FAQ',
                                to: '/support/faq',
                            },
                            {
                                label: 'Getting help',
                                to: '/support/getting-help',
                            },
                            {
                                label: 'Troubleshooting',
                                to: '/support/troubleshooting',
                            },
                        ],
                    },
                    {
                        title: 'Resources',
                        items: [
                            {
                                label: 'Knowledge Base',
                                href: 'https://support.bigbluebutton.org/',
                            },
                            {
                                label: 'Tutorial Videos',
                                href: 'https://bigbluebutton.org/teachers/tutorials/',
                            },
                        ],
                    },
                    {
                        title: 'Social',
                        items: [
                            {
                                label: 'Facebook',
                                href: 'https://www.facebook.com/bigbluebutton',
                            },
                            {
                                label: 'Twitter',
                                href: 'https://twitter.com/bigbluebutton',
                            },
                            {
                                label: 'Youtube',
                                href: 'https://www.youtube.com/channel/UCYj1_2Q3HTWCAImvI6eZ0SA',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} BigBlueButton Inc., Built with Docusaurus.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
