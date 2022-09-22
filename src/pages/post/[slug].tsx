import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { BiUser } from 'react-icons/bi';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { getPrismicClient } from '../../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const formatDate = (date:string)=>{
    return format(
      new Date(date),
      "dd MMM yyyy",
      {
        locale: ptBR
      }
    )
  }

  const { isFallback } = useRouter();
  const contentWordsBody = post.data.content
    .map(content => RichText.asText(content.body).split(' '))
    .reduce(
      (previousValue, currentValue) => [...currentValue, ...previousValue],
      []
    )
    .filter(i => i !== ' ');

  const contentWordsHeading = post.data.content
    .map(content => content.heading.split(' '))
    .reduce(
      (previousValue, currentValue) => [...currentValue, ...previousValue],
      []
    )
    .filter(i => i !== ' ');

  const timeReading = Math.ceil(
    (contentWordsHeading.length + contentWordsBody.length) / 200
  );

  return (
    <>
      {isFallback ? (
        <>
          <Head>
            <title> Post | SpaceTraveling </title>
          </Head>
          <h3>Carregando...</h3>
        </>
      ) : (
        <>
          <Head>
            <title> Post | SpaceTraveling </title>
          </Head>

          <main className={styles.mainPost}>
            <img src={post.data.banner.url} alt="banner" />

            <article className={commonStyles.container}>
              <section className={styles.postHeader}>
                <h2>{post.data.title}</h2>
                <time>
                  <IoCalendarClearOutline />
                  {formatDate(post.first_publication_date)}
                </time>
                <label>
                  <BiUser />
                  {post.data.author}
                </label>
                <label>
                  <AiOutlineClockCircle />
                  {timeReading} min
                </label>
              </section>
              <section className={styles.postContent}>
                {post.data.content.map(content => (
                  <div key={content.heading}>
                    <h3>{content.heading}</h3>
                    {content.body.map(body => (
                      <p key={body.text}>{body.text}</p>
                    ))}
                  </div>
                ))}
              </section>
            </article>
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  const slug = posts.results.map(result => ({ params: { slug: result.uid } }));
  return {
    paths: slug,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', slug);
  return {
    props: {
      post: response,
    },
  };

  // TODO
};
