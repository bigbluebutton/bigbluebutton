// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

<<<<<<< HEAD
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
=======
const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;
>>>>>>> v2.5.x-release

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'BigBlueButton',
    tagline: 'Official Documentation',
<<<<<<< HEAD
    url: 'https://bigbluebutton.github.io/',
    baseUrl: '/bigbluebutton/',
=======
    url: 'https://docs.bigbluebutton.org/',
    baseUrl: '/',
>>>>>>> v2.5.x-release
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
<<<<<<< HEAD
                    versions: {
                        current: {
                            banner: 'none'
                        }
                    },
=======
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
>>>>>>> v2.5.x-release
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

<<<<<<< HEAD
    plugins: [require.resolve("@cmfcmf/docusaurus-search-local")],
=======
    plugins: [
        require.resolve("@cmfcmf/docusaurus-search-local"),
        [
            "@docusaurus/plugin-client-redirects",
            {
                fromExtensions: ['html', 'htm'],
                redirects: [
                    {
                        to: "/2.6/new-features",
                        from: "/2.6/new"
                    },
                    {
                        to: "/2.6/new-features",
                        from: "/2.6/new.html"
                    },
                    {
                        to: "/new-features",
                        from: "/2.7/new-features"
                    },
                    {
                        to: "/development/api",
                        from: "/dev/api.html"
                    },
                    {
                        to: "/greenlight/v3/migration",
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
>>>>>>> v2.5.x-release

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
<<<<<<< HEAD
                    {to: '/teaching', label: 'Teaching', position: 'left'},
                    {to: '/development/guide', label: 'Development', position: 'left'},
                    {to: '/administration/install', label: 'Administration', position: 'left'},
                    {to: '/greenlight/v3/install', label: 'Greenlight', position: 'left'},
                    {to: '/new-features', label: 'New Features', position: 'left'},
=======
                    {to: 'https://bigbluebutton.org/teachers/tutorials/', label: 'Teaching', position: 'left'},
                    {
                        type: 'doc',
                        position: 'left',
                        docId: 'development/guide',
                        label: 'Development',
                    },
                    {
                        type: 'doc',
                        position: 'left',
                        docId: 'administration/install',
                        label: 'Administration',
                    },
                    {
                        type: 'doc',
                        position: 'left',
                        docId: 'greenlight/v3/install',
                        label: 'Greenlight',
                    },
                    {
                        type: 'doc',
                        position: 'left',
                        docId: 'new-features',
                        label: 'New Features',
                    },
>>>>>>> v2.5.x-release
                    {
                        type: 'docsVersionDropdown',
                        position: 'right',
                        dropdownActiveClassDisabled: true,
                    },
                    {
<<<<<<< HEAD
                        href: 'https://github.com/bigbluebutton/bigbluebutton/tree/v2.5.x-release/docs',
=======
                        href: 'https://github.com/bigbluebutton/bigbluebutton/tree/v2.7.x-release/docs',
>>>>>>> v2.5.x-release
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
