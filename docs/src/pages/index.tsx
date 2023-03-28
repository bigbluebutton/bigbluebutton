import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <header className={clsx(styles['header-content'], 'container')}>
            <div className={styles['header-content-inner']}>
                <div className={clsx(styles['header-title'])}>
                    <h1>
                        BigBlueButton
                        <br/>
                        <em>Resource centre</em>
                    </h1>
                </div>
                <div className={styles['header-right']}>
                    <div className={styles.copy}>
                        <p>
                            BigBlueButton's mission is to build the most efficient <strong>virtual classroom</strong>.
                        </p>
                        <Link
                            className="button button--install button--lg"
                            to="https://support.bigbluebutton.org/">
                            Quick Start Guide
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default function Home(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title} - Resource Center`}
            description="Description will go into a meta tag in <head />">
            <HomepageHeader/>
            <main>
                <HomepageFeatures/>
            </main>
        </Layout>
    );
}
