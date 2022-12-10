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
    projectName: 'bigbluebutton-docs', // Usually your repo name.

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
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
            navbar: {
                title: 'BigBlueButton',
                logo: {
                    alt: 'BigBlueButton Logo',
                    src: 'img/logo.svg',
                },
                items: [
                    {to: '/teaching', label: 'Teaching', position: 'left'},
                    {to: '/development/guide', label: 'Development', position: 'left'},
                    {to: '/administration/install', label: 'Administration', position: 'left'},
                    {to: '/greenlight/overview', label: 'Greenlight', position: 'left'},
                    {to: '/new-features', label: 'New Features', position: 'left'},
                    {
                        href: 'https://github.com/bigbluebutton/bigbluebutton/docs',
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
                                label: 'Knowledge Base',
                                to: 'https://support.bigbluebutton.org/',
                            },
                            {
                                label: 'Tutorial Videos',
                                to: 'https://bigbluebutton.org/teachers/tutorials/',
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
                copyright: `Copyright © ${new Date().getFullYear()} BigBlueButton Inc., Inc. Built with Docusaurus.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
