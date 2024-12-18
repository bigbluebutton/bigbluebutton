// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'BigBlueButton',
    tagline: 'Official Documentation',
    url: 'https://docs.bigbluebutton.org/',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    trailingSlash: true,

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

    scripts: [
        // Cookie consent control required for GDPR. Token is not required to be renewed. Update hN querystring to match domain.
        'https://cdn.baycloud.com/cl.js?cid=9be233bfe3004dc49e742fd0fa98642c&hN=docs.bigbluebutton.org'
    ],
    
    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    routeBasePath: "/",
                    sidebarPath: require.resolve('./sidebars.js'),
                    lastVersion: '2.7',
                    includeCurrentVersion: false,
                    versions: {
                        '2.5-legacy': {
                            banner: 'none'
                        },
                        '2.6': {
                            banner: 'none'
                        },
                        '3.0': {
                            banner: 'none'
                        },
                        '2.7': {
                            banner: 'none'
                        },
                    }
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    plugins: [
        [
            "@docusaurus/plugin-client-redirects",
            {
                fromExtensions: ['html', 'htm'],
                redirects: [
                    {
                        to: "/2.6/new-features/",
                        from: "/2.6/new/"
                    },
                    {
                        to: "/2.6/new-features/",
                        from: "/2.6/new.html"
                    },
                    {
                        to: "/new-features/",
                        from: "/2.7/new-features/"
                    },                    {
                        to: "/3.0/new-features/",
                        from: "/3.0/new/"
                    },
                    {
                        to: "/development/api/",
                        from: "/dev/api.html"
                    },
                    {
                        to: "/greenlight/v3/migration/",
                        from: "/greenlight_v3/gl3-migration.html"
                    }
                ],
                // We interpret the path argument as the path "to"
                // and the return of this function as the paths "from"
                createRedirects: (path) =>  {
                    // TODO: remove default route to /
                    const redirect_list = [];

                    // Create redirect paths for all routes except 2.5 or 2.6 ones
                    if ( !(path.startsWith("/2.5") || path.startsWith("/2.6"))){
                        redirect_list.push("/2.7" + path);
                    }

                    if ( path.includes("/testing/release-testing") ){
                        redirect_list.push( path.replace("/testing/release-testing", "/release-tests.html") )
                    }
                    // Handle the old docs group /admin
                    if ( path.startsWith("/administration") ) {
                        // creates new routes /admin/something pointing to /administration
                        redirect_list.push( path.replace("/administration", "/admin") );
                    }
                    // handle the old docs group /dev
                    if ( path.startsWith("/development") ) {
                        // creates new routes /dev/something pointing to /development
                        redirect_list.push( path.replace("/development", "/dev") );
                    }
                    // redirect old links to the now modified url (includes -legacy)
                    if ( path.startsWith("/2.5") ) {
                        redirect_list.push( path.replace("/2.5", "/2.5-legacy") );
                    }

                    return redirect_list;
                },
            }
        ],
    ],

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
                    // {to: '/plugins', label: 'Plugins', position: 'left'},
                    {to: '/support/getting-help', label: 'Support', position: 'left'},
                    {
                        type: 'docsVersionDropdown',
                        position: 'right',
                        dropdownActiveClassDisabled: true,
                    },
                    {
                        href: 'https://github.com/bigbluebutton/bigbluebutton/tree/v3.0.x-release/docs',
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
        themes: [
            // ... Your other themes.
            [
              require.resolve("@easyops-cn/docusaurus-search-local"),
              /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
              ({
                // ... Your options.
                // `hashed` is recommended as long-term-cache of index file is possible.
                hashed: true,
                docsRouteBasePath: "/",
                // For Docs using Chinese, The `language` is recommended to set to:
                // ```
                // language: ["en", "zh"],
                // ```
              }),
            ],
          ],
};

module.exports = config;
