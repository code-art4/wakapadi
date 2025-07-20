import Head from 'next/head';
import Layout from '../components/Layout';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../styles/about.module.css';
import Image from 'next/image';

export default function AboutPage() {
  // const { t } = useTranslation('common');

  return (
    // <Layout title='About | Wakapadi'>
    <>
      <Head>
        <meta
          name='description'
          content="Learn about Wakapadi's mission to connect travelers worldwide"
        />
      </Head>

      <Layout title='About us'>
        <div className={styles.container}>
          <section className={styles.section}>
            <div className={styles.textBlock}>
              <h5 className={styles.smallHeading}>WHO WE ARE</h5>
              <h2 className={styles.heading}>Our story</h2>
              <p className={styles.paragraph}>
                Wakapadi was born from a shared passion for authentic travel
                experiences. Founded in 2023 by a team of globetrotters, we
                noticed how technology was isolating travelers rather than
                connecting them.
              </p>
            </div>
            <div className={styles.imageBlock}>
              <Image
                src='/about-1.png'
                alt='Backpackers'
                className={styles.image}
                width='2000'
                objectFit='cover'
                objectPosition='center'
                height='400'
              />
            </div>
          </section>

          <section className={`${styles.section} ${styles.reverse}`}>
            <div className={styles.imageBlock}>
              <Image
                src='/about-2.png'
                alt='Travelers in city'
                className={styles.image}
                objectFit='cover'
                objectPosition='center'
                width='2000'
                height='100'
              />
            </div>
            <div className={styles.textBlock}>
              <h5 className={styles.smallHeading}>WHAT WE WANT TO DO</h5>
              <h2 className={styles.heading}>The Vision</h2>
              <p className={styles.paragraph}>
                We believe travel should be about human connections, not just
                checklists. Our platform bridges the gap between travelers and
                local communities, creating meaningful interactions that enrich
                both sides.
              </p>
              <ul className={styles.bullets}>
                <li>Democratizing travel through free walking tours</li>
                <li>Building trust through verified profiles</li>
                <li>Promoting sustainable tourism practices</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.textBlock}>
              <h5 className={styles.smallHeading}>CONNECT WITH US</h5>
              <h2 className={styles.heading}>Join Our Journey</h2>
              <p className={styles.paragraph}>
                Whether you&apos;re a traveler seeking authentic experiences or
                a local wanting to share your city&apos;s hidden gems, we&apos;d
                love to have you onboard. Connect with us at{' '}
                <a href='mailto:hello@wakapadi.com'>hello@wakapadi.com</a>.
              </p>
            </div>
            <div className={styles.imageBlock}>
              <Image
                src='/about-3.png'
                alt='Travelers in city'
                className={styles.image}
                objectFit='cover'
                objectPosition='center'
                width='2000'
                height='100'
              />
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
