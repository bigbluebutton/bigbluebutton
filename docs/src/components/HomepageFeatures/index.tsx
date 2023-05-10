import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import Link from "@docusaurus/Link";

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<'svg'>>;
    description: JSX.Element;
    actionText: string;
    docId: string;
};

const FeatureList: FeatureItem[] = [
    {
        title: 'Teacher & Student',
        Svg: require('@site/static/img/icon_teach.svg').default,
        description: (
            <>
                New to BigBlueButton?
                The complete user-guide with all the available features.
            </>
        ),
        actionText: "Teaching Experience",
        docId: "https://bigbluebutton.org/teachers/tutorials/"
    },
    {
        title: 'I am a developer',
        Svg: require('@site/static/img/icon_developer.svg').default,
        description: (
            <>
                Learn everything about extending BigBlueButton
                and creating new integrations using the API.
            </>
        ),
        actionText: "Show me how",
        docId: "/development/guide"
    },
    {
        title: 'I am an administrator',
        Svg: require('@site/static/img/icon_administrator.svg').default,
        description: (
            <>
                Technical specifications, step-by-step guide and all you need to
                get BigBlueButton up an running.
            </>
        ),
        actionText: "Server management",
        docId: "/administration/install"
    },
    {
        title: 'Greenlight',
        Svg: require('@site/static/img/icon_greenlight.svg').default,
        description: (
            <>
                Full guide for installing and using Greenlight,
                the simple room manager tailored for BigBlueButton.
            </>
        ),
        actionText: "Greenlight guide",
        docId: "/greenlight/v3/install"
    },
    {
        title: 'What\'s new?',
        Svg: require('@site/static/img/icon_new.svg').default,
        description: (
            <>
                Discover the new features of BigBlueButton in version 2.6.
            </>
        ),
        actionText: "Discover",
        docId: "/new-features"
    },
    {
        title: 'Testing Guide',
        Svg: require('@site/static/img/icon_testing.svg').default,
        description: (
            <>
                Interested into manual and automated testing BigBlueButton. Discover how.
            </>
        ),
        actionText: "Testing the product",
        docId: "/testing/release-testing"
    },
];

function Feature({title, Svg, description, actionText, docId}: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img"/>
            </div>
            <div className="text--center padding-horiz--md">
                <h3>{title}</h3>
                <p className="home--feature--description" style={{height: '100px'}}>{description}</p>
                <Link
                    className="button button--doc-section button--lg" to={docId}>
                    {actionText}
                </Link>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
